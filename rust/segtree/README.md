# Real-Time Loan Investment Engine — Rust

Motor de decisão de empréstimos em tempo real. Cada pedido é avaliado em
`O(log n)` contra o estado atual do portfólio e uma `Strategy` configurável.

A estrutura central é uma **segment tree** (árvore de segmentos), usada para
responder rapidamente a perguntas como "quanto dinheiro já emprestei para
pessoas com score entre 600 e 650?".

---

## Conceitos principais

Antes do código, os termos do domínio:

| Termo         | O que significa                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| **Portfólio** | O conjunto de todos os empréstimos já aprovados. É o "estado" do sistema.                              |
| **Exposição** | Quanto dinheiro está comprometido. Pode ser total, por faixa de score, por prazo, ou por grade.        |
| **Cap**       | Teto — o valor máximo de exposição permitido. Se um novo empréstimo ultrapassaria esse teto, é negado. |
| **Grade**     | Classificação de risco do tomador (A = melhor, E = pior).                                              |
| **Bucket**    | Faixa — um intervalo de score ou prazo (ex: score 600–650, prazo 1–24 meses).                          |

Regra simples:

> `exposição_atual + valor_do_novo_empréstimo > cap` → **rejeita**

A segment tree existe para calcular `exposição_atual` em qualquer faixa, em
tempo logarítmico.

---

## Fluxo de decisão

Quando chega um pedido:

```json
{ "amount": 100000, "score": 640, "term": 36, "grade": "C" }
```

O engine roda, em ordem, e **a primeira regra que falhar manda**:

1. **Janela de score** — score precisa estar em `[min_score, max_score]` (padrão 300–850).
2. **Cap total do portfólio** — `total_exposure + amount` não pode ultrapassar o limite global.
3. **Caps por faixa de score** — para cada `RangeLimit` que contém o score do pedido, consulta a árvore e rejeita se estouraria.
4. **Caps por faixa de prazo** — mesma lógica, mas na árvore de prazo.
5. **Cap por grade** — consulta o hash map e rejeita se estouraria o teto da grade.

Se passar nas cinco, o empréstimo é aprovado e o estado é atualizado:

```rust
score_tree.update(req.score, req.amount);
term_tree.update(req.term, req.amount);
grade_map[req.grade] += req.amount;
total_exposure += req.amount;
```

---

## Segment tree — exemplo visual

Pra explicar, vamos usar um domínio pequeno: **scores de 600 a 607** (8 valores).
O sistema real usa 300–850, mas o princípio é igual.

Suponha que já aprovamos 4 empréstimos:

| Score | Valor emprestado |
| ----- | ---------------- |
| 601   | $100.000         |
| 603   | $50.000          |
| 605   | $200.000         |
| 607   | $75.000          |

A árvore fica assim (cada nó guarda a **soma dos valores na sua faixa**):

```
                           [600-607]
                           $425.000
                         /           \
                [600-603]             [604-607]
                $150.000              $275.000
               /        \            /         \
         [600-601]   [602-603]  [604-605]   [606-607]
         $100.000    $50.000    $200.000    $75.000
          /   \       /   \       /   \       /   \
      [600][601]  [602][603]  [604][605]  [606][607]
        0 $100K     0  $50K     0 $200K     0  $75K
```

**Como uma consulta `query(600, 605)` funciona?**

O algoritmo desce pela árvore, usando os nós que já agregam intervalos
inteiros sempre que possível, em vez de visitar folhas uma a uma:

1. Nó `[600-607]`: a faixa pedida `[600,605]` cobre só parte. Desce.
2. Nó `[600-603]`: **totalmente dentro** de `[600,605]`. Usa o valor: **$150.000**. Não desce mais.
3. Nó `[604-607]`: parcial. Desce.
4. Nó `[604-605]`: **totalmente dentro**. Usa o valor: **$200.000**.
5. Nó `[606-607]`: **totalmente fora** (606 > 605). Retorna 0.

Total: `150.000 + 200.000 + 0 = $350.000`. Visitou 5 nós em vez de 6 folhas —
a economia cresce com o tamanho do domínio (`O(log n)` em vez de `O(n)`).

**Como um `update(603, +30.000)` funciona?**

Sobe da folha até a raiz, recalculando só os nós no caminho:

```
[603] 50K → 80K
  ↑
[602-603] 50K → 80K
  ↑
[600-603] 150K → 180K
  ↑
[600-607] 425K → 455K
```

3 nós atualizados (altura da árvore), os outros ficam intactos.

---

## Cenários reais

Com o estado acima (portfólio com $425.000, dos quais $350.000 estão na faixa
`[600,605]`) e uma estratégia com os caps:

- Faixa de score `[600, 605]`: máximo **$500.000**
- Cap total do portfólio: **$2.000.000**
- Cap por grade C: **$1.000.000** (exposição atual em C: $425.000)

### Cenário 1 — APROVADO

Pedido: `amount = $100.000, score = 603, grade = C, term = 36`

