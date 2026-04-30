import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const navigate = useNavigate();

  const join = () => {
    const id = sessionId.trim() || crypto.randomUUID().slice(0, 8);
    navigate(`/session/${id}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Scroll Presenter</h1>
      <p className={styles.subtitle}>
        Share a session link. The first person to join becomes the{" "}
        <strong>controller</strong> — everyone else follows their scroll in real
        time.
      </p>
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Session ID (leave blank for random)"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && join()}
        />
        <button className={styles.button} onClick={join}>
          Join Session
        </button>
      </div>
      <p className={styles.hint}>
        Share the URL with viewers after joining.
      </p>
    </div>
  );
}
