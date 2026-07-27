"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DOMAINS,
  EDGES,
  EDGE_LABEL,
  getDomain,
  getNode,
  neighboursOf,
  type DomainId,
} from "@/lib/system";
import { PROJECTS } from "@/lib/profile";
import styles from "./SystemExplorer.module.css";

// Expensive and non-essential: the flow below carries the same information.
const SystemScene = dynamic(() => import("./SystemScene"), { ssr: false });

export default function SystemExplorer() {
  const [domain, setDomain] = useState<DomainId>("iot");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const active = getDomain(domain);
  const flowNodes = useMemo(
    () => active.flow.map(getNode).filter((n) => n !== undefined),
    [active]
  );

  // Default the detail panel to the first stage whenever the domain changes.
  const selected = useMemo(() => {
    const byFocus = focusId ? getNode(focusId) : undefined;
    if (byFocus && byFocus.domain === domain) return byFocus;
    return flowNodes[0];
  }, [focusId, domain, flowNodes]);

  const related = useMemo(
    () => (selected ? neighboursOf(selected.id) : new Set<string>()),
    [selected]
  );

  /** Connections that cross out of this domain — the joins in the system. */
  const crossings = useMemo(() => {
    if (!selected) return [];
    return EDGES.filter(
      (e) => e.from === selected.id || e.to === selected.id
    ).map((e) => {
      const otherId = e.from === selected.id ? e.to : e.from;
      const other = getNode(otherId);
      return {
        key: `${e.from}-${e.to}`,
        kind: e.kind,
        outgoing: e.from === selected.id,
        other,
      };
    });
  }, [selected]);

  const linkedProjects = useMemo(
    () =>
      selected
        ? PROJECTS.filter((p) => p.touches.includes(selected.id))
        : [],
    [selected]
  );

  // Only spin up WebGL once the stage is actually on screen.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSceneReady(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const onFlowKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next =
        e.key === "ArrowRight"
          ? (index + 1) % flowNodes.length
          : (index - 1 + flowNodes.length) % flowNodes.length;
      setFocusId(flowNodes[next].id);
      const el = document.getElementById(`stage-${flowNodes[next].id}`);
      el?.focus();
    },
    [flowNodes]
  );

  return (
    <section id="system" className={styles.system} aria-label="System explorer">
      <div ref={stageRef} className={styles.stage}>
        {sceneReady && <SystemScene domain={domain} focusId={selected?.id ?? null} />}

        <div className={styles.stageOverlay}>
          {/* -------- domain switch: three parts of one architecture ------- */}
          <div className={styles.domainRail} role="tablist" aria-label="System domains">
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                role="tab"
                aria-selected={d.id === domain}
                aria-controls="domain-flow"
                className={`${styles.domainTab} ${
                  d.id === domain ? styles.domainTabActive : ""
                }`}
                onClick={() => {
                  setDomain(d.id);
                  setFocusId(null);
                }}
              >
                <span className={styles.domainIndex}>
                  {String(d.index + 1).padStart(2, "0")}
                </span>
                <span className={styles.domainName}>{d.title}</span>
              </button>
            ))}
          </div>

          <p className={styles.premise}>{active.premise}</p>
        </div>
      </div>

      {/* ---------------- the flow through this domain ------------------- */}
      <div className="container">
        <div
          id="domain-flow"
          className={styles.flow}
          role="list"
          aria-label={`${active.title} flow`}
        >
          {flowNodes.map((node, i) => {
            const isSelected = selected?.id === node.id;
            const isRelated = related.has(node.id);
            return (
              <div key={node.id} className={styles.flowItem} role="listitem">
                {i > 0 && (
                  <span className={styles.flowArrow} aria-hidden="true">
                    →
                  </span>
                )}
                <button
                  id={`stage-${node.id}`}
                  className={`${styles.stageBtn} ${
                    isSelected ? styles.stageBtnActive : ""
                  } ${isRelated && !isSelected ? styles.stageBtnRelated : ""}`}
                  onMouseEnter={() => setFocusId(node.id)}
                  onFocus={() => setFocusId(node.id)}
                  onClick={() => setFocusId(node.id)}
                  onKeyDown={(e) => onFlowKeyDown(e, i)}
                  aria-pressed={isSelected}
                >
                  <span className={styles.stageKind}>{node.kind}</span>
                  <span className={styles.stageLabel}>{node.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* ---------------- detail for the selected component ------------ */}
        {selected && (
          <div className={styles.detail}>
            <div className={styles.detailMain}>
              <h3 className={styles.detailTitle}>{selected.label}</h3>
              <p className={styles.detailRole}>{selected.role}</p>

              <p
                className={`${styles.evidence} ${
                  selected.evidence.startsWith("PLACEHOLDER")
                    ? styles.evidencePlaceholder
                    : ""
                }`}
              >
                {selected.evidence}
              </p>

              <ul className={styles.techList}>
                {selected.tech.map((t) => (
                  <li key={t} className={styles.tech}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.detailSide}>
              <h4 className={styles.sideLabel}>Connections</h4>
              <ul className={styles.connList}>
                {crossings.map((c) => (
                  <li key={c.key} className={styles.conn}>
                    <span className={styles.connKind}>
                      {EDGE_LABEL[c.kind]}
                    </span>
                    <span className={styles.connDir} aria-hidden="true">
                      {c.outgoing ? "→" : "←"}
                    </span>
                    <button
                      className={styles.connTarget}
                      onClick={() => {
                        if (!c.other) return;
                        setDomain(c.other.domain);
                        setFocusId(c.other.id);
                      }}
                    >
                      {c.other?.label ?? "—"}
                      {c.other && c.other.domain !== selected.domain && (
                        <span className={styles.connHop}>
                          {c.other.domain}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {linkedProjects.length > 0 && (
                <>
                  <h4 className={styles.sideLabel}>Built here</h4>
                  <ul className={styles.connList}>
                    {linkedProjects.map((p) => (
                      <li key={p.id}>
                        <a className={styles.projectLink} href={`#project-${p.id}`}>
                          {p.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
