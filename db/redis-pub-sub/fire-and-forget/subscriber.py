import sys

import redis

CHANNEL = "chat"


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "sub"
    r = redis.Redis("localhost", port=6379, decode_responses=True)
    r.ping()

    pubsub = r.pubsub()
    pubsub.subscribe(CHANNEL)

    print(f"[{name}] subscribed to channel '{CHANNEL}'. Waiting for live messages...")
    print(f"[{name}] (anything sent while I'm offline is lost forever)\n")

    try:
        for message in pubsub.listen():
            if message["type"] == "message":
                print(f"[{name}] recv: {message['data']}")
    except KeyboardInterrupt:
        print(f"\n[{name}] bye")


if __name__ == "__main__":
    main()
