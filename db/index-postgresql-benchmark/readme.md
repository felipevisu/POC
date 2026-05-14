**Create table**

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT,
    name TEXT
);
```

**Add users**

```sql
INSERT INTO users (email, name)
SELECT
    'user' || g || '@test.com',
    'User ' || g
FROM generate_series(1, 1000000) g;
```

**Query without index**

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'user999999@test.com';
```
Output:
```
Gather  (cost=1000.00..13187.41 rows=3375 width=72) (actual time=53.914..55.391 rows=1 loops=1)
    Workers Planned: 2
    Workers Launched: 2
    ->  Parallel Seq Scan on users  (cost=0.00..11849.91 rows=1406 width=72) (actual time=49.642..49.642 rows=0 loops=3)
        Filter: (email = 'user999999@test.com'::text)
        Rows Removed by Filter: 333333
Planning Time: 0.444 ms
Execution Time: 55.413 ms
```

**Create Index**

```sql
CREATE INDEX idx_users_email
ON users(email);
```

**Query with index**

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'user999999@test.com';
```

Output

```
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=38) (actual time=0.048..0.049 rows=1 loops=1)
   Index Cond: (email = 'user999999@test.com'::text)
Planning Time: 0.522 ms
Execution Time: 0.068 ms
```

### Results

* Execution time without index: 55.413 ms
* Execution time with index: 0.068 ms