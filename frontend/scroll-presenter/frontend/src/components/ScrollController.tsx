import { useEffect, useRef, useCallback, useState } from "react";
import type { WsMessage } from "../hooks/useWebSocket";
import styles from "./ScrollController.module.css";

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
    <nav className={styles.toolbar}>
      {/* Role badge */}
      <span className={styles.badge}>🎮 CONTROLLER</span>

      <Divider />

      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        title={isPlaying ? "Pause auto-scroll" : "Start auto-scroll"}
        className={`${styles.playButton} ${
          isPlaying ? styles.playButtonPlaying : styles.playButtonPaused
        }`}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Reset to top */}
      <button
        onClick={onReset}
        title="Reset to top"
        className={styles.resetButton}
      >
        ⏮
      </button>

      <Divider />

      {/* Speed control */}
      <div className={styles.speedGroup}>
        <span className={styles.speedIcon}>🐢</span>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={speedLevel}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className={styles.speedSlider}
        />
        <span className={styles.speedIcon}>🐇</span>
        <span className={styles.speedValue}>{pxPerSec} px/s</span>
      </div>
    </nav>
  );
}

function Divider() {
  return <div className={styles.divider} />;
}