1. Score 603 está em [300, 850]. OK.
2. Total: `425.000 + 100.000 = 525.000 ≤ 2.000.000`. OK.
3. Faixa [600, 605]: `query(600, 605) = 350.000`. Checagem: `350.000 + 100.000 = 450.000 ≤ 500.000`. **OK.**
4. (Checagem de prazo — suponha que passe.)
5. Grade C: `425.000 + 100.000 = 525.000 ≤ 1.000.000`. OK.

**Aprovado.** Depois do commit, a exposição em `[600,605]` vira **$450.000**.

### Cenário 2 — REJEITADO

Agora chega o próximo: `amount = $100.000, score = 602, grade = C`

1. Score 602 ok.
2. Total: `525.000 + 100.000 = 625.000 ≤ 2.000.000`. OK.
3. Faixa [600, 605]: `query(600, 605) = 450.000`. Checagem: `450.000 + 100.000 = 550.000 > 500.000`. **FALHA.**

**Rejeitado** com a razão `"score range 600-605 cap $500,000 would be breached"`.
Nenhuma outra regra é checada — a primeira que falha já decide.

### Cenário 3 — REJEITADO por cap total

Estado: já emprestamos $1.950.000 no portfólio. Pedido de $100.000.

1. Score ok.
2. Total: `1.950.000 + 100.000 = 2.050.000 > 2.000.000`. **FALHA.**

**Rejeitado** com `"total portfolio limit exceeded"`. Mesmo que caiba em
todos os outros caps, o teto global veta.

### Por que isso é rápido?

Sem a segment tree, o cenário 1 teria que varrer todos os empréstimos já
aprovados pra somar os que caem em `[600,605]`. Com 1 milhão de empréstimos no
portfólio, isso é 1 milhão de comparações por pedido. Com a árvore, são ~10
nós visitados (log₂ de 850−300+1 ≈ 10). A decisão acontece em milissegundos
mesmo sob alto volume.

---

## Estrutura do projeto

```
segtree/
├── Cargo.toml
├── src/
│   ├── lib.rs            re-exports públicos
│   ├── segtree.rs        SegmentTree (point update / range sum)
│   ├── models.rs         LoanRequest, Decision, RangeLimit, Grade, Status
│   ├── engine.rs         Strategy + DecisionEngine
│   └── bin/
│       └── demo.rs       demo CLI — pipeline fixo de 6 pedidos
└── tests/
    └── integration.rs    testes da árvore + engine
```

### SegmentTree — `src/segtree.rs`

```rust
pub struct SegmentTree {
    low: i64,
    high: i64,
    n: usize,           // high - low + 1
    tree: Vec<f64>,     // tamanho 4n, 1-indexado
}
```

| Método                        | Complexidade | O que faz                                       |
| ----------------------------- | ------------ | ----------------------------------------------- |
| `SegmentTree::new(low, high)` | `O(n)`       | Aloca e zera o array de tamanho `4n`.           |
| `update(key, delta)`          | `O(log n)`   | Soma `delta` na folha `key` e propaga pra cima. |
| `query(low, high)`            | `O(log n)`   | Soma em `[low, high]`, limitada ao domínio.     |

`query` aceita limites fora do domínio (trunca pra dentro). `update` dá panic
em chaves inválidas — é bug de programação, não dado ruim do usuário.

### DecisionEngine — `src/engine.rs`

```rust
pub struct DecisionEngine {
    pub strategy: Strategy,
    score_tree:   SegmentTree,   // domínio 300..=850
    term_tree:    SegmentTree,   // domínio 1..=84
    grade_map:    HashMap<Grade, f64>,
    total_exposure: f64,
}
```

**Duas árvores** porque score e prazo são dimensões numéricas independentes.
**Hash map** para grade porque grade é categórica (A/B/C/D/E), não faz sentido
pedir "exposição das grades B até D".

Além de `evaluate(req)`, expõe: `total_exposure()`, `grade_exposure(grade)`,
`grade_map()`, `exposure_in_range("score" | "term", low, high)`.

---

## Como rodar

Requer Rust ≥ 1.75 (edition 2021).

```bash
cargo build --all-targets    # compila lib + binário
cargo test                   # roda os 7 testes de integração
cargo run --bin demo         # pipeline de 6 pedidos no terminal
```

---

## Notas de design

- **`f64` pra dinheiro, `i64` pras chaves.** Paridade com a versão Python
  original. Chaves são inteiros pequenos (score 300–850, prazo 1–84), então
  `i64` sobra e aritmética inteira evita armadilhas de comparação de float
  dentro da árvore.
- **Sem persistência.** Estado mora na memória e reseta no restart. Extensões
  possíveis: Redis para as árvores, Kafka para updates em streaming,
  PostgreSQL + cache híbrido.
- **Panic vs. erro de negócio.** `SegmentTree::update` dá panic em chave
  inválida (bug de programação). `DecisionEngine::evaluate` retorna
  `Decision::rejected` para violações de regra (comportamento esperado).

---

## Quando usar essa abordagem

**Faz sentido quando:**

- Alto volume de pedidos (milhares por segundo)
- Decisão em tempo real (milissegundos)
- Restrições de portfólio dinâmicas (caps que dependem do estado atual)

**É exagero quando:**

- Processamento em batch resolve
- Baixo tráfego
- Regras simples sem consultas por faixa
