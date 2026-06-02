# Redis POC: Pub/Sub → Streams

A two-stage learning project.

- **Stage 1 (this scaffold):** Pub/Sub chat — fire-and-forget. No persistence, no acks, no replay.
- **Stage 2 (next):** Durable job queue with Redis Streams + consumer groups — persistence, `XACK`, crash recovery, replay.

## Setup

```bash
# 1. Start Redis
docker compose up -d

# 2. Install the Python client
pip install -r requirements.txt
```

## Run Stage 1

Open **three** terminals:

```bash
# Terminal A — a subscriber
python fire-and-forget/subscriber.py alice

# Terminal B — another subscriber
python fire-and-forget/subscriber.py bob

# Terminal C — the publisher
python fire-and-forget/publisher.py
```

Type in Terminal C; watch messages land in A and B in real time.

## The experiment that motivates Stage 2

1. With both subscribers running, send a few messages — they all arrive. The publisher reports `delivered to 2 subscriber(s)`.
2. **Kill alice** (Ctrl-C in Terminal A). Send 3 more messages.
3. **Restart alice.** Those 3 messages? Gone. She never sees them — and the publisher told you `delivered to 1` (or `0` if you'd killed both).

That gap is the whole point. Pub/Sub delivers only to who's connected *right now*. No backlog, no replay, no acknowledgment that work was done. For chat presence/notifications that's fine; for jobs you can't afford to drop, it's a dealbreaker.

Stage 2 fixes every one of those with Streams.

## Run Stage 2 (durable job queue)

Producers `XADD` jobs that Redis stores. A consumer group hands each job to exactly one worker, tracks it until the worker `XACK`s it, and lets you reclaim jobs from workers that died mid-task.

```bash
# Terminal A — a worker
python streams/worker.py alice

# Terminal B — queue some jobs
python streams/producer.py --batch 5
```

Watch alice pick up the 5 jobs, process, and ack each. Add a second worker (`python streams/worker.py bob`) and re-run the producer to see jobs split between them.

### Experiment 1 — persistence (the answer to "something that persists")

1. Make sure **no worker is running.**
2. `python streams/producer.py --batch 3` — jobs are queued with no one listening.
3. *Now* start `python streams/worker.py alice`. It immediately processes all 3.

In Stage 1 those messages were gone. Here they waited in the stream. That's the whole difference.

### Experiment 2 — crash recovery

1. Start `python streams/worker.py alice` and queue a few jobs.
2. In another terminal: `python streams/worker.py greg --crash`. Greg grabs one job and dies *without* acking it — that job is now stuck in the group's pending list, owned by a dead worker.
3. `python streams/recover.py 0` — it lists the pending entry, reclaims it, finishes the work, and acks it. No job lost.

### Concepts in play

- `XADD` — append a job; Redis persists it (AOF is on in `docker-compose.yml`).
- `XGROUP CREATE` — a consumer group; multiple workers share one stream, each job delivered once.
- `XREADGROUP ... >` — fetch undelivered jobs for this group.
- `XACK` — mark a job done so it leaves the pending list.
- `XPENDING` / `XCLAIM` — see and reclaim jobs whose worker crashed.
- `XLEN` / `XTRIM` / `MAXLEN` — the stream grows forever unless you trim it; worth adding once the basics click.

### Where to go next

- Add a **dead-letter** path: if `times_delivered` (shown by `recover.py`) crosses a limit, the job is a poison message — route it elsewhere instead of retrying forever.
- Cap stream growth with `XADD ... MAXLEN ~ 10000`.
- Replay/audit: read the full history with `XRANGE` independent of the consumer group.