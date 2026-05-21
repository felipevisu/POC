# Redis Cache API Response POC

Demonstrates cache-aside pattern using Redis to avoid repeated slow DB calls.

On first request, fetches user from "DB" (simulated 2s delay) and stores result in Redis with 60s TTL. Subsequent requests for the same user return immediately from cache.

## Run

```bash
docker compose up -d
go run main.go
```

Expected output: first request takes ~2s, next two return instantly from cache.
