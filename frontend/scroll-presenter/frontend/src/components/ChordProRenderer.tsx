import { ChordProParser } from "chordsheetjs";
import type { Song, Paragraph, Line, ChordLyricsPair } from "chordsheetjs";
import styles from "./ChordProRenderer.module.css";

interface Props {
  content: string;
}

const SECTION_LABELS: Record<string, string> = {
  verse: "Verso",
  chorus: "Refrão",
  bridge: "Ponte",
  intro: "Intro",
  outro: "Outro",
};

const SECTION_TYPES = new Set([
  "verse",
  "chorus",
  "bridge",
  "intro",
  "outro",
  "indeterminate",
]);

function typeClass(type: string): string {
  return SECTION_TYPES.has(type) ? styles[type] : styles.indeterminate;
}

export default function ChordProRenderer({ content }: Props) {
  let song: Song;
  try {
    song = new ChordProParser().parse(content);
  } catch {
    return <pre className={styles.fallback}>{content}</pre>;
  }

  // Filter out metadata-only paragraphs (all lines have 0 items or only Tags)
  const paragraphs = song.paragraphs.filter((p) =>
    p.lines.some((l) => l.items.length > 0)
  );

  return (
    <div className={styles.song}>
      {paragraphs.map((para, i) => (
        <ParagraphBlock key={i} paragraph={para} />
      ))}
    </div>
  );
}

function ParagraphBlock({ paragraph }: { paragraph: Paragraph }) {
  const type = paragraph.type ?? "indeterminate";
  const defaultLabel = SECTION_LABELS[type];
  const label = paragraph.label ?? defaultLabel ?? null;

  const lines = paragraph.lines.filter((l) => l.items.length > 0);

  return (
    <div className={`${styles.block} ${typeClass(type)}`}>
      {label && (
        <div className={styles.label}>
          <span className={styles.labelDash} />
          {label}
        </div>
      )}

      <div className={styles.lines}>
        {lines.map((line, i) => (
          <LyricLine key={i} line={line} />
        ))}
      </div>
    </div>
  );
}

function LyricLine({ line }: { line: Line }) {
  // Cast to the concrete type we care about
  const pairs = line.items as ChordLyricsPair[];
  const hasChords = pairs.some((p) => p.chords?.trim());

  if (!hasChords) {
    // Plain lyrics row
    const text = pairs.map((p) => p.lyrics ?? "").join("");
    return <span className={styles.plainLine}>{text || " "}</span>;
  }

  // Chord + lyric row: each pair is a vertical stack (chord on top, lyric below)
  return (
    <span className={styles.chordLine}>
      {pairs.map((pair, i) => (
        <ChordPair key={i} pair={pair} />
      ))}
    </span>
  );
}

function ChordPair({ pair }: { pair: ChordLyricsPair }) {
  const chord = pair.chords?.trim() ?? "";
  const lyric = pair.lyrics ?? "";
  const flush = lyric.endsWith(" ");

  return (
    <span className={`${styles.pair} ${flush ? styles.pairFlush : ""}`}>
      <span
        className={`${styles.chord} ${chord ? "" : styles.chordEmpty}`}
      >
        {chord || " "}
      </span>
      <span className={styles.lyric}>{lyric || " "}</span>
    </span>
  );
}
