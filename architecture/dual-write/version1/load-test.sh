#!/bin/sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
notification="$here/../notification"
PHASE=${PHASE:-10}

trap 'docker compose --project-directory "$here" start notification >/dev/null 2>&1' EXIT

echo ">>> clearing version1 users and version1 notification rows"
docker compose --project-directory "$here" exec -T postgres psql -U postgres -d users -qc "TRUNCATE users RESTART IDENTITY"
docker compose --project-directory "$here" exec -T notification-db psql -U postgres -d notifications -q \
  -c "DELETE FROM emails_sent WHERE source = 'version1'" -c "DELETE FROM notification_requests WHERE source = 'version1'"

DURATION="$((PHASE * 3))s" k6 run --quiet "$here/load-test.js" &
k6_pid=$!

sleep "$PHASE"
echo ">>> killing notification service"
docker compose --project-directory "$here" kill notification >/dev/null 2>&1
sleep "$PHASE"
echo ">>> starting notification service"
docker compose --project-directory "$here" start notification >/dev/null 2>&1

wait "$k6_pid" || true
echo
"$notification/compare.sh" "$here"
