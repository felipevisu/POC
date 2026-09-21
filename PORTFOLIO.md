<div align="center">

# POC Lab

**Laboratório pessoal de provas de conceito — Felipe Faria**

[![Repo](https://img.shields.io/badge/GitHub-felipevisu%2FPOC-181717?logo=github)][repo]
![POCs](https://img.shields.io/badge/POCs-230%2B-blue)
![Linguagens](https://img.shields.io/badge/linguagens-8-orange)
![Commits](https://img.shields.io/badge/commits-475-green)
![Ativo](https://img.shields.io/badge/ativo-mar%2F2025%20→%20hoje-purple)

</div>

---

## Em uma frase

Repositório de estudo contínuo com mais de 230 provas de conceito em 8 linguagens, cobrindo frontend, backend, dados, infraestrutura e IA aplicada. Cada POC isola um conceito, documenta o *porquê* e, sempre que possível, mede o resultado.

## Sobre

Desde março de 2025 mantenho um repositório único onde estudo tecnologia por meio de POCs pequenas e focadas — ~230 projetos, ~475 commits, 17 meses sem pausa.

O método é sempre o mesmo:

- **Um conceito por POC.** Ambiente reproduzível via Docker Compose; README que explica a decisão, não só o comando.
- **Séries progressivas.** Kafka 1→4, Terraform EC2→SES→EKS, Scala http4s→Redis→ZIO. Cada passo adiciona exatamente uma ideia.
- **Mesmo problema, várias linguagens.** Segment tree em Java, Go, Rust, Python e JS para comparar ergonomia.
- **Performance com números.** `EXPLAIN ANALYZE` antes/depois de índice, k6 em Zod vs Yup, react-scan antes/depois de otimização.
- **Construa você mesmo.** React com hooks, Redux com `Proxy`, React Router, `fetch` sobre socket TLS, bundler de CSS-in-JS, backend de tasks para Django — entender por dentro antes de usar.

## Pontos fortes

| | |
|---|---|
| **Frontend generalista e profundo** | React 18/19, Next.js, SvelteKit, Angular 20 zoneless, Web Components, micro-frontends (Module Federation), performance, CSP e Electron seguro |
| **Backend poliglota** | Java/Spring, Scala (Cats Effect e ZIO), Go, Python (Django, FastAPI), Node, Rust/WASM — linguagem escolhida pelo problema |
| **Dados e mensageria** | Kafka + Schema Registry/Avro, Debezium CDC, TimescaleDB, pgvector, PostGIS, OpenSearch, Redis em 7 casos de uso |
| **IA aplicada** | RAG completo com citações, tool use manual e via SDK, agentes NL→SQL, roteamento de modelos por custo, PII protegida em nível de protocolo, skills para Claude Code |
| **Observabilidade** | Prometheus, Grafana, OpenTelemetry + Jaeger com trace atravessando Kafka, k6 |
| **Infra / DevOps** | Terraform multi-provider, AWS (EC2, SES, IAM, VPC, EKS), Kubernetes, Helm, Jenkins com RBAC |
| **Fundamentos** | 14 padrões GoF, Streams, Reflection, AES-GCM + HMAC, segment tree persistente, LeetCode com brute-force e ótimo lado a lado |
| **Design de API** | OpenAPI spec-first com wireframes, GraphQL Federation Python + Java, READMEs que ensinam |
| **Comunicação** | Decks técnicos (Linaria, Web Components, Angular, Zod vs Yup), ferramentas de ensino |

## Áreas de conhecimento

<details open>
<summary><b>Frontend</b></summary>

React 18/19 · Next.js 15/16 · React Router 7 · SvelteKit · Angular 20 · Astro · HTMX · Electron · Ink · TypeScript · Vite · Babel · Rollup · SWC
Zustand · MobX · SWR · react-hook-form · Zod · Yup
Tailwind · Sass · PostCSS · Linaria · Emotion · MUI · Chakra · Storybook
Web Components · Service Worker · IndexedDB · IntersectionObserver · WebSockets · SVG · PDF.js · CSP
Module Federation · SSR · react-window · react-scan
</details>

<details open>
<summary><b>Backend</b></summary>

**Java** — Java 17 · Spring Boot · Spring Data JDBC/JPA · Maven · Gradle · GoF · Streams · Reflection · Gson/Jackson · AES-GCM/HMAC
**Scala** — Scala 3 · sbt · Cats Effect · http4s · Circe · ZIO · redis4cats · Memcached
**Go** — Gin · table tests · BFS/DFS · grafos
**Rust** — Cargo · wasm-bindgen · wasm-pack
**Python** — Django 5/6 · DRF · Channels · GeoDjango/PostGIS · OpenSearch · FastAPI · Pydantic · Flask · Docling
**Node** — Express · Hono · Apollo Gateway
</details>

<details open>
<summary><b>Dados, mensageria e bancos</b></summary>

Kafka (KRaft, partições, consumer groups, Schema Registry, Avro) · Kafka Connect · Debezium · Apicurio · MinIO · SOAP · data lineage · Dolt
PostgreSQL · TimescaleDB · pgvector · PostGIS · Redis · Redis Stack VSS · OpenSearch · MongoDB · SQLite · Liquibase
</details>

<details open>
<summary><b>IA / LLM</b></summary>

Anthropic SDK · OpenRouter SDK/Agent · LangChain/LangGraph · CopilotKit · Ollama · sentence-transformers
RAG (chunking, embeddings, HNSW, citações) · tool use · agentes NL→SQL · streaming · roteamento por custo · geração de imagem · scraping guiado por LLM · Claude Code skills
</details>

<details open>
<summary><b>Infra, observabilidade e testes</b></summary>

Docker Compose · Terraform (aws/helm/kubernetes) · AWS (EC2, SES, IAM, VPC, EKS) · Kubernetes · Helm · minikube · Jenkins · nginx · Vercel
Prometheus · Grafana · OpenTelemetry · Jaeger · kafka-ui
Cypress · Vitest · Testing Library · Playwright · JUnit · pytest · zio-test · k6
</details>

<details open>
<summary><b>Design de sistemas e algoritmos</b></summary>

OpenAPI 3 · versionamento de API · wireframes · GraphQL Federation
two pointers · binary search · XOR · crivo · Floyd · heaps · DP 2D · LRU · segment tree persistente · bitonic sequence
</details>

## Projetos em destaque

### Dados e mensageria

| Projeto | O que é |
|---|---|
| [salesman-kata] | Pipeline completo: PostgreSQL (Debezium CDC) + CSV + SOAP → Kafka/MinIO → TimescaleDB, lineage em MongoDB, Prometheus/Grafana. ~20 containers. |
| [open-telemetry] | 3 serviços Java sobre Kafka com OTel Java Agent; um trace no Jaeger atravessa os três, incluindo o broker. |
| [kafka-schema-registry] | Avro como fonte única de verdade, codegen via Maven, registro automático de schema. |
| [redis-leaderboard] | Sorted sets + keyspace notifications + Prometheus + Grafana + k6. |
| [postgres-index-benchmark] | 55 ms → 0,068 ms (~800×) com índice B-tree em 1M linhas, planos no README. |

### IA aplicada

| Projeto | O que é |
|---|---|
| [rag-v2] · [rag-loans] | 6 serviços: PDF → worker (docling) → embeddings → pgvector HNSW → chat com citações. |
| [claude-loans] · [openrouter-loans] | Mesmo agente NL→SQL construído duas vezes: loop manual vs Agent SDK. |
| [chat-interviewer] | PII coletada client-side; o modelo recebe só quais campos foram preenchidos, nunca os valores. |
| [smartrouter] | Classificador barato roteia cada prompt entre 6 modelos; custo acumulado vs baseline Opus. |

### Frontend e internals

| Projeto | O que é |
|---|---|
| [feact] | React do zero: vDOM, componentes funcionais, slots de `useState`/`useEffect`. |
| [simple-bundler] | Bundler que extrai CSS-in-JS via wyw-in-js/Babel. |
| [mini-fetch] | HTTP escrito à mão sobre socket TLS. |
| [scroll-presenter] | Scroll sincronizado em tempo real via WebSockets, com sessão e reconexão. |
| [federation] | Supergraph GraphQL: subgraph Python + subgraph Java/Spring sob Apollo Gateway. |
| [zod-vs-yup] | 6 demos, micro-benchmark, load test k6, resultados e slides. |
| [cypress-forms] | Mesmo formulário em MUI/Chakra/Bootstrap, testado só com seletores acessíveis. |
| [modos-gregos] | Visualizador de braço de guitarra/baixo/ukulele, 21+ escalas, trilíngue. |

### Infra e fundamentos

| Projeto | O que é |
|---|---|
| [complete-infra] | Jenkins via Helm em minikube com RBAC e pipelines; mesma stack em EKS real via Terraform. |
| [segtree-persistence] | Segment tree persistente por path copying; consulta em qualquer versão em O(log n). |
| [encrypted-search] | Busca exata sobre dado cifrado: AES-GCM para exibir, HMAC-SHA256 para buscar. |
| [bitonic-scala] | Algoritmo → API http4s → cache Redis → reescrita em ZIO com benchmark Redis vs Memcached. |

---

<div align="center">

~230 POCs · 13 áreas · 8 linguagens · 20+ ambientes Docker Compose · 14 padrões GoF · 16 problemas LeetCode · 6 segment trees · 7 casos de uso Redis

</div>

[repo]: https://github.com/felipevisu/POC
[salesman-kata]: https://github.com/felipevisu/POC/tree/main/data/salesman-kata
[open-telemetry]: https://github.com/felipevisu/POC/tree/main/data/open-telemetry
[kafka-schema-registry]: https://github.com/felipevisu/POC/tree/main/kafka/poc4-schema-registry
[redis-leaderboard]: https://github.com/felipevisu/POC/tree/main/db/redis-leaderboard-track
[postgres-index-benchmark]: https://github.com/felipevisu/POC/tree/main/db/index-postgresql-benchmark
[rag-v2]: https://github.com/felipevisu/POC/tree/main/ai/rag-v2
[rag-loans]: https://github.com/felipevisu/POC/tree/main/ai/rag-loans
[claude-loans]: https://github.com/felipevisu/POC/tree/main/ai/claude-loans
[openrouter-loans]: https://github.com/felipevisu/POC/tree/main/ai/openrouter-loans
[chat-interviewer]: https://github.com/felipevisu/POC/tree/main/ai/claude-react-chat-interviewer
[smartrouter]: https://github.com/felipevisu/POC/tree/main/ai/smartrouter
[feact]: https://github.com/felipevisu/POC/tree/main/frontend/feact
[simple-bundler]: https://github.com/felipevisu/POC/tree/main/frontend/simple-bundler
[mini-fetch]: https://github.com/felipevisu/POC/tree/main/frontend/mini-fetch
[scroll-presenter]: https://github.com/felipevisu/POC/tree/main/frontend/scroll-presenter
[federation]: https://github.com/felipevisu/POC/tree/main/multiple/federation
[zod-vs-yup]: https://github.com/felipevisu/POC/tree/main/frontend/zod-vs-yup
[cypress-forms]: https://github.com/felipevisu/POC/tree/main/frontend/cypres-form-testing
[modos-gregos]: https://github.com/felipevisu/POC/tree/main/frontend/modos-gregos
[complete-infra]: https://github.com/felipevisu/POC/tree/main/infra/complete-infra
[segtree-persistence]: https://github.com/felipevisu/POC/tree/main/java/segtree-persistence
[encrypted-search]: https://github.com/felipevisu/POC/tree/main/java/case-insensitive-query
[bitonic-scala]: https://github.com/felipevisu/POC/tree/main/scala
