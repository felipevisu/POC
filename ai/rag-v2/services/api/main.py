import os
import time
from contextlib import contextmanager
from typing import Optional

import anthropic
import psycopg2
import psycopg2.extras
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from minio import Minio
from minio.error import S3Error
from pgvector.psycopg2 import register_vector
from pydantic import BaseModel, Field

DATABASE_URL = os.environ["DATABASE_URL"]
MINIO_ENDPOINT = os.environ["MINIO_ENDPOINT"]
MINIO_ACCESS_KEY = os.environ["MINIO_ACCESS_KEY"]
MINIO_SECRET_KEY = os.environ["MINIO_SECRET_KEY"]
MINIO_BUCKET = os.environ["MINIO_BUCKET"]
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False,
)

anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

_embedder = None


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


def wait_for_db(retries: int = 15, delay: int = 2) -> None:
    for attempt in range(1, retries + 1):
        try:
            with db():
                pass
            return
        except psycopg2.OperationalError:
            print(f"DB not ready (attempt {attempt}/{retries})")
            time.sleep(delay)


def warm_embedder() -> None:
    print("Loading embedding model…")
    get_embedder()
    print("API ready.")


app = FastAPI(on_startup=[wait_for_db, warm_embedder])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "claude_configured": anthropic_client is not None}


@app.get("/api/documents")
def list_documents():
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("""
            SELECT d.id, d.filename, d.processed_at,
                   COUNT(c.id)::int AS chunk_count,
                   COUNT(c.embedding)::int AS embedded_count
            FROM documents d
            LEFT JOIN chunks c ON c.document_id = d.id
            GROUP BY d.id
            ORDER BY d.processed_at DESC
        """)
        return list(cur.fetchall())


@app.get("/api/documents/{doc_id}/chunks")
def get_chunks(doc_id: int):
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT id FROM documents WHERE id = %s", (doc_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Document not found")
        cur.execute("""
            SELECT id, chunk_index, text, headings, page_numbers, embedding
            FROM chunks WHERE document_id = %s ORDER BY chunk_index
        """, (doc_id,))
        rows = cur.fetchall()
        # pgvector returns numpy.float32 array — convert to native Python floats
        # so FastAPI/Pydantic can JSON-serialize them.
        for r in rows:
            emb = r.get("embedding")
            if emb is not None:
                r["embedding"] = [float(x) for x in emb]
        return rows


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int):
    with db() as conn, conn.cursor() as cur:
        cur.execute("SELECT filename FROM documents WHERE id = %s", (doc_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        filename = row[0]
        cur.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
        conn.commit()

    try:
        minio_client.remove_object(MINIO_BUCKET, filename)
    except S3Error as e:
        print(f"MinIO delete warning for {filename}: {e}")

    return {"deleted": doc_id, "filename": filename}


@app.get("/api/search")
def search(
    q: str = Query(..., min_length=1, description="Query text"),
    k: int = Query(5, ge=1, le=50, description="Top-K results"),
):
    vec = get_embedder().encode(q, normalize_embeddings=True).tolist()
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """
            SELECT c.id, c.chunk_index, c.text, c.headings, c.page_numbers,
                   d.id AS document_id, d.filename,
                   (1 - (c.embedding <=> %s::vector))::float AS similarity
            FROM chunks c
            JOIN documents d ON d.id = c.document_id
            WHERE c.embedding IS NOT NULL
            ORDER BY c.embedding <=> %s::vector
            LIMIT %s
            """,
            (vec, vec, k),
        )
        return {"query": q, "k": k, "results": list(cur.fetchall())}


# ── Chat ─────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: Optional[list[ChatMessage]] = None
    k: int = Field(default=5, ge=1, le=20)


SYSTEM_TEMPLATE = """You are a helpful assistant for an e-commerce help center. \
Answer the user's question using ONLY the information in the context chunks below. \
If the answer is not in the context, say you don't have that information.

Cite the source filename in your answer when relevant, like (refund_policy.pdf).

CONTEXT CHUNKS:
{context}
"""


def _format_context(rows) -> str:
    parts = []
    for r in rows:
        headings = r.get("headings") or []
        bread = " > ".join(headings) if headings else ""
        pages = r.get("page_numbers") or []
        page_str = f"p.{','.join(map(str, pages))}" if pages else ""
        header = f"[{r['filename']}{(' | ' + bread) if bread else ''}{(' | ' + page_str) if page_str else ''}]"
        parts.append(f"{header}\n{r['text']}")
    return "\n\n---\n\n".join(parts)


@app.post("/api/chat")
def chat(req: ChatRequest):
    if anthropic_client is None:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    # Embed user message → retrieve top-k chunks
    vec = get_embedder().encode(req.message, normalize_embeddings=True).tolist()
    with db() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """
            SELECT c.id, c.chunk_index, c.text, c.headings, c.page_numbers,
                   d.id AS document_id, d.filename,
                   (1 - (c.embedding <=> %s::vector))::float AS similarity
            FROM chunks c
            JOIN documents d ON d.id = c.document_id
            WHERE c.embedding IS NOT NULL
            ORDER BY c.embedding <=> %s::vector
            LIMIT %s
            """,
            (vec, vec, req.k),
        )
        chunks = list(cur.fetchall())

    if not chunks:
        return {
            "answer": "No documents have been indexed yet. Upload PDFs via MinIO first.",
            "citations": [],
        }

    system_prompt = SYSTEM_TEMPLATE.format(context=_format_context(chunks))

    # Build Claude messages history
    messages = []
    if req.history:
        for m in req.history:
            if m.role in ("user", "assistant") and m.content.strip():
                messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    try:
        response = anthropic_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )
        answer = "".join(b.text for b in response.content if b.type == "text")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")

    return {"answer": answer, "citations": chunks, "model": CLAUDE_MODEL}


@app.get("/api/minio/console-url")
def minio_console_url():
    return {"url": "http://localhost:9001", "bucket": MINIO_BUCKET}
