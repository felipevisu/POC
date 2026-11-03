// Mock of the existing backend: one endpoint, one file per call.
import http from 'node:http';

const PORT = process.env.PORT || 4000;
// simulated file generation time: random between DELAY_MS/2 and DELAY_MS per file
const DELAY_MS = Number(process.env.DELAY_MS ?? 3000);
const FILES = {
  '1': ['report.txt', 'Quarterly report\n'.repeat(1000)],
  '2': ['invoice.csv', 'id,amount\n' + Array.from({ length: 5000 }, (_, i) => `${i},${i * 3}`).join('\n')],
  '3': ['notes.md', '# Notes\n\nHello from file 3\n'],
  '4': ['big.bin', 'x'.repeat(20 * 1024 * 1024)],
  '5': ['report.txt', 'Same name as file 1, different content\n'],
};

http.createServer((req, res) => {
  const m = req.url.match(/^\/files\/([\w-]+)$/);
  const file = m && FILES[m[1]];
  setTimeout(() => {
    if (!file) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, {
      'content-type': 'application/octet-stream',
      'content-disposition': `attachment; filename="${file[0]}"`,
    });
    res.end(file[1]);
  }, DELAY_MS / 2 + Math.random() * DELAY_MS / 2);
}).listen(PORT, () => console.log(`backend on :${PORT}`));
