import json
from docling.document_converter import DocumentConverter

source = "https://arxiv.org/pdf/2408.09869"
converter = DocumentConverter()
result = converter.convert(source)

f = open("docling.md", "a")
f.write(result.document.export_to_markdown())
f.close()

f = open("docling.html", "a")
f.write(result.document.export_to_html())
f.close()

f = open("docling.json", "a")
f.write(json.dumps(result.document.export_to_dict()))
f.close()

f = open("docling.xml", "a")
f.write(result.document.export_to_document_tokens())
f.close()
