const { test, expect } = require("@playwright/test");

test("tries to submit the contact form", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Subject").selectOption("Sales");
  await page.getByLabel("Message").fill("Hello from Playwright");
  await page.getByRole("button", { name: "Send" }).click();
  // Jev decides; the test fails when the submit was blocked as a bot.
  const outcome = page.getByRole("status").or(page.getByRole("alert"));
  await expect(outcome).toBeVisible({ timeout: 10_000 });
  const text = await outcome.innerText();
  console.log(text);
  await expect(page.getByRole("status"), `bot detected: ${text}`).toBeVisible({ timeout: 0 });
});
