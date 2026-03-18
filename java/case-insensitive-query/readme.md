# Users API

REST API for managing users with encrypted PII at rest.

## How it works

All personally identifiable fields (first name, last name, email) are sensitive and stored encrypted in PostgreSQL. Each field is stored twice:

- `*_enc` — AES-256-GCM encrypted value (for retrieval/display)
- `*_hash` — HMAC-SHA256 of the lowercased plaintext (for exact-match search)

This means the database never holds plaintext PII, and searches are done by hashing the query term and comparing against stored hashes — no decryption needed at query time.

## Running

```bash
docker compose up --build
```

The app seeds 5 users on first startup (skipped if the database already has data).

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users` | Create a user |
| `GET` | `/users` | List all users |
| `GET` | `/users/{id}` | Get user by ID |
| `GET` | `/users/search` | Search by exact name / email |

### Search

At least one query param is required. Matching is exact and case-insensitive.

```
GET /users/search?firstName=Alice
GET /users/search?lastName=Smith
GET /users/search?email=alice.smith@example.com
GET /users/search?firstName=Alice&lastName=Smith
```

## Configuration

| Environment variable | Description |
|----------------------|-------------|
| `SPRING_DATASOURCE_URL` | JDBC URL (default: `localhost:5432/usersdb`) |
| `SPRING_DATASOURCE_USERNAME` | DB username (default: `postgres`) |
| `SPRING_DATASOURCE_PASSWORD` | DB password (default: `postgres`) |
| `ENCRYPTION_SECRET_KEY` | Base64-encoded 32-byte AES key (**required**) |
| `ENCRYPTION_HMAC_KEY` | Base64-encoded 32-byte HMAC key (**required**) |

Generate keys:
```bash
openssl rand -base64 32  # run twice, one for each key
```
