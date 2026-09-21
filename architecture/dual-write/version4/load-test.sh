#!/bin/sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
notification="$here/../notification"
PHASE=${PHASE:-10}

case "${1:-}" in
  queue-down) victim=rabbitmq ;;
  consumer-down) victim=outbox-consumer ;;
  notification-down) victim=notification ;;
  database-down) victim=postgres ;;
  *) echo "usage: $0 queue-down|consumer-down|notification-down|database-down" >&2; exit 1 ;;
esac

queue_depth() {
  docker compose --project-directory "$here" exec -T rabbitmq rabbitmqctl -q list_queues name messages 2>/dev/null \
    | awk '$1 == "welcome-emails" { print $2 }'
}
outbox_pending() {
  docker compose --project-directory "$here" exec -T postgres psql -U postgres -d users -At \
    -c "SELECT count(*) FROM outbox WHERE published_at IS NULL" 2>/dev/null
}

trap 'docker compose --project-directory "$here" start "$victim" >/dev/null 2>&1' EXIT

echo ">>> clearing version4 users and outbox, version4 notification rows and the queue"
docker compose --project-directory "$here" exec -T rabbitmq rabbitmqctl -q purge_queue welcome-emails >/dev/null 2>&1 || true
docker compose --project-directory "$here" exec -T postgres psql -U postgres -d users -qc "TRUNCATE users, outbox RESTART IDENTITY"
docker compose --project-directory "$here" exec -T notification-db psql -U postgres -d notifications -q \
  -c "DELETE FROM emails_sent WHERE source = 'version4'" -c "DELETE FROM notification_requests WHERE source = 'version4'"

DURATION="$((PHASE * 3))s" k6 run --quiet "$here/load-test.js" &
k6_pid=$!

sleep "$PHASE"
echo ">>> killing $victim"
docker compose --project-directory "$here" kill "$victim" >/dev/null 2>&1
sleep "$PHASE"
if [ "$victim" != postgres ]; then
  echo ">>> waiting while $victim was down: $(outbox_pending) rows in the outbox, $(queue_depth || true) messages in rabbitmq"
fi
echo ">>> starting $victim"
docker compose --project-directory "$here" start "$victim" >/dev/null 2>&1

wait "$k6_pid" || true

echo
printf '>>> waiting for the outbox and the queue to drain'
tries=0
while [ "$(outbox_pending)" != "0" ] || [ "$(queue_depth)" != "0" ]; do
  tries=$((tries + 1))
  if [ "$tries" -gt 90 ]; then echo " gave up: $(outbox_pending) outbox rows, $(queue_depth) queued messages left"; break; fi
  printf '.'
  sleep 1
done
echo
echo
"$notification/compare.sh" "$here"
