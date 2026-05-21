# RAG v2 — Retrieval-Augmented Generation

A full-stack system that lets you upload PDF documents and chat with them using AI. Instead of feeding entire documents to the model, it finds only the relevant pieces and uses those to answer your question.

## Screenshots

**Document Manager** — upload PDFs, track processing status, inspect chunks and their embeddings

![Document Manager](screenshots/document-ui.png)

**Chat UI** — ask questions, get answers grounded in your documents with expandable source citations

![Chat UI](screenshots/chat.ui.png)

---

## Architecture

```
┌─────────────────┐     upload PDF      ┌──────────────┐     webhook     ┌────────────┐
│  documents-ui   │ ─────────────────▶  │ document-api │ ──────────────▶ │   worker   │
│  React · :3000  │                     │ FastAPI·:8000│                 │ FastAPI·:8001
└─────────────────┘                     └──────────────┘                 └────────────┘
                                               │                               │
                                        search │                        chunk + embed
                                               │                               │
┌─────────────────┐     ask question    ┌──────▼──────────────────────────────▼──────┐
│   chat UI       │ ─────────────────▶  │          PostgreSQL + pgvector              │
│  Next.js · :3001│ ◀─────────────────  │          chunks · embeddings · HNSW index  │
└─────────────────┘   answer + sources  └────────────────────────────────────────────┘
```

---

## How It Works

### Step 1 — Upload & Chunking

When you upload a PDF, the system cannot just dump the whole document into the AI's context window. Large documents waste tokens and dilute the relevant signal.

Instead, the document is split into **chunks** — small, self-contained passages of text.

**The technique used is Hybrid Chunking** (`docling.chunking.HybridChunker`). Unlike naive character-count or fixed-window splitting, Hybrid Chunking is document-structure-aware:

- It reads the PDF's heading tree, paragraph boundaries, tables, and list items as parsed by [Docling](https://github.com/DS4SD/docling).
- It splits *only* at semantic boundaries (end of a paragraph, end of a section) — never in the middle of a sentence or a table row.
- `max_tokens=512` caps each chunk so it fits within the embedding model's context limit. The tokenizer is the same one used by the embedding model (`all-MiniLM-L6-v2`) so token counts are exact.
- `merge_peers=True` joins small adjacent siblings into one chunk to avoid one-sentence orphans.

Each chunk stores the heading breadcrumb and page numbers it came from, so sources can be cited precisely.

```
PDF page 4:
┌─────────────────────────────────────────────────────┐
│  ## Refund Policy                                   │
│  ### Eligibility                                    │
│  Items must be returned within 30 days of purchase. │
│  Original packaging is required. Items marked       │
│  "Final Sale" are not eligible for refunds.         │
│                                                     │
│  ### Process                                        │  ← split here, new chunk
│  To initiate a return, contact support@...          │
└─────────────────────────────────────────────────────┘

Chunk 0  headings: ["Refund Policy", "Eligibility"]  page: 4
  "Items must be returned within 30 days of purchase.
   Original packaging is required. Items marked
   'Final Sale' are not eligible for refunds."

Chunk 1  headings: ["Refund Policy", "Process"]  page: 4
  "To initiate a return, contact support@..."
```

---

### Step 2 — Generating Embeddings

Once chunked, each piece of text is converted into a **vector embedding** — a list of numbers that encodes the *semantic meaning* of the text.

**Model:** `sentence-transformers/all-MiniLM-L6-v2`
**Output:** 384 floating-point numbers (a 384-dimensional vector)

The key property is that texts with similar meaning produce vectors that are close together in 384-dimensional space — regardless of the exact words used.

```
Text:
  "Items must be returned within 30 days of purchase."

Embedding (384 values, shown truncated):
  [0.0521, -0.1843, 0.3012, 0.0774, -0.2201, 0.1588, 0.0043, -0.3341,
   0.2190, 0.0812, -0.1034, 0.2871, -0.0456, 0.1723, 0.3109, -0.0987,
   ... (384 total) ...]
```

Another example showing semantic similarity:

```
Text A: "How do I get a refund?"
  embedding → [0.0489, -0.1901, 0.3144, ...]   ← close in space

Text B: "Items must be returned within 30 days."
  embedding → [0.0521, -0.1843, 0.3012, ...]   ← close in space

Text C: "What are your shipping rates?"
  embedding → [-0.1200, 0.2744, -0.0831, ...]  ← far from A and B
```

The similarity between two vectors is measured with **cosine similarity** — the angle between them. `1.0` means identical meaning, `0.0` means unrelated.

Embeddings are generated in batches of 64 and normalized to unit length so cosine distance equals dot product distance, which is faster to compute.

