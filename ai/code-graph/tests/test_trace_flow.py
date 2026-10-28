"""Run: python3 -m unittest discover tests"""
import json
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SCRIPTS = os.path.join(REPO, ".claude", "skills", "trace-flow", "scripts")
APP = os.path.join(REPO, "examples", "legacy-app")
GRAPH = os.path.join(REPO, "examples", "expected", "graph.json")


def run(script, *args):
    return subprocess.run([sys.executable, os.path.join(SCRIPTS, script), *args], capture_output=True, text=True)


class ResolveUrl(unittest.TestCase):
    def test_struts1_with_tiles(self):
        r = run("resolve_url.py", "http://host/app/cliente/detalhe.do?id=1", "--root", APP)
        self.assertEqual(r.returncode, 0, r.stdout)
        hit = json.loads(r.stdout)
        self.assertEqual(hit["framework"], "struts1")
        self.assertEqual(hit["class_file"], "src/main/java/com/acme/web/DetalheClienteAction.java")
        self.assertEqual(hit["form"]["class"], "com.acme.web.ClienteForm")
        sucesso = next(f for f in hit["forwards"] if f["name"] == "sucesso")
        self.assertIn("WebContent/WEB-INF/jsp/cliente/detalhe.jsp", [v["file"] for v in sucesso["views"]])

    def test_struts2_wildcard(self):
        hit = json.loads(run("resolve_url.py", "/app/pedido/ver_resumo.action", "--root", APP).stdout)
        self.assertEqual((hit["framework"], hit["method"]), ("struts2", "resumo"))

    def test_no_match(self):
        self.assertEqual(run("resolve_url.py", "/app/nada.do", "--root", APP).returncode, 1)


class JspBindings(unittest.TestCase):
    def test_finds_tags_el_and_includes(self):
        out = json.loads(run("jsp_bindings.py", os.path.join(APP, "WebContent/WEB-INF/jsp/cliente/detalhe.jsp")).stdout)
        found = {(b["kind"], b["expr"]) for b in out}
        self.assertIn(("bean:write", "name=saldoFormatado"), found)
        self.assertIn(("el", "cotacao.valor"), found)
        self.assertIn(("include", "/WEB-INF/jsp/cabecalho.jspf"), found)


class ValidateAndRender(unittest.TestCase):
    def test_expected_graph_is_valid(self):
        r = run("validate_graph.py", GRAPH, "--root", APP)
        self.assertEqual(r.returncode, 0, r.stdout)

    def test_wrong_line_and_dangling_edge_fail(self):
        g = json.load(open(GRAPH, encoding="utf-8"))
        g["nodes"][1]["line"] = 3
        g["edges"].append({"from": "n1", "to": "nope", "kind": "calls"})
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as fh:
            json.dump(g, fh)
        r = run("validate_graph.py", fh.name, "--root", APP)
        os.unlink(fh.name)
        self.assertEqual(r.returncode, 1)
        self.assertIn("found at line(s) [13]", r.stdout)
        self.assertIn("unknown node id", r.stdout)

    def test_missing_explanation_and_insights_fail(self):
        g = json.load(open(GRAPH, encoding="utf-8"))
        del g["nodes"][2]["explanation"]
        g["insights"]["rules"] = []
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as fh:
            json.dump(g, fh)
        r = run("validate_graph.py", fh.name, "--root", APP)
        os.unlink(fh.name)
        self.assertEqual(r.returncode, 1)
        self.assertIn("missing explanation", r.stdout)
        self.assertIn("insights.rules is empty", r.stdout)

    def test_render_embeds_graph(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "t.html")
            self.assertEqual(run("render.py", GRAPH, "--root", APP, "--out", out).returncode, 0)
            html = open(out, encoding="utf-8").read()
            self.assertNotIn("/*__GRAPH__*/null", html)
            self.assertIn("ClienteService.saldoDisponivel", html)


if __name__ == "__main__":
    unittest.main()
