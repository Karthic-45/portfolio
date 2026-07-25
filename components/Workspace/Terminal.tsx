"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMAIL, FILES, GITHUB, LINKEDIN, PHONE_DISPLAY } from "./files";
import styles from "./Terminal.module.css";

type RowType = "system" | "output" | "error" | "input" | "ascii";

interface Row {
  id: number;
  type: RowType;
  text: string;
}

const PROMPT = "karthic@portfolio:~/career$";

const BOOT_LINES = [
  "booting karthic.dev ...",
  "loading modules: spring-boot · langchain · faiss ... ok",
  "indexed 5 projects, 9 files",
  "type 'help' to explore, or 'neofetch' for the short version",
];

const NEOFETCH = `   ██╗  ██╗███╗   ██╗    karthic@portfolio
   ██║ ██╔╝████╗  ██║    ─────────────────────────────
   █████╔╝ ██╔██╗ ██║    Role     Backend Developer
   ██╔═██╗ ██║╚██╗██║    Stack    Java · Spring Boot · GenAI
   ██║  ██╗██║ ╚████║    Projects 5+ shipped
   ╚═╝  ╚═╝╚═╝  ╚═══╝    Location Tamil Nadu, India`;

const HELP = [
  "available commands",
  "  help        show this message",
  "  ls          list files in this workspace",
  "  open <file> open a file in the editor",
  "  cat <file>  print a file to the terminal",
  "  whoami      the short introduction",
  "  stack       core technologies",
  "  contact     how to reach me",
  "  neofetch    system summary",
  "  clear       clear the terminal",
];

export default function Terminal({
  onOpenFile,
}: {
  onOpenFile: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bootedRef = useRef(false);
  const rowIdRef = useRef(0);

  const push = useCallback((type: RowType, text: string) => {
    rowIdRef.current += 1;
    const id = rowIdRef.current;
    setRows((prev) => [...prev, { id, type, text }]);
  }, []);

  // Boot sequence, triggered the first time the terminal scrolls into view.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || bootedRef.current) return;
          bootedRef.current = true;
          observer.disconnect();

          BOOT_LINES.forEach((line, i) => {
            window.setTimeout(
              () => push("system", `> ${line}`),
              reduced ? 0 : i * 420
            );
          });
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [push]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows]);

  const matchFile = (query: string) => {
    const q = query.toLowerCase().replace(/^projects\//, "");
    return (
      FILES.find((f) => f.name.toLowerCase() === q) ??
      FILES.find((f) => f.id.toLowerCase() === q) ??
      FILES.find((f) => f.name.toLowerCase().startsWith(q)) ??
      FILES.find((f) => f.id.toLowerCase().includes(q))
    );
  };

  const run = (raw: string) => {
    const input = raw.trim();
    push("input", `${PROMPT} ${input}`);
    if (!input) return;

    setHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);

    const [command, ...args] = input.split(/\s+/);
    const arg = args.join(" ");

    switch (command.toLowerCase()) {
      case "help":
        HELP.forEach((l) => push("output", l));
        break;

      case "ls":
        FILES.forEach((f) =>
          push("output", `  ${f.folder ? `${f.folder}/` : ""}${f.name}`)
        );
        break;

      case "open": {
        if (!arg) {
          push("error", "usage: open <file>   (try 'ls')");
          break;
        }
        const file = matchFile(arg);
        if (!file) {
          push("error", `open: ${arg}: no such file`);
          break;
        }
        onOpenFile(file.id);
        push("output", `opening ${file.name} ...`);
        break;
      }

      case "cat": {
        if (!arg) {
          push("error", "usage: cat <file>   (try 'ls')");
          break;
        }
        const file = matchFile(arg);
        if (!file) {
          push("error", `cat: ${arg}: no such file`);
          break;
        }
        file.lines.forEach((line) =>
          push("output", typeof line === "string" ? line : line.cmd)
        );
        break;
      }

      case "whoami":
        push(
          "output",
          "Karthic N — backend developer working across Java, Spring Boot,"
        );
        push(
          "output",
          "microservices and applied LLM systems. Technical Lead, 5+ projects."
        );
        break;

      case "stack":
        push("output", "Java · Spring Boot · Spring Security · Spring Cloud");
        push("output", "Python · FastAPI · LangChain · FAISS · OpenAI API");
        push("output", "PostgreSQL · MySQL · MongoDB · Kafka · Docker · AWS");
        break;

      case "contact":
        push("output", `email     ${EMAIL}`);
        push("output", `phone     ${PHONE_DISPLAY}`);
        push("output", `github    ${GITHUB}`);
        push("output", `linkedin  ${LINKEDIN}`);
        push("system", "tip: open contact.sh to run these directly");
        break;

      case "neofetch":
        push("ascii", NEOFETCH);
        break;

      case "clear":
        setRows([]);
        break;

      case "sudo":
        push("error", "nice try — you already have full read access :)");
        break;

      case "exit":
        push("system", "there's no escape, this is a portfolio");
        break;

      default:
        push("error", `command not found: ${command}   (try 'help')`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    }
  };

  const rowClass = (type: RowType) => {
    switch (type) {
      case "system":
        return styles.rowSystem;
      case "error":
        return styles.rowError;
      case "input":
        return styles.rowInput;
      case "ascii":
        return styles.rowAscii;
      default:
        return styles.rowOutput;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.terminal} ${
        open ? styles.terminalOpen : styles.terminalClosed
      }`}
    >
      <button
        type="button"
        className={styles.bar}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          ▲
        </span>
        <span className={styles.barLabel}>Terminal</span>
        <span className={styles.barHint}>
          {open ? "try: help · neofetch · open skills.json" : "click to expand"}
        </span>
      </button>

      {open && (
        <div
          ref={scrollRef}
          className={styles.scroll}
          onClick={() => inputRef.current?.focus()}
        >
          {rows.map((row) => (
            <div key={row.id} className={`${styles.row} ${rowClass(row.type)}`}>
              {row.text}
            </div>
          ))}

          <div className={styles.promptRow}>
            <span className={styles.prompt}>{PROMPT}</span>
            <input
              ref={inputRef}
              className={styles.input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
