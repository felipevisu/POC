import archiver from 'archiver';
import { Readable } from 'node:stream';

export class ZipSizeLimitError extends Error {}
export class NoFilesError extends Error {}

/**
 * Streams a ZIP of the given backend files into `res`.
 * Files are fetched in parallel (bounded) and streamed straight through: nothing is buffered whole.
 * onFile(id, 'generating' | 'ready' | 'failed') reports each file; onError(err) fires if the zip breaks mid-stream.
 */
export function streamZip({ ids, res, signal, backendUrl, headers, maxBytes, concurrency, headersTimeoutMs, onFile, onError }) {
  const budget = { bytes: 0, max: maxBytes };
  const fetches = withLimit(concurrency, ids, budget, async (id) => {
    onFile(id, 'generating');
    const r = await fetchFile(`${backendUrl}/files/${encodeURIComponent(id)}`, headers, signal, headersTimeoutMs);
    onFile(id, r.error ? 'failed' : 'ready');
    return r;
  });

  res.set('x-accel-buffering', 'no'); // nginx-style proxies: stream, don't buffer
  res.attachment(`files-${new Date().toISOString().slice(0, 10)}.zip`);
  // shortcut: store = no compression; fastest for pdf/images. Use { zlib: { level: 1 } } if files are mostly text.
  const zip = archiver('zip', { store: true });
  let failed = false;
  const fail = (err) => {
    if (failed) return;
    failed = true;
    onError(err);
    // destroy instead of finishing: the user gets a failed download, never a silently truncated zip
    res.destroy(err);
  };
  zip.on('error', fail);
  zip.on('warning', fail);
  zip.pipe(res);
  // headers go out now, so the browser shows the download immediately
  res.flushHeaders();

  (async () => {
    const usedNames = new Set();
    const errors = [];
    let added = 0;
    // appended in order; later files are already being fetched while earlier ones stream into the zip
    for (const [i, p] of fetches.entries()) {
      const r = await p;
      if (signal.aborted || failed) return;
      if (r.error) { errors.push(`${ids[i]}: ${r.error}`); continue; }
      const body = Readable.fromWeb(r.body);
      body.on('error', fail);
      zip.append(body, { name: uniqueName(r.name, usedNames) });
      added++;
    }
    // a zip holding only _errors.txt would look like a successful download: fail it instead
    if (!added) throw new NoFilesError('none of the files could be fetched');
    if (errors.length) zip.append(`These files could not be downloaded:\n${errors.join('\n')}\n`, { name: '_errors.txt' });
    await zip.finalize();
  })().catch(fail);
}

async function fetchFile(url, headers, signal, headersTimeoutMs) {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  signal.addEventListener('abort', onAbort, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, headersTimeoutMs);
  // the outer abort must reach the body read too, so it is only detached once the body is done
  const cleanup = () => signal.removeEventListener('abort', onAbort);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers, redirect: 'error' });
    if (!res.ok) {
      cleanup();
      await res.body?.cancel();
      // 401/403/404 all read "not available": don't tell the user whether a file they can't see exists
      return { error: res.status >= 500 ? 'temporarily unavailable' : 'not available' };
    }
    if (!res.body) { cleanup(); return { error: 'not available' }; }
    return { body: res.body, name: filenameFrom(res.headers.get('content-disposition')) || 'file', cleanup };
  } catch (err) {
    cleanup();
    if (signal.aborted) return { error: 'cancelled' };
    console.error('[zip] backend fetch failed', { url, reason: timedOut ? 'timeout' : err.message });
    return { error: timedOut ? 'timed out' : 'temporarily unavailable' };
  } finally {
    clearTimeout(timer); // headers arrived (or failed): the body may take as long as it needs
  }
}

// Runs fn over items with at most `limit` in flight. A slot is held until the file body is fully
// read (not just headers), so open sockets stay bounded. Also enforces the total byte budget.
function withLimit(limit, items, budget, fn) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= limit || !queue.length) return;
    active++;
    const { item, resolve } = queue.shift();
    let released = false;
    let cleanup;
    const release = () => { if (!released) { released = true; cleanup?.(); active--; next(); } };
    fn(item).then((r) => {
      cleanup = r.cleanup;
      if (!r.body) { release(); return resolve(r); }
      const { readable, writable } = new TransformStream({
        transform(chunk, ctrl) {
          budget.bytes += chunk.byteLength;
          if (budget.bytes > budget.max) ctrl.error(new ZipSizeLimitError(`zip larger than ${budget.max} bytes`));
          else ctrl.enqueue(chunk);
        },
      });
      r.body.pipeTo(writable).then(release, release);
      resolve({ ...r, body: readable });
    }, (err) => { release(); resolve({ error: 'temporarily unavailable' }); console.error('[zip] unexpected', err); });
  };
  return items.map((item) => new Promise((resolve) => { queue.push({ item, resolve }); next(); }));
}

export function filenameFrom(header) {
  const m = header?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  if (!m) return null;
  let raw = m[2];
  if (m[1]) {
    try { raw = decodeURIComponent(m[1]); } catch { return null; } // malformed encoding from upstream
  }
  const name = raw
    .split(/[\\/]/).pop()            // zip-slip: base name only, never a path
    .replace(/[\u0000-\u001f\u007f]/g, '') // control characters
    .replace(/^\.+/, '')             // no hidden files / "..", no leading dots
    .trim()
    .slice(0, 200);
  return name || null;
}

export function uniqueName(name, used) {
  let candidate = name;
  for (let n = 1; used.has(candidate); n++) candidate = name.replace(/(\.[^.]*)?$/, ` (${n})$1`);
  used.add(candidate);
  return candidate;
}
