#!/bin/sh
# Registers users with k6 while the notification service goes down in the middle of the run,
# then compares registered users against welcome emails sent.
# usage: ./load-test.sh   (PHASE=seconds per phase, RATE=users per second)
set -eu
here=$(cd "$(dirname "$0")" && pwd)
notification="$here/../notification"
PHASE=${PHASE:-10}

# never leave the notification service stopped, even if the run is interrupted
trap 'docker compose --project-directory "$notification" start notification >/dev/null 2>&1' EXIT

DURATION="$((PHASE * 3))s" k6 run --quiet "$here/load-test.js" &
k6_pid=$!

sleep "$PHASE"
echo ">>> killing notification service"
# kill, not stop: stop waits 10s for a graceful shutdown, a crash does not
docker compose --project-directory "$notification" kill notification >/dev/null 2>&1
sleep "$PHASE"
echo ">>> starting notification service"
docker compose --project-directory "$notification" start notification >/dev/null 2>&1

wait "$k6_pid" || true
echo
"$notification/compare.sh" "$here"
