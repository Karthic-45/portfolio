"use client";

import { useEffect, useRef } from "react";
import {
  EMAIL,
  GITHUB,
  LINKEDIN,
  PHONE_DISPLAY,
  PHONE_HREF,
  PROFILE,
  PROJECTS,
  QUICK_PROFILE,
} from "@/lib/profile";
import styles from "./QuickProfile.module.css";

/**
 * The recruiter path.
 *
 * Everything needed to evaluate the candidate in about ten seconds, reachable
 * at any point without scrolling through the experience. Deliberately plain:
 * no animation beyond the panel entrance, no 3D, fully keyboard operable.
 */
export default function QuickProfile({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Trap focus inside the dialog.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const flagship = PROJECTS.slice(0, 3);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qp-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>Quick profile</p>
            <h2 id="qp-title" className={styles.name}>
              {PROFILE.name}
            </h2>
            <p className={styles.roles}>{PROFILE.roles.join(" · ")}</p>
          </div>
          <button
            ref={closeRef}
            className={styles.close}
            onClick={onClose}
            aria-label="Close quick profile"
          >
            Esc
          </button>
        </div>

        <p className={styles.positioning}>{PROFILE.positioning}</p>

        <dl className={styles.headline}>
          {QUICK_PROFILE.headline.map((h) => (
            <div key={h.label} className={styles.headlineItem}>
              <dt className={styles.headlineValue}>{h.value}</dt>
              <dd className={styles.headlineLabel}>{h.label}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.cols}>
          <section>
            <h3 className={styles.colLabel}>Strongest areas</h3>
            <ul className={styles.list}>
              {QUICK_PROFILE.strongest.map((s) => (
                <li key={s.area} className={styles.strong}>
                  <span className={styles.strongArea}>{s.area}</span>
                  <span className={styles.strongProof}>{s.proof}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className={styles.colLabel}>Best work</h3>
            <ul className={styles.list}>
              {flagship.map((p) => (
                <li key={p.id}>
                  <a
                    className={styles.projectLink}
                    href={`#project-${p.id}`}
                    onClick={onClose}
                  >
                    <span className={styles.projectName}>{p.name}</span>
                    <span className={styles.projectSummary}>{p.summary}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className={styles.foot}>
          <p className={styles.education}>{QUICK_PROFILE.education}</p>
          <div className={styles.contacts}>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
          </div>
          <p className={styles.availability}>{PROFILE.availability}</p>
        </footer>
      </div>
    </div>
  );
}
