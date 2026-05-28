import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
import redis.asyncio as redis
from prometheus_fastapi_instrumentator import Instrumentator, metrics

REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
LB = "game:leaderboard:global"

r: redis.Redis = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global r
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True,
                    max_connections=200)
    yield
    await r.aclose()


app = FastAPI(title="Leaderboard POC", lifespan=lifespan)
(
    Instrumentator(excluded_handlers=["/metrics", "/healthz"])
    .add(metrics.requests(metric_name="api_requests_total"))
    .add(metrics.latency(
        metric_name="api_request_duration_seconds",
        buckets=(0.0025, 0.005, 0.01, 0.025, 0.05,
                 0.1, 0.25, 0.5, 1.0, 2.5, 5.0),
    ))
    .instrument(app)
    .expose(app)
)


class ScoreUpdate(BaseModel):
    player_id: str = Field(..., min_length=1, max_length=64)
    delta: float


@app.get("/healthz")
async def healthz():
    return {"ok": await r.ping()}


@app.post("/scores")
async def submit_score(body: ScoreUpdate):
    new_score = await r.zincrby(LB, body.delta, body.player_id)
    return {"player_id": body.player_id, "score": new_score}


@app.get("/leaderboard/top")
async def top(n: int = Query(10, ge=1, le=100)):
    rows = await r.zrevrange(LB, 0, n - 1, withscores=True)
    return [{"rank": i + 1, "player_id": p, "score": int(s)}
            for i, (p, s) in enumerate(rows)]


@app.get("/players/{player_id}")
async def player(player_id: str):
    pipe = r.pipeline(transaction=False)
    pipe.zrevrank(LB, player_id)
    pipe.zscore(LB, player_id)
    pipe.zcard(LB)
    rank, score, total = await pipe.execute()
    if rank is None:
        raise HTTPException(404, "player not found")
    return {"player_id": player_id, "rank": rank + 1,
            "score": int(score), "total_players": total}


@app.get("/players/{player_id}/around")
async def around_me(player_id: str, radius: int = Query(5, ge=1, le=50)):
    rank = await r.zrevrank(LB, player_id)
    if rank is None:
        raise HTTPException(404, "player not found")
    start = max(0, rank - radius)
    stop = rank + radius
    rows = await r.zrevrange(LB, start, stop, withscores=True)
    return [{"rank": start + i + 1, "player_id": p, "score": int(s),
             "is_me": p == player_id}
            for i, (p, s) in enumerate(rows)]


@app.get("/leaderboard/count")
async def count_above(min_score: float = Query(...)):
    return {"count": await r.zcount(LB, min_score, "+inf")}