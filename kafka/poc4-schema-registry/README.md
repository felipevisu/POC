# POC 4 — Schema Registry & Avro (on top of Consumer Groups, Partitioning & Ordering)

Order-processing pipeline. Orders keyed by `customer_id`. Multiple consumer instances
process in parallel while preserving **per-customer order** — and now every message is
**Avro-encoded and governed by a Schema Registry** instead of a hand-built JSON string.

## Goals

1. **How do I enforce a contract on the data?** → A Schema Registry. Producers and consumers agree on an Avro schema; messages carry a schema ID, not the schema itself.

---

## Architecture

| Component         | What it does                                                            |
|-------------------|------------------------------------------------------------------------|
| `kafka`           | Single-node Kafka (KRaft mode, no ZooKeeper). Port `9092`.             |
| `schema-registry` | Confluent Schema Registry. Stores Avro schemas. Port `8081`.          |
| `kafka-ui`        | Web UI for topics, partitions, consumer groups, lag, **and schemas**.  |
| producer          | Emits 1 order / 500ms, key = `customer-<0..9>`, value = Avro `Order`.  |
| consumer          | Joins group `order-processors`, prints assigned partitions + decoded orders. |

Topic: `orders`, **6 partitions** (created manually in step 2).
Schema subject: `orders-value` (auto-registered by the producer on first send).

### Maven module layout

The schema is the single source of truth. It lives in a shared `common` module that
generates the `Order` Java class at build time; producer and consumer both depend on it.

```
orders/                  (parent pom — versions, Confluent repo, plugins)
├── common/              ← holds order.avsc, generates com.poc.orders.Order
├── producer-service/    ← depends on common
└── consumer-service/    ← depends on common
```

---

## How the schema flows (the mental model)

The schema exists in two places for two different reasons — they are **not** duplicates:

- **`common/src/main/avro/order.avsc`** is for **build time**. The Avro Maven plugin reads
  it and generates `com.poc.orders.Order`, the typed class your code compiles against.
- **The Schema Registry** is for **runtime**. The producer stamps a schema **ID** onto each
  message's bytes; the consumer reads that ID and fetches the matching schema to decode.

You author the schema once (the `.avsc`). The registry copy appears **automatically** the
first time the producer sends a message — the `KafkaAvroSerializer` auto-registers it under
the subject `orders-value`. Manual registration via curl/UI is optional and only needed if
you want the schema to exist *before* any producer runs.

End-to-end:

1. Write `order.avsc` → plugin generates `Order.java` (build time).
2. Producer sends an `Order` → serializer auto-registers the schema, encodes to Avro bytes (first send).
3. Consumer receives bytes → fetches schema by ID from the registry → decodes to a typed `Order` (runtime).

### The schema

`common/src/main/avro/order.avsc`:

```json
{
  "type": "record",
  "name": "Order",
  "namespace": "com.poc.orders",
  "fields": [
    { "name": "orderId",    "type": "long" },
    { "name": "customerId", "type": "string" },
    { "name": "amount",     "type": "int" }
  ]
}
```

> `orderId` is a `long` (it comes from an ever-incrementing counter — `int` would overflow
> eventually). `amount` is an `int` for random test data; real money would use a decimal type.
> The `namespace` becomes the Java package, so the generated class is `com.poc.orders.Order`.

---

## Project build notes

A few things that have to be in place or the build fails:

