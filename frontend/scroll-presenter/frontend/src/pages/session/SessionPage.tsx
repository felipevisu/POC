import { useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "../../hooks/useWebSocket";
import type { Role, WsMessage } from "../../hooks/useWebSocket";
import ScrollController from "../../components/ScrollController";
import ScrollViewer from "../../components/ScrollViewer";
import LyricsContent from "../../components/LyricsContent";
import styles from "./SessionPage.module.css";

// Stable clientId per browser tab (survives React StrictMode double-mount)
function getClientId(): string {
  const key = "scroll_presenter_client_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

const CLIENT_ID = getClientId();

export default function SessionPage() {
  const { sessionId = "default" } = useParams<{ sessionId: string }>();
  const [role, setRole] = useState<Role | null>(null);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const [lyrics, setLyrics] = useState("");
  const lastMessageRef = useRef<WsMessage | null>(null);

  const handleMessage = useCallback((msg: WsMessage) => {
    if (msg.type === "lyrics") {
      setLyrics((msg.content as string) ?? "");
      return;
    }
    // Avoid re-render if scroll progress is identical
    if (
      msg.type === "scroll" &&
      lastMessageRef.current?.type === "scroll" &&
      lastMessageRef.current.progress === msg.progress
    ) {
      return;
    }
    lastMessageRef.current = msg;
    setLastMessage(msg);
  }, []);

  const handleRoleAssigned = useCallback((r: Role) => {
    setRole(r);
  }, []);

  const { sendMessage } = useWebSocket({
    sessionId,
    clientId: CLIENT_ID,
    onMessage: handleMessage,
    onRoleAssigned: handleRoleAssigned,
  });

  // Controller saves lyrics: update local state + broadcast to viewers
  const handleSaveLyrics = useCallback(
    (text: string) => {
      setLyrics(text);
      sendMessage({ type: "lyrics", content: text });
    },
    [sendMessage]
  );

  const sessionUrl = `${window.location.origin}/session/${sessionId}`;

  return (
    <>
      <RoleBanner role={role} sessionUrl={sessionUrl} sessionId={sessionId} />

      {role === "controller" && (
        <ScrollController sendMessage={sendMessage}>
          <LyricsContent content={lyrics} onSave={handleSaveLyrics} />
        </ScrollController>
      )}

      {role === "viewer" && (
        <>
          <ScrollViewer lastMessage={lastMessage} />
          <LyricsContent content={lyrics} />
        </>
      )}

      {role === null && <LoadingScreen />}
    </>
  );
}

function RoleBanner({
  role,
  sessionUrl,
  sessionId,
}: {
  role: Role | null;
  sessionUrl: string;
  sessionId: string;
}) {
  const [copied, setCopied] = useState(false);

  if (role === null) return null;

  const copy = () => {
    navigator.clipboard.writeText(sessionUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const roleClass =
    role === "controller" ? styles.roleController : styles.roleViewer;

  return (
    <div className={styles.banner}>
      <div className={styles.row}>
        <span>Session</span>
        <span className={styles.sessionId}>{sessionId}</span>
      </div>
      <div className={styles.row}>
        <span>Your role</span>
        <span className={`${styles.role} ${roleClass}`}>
          {role === "controller" ? "🎮 Controller" : "👁 Viewer"}
        </span>
      </div>
      {role === "controller" && (
        <button
          onClick={copy}
          className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ""}`}
        >
          {copied ? "✓ Copied!" : "Copy viewer link"}
        </button>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>Connecting…</p>
    </div>
  );
}
