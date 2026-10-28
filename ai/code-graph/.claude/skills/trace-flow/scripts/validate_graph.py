#!/usr/bin/env python3
"""Checks graph.json against the code so the graph cannot reference things that do not exist.

Usage: validate_graph.py <graph.json> [--root DIR]
Exit 0 = valid (warnings may be printed). Exit 1 = errors, one per line, fix and re-run.
"""
import argparse
import json
import os
import sys

KINDS = {"url", "action", "form", "service", "dao", "sql", "table", "external_api",
         "transform", "branch", "jsp", "field", "other"}
LAYERS = {"view", "controller", "service", "data", "db", "external"}
EDGE_KINDS = {"calls", "returns", "reads", "writes", "forwards", "renders", "branch", "transform", "maps"}
NO_CODE = {"url", "table", "external_api"}  # these may live outside the codebase
ANCHOR_WINDOW = 3  # anchor may be a few lines off (annotations, multi-line signatures)


def validate(g, root):
    errors, warnings = [], []
    nodes = g.get("nodes") or []
    if not g.get("entry"):
        errors.append("graph: missing 'entry' (the traced URL)")
    if not g.get("summary"):
        errors.append("graph: missing 'summary' (where the data comes from, in one or two sentences)")
    if not nodes:
        errors.append("graph: no nodes")
    ids, lines_cache = set(), {}
    for i, n in enumerate(nodes):
        where = f"node[{i}] {n.get('id', '?')}"
        if not n.get("id") or n["id"] in ids:
            errors.append(f"{where}: missing or duplicate id")
        ids.add(n.get("id"))
        if n.get("kind") not in KINDS:
            errors.append(f"{where}: kind {n.get('kind')!r} not in {sorted(KINDS)}")
        if n.get("layer") not in LAYERS:
            errors.append(f"{where}: layer {n.get('layer')!r} not in {sorted(LAYERS)}")
        if not n.get("label"):
            errors.append(f"{where}: missing label")
        if not n.get("explanation"):
            errors.append(f"{where}: missing explanation (what happens to the data here, in plain words)")
        for k in ("rules", "attention"):
            if not isinstance(n.get(k, []), list):
                errors.append(f"{where}: {k} must be a list of strings")
        if n.get("kind") in NO_CODE and not n.get("file"):
            continue
        f, line, anchor = n.get("file"), n.get("line"), n.get("anchor")
        if not (f and isinstance(line, int) and anchor):
            errors.append(f"{where}: code node needs file, line (int) and anchor (literal text on that line)")
            continue
        path = os.path.join(root, f)
        if not os.path.isfile(path):
            errors.append(f"{where}: file not found: {f}")
            continue
        if path not in lines_cache:
            lines_cache[path] = open(path, encoding="utf-8", errors="replace").read().splitlines()
        src = lines_cache[path]
        if not 1 <= line <= len(src):
            errors.append(f"{where}: line {line} out of range (file has {len(src)})")
            continue
        window = src[max(0, line - 1 - ANCHOR_WINDOW): line + ANCHOR_WINDOW]
        if not any(anchor in s for s in window):
            found = [i + 1 for i, s in enumerate(src) if anchor in s]
            hint = f"; found at line(s) {found[:5]}" if found else "; not found anywhere in file"
            errors.append(f"{where}: anchor {anchor!r} not near {f}:{line}{hint}")

    adj = {i: set() for i in ids}
    for j, e in enumerate(g.get("edges") or []):
        where = f"edge[{j}] {e.get('from')}->{e.get('to')}"
        if e.get("from") not in ids or e.get("to") not in ids:
            errors.append(f"{where}: unknown node id")
            continue
        if e.get("kind") not in EDGE_KINDS:
            errors.append(f"{where}: kind {e.get('kind')!r} not in {sorted(EDGE_KINDS)}")
        if e.get("kind") in ("branch", "transform") and not e.get("label"):
            errors.append(f"{where}: {e['kind']} edge needs a label (the condition / the transformation)")
        adj[e["from"]].add(e["to"])
        adj[e["to"]].add(e["from"])

    insights = g.get("insights") or {}
    if not insights.get("rules"):
        errors.append("graph: insights.rules is empty (list the business rules found along the path)")
    for section, items in insights.items():
        for k, it in enumerate(items if isinstance(items, list) else [items]):
            ref = it.get("node") if isinstance(it, dict) else None
            if ref and ref not in ids:
                errors.append(f"insights.{section}[{k}]: unknown node id {ref!r}")

    if nodes and not errors:
        seen, stack = set(), [nodes[0]["id"]]
        while stack:
            cur = stack.pop()
            if cur not in seen:
                seen.add(cur)
                stack += adj[cur]
        orphans = ids - seen
        if orphans:
            warnings.append(f"disconnected nodes (not linked to the rest): {sorted(orphans)}")
    return errors, warnings


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("graph")
    ap.add_argument("--root", default=".")
    a = ap.parse_args()
    errors, warnings = validate(json.load(open(a.graph, encoding="utf-8")), os.path.abspath(a.root))
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{len(errors)} error(s), {len(warnings)} warning(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
