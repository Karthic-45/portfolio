"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./Cursor.module.css";

const INTERACTIVE_SELECTOR = "a, button, [data-cursor-hover]";

function subscribeToCapability(callback: () => void) {
  const pointerQuery = window.matchMedia("(pointer: fine)");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  pointerQuery.addEventListener("change", callback);
  motionQuery.addEventListener("change", callback);
  return () => {
    pointerQuery.removeEventListener("change", callback);
    motionQuery.removeEventListener("change", callback);
  };
}

function getCapabilitySnapshot() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getServerCapabilitySnapshot() {
  return false;
}

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const enabled = useSyncExternalStore(
    subscribeToCapability,
    getCapabilitySnapshot,
    getServerCapabilitySnapshot
  );

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add(styles.hideCursor);

    gsap.set([dotRef.current, ringRef.current], { xPercent: -50, yPercent: -50 });

    const dotX = gsap.quickTo(dotRef.current, "x", { duration: 0.1, ease: "power3.out" });
    const dotY = gsap.quickTo(dotRef.current, "y", { duration: 0.1, ease: "power3.out" });
    const ringX = gsap.quickTo(ringRef.current, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ringRef.current, "y", { duration: 0.45, ease: "power3.out" });

    const handleMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      setVisible(true);
    };

    const handleOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest(INTERACTIVE_SELECTOR)) {
        setHovering(true);
      }
    };

    const handleOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest(INTERACTIVE_SELECTOR)) {
        setHovering(false);
      }
    };

    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      document.body.classList.remove(styles.hideCursor);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`${styles.dot} ${visible ? styles.dotVisible : ""}`}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className={`${styles.ring} ${visible ? styles.ringVisible : ""} ${
          hovering ? styles.ringHover : ""
        }`}
        aria-hidden="true"
      />
    </>
  );
}
