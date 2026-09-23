import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { reply, resetCart, CHAT_MODEL, ROUTER_MODEL } from './agent.js';

const page = readFileSync(new URL('./chat.html', import.meta.url), 'utf8')
  .replace('{{CHAT_MODEL}}', CHAT_MODEL)
  .replace('{{ROUTER_MODEL}}', ROUTER_MODEL);
const PORT = process.env.PORT ?? 4747;

const readJson = async (req) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  return JSON.parse(body || '{}');
};

// ponytail: conversation lives in the browser, cart is one global stub — single tester only.
createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page);
    } else if (req.method === 'POST' && req.url === '/chat') {
      const { messages } = await readJson(req);
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(await reply(messages)));
    } else if (req.method === 'POST' && req.url === '/reset') {
      resetCart();
      res.writeHead(204).end();
    } else {
      res.writeHead(404).end();
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'application/json' }).end(JSON.stringify({ error: err.message }));
  }
}).listen(PORT, '127.0.0.1', () => console.log(`chat em http://localhost:${PORT}`));
