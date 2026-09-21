#!/bin/sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
version=$(cd "${1:-$here/../version1}" && pwd)
source=$(basename "$version")

users_q() { docker compose --project-directory "$version" exec -T postgres psql -U postgres -d users -At -c "$1"; }
notif_q() { echo "$1" | docker compose --project-directory "$version" exec -T notification-db psql -U postgres -d notifications -At -v src="$source"; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
users_q "SELECT email FROM users" | sort > "$tmp/users"
notif_q "SELECT DISTINCT email FROM notification_requests WHERE source = :'src'" | sort > "$tmp/requested"
notif_q "SELECT DISTINCT email FROM emails_sent WHERE source = :'src'" | sort > "$tmp/emailed"

echo "source: $source"
echo "users registered:     $(wc -l < "$tmp/users" | tr -d ' ')"
echo "users with a request: $(wc -l < "$tmp/requested" | tr -d ' ')"
echo "users with an email:  $(wc -l < "$tmp/emailed" | tr -d ' ')"
echo
report() {
  entries=$(cat)
  count=$(echo "$entries" | grep -c . || true)
  echo "$1: $count"
  echo "$entries" | grep . | head -5 | sed 's/^/    /' || true
  if [ "$count" -gt 5 ]; then echo "    ... and $((count - 5)) more"; fi
}
comm -23 "$tmp/users" "$tmp/requested" | report "registered but never requested (call never reached the service)"
comm -23 "$tmp/requested" "$tmp/emailed" | report "requested but never emailed (service failed)"
notif_q "SELECT email || ' x' || count(*) FROM emails_sent WHERE source = :'src' GROUP BY email HAVING count(*) > 1 ORDER BY email" | report "emailed more than once"
comm -13 "$tmp/users" "$tmp/emailed" | report "emailed but not registered"
