#!/usr/bin/env python3
"""URL -> Struts action mapping (Struts 1 or 2), with Java class, method, forwards and JSPs resolved to files.

Usage: resolve_url.py <url> [--root DIR]
Prints JSON to stdout. Exit 1 when no mapping matches.
"""
import argparse
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import parse_qs, urlparse

SKIP_DIRS = {".git", "target", "build", "bin", "out", "node_modules", ".idea", ".trace-flow"}


def walk(root, pred):
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for f in files:
            if pred(f):
                yield os.path.join(d, f)


def parse(path):
    try:
        return ET.parse(path).getroot()
    except ET.ParseError:
        return None


def line_of(path, needle):
    with open(path, encoding="utf-8", errors="replace") as fh:
        for i, line in enumerate(fh, 1):
            if needle in line:
                return i
    return None


class Finder:
    """Resolves FQNs and web paths to files under root (indexed once)."""

    def __init__(self, root):
        self.root = root
        self.files = list(walk(root, lambda f: f.endswith((".java", ".jsp", ".jspf", ".xml"))))

    def by_suffix(self, suffix):
        suffix = suffix.replace("\\", "/")
        hits = [f for f in self.files if f.replace("\\", "/").endswith(suffix)]
        return os.path.relpath(hits[0], self.root) if hits else None

    def java(self, fqn):
        return self.by_suffix("/" + fqn.split("$")[0].replace(".", "/") + ".java") if fqn else None

    def web(self, path):
        return self.by_suffix("/" + path.lstrip("/")) if path else None


def tiles_definitions(root):
    defs = {}
    for f in walk(root, lambda n: n.startswith("tiles") and n.endswith(".xml")):
        r = parse(f)
        if r is None:
            continue
        for d in r.iter("definition"):
            defs[d.get("name")] = {
                "file": f,
                "path": d.get("path") or d.get("template") or d.get("page"),
                "extends": d.get("extends"),
                "puts": {p.get("name"): p.get("value") for p in d.iter("put")}
                | {p.get("name"): p.get("value") for p in d.iter("put-attribute")},
            }
    return defs


def resolve_view(target, defs, finder, seen=None):
    """Forward target -> list of JSPs (follows Tiles definitions and 'extends')."""
    seen = seen or set()
    if not target or target in seen:
        return []
    seen.add(target)
    if target in defs:
        d, out = defs[target], []
        for v in [d["path"], *d["puts"].values()]:
            out += resolve_view(v, defs, finder, seen)
        return out + resolve_view(d["extends"], defs, finder, seen)
    if target.endswith((".jsp", ".jspf")):
        return [{"path": target, "file": finder.web(target)}]
    if target.endswith((".do", ".action")):
        return [{"chain": target}]  # forward to another action: trace it separately
    return []


def struts1(root_el, cfg, req_path, query, finder, defs):
    forms = {f.get("name"): f.get("type") for f in root_el.iter("form-bean")}
    globals_ = {f.get("name"): f.get("path") for gf in root_el.iter("global-forwards") for f in gf.iter("forward")}
    best = None
    for a in root_el.iter("action"):
        p = a.get("path")
        if p and re.search(re.escape(p) + r"(\.do)?$", req_path) and (best is None or len(p) > len(best.get("path"))):
            best = a
    if best is None:
        return None
    param = best.get("parameter")
    fwd = globals_ | {f.get("name"): f.get("path") for f in best.iter("forward")}  # local overrides global
    if best.get("input"):
        fwd["(input)"] = best.get("input")  # where validation errors go back to
    cls = best.get("type")
    return {
        "framework": "struts1",
        "config": os.path.relpath(cfg, finder.root),
        "config_line": line_of(cfg, f'"{best.get("path")}"'),
        "action_path": best.get("path"),
        "class": cls,
        "class_file": finder.java(cls),
        # DispatchAction: method = value of request param named by `parameter`;
        # MappingDispatchAction: `parameter` IS the method. Check the class's superclass to decide.
        "method": (query.get(param, [None])[0] if param else None) or "execute",
        "dispatch_parameter": param,
        "form": {"name": best.get("name"), "class": forms.get(best.get("name")),
                 "file": finder.java(forms.get(best.get("name"))), "scope": best.get("scope", "session")},
        "forwards": [{"name": n, "target": t, "views": resolve_view(t, defs, finder)} for n, t in fwd.items()],
    }


def struts2(root_el, cfg, req_path, finder, defs):
    path = re.sub(r"\.action$", "", req_path)
    best = None
    for pkg in root_el.iter("package"):
        ns = (pkg.get("namespace") or "").rstrip("/")
        for a in pkg.iter("action"):
            name = a.get("name") or ""
            rx = re.escape(ns + "/" + name).replace(r"\*", "([^/]*)") + "$"
            m = re.search(rx, path)
            if m and (best is None or len(name) > len(best[1].get("name"))):
                best = (ns, a, m.groups())
    if best is None:
        return None
    ns, a, groups = best

    def sub(s):  # wildcard mapping: {1}, {2}...
        return re.sub(r"\{(\d)\}", lambda g: groups[int(g.group(1)) - 1], s) if s else s

    cls = sub(a.get("class"))
    results = [{"name": r.get("name", "success"), "target": sub((r.text or "").strip())} for r in a.iter("result")]
    return {
        "framework": "struts2",
        "config": os.path.relpath(cfg, finder.root),
        "config_line": line_of(cfg, f'"{a.get("name")}"'),
        "action_path": f"{ns}/{a.get('name')}",
        "class": cls,
        "class_file": finder.java(cls),
        "method": sub(a.get("method")) or "execute",
        "form": None,  # Struts 2: the action itself holds the fields (getters are read by the JSP)
        "forwards": [r | {"views": resolve_view(r["target"], defs, finder)} for r in results],
    }


def resolve(url, root):
    u = urlparse(url)
    req_path, query = u.path or url, parse_qs(u.query)
    finder = Finder(root)
    defs = tiles_definitions(root)
    for cfg in walk(root, lambda n: n.startswith("struts") and n.endswith(".xml")):
        r = parse(cfg)
        if r is None:
            continue
        hit = None
        if r.tag == "struts-config":
            hit = struts1(r, cfg, req_path, query, finder, defs)
        elif r.tag == "struts":
            hit = struts2(r, cfg, req_path, finder, defs)
        if hit:
            hit["url"] = url
            return hit
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--root", default=".")
    a = ap.parse_args()
    hit = resolve(a.url, os.path.abspath(a.root))
    if not hit:
        print(json.dumps({"error": f"no struts mapping matches {a.url}",
                          "hint": "Struts 2 convention plugin / annotations (@Action) are not in XML: grep for the action name"}))
        sys.exit(1)
    print(json.dumps(hit, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
