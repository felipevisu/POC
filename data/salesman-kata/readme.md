# TOP Salesman - Data KATA

## Knowledge base

### 1) What is Data Ingestion?

Ingestion is the process of collection and importing data from various sources into your pipeline system for processing. It's a funnel that receives data from many places

```
[Relational DB] ──────┐
                      │
[File System]  ───────┼──▶  [ Your Pipeline ]  ──▶  [Processing]
                      │
[SOAP/WS-*]    ───────┘ 
```

### 2)  What is Data Lineage?

Data Lineage tracks the origin, movement, and transformation of data throughout its lifecycle. It answers:
* Where did this data come from? (origin)
* What happened to it? (transformations)
* Where did it go? (destination)
```
[Raw Sales Data] ──▶ [Cleaned] ──▶ [Aggregated by City] ──▶ [Final DB]
      │                  │                  │                    │
      └──────────────────┴──────────────────┴────────────────────┘
                    Data Lineage Graph (tracked)
```

### 3) What is Message Broker

A Message Broker is middleware that translates and routes messages between different applications/services.

```
┌──────────┐                              ┌──────────┐
│ Producer │ ───▶  ┌────────────────┐ ───▶│ Consumer │
│ (Source) │       │ MESSAGE BROKER │     │ (Target) │
└──────────┘       │    (Kafka)     │     └──────────┘
                   └────────────────┘
                          │
                   • Receives messages
                   • Stores temporarily
                   • Routes to consumers
                   • Guarantees delivery
```

## Services needed

| # | Service/Component | Purpose |
|---|-------------------|---------|
| 1 | Relational DB (PostgreSQL) | Source 1 - Sales transactions |
| 2 | File Storage (MinIO/Local) | Source 2 - CSV/JSON files |
| 3 | SOAP Service (Mock WS-*) | Source 3 - Legacy service |
| 4 | Message Broker (Kafka) | Event streaming backbone |
| 5 | Stream Processor (Flink/Kafka Streams) | Processing & aggregation |
| 6 | Lineage Tool (OpenLineage + Marquez) | Track data flow |
| 7 | Observability Stack (Prometheus + Grafana) | Metrics & monitoring |
| 8 | Results Database (ClickHouse/TimescaleDB) | Store aggregated results |
| 9 | REST API (Spring Boot/Go/Node) | Expose results |