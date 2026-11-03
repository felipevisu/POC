import { randomBytes } from 'node:crypto';

// shortcut: stand-in for your real authentication. Replace devSession with your existing
// session middleware; everything else only relies on it setting req.user.id (and optionally req.user.token).
const SID_RE = /(?:^|;\s*)sid=([A-Za-z0-9_-]{43})(?:;|$)/;

export function devSession(req, res, next) {
  const sid = SID_RE.exec(req.headers.cookie ?? '')?.[1];
  if (sid) {
    req.user = { id: sid };
    return next();
  }
  const id = randomBytes(32).toString('base64url');
  res.cookie('sid', id, {
    httpOnly: true,                                // not readable from JS (XSS can't steal it)
    sameSite: 'lax',                               // not sent on cross-site POST/fetch (CSRF)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    path: '/api',
  });
  req.user = { id };
  next();
}

// The backend must authorize every file for THIS user; otherwise the BFF becomes a
// "confused deputy" that fetches anything for anyone. Exchange the session for the user's token here.
export function backendAuth(user) {
  return user.token ? { authorization: `Bearer ${user.token}` } : {};
}
