import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2rem",
    padding: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #818cf8, #38bdf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "1.1rem",
    textAlign: "center",
    maxWidth: 480,
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#e2e8f0",
    fontSize: "1rem",
    outline: "none",
    width: 260,
  },
  button: {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    background: "linear-gradient(135deg, #818cf8, #38bdf8)",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
  },
  hint: {
    color: "#475569",
    fontSize: "0.85rem",
    textAlign: "center",
  },
};

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const navigate = useNavigate();

  const join = () => {
    const id = sessionId.trim() || crypto.randomUUID().slice(0, 8);
    navigate(`/session/${id}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Scroll Presenter</h1>
      <p style={styles.subtitle}>
        Share a session link. The first person to join becomes the{" "}
        <strong>controller</strong> — everyone else follows their scroll in real
        time.
      </p>
      <div style={styles.form}>
        <input
          style={styles.input}
          placeholder="Session ID (leave blank for random)"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && join()}
        />
        <button style={styles.button} onClick={join}>
          Join Session
        </button>
      </div>
      <p style={styles.hint}>
        Share the URL with viewers after joining.
      </p>
    </div>
  );
}
