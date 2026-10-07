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
CACHE=on                               # prompt cache on by default in the chat (evals use --enable-cache instead)
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
- **prompt cache** checkbox: turns prompt caching on/off per message (see [Prompt caching](#prompt-caching)).
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

`eval/promptfooconfig.yaml` defines 6 providers × 10 scenarios (`eval/scenarios.js`): each model with and without jev.

| Providers | Model |
|---|---|
| `haiku`, `haiku+jev` | anthropic/claude-haiku-4.5 |
| `sonnet`, `sonnet+jev` | anthropic/claude-sonnet-5.5 |
| `opus`, `opus+jev` | anthropic/claude-opus-5.5 |

> ⚠️ **Every run calls the models and costs money.** Scenarios run one at a time (the mock backend is shared in-memory state).
> Reference from earlier runs, per provider over the 10 scenarios: Haiku ≈ $0.25 and ~2–3 min; Opus ≈ $1.60 and ~5 min.
> Measured without cache over the 10 scenarios: Sonnet ≈ $0.79, Sonnet+jev ≈ $0.35. The full suite with all 6 providers should land around **$4–5 and 20–25 min** (estimate).

Options: `--providers <model>` runs that model with and without jev (`haiku`, `sonnet` or `opus`; comma-separate for more), `--enable-cache` turns prompt caching on, `-n N` runs only the first N scenarios.

```bash
npm run eval -- --providers sonnet                  # sonnet and sonnet+jev, no cache
npm run eval -- --providers sonnet --enable-cache   # sonnet and sonnet+jev, with cache
npm run eval -- --providers haiku                   # haiku and haiku+jev
npm run eval -- --providers opus                    # opus and opus+jev
npm run eval                                        # all three models
npm run eval -- -n 1 --providers opus               # first scenario only (cheap test)
```

### Prompt caching

Off by default. Add `--enable-cache` to turn it on for every provider in the run; the run file gets a `_cache` suffix (`eval/runs/<date_time>_cache.json`) so cached and uncached runs are easy to tell apart in the replay selector. Compare, for example, `npm run eval -- --providers sonnet` with `npm run eval -- --providers sonnet --enable-cache`.

It uses the AI Gateway's automatic caching (`providerOptions.gateway.caching: 'auto'`) on the chat model only; jev is not cached. The summary shows `cache` and `input_from_cache`, and cost already reflects cache pricing (writes ~1.25× the input price, reads ~0.1×). `CACHE=on` in `.env` only sets the chat's default and never affects evals.

What to expect:

- **Haiku 4.5 only caches prompts of at least 4,096 tokens.** Its average call here is ~3,400 tokens (~2,500 with jev), so most Haiku calls won't cache at all. Sonnet 5.5 and Opus 5.5 cache from 512 tokens.
- **Changing the tool list breaks the cache.** Tool definitions come first in the cached prefix, and jev narrows or drops them per step, so jev modes get fewer cache hits than direct mode.
- **Scenarios share the cache.** They run one after another with the same instructions and tools, so later scenarios can read what earlier ones wrote (entries live 5 minutes). That's realistic for production traffic, but it makes cost depend a little on run order.

Don't confuse this with `--no-cache` in the eval script: that disables promptfoo's own result cache, so every run really calls the models.

### Results

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
  run.js                `npm run eval` runner: handles --providers and --enable-cache, names the run file, prints the summary
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
