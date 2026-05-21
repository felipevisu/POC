import secrets
import time

from flask import request
import redis

from .constants import SESSION_TTL

r = redis.Redis(host="localhost", port=6379, decode_responses=True)


def create_session(user_id: int, email: str) -> str:
    token = secrets.token_urlsafe(32)
    key = f"session:{token}"

    pipe = r.pipeline()
    pipe.hset(
        key,
        mapping={
            "user_id": user_id,
            "email": email,
            "created_at": int(time.time()),
        },
    )
    pipe.expire(key, SESSION_TTL)
    pipe.execute()
    return token


def get_session(token: str):
    key = f"session:{token}"
    data = r.hgetall(key)
    if not data:
        return None
    r.expire(key, SESSION_TTL)
    return data


def require_session():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, None
    token = auth[len("Bearer ") :]
    return token, get_session(token)
