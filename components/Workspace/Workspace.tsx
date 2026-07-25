"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { FILES, type Line, type WorkspaceFile } from "./files";
import styles from "./Workspace.module.css";

const BURST_COLORS = ["#0a84ff", "#ffffff"];

function burstAt(x: number, y: number) {
  if (prefersReducedMotion()) return;
  const count = 16;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const size = 4 + Math.random() * 4;
    piece.style.position = "fixed";
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.borderRadius = "1px";
    piece.style.background =
      BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
    piece.style.pointerEvents = "none";
    piece.style.zIndex = "9997";
    piece.style.willChange = "transform, opacity";
    document.body.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 70;

    gsap.to(piece, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotation: Math.random() * 180,
      opacity: 0,
      duration: 0.6 + Math.random() * 0.4,
      ease: "power2.out",
      onComplete: () => piece.remove(),
    });
  }
}

function LineContent({
  line,
  executed,
  onCommand,
}: {
  line: Line;
  executed: boolean;
  onCommand: (e: React.MouseEvent, line: Line & { kind: "command" }) => void;
}) {
  switch (line.kind) {
    case "blank":
      return <>&nbsp;</>;
    case "comment":
      return <span className={styles.tComment}>{line.text}</span>;
    case "heading":
      return <span className={styles.tHeading}>{line.text}</span>;
    case "plain":
      return <span className={styles.tPlain}>{line.text}</span>;
    case "prose":
      return <span className={styles.tProse}>{line.text}</span>;
    case "listItem":
      return <span className={styles.tListItem}>{line.text}</span>;
    case "kv": {
      const noSep = line.key.endsWith("=");
      return (
        <>
          <span className={styles.tKey}>{line.key}</span>
          <span className={styles.tPunct}>{noSep ? "" : ": "}</span>
          <span className={styles.tValue}>{line.value}</span>
        </>
      );
    }
    case "log":
      return (
        <>
          <span className={styles.tLogTimestamp}>[{line.timestamp}]</span>{" "}
          <span
            className={line.level === "WARN" ? styles.tLogWarn : styles.tLogInfo}
          >
            {line.level}
          </span>{" "}
          <span className={styles.tPlain}>{line.message}</span>
        </>
      );
    case "command":
      return (
        <>
          <button
            type="button"
            className={styles.commandBtn}
            onClick={(e) => onCommand(e, line)}
          >
            {line.text}
          </button>
          {line.note ? (
            <span className={styles.commandNote}>&nbsp;# {line.note}</span>
          ) : null}
          {executed ? <span className={styles.commandDone}>✓ done</span> : null}
        </>
      );
    default:
      return null;
  }
}

