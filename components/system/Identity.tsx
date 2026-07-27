"use client";

import { PROFILE } from "@/lib/profile";
import styles from "./Identity.module.css";

/**
 * Identity, set into the composition rather than centred in a hero card.
 * The three roles are presented as one system rather than three job titles —
 * each is annotated with the layer of the architecture it owns.
 */

const ROLE_LAYER = [
  { role: "Backend Developer", layer: "services · APIs · data" },
  { role: "Cloud Architect", layer: "build · ship · run" },
  { role: "IoT Engineer", layer: "sensors · edge · control" },
];

export default function Identity({ onQuickProfile }: { onQuickProfile: () => void }) {
  return (
    <header className={styles.identity} id="identity">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.nameBlock}>
            <p className={styles.kicker}>
              <span className={styles.live} aria-hidden="true" />
              System online
            </p>
            <h1 className={styles.name}>{PROFILE.name}</h1>
          </div>

          <ul className={styles.roles}>
            {ROLE_LAYER.map((r, i) => (
              <li key={r.role} className={styles.role}>
                <span className={styles.roleIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.roleName}>{r.role}</span>
                <span className={styles.roleLayer}>{r.layer}</span>
              </li>
            ))}
          </ul>

          <p className={styles.positioning}>{PROFILE.positioning}</p>

          <div className={styles.actions}>
            <button className={styles.primary} onClick={onQuickProfile}>
              Quick profile
              <kbd className={styles.kbd}>P</kbd>
            </button>
            <a className={styles.secondary} href="#system">
              Explore the system
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
