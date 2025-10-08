## My first Scala REST API

```bash
docker-compose up -d
```

```bash
# Health check
curl http://localhost:8080/health
```

```bash
# Post request
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"n": 5, "l": 3, "r": 10}'
```
