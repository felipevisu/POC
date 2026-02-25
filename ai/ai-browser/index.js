const Anthropic = require("@anthropic-ai/sdk");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const readline = require("readline");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});



const SYSTEM_PROMPT = `You are a browser automation assistant. You control a Puppeteer browser.
When the user asks you to do something in the browser, respond with JavaScript code wrapped in a \`\`\`js code block.
The code has access to these variables:
- \`browser\` — the Puppeteer Browser instance
- \`page\` — the current active Page instance

IMPORTANT RULES:
- Only output the code block, no explanation before or after.
- Use async/await. Do not call puppeteer.launch() or browser.newPage() — they already exist.
- This is Puppeteer (NOT Playwright). Do NOT use Playwright APIs like page.waitForLoadState().
- After your code executes, the system automatically waits for network idle and extracts the DOM. You do NOT need to wait for the page to load or extract any HTML — that is handled for you.
- For navigation use: await page.goto(url, { waitUntil: "networkidle2" })
- For waiting use Puppeteer methods like: page.waitForSelector(), page.waitForNavigation(), page.waitForNetworkIdle()
- If the user asks a question that doesn't need browser interaction, just reply normally without a code block.`;

const messages = [];
let browser;
let page;

async function chat(userMessage) {
  messages.push({ role: "user", content: userMessage });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const reply = response.content[0].text;
  messages.push({ role: "assistant", content: reply });
  return reply;
}

function extractCode(text) {
  const match = text.match(/```js\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

async function executeCode(code) {
  const fn = new Function("browser", "page", `return (async () => { ${code} })();`);
  return await fn(browser, page);
}

async function extractCleanDom() {
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {});
  const cleanHtml = await page.evaluate(() => {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll("script, style, link[rel='stylesheet'], noscript, svg, iframe").forEach(el => el.remove());
    clone.querySelectorAll("*").forEach(el => {
      const attrs = [...el.attributes];
      const allowedAttributes = new Set([
        "class",
        "id",
        "href",
        "src",
        "type",
        "name",
        "placeholder",
        "value",
        "alt",
        "title",
        "aria-label",
        "role",
        "for",
        "action",
        "method",
      ]);
      for (const attr of attrs) {
        if (!allowedAttributes.has(attr.name)) {
          el.removeAttribute(attr.name);
        }
      }
    });

    return clone.outerHTML.replace(/\n\s*\n/g, "\n").replace(/\s{2,}/g, " ").trim();
  });

  return cleanHtml;
}

function prompt() {
  rl.question("\nYou: ", async (input) => {
    if (!input.trim()) return prompt();
    if (input.toLowerCase() === "exit") {
      await browser.close();
      rl.close();
      return;
    }

    try {
      const reply = await chat(input);
      const code = extractCode(reply);

      if (code) {
        console.log("Executing...");
        await executeCode(code);
        console.log("Extracting DOM...");
        lastDom = await extractCleanDom();
        console.log("DOM extracted");
        console.log("Done.");
      } else {
        console.log(`\nClaude: ${reply}`);
      }
    } catch (err) {
      console.error(`\nError: ${err.message}`);
    }

    prompt();
  });
}

async function main() {
  console.log("Launching browser...");
  browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1280,800",
    ],
  });
  page = await browser.newPage();

  // Realistic viewport and user agent
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  // Remove webdriver flag
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    // Fake plugins
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
    // Fake languages
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    // Fake chrome runtime
    window.chrome = { runtime: {} };
    // Fix permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });

  console.log("Browser ready");
  console.log('Chat with Claude');
  prompt();
}

main();
