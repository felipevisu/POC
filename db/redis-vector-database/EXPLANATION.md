# Redis Vector Search — Walkthrough

Two scripts: `populate.py` (load + index bikes) and `query.py` (semantic search).
Backend: Redis Stack (RediSearch + RedisJSON) on `localhost:6379`.
Embedder: `msmarco-distilbert-base-v4` (sentence-transformer, 768-dim output, tuned for query→passage retrieval).

---

## Part 1 — `populate.py`

### Step 1.1 — Fetch dataset

```python
url = "https://raw.githubusercontent.com/bsbodden/redis_vss_getting_started/main/data/bikes.json"
response = requests.get(url, timeout=10)
bikes = response.json()
```

Pulls bike catalog JSON from GitHub. Each bike: `{model, brand, price, type, specs, description}`.

### Step 1.2 — Connect + pipeline

```python
client = redis.Redis(host="localhost", port="6379", decode_responses=True)
pipeline = client.pipeline()
```

`pipeline` = batch commands, one round-trip. Faster than N individual writes.

### Step 1.3 — Store as JSON

```python
for i, bike in enumerate(bikes, start=1):
    redis_key = f"bikes:{i:03}"
    pipeline.json().set(redis_key, "$", bike)
res = pipeline.execute()
print(res)
```

Each bike stored under key `bikes:001`, `bikes:002`, ... Path `$` = root.

**Output**:
```
[True, True, True, True, True, True, True, True, True, True, True]
```
(one `True` per JSON.SET — eleven bikes.)

### Step 1.4 — List keys

```python
keys = sorted(client.keys("bikes:*"))
print(keys)
```

**Output**:
```
['bikes:001', 'bikes:002', ..., 'bikes:011']
```

### Step 1.5 — Extract descriptions

```python
descriptions = client.json().mget(keys, "$.description")
descriptions = [item[0] for item in descriptions]
```

`mget` returns nested arrays (JSONPath result). Flatten with `item[0]`.

**Output**: list of 11 raw description strings.

### Step 1.6 — Embed descriptions

```python
embedder = SentenceTransformer("msmarco-distilbert-base-v4")
embeddings = embedder.encode(descriptions).astype(np.float32).tolist()
VECTOR_DIMENSION = len(embeddings[0])
```

Each description → 768-float vector. Cast `float32` (Redis vector index needs fixed type).
`VECTOR_DIMENSION = 768`.

### Step 1.7 — Write embeddings back into JSON

```python
pipeline = client.pipeline()
for key, embedding in zip(keys, embeddings):
    pipeline.json().set(key, "$.description_embeddings", embedding)
pipeline.execute()
```

Adds field `description_embeddings` to each bike doc.

### Step 1.8 — Verify one doc

```python
res = client.json().get("bikes:010")
print(res)
```

**Output**: full bike doc including 768-float `description_embeddings` array.

### Step 1.9 — Create vector index

```python
schema = (
    TextField("$.model", no_stem=True, as_name="model"),
    TextField("$.brand", no_stem=True, as_name="brand"),
    NumericField("$.price", as_name="price"),
    TagField("$.type", as_name="type"),
    TextField("$.description", as_name="description"),
    VectorField(
        "$.description_embeddings",
        "FLAT",
        {"TYPE": "FLOAT32", "DIM": VECTOR_DIMENSION, "DISTANCE_METRIC": "COSINE"},
        as_name="vector",
    ),
)
definition = IndexDefinition(prefix=["bikes:"], index_type=IndexType.JSON)
client.ft("idx:bikes_vss").create_index(fields=schema, definition=definition)
```

Field types:
- `TextField` — full-text search (stemming off for brand/model so exact match).
- `NumericField` — range filter on price.
- `TagField` — exact-match category (`type`).
- `VectorField` — `FLAT` (brute-force KNN; fine for small dataset; alt = `HNSW`). `COSINE` distance.

Index name `idx:bikes_vss`. Auto-indexes every key matching `bikes:*`.

---

## Part 2 — `query.py`

### Step 2.1 — Connect + load same embedder

```python
client = redis.Redis(host="localhost", port="6379", decode_responses=True)
embedder = SentenceTransformer("msmarco-distilbert-base-v4")
```

Must use **same model** as populate — otherwise vectors live in different spaces, distances are garbage.

### Step 2.2 — Query strings

```python
queries = [
    "Bike for small kids",
    "Best Mountain bikes for kids",
    ...
]
encoded_queries = embedder.encode(queries)
```

