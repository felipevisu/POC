# Cursor Pagination

A Spring Boot application demonstrating cursor-based pagination with PostgreSQL.

## How It Works

The API exposes a `GET /documents` endpoint that returns paginated results using cursor-based pagination instead of traditional offset-based pagination.

### Query Method: `findByIdGreaterThanOrderByIdAsc`

This method is declared in `DocumentRepository` and has **no manual implementation**. It is a Spring Data JPA **derived query method** — Spring automatically generates the implementation at runtime by parsing the method name:

| Part               | Meaning              |
|---------------------|----------------------|
| `findBy`           | SELECT query         |
| `IdGreaterThan`    | `WHERE id > :id`     |
| `OrderByIdAsc`     | `ORDER BY id ASC`    |

The generated SQL is equivalent to:

```sql
SELECT * FROM document WHERE id > :id ORDER BY id ASC
```

The `Pageable` parameter adds a `LIMIT` clause to the query.

### Pagination Logic

1. On the **first request** (`cursor` is null), it fetches the first `limit + 1` documents ordered by ID.
2. On **subsequent requests**, it fetches the next `limit + 1` documents where `id > cursor`.
3. The extra `+1` is a common trick to determine if there are more results (`hasMore`) without a separate count query.
4. The response includes a `nextCursor` (the last ID in the current page) which the client sends in the next request.

## Prerequisites

- Java 25
- Maven
- PostgreSQL running on `localhost:5432`

## Database Setup

The application connects to a PostgreSQL database with the following configuration:

- **Database:** `portal`
- **Schema:** `visualize`
- **Username:** `admin`
- **Password:** `admin123`

Make sure the database, schema, and the `document` table exist before running the app (`ddl-auto` is set to `none`).

## How to Run

```bash
mvn spring-boot:run
```

## API Usage

```bash
# First page (default limit of 10)
curl "http://localhost:8080/documents"

# First page with custom limit
curl "http://localhost:8080/documents?limit=5"

# Next page using the cursor from the previous response
curl "http://localhost:8080/documents?cursor=5&limit=5"
```

### Response Format

```json
{
  "data": [ ... ],
  "nextCursor": 5,
  "hasMore": true
}
```
