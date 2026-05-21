# Redis Auth POC

Minimal hand-rolled auth to learn **Redis as a session store**. No auth library — just enough code to see the machinery.

**Core idea:** durable data and ephemeral data belong in different places.
- **Users** → SQLite (losing them is catastrophic)
- **Sessions** → Redis with TTL (losing one just forces a re-login)

> ⚠️ Learning project. Use a vetted auth library or identity provider for production.

## Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/register` | POST | — | Create user from `{email, password}` |
| `/login` | POST | — | Verify credentials, return session token |
| `/me` | GET | Bearer | Return current user, refresh TTL |
| `/logout` | POST | Bearer | Destroy session |

## Run

```bash
# Start Redis
docker-compose up -d

# Install deps
pip install flask redis bcrypt

# Start app
python src/app.py  # http://localhost:8000
```

## Try it

```bash
curl -X POST localhost:8000/register -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"hunter2"}'

curl -X POST localhost:8000/login -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"hunter2"}'

curl localhost:8000/me -H 'Authorization: Bearer YOUR_TOKEN'
```

## Watch Redis

```bash
docker exec -it redis_cache redis-cli
HGETALL session:<token>   # stored session fields
TTL session:<token>       # countdown from 1800s
```

Call `/me` and re-check `TTL` — it resets to 1800. That's sliding expiration. Redis deletes expired keys with zero cleanup code on our end.

## Tests

```bash
pip install pytest
pytest test_app.py -v
```
