import redis

CHANNEL = "chat"


def main():
    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    r.ping()  # fail fast if Redis isn't up

    print(f"Publishing to channel '{CHANNEL}'. Type a message and hit Enter.")
    print("Ctrl-C to quit.\n")

    try:
        while True:
            msg = input("you> ").strip()
            if not msg:
                continue
            delivered = r.publish(CHANNEL, msg)
            if delivered == 0:
                print("   \u26a0  delivered to 0 subscribers — this message is GONE.")
            else:
                print(f"   \u2713 delivered to {delivered} subscriber(s) right now.")
    except KeyboardInterrupt:
        print("\nbye")


if __name__ == "__main__":
    main()
