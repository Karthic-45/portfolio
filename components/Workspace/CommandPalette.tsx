"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FILES } from "./files";
import styles from "./CommandPalette.module.css";

export default function CommandPalette({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FILES;
    return FILES.filter((f) =>
      `${f.folder ?? ""}/${f.name}`.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  const commit = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((prev) =>
        results.length ? (prev - 1 + results.length) % results.length : 0
      );
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const file = results[index];
      if (file) commit(file.id);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Go to file"
      >
        <div className={styles.inputRow}>
          <span className={styles.caretIcon}>›</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Go to file…"
            spellCheck={false}
            autoComplete="off"
          />
          <span className={styles.esc}>ESC</span>
        </div>

        <div className={styles.list}>
          {results.length === 0 ? (
            <div className={styles.empty}>no matching files</div>
          ) : (
            results.map((file, i) => (
              <button
                key={file.id}
                type="button"
                className={`${styles.item} ${
                  i === index ? styles.itemActive : ""
                }`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => commit(file.id)}
              >
                {file.folder ? (
                  <span className={styles.itemPath}>{file.folder}/</span>
                ) : null}
                {file.name}
                <span className={styles.itemBadge}>{file.badge}</span>
              </button>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
