#!/usr/bin/env python3
"""JSP -> every expression that renders or binds data (Struts 1 tags, Struts 2 tags, JSTL/EL, scriptlets).

Usage: jsp_bindings.py <file.jsp> [more.jsp ...]
Prints JSON list of {file, line, kind, expr}. Includes are listed (kind=include) so they can be followed.
"""
import json
import re
import sys

TAG = re.compile(r"<(bean|html|logic|nested|s|c|fmt|tiles|jsp):(\w+)\b([^>]*)>", re.S)
EL = re.compile(r"\$\{([^}]+)\}")
OGNL = re.compile(r"%\{([^}]+)\}")
SCRIPTLET_GET = re.compile(r"(request|session|application|pageContext)\.getAttribute\(\s*\"([^\"]+)\"")
EXPR = re.compile(r"<%=(.+?)%>", re.S)
STATIC_INCLUDE = re.compile(r"<%@\s*include\s+file\s*=\s*\"([^\"]+)\"")


def attrs(s):
    return dict(re.findall(r'([\w-]+)\s*=\s*"([^"]*)"', s))


def scan(path):
    text = open(path, encoding="utf-8", errors="replace").read()
    line = lambda pos: text.count("\n", 0, pos) + 1  # noqa: E731
    out = []

    def add(pos, kind, expr):
        out.append({"file": path, "line": line(pos), "kind": kind, "expr": expr})

    for m in TAG.finditer(text):
        lib, tag, a = m.group(1), m.group(2), attrs(m.group(3))
        if lib == "jsp" and tag == "include" or lib == "tiles" and tag in ("insert", "insertAttribute"):
            add(m.start(), "include", a.get("page") or a.get("attribute") or a.get("name") or "")
            continue
        # name/property (Struts 1), value (Struts 2 / JSTL), items (c:forEach), id/var (loop variable)
        keys = [k for k in ("name", "property", "value", "items", "collection", "id", "var", "list") if k in a]
        if keys:
            add(m.start(), f"{lib}:{tag}", " ".join(f"{k}={a[k]}" for k in keys))
    for m in EL.finditer(text):
        add(m.start(), "el", m.group(1).strip())
    for m in OGNL.finditer(text):
        add(m.start(), "ognl", m.group(1).strip())
    for m in SCRIPTLET_GET.finditer(text):
        add(m.start(), "scriptlet", f"{m.group(1)}.getAttribute({m.group(2)})")
    for m in EXPR.finditer(text):
        add(m.start(), "expression", m.group(1).strip())
    for m in STATIC_INCLUDE.finditer(text):
        add(m.start(), "include", m.group(1))
    return sorted(out, key=lambda b: b["line"])


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    print(json.dumps([b for f in sys.argv[1:] for b in scan(f)], indent=2, ensure_ascii=False))
