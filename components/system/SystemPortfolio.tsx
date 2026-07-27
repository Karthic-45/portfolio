"use client";

import { useCallback, useEffect, useState } from "react";
import Identity from "./Identity";
import SystemExplorer from "./SystemExplorer";
import ProjectSystems from "./ProjectSystems";
import Evolution from "./Evolution";
import QuickProfile from "./QuickProfile";
import Contact from "./Contact";
import styles from "./SystemPortfolio.module.css";

/**
 * Client shell for the system experience.
 *
 * Holds only cross-cutting state (the recruiter overlay); each region below
 * owns its own interaction so no single component becomes the whole page.
 */
export default function SystemPortfolio() {
  const [quickOpen, setQuickOpen] = useState(false);

  const openQuick = useCallback(() => setQuickOpen(true), []);
  const closeQuick = useCallback(() => setQuickOpen(false), []);

  // `P` anywhere opens the recruiter view — the immersive path is never a
  // prerequisite for evaluating the candidate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        setQuickOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className={styles.quickPill} onClick={openQuick}>
        <span className={styles.quickDot} aria-hidden="true" />
        Quick profile
        <kbd className={styles.quickKbd}>P</kbd>
      </button>

      <div className={styles.shell}>
        <Identity onQuickProfile={openQuick} />
        <main id="main">
          <SystemExplorer />
          <ProjectSystems />
          <Evolution />
          <Contact />
        </main>
      </div>

      <QuickProfile open={quickOpen} onClose={closeQuick} />
    </>
  );
}