---

### Step 3 — Storing in the Database

Chunks and their embeddings are stored in **PostgreSQL** with the [`pgvector`](https://github.com/pgvector/pgvector) extension.

`pgvector` adds a native `VECTOR` column type that can store float arrays and be indexed for fast nearest-neighbor search.

```sql
CREATE TABLE chunks (
    id           SERIAL PRIMARY KEY,
    document_id  INTEGER REFERENCES documents(id),
    chunk_index  INTEGER,
    text         TEXT,
    headings     JSONB,        -- e.g. ["Refund Policy", "Eligibility"]
    page_numbers JSONB,        -- e.g. [4]
    embedding    VECTOR(384)   -- pgvector column
);

-- HNSW index for approximate nearest-neighbor search
CREATE INDEX idx_chunks_embedding_hnsw
ON chunks USING hnsw (embedding vector_cosine_ops);
```

**HNSW** (Hierarchical Navigable Small World) is a graph-based index that finds the nearest vectors in milliseconds even across millions of rows, far faster than scanning every row.

---

### Step 4 — The Chat Interface

A **Next.js** application provides the chat UI (`:3001`). It keeps a rolling window of the last 10 message pairs in `localStorage` to maintain conversation continuity without unbounded context growth.

A separate **React/Vite** app (`:3000`) is the document management dashboard — upload PDFs, view processing status, inspect chunks, and delete documents.

---

### Step 5 — Answering Questions with RAG

When you send a question, the system does not pass your entire document library to the AI. Instead:

1. **Embed the question** — your question is converted to a 384-d vector using the same `all-MiniLM-L6-v2` model.

2. **Retrieve top-K chunks** — PostgreSQL finds the 5 chunks whose embeddings are closest (by cosine distance) to the question vector:

   ```sql
   SELECT text, filename, (1 - (embedding <=> $1::vector)) AS similarity
   FROM chunks
   ORDER BY embedding <=> $1::vector
   LIMIT 5;
   ```

3. **Build context** — the retrieved chunks are formatted with their source filename and heading breadcrumb:

   ```
   [refund_policy.pdf | Refund Policy > Eligibility | p.4]
   Items must be returned within 30 days of purchase...

   ---

   [refund_policy.pdf | Refund Policy > Process | p.4]
   To initiate a return, contact support@...
   ```

4. **Generate answer** — the context is injected into Claude's system prompt. The model (`claude-sonnet-4-6`) answers using *only* the provided chunks and cites the source file. If the answer is not in the retrieved chunks, it says so instead of hallucinating.

5. **Return with citations** — the response includes the answer text plus the ranked source chunks, shown as expandable "Sources" in the UI with similarity scores.

---

## Services

| Service | Tech | Port | Role |
|---|---|---|---|
| `documents-ui` | React + Vite | 3000 | Upload PDFs, view chunk status |
| `chat` | Next.js | 3001 | Conversational AI interface |
| `document-api` | Python / FastAPI | 8000 | REST API, vector search |
| `worker` | Python / FastAPI | 8001 | PDF parsing, chunking, embedding |
| `postgres` | PostgreSQL 16 + pgvector | 5432 | Chunk and vector storage |
| `minio` | MinIO | 9000 / 9001 | PDF object storage (S3-compatible) |

---

## Running Locally

**Prerequisites:** Docker, Docker Compose, an Anthropic API key.

```bash
# 1. Create .env
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 2. Start everything
docker compose up --build

# 3. Wait ~3 minutes for worker to load ML models on first boot
```

| UI | URL |
|---|---|
| Chat | http://localhost:3001 |
| Document manager | http://localhost:3000 |
| MinIO console | http://localhost:9001 (minioadmin / minioadmin) |

Sample policy PDFs in `documents/pdf/` are automatically uploaded and indexed on first boot by the `minio-setup` container.

---

## Data Flow Summary

```
PDF uploaded
    │
    ▼
MinIO stores file ──▶ fires webhook ──▶ worker picks up
                                              │
                                    Docling parses PDF
                                              │
                                    HybridChunker splits
                                    at semantic boundaries
                                    (max 512 tokens/chunk)
                                              │
                                    SentenceTransformer encodes
                                    each chunk → 384-d vector
                                              │
                                    PostgreSQL stores
                                    text + embedding
                                    (HNSW index built)
                                              │
                              ┌───────────────┘
                              │
User types question           │
    │                         │
    ▼                         ▼
question embedded ──▶ cosine search ──▶ top-5 chunks retrieved
                                              │
                                    chunks injected into
                                    Claude system prompt
                                              │
                                    Claude answers using
                                    only provided context
                                              │
                                    answer + sources
                                    returned to user
```
