import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "../frontend/dist");

const app = express();

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;

  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      `style-src 'self' 'nonce-${nonce}'`,
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  next();
});

app.use(express.static(DIST, { index: false }));

app.get("/{*splat}", (req, res) => {
  const htmlPath = path.join(DIST, "index.html");

  if (!fs.existsSync(htmlPath)) {
    return res.status(500).send(
      "Frontend not built yet. Run: cd frontend && npm run build",
    );
  }

  const nonce = res.locals.nonce;
  let html = fs.readFileSync(htmlPath, "utf-8");

  html = html.replace(/<script /g, `<script nonce="${nonce}" `);
  html = html.replace(/<link rel="stylesheet"/g, `<link rel="stylesheet" nonce="${nonce}"`);

  const allowedScript = `<script nonce="${nonce}">window.__WITH_NONCE = true;</script>`;
  const blockedScript = `<script>window.__WITHOUT_NONCE = true;</script>`;

  html = html.replace("</head>", `${allowedScript}\n${blockedScript}\n</head>`);

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CSP demo server running at http://localhost:${PORT}`);
});
