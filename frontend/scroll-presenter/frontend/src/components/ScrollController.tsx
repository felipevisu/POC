import { useEffect, useRef, useCallback, useState } from "react";
import type { WsMessage } from "../hooks/useWebSocket";

interface ScrollControllerProps {
  sendMessage: (msg: WsMessage) => void;
  children: React.ReactNode;
}

const THROTTLE_MS = 50;

// Speed slider value (1–10) → px per animation frame, logarithmic scale.
// level 1  →  0.10 px/frame  ≈   6 px/s  (very slow)
// level 3  →  0.20 px/frame  ≈  12 px/s
// level 5  →  0.39 px/frame  ≈  23 px/s  (comfortable reading pace)
// level 7  →  0.75 px/frame  ≈  45 px/s
// level 10 →  1.80 px/frame  ≈ 108 px/s  (fast)
const speedToPxPerFrame = (level: number) =>
  0.1 * Math.pow(18, (level - 1) / 9);

export default function ScrollController({
  sendMessage,
  children,
}: ScrollControllerProps) {
  // ── Manual scroll broadcast ───────────────────────────────────────────────
  const lastSentRef = useRef(0);
  const broadcastRafRef = useRef<number | null>(null);
  const pendingProgressRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    broadcastRafRef.current = null;
    const progress = pendingProgressRef.current;
    if (progress === null) return;
    pendingProgressRef.current = null;
    sendMessage({ type: "scroll", progress });
  }, [sendMessage]);

  const broadcastScroll = useCallback(() => {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const progress = Math.max(0, Math.min(1, window.scrollY / scrollable));
    const now = Date.now();

    if (now - lastSentRef.current < THROTTLE_MS) {
      pendingProgressRef.current = progress;
      if (broadcastRafRef.current === null) {
        broadcastRafRef.current = requestAnimationFrame(flush);
      }
      return;
    }
    lastSentRef.current = now;
    sendMessage({ type: "scroll", progress });
  }, [sendMessage, flush]);

  useEffect(() => {
    window.addEventListener("scroll", broadcastScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", broadcastScroll);
      if (broadcastRafRef.current !== null)
        cancelAnimationFrame(broadcastRafRef.current);
    };
  }, [broadcastScroll]);

  // ── Auto-scroll engine ────────────────────────────────────────────────────
  // Uses setInterval (not rAF) so it keeps running when the tab is hidden.
  // Speed is time-based: px-per-ms × elapsed, so throttled intervals still
  // advance the correct distance.
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(3); // 1–10
  const isPlayingRef = useRef(false);
  const speedLevelRef = useRef(speedLevel);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const accumRef = useRef<number>(0); // fractional-pixel accumulator

  useEffect(() => { speedLevelRef.current = speedLevel; }, [speedLevel]);

  const stopAutoScroll = useCallback(() => {
    if (autoIntervalRef.current !== null) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, []);

  const startAutoScroll = useCallback(() => {
    if (autoIntervalRef.current !== null) return; // already running

    isPlayingRef.current = true;
    setIsPlaying(true);
    lastTickRef.current = performance.now();
    accumRef.current = 0;

    autoIntervalRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTickRef.current; // ms since last tick
      lastTickRef.current = now;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      if (window.scrollY >= scrollable) {
        stopAutoScroll();
        return;
      }

      // Convert px/frame (at 60fps) to px/ms, then scale by actual elapsed time
      const pxPerMs = speedToPxPerFrame(speedLevelRef.current) / (1000 / 60);
      accumRef.current += pxPerMs * elapsed;
      const whole = Math.floor(accumRef.current);
      if (whole >= 1) {
        window.scrollBy(0, whole);
        accumRef.current -= whole;
      }
    }, 16); // ~60 fps target; browser throttles to ~1s in background — still runs
  }, [stopAutoScroll]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  }, [startAutoScroll, stopAutoScroll]);

  const resetScroll = useCallback(() => {
    stopAutoScroll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stopAutoScroll]);

  // Clean up on unmount
  useEffect(() => () => {
    if (autoIntervalRef.current !== null) clearInterval(autoIntervalRef.current);
  }, []);

  return (
    <div>
      <ControllerToolbar
        isPlaying={isPlaying}
        speedLevel={speedLevel}
        onTogglePlay={togglePlay}
        onSpeedChange={setSpeedLevel}
        onReset={resetScroll}
      />
      {children}
    </div>
  );
}

// ── Toolbar UI ────────────────────────────────────────────────────────────────

interface ToolbarProps {
  isPlaying: boolean;
  speedLevel: number;
  onTogglePlay: () => void;
  onSpeedChange: (v: number) => void;
  onReset: () => void;
}

function ControllerToolbar({
  isPlaying,
  speedLevel,
  onTogglePlay,
  onSpeedChange,
  onReset,
}: ToolbarProps) {
  const pxPerSec = Math.round(speedToPxPerFrame(speedLevel) * 60);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6rem 1.25rem",
        background: "rgba(15,15,17,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #1e293b",
        flexWrap: "wrap",
      }}
    >
      {/* Role badge */}
      <span
        style={{
          fontSize: "0.72rem",
          color: "#38bdf8",
          fontWeight: 700,
          letterSpacing: "0.08em",
          flexShrink: 0,
        }}
      >
        🎮 CONTROLLER
      </span>

      <Divider />

      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        title={isPlaying ? "Pause auto-scroll" : "Start auto-scroll"}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: isPlaying
            ? "linear-gradient(135deg,#f97316,#fb923c)"
            : "linear-gradient(135deg,#818cf8,#38bdf8)",
          color: "#0f172a",
          fontSize: "1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: isPlaying ? "0 0 12px #f9731644" : "0 0 12px #818cf844",
          transition: "all 0.2s",
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Reset to top */}
      <button
        onClick={onReset}
        title="Reset to top"
        style={{
          width: 32,
          height: 32,
          borderRadius: "0.375rem",
          border: "1px solid #334155",
          background: "#1e293b",
          color: "#64748b",
          fontSize: "0.85rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        ⏮
      </button>

      <Divider />

      {/* Speed control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "#64748b", flexShrink: 0 }}>
          🐢
        </span>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={speedLevel}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: 100, accentColor: "#818cf8", cursor: "pointer" }}
        />
        <span style={{ fontSize: "0.72rem", color: "#64748b", flexShrink: 0 }}>
          🐇
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#94a3b8",
            minWidth: 52,
            flexShrink: 0,
          }}
        >
          {pxPerSec} px/s
        </span>
      </div>
    </nav>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: "#1e293b",
        flexShrink: 0,
      }}
    />
  );
}
