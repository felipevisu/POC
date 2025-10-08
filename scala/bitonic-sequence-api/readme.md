## My first Scala REST API

```bash
sbt run
```

```bash
# Health check
curl http://localhost:8080/health

# Post request
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```
