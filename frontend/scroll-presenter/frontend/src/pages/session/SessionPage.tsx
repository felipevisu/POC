import { useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "../../hooks/useWebSocket";
import type { Role, WsMessage } from "../../hooks/useWebSocket";
import ScrollController from "../../components/ScrollController";
import ScrollViewer from "../../components/ScrollViewer";
import LyricsContent from "../../components/LyricsContent";

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

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 200,
        background: "rgba(15,15,17,0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid #334155",
        borderRadius: "0.75rem",
        padding: "0.75rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        maxWidth: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          color: "#64748b",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Session</span>
        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{sessionId}</span>
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: "#64748b",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Your role</span>
        <span
          style={{
            fontWeight: 700,
            color: role === "controller" ? "#38bdf8" : "#f97316",
          }}
        >
          {role === "controller" ? "🎮 Controller" : "👁 Viewer"}
        </span>
      </div>
      {role === "controller" && (
        <button
          onClick={copy}
          style={{
            marginTop: "0.25rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "0.4rem",
            border: "1px solid #334155",
            background: copied ? "#1e3a2f" : "#1e293b",
            color: copied ? "#34d399" : "#94a3b8",
            fontSize: "0.75rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied!" : "Copy viewer link"}
        </button>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        color: "#475569",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid #1e293b",
          borderTopColor: "#818cf8",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: "0.9rem" }}>Connecting…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
