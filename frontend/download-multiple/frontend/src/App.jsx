import { useEffect, useRef, useState } from 'react';

// shortcut: hardcoded catalog; in the real app this comes from your existing list endpoint
const FILES = [
  { id: '1', name: 'report.txt' },
  { id: '2', name: 'invoice.csv' },
  { id: '3', name: 'notes.md' },
  { id: '4', name: 'big.bin (20 MB)' },
  { id: '5', name: 'report.txt (another one)' },
  { id: 'missing', name: 'missing file (404 demo)' },
];
const FINAL = new Set(['done', 'error', 'cancelled']);
const FILE_STATUS = { queued: '○ waiting —', generating: '◌ generating —', ready: '✓', failed: '✗ not available —' };

export default function App() {
  const [selected, setSelected] = useState(new Set());
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(null); // {status, total, done, failed, files, error?}
  const [error, setError] = useState(null);
  const eventsRef = useRef(null);
  const busy = creating || (progress && !FINAL.has(progress.status));
  const allChecked = selected.size === FILES.length;

  useEffect(() => () => eventsRef.current?.close(), []); // no dangling stream on unmount

  const toggle = (id) => setSelected((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  async function startDownload() {
    setError(null);
    setProgress(null);
    eventsRef.current?.close();
    setCreating(true);
    try {
      // 1) ask the BFF for a single-use ticket; validation/auth errors come back here as JSON
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
        credentials: 'same-origin',
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) throw new Error(body?.error ?? `Could not start the download (HTTP ${res.status}).`);

      // 2) live progress
      watchProgress(body.progressUrl);

      // 3) hand the ZIP to the browser's download manager: streams to disk, survives navigation.
      //    `download` makes a failed response show as a failed download instead of replacing this page.
      const a = document.createElement('a');
      a.href = body.url;
      a.download = '';
      a.click();
    } catch (e) {
      setError(e instanceof TypeError ? 'Network error. Check your connection and try again.' : e.message);
    } finally {
      setCreating(false);
    }
  }

  function watchProgress(url) {
    const events = new EventSource(url);
    eventsRef.current = events;
    events.onmessage = (msg) => {
      let state;
      try { state = JSON.parse(msg.data); } catch { return; }
      setProgress(state);
      if (FINAL.has(state.status)) events.close();
    };
    // EventSource retries on network blips by itself; CLOSED means the server refused (e.g. expired)
    events.onerror = () => {
      if (events.readyState !== EventSource.CLOSED) return;
      setProgress((p) => {
        if (p && FINAL.has(p.status)) return p;
        return { total: 0, done: 0, failed: 0, files: {}, ...p, status: 'unknown' };
      });
    };
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui' }}>
      <h1>Files</h1>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ position: 'absolute', left: -9999 }}>Files to download</legend>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="checkbox" checked={allChecked}
            onChange={() => setSelected(allChecked ? new Set() : new Set(FILES.map((f) => f.id)))} />{' '}
          <strong>Select all</strong>
        </label>
        {FILES.map((f) => (
          <label key={f.id} style={{ display: 'block', padding: '4px 0' }}>
            <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggle(f.id)} /> {f.name}
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={startDownload} disabled={!selected.size || busy} style={{ marginTop: 16 }}>
        {busy ? 'Preparing…' : `Download ${selected.size || ''} as ZIP`}
      </button>

      {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}

      {progress && (
        <section style={{ marginTop: 24 }} aria-label="Download progress">
          <progress value={progress.done + progress.failed} max={progress.total} style={{ width: '100%' }} />
          <p aria-live="polite" role={progress.status === 'error' ? 'alert' : undefined}
            style={{ margin: '4px 0', color: progress.status === 'error' ? '#b00020' : undefined }}>
            {describe(progress)}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
            {Object.entries(progress.files ?? {}).map(([id, status]) => (
              <li key={id} style={{ padding: '2px 0', color: status === 'queued' ? '#888' : undefined }}>
                {FILE_STATUS[status]} {FILES.find((f) => f.id === id)?.name ?? id}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function describe({ status, total, done, failed, error }) {
  const failedNote = failed ? ` — ${failed} not available (listed in _errors.txt)` : '';
  switch (status) {
    case 'done': return `Done: ${done} of ${total} files saved to your downloads${failedNote}`;
    case 'error': return error ?? 'The download failed. Please try again.';
    case 'cancelled': return 'Download cancelled.';
    case 'unknown': return 'Lost track of progress. Check your browser downloads.';
    default: return `Preparing files: ${done + failed} of ${total}${failedNote}`;
  }
}
