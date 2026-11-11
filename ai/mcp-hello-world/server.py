import json
from pathlib import Path
from mcp.server.mcpserver import MCPServer

NOTES = Path(__file__).parent / "notes.json"
mcp = MCPServer("notes")

def load() -> list[dict]:
    return json.loads(NOTES.read_text()) if NOTES.exists() else []

@mcp.tool()
def add_note(title: str, body: str) -> str:
    """Save a note."""
    notes = load() + [{"title": title, "body": body}]
    NOTES.write_text(json.dumps(notes, indent=2))
    return f"Saved '{title}' ({len(notes)} notes total)"

@mcp.tool()
def search_notes(query: str) -> list[dict]:
    """Find notes whose title or body contains the query."""
    q = query.lower()
    return [n for n in load() if q in n["title"].lower() or q in n["body"].lower()]

@mcp.resource("notes://all")
def all_notes() -> str:
    """Every saved note."""
    return NOTES.read_text() if NOTES.exists() else "[]"

@mcp.prompt()
def summarize_notes() -> str:
    """Summarize all saved notes."""
    return f"Summarize these notes in 3 bullets:\n{all_notes()}"

mcp.run()