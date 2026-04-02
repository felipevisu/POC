import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

const AI_DIR = process.env.AI_DIR || join(process.cwd(), "..", "ai-generated");
const SYSTEM_PROMPT = readFileSync(join(AI_DIR, "prompt.md"), "utf-8");
const API_DOC = readFileSync(join(AI_DIR, "doc.md"), "utf-8");
const SWAGGER = readFileSync(join(AI_DIR, "swagger.yaml"), "utf-8");

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: [
      SYSTEM_PROMPT,
      `\n\n## API Documentation\n\n${API_DOC}`,
      `\n\n## OpenAPI Specification\n\n\`\`\`yaml\n${SWAGGER}\n\`\`\``,
    ].join(""),
    messages: [{ role: "user", content: query.trim() }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  let payload;
  try {
    payload = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 500 },
    );
  }

  const searchBody = {
    filters: payload.filters || {},
    page: 1,
    page_size: 20,
    sort_by: payload.sort_by || "id_trim",
    sort_order: payload.sort_order || "asc",
  };

  const res = await fetch(`${BACKEND_URL}/vehicles/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchBody),
  });

  const data = await res.json();

  return NextResponse.json({
    filters: payload.filters || {},
    sort_by: searchBody.sort_by,
    sort_order: searchBody.sort_order,
    results: data,
  });
}
