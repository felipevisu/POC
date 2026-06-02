import sys
import time

import redis

STREAM = "jobs"
GROUP = "workers"
RECLAIMER = "recoverer"


def main():
    min_idle = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    r.ping()

    # Detailed view of pending entries (id, owning consumer, idle time, delivery count).
    pending = r.xpending_range(STREAM, GROUP, min="-", max="+", count=100)
    if not pending:
        print("nothing pending — all jobs acked.")
        return

    print(f"{len(pending)} pending entr(ies):")
    for e in pending:
        print(
            f"  {e['message_id']}  owner={e['consumer']}  "
            f"idle={e['time_since_delivered']}ms  delivered={e['times_delivered']}x"
        )

    claim_ids = [
        e["message_id"] for e in pending if e["time_since_delivered"] >= min_idle
    ]
    if not claim_ids:
        print(
            f"\nnone idle >= {min_idle}ms yet. Wait a moment or pass a smaller threshold."
        )
        return

    print(f"\nreclaiming {len(claim_ids)} job(s) idle >= {min_idle}ms ...")
    claimed = r.xclaim(
        STREAM, GROUP, RECLAIMER, min_idle_time=min_idle, message_ids=claim_ids
    )
    for msg_id, fields in claimed:
        task = fields.get("task")
        print(f"  reclaimed {msg_id} task={task} -> finishing")
        time.sleep(0.5)
        r.xack(STREAM, GROUP, msg_id)
        print(f"  acked {msg_id}")

    print("\ndone.")


if __name__ == "__main__":
    main()
