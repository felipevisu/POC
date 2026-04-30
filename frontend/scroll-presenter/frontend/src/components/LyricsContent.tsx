import { useState } from "react";
import ChordProRenderer from "./ChordProRenderer";

interface LyricsContentProps {
  content: string;
  onSave?: (text: string) => void; // only provided for the controller
}

export default function LyricsContent({ content, onSave }: LyricsContentProps) {
  const [editing, setEditing] = useState(false);

  const handleSave = (text: string) => {
    onSave?.(text);
    setEditing(false);
  };

  return (
    <>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "7rem 2rem 8rem" }}>
        {/* Song header */}
        <header style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Legião Urbana · Que País É Este · 1987
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, background: "linear-gradient(135deg, #818cf8 30%, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.15, marginBottom: "1.5rem" }}>
            Faroeste Caboclo
          </h1>
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #818cf8, #38bdf8)", borderRadius: 2, margin: "0 auto" }} />
        </header>

        {content.trim() === "" ? (
          <EmptyState canEdit={!!onSave} onEdit={() => setEditing(true)} />
        ) : (
          <ChordProRenderer content={content} />
        )}
      </div>

      {/* Floating edit button — controller only */}
      {onSave && (
        <button
          onClick={() => setEditing(true)}
          title="Edit lyrics"
          style={{ position: "fixed", bottom: "1rem", left: "1rem", zIndex: 150, width: 40, height: 40, borderRadius: "50%", border: "1px solid #334155", background: "rgba(15,15,17,0.9)", color: "#64748b", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}
        >
          ✏️
        </button>
      )}

      {editing && onSave && (
        <PasteOverlay initial={content} onSave={handleSave} onCancel={() => setEditing(false)} />
      )}
    </>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ canEdit, onEdit }: { canEdit: boolean; onEdit: () => void }) {
  return (
    <div style={{ border: "2px dashed #334155", borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
      <span style={{ fontSize: "2.5rem" }}>🎸</span>
      <p style={{ fontWeight: 600, color: "#94a3b8", fontSize: "1.1rem" }}>No lyrics yet</p>
      {canEdit ? (
        <>
          <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, maxWidth: 380 }}>
            Copy the lyrics from{" "}
            <a href="https://www.letras.mus.br/legiao-urbana/" target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8" }}>letras.mus.br</a>{" "}
            or{" "}
            <a href="https://www.vagalume.com.br/legiao-urbana/" target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8" }}>vagalume.com.br</a>
            , then paste them below.
          </p>
          <button onClick={onEdit} style={{ padding: "0.65rem 1.5rem", borderRadius: "0.5rem", border: "none", background: "linear-gradient(135deg,#818cf8,#38bdf8)", color: "#0f172a", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            ✏️ Paste lyrics
          </button>
        </>
      ) : (
        <p style={{ fontSize: "0.9rem", color: "#475569" }}>Waiting for the controller to add lyrics…</p>
      )}
    </div>
  );
}

// ── Paste overlay ──────────────────────────────────────────────────────────────

function PasteOverlay({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          background: "#0f1117",
          border: "1px solid #334155",
          borderRadius: "1rem",
          padding: "1.5rem",
          width: "100%",
          maxWidth: 680,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxHeight: "90vh",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0" }}>
            Paste ChordPro
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#475569" }}>
            Supports ChordPro syntax — <code style={{ color: "#38bdf8" }}>[Am]</code> chords inline, <code style={{ color: "#38bdf8" }}>{"{start_of_chorus}"}</code> sections
          </span>
        </div>

        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
`{title: Song Title}
{artist: Artist Name}

{start_of_verse}
[Am]Paste your [G]ChordPro [C]lyrics here
Plain line with no chords
{end_of_verse}

{start_of_chorus}
[F]Chorus [G]line [Am]here
{end_of_chorus}`
          }
          style={{
            flex: 1,
            minHeight: 400,
            resize: "vertical",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "0.5rem",
            color: "#e2e8f0",
            fontSize: "0.9rem",
            lineHeight: 1.8,
            padding: "1rem",
            outline: "none",
            fontFamily: "monospace",
          }}
        />

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              border: "1px solid #334155",
              background: "transparent",
              color: "#64748b",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "linear-gradient(135deg,#818cf8,#38bdf8)",
              color: "#0f172a",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Save &amp; close
          </button>
        </div>
      </div>
    </div>
  );
}
