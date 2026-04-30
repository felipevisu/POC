import asyncio
import json
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Scroll Presenter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SessionManager:
    """
    Manages WebSocket sessions.

    Each session holds an ordered list of (clientId, WebSocket) pairs.
    The first entry is always the active controller.

    controller_id  — the *original* controller's clientId. It persists even
                     when they disconnect so they can reclaim the role on
                     reconnect (e.g. after a page refresh).

    A per-session asyncio.Lock serialises all mutations.
    """

    def __init__(self) -> None:
        self._sessions: dict[str, dict] = {}

    def _get_or_create(self, session_id: str) -> dict:
        if session_id not in self._sessions:
            self._sessions[session_id] = {
                "clients": [],        # list of (clientId, WebSocket); index 0 = active controller
                "lock": asyncio.Lock(),
                "lyrics": "",
                "controller_id": None,  # persists across disconnects
            }
        return self._sessions[session_id]

    async def connect(
        self, session_id: str, client_id: str, ws: WebSocket
    ) -> tuple[str, str]:
        """
        Register a new connection. Returns (role, current_lyrics).

        Role logic:
        - First client ever → controller; controller_id is set permanently.
        - Returning original controller → restored to index 0; whoever was
          temporarily at index 0 is demoted and notified.
        - Anyone else → viewer (appended to the end).
        """
        session = self._get_or_create(session_id)
        demote_ws = None  # socket to notify about demotion, if any

        async with session["lock"]:
            # Drop any stale socket from this clientId (StrictMode / quick refresh)
            session["clients"] = [
                (cid, s) for cid, s in session["clients"] if cid != client_id
            ]

            is_first = not session["clients"]
            is_returning_controller = (
                not is_first and session["controller_id"] == client_id
            )

            if is_first:
                # Brand-new session — this client is the permanent controller
                role = "controller"
                session["controller_id"] = client_id
                session["clients"].append((client_id, ws))

            elif is_returning_controller:
                # Original controller refreshed — restore them at index 0
                role = "controller"
                current_front = session["clients"][0] if session["clients"] else None
                if current_front and current_front[0] != client_id:
                    # Someone was promoted while they were gone — demote them
                    demote_ws = current_front[1]
                    session["clients"] = [(client_id, ws)] + session["clients"]
                else:
                    session["clients"].insert(0, (client_id, ws))

            else:
                role = "viewer"
                session["clients"].append((client_id, ws))

            current_lyrics: str = session["lyrics"]
            logger.info(
                "Session %s | client %s joined as %s (total: %d)",
                session_id, client_id, role, len(session["clients"]),
            )

        # Notify the demoted client outside the lock
        if demote_ws is not None:
            await self._safe_send(demote_ws, {"type": "role", "role": "viewer"})

        return role, current_lyrics

    async def disconnect(self, session_id: str, client_id: str) -> None:
        """
        Remove a client. If the active controller left, promote the next viewer.
        controller_id is intentionally NOT cleared so the original controller
        can reclaim their role on reconnect.
        """
        if session_id not in self._sessions:
            return

        session = self._sessions[session_id]
        promote_ws = None

        async with session["lock"]:
            clients = session["clients"]
            was_active_controller = bool(clients) and clients[0][0] == client_id

            session["clients"] = [(cid, s) for cid, s in clients if cid != client_id]
            remaining = session["clients"]

            if not remaining:
                del self._sessions[session_id]
                logger.info("Session %s deleted (empty)", session_id)
                return

            if was_active_controller and remaining:
                promote_ws = remaining[0][1]
                logger.info(
                    "Session %s | %s left, promoting %s temporarily",
                    session_id, client_id, remaining[0][0],
                )

        if promote_ws is not None:
            await self._safe_send(promote_ws, {"type": "role", "role": "controller"})

    async def update_lyrics(
        self, session_id: str, controller_id: str, content: str
    ) -> None:
        """Store new lyrics and broadcast to all current viewers."""
        if session_id not in self._sessions:
            return
        session = self._sessions[session_id]
        async with session["lock"]:
            clients_snapshot = list(session["clients"])
            if not clients_snapshot or clients_snapshot[0][0] != controller_id:
                return
            session["lyrics"] = content

        dead: list[str] = []
        for i, (cid, ws) in enumerate(clients_snapshot):
            if i == 0:
                continue
            if not await self._safe_send(ws, {"type": "lyrics", "content": content}):
                dead.append(cid)

        if dead:
            async with session["lock"]:
                session["clients"] = [
                    (cid, s) for cid, s in session["clients"] if cid not in dead
                ]

    async def broadcast_to_viewers(
        self, session_id: str, controller_id: str, message: dict
    ) -> None:
        """Broadcast a scroll message from the controller to all viewers."""
        if session_id not in self._sessions:
            return

        session = self._sessions[session_id]
        async with session["lock"]:
            clients_snapshot = list(session["clients"])
            is_controller = bool(clients_snapshot) and clients_snapshot[0][0] == controller_id

        if not is_controller:
            return

        dead: list[str] = []
        for i, (cid, ws) in enumerate(clients_snapshot):
            if i == 0:
                continue
            if not await self._safe_send(ws, message):
                dead.append(cid)

        if dead:
            async with session["lock"]:
                session["clients"] = [
                    (cid, s) for cid, s in session["clients"] if cid not in dead
                ]

    @staticmethod
    async def _safe_send(ws: WebSocket, data: dict) -> bool:
        try:
            await ws.send_json(data)
            return True
        except Exception:
            return False


manager = SessionManager()


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(
    ws: WebSocket,
    session_id: str,
    client_id: str = Query(..., alias="clientId"),
):
    await ws.accept()

    role, current_lyrics = await manager.connect(session_id, client_id, ws)
    await ws.send_json({"type": "role", "role": role})
    if current_lyrics:
        await ws.send_json({"type": "lyrics", "content": current_lyrics})

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")

            if msg_type == "scroll":
                progress = msg.get("progress")
                if not isinstance(progress, (int, float)):
                    continue
                progress = max(0.0, min(1.0, float(progress)))
                await manager.broadcast_to_viewers(
                    session_id, client_id,
                    {"type": "scroll", "progress": progress},
                )

            elif msg_type == "lyrics":
                content = msg.get("content", "")
                if not isinstance(content, str):
                    continue
                await manager.update_lyrics(session_id, client_id, content)

            elif msg_type == "scroll_section":
                section_id = msg.get("sectionId")
                if not isinstance(section_id, str) or not section_id:
                    continue
                await manager.broadcast_to_viewers(
                    session_id, client_id,
                    {"type": "scroll_section", "sectionId": section_id},
                )

    except WebSocketDisconnect:
        logger.info("Session %s | client %s disconnected", session_id, client_id)
    finally:
        await manager.disconnect(session_id, client_id)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
