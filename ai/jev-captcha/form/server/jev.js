// Adapted from LocalCan/invisible-captcha (MIT) jev.ts: asks Jev who filled in the form, from the story alone.
const API_URL = 'https://api.typesafe.ai/v1/systemone'
const BUDGET_MS = 4_000

// Situations, not degrees, and generous about the many ways people fill in a form.
const VISITOR = {
  type: 'choice',
  instructions: 'Who is filling in this contact form? Pick the situation that best matches the session described.',
  criteria: {
    person_mouse: 'A person at a computer using a mouse or trackpad, moving the pointer to what they click.',
    person_touch: 'A person on a phone or tablet, tapping the touchscreen.',
    person_keyboard:
      'A person using the keyboard, a screen reader, voice control, autofill or a password manager, ' +
      'with little or no pointer movement. Screen readers can click a button without moving the pointer.',
    browser_agent:
      'An AI agent or automation tool such as Playwright, Puppeteer, Cypress or Selenium driving a real browser, ' +
      'typing and clicking through automation commands that can press the mouse without moving it.',
    headless_script:
      'A script or headless browser that sets field values and submits the form directly, ' +
      'or an HTTP client that is not a browser at all.',
  },
}
const BOT = ['browser_agent', 'headless_script']

/** Returns { choice, confidence, probabilities, pBot }. Throws on API errors or timeout. */
export async function judge(story, apiKey) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'jev-latest', state: { session: story.join(' ') }, questions: { visitor: VISITOR } }),
    signal: AbortSignal.timeout(BUDGET_MS),
  })
  if (!res.ok) throw new Error(`typesafe ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const { choice, confidence, probabilities } = (await res.json()).answers.visitor
  const pBot = BOT.reduce((sum, option) => sum + (probabilities[option] ?? 0), 0)
  return { choice, confidence, probabilities, pBot }
}
