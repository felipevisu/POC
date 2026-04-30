import { ChordProParser } from "chordsheetjs";
import type { Song, Paragraph, Line, ChordLyricsPair } from "chordsheetjs";

interface Props {
  content: string;
}

const SECTION_COLORS: Record<string, string> = {
  verse: "#94a3b8",
  chorus: "#38bdf8",
  bridge: "#f472b6",
  intro: "#818cf8",
  outro: "#818cf8",
  indeterminate: "#94a3b8",
};

const SECTION_LABELS: Record<string, string> = {
  verse: "Verso",
  chorus: "Refrão",
  bridge: "Ponte",
  intro: "Intro",
  outro: "Outro",
};

export default function ChordProRenderer({ content }: Props) {
  let song: Song;
  try {
    song = new ChordProParser().parse(content);
  } catch {
    return <pre style={{ color: "#e2e8f0", lineHeight: 1.8 }}>{content}</pre>;
  }

  // Filter out metadata-only paragraphs (all lines have 0 items or only Tags)
  const paragraphs = song.paragraphs.filter((p) =>
    p.lines.some((l) => l.items.length > 0)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {paragraphs.map((para, i) => (
        <ParagraphBlock key={i} paragraph={para} />
      ))}
    </div>
  );
}

function ParagraphBlock({ paragraph }: { paragraph: Paragraph }) {
  const type = paragraph.type ?? "indeterminate";
  const accent = SECTION_COLORS[type] ?? "#94a3b8";
  const defaultLabel = SECTION_LABELS[type];
  const label = paragraph.label ?? defaultLabel ?? null;

  const lines = paragraph.lines.filter((l) => l.items.length > 0);

  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: accent,
            marginBottom: "0.6rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 1,
              background: accent,
              opacity: 0.5,
            }}
          />
          {label}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.15rem",
          borderLeft: type === "chorus" ? `2px solid ${accent}44` : "none",
          paddingLeft: type === "chorus" ? "1rem" : 0,
        }}
      >
        {lines.map((line, i) => (
          <LyricLine key={i} line={line} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function LyricLine({
  line,
  accent,
}: {
  line: Line;
  accent: string;
}) {
  // Cast to the concrete type we care about
  const pairs = line.items as ChordLyricsPair[];
  const hasChords = pairs.some((p) => p.chords?.trim());

  if (!hasChords) {
    // Plain lyrics row
    const text = pairs.map((p) => p.lyrics ?? "").join("");
    return (
      <span
        style={{
          display: "block",
          fontSize: "1.05rem",
          lineHeight: 2,
          color: "#e2e8f0",
        }}
      >
        {text || "\u00A0"}
      </span>
    );
  }

  // Chord + lyric row: each pair is a vertical stack (chord on top, lyric below)
  return (
    <span
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        lineHeight: 1,
      }}
    >
      {pairs.map((pair, i) => (
        <ChordPair key={i} pair={pair} accent={accent} />
      ))}
    </span>
  );
}

function ChordPair({
  pair,
  accent,
}: {
  pair: ChordLyricsPair;
  accent: string;
}) {
  const chord = pair.chords?.trim() ?? "";
  const lyric = pair.lyrics ?? "";

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginRight: lyric.endsWith(" ") ? 0 : "0.05em",
      }}
    >
      {/* Chord row */}
      <span
        style={{
          fontSize: "0.78rem",
          fontWeight: 700,
          color: chord ? accent : "transparent",
          letterSpacing: "0.04em",
          lineHeight: 1.4,
          fontFamily: "monospace",
          minWidth: chord ? "1ch" : 0,
          userSelect: "none",
        }}
      >
        {chord || "\u00A0"}
      </span>
      {/* Lyric row */}
      <span
        style={{
          fontSize: "1.05rem",
          color: "#e2e8f0",
          lineHeight: 1.8,
          whiteSpace: "pre",
        }}
      >
        {lyric || "\u00A0"}
      </span>
    </span>
  );
}
