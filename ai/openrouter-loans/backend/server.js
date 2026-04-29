import { callModel, stepCountIs, tool } from "@openrouter/agent";
import { OpenRouter } from "@openrouter/sdk";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { z } from "zod";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = new OpenRouter({ apiKey: process.env.API_KEY });

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

  const listTables = tool({
    name: "list_tables",
    description: "List all tables in the public schema.",
    inputSchema: z.object({}),
    execute: async (input) => {
      trace("list_tables", input ?? {});
      const { rows } = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      return rows;
    },
  });

  const describeTable = tool({
    name: "describe_table",
    description: "Get the column schema of a table.",
    inputSchema: z.object({ table: z.string() }),
    execute: async (input) => {
      trace("describe_table", input);
      const { rows } = await pool.query(
        `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [input.table]
      );
      return rows;
    },
  });

  const runQuery = tool({
    name: "run_query",
    description:
      "Run a read-only SQL SELECT query and return the rows. Reject anything that isn't SELECT.",
    inputSchema: z.object({ sql: z.string() }),
    execute: async (input) => {
      trace("run_query", input);
      if (!/^\s*select\b/i.test(input.sql)) {
        throw new Error("Only SELECT allowed.");
      }
      const { rows } = await pool.query(input.sql);
      return rows;
    },
  });

  const renderChart = tool({
    name: "render_chart",
    description:
      "Render a chart that visualizes the answer. Call this AFTER you have the data and only when a chart helps (comparisons across categories, trends over time, distributions). Skip it for single-value answers or unstructured lists.",
    inputSchema: z.object({
      type: z.enum(["bar", "line", "pie", "doughnut"]),
      title: z.string(),
      xLabel: z.string().optional(),
      yLabel: z.string().optional(),
      labels: z.array(z.string()),
      datasets: z.array(
        z.object({
          label: z.string(),
          data: z.array(z.number()),
        })
      ),
    }),
    execute: async (spec) => {
      trace("render_chart", { type: spec.type, title: spec.title });
      chartSpec = spec;
      return { ok: true };
    },
  });

  try {
    const result = callModel(client, {
      model: "anthropic/claude-sonnet-4",
      input:
        `${question}\n\n` +
        `After computing the answer, if a chart would help the user understand ` +
        `the result (comparisons, trends, distributions), call render_chart with ` +
        `the data series. Otherwise omit it.`,
      tools: [listTables, describeTable, runQuery, renderChart],
      stopWhen: stepCountIs(20),
    });

    const answer = await result.getText();
    res.json({ answer, toolCalls, chart: chartSpec });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Loans agent listening on http://localhost:${port}`);
});
