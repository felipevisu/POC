# RAG with Ollama

A minimal **Retrieval-Augmented Generation** demo in Go. It turns plain-text documents and a user question into numeric vectors (embeddings) using Ollama's `nomic-embed-text` model, then ranks the documents by how *semantically close* they are to the question using cosine similarity.

No LLM generation here — this POC focuses on the **retrieval** half of RAG: given a question, find the most relevant documents.

## How it works

```
                ┌──────────────┐
documents/*.txt │   Ollama     │  embeddings (768 floats each)
   ───────────► │ nomic-embed  │ ─────────────┐
                └──────────────┘              │
                                              ▼
                                      ┌───────────────┐
user question ──► same embedder ────► │  cosine sim   │ ──► ranked list
                                      └───────────────┘
```

1. Read all `.txt` files in `./documents`.
2. For each file, ask Ollama to convert the text into an **embedding** — a fixed-length array of floats that captures the meaning of the text.
3. Read a question from stdin in a REPL loop.
4. Embed the question the same way.
5. Compute cosine similarity between the question vector and every document vector.
6. Print the top 3 documents, highest similarity first.

## Example: file content → vector

A document like `documents/refund_policy.txt`:

```
Customers may request refunds within 30 days of purchase.

Refunds are issued to the original payment method.

Digital products are non-refundable after download.

Refund requests are processed within 5 business days.
```

After `generateEmbedding(...)` it becomes a slice of **768 float64 values** (`nomic-embed-text` output size):

```go
[]float64{
    0.0421, -0.0137,  0.0903, -0.0654,  0.0211, ...,  // 768 values total
   -0.0089,  0.0512, -0.0244,  0.0177,  0.0035,
}
```

The user said "array of integers" — strictly, embeddings are **floats** between roughly `-1.0` and `1.0`. Each dimension is a learned feature; individually meaningless, but the *direction* of the vector encodes meaning.

## Example: user question → vector

Input typed at the prompt:

```
Question: how do I get a refund?
```

Same model, same dimensionality:

```go
[]float64{
    0.0398, -0.0121,  0.0876, -0.0701,  0.0245, ...,  // 768 values
   -0.0102,  0.0488, -0.0259,  0.0163,  0.0044,
}
```

Notice how close these numbers look to `refund_policy.txt` above — that's not accidental. Both texts are *about refunds*, so their vectors point in similar directions in 768-dimensional space.

## Example: sorting & output

After embedding the question, `search()` does three things:

1. **Score** every document against the question with `cosineSimilarity` (range: `-1` worst → `1` best, identical direction).
2. **Wrap** each score in a `SearchResult{Document, Score}`.
3. **Sort descending** with `sort.Slice` — highest score first:

```go
sort.Slice(results, func(i, j int) bool {
    return results[i].Score > results[j].Score
})
```

Then `main` prints the top 3. Sample session:

```
Embedding: refund_policy.txt
Embedding: shipping_policy.txt
Embedding: subscription_policy.txt
Embedding: support_policy.txt

Question: how do I get a refund?
1. refund_policy.txt        (0.7421)
2. support_policy.txt       (0.5123)
3. subscription_policy.txt  (0.4017)

Question: when will my order arrive?
1. shipping_policy.txt      (0.8104)
2. support_policy.txt       (0.4892)
3. refund_policy.txt        (0.2715)

Question: can I cancel my subscription?
1. subscription_policy.txt  (0.7833)
2. refund_policy.txt        (0.4561)
3. support_policy.txt       (0.4310)
```

The ranking shifts with the question — `refund_policy.txt` is #1 for refund questions, but drops to #3 for shipping questions. That is the retrieval layer of a RAG pipeline working.

## Requirements

- Go 1.26+
- [Ollama](https://ollama.com) running locally

## Run Ollama

Install (macOS):

```bash
brew install ollama
```

Start the server (default: `http://localhost:11434`):

```bash
ollama serve
```

Pull the embedding model:

```bash
ollama pull nomic-embed-text
```

## Run the project

```bash
go mod tidy
go run main.go
```

Ctrl+C to exit.

## Configuration

Override Ollama host via env var if not on default port:

```bash
export OLLAMA_HOST=http://localhost:11434
```

## Adding documents

Drop new `.txt` files into `./documents/` and restart.
