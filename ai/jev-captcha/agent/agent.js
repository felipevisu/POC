// Claude drives a real browser through four tools until the contact form is submitted.
import Anthropic from "@anthropic-ai/sdk";
import { chromium } from "playwright";

const URL = process.env.FORM_URL ?? "http://localhost:5173";
const GOAL = "Submit the contact form on the open page. Make up realistic values for every field. Stop once the page confirms it was sent, or if it says you were blocked.";

const tools = [
  { name: "read_page", description: "Return the current page's body HTML.", input_schema: { type: "object", properties: {} } },
  { name: "fill", description: "Type text into an input or textarea.", input_schema: { type: "object", properties: { selector: { type: "string" }, value: { type: "string" } }, required: ["selector", "value"] } },
  { name: "select", description: "Pick an option in a <select> by its value or label.", input_schema: { type: "object", properties: { selector: { type: "string" }, value: { type: "string" } }, required: ["selector", "value"] } },
  { name: "click", description: "Click an element.", input_schema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] } },
];

const headless = process.env.HEADLESS !== "false";
const browser = await chromium.launch({ headless, slowMo: headless ? 0 : 600 }); // slowMo so a human can follow it
const page = await browser.newPage();
await page.goto(URL);

async function run({ name, input }) {
  if (name === "read_page") return page.innerHTML("body");
  if (name === "fill") await page.fill(input.selector, input.value);
  if (name === "select") await page.selectOption(input.selector, input.value);
  if (name === "click") await page.click(input.selector);
  return "ok";
}

const client = new Anthropic();
const messages = [{ role: "user", content: GOAL }];

for (let turn = 0; turn < 20; turn++) {
  const res = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    tools,
    messages,
  });
  if (res.stop_reason === "refusal") throw new Error(`refused: ${res.stop_details?.explanation}`);
  messages.push({ role: "assistant", content: res.content });

  const calls = res.content.filter((b) => b.type === "tool_use");
  if (!calls.length) break;

  const results = [];
  for (const call of calls) {
    console.log("→", call.name, JSON.stringify(call.input));
    try {
      results.push({ type: "tool_result", tool_use_id: call.id, content: await run(call) });
    } catch (err) {
      results.push({ type: "tool_result", tool_use_id: call.id, content: err.message, is_error: true });
    }
  }
  messages.push({ role: "user", content: results });
}

const status = await page.locator("[role=status]").textContent({ timeout: 6000 }).catch(() => null);
const alert = status ? null : await page.locator("[role=alert]").textContent({ timeout: 6000 }).catch(() => null);
console.log(status ? `SUBMITTED: ${status}` : `NOT SUBMITTED: ${alert ?? "no response from the form"}`);
if (!headless) await page.waitForEvent("close", { timeout: 0 }); // keep the window up until the user closes it
await browser.close();
process.exit(status ? 0 : 1);
