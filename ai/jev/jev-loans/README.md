# jev-loans

POC of a personal-loan agent (everything mocked) that chats with the customer and takes out loans through tools, with a benchmark **with and without the jev router** across several Claude models.

## Setup

```bash
npm install
```

The AI Gateway key comes from `../.env` (`AI_GATEWAY_API_KEY`, shared with the cervejaria POC). A `.env` in this folder overrides `../.env`, for example the chat model:

```bash
# .env (optional)
CHAT_MODEL=anthropic/claude-opus-5.5   # default: anthropic/claude-haiku-4.5
ROUTER=off                             # jev off by default in the chat
```

## Services

| Service | How to start | URL | Costs money? |
|---|---|---|---|
| Chat with the agent | `npm start` | http://localhost:4748 | yes, per message sent |
| Eval replay (chat format) | `npm start` (same server) | http://localhost:4748/results | no, it only reads files |
| promptfoo report | `npm run eval:view` | http://localhost:15500 | no |
| Run the benchmark | `npm run eval` | — | **yes** (see below) |
| Domain tests (rules and math) | `npm test` | — | no |

### Chat — http://localhost:4748

- **route with jev** checkbox at the top: turns jev on/off per message.
- Side panel: test customers (click to fill in), current step of the process, loans, and running metrics (time, tokens, cost) per mode.
- The SMS code is always **`123456`**.

Test customers:

| CPF | Customer | Scenario |
|---|---|---|
| 111.111.111-11 | Ana | score 820, income R$ 9k — tier A, up to R$ 50k |
| 222.222.222-22 | Bruno | score 640, income R$ 3.5k — small monthly budget |
| 333.333.333-33 | Carla | credit restriction — denied |
| 444.444.444-44 | Diego | already has an active loan — reduced budget, early payoff |
| any other | — | registration flow |

### Eval replay — http://localhost:4748/results

- The selector at the top picks the run (every `npm run eval` is saved in `eval/runs/`).
- Summary table: per provider, scenarios passed, right order, right turn, total cost, cost per pass and average time.
- Left: the scenarios with ✓/✗ per provider. Right: each provider's conversation side by side, one row per turn, scrolling together.
- Each column shows the model, cost (chat + router), time, the checks that failed, and the expected tool sequence (missing tools struck through in red).
- In the conversation, turns with a timing rule show ✓ **right turn** or what went wrong; the red **Expected here but missing** box marks where an expected tool was **not called** or **called out of order**. Click a turn's tool line to see each call's input and output.

### promptfoo — http://localhost:15500

`npm run eval:view` opens promptfoo's standard report with every run so far (promptfoo keeps its history in `~/.promptfoo`).

## Benchmark

`eval/promptfooconfig.yaml` defines 6 providers × 10 scenarios (`eval/scenarios.js`):

| Provider | Model | jev |
|---|---|---|
| `haiku` / `haiku+jev` | anthropic/claude-haiku-4.5 | no / yes |
| `sonnet` / `sonnet+jev` | anthropic/claude-sonnet-5.5 | no / yes |
| `opus` / `opus+jev` | anthropic/claude-opus-5.5 | no / yes |

> ⚠️ **Every run calls the models and costs money.** Scenarios run one at a time (the mock backend is shared in-memory state).
> Reference from earlier runs, per provider over the 10 scenarios: Haiku ≈ $0.25 and ~2–3 min; Opus ≈ $1.60 and ~5 min.
> The full suite with all 6 providers should land around **$4–5 and 20–25 min** (estimate; Sonnet hasn't been measured yet).

```bash
npm run eval                                              # everything: 6 providers × 10 scenarios
npm run eval -- --filter-providers 'haiku'                # haiku and haiku+jev only (regex on the label)
npm run eval -- --filter-providers '^(sonnet|sonnet\+jev)$'
npm run eval -- --filter-pattern happy_path               # one scenario, all providers
npm run eval -- -n 1 --filter-providers 'opus\+jev'       # first scenario, one provider (cheap test)
npm run eval -- --repeat 3                                # repeat each test 3× (steadier numbers)
```

When it finishes, the run is saved to `eval/runs/<date_time>.json` and the summary is printed. To see the summary of an earlier run again:

```bash
npm run eval:summary                                      # latest run
npm run eval:summary -- eval/runs/<date_time>.json
```

A scenario **passes** when every check passes:

| Check | What it verifies |
|---|---|
| `tool_order` (lenient) | the expected tools appear in order across the whole conversation (extra calls in between are allowed) |
| `turn_order` (strict) | on each turn with a rule, the right tools were called **in that turn** (`expect`) and no forbidden one was (`forbid`), e.g. no credit analysis before the SMS code, no cancelling without confirmation |
| `final_state` | the mock backend ends in the right state (e.g. the loan signed is the offer the customer chose, paid to the PIX key they gave) |
| `cost` / `latency` | under $0.50 and under 60 s per scenario (a guard against runaway loops) |

Per-turn rules live in `eval/scenarios.js`: a turn is either the customer's text, or `{ say, expect, forbid }` where timing matters. The summary and the replay show **Right order** and **Right turn** separately, to compare the lenient view with the strict one. Tool errors and jev routes the model ignored (`route_ignored`) show up in the metrics but don't fail a scenario.

## Structure

```
src/
  loans.js     mock backend: customers, credit bureau, offers (Price table, IOF, CET), contracts, PIX
  agent.js     agent tools, jev routing (on/off, forced/soft), time/token/cost metrics
  server.js    HTTP server: chat, replay and saved runs
public/
  chat.html    chat UI
  results.html eval replay UI
eval/
  promptfooconfig.yaml  providers (model × jev) and checks
  scenarios.js          the 10 scripted scenarios
  provider.js           promptfoo custom provider
  summary.js            cost/pass table per provider
  runs/                 one run per file (gitignored)
test/
  loans.test.js             domain tests (no model calls)
  turn-check.test.js        per-turn rule and scenario tool names
  scenarios-oracle.test.js  a scripted "ideal agent" passes every scenario on the real backend (proves the scenarios are passable)
  history.test.js           the next turn receives earlier tool calls and results (mock model, no API calls)
```

## How jev fits in

Without jev, the chat model picks which tool to call on its own. With jev, at each step `typesafe-ai/jev` picks the next action, applied in one of two ways (`jev_routing`, shown in the replay):

- **forced** (default, Haiku): `toolChoice` makes the model call exactly the chosen tool.
- **soft** (Sonnet 5.5 and Opus 5.5): they ignore a forced `toolChoice` through the gateway and the SDK aborts the turn, so they only see the chosen tool and may answer in text instead; when they do, that counts as `route_ignored`. The list lives in `SOFT_ROUTING_MODELS` in `src/agent.js`.
