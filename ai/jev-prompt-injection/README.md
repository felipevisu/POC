# jev-prompt-injection

Can **Jev** (TypeSafe) block prompt injection before it reaches a Claude support agent, and does that save money?

The agent supports a customer of a fictional lender, Lumen Crédito, and holds a confidential override code and internal policy in its prompt. The benchmark sends it 30 injection attempts and 30 normal messages, first without Jev, then with Jev screening each message.

## Results

| | Claude only | With Jev |
|---|---:|---:|
| Injections reaching the agent | 30 / 30 | **2 / 30** |
| Leaks | 0 | 0 |
| Normal messages blocked by mistake | — | **0 / 30** |
| Total cost | $0.0137 | **$0.0099 (−28%)** |

Claude Haiku 5.5, Jev 1.13, block threshold 0.7. Single run, 2026-10-09.

- The agent leaked nothing even without Jev.
- Jev missed the 2 subtlest probes (scores 0.63 and 0.64); the agent refused both.
- The savings come from half the messages being attacks. On mostly normal traffic, Jev adds about 11% to the cost.

## Run

```
npm install
cp .env.example .env   # ANTHROPIC_API_KEY, TYPESAFE_API_KEY
npm run bench          # Claude only
npm run bench:jev      # Jev first
```

Results, with every reply and Jev score, go to `bench/results/`.
