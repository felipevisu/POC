# claude-react-chat

React + Vite weather chat UI. Claude (Anthropic SDK) + Open-Meteo.

Ask things like:

- *"How will the weather be in Lisbon this weekend?"*
- *"Will it rain in Tokyo tomorrow?"*
- *"7-day forecast for Porto"*

Claude calls the `get_weather` tool, app fetches Open-Meteo, results render as a forecast card (current conditions, daily highs/lows, precipitation, sunrise/sunset).

![screenshot placeholder — `WeatherCard` renders gradient hero + meta grid + horizontal 7-day strip]

## Setup

```sh
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
npm run dev
```

Open http://localhost:5173.

## How it works

### Anthropic proxy (key stays server-side)

- Browser uses `@anthropic-ai/sdk` with `baseURL: '/api/anthropic'` and a placeholder `apiKey: 'proxy'`.
- Vite dev server proxies `/api/anthropic/*` → `https://api.anthropic.com/*`, injecting `x-api-key`, `anthropic-version`, and `anthropic-dangerous-direct-browser-access` headers server-side. Origin/Referer stripped so Anthropic sees server-to-server.
- `ANTHROPIC_API_KEY` never ships in the bundle.

### Tool-use loop (`src/App.jsx`)

Manual loop in `handleSubmit`:

1. Call `client.messages.create({ model, tools, messages })`.
2. If `stop_reason === "tool_use"`: append assistant turn (`response.content`), execute each `tool_use` block, append `user` turn with `tool_result` blocks, repeat.
3. Otherwise stop, render final text.

Each `tool_use` and `tool_result` renders as its own item so user sees what Claude called and what came back.

### Weather tool (`src/tools.js`)

Two-step Open-Meteo call (no API key needed):

1. **Geocode** city → `https://geocoding-api.open-meteo.com/v1/search?name=...`
2. **Forecast** lat/lon → `https://api.open-meteo.com/v1/forecast?...&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,sunrise,sunset&current=...`

WMO weather codes mapped to emoji + label. Output tagged `kind: "weather"` so renderer routes to `WeatherCard`.

## Model

`claude-sonnet-4-5`. Change `MODEL` in `src/App.jsx` (e.g. `claude-opus-4-7`, `claude-haiku-4-5`). Verify availability on your key with:

```sh
curl -s https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" | grep '"id"'
```

## File map

```
src/
  App.jsx              chat loop + Anthropic client
  tools.js             get_weather tool (Open-Meteo)
  WeatherCard.jsx      forecast renderer
  ItemRenderer.jsx     routes items to renderers
  index.css            styles incl. .weather-*
vite.config.js         /api/anthropic proxy w/ header injection
```

## Adding tools

1. Define `{ name, description, input_schema, execute(input) }` in `src/tools.js`.
2. Push into `tools` array.
3. If result needs custom render: add component, wire detection in `ItemRenderer.jsx`.

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Vite dev server + proxy |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Notes

- Production deploy needs a real server-side proxy (Vite dev proxy = dev only). Replicate the header injection in your edge function / Express / nginx config.
- Browser bundle includes the SDK (~280KB). For smaller bundle, swap SDK for raw `fetch` against `/api/anthropic/messages`.
