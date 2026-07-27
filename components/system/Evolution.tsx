"use client";

import { ERAS } from "@/lib/profile";
import styles from "./Evolution.module.css";

/**
 * Experience as growth in system complexity rather than a resume timeline.
 *
 * Each era draws its own topology: a single box early on, a distributed set
 * later. The diagram is the seniority signal — the prose underneath is what
 * HR scans.
 */

function ScaleDiagram({ scale, label }: { scale: number; label: string }) {
  // One node per unit of scale, wired to the one before it.
  const nodes = Array.from({ length: scale }, (_, i) => i);

  return (
    <div
      className={styles.diagram}
      role="img"
      aria-label={`${label}: system of ${scale} connected component${
        scale === 1 ? "" : "s"
      }`}
    >
      {nodes.map((n) => (
        <span key={n} className={styles.diagramNode}>
          {n > 0 && <span className={styles.diagramLink} aria-hidden="true" />}
          <span className={styles.diagramBox} aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

export default function Evolution() {
  return (
    <section id="evolution" className={styles.section}>
      <div className="container">
        <header className={styles.head}>
          <span className={styles.eyebrow}>Trajectory</span>
          <h2 className={styles.heading}>
            The systems got bigger; so did what I owned.
          </h2>
        </header>

        <ol className={styles.list}>
          {ERAS.map((era) => (
            <li key={era.id} className={styles.era}>
              <div className={styles.eraMeta}>
                <span
                  className={`${styles.period} ${
                    era.period.startsWith("PLACEHOLDER")
                      ? styles.periodPlaceholder
                      : ""
                  }`}
                >
                  {era.period}
                </span>
                <ScaleDiagram scale={era.scale} label={era.title} />
              </div>

              <div className={styles.eraBody}>
                <h3 className={styles.eraTitle}>{era.title}</h3>
                <p className={styles.eraOrg}>{era.org}</p>

                <dl className={styles.facts}>
                  <div className={styles.fact}>
                    <dt className={styles.factLabel}>Owned</dt>
                    <dd className={styles.factText}>{era.owned}</dd>
                  </div>
                  <div className={styles.fact}>
                    <dt className={styles.factLabel}>Changed</dt>
                    <dd className={styles.factText}>{era.changed}</dd>
                  </div>
                  <div className={styles.fact}>
                    <dt className={styles.factLabel}>Impact</dt>
                    <dd className={styles.factText}>{era.impact}</dd>
                  </div>
                </dl>

                <ul className={styles.tags}>
                  {era.tags.map((t) => (
                    <li key={t} className={styles.tag}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
