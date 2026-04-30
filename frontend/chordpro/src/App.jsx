import { useMemo, useState } from "react";
import { ChordProParser, HtmlDivFormatter } from "chordsheetjs";
import "./App.css";

const sampleSong = `{title: Stand By Me}
{subtitle: Demo powered by ChordSheetJS}

{start_of_verse}
When the [G]night has come
And the [Em]land is dark
And the [C]moon is the only [D]light we'll see
{end_of_verse}

{start_of_tab}
e|-----------------3-|
B|-------------3h5---|
G|---------2/4-------|
D|-----0h2-----------|
A|---2---------------|
E|-3-----------------|
{end_of_tab}

{start_of_chorus}
So [G]darling, darling, [Em]stand by me
Oh [C]stand by me
Oh [D]stand, stand by me
{end_of_chorus}`;

const parser = new ChordProParser();
const formatter = new HtmlDivFormatter();
const chordSheetCss = formatter.cssString(".song-sheet");

function App() {
  const [source, setSource] = useState(sampleSong);

  const preview = useMemo(() => {
    try {
      const song = parser.parse(source);

      return {
        error: "",
        html: formatter.format(song),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unable to parse song",
        html: "",
      };
    }
  }, [source]);

  return (
    <main className="app-shell">
      <style>{chordSheetCss}</style>

      <section className="hero-panel">
        <span className="eyebrow">React + ChordSheetJS</span>
        <h1>Render lyrics with chords in the browser.</h1>
        <p className="hero-copy">
          Edit the ChordPro text on the left and the formatted chord sheet
          updates instantly on the right, including mixed chord and tab
          sections.
        </p>
      </section>

      <section className="workspace-grid">
        <article className="panel editor-panel">
          <div className="panel-header">
            <h2>ChordPro source</h2>
            <span>Live editor</span>
          </div>

          <label className="sr-only" htmlFor="song-source">
            Song source
          </label>
          <textarea
            id="song-source"
            className="source-editor"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
          />
        </article>

        <article className="panel preview-panel">
          <div className="panel-header">
            <h2>Rendered song</h2>
            <span>Preview</span>
          </div>

          {preview.error ? (
            <div className="error-box" role="alert">
              {preview.error}
            </div>
          ) : (
            <div
              className="song-sheet"
              dangerouslySetInnerHTML={{ __html: preview.html }}
            />
          )}
        </article>
      </section>
    </main>
  );
}

export default App;
