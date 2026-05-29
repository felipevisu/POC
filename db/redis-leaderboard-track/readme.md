# Redis Leaderboard

Real-time game leaderboard on a Redis **sorted set** (`ZADD` / `ZREVRANGE` / `ZREVRANK`), served by FastAPI. Monitored live with Prometheus + Grafana — a keyspace-notification watcher refreshes a `leaderboard_top_player_score` gauge whenever scores change.

## Endpoints

- `POST /scores` — submit/update a player score
- `GET /leaderboard/top?n=` — top N players
- `GET /players/{id}` — player rank + score
- `GET /players/{id}/around?radius=` — neighbors around a player
- `GET /leaderboard/count?min_score=` — count players above a score
- `GET /healthz`, `GET /metrics`

## Run

```bash
docker compose up --build
python seed.py        # load sample players
k6 run loadtest.js    # generate traffic
```

Grafana on `:3000`, Prometheus on `:9090`, API on `:8000`.
