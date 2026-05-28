import os
import random
import sys
import time

import redis

REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
PLAYER_COUNT = int(os.getenv("PLAYER_COUNT", "50000"))
SEED = int(os.getenv("SEED", "42"))
LB = "game:leaderboard:global"


def wait_for_redis(client: redis.Redis, attempts: int = 30) -> None:
    for i in range(attempts):
        try:
            client.ping()
            return
        except redis.exceptions.ConnectionError:
            print(f"  waiting for Redis at {REDIS_HOST}:{REDIS_PORT} ... ({i+1})")
            time.sleep(1)
    print("Could not reach Redis; giving up.", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    wait_for_redis(r)

    existing = r.zcard(LB)
    if existing:
        print(f"Leaderboard already has {existing:,} players — skipping seed.")
        return

    print(f"Seeding {PLAYER_COUNT:,} players into '{LB}' ...")
    random.seed(SEED)
    t0 = time.perf_counter()
    pipe = r.pipeline(transaction=False)
    for i in range(PLAYER_COUNT):
        score = int(random.gauss(5000, 1500))
        pipe.zadd(LB, {f"player:{i:05d}": score})
    pipe.execute()
    elapsed = time.perf_counter() - t0
    print(f"Done: {r.zcard(LB):,} players in {elapsed*1000:.0f} ms.")


if __name__ == "__main__":
    main()