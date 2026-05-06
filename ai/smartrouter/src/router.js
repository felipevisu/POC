// Smart router: classify a prompt into a bucket, then pick the best model for it.
// Pricing in USD per 1M tokens (input / output) — update if OpenRouter changes them.

export const BUCKETS = {
  code: {
    label: "Code",
    model: "anthropic/claude-sonnet-4.5",
    inPrice: 3,
    outPrice: 15,
    description: "Programming, debugging, refactoring",
    color: "#22c55e",
  },
  creative: {
    label: "Creative",
    model: "anthropic/claude-opus-4.7",
    inPrice: 15,
    outPrice: 75,
    description: "Writing, storytelling, brainstorming",
    color: "#ec4899",
  },
  reasoning: {
    label: "Reasoning",
    model: "deepseek/deepseek-r1",
    inPrice: 0.55,
    outPrice: 2.19,
    description: "Math, logic, multi-step problems",
    color: "#3b82f6",
  },
  factual: {
    label: "Factual",
    model: "google/gemini-2.5-flash",
    inPrice: 0.075,
    outPrice: 0.3,
    description: "Quick facts, definitions, lookups",
    color: "#06b6d4",
  },
  long_doc: {
    label: "Long Doc",
    model: "google/gemini-2.5-pro",
    inPrice: 1.25,
    outPrice: 10,
    description: "Large context analysis & summarization",
    color: "#f59e0b",
  },
  chitchat: {
    label: "Chitchat",
    model: "meta-llama/llama-3.3-70b-instruct",
    inPrice: 0.12,
    outPrice: 0.3,
    description: "Casual conversation, small talk",
    color: "#a855f7",
  },
};

// Baseline: cost if we always used the most expensive option.
export const BASELINE = {
  label: "Always Opus 4.7",
  model: "anthropic/claude-opus-4.7",
  inPrice: 15,
  outPrice: 75,
};

export const CLASSIFIER_MODEL = "google/gemini-2.5-flash";
export const CLASSIFIER_PRICE = { in: 0.075, out: 0.3 };

const CLASSIFIER_SYSTEM = `You are a prompt classifier. Read the user prompt and reply with EXACTLY ONE of these bucket names — no punctuation, no explanation, no extra words:

code      — programming, debugging, code review, refactoring, regex, shell
creative  — fiction, poetry, marketing copy, brainstorming, ideation
reasoning — math, logic puzzles, multi-step proofs, planning
factual   — quick factual questions, definitions, lookups, single-shot facts
long_doc  — analyzing/summarizing a long pasted document or transcript (>1000 words)
chitchat  — greetings, small talk, casual back-and-forth

Reply with only the bucket name.`;

export function estimateCost(usage, prices) {
  if (!usage) return 0;
  const inTok = usage.inputTokens ?? usage.input_tokens ?? 0;
  const outTok = usage.outputTokens ?? usage.output_tokens ?? 0;
  return (inTok * prices.in + outTok * prices.out) / 1_000_000;
}

export function bucketCost(usage, bucket) {
  return estimateCost(usage, { in: bucket.inPrice, out: bucket.outPrice });
}

export function emptyStats() {
  return {
    total: 0,
    baseline: 0,
    classifier: 0,
    queries: 0,
    byBucket: Object.fromEntries(
      Object.keys(BUCKETS).map((k) => [k, { count: 0, cost: 0 }]),
    ),
  };
}

export function baselineCost(usage) {
  return estimateCost(usage, { in: BASELINE.inPrice, out: BASELINE.outPrice });
}

// Heuristic pre-pass — catches obvious cases before paying classifier.
function heuristicBucket(text) {
  const t = text.trim();
  if (t.length > 4000) return "long_doc";
  if (/```|\bfunction\b|\bclass\b|\bimport\s|\bconst\s|\bdef\s|=>|;\s*$/m.test(t)) {
    return "code";
  }
  return null;
}

// Cheap-classifier call. Falls back to "factual" on parse miss.
export async function classifyPrompt(client, text) {
  const fast = heuristicBucket(text);
  if (fast) {
    return { bucket: fast, raw: `(heuristic) ${fast}`, usage: {}, cost: 0 };
  }

  const result = client.callModel({
    model: CLASSIFIER_MODEL,
    instructions: CLASSIFIER_SYSTEM,
    input: text,
    temperature: 0,
    maxOutputTokens: 8,
  });

  const response = await result.getResponse();
  const rawText =
    response.outputText ??
    (response.output ?? [])
      .flatMap((m) => m.content ?? [])
      .filter((c) => c?.type === "output_text")
      .map((c) => c.text)
      .join("") ??
    "";

  const normalized = rawText
    .toLowerCase()
    .replace(/[*_`"'.,]/g, "")
    .replace(/[\s-]+/g, "_");
  const match = normalized.match(
    /\b(code|creative|reasoning|factual|long_doc|chitchat)\b/,
  );
  const bucket = match ? match[1] : "factual";

  const usage = response.usage ?? {};
  const cost = estimateCost(usage, CLASSIFIER_PRICE);

  if (typeof window !== "undefined") {
    console.log("[router] classify →", { bucket, rawText, normalized });
  }

  return { bucket, raw: rawText, usage, cost };
}
