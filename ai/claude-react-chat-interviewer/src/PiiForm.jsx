import { useState } from "react";
import { PII_FIELDS } from "./interview.js";

// Renders an inline secure form for the PII fields the model asked for.
// On submit, values go to the local profile (App) — never to the model.
export function PiiForm({ fields, note, submitted, values, onSubmit }) {
  const known = fields.filter((f) => PII_FIELDS[f]);
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(known.map((f) => [f, ""])),
  );
  const [errors, setErrors] = useState({});

  if (submitted) {
    return (
      <div className="item pii-form done">
        <div className="pii-lock">🔒 Saved on your device</div>
        <div className="pii-saved-list">
          {known.map((f) => (
            <div className="pii-saved-row" key={f}>
              <span className="pii-saved-label">{PII_FIELDS[f].label}</span>
              <span className="pii-saved-value">{values?.[f]}</span>
            </div>
          ))}
        </div>
        <div className="pii-hint">Not shared with the AI.</div>
      </div>
    );
  }

  function handleChange(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    for (const key of known) {
      const cfg = PII_FIELDS[key];
      const value = (draft[key] ?? "").trim();
      if (!value) {
        nextErrors[key] = "Required";
        continue;
      }
      if (cfg.validate) {
        const ok = cfg.validate(value);
        if (ok !== true) nextErrors[key] = ok;
      }
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const clean = Object.fromEntries(
      known.map((f) => [f, (draft[f] ?? "").trim()]),
    );
    onSubmit(clean);
  }

  return (
    <form className="item pii-form" onSubmit={handleSubmit}>
      <div className="pii-lock">🔒 Secure form — stays on your device</div>
      {note && <div className="pii-note">{note}</div>}
      {known.map((f) => {
        const cfg = PII_FIELDS[f];
        return (
          <label className="pii-field" key={f}>
            <span className="pii-field-label">{cfg.label}</span>
            {cfg.type === "textarea" ? (
              <textarea
                rows={3}
                value={draft[f]}
                placeholder={cfg.placeholder}
                autoComplete={cfg.autoComplete}
                onChange={(e) => handleChange(f, e.target.value)}
              />
            ) : (
              <input
                type={cfg.type}
                value={draft[f]}
                placeholder={cfg.placeholder}
                autoComplete={cfg.autoComplete}
                onChange={(e) => handleChange(f, e.target.value)}
              />
            )}
            {errors[f] && <span className="pii-error">{errors[f]}</span>}
          </label>
        );
      })}
      <button type="submit" className="pii-submit">
        Save securely
      </button>
      <div className="pii-hint">
        These values are stored locally and never sent to the AI.
      </div>
    </form>
  );
}
