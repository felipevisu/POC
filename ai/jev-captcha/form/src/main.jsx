import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { startCollector } from "./collector.js";

function ContactForm() {
  const formRef = useRef(null);
  const collector = useRef(null);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    collector.current = startCollector(formRef.current);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const signals = collector.current.snapshot(e.nativeEvent);
    const fields = Object.fromEntries(new FormData(e.target));
    setSending(true);
    try {
      // Only the behaviour signals go to the check; the field values never reach Jev.
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals }),
      });
      setResult({ ...(await res.json()), ok: res.ok, fields });
    } catch {
      setResult({ ok: false, error: "Network error, please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Contact us</h1>
      <label>
        Name
        <input name="name" required style={{ display: "block", width: "100%" }} />
      </label>
      <label>
        Email
        <input name="email" type="email" required style={{ display: "block", width: "100%" }} />
      </label>
      <label>
        Subject
        <select name="subject" required defaultValue="" style={{ display: "block", width: "100%" }}>
          <option value="" disabled>Choose one</option>
          <option>Support</option>
          <option>Sales</option>
          <option>Feedback</option>
        </select>
      </label>
      <label>
        Message
        <textarea name="message" required rows={4} style={{ display: "block", width: "100%" }} />
      </label>
      <button type="submit" disabled={sending}>{sending ? "Checking…" : "Send"}</button>
      {result && (
        <div role={result.ok ? "status" : "alert"} style={{ color: result.ok ? "#1b6e2d" : "#b00020" }}>
          <p>
            {result.ok
              ? `Thanks, ${result.fields.name}! Your message about "${result.fields.subject}" was sent. (Jev: ${result.choice}, bot probability ${result.pBot.toFixed(2)})`
              : result.blocked
                ? `Blocked: this looks automated (${result.choice}, bot probability ${result.pBot.toFixed(2)}).`
                : result.error}
          </p>
          {result.story && (
            <ul style={{ fontSize: 13, color: "#555" }}>
              {result.story.map((s) => <li key={s}>{s}</li>)}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}

createRoot(document.getElementById("root")).render(<ContactForm />);
