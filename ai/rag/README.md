# RAG with Ollama

Simple Retrieval-Augmented Generation demo in Go. Loads `.txt` files from `documents/`, generates embeddings via Ollama's `nomic-embed-text` model, then ranks documents by cosine similarity against a user query.

## What it does

1. Reads all `.txt` files in `./documents`.
2. Sends each file to Ollama, gets back an embedding vector.
3. Prompts you for a question in a REPL loop.
4. Embeds the question and prints the top 3 most similar documents with their similarity scores.

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

Output:

```
Embedding: refund_policy.txt
Embedding: shipping_policy.txt
...
Question: how do I get a refund?
1. refund_policy.txt (0.7421)
2. support_policy.txt (0.5123)
3. subscription_policy.txt (0.4017)
Question:
```

Ctrl+C to exit.

## Configuration

Override Ollama host via env var if not on default port:

```bash
export OLLAMA_HOST=http://localhost:11434
```

## Adding documents

Drop new `.txt` files into `./documents/` and restart.
