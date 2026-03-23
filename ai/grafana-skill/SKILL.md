---
name: grafana-dashboard
description: Generate a Grafana dashboard with Prometheus monitoring from a GraphQL or REST API contract. Sets up docker-compose with the app, Prometheus, and Grafana — including auto-provisioned datasources and dashboards tailored to every operation/endpoint.
user_invocable: true
---

# Grafana Dashboard Generator

You are generating a complete Grafana + Prometheus observability stack for an application based on its API contract.

## Step 1: Identify the Application Folder

Use the `AskUserQuestion` tool to ask the user for the **application folder path** (the root of their app, or a subfolder). Default suggestion should be the current working directory.

## Step 2: Scan for API Contracts

Search the application folder for API contract files:

**GraphQL contracts** — look for:

- `*.graphql` or `*.gql` files
- `schema.graphql`, `schema.gql`
- `schema_introspection.json` (introspection result)
- Files containing `type Query` or `type Mutation`

**REST contracts** — look for:

- `openapi.yaml`, `openapi.json`, `swagger.yaml`, `swagger.json`
- Files containing `paths:` with HTTP methods
- Route definition files (e.g., Express `router.get`, Django `urlpatterns`, FastAPI `@app.get`, Spring `@GetMapping`)
- If no formal spec exists, scan route/controller files to extract endpoints

If you find contract files, present them to the user with `AskUserQuestion` and ask them to confirm which one to use, or to provide a different path.

If no contracts are found, ask the user to provide the path to the contract file.

## Step 3: Determine API Type and Extract Operations

### For GraphQL:

Parse the schema and extract:

- **Queries**: all fields under `type Query` (e.g., `allStores`, `store`, `allProducts`)
- **Mutations**: all fields under `type Mutation` (e.g., `createStore`, `updateStore`, `deleteStore`)

Store these as two lists: `QUERY_FIELDS` and `MUTATION_FIELDS`.

### For REST:

Parse the spec/routes and extract:

- **Endpoints**: method + path pairs (e.g., `GET /api/stores`, `POST /api/stores`, `DELETE /api/stores/:id`)
- Group by resource and method

Store these as a list of `{method, path, name}` objects where `name` is a short label like `GET_stores` or `POST_stores`.

## Step 4: Check for Existing Dockerfile

Look for a `Dockerfile` in the application folder. If one exists, note it — you will reference it in docker-compose. If not, you will need to create one.

## Step 5: Identify the Application Stack

Detect the language/framework:

- **Python/Django**: look for `manage.py`, `settings.py`, `wsgi.py`
- **Python/FastAPI**: look for `main.py` with `FastAPI()`
- **Node/Express**: look for `package.json` with `express`
- **Java/Spring**: look for `pom.xml` or `build.gradle` with Spring dependencies
- **Go**: look for `go.mod`
- Other frameworks: adapt accordingly

This determines how to instrument metrics.

## Step 6: Generate Prometheus Metrics Instrumentation

Based on the detected stack, add Prometheus metrics collection to the application. The instrumentation must track **per-operation** metrics.

### Metrics to collect:

1. **Request counter** (`<prefix>_requests_total`) — labels: `operation_type`/`method`, `operation_name`/`endpoint`
2. **Error counter** (`<prefix>_errors_total`) — same labels
3. **Request duration histogram** (`<prefix>_request_duration_seconds`) — same labels, with buckets: `[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]`
4. **In-progress gauge** (`<prefix>_requests_in_progress`)

### For Python/Django + GraphQL (reference implementation):

Create a middleware file (e.g., `middleware.py`) that:

- Intercepts POST requests to the GraphQL endpoint
- Parses the request body to extract operation names
- Matches root-level fields against the known `QUERY_FIELDS` and `MUTATION_FIELDS`
- Records metrics per operation
- Detects errors from GraphQL response body

Add a `/metrics/` endpoint using `prometheus_client.generate_latest()`.

Add `prometheus-client` to requirements/dependencies.

Register the middleware in settings (must be the FIRST middleware).

### For Python/Django + REST:

Create a middleware that:

- Captures the resolved URL name or path pattern
- Records method + endpoint as labels
- Tracks duration, count, and errors (status >= 400)

### For Node/Express:

Create an Express middleware using `prom-client` that:

- Records metrics per route path + method
- Exposes `/metrics` endpoint

### For other stacks:

Adapt the pattern — the key requirement is per-operation/per-endpoint Prometheus metrics with the 4 metric types above.

## Step 7: Create Dockerfile (if needed)

If the application doesn't already have a Dockerfile, create one appropriate for the detected stack. It should:

- Install dependencies
- Copy the application
- Run any build/migration steps
- Expose the appropriate port
- Use a production-ready server (gunicorn for Python, etc.)

## Step 8: Generate Prometheus Configuration

Create `prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 5s
  evaluation_interval: 5s

scrape_configs:
  - job_name: "<app-name>"
    metrics_path: /metrics/
    static_configs:
      - targets: ["backend:<port>"]
```

Replace `<app-name>` with a descriptive job name and `<port>` with the application's port.

## Step 9: Generate Grafana Provisioning

### Datasource — `grafana/provisioning/datasources/datasource.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    uid: PBFA97CFB590B2093
    isDefault: true
    editable: true
```

### Dashboard provider — `grafana/provisioning/dashboards/dashboards.yml`:

```yaml
apiVersion: 1