11 natural-language queries → 11 vectors (768-dim each).

### Step 2.3 — `create_query_table` helper

```python
def create_query_table(query, queries, encoded_queries, extra_params=None):
    results_list = []
    for i, encoded_query in enumerate(encoded_queries):
        result_docs = (
            client.ft("idx:bikes_vss")
            .search(
                query,
                {"query_vector": np.array(encoded_query, dtype=np.float32).tobytes()}
                | (extra_params if extra_params else {}),
            )
            .docs
        )
        for doc in result_docs:
            vector_score = round(1 - float(doc.vector_score), 2)
            results_list.append({...})
```

Per query:
- Encode vector → bytes (`tobytes()`) — Redis wire format.
- Pass as `$query_vector` param.
- `vector_score = 1 - cosine_distance` → similarity (1.0 = identical, 0 = orthogonal).

Then build DataFrame, sort by query+score desc, dedupe query column for readability, truncate long descriptions, render Markdown via `to_markdown()` (needs `tabulate` pkg).

### Step 2.4 — Pure KNN query

```python
query = (
    Query("(*)=>[KNN 3 @vector $query_vector AS vector_score]")
    .sort_by("vector_score")
    .return_fields("vector_score", "id", "brand", "model", "description")
    .dialect(2)
)
table = create_query_table(query, queries, encoded_queries)
print(table)
```

Syntax `(*)=>[KNN 3 @vector $query_vector AS vector_score]`:
- `(*)` = filter (all docs).
- `KNN 3` = top 3 nearest.
- `@vector` = indexed field alias.
- `$query_vector` = param.
- `AS vector_score` = expose distance as field.
- `dialect(2)` = required for vector queries.

**Output** (sample row):
```
| query                            |   score | id         | brand   | model           | description                       |
|----------------------------------|---------|------------|---------|-----------------|-----------------------------------|
| Best Mountain bikes for kids     |    0.54 | bikes:003  | nHill   | Summit          | This budget mountain bike from... |
|                                  |    0.51 | bikes:010  | ...     | ...             | ...                               |
|                                  |    0.49 | bikes:001  | ...     | ...             | ...                               |
```

3 rows per query × 11 queries = 33 rows.

### Step 2.5 — Hybrid query (filter + KNN)

```python
hybrid_query = (
    Query("(@brand:Peaknetic)=>[KNN 3 @vector $query_vector AS vector_score]")
    ...
)
```

Pre-filter: only docs where `brand` = `Peaknetic`, then KNN within that subset.
Scores lower because candidate pool tiny.

**Output**: rows only for brand Peaknetic, top 3 closest per query.

### Step 2.6 — Range query (radius search)

```python
range_query = (
    Query(
        "@vector:[VECTOR_RANGE $range $query_vector]=>"
        "{$YIELD_DISTANCE_AS: vector_score}"
    )
    .sort_by("vector_score")
    .return_fields("vector_score", "id", "brand", "model", "description")
    .paging(0, 4)
    .dialect(2)
)
table = create_query_table(
    range_query, queries[:1], encoded_queries[:1], {"range": 0.55}
)
print(table)
```

Different mode: return **all** docs within cosine distance `0.55` of query vector (not top-K).
`paging(0, 4)` cap at 4 results.
Only first query (`"Bike for small kids"`).

**Output**: up to 4 bikes within similarity radius.

---

## Concepts cheat sheet

| Term | Meaning |
|------|---------|
| Sentence transformer | NN that maps text → dense vector preserving semantic similarity |
| Embedding | The output vector (here 768 floats) |
| Cosine distance | `1 - cos(angle)`; 0 = identical direction, 1 = orthogonal |
| KNN | K nearest neighbors — top-K closest vectors |
| FLAT index | Brute-force scan all vectors. Exact, slow at scale |
| HNSW index | Graph-based ANN. Approximate, fast at scale |
| Hybrid query | Text/tag filter + vector search combined |
| Range query | Return all within radius (vs. top-K) |
| Dialect 2 | RediSearch query syntax version required for vector ops |

---

## Run order

```bash
docker compose up -d              # start Redis Stack
pip install -r requirements.txt
pip install tabulate              # for to_markdown()
python populate.py                # one-time load + index
python query.py                   # semantic search demo
```

Re-running `populate.py` errors on index create (already exists). Drop first:
```python
client.ft("idx:bikes_vss").dropindex(delete_documents=False)
```
