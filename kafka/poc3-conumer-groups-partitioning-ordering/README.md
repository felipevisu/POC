# POC 2 — Consumer Groups, Partitioning & Ordering

Order-processing pipeline. Orders keyed by `customer_id`. Multiple consumer
instances process in parallel while preserving **per-customer order**.

## Goal

Answer two questions by the end:

1. **How do I guarantee ordering for a given entity?** → Key by that entity. Same
   key → same partition → ordered within that partition.
2. **Why did adding a 9th consumer do nothing?** → 6 partitions = max 6 active
   consumers in a group. Extras sit idle.

---

## Prerequisites

- Docker + Docker Compose
- Java 17+
- Maven 3.8+

---

## Architecture

| Component   | What it does                                                        |
|-------------|---------------------------------------------------------------------|
| `kafka`     | Single-node Kafka (KRaft mode, no ZooKeeper). Port `9092`.          |
| `kafka-ui`  | Web UI to watch topics, partitions, consumer groups, lag.           |
| producer    | Emits 1 order / 500ms, key = `customer-<0..9>`.                     |
| consumer    | Joins group `order-processors`, prints assigned partitions + records.|

Topic: `orders`, **6 partitions** (created manually in step 2).

---

## 1. Start the cluster

```bash
docker compose up -d
```

Wait ~15s for the broker to come up.

**Pages to open:**

- **Kafka UI** → http://localhost:8080
  - Topics: http://localhost:8080/ui/clusters/local/all-topics
  - Consumer groups: http://localhost:8080/ui/clusters/local/consumer-groups

Check broker is healthy:

```bash
docker compose ps
docker logs kafka --tail 20
```

---

## 2. Create the topic (6 partitions) — Task 1

```bash
docker exec -it kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create --topic orders --partitions 6 --replication-factor 1
```

Verify:

```bash
docker exec -it kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 --describe --topic orders
```

Should list partitions `0..5`. Confirm in UI:
http://localhost:8080/ui/clusters/local/all-topics/orders

---

## 3. Start the producer

In its own terminal:

```bash
cd orders
mvn -pl producer-service -am compile
mvn -pl producer-service exec:java
```

Output shows each order's destination partition:

```
sent  key=customer-3  -> partition 4  offset 0
sent  key=customer-7  -> partition 1  offset 0
```

**Task 3 (key → partition):** watch the same `customer-N` always land on the same
partition. That's the ordering guarantee — per key, per partition.

---

## 4. Scale consumers — Task 2

Each consumer in its **own terminal**. All share `GROUP_ID=order-processors`
(the default in code), so they form one group and split the 6 partitions.

```bash
cd orders
mvn -pl consumer-service -am compile      # once
```

Run a consumer (repeat in new terminals to scale):

```bash
CONSUMER_NAME=C1 mvn -pl consumer-service exec:java
```

Then add `C2`, `C3` ... in more terminals:

```bash
CONSUMER_NAME=C2 mvn -pl consumer-service exec:java
CONSUMER_NAME=C3 mvn -pl consumer-service exec:java
```

Watch the `ASSIGNED` / `REVOKED` lines on every rebalance.

| Consumers | Partitions each | Note                                  |
|-----------|-----------------|---------------------------------------|
| 1         | 6 (all)         | one does everything                   |
| 3         | 2 each          | even split                            |
| 6         | 1 each          | max parallelism                       |
| 8         | 6 busy, **2 idle** | `[ none - IDLE ]` — the key lesson |

Watch live in UI:
http://localhost:8080/ui/clusters/local/consumer-groups/order-processors

---

## 5. Rebalance on consumer death — Task 4

With 3 consumers running, kill one (`Ctrl-C`). The other two log a `REVOKED`
then `ASSIGNED` — they pick up the orphaned partitions. Watch group state flip to
`Rebalancing` → `Stable` in the UI.

---

## 6. Manual commits + duplicate — Task 5

Stop consumers. Restart in **manual commit** mode with a crash trigger:

```bash
CONSUMER_NAME=Cm COMMIT_MODE=manual CRASH_AFTER=5 \
  mvn -pl consumer-service exec:java
```

After 5 processed records it hard-exits **before committing** the 5th offset:

```
[Cm] >>> CRASHING before commit (processed 5, offset N NOT committed)
```

Restart the same consumer (no crash):

```bash
CONSUMER_NAME=Cm COMMIT_MODE=manual mvn -pl consumer-service exec:java
```

The uncommitted record is **re-processed** = duplicate. That's the
**process-then-commit** tradeoff: at-least-once delivery.

---

## Knobs (env vars on the consumer)

| Var           | Default            | Values                                            |
|---------------|--------------------|---------------------------------------------------|
| `CONSUMER_NAME` | random `C-xxxx`  | any label                                         |
| `GROUP_ID`    | `order-processors` | any group name                                    |
| `COMMIT_MODE` | `auto`             | `auto` \| `manual`                                |
| `CRASH_AFTER` | `0` (off)          | N records, then crash before commit (manual only) |
| `ASSIGNMENT`  | `range`            | `range` \| `roundrobin` \| `sticky` \| `cooperative` |
| `TOPIC`       | `orders`           | topic name (producer + consumer)                  |

**Try different assignors** (Task: assignment strategies). Run 3 consumers with:

```bash
ASSIGNMENT=cooperative CONSUMER_NAME=C1 mvn -pl consumer-service exec:java
```

`range` / `roundrobin` / `sticky` do a stop-the-world rebalance; `cooperative`
only moves the partitions that need moving (no full revoke).

---

## Inspect from CLI

Consumer group lag + assignment:

```bash
docker exec -it kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe --group order-processors
```

Tail raw messages with key + partition:

```bash
docker exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 --topic orders \
  --from-beginning --property print.key=true --property print.partition=true
```

---

## Teardown

```bash
docker compose down -v        # -v wipes the kafka-data volume
```

---

## Pages quick reference

| Page            | URL                                                                       |
|-----------------|---------------------------------------------------------------------------|
| Kafka UI home   | http://localhost:8080                                                     |
| Topics          | http://localhost:8080/ui/clusters/local/all-topics                        |
| `orders` topic  | http://localhost:8080/ui/clusters/local/all-topics/orders                 |
| Consumer groups | http://localhost:8080/ui/clusters/local/consumer-groups                   |
| The group       | http://localhost:8080/ui/clusters/local/consumer-groups/order-processors  |
