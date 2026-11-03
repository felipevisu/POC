import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.BACKEND_URL = 'http://localhost:4100';
process.env.MAX_ZIP_BYTES = String(5 * 1024 * 1024); // file 4 is 20 MB -> exceeds it
const { app } = await import('../app.js');
let backend, server, base;

before(async () => {
  backend = spawn('node', ['../backend/server.js'], { env: { ...process.env, PORT: '4100', DELAY_MS: '600' } });
  await new Promise((r) => backend.stdout.once('data', r));
  server = app.listen(0);
  base = `http://localhost:${server.address().port}`;
});
after(() => { server.closeAllConnections(); server.close(); backend.kill(); });

// a browser-like user: keeps its session cookie
function user() {
  let cookie = '';
  return async (path, init = {}) => {
    const res = await fetch(base + path, { ...init, headers: { ...init.headers, cookie } });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return res;
  };
}
const json = (body) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

async function readProgress(req, progressUrl, until) {
  const res = await req(progressUrl);
  const events = [];
  let buf = '';
  const decoder = new TextDecoder();
  for await (const chunk of res.body) {
    buf += decoder.decode(chunk, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop();
    for (const p of parts) for (const line of p.split('\n')) if (line.startsWith('data: ')) events.push(JSON.parse(line.slice(6)));
    if (until(events.at(-1))) break;
  }
  return events;
}

test('full flow: ticket -> zip + progress; names deduped, failures listed', async () => {
  const req = user();
  const created = await req('/api/downloads', json({ ids: ['1', '3', '5', 'nope'] }));
  assert.equal(created.status, 201);
  const { url, progressUrl } = await created.json();

  const progress = readProgress(req, progressUrl, (e) => e && !['pending', 'running'].includes(e.status));
  const res = await req(url);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-disposition'), /attachment; filename="?files-.*\.zip/);
  assert.equal(res.headers.get('cache-control'), 'no-store');

  const file = join(mkdtempSync(join(tmpdir(), 'zip-')), 'out.zip');
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  assert.deepEqual(execFileSync('unzip', ['-Z1', file]).toString().trim().split('\n'),
    ['report.txt', 'notes.md', 'report (1).txt', '_errors.txt']);
  assert.match(execFileSync('unzip', ['-p', file, '_errors.txt']).toString(), /nope: not available/);
  execFileSync('unzip', ['-tq', file]); // CRC of every entry

  const events = await progress;
  assert.deepEqual(events.at(-1), {
    status: 'done', total: 4, done: 3, failed: 1, files: { 1: 'ready', 3: 'ready', 5: 'ready', nope: 'failed' },
  });
  assert.ok(events.some((e) => e.files['1'] === 'generating'), 'saw a file while generating');
});

test('ticket is single use', async () => {
  const req = user();
  const { url } = await (await req('/api/downloads', json({ ids: ['3'] }))).json();
  await (await req(url)).arrayBuffer();
  assert.equal((await req(url)).status, 404);
});

test("another session can't use or watch my ticket", async () => {
  const me = user(), attacker = user();
  const { url, progressUrl } = await (await me('/api/downloads', json({ ids: ['3'] }))).json();
  await attacker('/api/downloads', json({ ids: ['3'] })); // attacker has its own valid session
  assert.equal((await attacker(url)).status, 404);
  assert.equal((await attacker(progressUrl)).status, 404);
  assert.equal((await fetch(base + url)).status, 404); // no session at all
  const mine = await me(url);
  assert.equal(mine.status, 200, 'still usable by its owner');
  await mine.arrayBuffer();
});

test('rejects CSRF shapes: form posts, foreign origins, cross-site fetches', async () => {
  const req = user();
  const form = await req('/api/downloads', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'ids=1' });
  assert.equal(form.status, 415);
  const foreign = await req('/api/downloads', { ...json({ ids: ['1'] }), headers: { 'content-type': 'application/json', origin: 'https://evil.example' } });
  assert.equal(foreign.status, 403);
  const crossSite = await req('/api/downloads', { ...json({ ids: ['1'] }), headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' } });
  assert.equal(crossSite.status, 403);
});

test('validates input without leaking internals', async () => {
  const req = user();
  for (const ids of [[], ['../etc/passwd'], [1], 'abc', Array.from({ length: 101 }, (_, i) => `${i}`)]) {
    const res = await req('/api/downloads', json({ ids }));
    assert.equal(res.status, 400, JSON.stringify(ids));
  }
  const bad = await req('/api/downloads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{nope' });
  assert.equal(bad.status, 400);
  assert.deepEqual(await bad.json(), { error: 'Invalid request.' });
  assert.equal((await req('/api/downloads/not-a-ticket')).status, 404);
});

test('limits concurrent downloads per user', async () => {
  const req = user();
  for (let i = 0; i < 3; i++) assert.equal((await req('/api/downloads', json({ ids: ['1'] }))).status, 201);
  assert.equal((await req('/api/downloads', json({ ids: ['1'] }))).status, 429);
  assert.equal((await user()('/api/downloads', json({ ids: ['1'] }))).status, 201, 'other users unaffected');
});

test('size limit fails the download loudly instead of a truncated zip', async () => {
  const req = user();
  const { url, progressUrl } = await (await req('/api/downloads', json({ ids: ['4'] }))).json();
  const progress = readProgress(req, progressUrl, (e) => e && !['pending', 'running'].includes(e.status));
  const res = await req(url);
  await assert.rejects(res.arrayBuffer(), 'body must error, not end cleanly');
  const last = (await progress).at(-1);
  assert.equal(last.status, 'error');
  assert.match(last.error, /too large/);
});

test('user cancelling stops the download and is reported as cancelled', async () => {
  const req = user();
  const { url, progressUrl } = await (await req('/api/downloads', json({ ids: ['1', '2', '3'] }))).json();
  const progress = readProgress(req, progressUrl, (e) => e && !['pending', 'running'].includes(e.status));
  const ctrl = new AbortController();
  await req(url, { signal: ctrl.signal }); // headers arrive immediately, files still generating
  ctrl.abort();
  const last = (await progress).at(-1);
  assert.equal(last.status, 'cancelled');
  assert.ok(Object.values(last.files).some((s) => s !== 'ready'), 'stopped before every file was fetched');
});

test('hostile upstream file names are neutralized', async () => {
  const { filenameFrom } = await import('../zip.js');
  assert.equal(filenameFrom('attachment; filename="../../etc/passwd"'), 'passwd');
  assert.equal(filenameFrom('attachment; filename="..\\\\..\\\\win.ini"'), 'win.ini');
  assert.equal(filenameFrom('attachment; filename=".."'), null);
  assert.equal(filenameFrom("attachment; filename*=UTF-8''%E0%A4%A"), null); // malformed encoding
  assert.equal(filenameFrom("attachment; filename*=UTF-8''a%0Ab%00c.txt"), 'abc.txt'); // control chars
  assert.equal(filenameFrom(`attachment; filename="${'a'.repeat(500)}"`).length, 200);
  assert.equal(filenameFrom(null), null);
});

test('when every file fails, no zip is delivered and the user is told why', async () => {
  const req = user();
  const { url, progressUrl } = await (await req('/api/downloads', json({ ids: ['nope', 'missing'] }))).json();
  const progress = readProgress(req, progressUrl, (e) => e && !['pending', 'running'].includes(e.status));
  const res = await req(url);
  await assert.rejects(res.arrayBuffer(), 'body must error, not deliver an errors-only zip');
  const last = (await progress).at(-1);
  assert.equal(last.status, 'error');
  assert.match(last.error, /None of the selected files are available/);
  assert.deepEqual(last.files, { nope: 'failed', missing: 'failed' });
});
