"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { lineAccent, tokenize, type TokenType } from "@/lib/highlight";
import CommandPalette from "./CommandPalette";
import Terminal from "./Terminal";
import { FILES, getFile, type CommandLine, type WorkspaceFile } from "./files";
import styles from "./Workspace.module.css";

const TOKEN_CLASS: Record<TokenType, string> = {
  plain: styles.tPlain,
  comment: styles.tComment,
  string: styles.tString,
  number: styles.tNumber,
  keyword: styles.tKeyword,
  property: styles.tProperty,
  punct: styles.tPunct,
  boolean: styles.tBoolean,
  variable: styles.tVariable,
  function: styles.tFunction,
  heading: styles.tHeading,
  bullet: styles.tBullet,
  timestamp: styles.tTimestamp,
  logInfo: styles.tLogInfo,
  logWarn: styles.tLogWarn,
};

const BURST_COLORS = ["#0a84ff", "#ffffff", "#7fdbff"];

function burstAt(x: number, y: number) {
  if (prefersReducedMotion()) return;

  for (let i = 0; i < 16; i++) {
    const piece = document.createElement("div");
    const size = 3 + Math.random() * 4;
    piece.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:1px;background:${
      BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)]
    };pointer-events:none;z-index:9997;will-change:transform,opacity`;
    document.body.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const distance = 26 + Math.random() * 64;

    gsap.to(piece, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotation: Math.random() * 180,
      opacity: 0,
      duration: 0.55 + Math.random() * 0.4,
      ease: "power2.out",
      onComplete: () => piece.remove(),
    });
  }
}

function isCommand(line: string | CommandLine): line is CommandLine {
  return typeof line !== "string";
}

function Minimap({
  file,
  onSeek,
}: {
  file: WorkspaceFile;
  onSeek: (ratio: number) => void;
}) {
  return (
    <div
      className={styles.minimap}
      aria-hidden="true"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek((e.clientY - rect.top) / rect.height);
      }}
    >
      {file.lines.map((line, i) => {
        const text = isCommand(line) ? line.cmd : line;
        const type = isCommand(line)
          ? "keyword"
          : lineAccent(text, file.lang);
        const indent = text.length - text.trimStart().length;
        return (
          <span
            key={i}
            className={`${styles.minimapBar} ${TOKEN_CLASS[type] ?? ""}`}
            style={{
              width: `${Math.min(100, text.trim().length * 1.4)}%`,
              marginLeft: `${Math.min(30, indent * 2)}%`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Workspace() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeFileId, setActiveFileId] = useState("about");
  const [openTabs, setOpenTabs] = useState<string[]>(["about"]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [executed, setExecuted] = useState<Record<string, boolean>>({});

  const activeFile = getFile(activeFileId);

  const rootFiles = useMemo(() => FILES.filter((f) => !f.folder), []);
  const projectFiles = useMemo(
    () => FILES.filter((f) => f.folder === "projects"),
    []
  );

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
          defaults: { ease: "power3.out", duration: reduced ? 0.01 : 0.8 },
        })
        .to(headerRef.current, { opacity: 1 })
        .fromTo(
          frameRef.current,
          { opacity: 0, y: 44, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1 },
          0.12
        );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Left-to-right "typing" sweep whenever a different file is opened.
  useEffect(() => {
    if (!paneRef.current) return;
    const reduced = prefersReducedMotion();
    const rows = paneRef.current.querySelectorAll("[data-row]");

    gsap.fromTo(
      rows,
      { clipPath: "inset(0 100% 0 0)", opacity: 0 },
      {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        duration: reduced ? 0.01 : 0.3,
        ease: "power2.out",
        stagger: reduced ? 0 : 0.028,
      }
    );

    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeFileId]);

  // Cmd/Ctrl+K opens the palette anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openFile = (id: string) => {
    setActiveFileId(id);
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== id);
      if (next.length === 0) {
        setActiveFileId("about");
        return ["about"];
      }
      if (activeFileId === id) setActiveFileId(next[next.length - 1]);
      return next;
    });
  };

  const runCommand = (e: React.MouseEvent, line: CommandLine) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    burstAt(rect.left + 8, rect.top + rect.height / 2);
    setExecuted((prev) => ({ ...prev, [`${activeFileId}:${line.cmd}`]: true }));

    if (line.action === "link") {
      window.open(line.href, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(line.href);
    }
  };

  const seekTo = (ratio: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: ratio * (el.scrollHeight - el.clientHeight),
      behavior: "smooth",
    });
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
      <div className={styles.ambientGrid} aria-hidden="true" />
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className="container">
        <div className={styles.header} ref={headerRef}>
          <span className={styles.headerLabel}>Workspace</span>
          <h2 className={styles.headerHeading}>
            Everything I&apos;ve built, in one editor.
          </h2>
          <p className={styles.headerHint}>
            Browse the files, or press{" "}
            <kbd className={styles.kbd}>Cmd</kbd>
            <kbd className={styles.kbd}>K</kbd> — the terminal at the bottom is
            real, try <code className={styles.inlineCode}>neofetch</code>.
          </p>
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
            <button
              type="button"
              className={styles.paletteTrigger}
              onClick={() => setPaletteOpen(true)}
            >
              <span className={styles.paletteIcon}>⌘</span> K
            </button>
          </div>

          <div className={styles.body}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarLabel}>Explorer</div>

              {rootFiles.slice(0, 2).map((file) => renderFileRow(file))}

              <button
                type="button"
                className={styles.folderRow}
                onClick={() => setProjectsExpanded((prev) => !prev)}
                aria-expanded={projectsExpanded}
              >
                <span
                  className={`${styles.folderChevron} ${
                    projectsExpanded ? styles.folderChevronOpen : ""
                  }`}
                >
                  ›
                </span>
                projects
                <span className={styles.folderCount}>
                  {projectFiles.length}
                </span>
              </button>
              {projectsExpanded &&
                projectFiles.map((file) => renderFileRow(file, true))}

              {rootFiles.slice(2).map((file) => renderFileRow(file))}
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
                          e.preventDefault();
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

              <div className={styles.breadcrumb}>
                career
                <span className={styles.crumbSep}>›</span>
                {activeFile.folder ? (
                  <>
                    {activeFile.folder}
                    <span className={styles.crumbSep}>›</span>
                  </>
                ) : null}
                <span className={styles.crumbCurrent}>{activeFile.name}</span>
              </div>

              <div className={styles.editorMain}>
                <div className={styles.editorScroll} ref={scrollRef}>
                  <div className={styles.editorPane} ref={paneRef}>
                    {activeFile.lines.map((line, i) => (
                      <div className={styles.line} key={i} data-row>
                        <span className={styles.lineNumber}>{i + 1}</span>
                        <span className={styles.lineContent}>
                          {isCommand(line) ? (
                            <>
                              <button
                                type="button"
                                className={styles.commandBtn}
                                onClick={(e) => runCommand(e, line)}
                              >
                                {line.cmd}
                              </button>
                              {line.note ? (
                                <span className={styles.commandNote}>
                                  {"  # "}
                                  {line.note}
                                </span>
                              ) : null}
                              {executed[`${activeFileId}:${line.cmd}`] ? (
                                <span className={styles.commandDone}>
                                  ✓ opened
                                </span>
                              ) : null}
                            </>
                          ) : line.length === 0 ? (
                            <>&nbsp;</>
                          ) : (
                            tokenize(line, activeFile.lang).map((token, ti) => (
                              <span key={ti} className={TOKEN_CLASS[token.type]}>
                                {token.text}
                              </span>
                            ))
                          )}
                        </span>
                      </div>
                    ))}

                    <div className={styles.caretRow}>
                      <span className={styles.caret} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <Minimap file={activeFile} onSeek={seekTo} />
              </div>

              <Terminal onOpenFile={openFile} />

              <div className={styles.statusBar}>
                <span className={styles.statusDot} aria-hidden="true" />
                <span>main</span>
                <span>UTF-8</span>
                <span>{activeFile.badge}</span>
                <span className={styles.statusRight}>
                  {activeFile.lines.length} lines
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onSelect={openFile}
        />
      )}
    </section>
  );
}