- **Parent pom** must declare the Confluent repository (these artifacts aren't on Maven Central):

  ```xml
  <repositories>
    <repository>
      <id>confluent</id>
      <url>https://packages.confluent.io/maven/</url>
    </repository>
  </repositories>
  ```

- **Parent pom `<dependencyManagement>`** declares versions once: `kafka-clients`,
  `kafka-avro-serializer` (7.7.0), `avro` (1.11.4), `slf4j-simple`, and the `common` module (1.0).
- **`common`** uses the `avro-maven-plugin` to generate `Order` from the `.avsc`.
- **`producer-service`** and **`consumer-service`** each depend on `common`,
  `kafka-clients`, `kafka-avro-serializer`, and `slf4j-simple` (no versions — inherited).

> **Version note:** keep `kafka-clients` on the **3.9.x** line to pair cleanly with the
> Confluent `7.7.0` serializer. Mismatched majors surface as `NoSuchMethodError` at runtime.

---

## 1. Start the cluster

```bash
docker compose up -d
```

Wait ~30s — Schema Registry comes up *after* Kafka is ready and creates its `_schemas` topic.

**Pages to open:**

- **Kafka UI** → http://localhost:8080
  - Topics: http://localhost:8080/ui/clusters/local/all-topics
  - Consumer groups: http://localhost:8080/ui/clusters/local/consumer-groups
  - Schemas: http://localhost:8080/ui/clusters/local/schemas

Health checks:

```bash
docker compose ps
docker logs kafka --tail 20
curl http://localhost:8081/subjects          # should return []  (registry is up)
```

> If the registry won't start, check `docker compose logs schema-registry`. The usual cause
> is its `KAFKASTORE_BOOTSTRAP_SERVERS` pointing at the wrong port — it must match Kafka's
> **internal** listener (`kafka:19092`), not a host port. kafka-ui must also be given
> `KAFKA_CLUSTERS_0_SCHEMAREGISTRY: http://schema-registry:8081` to decode Avro messages.

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

## 3. Build everything

Always build from the root so `common` compiles and generates `Order` **before** the services:

```bash
cd orders
mvn clean install
```

You should see the generated class under `common/target/generated-sources/`. If a service
reports `package com.poc.orders does not exist`, this step was skipped or `common` failed.

---

## 4. Start the producer

In its own terminal:

```bash
cd orders
mvn -pl producer-service exec:java
```

(If you didn't set `<mainClass>` in the module pom, add
`-Dexec.mainClass=com.poc.producer.ProducerApp`.)

Output shows each order's destination partition:

```
sent  key=customer-3  -> partition 4  offset 0
sent  key=customer-7  -> partition 1  offset 0
```

The value is now an Avro `Order` object, not a JSON string. On the **first** send the schema
auto-registers — check it appeared:

```bash
curl http://localhost:8081/subjects
# ["orders-value"]
```

…or open the Schemas tab: http://localhost:8080/ui/clusters/local/schemas

**Task 3 (key → partition):** watch the same `customer-N` always land on the same
partition. That's the ordering guarantee — per key, per partition.

---

## 5. Scale consumers — Task 2

Each consumer in its **own terminal**. All share `GROUP_ID=order-processors`
(the default in code), so they form one group and split the 6 partitions.

Run a consumer (repeat in new terminals to scale):

```bash
CONSUMER_NAME=C1 mvn -pl consumer-service exec:java
```

Then add `C2`, `C3` ... in more terminals:

```bash
CONSUMER_NAME=C2 mvn -pl consumer-service exec:java
CONSUMER_NAME=C3 mvn -pl consumer-service exec:java
```

Consumers now decode Avro into typed `Order` objects and print the fields:

```
[C1] PROCESSED p4 off=0 key=customer-3 orderId=1 amount=274
```

Watch the `ASSIGNED` / `REVOKED` lines on every rebalance, and live in the UI:
http://localhost:8080/ui/clusters/local/consumer-groups/order-processors

> **Try the idle-consumer experiment:** run more than 6 consumers in the group. With only
> 6 partitions, the 7th+ sit idle (`ASSIGNED [ none - IDLE ]`) — that's the answer to Goal 2.

---

## 6. Rebalance on consumer death — Task 4

With 3 consumers running, kill one (`Ctrl-C`). The other two log a `REVOKED`
then `ASSIGNED` — they pick up the orphaned partitions. Watch group state flip to
`Rebalancing` → `Stable` in the UI.

---

## Pages quick reference

| Page            | URL                                                                       |
|-----------------|---------------------------------------------------------------------------|
| Kafka UI home   | http://localhost:8080                                                     |
| Topics          | http://localhost:8080/ui/clusters/local/all-topics                        |
| `orders` topic  | http://localhost:8080/ui/clusters/local/all-topics/orders                 |
| Schemas         | http://localhost:8080/ui/clusters/local/schemas                           |
| Consumer groups | http://localhost:8080/ui/clusters/local/consumer-groups                   |
| The group       | http://localhost:8080/ui/clusters/local/consumer-groups/order-processors  |
| Registry API    | http://localhost:8081/subjects                                            |

---

## Schema Registry cheat sheet

```bash
# List subjects
curl http://localhost:8081/subjects

# Latest version of the orders value schema
curl http://localhost:8081/subjects/orders-value/versions/latest

# All versions
curl http://localhost:8081/subjects/orders-value/versions

# (Optional) register a schema by hand — normally the producer auto-registers
jq -n --rawfile s common/src/main/avro/order.avsc '{schema: $s}' | \
  curl -s -X POST \
    -H "Content-Type: application/vnd.schemaregistry.v1+json" \
    -d @- \
    http://localhost:8081/subjects/orders-value/versions
```