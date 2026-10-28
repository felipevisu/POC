# code-graph — trace-flow

A Claude Code skill that traces how a piece of data flows through a legacy **Java + Struts (1 or 2)** system: from the screen URL down to the database (JDBC) or an external REST API, and back up to the field in the JSP. The output is an interactive HTML graph where every node points to `file:line` and explains what happens there, the business rules involved, what to watch out for, and a suggestion for the migration.

Built for migrating a Struts legacy app to a modern backend + frontend. Instead of reading dozens of classes to find out where a field comes from, you ask for a trace and get the path and the rules.

## Install

```bash
cp -r .claude/skills/trace-flow ~/.claude/skills/
```

Start a new Claude Code session after copying. To use it in a single project only, copy it to `<project>/.claude/skills/` instead.

## Usage

From the root of the legacy repository:

```bash
claude
```

```
/trace-flow http://server/app/cliente/detalhe.do?id=123 field Saldo
```

or in plain words: *"where does the Saldo field on /app/cliente/detalhe.do?id=123 come from?"*

- Use the full URL from the browser. Parameters such as `method=...` decide which Action method runs.
- Prefer **one field at a time**: the graph stays small and the trace is faster.
- Output goes to `.trace-flow/<screen>/` (`graph.json` and `trace.html`), and the HTML opens in the browser.

## How it works

| Step | Done by |
|---|---|
| URL → Action, method, form, forwards, JSPs (Tiles, DispatchAction, Struts 2 wildcards) | `scripts/resolve_url.py` |
| What the screen renders: `bean:`/`html:`/`logic:`/`s:` tags, EL, scriptlets, includes | `scripts/jsp_bindings.py` |
| Action → Service → DAO → SQL/table or REST API, plus branches and transformations | Claude, guided by `SKILL.md` |
| Explanations, business rules, watch-outs and migration suggestions | Claude, guided by `SKILL.md` |
| Every node must exist in the code (`file:line` + a literal anchor) and have an explanation | `scripts/validate_graph.py` fails the graph until it is correct |
| `graph.json` → interactive HTML (Cytoscape + dagre) | `scripts/render.py` + `template/trace.html` |

The scripts use only Python 3 (stdlib). They can also be run on their own for debugging:

```bash
S=~/.claude/skills/trace-flow/scripts
python3 $S/resolve_url.py "http://server/app/cliente/detalhe.do?id=1" --root .
python3 $S/jsp_bindings.py path/to/screen.jsp
python3 $S/validate_graph.py .trace-flow/<screen>/graph.json --root .
python3 $S/render.py .trace-flow/<screen>/graph.json --root .
```

## Reading the HTML

- **Overview panel:** summary, business rules, watch-outs and migration suggestions. Each item is clickable and jumps to its node.
- **Graph:** the flow runs from the request (left) to the screen (right), colored by layer. A dashed line is a branch (`if`); an orange line is a data transformation.
- **Click a node:** highlights where the data comes from and where it goes, and shows the explanation, data in and out, rules, watch-outs, migration note, and the code with the line marked. Click the background to return to the overview.
- **Search:** jumps to a node by name.

## Example

`examples/legacy-app/` is a tiny Struts 1 app (Tiles, JDBC, REST) with a customer screen. `examples/expected/` holds the reference trace for the **Saldo** (balance) field, written by hand to show the expected result:

```bash
open examples/expected/trace.html
```

To watch the skill build the graph on its own and compare it with the reference:

```bash
cd examples/legacy-app && claude
# /trace-flow /app/cliente/detalhe.do?id=1 field Saldo
```

## Tests

```bash
python3 -m unittest discover tests
```

## Known limitations

- Struts 2 annotations (`@Action`) or the convention plugin are not in XML: the skill tells Claude to find them with grep.
- Struts 1 modules with a prefix in `web.xml`: the URL is matched by path suffix, which is usually enough.
- Static analysis only: the graph shows every possible branch, not the one that actually ran for a specific user.
- Explanations and rules are written by the AI. The validator guarantees every node exists in the code, but the interpretation should be reviewed.
