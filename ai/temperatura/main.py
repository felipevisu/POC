"""
LLM temperature POC.

Runs the same prompts many times at different temperatures and measures how
much the outputs vary (diversity, similarity, accuracy, format validity).

Usage:
    cp .env.example .env   # then set OPENAI_API_KEY
    python temperature_poc.py
    python temperature_poc.py --model gpt-5.2 --reasoning-effort none
    python temperature_poc.py --runs 20 --temperatures 0 0.7 1.4 2.0
"""

import argparse
import csv
import difflib
import itertools
import json
import os
import statistics
import time

from dotenv import load_dotenv
from openai import BadRequestError, OpenAI

load_dotenv()  # reads OPENAI_API_KEY (and optional MODEL) from .env

PROMPTS = {
    "factual": "What is the capital of Australia? Answer with the name only.",
    "creative": "Write a short slogan for a coffee shop. Reply with the slogan only.",
    "json": (
        'Classify the sentiment of "The product arrived broken". '
        'Reply with JSON only: {"sentiment": "positive|negative|neutral"}'
    ),
}


def parse_args():
    parser = argparse.ArgumentParser(description="LLM temperature POC")
    parser.add_argument("--model", default=os.getenv("MODEL", "gpt-4.1-mini"))
    parser.add_argument(
        "--reasoning-effort",
        default=os.getenv("REASONING_EFFORT") or None,
        help='For GPT-5.1+ models, set to "none" so temperature is accepted.',
    )
    parser.add_argument("--runs", type=int, default=10)
    parser.add_argument(
        "--temperatures", type=float, nargs="+", default=[0.0, 0.5, 1.0, 1.5]
    )
    parser.add_argument("--max-tokens", type=int, default=100)
    parser.add_argument("--raw-output", default="results_raw.csv")
    parser.add_argument("--summary-output", default="results_summary.csv")
    return parser.parse_args()


def generate(client, args, prompt, temperature):
    params = {
        "model": args.model,
        "temperature": temperature,
        "messages": [{"role": "user", "content": prompt}],
    }
    if args.reasoning_effort:
        # Reasoning models use max_completion_tokens instead of max_tokens.
        params["reasoning_effort"] = args.reasoning_effort
        params["max_completion_tokens"] = args.max_tokens
    else:
        params["max_tokens"] = args.max_tokens

    response = client.chat.completions.create(**params)
    return (response.choices[0].message.content or "").strip()


def is_valid_json(text):
    try:
        json.loads(text)
        return True
    except json.JSONDecodeError:
        return False


def average_similarity(outputs):
    pairs = list(itertools.combinations(outputs, 2))
    if not pairs:
        return 1.0
    return statistics.mean(
        difflib.SequenceMatcher(None, a, b).ratio() for a, b in pairs
    )


def summarize(task, temperature, outputs):
    row = {
        "task": task,
        "temperature": temperature,
        "runs": len(outputs),
        "distinct_ratio": round(len(set(outputs)) / len(outputs), 3),
        "avg_similarity": round(average_similarity(outputs), 3),
        "accuracy": "",
        "valid_json": "",
    }
    if task == "factual":
        row["accuracy"] = round(
            sum("canberra" in o.lower() for o in outputs) / len(outputs), 3
        )
    elif task == "json":
        row["valid_json"] = round(sum(map(is_valid_json, outputs)) / len(outputs), 3)
    return row


def run(client, args):
    raw_rows, summary_rows = [], []

    for task, prompt in PROMPTS.items():
        for temp in args.temperatures:
            outputs = []
            for i in range(args.runs):
                try:
                    text = generate(client, args, prompt, temp)
                except BadRequestError as e:
                    raise SystemExit(
                        f"Model {args.model!r} rejected temperature={temp}: {e}\n"
                        "Try another model, or --reasoning-effort none for GPT-5.1+."
                    )
                outputs.append(text)
                raw_rows.append(
                    {"task": task, "temperature": temp, "run": i + 1, "output": text}
                )
            row = summarize(task, temp, outputs)
            summary_rows.append(row)
            print_row(row)

    return raw_rows, summary_rows


def print_row(row):
    extra = ""
    if row["accuracy"] != "":
        extra = f"accuracy={row['accuracy']:.0%}"
    elif row["valid_json"] != "":
        extra = f"valid_json={row['valid_json']:.0%}"
    print(
        f"{row['task']:9} T={row['temperature']:.1f}  "
        f"distinct={row['distinct_ratio']:.0%}  "
        f"similarity={row['avg_similarity']:.2f}  {extra}"
    )


def write_csv(path, rows):
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def main():
    args = parse_args()
    if not os.getenv("OPENAI_API_KEY"):
        raise SystemExit(
            "OPENAI_API_KEY not found. Copy .env.example to .env and set it."
        )
    client = OpenAI()

    print(f"Model: {args.model}  runs={args.runs}  temperatures={args.temperatures}\n")
    start = time.time()
    raw_rows, summary_rows = run(client, args)

    write_csv(args.raw_output, raw_rows)
    write_csv(args.summary_output, summary_rows)
    print(
        f"\nDone in {time.time() - start:.0f}s. "
        f"Saved {args.raw_output} and {args.summary_output}."
    )


if __name__ == "__main__":
    main()