providers:
  - name: "default"
    orgId: 1
    folder: ""
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: false
```

## Step 10: Generate the Grafana Dashboard JSON

Create `grafana/dashboards/<dashboard-name>.json`. The dashboard must be **tailored to the specific API operations** discovered in Step 3.

Use datasource UID `PBFA97CFB590B2093` for all panels.

### For GraphQL APIs, generate these panels:

**Row 1 — Overview stats (y=0, h=4):**

1. **Total Requests** (stat panel, w=6) — `sum(graphql_requests_total)`
2. **Total Errors** (stat panel, w=6) — `sum(graphql_errors_total) or vector(0)` with red threshold at 1
3. **Queries vs Mutations** (piechart, w=6) — `sum by (operation_type) (graphql_requests_total)`
4. **Requests In Progress** (stat panel, w=6) — `graphql_requests_in_progress`

**Row 2 — Request rate over time (y=4, h=9):** 5. **Requests per Operation (rate/s)** (timeseries, w=24) — `sum by (operation_name) (rate(graphql_requests_total[1m]))` with smooth lines

**Row 3 — Latency (y=13, h=9):** 6. **Response Time per Operation (avg)** (timeseries, w=12) — `rate(sum)/rate(count)` per operation_name, unit=s 7. **p95 Response Time per Operation** (timeseries, w=12) — `histogram_quantile(0.95, ...)` per operation_name, unit=s

**Row 4 — Counts (y=22, h=9):** 8. **Total Count per Operation** (bargauge, w=12, horizontal) — `sum by (operation_name) (graphql_requests_total)` 9. **Errors per Operation** (bargauge, w=12, horizontal) — `sum by (operation_name) (graphql_errors_total) > 0` with thresholds green/orange(1)/red(5)

**Row 5 — Query vs Mutation breakdown (y=31, h=8):** 10. **Query Operations - Request Rate** (timeseries/bars, w=12) — `rate(graphql_requests_total{operation_type="query"}[1m])` by operation_name 11. **Mutation Operations - Request Rate** (timeseries/bars, w=12) — `rate(graphql_requests_total{operation_type="mutation"}[1m])` by operation_name

**Row 6 — Detail table (y=39, h=10):** 12. **Operations Detail Table** (table, w=24) — Three queries merged: total requests, errors, and avg duration per (operation_type, operation_name). Use instant queries with table format. Add field overrides for display names and hide the Time column.

Dashboard settings:

- `refresh: "5s"`
- `time.from: "now-15m"`
- `schemaVersion: 39`
- Tags based on the API type (e.g., `["graphql", "django"]`)
- `graphTooltip: 1` (shared crosshair)

### For REST APIs, generate these panels:

**Row 1 — Overview stats (y=0, h=4):**

1. **Total Requests** (stat) — `sum(http_requests_total)`
2. **Total Errors** (stat) — `sum(http_requests_total{status=~"4..|5.."}) or vector(0)`
3. **Requests by Method** (piechart) — `sum by (method) (http_requests_total)`
4. **Requests In Progress** (stat) — `http_requests_in_progress`

**Row 2 — Request rate (y=4, h=9):** 5. **Requests per Endpoint (rate/s)** (timeseries, w=24) — `sum by (endpoint) (rate(http_requests_total[1m]))`

**Row 3 — Latency (y=13, h=9):** 6. **Response Time per Endpoint (avg)** (timeseries, w=12) 7. **p95 Response Time per Endpoint** (timeseries, w=12)

**Row 4 — Counts (y=22, h=9):** 8. **Total Count per Endpoint** (bargauge, w=12) 9. **Errors per Endpoint** (bargauge, w=12)

**Row 5 — Method breakdown (y=31, h=8):** 10. **GET Endpoints - Request Rate** (timeseries/bars, w=12) 11. **Write Endpoints (POST/PUT/DELETE) - Request Rate** (timeseries/bars, w=12)

**Row 6 — Detail table (y=39, h=10):** 12. **Endpoints Detail Table** (table, w=24) — method, endpoint, total requests, errors, avg duration

## Step 11: Generate docker-compose.yml

Create `docker-compose.yml` at the project root (or the location the user specifies):

```yaml
services:
  backend:
    build: ./<app-folder>
    ports:
      - "<port>:<port>"
    healthcheck:
      test:
        [
          "CMD",
          "python",
          "-c",
          "import urllib.request; urllib.request.urlopen('http://localhost:<port>/metrics/')",
        ]
      interval: 10s
      timeout: 5s
      retries: 3

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    depends_on:
      backend:
        condition: service_healthy

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus
```

Adapt the healthcheck command to the application's language/runtime. For Node: use `wget` or `curl`. For Go: use `wget`.

## Step 12: Final Summary

After generating all files, print a summary:

```
## Grafana Dashboard Generated

**API Type:** GraphQL / REST
**Operations monitored:** <count> queries, <count> mutations (or <count> endpoints)

### Files created:
- `prometheus/prometheus.yml` — Prometheus scrape config
- `grafana/provisioning/datasources/datasource.yml` — Prometheus datasource
- `grafana/provisioning/dashboards/dashboards.yml` — Dashboard provider
- `grafana/dashboards/<name>.json` — Dashboard with <N> panels
- `docker-compose.yml` — Orchestrates backend + Prometheus + Grafana
- `<middleware file>` — Prometheus metrics instrumentation (if created)
- `Dockerfile` (if created)

### To run:
docker compose up --build

### Access:
- Application: http://localhost:<port>
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (anonymous access enabled)
```
