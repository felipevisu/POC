#!/bin/sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
notification="$here/../notification"
PHASE=${PHASE:-10}

case "${1:-}" in
  notification-down) victim=notification ;;
  queue-down) victim=rabbitmq ;;
  *) echo "usage: $0 notification-down|queue-down" >&2; exit 1 ;;
esac

queue_depth() {
  docker compose --project-directory "$here" exec -T rabbitmq rabbitmqctl -q list_queues name messages 2>/dev/null \
    | awk '$1 == "welcome-emails" { print $2 }'
}

trap 'docker compose --project-directory "$here" start rabbitmq notification >/dev/null 2>&1' EXIT

echo ">>> clearing version2 users, version2 notification rows and the queue"
docker compose --project-directory "$here" exec -T rabbitmq rabbitmqctl -q purge_queue welcome-emails >/dev/null 2>&1 || true
docker compose --project-directory "$here" exec -T postgres psql -U postgres -d users -qc "TRUNCATE users RESTART IDENTITY"
docker compose --project-directory "$here" exec -T notification-db psql -U postgres -d notifications -q \
  -c "DELETE FROM emails_sent WHERE source = 'version2'" -c "DELETE FROM notification_requests WHERE source = 'version2'"

DURATION="$((PHASE * 3))s" k6 run --quiet "$here/load-test.js" &
k6_pid=$!

sleep "$PHASE"
echo ">>> killing $victim"
docker compose --project-directory "$here" kill "$victim" >/dev/null 2>&1
sleep "$PHASE"
if [ "$victim" = notification ]; then
  echo ">>> messages held in the queue while the service was down: $(queue_depth)"
fi
echo ">>> starting $victim"
docker compose --project-directory "$here" start "$victim" >/dev/null 2>&1

wait "$k6_pid" || true

echo
printf '>>> waiting for the queue to drain'
tries=0
while [ "$(queue_depth)" != "0" ]; do
  tries=$((tries + 1))
  if [ "$tries" -gt 90 ]; then echo " gave up, $(queue_depth) messages left"; break; fi
  printf '.'
  sleep 1
done
echo
echo
"$notification/compare.sh" "$here"
