# Scala

Scala 3 studies, built around one algorithm taken progressively further.

| Project | What it is |
|---|---|
| [`hello-world`](hello-world) | Toolchain setup (Coursier, `scala run`) |
| [`bitonic-sequence-algorithm`](bitonic-sequence-algorithm) | The bitonic sequence algorithm in a single `.scala` file |
| [`scala-api-http4s`](scala-api-http4s) | First REST API: http4s Ember + Circe + Cats Effect 3 |
| [`bitonic-sequence-api`](bitonic-sequence-api) | Same stack wrapping the algorithm, plus Redis cache-aside via redis4cats (`"cached": true/false` in the response), log4cats, Docker Compose |
| [`bitonic-benchmark`](bitonic-benchmark) | Full rewrite on ZIO (zio-http, zio-redis, zio-schema, zio-test) exposing `/bitonic` (Redis) and `/bitonic-memcached` to benchmark the two cache backends head to head |

## Progression

algorithm → http4s API → + Redis cache → ZIO rewrite + Redis vs Memcached benchmark

Each step adds one concept. The last two projects are the same service on the two competing effect systems (Cats Effect vs ZIO).

## Stack

Scala 3.7 · sbt · Cats Effect · http4s · Circe · ZIO · redis4cats · zio-redis · Memcached (xmemcached) · Docker
