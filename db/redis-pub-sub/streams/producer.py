import sys
import time

import redis

STREAM = "jobs"


def main():
    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    r.ping()

    args = sys.argv[1:]
    if args and args[0] == "--batch":
        n = int(args[1]) if len(args) > 1 else 5
        tasks = [f"job-{i}" for i in range(1, n + 1)]
    elif args:
        tasks = [" ".join(args)]
    else:
        tasks = [f"job-{i}" for i in range(1, 6)]

    for task in tasks:
        msg_id = r.xadd(STREAM, {"task": task, "created_at": f"{time.time():.0f}"})
        print(f"queued {msg_id}  task={task}")

    print(f"\nstream '{STREAM}' now holds {r.xlen(STREAM)} message(s).")
    print("(they persist even after being processed, until you XTRIM/MAXLEN them)")


if __name__ == "__main__":
    main()
