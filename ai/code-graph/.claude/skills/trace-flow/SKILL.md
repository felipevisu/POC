---
name: trace-flow
description: Trace how data flows in a legacy Java Struts (1 or 2) app from a screen URL down to the database (JDBC SQL) or external REST API and back up to the JSP, then render an interactive HTML graph with file:line for every node. Use when the user gives a .do/.action URL or a screen and asks where data comes from, "trace this screen", "de onde vem este campo", "rastrear fluxo", "mapear tela para migração".
---

# trace-flow

Builds `graph.json` for one URL (optionally one field on the screen), validates every node against the code, and renders `trace.html`.

Scripts live in `scripts/` next to this file (use the skill's base directory). Run them with `python3`, stdlib only. `--root` is the legacy repo root.

## Input

- **URL** (required): e.g. `http://host/app/cliente/detalhe.do?id=1&method=ver`.
- **Field** (optional, strongly preferred): e.g. "Saldo". When given, trace only what feeds that field; it cuts most branches. If the user didn't give one, ask once whether they want the whole screen or one field.

Output dir: `.trace-flow/<slug-of-path>[-<field>]/` in the repo root (add `.trace-flow/` to `.gitignore` if missing).

## Steps

1. **Resolve the URL**
   `python3 scripts/resolve_url.py "<url>" --root <repo>`
   Gives framework, Action class + file, method, form bean, forwards → JSP files (Tiles resolved).
   - Struts 1 with `dispatch_parameter`: open the Action class. If it extends `DispatchAction`/`LookupDispatchAction`, method = value of that request param (already filled when the URL had it). If `MappingDispatchAction`, method = the `parameter` value itself. `LookupDispatchAction` maps button labels via `getKeyMethodMap()` — read it.
   - Exit 1 (no mapping): Struts 2 may use annotations (`@Action`, `@Namespace`) or the convention plugin; grep for the action name. Also check the URL's context path is not part of the action path.
   - A forward with `chain` (another `.do`/`.action`) means a second action runs: resolve it too and link with a `forwards` edge.

2. **List what the screen shows**
   `python3 scripts/jsp_bindings.py <jsp files from step 1>`
   Follow every `include` result (jsp:include, <%@ include %>, tiles) and scan those too. Keep only bindings relevant to the field, if one was given.
   - Struts 1: `bean:write name=X property=Y` reads attribute `X` (request/session/page) or the form bean; `html:*` `property=Y` reads the ActionForm getter `getY()`.
   - Struts 2: `s:property value=x` reads the Action getter `getX()` (value stack). OGNL `%{}` likewise.
   - EL `${x.y}`: attribute `x`, getter `getY()`.

3. **Trace top-down** from `<class>.<method>`. Prefer the LSP tool (go to definition, incoming/outgoing calls) when a Java language server is available; otherwise grep for the method name and read the file. For each call that touches data, add a node and follow it. Stop at a terminal:
   - **JDBC**: `prepareStatement(`, `createStatement(`, `prepareCall(` (stored procedure), `executeQuery(`, `executeUpdate(`. Read the SQL text (often built by string concatenation or in constants / `.properties` / `.xml` files: grep the constant). Create a `sql` node at the line where the SQL string is defined and `table` nodes (`TABLE.COLUMN`) for the columns that feed the traced fields. Also trace the `ResultSet` mapping: `rs.getString("COL")` → `dto.setX(...)` is where column becomes field — record it as a `transform`/`maps` edge with the column name.
   - **REST**: `HttpURLConnection`, `HttpClient` (Apache/Java 11), `RestTemplate`, `WebClient`, `Client`/`WebTarget` (JAX-RS), `OkHttpClient`. Create an `external_api` node labeled `METHOD url-or-path` (resolve the base URL from constants/properties when possible) and trace how the response is parsed (Jackson `readValue`, Gson `fromJson`, manual JSON) into which fields.
   - Interfaces / factories / `Class.forName` / Spring beans: find the implementation actually used (grep `implements X`, config XML, factory code). If several are possible, include each with a `branch` edge labeled with the selection condition.
   Max depth: 12 calls from the Action. If deeper, stop and add it to `insights.unresolved`.

4. **Trace bottom-up** from each binding in step 2: find where that attribute/getter is set (`request.setAttribute("X"`, `session.setAttribute`, `form.setY(`, Action field assignment in Struts 2). Connect it to the nodes from step 3. The bottom-up and top-down halves must meet; a binding you cannot connect stays as a `field` node and goes to `insights.unresolved` with what you searched for.

5. **Record branches and transformations.** Every `if`/`switch`/ternary that changes *which* data or *how* it is computed becomes a `branch` edge labeled with the condition as written in code (`if (cliente.isPJ())`). Every formatting, conversion, calculation or merge becomes a `transform` edge labeled with what changed (`BigDecimal → "R$ 1.234,56"`, `saldo - bloqueado`). These are the business rules the migration must preserve; don't skip them.

6. **Explain, don't just point at code.** The reader already has the code; what they lack is understanding. Write in the user's language (Portuguese if they wrote in Portuguese), in business terms, for someone who will rebuild this screen in a new stack. For every node:
   - `explanation` (required): 1–3 sentences on what happens to the data here and why it matters. Not "calls dao.x()" but "busca saldo e bloqueado numa única consulta e decide, pelo tipo de pessoa, se desconta o bloqueado".
   - `data_in` / `data_out`: the shape of the data entering and leaving (`id (String)` → `BigDecimal[] {SALDO, BLOQUEADO}`). Make the moment a number becomes formatted text, or a code becomes a label, explicit.
   - `rules`: business rules decided at this node, one per item, stated as rules (`PF: SALDO − BLOQUEADO`).
   - `attention`: what would bite a migration: unchecked nulls / `rs.next()`, silent defaults, hardcoded locale/dates/magic numbers, rules hidden in the wrong layer, SQL by string concatenation, swallowed exceptions, session state, N+1 queries. Only what you actually saw in the code.
   - `migration`: one concrete suggestion for the new architecture (endpoint shape, where the rule should live, what moves to the frontend).
   Then fill the graph-level `summary` and `insights` (`rules`, `attention`, `migration`, `unresolved`), linking items to nodes with `{"text": ..., "node": "nX"}` so they are clickable in the HTML. `insights.migration` should include a suggested endpoint contract for the traced data.
   Never invent: a rule or risk you can't point to in a node's code doesn't go in.

7. **Write `graph.json`** (schema below), then validate:
   `python3 scripts/validate_graph.py <out>/graph.json --root <repo>`
   Fix every ERROR and re-run until it exits 0. Never weaken an anchor to make it pass: if the anchor isn't in the code, the node is wrong.

8. **Render and open:**
   `python3 scripts/render.py <out>/graph.json --root <repo>` then `open <out>/trace.html` (macOS) / `xdg-open` (Linux).

9. **Reply** with: the path to `trace.html`, the main chain in one line (JSP field ← Action ← Service ← DAO ← `TABLE.COL` / API), the business rules, the top attention points, and anything unresolved.

## graph.json schema

```json
{
  "entry": "/cliente/detalhe.do",
  "field": "Saldo",
  "summary": "1–2 sentences: where the data comes from and the key rule",
  "insights": {
    "rules": [{"text": "PF: saldo = SALDO − BLOQUEADO", "node": "n9"}],
    "attention": [{"text": "rs.next() sem checagem: cliente sem conta quebra a tela", "node": "n4"}],
    "migration": ["GET /clientes/{id}/saldo → { saldo, bloqueado, disponivel, tipoPessoa }"],
    "unresolved": []
  },
  "nodes": [
    {
      "id": "n2",
      "kind": "action",
      "layer": "controller",
      "label": "DetalheClienteAction.execute",
      "file": "src/main/java/com/acme/web/DetalheClienteAction.java",
      "line": 13,
      "anchor": "public ActionForward execute",
      "explanation": "Ponto de entrada da tela: lê o id, pede o saldo ao service, formata como moeda e coloca no request.",
      "data_in": "ClienteForm.id",
      "data_out": "request.saldoFormatado (String)",
      "rules": [],
      "attention": ["Locale pt-BR fixo"],
      "migration": "Vira o controller REST; a formatação vai para o frontend."
    }
  ],
  "edges": [
    {"from": "n1", "to": "n2", "kind": "calls", "label": "required for branch/transform", "explanation": "optional, shown on click"}
  ]
}
```
Full worked example: `examples/expected/graph.json` in the code-graph repo.

- `kind`: `url | action | form | service | dao | sql | table | external_api | transform | branch | jsp | field | other`
- `layer`: `view | controller | service | data | db | external`
- edge `kind`: `calls | returns | reads | writes | forwards | renders | branch | transform | maps`
- `file` is relative to `--root`. `anchor` is a literal substring that appears on `line` (±3 lines). Required for every node except `url`, `table`, `external_api` without a file.
- Direction: edges follow the data's path to the screen: request → action → service → dao → sql → table, then `returns`/`maps` edges carry data back up → jsp → field. Clicking a node in the HTML highlights everything upstream and downstream of it.
- Required by the validator: `summary`, non-empty `insights.rules`, and `explanation` on every node.
- Ids are short (`n1`, `n2`…). Labels are short (`Class.method`, `CONTA.SALDO`, `GET /cotacao/{moeda}`); detail goes in `explanation`.
