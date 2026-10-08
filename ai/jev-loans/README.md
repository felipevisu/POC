# jev-loans

An experiment: **can jev (`typesafe-ai/jev`) pick which tool an agent should call better than the agent picks for itself?**

The same Claude agent runs a loan-hiring conversation in two modes:

- **direct** — the chat model sees all tools and decides on its own which one to call at each step.
- **jev** — before each step, `typesafe-ai/jev` reads the conversation and the tool descriptions and picks the next action (a tool, or "just reply"). The chat model then executes that choice.

Both modes run against the same scripted conversations, and we compare whether the right tools were called, in the right order and on the right turn, plus cost and latency.

## Context: a personal-loan system

Everything is mocked (`src/loans.js`): customers, credit bureau, offers with real math (Price table, IOF, CET), contracts and PIX payout. The agent is the chat assistant of a fictional bank, Lumen Crédito.

Taking out a loan is a strict sequence, which is what makes tool choice interesting: skipping or reordering a step is a real bug (showing credit data before identity is verified, signing a contract the customer never confirmed).

```
CPF → find_customer / register_customer → send_verification_code → verify_identity
    → run_credit_analysis → simulate_loan (n×) → submit_income_proof (if required)
    → create_contract (after explicit confirmation + PIX key) → sign_contract (SMS code)
```

### Tools

| Tool | What it does |
|---|---|
| `get_loan_info` | product rules: amounts, rates by risk tier, taxes, process |
| `find_customer` | looks up the customer by CPF, starts the session |
| `register_customer` | registers a new customer (name, birth date, phone, e-mail, income) |
| `send_verification_code` | sends an SMS code to verify identity |
| `verify_identity` | checks the code the customer typed (3 wrong attempts lock it) |
| `update_income` | updates monthly income, invalidates the credit analysis |
| `run_credit_analysis` | bureau + policy: approved (tier, rate, limits) or denied |
| `simulate_loan` | amount × installments → offer with monthly payment, CET, total |
| `submit_income_proof` | registers a payslip / statement when the offer requires it |
| `create_contract` | contract from an offer + PIX key, sends a signing code |
| `sign_contract` | signs with the SMS code and pays out via PIX |
| `list_my_loans` | the customer's loans |
| `get_installment_schedule` | full schedule of one loan |
| `quote_early_payoff` | payoff amount today and interest saved |
| `cancel_loan` | 7-day right of withdrawal |
| `escalate_to_human` | hands off to a person (complaints, locked identity, out of scope) |

### Example conversation

Ana (CPF 111.111.111-11, good score) wants R$ 5,000. Tool calls in brackets; numbers are illustrative.

> **Customer:** Hi, I need R$ 5000 to fix my car. My CPF is 111.111.111-11
> `[find_customer] [send_verification_code]`
> **Agent:** Hi Ana! I sent a 6-digit code by SMS to your phone ending in 1111. Can you type it here?
>
> **Customer:** The code is 123456
> `[verify_identity] [run_credit_analysis]`
> **Agent:** Verified ✅ You're pre-approved for up to R$ 50,000 at 1.49%/month. How many installments would you like?
>
> **Customer:** Simulate 5000 in 12 and in 24 installments
> `[simulate_loan] [simulate_loan]`
> **Agent:** 12× R$ 473.60 (CET 21.9%/yr, total R$ 5,683) or 24× R$ 258.30 (total R$ 6,199). Which one?
>
> **Customer:** The 12 installments. PIX key ana@example.com, go ahead.
> `[create_contract]`
> **Agent:** Contract created. I sent a signing code by SMS — type it to sign and receive the money.
>
> **Customer:** 123456
> `[sign_contract]`
> **Agent:** Signed! R$ 5,000 is on its way to ana@example.com. First installment due in 30 days.

## Setup

```bash
npm install
cp .env.example .env   # set AI_GATEWAY_API_KEY (or put it in ../.env)
```

`.env` options: `CHAT_MODEL` (default `anthropic/claude-haiku-4.5`), `ROUTER=off` to start the chat with jev off, `CACHE=on` to start it with prompt caching on.

## Services

| Service | How to start | URL | Costs money? |
|---|---|---|---|
| Chat with the agent | `npm start` | http://localhost:4748 | yes, per message |
| Eval replay | `npm start` (same server) | http://localhost:4748/results | no, reads saved runs |
| promptfoo report | `npm run eval:view` | http://localhost:15500 | no |
| Benchmark | `npm run eval` | — | **yes** |
| Domain tests | `npm test` | — | no |

In the chat, checkboxes toggle jev and prompt cache per message. The SMS code is always **`123456`**. Test customers:

| CPF | Customer | Scenario |
|---|---|---|
| 111.111.111-11 | Ana | tier A, up to R$ 50k |
| 222.222.222-22 | Bruno | small monthly budget |
| 333.333.333-33 | Carla | credit restriction, denied |
| 444.444.444-44 | Diego | already has an active loan |
| any other | — | registration flow |

## Running the benchmark

10 scripted scenarios (`eval/scenarios.js`) × each model with and without jev. **Every run calls the models and costs money** (full suite ≈ $4–5, 20–25 min).

```bash
npm run eval -- -n 1 --providers haiku              # first scenario only (cheap smoke test)
npm run eval -- --providers sonnet                  # sonnet and sonnet+jev
npm run eval -- --providers sonnet --enable-cache   # same, with prompt caching
npm run eval                                        # haiku, sonnet and opus
npm run eval:summary                                # summary of the latest run
```

Runs are saved to `eval/runs/<date_time>.json` and show up in the replay at `/results`.

## Results

One run per model and cache setting, 10 scenarios each (runs from 2026-09-28, in `eval/runs/`). Cost is the total for the 10 scenarios, chat + jev.

### Without prompt cache

| Model | Mode | Pass | Right turn | Cost | Avg time / scenario |
|---|---|---|---|---|---|
| Haiku 4.5 | direct | 9/10 | 9/10 | $0.33 | 11.5 s |
| Haiku 4.5 | jev | 9/10 | 9/10 | $0.26 | 15.9 s |
| Sonnet 5.5 | direct | 10/10 | 10/10 | $0.79 | 13.2 s |
| Sonnet 5.5 | jev | 10/10 | 10/10 | $0.35 | 19.2 s |
| Opus 5.5 | direct | 9/10 | 9/10 | $1.69 | 24.7 s |
| Opus 5.5 | jev | 8/10 | 8/10 | $0.70 | 32.4 s |

### With prompt cache

| Model | Mode | Pass | Right turn | Cost | Avg time / scenario | Input from cache |
|---|---|---|---|---|---|---|
| Haiku 4.5 | direct | 9/10 | 9/10 | $0.29 | 13.0 s | 15% |
| Haiku 4.5 | jev | 9/10 | 9/10 | $0.25 | 16.2 s | 6% |
| Sonnet 5.5 | direct | 10/10 | 10/10 | $0.19 | 14.2 s | 95% |
| Sonnet 5.5 | jev | 10/10 | 10/10 | $0.30 | 17.7 s | 38% |
| Opus 5.5 | direct | 9/10 | 9/10 | $0.40 | 25.3 s | 94% |
| Opus 5.5 | jev | 7/10 | 8/10 | $0.62 | 31.7 s | 38% |

### Failures

| Scenario | Failed in |
|---|---|
| `withdrawal_cancel` | Haiku direct and jev, both runs |
| `otp_lockout` | Opus direct and jev, both runs |
| `existing_loan_payoff` | Opus jev, both runs |
| `happy_path` | Opus jev, with cache (75 s, over the 60 s limit) |

