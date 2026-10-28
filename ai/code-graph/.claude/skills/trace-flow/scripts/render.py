#!/usr/bin/env python3
"""graph.json -> self-contained trace.html (code snippets embedded, so it works offline from the repo).

Usage: render.py <graph.json> [--root DIR] [--out trace.html]
"""
import argparse
import json
import os

CONTEXT = 6  # lines of code shown around each node


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("graph")
    ap.add_argument("--root", default=".")
    ap.add_argument("--out")
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    g = json.load(open(a.graph, encoding="utf-8"))
    for n in g["nodes"]:
        if n.get("file") and n.get("line"):
            path = os.path.join(root, n["file"])
            if os.path.isfile(path):
                src = open(path, encoding="utf-8", errors="replace").read().splitlines()
                start = max(1, n["line"] - CONTEXT)
                n["snippet"] = {"start": start, "lines": src[start - 1: n["line"] + CONTEXT]}
                n["abs"] = path
    template = open(os.path.join(os.path.dirname(__file__), "..", "template", "trace.html"), encoding="utf-8").read()
    data = json.dumps(g, ensure_ascii=False).replace("</", "<\\/")  # keep </script> in code from closing the tag
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.graph)), "trace.html")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(template.replace("/*__GRAPH__*/null", data))
    print(out)


if __name__ == "__main__":
    main()