export default function Workspace() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const [activeFileId, setActiveFileId] = useState("about");
  const [openTabs, setOpenTabs] = useState<string[]>(["about"]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [executed, setExecuted] = useState<Record<string, boolean>>({});

  const getFile = (id: string): WorkspaceFile =>
    FILES.find((f) => f.id === id) ?? FILES[0];

  const about = FILES.find((f) => f.id === "about")!;
  const skills = FILES.find((f) => f.id === "skills")!;
  const experience = FILES.find((f) => f.id === "experience")!;
  const achievements = FILES.find((f) => f.id === "achievements")!;
  const contact = FILES.find((f) => f.id === "contact")!;
  const projectFiles = FILES.filter((f) => f.folder === "projects");

  const activeFile = getFile(activeFileId);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
          defaults: { ease: "power3.out", duration: reduced ? 0.01 : 0.8 },
        })
        .to(headerRef.current, { opacity: 1 })
        .fromTo(
          frameRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1 },
          0.15
        );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!paneRef.current) return;
    const reduced = prefersReducedMotion();
    const rows = paneRef.current.querySelectorAll(`[data-row="true"]`);
    gsap.fromTo(
      rows,
      { opacity: 0, y: reduced ? 0 : 6 },
      {
        opacity: 1,
        y: 0,
        duration: reduced ? 0.01 : 0.35,
        ease: "power2.out",
        stagger: reduced ? 0 : 0.02,
      }
    );
  }, [activeFileId]);

  const openFile = (id: string) => {
    setActiveFileId(id);
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== id);
      if (next.length === 0) return ["about"];
      if (activeFileId === id) {
        setActiveFileId(next[next.length - 1]);
      }
      return next;
    });
  };

  const handleCommand = (
    e: React.MouseEvent,
    line: Line & { kind: "command" }
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    burstAt(rect.left, rect.top + rect.height / 2);

    const key = `${activeFileId}:${line.text}`;
    setExecuted((prev) => ({ ...prev, [key]: true }));

    if (line.action === "mailto" || line.action === "tel") {
      window.location.href = line.href;
    } else {
      window.open(line.href, "_blank", "noopener,noreferrer");
    }
  };

  const renderFileRow = (file: WorkspaceFile, indented = false) => (
    <button
      key={file.id}
      type="button"
      className={`${styles.fileRow} ${indented ? styles.fileRowIndent : ""} ${
        activeFileId === file.id ? styles.fileRowActive : ""
      }`}
      onClick={() => openFile(file.id)}
    >
      <span className={styles.fileName}>{file.name}</span>
      <span className={styles.fileBadge}>{file.badge}</span>
    </button>
  );

  return (
    <section
      id="workspace"
      ref={sectionRef}
      className={`section ${styles.workspace}`}
    >
      <div className="container">
        <div className={styles.header} ref={headerRef}>
          <span className={styles.headerLabel}>Workspace</span>
          <h2 className={styles.headerHeading}>
            Everything I&apos;ve built, in one editor.
          </h2>
        </div>

        <div className={styles.windowFrame} ref={frameRef}>
          <div className={styles.titleBar}>
            <div className={styles.dots} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className={styles.titleText}>
              karthic-n — portfolio — ~/career
            </span>
          </div>

          <div className={styles.body}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarLabel}>EXPLORER</div>
              {renderFileRow(about)}
              {renderFileRow(skills)}

              <button
                type="button"
                className={styles.folderRow}
                onClick={() => setProjectsExpanded((prev) => !prev)}
              >
                <span
                  className={`${styles.folderChevron} ${
                    projectsExpanded ? styles.folderChevronOpen : ""
                  }`}
                >
                  ›
                </span>
                projects
              </button>
              {projectsExpanded &&
                projectFiles.map((file) => renderFileRow(file, true))}

              {renderFileRow(experience)}
              {renderFileRow(achievements)}
              {renderFileRow(contact)}
            </aside>

            <div className={styles.editorArea}>
              <div className={styles.tabBar}>
                {openTabs.map((id) => {
                  const file = getFile(id);
                  return (
                    <div
                      key={id}
                      role="tab"
                      tabIndex={0}
                      aria-selected={activeFileId === id}
                      className={`${styles.tab} ${
                        activeFileId === id ? styles.tabActive : ""
                      }`}
                      onClick={() => setActiveFileId(id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveFileId(id);
                        }
                      }}
                    >
                      {file.name}
                      <button
                        type="button"
                        className={styles.tabClose}
                        onClick={(e) => closeTab(id, e)}
                        aria-label={`Close ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className={styles.editorScroll}>
                <div className={styles.editorPane} ref={paneRef}>
                  {activeFile.lines.map((line, i) => {
                    const key =
                      line.kind === "command"
                        ? `${activeFileId}:${line.text}`
                        : `${activeFileId}:${i}`;
                    return (
                      <div className={styles.line} key={i} data-row="true">
                        <span className={styles.lineNumber}>{i + 1}</span>
                        <span className={styles.lineContent}>
                          <LineContent
                            line={line}
                            executed={!!executed[key]}
                            onCommand={handleCommand}
                          />
                        </span>
                      </div>
                    );
                  })}
                  <div className={styles.caretRow}>
                    <span className={styles.caret} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className={styles.statusBar}>
                <span className={styles.statusDot} aria-hidden="true" />
                <span>main</span>
                <span>UTF-8</span>
                <span>{activeFile.badge}</span>
                <span className={styles.statusRight}>
                  Ln {activeFile.lines.length}, Col 1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
