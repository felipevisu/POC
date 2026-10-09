// Ported from LocalCan/invisible-captcha (MIT) requestFacts.ts.
// What the request headers say, reduced to enums and booleans. No header text survives.

// First match wins, so the order matters: most Chromium browsers also say "Chrome/", and nearly
// everything says "Safari/".
const BROWSER_PATTERNS = [
  [/HeadlessChrome/, 'headless-chrome'],
  [/curl|wget|python-requests|python-httpx|aiohttp|Go-http-client|okhttp/i, 'http-library'],
  [/node-fetch|undici|axios|^node$/i, 'http-library'],
  [/SamsungBrowser/, 'samsung'],
  [/Edg(e|A|iOS)?\//, 'edge'],
  [/Firefox\/|FxiOS/, 'firefox'],
  [/Chrome\/|CriOS/, 'chrome'],
  [/Safari\//, 'safari'],
]

// iPhones say "like Mac OS X" and Android says "Linux", so the mobile systems go first.
const SYSTEM_PATTERNS = [
  [/iPhone|iPad|iPod/, 'ios'],
  [/Android/, 'android'],
  [/CrOS/, 'chromeos'],
  [/Windows/, 'windows'],
  [/Macintosh|Mac OS X/, 'macos'],
  [/Linux/, 'linux'],
]

// The vendor name comes from this table, never from the header.
const AGENT_PATTERNS = [
  [/ChatGPT-User|OAI-/, 'OpenAI'],
  [/Claude-User|Claude-Web|anthropic/i, 'Anthropic'],
  [/Perplexity/i, 'Perplexity'],
  [/Google-Agent/, 'Google'],
]

const firstMatch = (table, text) => table.find(([pattern]) => pattern.test(text))?.[1] ?? null

// headers: a Node IncomingMessage headers object (lower-case keys).
export function requestFacts(headers) {
  const ua = headers['user-agent'] ?? ''
  const hints = headers['sec-ch-ua'] ?? null
  const browser = firstMatch(BROWSER_PATTERNS, ua) ?? 'other'
  return {
    browser,
    os: firstMatch(SYSTEM_PATTERNS, ua) ?? 'other',
    headlessToken: /headless/i.test(ua) || /headless/i.test(hints ?? ''),
    clientHintsPresent: hints !== null,
    chromiumHintsMismatch: hints !== null && (browser === 'safari' || browser === 'firefox'),
    signaturePresent: 'signature-input' in headers || 'signature-agent' in headers,
    declaredAgent: firstMatch(AGENT_PATTERNS, ua),
  }
}
