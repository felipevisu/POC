#!/bin/sh
# Compares registered users (version's database) against welcome emails sent (notification's database).
# Only counts requests tagged with the version folder's name as source (version1, version2, ...).
# usage: ./compare.sh [version-folder]   (default: ../version1)
set -eu
here=$(cd "$(dirname "$0")" && pwd)
version=$(cd "${1:-$here/../version1}" && pwd)
source=$(basename "$version")

users_q() { docker compose --project-directory "$version" exec -T postgres psql -U postgres -d users -At -c "$1"; }
# query goes through stdin because psql does not interpolate :'src' with -c
notif_q() { echo "$1" | docker compose --project-directory "$here" exec -T postgres psql -U postgres -d notifications -At -v src="$source"; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
users_q "SELECT id FROM users" | sort > "$tmp/users"
notif_q "SELECT DISTINCT user_id FROM notification_requests WHERE source = :'src'" | sort > "$tmp/requested"
notif_q "SELECT DISTINCT user_id FROM emails_sent WHERE source = :'src'" | sort > "$tmp/emailed"

echo "source: $source"
echo "users registered:     $(wc -l < "$tmp/users" | tr -d ' ')"
echo "users with a request: $(wc -l < "$tmp/requested" | tr -d ' ')"
echo "users with an email:  $(wc -l < "$tmp/emailed" | tr -d ' ')"
echo
# prints "label (count): ids"
report() { ids=$(cat); echo "$1 ($(echo "$ids" | grep -c . || true)): $(echo "$ids" | paste -sd' ' -)"; }
comm -23 "$tmp/users" "$tmp/requested" | sort -n | report "never requested, call never reached the service"
comm -23 "$tmp/requested" "$tmp/emailed" | sort -n | report "requested but never emailed, service failed"
notif_q "SELECT user_id || 'x' || count(*) FROM emails_sent WHERE source = :'src' GROUP BY user_id HAVING count(*) > 1 ORDER BY user_id" | report "emailed more than once (user_id x count)"
comm -13 "$tmp/users" "$tmp/emailed" | sort -n | report "emailed but not registered"
