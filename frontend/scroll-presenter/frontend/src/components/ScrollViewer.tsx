import { useEffect, useRef } from "react";
import type { WsMessage } from "../hooks/useWebSocket";
import styles from "./ScrollViewer.module.css";

interface ScrollViewerProps {
  lastMessage: WsMessage | null;
}

export default function ScrollViewer({ lastMessage }: ScrollViewerProps) {
  const targetScrollRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isLerpingRef = useRef(false);

  // Lock scroll: CSS-based approach is the most reliable cross-browser method
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Belt-and-suspenders: also intercept wheel/touch/keyboard
    const prevent = (e: Event) => e.preventDefault();
    const preventKey = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (scrollKeys.includes(e.key)) e.preventDefault();
    };

    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    window.addEventListener("keydown", preventKey);

    return () => {
      document.documentElement.style.overflow = prev;
      document.body.style.overflow = "";
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("keydown", preventKey);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Lerp animation loop — single persistent loop, not restarted per message
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const LERP_FACTOR = 0.12;
    const SNAP_THRESHOLD = 0.5; // px

    const tick = () => {
      const current = window.scrollY;
      const target = targetScrollRef.current;
      const delta = target - current;

      if (Math.abs(delta) < SNAP_THRESHOLD) {
        // Snap to final position and pause the loop
        window.scrollTo(0, target);
        isLerpingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      const next = lerp(current, target, LERP_FACTOR);
      window.scrollTo(0, next);
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const startLerp = () => {
      if (!isLerpingRef.current) {
        isLerpingRef.current = true;
        rafIdRef.current = requestAnimationFrame(tick);
      }
      // If already lerping the loop will naturally pick up the new targetScrollRef
    };

    if (!lastMessage) return;

    if (lastMessage.type === "scroll") {
      const progress = lastMessage.progress as number;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollable <= 0) return;

      targetScrollRef.current = Math.max(
        0,
        Math.min(scrollable, progress * scrollable)
      );
      startLerp();
    } else if (lastMessage.type === "scroll_section") {
      const sectionId = lastMessage.sectionId as string;
      const el = document.getElementById(sectionId);
      if (el) {
        // Use scrollIntoView for section jumps — feels natural
        el.scrollIntoView({ behavior: "smooth" });
        // Sync our target ref to the element's offset so lerp doesn't fight it
        targetScrollRef.current = el.offsetTop;
      }
    }
  }, [lastMessage]);

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>👁</span>
      <span>
        <strong className={styles.label}>VIEWER</strong> — scroll
        controlled remotely
      </span>
    </div>
  );
}
