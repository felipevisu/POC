# LLM Temperature POC

Runs the same prompts several times at different temperatures and measures how the outputs change.

## Tasks

| Task | What it shows |
|---|---|
| `factual` | Accuracy should stay high at low temperature |
| `creative` | Diversity should grow with temperature |
| `json` | Format may break at high temperature |

## Metrics

- **distinct_ratio**: unique outputs / total runs
- **avg_similarity**: mean pairwise text similarity (`difflib`)
- **accuracy**: share of answers containing "Canberra" (factual task)
- **valid_json**: share of outputs that parse as JSON (json task)

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set your `OPENAI_API_KEY`. You can also set `MODEL` and `REASONING_EFFORT` there; CLI flags override them. `.env` is in `.gitignore`, so the key is not committed.

## Run

```bash
# Default: gpt-4.1-mini, 10 runs, temperatures 0 / 0.5 / 1.0 / 1.5
python temperature_poc.py

# GPT-5.1+ only accepts temperature with reasoning effort "none"
# (or set MODEL / REASONING_EFFORT in .env)
python temperature_poc.py --model gpt-5.2 --reasoning-effort none

# Custom settings
python temperature_poc.py --runs 20 --temperatures 0 0.7 1.4 2.0
```

Cost: 3 tasks × 4 temperatures × 10 runs = 120 short calls per default run.

## Output

- `results_raw.csv`: every output (task, temperature, run, output)
- `results_summary.csv`: metrics per task and temperature

## Notes

- `gpt-4.1-mini` is scheduled for removal from the OpenAI API on 2027-01-14. Pass `--model` to switch.
- Even at `temperature=0`, outputs are not guaranteed to be identical.