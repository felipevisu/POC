import express from 'express';
import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { devSession, backendAuth } from './session.js';
import { streamZip, ZipSizeLimitError, NoFilesError } from './zip.js';

const num = (name, fallback) => {
  const v = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(v) || v <= 0) throw new Error(`invalid ${name}`);
  return v;
};
export const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()),
  maxFiles: num('MAX_FILES', 100),
  maxActivePerUser: num('MAX_ACTIVE_PER_USER', 3),
  ticketTtlMs: num('TICKET_TTL_MS', 60_000),      // time between "create" and "start download"
  keepFinishedMs: num('KEEP_FINISHED_MS', 60_000), // progress stays readable this long after the end
  maxZipBytes: num('MAX_ZIP_BYTES', 2 * 1024 ** 3),
  concurrency: num('BACKEND_CONCURRENCY', 4),
  headersTimeoutMs: num('BACKEND_HEADERS_TIMEOUT_MS', 15_000),
};

const FILE_ID_RE = /^[\w-]{1,64}$/;
const DOWNLOAD_ID_RE = /^[A-Za-z0-9_-]{43}$/; // 32 random bytes, base64url
const LIVE = new Set(['pending', 'running']);

// downloadId -> { userId, ids, state, events }
// shortcut: in-memory, so one BFF instance only. With several, keep tickets in Redis (GETDEL makes them
// single-use atomically) and publish progress over Redis pub/sub.
const downloads = new Map();

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', false); // set to your proxy hop count in prod so req.ip/secure are right

app.use('/api', (req, res, next) => {
  res.set({ 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' });
  next();
});
app.use('/api', rejectCrossSite);
app.use('/api', devSession);
app.use('/api', express.json({ limit: '10kb', strict: true }));

// 1) Create a download ticket. JSON only: a cross-site <form> can't send it, and a cross-site fetch
//    with this content type needs a CORS preflight that we never grant.
app.post('/api/downloads', (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type must be application/json' });

  const raw = req.body?.ids;
  if (!Array.isArray(raw) || !raw.length || raw.length > config.maxFiles ||
      !raw.every((id) => typeof id === 'string' && FILE_ID_RE.test(id))) {
    return res.status(400).json({ error: `Send 1 to ${config.maxFiles} valid file ids.` });
  }
  const ids = [...new Set(raw)];

  const active = [...downloads.values()].filter((d) => d.userId === req.user.id && LIVE.has(d.state.status)).length;
  if (active >= config.maxActivePerUser) {
    return res.status(429).json({ error: 'Too many downloads in progress. Wait for one to finish.' });
  }

  const downloadId = randomBytes(32).toString('base64url');
  const d = {
    userId: req.user.id,
    ids,
    state: { status: 'pending', total: ids.length, done: 0, failed: 0, files: Object.fromEntries(ids.map((id) => [id, 'queued'])) },
    events: new EventEmitter(),
  };
  downloads.set(downloadId, d);
  // unused tickets die quickly
  setTimeout(() => { if (d.state.status === 'pending') downloads.delete(downloadId); }, config.ticketTtlMs).unref();

  res.status(201).json({
    downloadId,
    url: `/api/downloads/${downloadId}`,
    progressUrl: `/api/downloads/${downloadId}/progress`,
    expiresInMs: config.ticketTtlMs,
  });
});

// 2) The browser's download manager fetches the ZIP. Single use, owner only.
app.get('/api/downloads/:downloadId', (req, res) => {
  const d = findOwned(req);
  if (!d || d.state.status !== 'pending') return notFound(res);
  const { downloadId } = req.params;
  const log = (msg, extra) => console.error(`[download ${downloadId.slice(0, 8)}] ${msg}`, extra ?? '');

  const update = (patch) => {
    Object.assign(d.state, patch);
    d.events.emit('progress', snapshot(d));
  };
  update({ status: 'running' }); // consumed: a second GET with this ticket is a 404

  const abort = new AbortController();
  res.on('finish', () => update({ status: 'done' }));
  res.on('close', () => {
    abort.abort(); // user cancelled or connection dropped: stop every backend request
    if (d.state.status === 'running') { update({ status: 'cancelled' }); log('client went away'); }
    setTimeout(() => downloads.delete(downloadId), config.keepFinishedMs).unref();
  });

  streamZip({
    ids: d.ids,
    res,
    signal: abort.signal,
    backendUrl: config.backendUrl,
    headers: backendAuth(req.user),
    maxBytes: config.maxZipBytes,
    concurrency: config.concurrency,
    headersTimeoutMs: config.headersTimeoutMs,
    onFile: (id, status) => {
      if (!LIVE.has(d.state.status)) return;
      d.state.files[id] = status;
      if (status === 'ready') d.state.done++;
      if (status === 'failed') d.state.failed++;
      d.events.emit('progress', snapshot(d));
    },
    onError: (err) => {
      if (abort.signal.aborted) return; // cancelled by the user, not an error
      const message =
        err instanceof NoFilesError ? 'None of the selected files are available. Nothing was downloaded.'
        : err instanceof ZipSizeLimitError ? 'The selected files are too large for one download. Select fewer files.'
        : 'The download failed. Please try again.';
      update({ status: 'error', error: message });
      log('zip failed', err.message);
    },
  });
});

// 3) Progress as Server-Sent Events. Owner only; replays the current state on (re)connect.
app.get('/api/downloads/:downloadId/progress', (req, res) => {
  const d = findOwned(req);
  if (!d) return notFound(res);
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-store',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  });
  // real bytes, not just headers: proxies (Vite's included) hold headers until the body starts
  res.write('retry: 2000\n: connected\n\n');
  const send = (state) => res.write(`data: ${JSON.stringify(state)}\n\n`);
  send(snapshot(d));
  d.events.on('progress', send);
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000); // keeps idle proxies from closing it
  res.on('close', () => { clearInterval(heartbeat); d.events.off('progress', send); });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Last-resort error handler: log details, never leak them.
app.use((err, req, res, _next) => {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error('[bff] unhandled error', err);
  if (res.headersSent) return res.destroy();
  res.status(status).json({ error: status === 500 ? 'Something went wrong. Please try again.' : 'Invalid request.' });
});

function findOwned(req) {
  const { downloadId } = req.params;
  if (!DOWNLOAD_ID_RE.test(downloadId)) return null;
  const d = downloads.get(downloadId);
  // someone else's ticket looks exactly like a missing one (no existence oracle)
  return d && d.userId === req.user.id ? d : null;
}

function notFound(res) {
  return res.status(404).json({ error: 'This download link is invalid, expired or was already used. Start the download again.' });
}

function snapshot(d) {
  return { ...d.state, files: { ...d.state.files } };
}

// CSRF defense in depth, on top of SameSite cookies and JSON-only writes.
function rejectCrossSite(req, res, next) {
  const site = req.get('sec-fetch-site'); // set by every modern browser, can't be forged by page JS
  const origin = req.get('origin');
  if ((site && site !== 'same-origin' && site !== 'none') || (origin && !config.allowedOrigins.includes(origin))) {
    return res.status(403).json({ error: 'Cross-site request rejected.' });
  }
  next();
}
