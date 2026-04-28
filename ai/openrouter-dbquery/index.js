import { callModel, stepCountIs, tool } from "@openrouter/agent";
import { OpenRouter } from "@openrouter/sdk";
import Database from "better-sqlite3";
import { z } from "zod";

const db = new Database(":memory:");
db.exec(`
    CREATE TABLE orders (                                                                                                                              
      id INTEGER PRIMARY KEY, customer TEXT, product TEXT,                                                                                           
      amount REAL, status TEXT, created_at TEXT                                                                                                        
    );
    INSERT INTO orders (customer, product, amount, status, created_at) VALUES                                                                          
      ('Alice',  'Keyboard', 120.00, 'paid',     '2026-04-02'),                                                                                        
      ('Bob',    'Monitor',  450.00, 'refunded', '2026-04-05'),                                                                                        
      ('Alice',  'Mouse',     35.00, 'paid',     '2026-04-10'),                                                                                        
      ('Carlos', 'Monitor',  450.00, 'paid',     '2026-04-12'),                                                                                        
      ('Bob',    'Keyboard', 120.00, 'paid',     '2026-04-18'),                                                                                        
      ('Carlos', 'Webcam',    80.00, 'pending',  '2026-04-25');                                                                                        
  `);

const listTables = tool({
  name: "list_tables",
  description: "List all tables in the database.",
  inputSchema: z.object({}),
  execute: async () =>
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all(),
});

const describeTable = tool({
  name: "describe_table",
  description: "Get the column schema of a table.",
  inputSchema: z.object({ table: z.string() }),
  execute: async ({ table }) => db.prepare(`PRAGMA table_info(${table})`).all(),
});

const runQuery = tool({
  name: "run_query",
  description:
    "Run a read-only SQL SELECT query and return the rows. Reject anything that isn't SELECT.",
  inputSchema: z.object({ sql: z.string() }),
  execute: async ({ sql }) => {
    if (!/^\s*select\b/i.test(sql)) throw new Error("Only SELECT allowed.");
    return db.prepare(sql).all();
  },
});

const client = new OpenRouter({ apiKey: process.env.API_KEY });

const result = callModel(client, {
  model: "anthropic/claude-sonnet-4",
  input:
    "Who is our top-spending customer this month, and what did they buy? " +
    "Ignore refunded orders.",
  tools: [listTables, describeTable, runQuery],
  stopWhen: stepCountIs(15),
});

for await (const call of result.getToolCallsStream()) {
  console.log("→", call.name, JSON.stringify(call.input));
}

console.log("\n" + (await result.getText()));
