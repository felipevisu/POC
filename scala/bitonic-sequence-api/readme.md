## My first Scala REST API

```bash
docker-compose up -d
```

```bash
# Health check
curl http://localhost:8080/health
```

**First request:**

Cached is false, server calculated and saved on redis

```bash
# Post request
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"n": 5, "l": 3, "r": 10}'

# Response: {"result":[7,8,9,10,9],"cached":false}
```

**Second request:**

Cached is true, server read from redis, and didn't calculated again

```bash
# Post request
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"n": 5, "l": 3, "r": 10}'

# Response: {"result":[7,8,9,10,9],"cached":true}
```
