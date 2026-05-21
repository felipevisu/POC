import sqlite3
import time

from flask import Flask, request, jsonify

from constants import DB_PATH, LOGIN_LIMIT, LOGIN_WINDOW, SESSION_TTL
from session import create_session, require_session, sliding_window_allow
from utils import hash_password, verify_password

app = Flask(__name__)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
            """)


@app.post("/register")
def register():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return jsonify(error="email and password are required"), 400

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                (email, hash_password(password)),
            )
    except sqlite3.IntegrityError:
        return jsonify(error="that email is already registered"), 409
    except sqlite3.Error:
        return jsonify(error="database unavailable"), 503

    return jsonify(message="registered", email=email), 201


@app.post("/login")
def login():
    client_ip = request.remote_addr or "unknown"
    allowed, count = sliding_window_allow(
        f"login:{client_ip}", LOGIN_LIMIT, LOGIN_WINDOW
    )

    if not allowed:
        resp = jsonify(error="too many login attempts, slow down")
        resp.status_code = 429
        resp.headers["Retry-After"] = str(LOGIN_WINDOW)
        return resp

    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    with get_db() as conn:
        user = conn.execute(
            "select id, email, password_hash from users where email = ?", (email,)
        ).fetchone()

    if user is None or not verify_password(password, user["password_hash"]):
        return jsonify(error="invalid credentials"), 401

    token = create_session(user["id"], user["email"])
    return jsonify(token=token, expires_in=SESSION_TTL)


@app.get("/me")
def me():
    _, session = require_session()
    if session is None:
        return jsonify(error="not authenticated"), 401
    return jsonify(
        user_id=int(session["user_id"]),
        email=session["email"],
        session_age_seconds=int(time.time()) - int(session["created_at"]),
    )


if __name__ == "__main__":
    init_db()
    app.run(port=8000, debug=True)
