import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { reply, reset, state, CHAT_MODEL, ROUTER_MODEL, USE_JEV, USE_CACHE } from './agent.js';

const page = readFileSync(new URL('../public/chat.html', import.meta.url), 'utf8')
  .replace('{{CHAT_MODEL}}', CHAT_MODEL)
  .replace('{{ROUTER_MODEL}}', ROUTER_MODEL)
  .replace('{{USE_JEV}}', USE_JEV ? 'checked' : '')
  .replace('{{USE_CACHE}}', USE_CACHE ? 'checked' : '');
const PORT = process.env.PORT ?? 4748;
const resultsPage = new URL('../public/results.html', import.meta.url);
const runsDir = new URL('../eval/runs/', import.meta.url);
const listRuns = () => (existsSync(runsDir) ? readdirSync(runsDir).filter((f) => f.endsWith('.json')).sort().reverse() : []);

const readJson = async (req) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  return JSON.parse(body || '{}');
};
const json = (res, status, data) => res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(data));

createServer(async (req, res) => {
  try {
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page);
    } else if (req.method === 'GET' && pathname === '/results') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(readFileSync(resultsPage));
    } else if (req.method === 'GET' && pathname === '/runs') {
      json(res, 200, listRuns());
    } else if (req.method === 'GET' && pathname === '/results.json') {
      const runs = listRuns();
      const run = searchParams.get('run') ?? runs[0];
      if (!runs.includes(run)) return json(res, 404, { error: runs.length ? `Unknown run ${run}` : 'No eval results yet — run `npm run eval` first.' });
      res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(new URL(run, runsDir)));
    } else if (req.method === 'POST' && pathname === '/chat') {
      const { messages, useJev, cache } = await readJson(req);
      json(res, 200, await reply(messages, { useJev: useJev ?? USE_JEV, cache: cache ?? USE_CACHE }));
    } else if (req.method === 'POST' && pathname === '/reset') {
      reset();
      json(res, 200, state());
    } else {
      res.writeHead(404).end();
    }
  } catch (err) {
    console.error(err);
    json(res, 500, { error: err.message });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`loan chat at http://localhost:${PORT} · eval replay at http://localhost:${PORT}/results (jev ${USE_JEV ? 'on' : 'off'} by default)`));
