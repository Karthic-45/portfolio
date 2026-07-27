"use client";

import { useState } from "react";
import { PROJECTS, type Project } from "@/lib/profile";
import { getNode } from "@/lib/system";
import styles from "./ProjectSystems.module.css";

/**
 * Projects as architectures.
 *
 * The dominant element is the component topology — which parts of the shared
 * system the project actually exercises — followed by the reasoning. Repo
 * links are deliberately secondary to understanding the engineering.
 */

function Architecture({ project }: { project: Project }) {
  const nodes = project.touches.map(getNode).filter((n) => n !== undefined);

  return (
    <div className={styles.arch} aria-label={`${project.name} architecture`}>
      {nodes.map((node, i) => (
        <div key={node.id} className={styles.archNode}>
          {i > 0 && (
            <span className={styles.archLink} aria-hidden="true">
              <span className={styles.archPulse} />
            </span>
          )}
          <span className={styles.archBox}>
            <span className={styles.archKind}>{node.kind}</span>
            <span className={styles.archLabel}>{node.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ProjectEntry({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <article id={`project-${project.id}`} className={styles.project}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.summary}>{project.summary}</p>
        </div>
        <ul className={styles.domainTags}>
          {project.domains.map((d) => (
            <li key={d} className={styles.domainTag}>
              {d}
            </li>
          ))}
        </ul>
      </div>

      <Architecture project={project} />

      <dl className={styles.results}>
        {project.result.map((r) => (
          <div key={r.label} className={styles.result}>
            <dt className={styles.resultValue}>{r.value}</dt>
            <dd className={styles.resultLabel}>{r.label}</dd>
          </div>
        ))}
      </dl>

      <button
        className={styles.disclosure}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`detail-${project.id}`}
      >
        <span className={styles.disclosureIcon} aria-hidden="true">
          {open ? "−" : "+"}
        </span>
        {open ? "Hide engineering detail" : "Read the engineering"}
      </button>

      {open && (
        <div id={`detail-${project.id}`} className={styles.detail}>
          <section className={styles.block}>
            <h4 className={styles.blockLabel}>Problem</h4>
            <p className={styles.blockText}>{project.problem}</p>
          </section>

          <section className={styles.block}>
            <h4 className={styles.blockLabel}>Architecture</h4>
            <p className={styles.blockText}>{project.architecture}</p>
          </section>

          <section className={styles.block}>
            <h4 className={styles.blockLabel}>Engineering decisions</h4>
            <ul className={styles.decisions}>
              {project.decisions.map((d) => (
                <li key={d} className={styles.decision}>
                  {d}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block}>
            <h4 className={styles.blockLabel}>Stack</h4>
            <ul className={styles.stack}>
              {project.stack.map((s) => (
                <li key={s} className={styles.stackItem}>
                  {s}
                </li>
              ))}
            </ul>
            {project.repo ? (
              <a
                className={styles.repo}
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source ↗
              </a>
            ) : (
              <p className={styles.repoMissing}>
                PLACEHOLDER: add a repository or demo link.
              </p>
            )}
          </section>
        </div>
      )}
    </article>
  );
}

export default function ProjectSystems() {
  return (
    <section id="projects" className={styles.section}>
      <div className="container">
        <header className={styles.sectionHead}>
          <span className={styles.eyebrow}>Systems built</span>
          <h2 className={styles.heading}>
            Five systems, shown as architecture rather than screenshots.
          </h2>
        </header>

        <div className={styles.list}>
          {PROJECTS.map((p) => (
            <ProjectEntry key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
