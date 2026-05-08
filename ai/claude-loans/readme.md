# claude-loans

Port of [`openrouter-loans`](../openrouter-loans) that drops the OpenRouter Agent SDK and talks to the Anthropic API directly using `@anthropic-ai/sdk`. Same four tools, same frontend, same Postgres schema — just a hand-rolled tool loop instead of an agent framework.

## Stack

- **Postgres 16** — stores the `loans` table, seeded from `init.sql`
- **Express backend** — exposes `POST /api/ask`, runs an Anthropic tool-use loop against Claude
- **Static frontend** — single `index.html` served by nginx, with `/api/*` proxied to the backend; renders charts with [Chart.js](https://www.chartjs.org/)
- All three run via `docker compose`

No OpenRouter, no Zod — JSON Schema is fed straight into `messages.create`.

## Schema

```sql
loans (
  id       SERIAL PRIMARY KEY,
  grade    TEXT    -- p1, p2, p3, p4, p5
  fico     INTEGER -- 0..1000
  term     INTEGER -- 12, 24, 32, 48, 64
  amount   NUMERIC -- > 0
  month    INTEGER -- 0..12
  year     INTEGER -- > 2020
  category TEXT    -- automobile, health, travel, business, house
)
```

20 seed rows covering every grade and category.

## Layout

```
.
├── docker-compose.yml      # postgres + backend + frontend
├── init.sql                # schema + seed data
├── backend/
│   ├── Dockerfile
│   ├── server.js           # Express + Anthropic SDK tool loop + pg
│   ├── package.json
│   └── .env                # ANTHROPIC_API_KEY, DATABASE_URL (local dev)
└── frontend/
    ├── Dockerfile          # nginx
    ├── nginx.conf          # serves index.html, proxies /api/* to backend
    └── index.html
```

## Configure

Create `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgres://loans:loans@localhost:5433/loans
CLAUDE_MODEL=claude-sonnet-4-6
```

`CLAUDE_MODEL` is optional and defaults to `claude-sonnet-4-6`.

## Run

```bash
docker compose up -d --build
```

Then open http://localhost:8081.

| Service  | URL                              |
| -------- | -------------------------------- |
| Frontend | http://localhost:8081            |
| Backend  | http://localhost:3002            |
| Postgres | postgres://localhost:5433        |

Ports are shifted from `openrouter-loans` (8080/3001/5432) so both stacks can run side by side.

Tear it down (and wipe the database volume):

```bash
docker compose down -v
```

## How it works

1. The frontend posts a question to `POST /api/ask`.
2. The backend seeds `messages = [{ role: "user", content: question + chart hint }]` and calls `anthropic.messages.create({ model, tools, messages })`.
3. While `stop_reason === "tool_use"`:
   - For every `tool_use` block in `response.content`, the dispatcher runs the matching tool (`list_tables`, `describe_table`, `run_query`, `render_chart`) and produces a `tool_result` block.
   - The assistant turn and the bundled `tool_result`s are appended back to `messages`, then the loop calls `messages.create` again.
4. When the model stops with `end_turn`, the final text blocks are joined and returned.
5. Tool calls are traced on a request-scoped array; `render_chart` captures its spec on a request-scoped variable.
6. The backend returns `{ answer, toolCalls, chart }` as JSON.
7. The frontend renders the tool calls, the answer, and (if present) a Chart.js visualization below the answer.

`run_query` rejects anything that isn't a `SELECT`, so the agent can't write to the database. `render_chart` supports `bar`, `line`, `pie`, and `doughnut`. The loop bails after `MAX_STEPS` iterations to bound runaway behavior.

## Sample questions to try

- What is the average loan amount per grade?
- Which category has the highest total exposure?
- List all loans with FICO below 600.
- How many loans were originated each year?
- For house loans, what's the FICO distribution by term?
- Are there any p5 loans with FICO above 700 (potential mis-grading)?
