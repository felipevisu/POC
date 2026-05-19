import asyncio
import json
import os
import tempfile
import time
from contextlib import asynccontextmanager, contextmanager
from urllib.parse import unquote

import psycopg2
from fastapi import BackgroundTasks, FastAPI, Request
from minio import Minio
from pgvector.psycopg2 import register_vector

DATABASE_URL = os.environ["DATABASE_URL"]
MINIO_ENDPOINT = os.environ["MINIO_ENDPOINT"]
MINIO_ACCESS_KEY = os.environ["MINIO_ACCESS_KEY"]
MINIO_SECRET_KEY = os.environ["MINIO_SECRET_KEY"]
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBED_DIM = 384

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False,
)

_converter = None
_chunker = None
_embedder = None


def get_converter():
    global _converter
    if _converter is None:
        from docling.document_converter import DocumentConverter
        _converter = DocumentConverter()
    return _converter


def get_chunker():
    global _chunker
    if _chunker is None:
        from docling.chunking import HybridChunker
        from transformers import AutoTokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _chunker = HybridChunker(tokenizer=tokenizer, max_tokens=512, merge_peers=True)
    return _chunker


def get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer(MODEL_NAME)
    return _embedder


@contextmanager
def db():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        register_vector(conn)
        yield conn
    finally:
        conn.close()


def init_schema_with_retry(retries: int = 15, delay: int = 2) -> None:
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            # First connection: enable extension before register_vector
            raw = psycopg2.connect(DATABASE_URL)
            with raw.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
                raw.commit()
            raw.close()

            with db() as conn, conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS documents (
                        id           SERIAL PRIMARY KEY,
                        filename     TEXT UNIQUE NOT NULL,
                        processed_at TIMESTAMPTZ DEFAULT NOW()
                    )
                """)
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS chunks (
                        id          SERIAL PRIMARY KEY,
                        document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                        chunk_index INTEGER NOT NULL,
                        text        TEXT NOT NULL,
                        headings    JSONB,
                        page_numbers JSONB,
                        embedding   VECTOR({EMBED_DIM}),
                        created_at  TIMESTAMPTZ DEFAULT NOW()
                    )
                """)
                # Idempotent ALTER for pre-existing tables created without the column
                cur.execute(f"""
                    ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding VECTOR({EMBED_DIM})
                """)
                cur.execute("CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id)")
                # HNSW for cosine similarity. Skip if any NULL embeddings present
                # (HNSW only indexes non-NULL rows but is cheaper to build once data exists).
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
                    ON chunks USING hnsw (embedding vector_cosine_ops)
                """)
                conn.commit()
            print("Schema ready.")
            return
        except psycopg2.OperationalError as e:
            last_err = e
            print(f"DB not ready (attempt {attempt}/{retries}): {e}")
            time.sleep(delay)
    raise RuntimeError(f"Could not init schema: {last_err}")


def backfill_embeddings() -> None:
    """Encode any chunks that don't have an embedding yet."""
    with db() as conn, conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM chunks WHERE embedding IS NULL")
        pending = cur.fetchone()[0]
    if pending == 0:
        print("No backfill needed.")
        return

    print(f"Backfilling embeddings for {pending} chunks…")
    embedder = get_embedder()
    BATCH = 64

    while True:
        with db() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT id, text FROM chunks WHERE embedding IS NULL LIMIT %s",
                (BATCH,),
            )
            rows = cur.fetchall()
            if not rows:
                break
            ids = [r[0] for r in rows]
            texts = [r[1] for r in rows]
            vectors = embedder.encode(texts, normalize_embeddings=True)
            for cid, vec in zip(ids, vectors):
                cur.execute(
                    "UPDATE chunks SET embedding = %s WHERE id = %s",
                    (vec.tolist(), cid),
                )
            conn.commit()
            print(f"  backfilled batch of {len(rows)}")
    print("Backfill complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_schema_with_retry()
    loop = asyncio.get_event_loop()
    print("Pre-loading docling models…")
    await loop.run_in_executor(None, get_chunker)
    await loop.run_in_executor(None, get_converter)
    print("Pre-loading embedding model…")
    await loop.run_in_executor(None, get_embedder)
    await loop.run_in_executor(None, backfill_embeddings)
    print("Worker ready.")
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


def _extract_pages(chunk) -> list:
    pages: set = set()
    try:
        for item in chunk.meta.doc_items:
            for prov in getattr(item, "prov", []):
                p = getattr(prov, "page_no", None)
                if p is not None:
                    pages.add(p)
    except Exception:
        pass
    return sorted(pages)


def process_pdf(bucket: str, key: str) -> None:
    """Download PDF from MinIO, chunk it, embed, save chunks to DB. Idempotent."""
    filename = key

    with db() as conn, conn.cursor() as cur:
        cur.execute("SELECT id FROM documents WHERE filename = %s", (filename,))
        if cur.fetchone():
            print(f"[skip] already processed: {filename}")
            return

    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(tmp_fd)

    try:
        print(f"[download] {bucket}/{key}")
        minio_client.fget_object(bucket, key, tmp_path)

        print(f"[convert] {filename}")
        result = get_converter().convert(tmp_path)
        chunks = list(get_chunker().chunk(result.document))
        print(f"[chunked] {filename} -> {len(chunks)} chunks")

        texts = [c.text for c in chunks]
        print(f"[embed] {filename}")
        vectors = get_embedder().encode(texts, normalize_embeddings=True)

        with db() as conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO documents (filename) VALUES (%s) ON CONFLICT (filename) DO NOTHING RETURNING id",
                (filename,),
            )
            row = cur.fetchone()
            if not row:
                print(f"[race] {filename} was inserted by another call")
                return
            doc_id = row[0]
            for i, (chunk, vec) in enumerate(zip(chunks, vectors)):
                headings = list(chunk.meta.headings) if chunk.meta.headings else []
                pages = _extract_pages(chunk)
                cur.execute(
                    """INSERT INTO chunks
                       (document_id, chunk_index, text, headings, page_numbers, embedding)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (
                        doc_id,
                        i,
                        chunk.text,
                        json.dumps(headings),
                        json.dumps(pages),
                        vec.tolist(),
                    ),
                )
            conn.commit()
        print(f"[saved] {filename} (doc_id={doc_id}, {len(chunks)} chunks + embeddings)")

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/webhook")
async def webhook(request: Request, background: BackgroundTasks):
    payload = await request.json()
    records = payload.get("Records", [])

    queued = []
    for record in records:
        event_name = record.get("eventName", "")
        if not event_name.startswith("s3:ObjectCreated:"):
            continue
        s3 = record.get("s3", {})
        bucket = s3.get("bucket", {}).get("name")
        key = s3.get("object", {}).get("key")
        if not bucket or not key:
            continue
        key = unquote(key)
        if not key.lower().endswith(".pdf"):
            print(f"[skip] non-PDF: {key}")
            continue
        background.add_task(process_pdf, bucket, key)
        queued.append(f"{bucket}/{key}")

    return {"status": "queued", "items": queued}
