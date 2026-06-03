**Run kafka**

```bash
docker compose up -d
```

**Create topic**

```bash
docker exec broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create \
  --topic page-views \
  --partitions 3 \
  --replication-factor 1
```

**See topic**

```bash
docker exec broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic page-views
```

### Example 1

Publishing on topic

**Terminal 1: Consumer**

```bash
docker exec -it broker /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic page-views
```

**Terminal 2: Producer**

```bash
docker exec -it broker /opt/kafka/bin/kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic page-views
```

Enter some values on terminal 2

```bash
{"user":"alice","page":"/home"}
{"user":"bob","page":"/pricing"}
{"user":"alice","page":"/checkout"}
```

As you hit Enter, watch Terminal 1 — each event appears there within a moment. That's the full producer → broker → consumer path you set out to build, running live.

### Example 2

Now the important part. Leave the producer open but kill the consumer in Terminal 1 with Ctrl-C. Then restart it, this time with `--from-beginning`:

```bash
docker exec -it broker /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic page-views \
  --from-beginning
```
All three messages reappear — even though a consumer already "read" them a moment ago.
