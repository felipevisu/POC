# Rate Limiter POC

A login rate limiter built on Redis, added to the auth app to stop brute-force password guessing. The rule: **5 login attempts per minute per IP**, then `429 Too Many Requests`.

## What we built

- `session.py` — two ways to rate-limit using sliding window approach
- `app.py` — `/login` now calls the limiter before doing any real work

## The Redis features we used, and why

### 1. `INCR` — atomic counting

The core of any rate limiter is a counter. The naive way ("read it, add one, write it back") **breaks under load**: two requests arriving at once both read the same value and one overwrites the other, so counts get lost and the limit leaks.

`INCR` does read-add-write as **one indivisible operation**. Redis runs commands one at a time, so concurrent `INCR`s can never lose a count.

**Why Redis:** the counter is correct by construction, with no locks in your app code.

### 2. `EXPIRE` / TTL — windows that reset themselves

A rate limit is a counter that resets every window. Instead of running a cleanup job, we put a **TTL** on the counter key equal to the window length. When the window ends, Redis deletes the key itself and the next request starts fresh.

**Why Redis:** expiry is built into every key, so "reset every 60 seconds" is free.

### 3. Sorted sets (`ZADD` / `ZREMRANGEBYSCORE` / `ZCARD`) — the accurate version

Fixed-window counting has a flaw: bursts can straddle the reset boundary (5 requests at 0:59 + 5 at 1:01 = 10 in two seconds). The fix is a **sorted set** where each request is stored with its timestamp as the score. To check the limit we:

- `ZREMRANGEBYSCORE` — drop entries older than the window
- `ZADD` — record this request
- `ZCARD` — count what's left

This counts the *real* number of requests in the trailing 60 seconds, with no boundary to game.

**Why Redis:** sorted sets keep entries ordered by score (here, time), so "how many in the last 60s" is a couple of fast commands.

### 4. Pipelines — the multi-step check stays atomic

The sliding-window check is four commands. We send them in a **pipeline** so they execute together as one unit, and no other request can interleave halfway through.

**Why Redis:** keeps a multi-command check correct under concurrency, in one round trip.

## Fixed vs sliding window

| | Fixed window | Sliding window |
|---|---|---|
| Structure | one counter (`INCR`) | sorted set of timestamps |
| Cost | cheapest (1 key, 2 cmds) | more memory + commands |
| Accuracy | gameable at boundaries | accurate |
| Use when | rough limits, max speed | abuse-sensitive endpoints (like login) |

We use **sliding window** for `/login` because brute-force protection is exactly the case where boundary-gaming matters.

## Try it

```bash
# with the app running and a user registered, hammer /login:
for i in $(seq 1 7); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:5000/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"ada@example.com","password":"wrong"}'
done
# first 5 -> 401, then -> 429
```

Watch it in `redis-cli`:

```
ZRANGE ratelimit:sliding:login:127.0.0.1 0 -1 WITHSCORES   # the timestamped attempts
TTL    ratelimit:sliding:login:127.0.0.1                   # self-cleanup countdown
```

## One caveat

Limiting by IP alone punishes users sharing an IP (offices, NAT) and is dodged by attackers rotating IPs. Real systems combine IP + account + sometimes a CAPTCHA after repeated failures. The Redis technique is the same; only the *identifier* changes.