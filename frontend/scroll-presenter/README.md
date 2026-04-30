# Scroll Presenter

Real-time scroll synchronisation — one controller drives the scroll, all viewers follow.

## Architecture

```
browser (controller) ──scroll──► WS /ws/{sessionId} ──broadcast──► browser (viewers)
```

- **Backend**: FastAPI + native WebSockets, single in-memory session store
- **Frontend**: React 18 + TypeScript + Vite, react-router-dom

## Running locally

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend is available at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend is available at `http://localhost:3000`.

### 3. Test the sync

1. Open `http://localhost:3000` → enter any session name (e.g. `demo`) → **Join Session**
2. The first tab becomes the **Controller**. Copy the viewer link from the bottom-right panel.
3. Open the copied URL in a second tab (or a different browser/device). It joins as a **Viewer**.
4. Scroll in the controller tab — all viewer tabs follow in real time.

## Key design decisions

| Concern                  | Solution                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Normalized scroll        | `progress = scrollY / (scrollHeight - innerHeight)` — device-independent                |
| Throttling               | 50 ms throttle with rAF buffer on the controller side                                   |
| Viewer jitter            | Single persistent `requestAnimationFrame` lerp loop (factor 0.12/frame)                 |
| Viewer scroll lock       | CSS `overflow: hidden` on `<html>` + `<body>` (belt-and-suspenders event listeners)     |
| Concurrent connect races | Per-session `asyncio.Lock` serialises all mutations                                     |
| Controller promotion     | On disconnect: remove client → promote `clients[0]` → send `{type:"role"}`              |
| StrictMode double-mount  | Stable `clientId` from `sessionStorage`; server replaces stale connections from same ID |
| Dead socket cleanup      | Failed sends during broadcast trigger deferred pruning under lock                       |

## Bonus — Section jump mode

The controller toolbar has buttons for named sections. Clicking jumps the controller and broadcasts `{type: "scroll_section", sectionId}` to viewers who use `scrollIntoView`.

## Production notes

- **Single worker only**: session state is in-memory. Run with `--workers 1`.
- **Scaling**: move sessions + pub/sub to Redis; use sticky routing at the load balancer.
- **CORS**: `allow_origins=["*"]` is fine for local dev — tighten for production.
- **WebSocket URL**: set `VITE_WS_URL=wss://your-host` in `.env` for production builds.
