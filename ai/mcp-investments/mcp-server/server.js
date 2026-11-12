import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import pg from "pg";
import { z } from "zod";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const json = (data) => ({ content: [{ type: "text", text: JSON.stringify(data) }] });

function buildServer() {
  const server = new McpServer(
    { name: "investments-db", version: "1.0.0" },
    {
      // Sent to the client on connect, so Claude Code / Desktop know how to read the data.
      instructions:
        "Investment portfolio in Postgres. Tables: `investments` (one row per position; a ticker can appear in several accounts), " +
        "`price_history` (ticker, month, close: monthly closes for trends), " +
        "`dividends` (investment_id -> investments.id, pay_date, amount: quarterly payouts). Prices are as of 2026-10-01. " +
        "Market value = current_price * quantity. Cost basis = buy_price * quantity. " +
        "Unrealized gain = (current_price - buy_price) * quantity. Return % = (current_price / buy_price - 1) * 100. " +
        "Use run_query with SELECT to answer questions about holdings, allocation, gains and accounts.",
    }
  );

  server.registerTool(
    "list_tables",
    { description: "List all tables in the public schema." },
    async () => {
      const { rows } = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      return json(rows);
    }
  );

  server.registerTool(
    "describe_table",
    { description: "Get the column schema of a table.", inputSchema: { table: z.string() } },
    async ({ table }) => {
      const { rows } = await pool.query(
        `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [table]
      );
      return json(rows);
    }
  );

  server.registerTool(
    "run_query",
    {
      description: "Run a read-only SQL SELECT query and return the rows.",
      inputSchema: { sql: z.string() },
    },
    async ({ sql }) => {
      if (!/^\s*(select|with)\b/i.test(sql)) {
        return { content: [{ type: "text", text: "Only SELECT allowed." }], isError: true };
      }
      // READ ONLY transaction: the regex alone can be bypassed with "SELECT 1; DELETE ...".
      const client = await pool.connect();
      try {
        await client.query("BEGIN READ ONLY");
        const { rows } = await client.query(sql);
        return json(rows);
      } catch (err) {
        return { content: [{ type: "text", text: err.message }], isError: true };
      } finally {
        await client.query("ROLLBACK").catch(() => {});
        client.release();
      }
    }
  );

  return server;
}

// Stateless Streamable HTTP: a fresh server + transport per request.
const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
    }
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Investments MCP server on http://localhost:${port}/mcp`));
