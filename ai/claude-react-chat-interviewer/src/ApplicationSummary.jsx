import { PII_FIELDS } from "./interview.js";

// Final review card. The professional half comes from the model (no PII).
// The contact half is read from the LOCAL profile the model never saw.
export function ApplicationSummary({ position, summary, highlights, profile }) {
  const piiKeys = Object.keys(PII_FIELDS).filter((k) => profile?.[k]);

  return (
    <div className="item summary-card">
      <div className="summary-head">
        <span className="summary-check">✓</span>
        <div>
          <div className="summary-title">Application submitted</div>
          {position && <div className="summary-position">{position}</div>}
        </div>
      </div>

      {summary && <p className="summary-text">{summary}</p>}

      {highlights?.length > 0 && (
        <ul className="summary-highlights">
          {highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      {piiKeys.length > 0 && (
        <div className="summary-contact">
          <div className="summary-contact-head">
            🔒 Contact details (local only — never sent to the AI)
          </div>
          {piiKeys.map((k) => (
            <div className="summary-contact-row" key={k}>
              <span className="summary-contact-label">{PII_FIELDS[k].label}</span>
              <span className="summary-contact-value">{profile[k]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
