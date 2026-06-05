import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const MAX_STEPS = 20;

const TOOLS = [
  {
    name: "list_tables",
    description: "List all tables in the public schema.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "describe_table",
    description: "Get the column schema of a table.",
    input_schema: {
      type: "object",
      properties: {
        table: { type: "string" },
      },
      required: ["table"],
      additionalProperties: false,
    },
  },
  {
    name: "run_query",
    description:
      "Run a read-only SQL SELECT query and return the rows. Reject anything that isn't SELECT.",
    input_schema: {
      type: "object",
      properties: {
        sql: { type: "string" },
      },
      required: ["sql"],
      additionalProperties: false,
    },
  },
  {
    name: "render_chart",
    description:
      "Render a chart that visualizes the answer. Call this AFTER you have the data and only when a chart helps (comparisons across categories, trends over time, distributions). Skip it for single-value answers or unstructured lists.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["bar", "line", "pie", "doughnut"] },
        title: { type: "string" },
        xLabel: { type: "string" },
        yLabel: { type: "string" },
        labels: { type: "array", items: { type: "string" } },
        datasets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              data: { type: "array", items: { type: "number" } },
            },
            required: ["label", "data"],
            additionalProperties: false,
          },
        },
      },
      required: ["type", "title", "labels", "datasets"],
      additionalProperties: false,
    },
  },
];

function makeDispatcher({ trace, setChart }) {
  return async function dispatch(name, input) {
    trace(name, input ?? {});
    switch (name) {
      case "list_tables": {
        const { rows } = await pool.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        return rows;
      }
      case "describe_table": {
        const { rows } = await pool.query(
          `SELECT column_name, data_type, is_nullable
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1
           ORDER BY ordinal_position`,
          [input.table]
        );
        return rows;
      }
      case "run_query": {
        if (!/^\s*select\b/i.test(input.sql)) {
          throw new Error("Only SELECT allowed.");
        }
        const { rows } = await pool.query(input.sql);
        return rows;
      }
      case "render_chart": {
        setChart(input);
        return { ok: true };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  };
}

async function runAgent(question, { trace, setChart }) {
  const dispatch = makeDispatcher({ trace, setChart });

  const messages = [
    {
      role: "user",
      content:
        `${question}\n\n` +
        `After computing the answer, if a chart would help the user understand ` +
        `the result (comparisons, trends, distributions), call render_chart with ` +
        `the data series. Otherwise omit it.`,
    },
  ];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      tools: TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      return text;
    }

    const toolUses = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    for (const block of toolUses) {
      try {
        const out = await dispatch(block.name, block.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(out),
        });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: String(err.message ?? err),
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  throw new Error(`Exceeded ${MAX_STEPS} agent steps.`);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.post("/api/ask", async (req, res) => {
  const { question } = req.body ?? {};
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing 'question' in body." });
  }

  const toolCalls = [];
  let chartSpec = null;
  const trace = (name, input) => toolCalls.push({ name, input });
  const setChart = (spec) => {
    chartSpec = spec;
  };

  try {
    const answer = await runAgent(question, { trace, setChart });
    res.json({ answer, toolCalls, chart: chartSpec });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Claude loans agent listening on http://localhost:${port}`);
});
