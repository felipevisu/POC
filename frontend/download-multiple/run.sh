#!/usr/bin/env bash
# Starts backend (:4000), bff (:3001) and frontend (:5173). Ctrl+C stops all three.
set -e
cd "$(dirname "$0")"
for d in bff frontend; do [ -d "$d/node_modules" ] || (cd "$d" && npm i); done

# fail fast instead of silently talking to an old server left on the same port
for port in 4000 3001 5173; do
  if lsof -i :$port -sTCP:LISTEN >/dev/null; then echo "port $port is in use, stop it first: lsof -ti :$port | xargs kill"; exit 1; fi
done

trap 'kill 0' EXIT
node backend/server.js &
(cd bff && npm start --silent) &
(cd frontend && npm run dev --silent) &
wait
