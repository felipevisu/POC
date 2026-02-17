import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "fs";
import { join } from "path";

export const maxDuration = 60;

export async function POST(request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    const html = await page.evaluate(() => {
      document
        .querySelectorAll("script, style, link, noscript, svg, img, iframe")
        .forEach((el) => el.remove());

      document.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("style");
        el.removeAttribute("class");
        el.removeAttribute("id");
        el.removeAttribute("data-a-dynamic-image");
        el.removeAttribute("onclick");
        el.removeAttribute("onload");
      });

      return document.body.innerHTML;
    });

    writeFileSync(join(process.cwd(), "page.html"), html, "utf-8");
    console.log(`Scraped HTML saved to page.html (${(html.length / 1024).toFixed(1)} KB)`);

    await browser.close();
    browser = null;

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Extract the product name and its price from the following HTML page. Return ONLY a JSON object with "product" and "price" fields, nothing else.\n\nHTML:\n${html}`,
        },
      ],
    });

    let text = response.content[0].text;

    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      text = codeBlockMatch[1].trim();
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ product: text, price: "N/A" });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to extract price" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
