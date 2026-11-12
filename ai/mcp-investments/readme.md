# mcp-investments

An MCP server over an investment portfolio in Postgres. Connect it to Claude Code or Claude Desktop and ask questions about your investments. No Anthropic API key needed: the Claude app is the MCP client.

```
Claude Code / Claude Desktop ──MCP (Streamable HTTP)──▶ mcp-server ──SQL──▶ postgres
```

## Tools

| Tool             | What it does                                         |
| ---------------- | ---------------------------------------------------- |
| `list_tables`    | Lists tables in the public schema                    |
| `describe_table` | Column schema of a table                             |
| `run_query`      | Runs a `SELECT` inside a `READ ONLY` transaction     |

The server also sends `instructions` on connect (market value, cost basis, gain and return formulas), so Claude knows how to read the data.

## Run

```bash
docker compose up -d --build
```

- MCP server: http://localhost:3004/mcp
- Postgres: postgres://investments:investments@localhost:5434/investments

Tear it down and wipe the data with `docker compose down -v`.

## Connect

**Claude Code**

```bash
claude mcp add --transport http investments http://localhost:3004/mcp
```

**Claude Desktop**: edit `~/Library/Application Support/Claude/claude_desktop_config.json`. The local config launches stdio servers, so use `mcp-remote` as a bridge to the HTTP server:

```json
{
  "mcpServers": {
    "investments": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3004/mcp"]
    }
  }
}
```

Restart Claude Desktop.

**MCP Inspector** (debugging): `npx @modelcontextprotocol/inspector`, transport Streamable HTTP, URL `http://localhost:3004/mcp`.

## Schema

```sql
investments (            -- 64 positions, 60 tickers (some held in several accounts)
  id, ticker, name,
  asset_class,           -- stock, bond, etf, crypto, reit
  sector,                -- tech, health, energy, finance, consumer, real_estate, broad_market, government, crypto
  account,               -- brokerage, ira, 401k
  quantity, buy_price, current_price, buy_date,
  dividend_yield         -- annual %, on cost
)
price_history (ticker, month, close)            -- ~2,600 monthly closes, first buy → 2026-10
dividends (id, investment_id, pay_date, amount) -- ~800 quarterly payouts
```

`price_history` and `dividends` are generated in `init.sql` from the positions, so they always agree with them. After editing `init.sql`, run `docker compose down -v && docker compose up -d` to re-seed.

## Sample questions

- What is the total market value per asset class?
- Which positions are losing money?
- What is the unrealized gain per account?
- How much was invested each year?
- What's my allocation by sector?
- Which crypto position has the best return %?

## Claude Desktop

<img src="claude-desktop.png" alt="claude" />