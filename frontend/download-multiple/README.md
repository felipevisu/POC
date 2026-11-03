# Download multiple files as ZIP

`frontend` (React, :5173) → `bff` (Express, :3001) → `backend` (single-file endpoint, :4000)

```sh
./run.sh                 # starts all three; Ctrl+C stops them
DELAY_MS=10000 ./run.sh  # slower simulated file generation (default 3000)
cd bff && npm test       # integration + security tests
```

## Flow

1. `POST /api/downloads` `{"ids":["1","2"]}` → `201 {downloadId, url, progressUrl}`
   Validation, auth and rate errors come back here as JSON, so the UI can show them.
2. `GET /api/downloads/:id/progress`: Server-Sent Events with `{status, total, done, failed, files}`.
3. `GET /api/downloads/:id`: the browser's download manager streams the ZIP to disk (via `<a download>`).

Files are fetched from the backend in parallel (bounded) and streamed straight into the ZIP, so memory stays flat
at any size. Files that fail are listed in `_errors.txt`. If the ZIP itself breaks mid-stream, the connection is
dropped so the user gets a failed download, never a silently truncated file.

## Security

| Threat | Defense |
|---|---|
| CSRF | JSON-only writes (forms can't send them), `Origin` allowlist, `Sec-Fetch-Site` check, `SameSite=Lax` HttpOnly cookie |
| Guessing / stealing a download | 256-bit random ticket, bound to the session, single use, expires in 60s |
| Probing other users' downloads | someone else's ticket returns the same 404 as a missing one |
| Confused deputy | `backendAuth(user)` forwards the user's identity; the backend authorizes every file |
| Zip-slip / hostile file names | base name only, no control chars, no leading dots, max 200 chars, deduplicated |
| Resource abuse | max files per request, max active downloads per user, max ZIP size, backend timeout, cancel propagates |
| Information leaks | generic error messages, details only in server logs, `no-store` / `nosniff`, no `x-powered-by` |

## Before production

- Replace `devSession` in `bff/session.js` with your real auth (it must set `req.user.id`, plus `req.user.token`
  for the backend).
- Set `ALLOWED_ORIGINS`, `NODE_ENV=production` (Secure cookie), and `trust proxy` for your load balancer.
- Tickets and progress are in memory: with more than one BFF instance, move them to Redis (see `shortcut:` in `app.js`).
- Limits are env vars: `MAX_FILES`, `MAX_ACTIVE_PER_USER`, `TICKET_TTL_MS`, `MAX_ZIP_BYTES`,
  `BACKEND_CONCURRENCY`, `BACKEND_HEADERS_TIMEOUT_MS`.
