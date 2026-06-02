import sys
import time

import redis
from redis.exceptions import ResponseError

STREAM = "jobs"
GROUP = "workers"


def ensure_group(r):
    """Create the consumer group once. id='0' means: deliver everything in
    the stream that this group hasn't seen yet, including jobs added before
    the group existed. mkstream creates the stream if it doesn't exist."""
    try:
        r.xgroup_create(STREAM, GROUP, id="0", mkstream=True)
        print(f"created consumer group '{GROUP}'")
    except ResponseError as e:
        if "BUSYGROUP" not in str(e):
            raise


def main():
    name = next((a for a in sys.argv[1:] if not a.startswith("--")), "worker-1")
    crash = "--crash" in sys.argv

    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    r.ping()
    ensure_group(r)

    print(f"[{name}] waiting for jobs (Ctrl-C to quit)...")
    try:
        while True:
            resp = r.xreadgroup(GROUP, name, {STREAM: ">"}, count=1, block=5000)
            if not resp:
                continue

            _stream, messages = resp[0]
            for msg_id, fields in messages:
                task = fields.get("task")
                print(f"[{name}] processing {msg_id}  task={task}")

                if crash:
                    print(f"[{name}] CRASH before ack -> {msg_id} is now pending")
                    sys.exit(1)

                time.sleep(1)
                r.xack(STREAM, GROUP, msg_id)
                print(f"[{name}] acked {msg_id}")
    except KeyboardInterrupt:
        print(f"\n[{name}] bye")


if __name__ == "__main__":
    main()
