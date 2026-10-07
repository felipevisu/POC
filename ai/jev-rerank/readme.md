# jev-rerank — busca híbrida com e sem Jev

Benchmark de terminal: quanto o [Jev](https://typesafe.ai/) (TypeSafe AI) melhora a ordem dos
resultados de uma busca híbrida quando reordena o top 10. Não tem banco nem UI: tudo roda em memória.

## O que tem aqui

| arquivo | |
|---|---|
| `bench.py` | busca, rerank, métricas e relatório |
| `data/corpus.parquet` | 279 chunks (~480 tokens cada) de 57 projetos de lei ambientais da Câmara (PDFs → texto) |
| `data/queries.parquet` | 38 perguntas sobre esses PLs (`query_id`, `question`, `filename`) |
| `data/answers.parquet` | gabarito: os chunks que respondem cada pergunta (1 a 5 por pergunta) |

## Como funciona

1. **Busca híbrida.** BM25 (com stemmer em português) e Qwen3-Embedding-0.6B pegam os 50
   melhores chunks cada um. As duas listas são fundidas por RRF (Reciprocal Rank Fusion).
2. **Rerank com Jev.** O Jev é um modelo de decisão, não de geração. Para cada um dos 10 primeiros
   chunks, ele recebe uma pergunta sim/não e devolve a probabilidade de "sim":

   ```
   state:    {"query": pergunta, "passage": "PL 182/2026\nheading\ntexto"}
   pergunta: "Does `passage` contain information that answers `query`?"
   critérios: true  = o trecho responde a pergunta sobre este PL
              false = outro PL, ou só as mesmas palavras/assunto
   ```

   Os 10 chunks são reordenados por essa probabilidade. As chamadas rodam em paralelo,
   cerca de 100 ms cada. A pergunta é em inglês (o idioma em que o Jev é melhor) e o texto,
   em português. O nome do PL vai na frente do chunk porque as perguntas citam o PL e o texto
   do chunk quase nunca cita.
3. **Métricas** sobre os k primeiros (padrão k=5): nDCG, recall, MRR e hit, com média
   simples entre as perguntas.

O relatório compara `hybrid (sem jev)` com `hybrid + jev` e lista as perguntas que
melhoraram ou pioraram no nDCG.

## Rodando

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # uma vez

export TYPESAFE_API_KEY=sk-...        # console.typesafe.ai/keys; sem ela, só roda a busca sem Jev
.venv/bin/python bench.py             # k=5, Jev no top 10
.venv/bin/python bench.py --k 7 --depth 15
.venv/bin/python bench.py --check     # self-check, sem modelo e sem rede
```

Na primeira execução, o Qwen3-Embedding (~1.2 GB) é baixado do Hugging Face. Os embeddings
dos chunks são recalculados a cada execução (~2 min na GPU do Mac).

## Resultados (2026-10-06, k=5, Jev no top 10, jev-1.13.0)

| run | nDCG | recall | MRR | hit |
|---|---|---|---|---|
| hybrid (sem jev) | 0.773 | 0.833 | 0.818 | 0.947 |
| **hybrid + jev** | **0.911** | **0.908** | **0.961** | **0.974** |

- **Com Jev:** 15 perguntas melhoraram e **nenhuma piorou** (nDCG). O maior ganho foi em
  "O que o PL 1502/2026 define como racismo ambiental?" (+1.00): o chunk certo estava fora do
  top 5 e foi para o 1º lugar.
- **Custo e tempo:** 364k tokens de entrada (≈ US$ 0.015, a US$ 0.042 por milhão; saída é grátis)
  e 21 s para as 38 perguntas (380 chamadas). Os embeddings levaram mais 110 s.
- **Teto:** o Jev só reordena o que a busca trouxe no top 10. Um chunk certo que ficou de fora
  do top 10 continua de fora. Para ir além, aumente `--depth`.
