const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
 
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

const scripts = html.matchAll(/<script>([\s\S]*?)<\/script>/g)
const hashes = []
scripts.forEach((script) => {
  const hash = crypto.createHash('sha256').update(script[1], 'utf8').digest('base64');
  hashes.push(`'sha256-${hash}'`)
}) 

const csp = `script-src ${hashes.join(' ')}`
 
http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': csp
  });
  res.end(html);
}).listen(3000, () => console.log('http://localhost:3000  — CSP:', csp));