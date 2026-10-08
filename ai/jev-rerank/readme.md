# jev-rerank — hybrid search with and without Jev

Terminal benchmark: how much [Jev](https://typesafe.ai/) (TypeSafe AI) improves the ranking of
hybrid search results when it reranks the top 10, compared with an open-source cross-encoder
(bge-reranker-v2-m3) doing the same job. No database, no UI: everything runs in memory.

## What's here

| file | |
|---|---|
| `bench.py` | search, rerank, metrics and report |
| `data/corpus.parquet` | 279 chunks (~480 tokens each) from 57 environmental bills (PLs) from Brazil's Chamber of Deputies (PDFs → text) |
| `data/queries.parquet` | 38 questions about these bills (`query_id`, `question`, `filename`) |
| `data/answers.parquet` | ground truth: the chunks that answer each question (1 to 5 per question) |

## How it works

1. **Hybrid search.** BM25 (with a Portuguese stemmer) and Qwen3-Embedding-0.6B each retrieve the
   top 50 chunks. The two lists are merged with RRF (Reciprocal Rank Fusion).
2. **Rerank with Jev.** Jev is a decision model, not a generative one. For each of the top 10
   chunks, it gets a yes/no question and returns the probability of "yes":

   ```
   state:    {"query": question, "passage": "PL 182/2026\nheading\ntext"}
   question: "Does `passage` contain information that answers `query`?"
   criteria: true  = the passage answers the question about this bill
             false = a different bill, or just the same words/topic
   ```

   The 10 chunks are reordered by that probability. Calls run in parallel, about 100 ms each.
   The question is in English (Jev's strongest language) and the text is in Portuguese. The bill
   name is prepended to the chunk because the questions mention the bill and the chunk text
   almost never does.
3. **Rerank with bge-reranker-v2-m3**, for comparison. A local multilingual cross-encoder
   scores the same 10 chunks (same text, bill name included) and they are reordered by that score.
4. **Metrics** over the first k results (default k=5): nDCG, recall, MRR and hit, averaged
   across questions.

The report compares `hybrid + bge-reranker` and `hybrid + jev` against `hybrid (sem jev)`
(no reranking) and lists the questions whose nDCG improved or got worse.

## Running

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # once

cp .env.example .env                  # then fill TYPESAFE_API_KEY (console.typesafe.ai/keys); without it, Jev is skipped
.venv/bin/python bench.py             # k=5, Jev on the top 10
.venv/bin/python bench.py --k 7 --depth 15
.venv/bin/python bench.py --check     # self-check, no model and no network
```

On the first run, Qwen3-Embedding (~1.2 GB) and bge-reranker-v2-m3 (~2.2 GB) are downloaded
from Hugging Face. Both run on the Mac GPU and use a lot of memory, so the machine may slow down. Chunk embeddings
are recomputed on every run (~2 min on a Mac GPU).

## Results (2026-10-07, k=5, rerank of the top 10, jev-1.13.0)

| run | nDCG | recall | MRR | hit |
|---|---|---|---|---|
| hybrid (sem jev) | 0.773 | 0.833 | 0.818 | 0.947 |
| hybrid + bge-reranker | 0.879 | 0.895 | 0.934 | 0.974 |
| **hybrid + jev** | **0.946** | **0.956** | **0.961** | **0.974** |

- **Both rerankers help a lot; Jev helps more.** nDCG goes from 0.773 to 0.879 with bge and to
  0.915 with Jev.
- **Questions that changed (nDCG):** bge improved 13 and made 2 worse (-0.23 on the PL 271/2026
  question about IBAMA's Regulatory Agenda, -0.04 on another). Jev improved 15 and made 1 worse
  (-0.04). On the previous run (2026-10-06), Jev made none worse, so its scores vary a little
  between runs.
- **Cost and time:** bge is free and took 65 s for the 38 questions on the Mac GPU. Jev took 23 s
  (380 parallel calls) and used 364k input tokens (≈ US$ 0.015, at US$ 0.042 per million; output
  is free). Embeddings took another 110 s.
- **Ceiling:** a reranker only reorders what the search returned in the top 10. A correct chunk
  that didn't make the top 10 stays out. To go further, increase `--depth`.
