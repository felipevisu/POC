# claude-react-chat

React + Vite weather chat. Claude (Anthropic SDK) + Open-Meteo. Toggle between custom UI and plain markdown.

## Screenshots

**Markdown only**

![Markdown only](./screenshots/chat-without-custom-components.png)

**Custom components**

![Custom components](./screenshots/chat-with-custom-components.png)

## Setup

```sh
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
npm run dev
```

Open http://localhost:5173.

## How it works

### Anthropic proxy (key stays server-side)

- Browser uses `@anthropic-ai/sdk` with `baseURL: '/api/anthropic'` and placeholder `apiKey: 'proxy'`.
- Vite dev server proxies `/api/anthropic/*` → `https://api.anthropic.com/*`, injecting `x-api-key`, `anthropic-version`, and `anthropic-dangerous-direct-browser-access` headers server-side. Origin/Referer stripped.
- `ANTHROPIC_API_KEY` never ships in the bundle.

### Tool-use loop

1. Call `client.messages.create({ model, tools, messages })`.
2. If `stop_reason === "tool_use"`: execute tool, append `tool_result`, loop.
3. Otherwise stop.

### Weather tool

Two-step Open-Meteo call (no API key):

1. **Geocode** city → `geocoding-api.open-meteo.com/v1/search`
2. **Forecast** lat/lon → `api.open-meteo.com/v1/forecast` (daily + current)

WMO codes mapped to emoji + label.
