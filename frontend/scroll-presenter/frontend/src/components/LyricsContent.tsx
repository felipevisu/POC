import { useState } from "react";
import ChordProRenderer from "./ChordProRenderer";
import styles from "./LyricsContent.module.css";

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
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.headerMeta}>
            Legião Urbana · Que País É Este · 1987
          </p>
          <h1 className={styles.title}>Faroeste Caboclo</h1>
          <div className={styles.dot} />
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
          className={styles.editButton}
        >
          ✏️
        </button>
      )}

      {editing && onSave && (
        <PasteOverlay
          initial={content}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ canEdit, onEdit }: { canEdit: boolean; onEdit: () => void }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>🎸</span>
      <p className={styles.emptyTitle}>No lyrics yet</p>
      {canEdit ? (
        <>
          <p className={styles.emptyText}>
            Copy the lyrics from{" "}
            <a
              href="https://www.letras.mus.br/legiao-urbana/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.emptyLink}
            >
              letras.mus.br
            </a>{" "}
            or{" "}
            <a
              href="https://www.vagalume.com.br/legiao-urbana/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.emptyLink}
            >
              vagalume.com.br
            </a>
            , then paste them below.
          </p>
          <button onClick={onEdit} className={styles.emptyButton}>
            ✏️ Paste lyrics
          </button>
        </>
      ) : (
        <p className={styles.emptyWaiting}>
          Waiting for the controller to add lyrics…
        </p>
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Paste ChordPro</h2>
          <span className={styles.modalHint}>
            Supports ChordPro syntax —{" "}
            <code className={styles.modalCode}>[Am]</code> chords inline,{" "}
            <code className={styles.modalCode}>{"{start_of_chorus}"}</code>{" "}
            sections
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
          className={styles.textarea}
        />

        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={() => onSave(draft)} className={styles.saveButton}>
            Save &amp; close
          </button>
        </div>
      </div>
    </div>
  );
}
