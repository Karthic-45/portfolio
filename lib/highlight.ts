export type Lang = "md" | "json" | "ts" | "py" | "sh" | "yml" | "log";

export type TokenType =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "property"
  | "punct"
  | "boolean"
  | "variable"
  | "function"
  | "heading"
  | "bullet"
  | "timestamp"
  | "logInfo"
  | "logWarn";

export interface Token {
  text: string;
  type: TokenType;
}

interface Rule {
  re: RegExp;
  type: TokenType;
}

const STRING_KEY: Rule = {
  re: /"(?:[^"\\]|\\.)*"(?=\s*:)/y,
  type: "property",
};
const DQ_STRING: Rule = { re: /"(?:[^"\\]|\\.)*"/y, type: "string" };
const SQ_STRING: Rule = { re: /'(?:[^'\\]|\\.)*'/y, type: "string" };
const NUMBER: Rule = { re: /\d+(?:\.\d+)?%?/y, type: "number" };
const IDENT_KEY: Rule = { re: /[A-Za-z_$][\w$-]*(?=\s*:)/y, type: "property" };
const FUNCTION: Rule = { re: /[A-Za-z_$][\w$]*(?=\s*\()/y, type: "function" };
const PUNCT: Rule = { re: /[{}[\](),;:=<>+\-*/|&!?.]/y, type: "punct" };

const HASH_COMMENT: Rule = { re: /#.*/y, type: "comment" };

const RULES: Record<Lang, Rule[]> = {
  md: [
    { re: /^#{1,6}\s.*/y, type: "heading" },
    { re: /^>\s.*/y, type: "comment" },
    { re: /^-\s/y, type: "bullet" },
    { re: /`[^`]+`/y, type: "string" },
    { re: /\*\*[^*]+\*\*/y, type: "keyword" },
  ],
  json: [
    STRING_KEY,
    DQ_STRING,
    { re: /\b(?:true|false|null)\b/y, type: "boolean" },
    NUMBER,
    PUNCT,
  ],
  ts: [
    { re: /\/\/.*/y, type: "comment" },
    STRING_KEY,
    DQ_STRING,
    SQ_STRING,
    {
      re: /\b(?:export|const|let|var|class|function|return|import|from|new|async|await|interface|type|extends|implements|public|private|readonly|default)\b/y,
      type: "keyword",
    },
    { re: /\b(?:true|false|null|undefined)\b/y, type: "boolean" },
    NUMBER,
    IDENT_KEY,
    FUNCTION,
    PUNCT,
  ],
  py: [
    HASH_COMMENT,
    { re: /"""[\s\S]*?"""/y, type: "string" },
    DQ_STRING,
    SQ_STRING,
    {
      re: /\b(?:class|def|return|import|from|self|if|elif|else|for|in|while|try|except|finally|with|as|lambda|yield|pass|raise|not|and|or)\b/y,
      type: "keyword",
    },
    { re: /\b(?:True|False|None)\b/y, type: "boolean" },
    NUMBER,
    IDENT_KEY,
    FUNCTION,
    PUNCT,
  ],
  sh: [
    HASH_COMMENT,
    { re: /\$[A-Za-z_]\w*/y, type: "variable" },
    DQ_STRING,
    SQ_STRING,
    {
      re: /\b(?:echo|open|export|if|then|fi|for|do|done|while|case|esac|function|source|cd|ls|cat)\b/y,
      type: "keyword",
    },
    NUMBER,
    { re: /[A-Za-z_]\w*(?==)/y, type: "property" },
    PUNCT,
  ],
  yml: [
    HASH_COMMENT,
    DQ_STRING,
    SQ_STRING,
    { re: /\b(?:true|false|null|yes|no)\b/y, type: "boolean" },
    NUMBER,
    IDENT_KEY,
    { re: /^\s*-\s/y, type: "bullet" },
    PUNCT,
  ],
  log: [
    { re: /^\[[^\]]*\]/y, type: "timestamp" },
    { re: /\bWARN\b/y, type: "logWarn" },
    { re: /\b(?:INFO|OK)\b/y, type: "logInfo" },
    DQ_STRING,
    NUMBER,
    { re: /\b[a-z_]+(?=:)/y, type: "property" },
  ],
};

/**
 * Scans a single line left to right, trying each language rule at the current
 * position. Unmatched characters accumulate into `plain` tokens.
 */
export function tokenize(line: string, lang: Lang): Token[] {
  const rules = RULES[lang] ?? RULES.ts;
  const tokens: Token[] = [];
  let pos = 0;
  let buffer = "";

  const flush = () => {
    if (buffer) {
      tokens.push({ text: buffer, type: "plain" });
      buffer = "";
    }
  };

  while (pos < line.length) {
    let matched = false;

    for (const rule of rules) {
      rule.re.lastIndex = pos;
      const m = rule.re.exec(line);
      if (m && m[0].length > 0) {
        flush();
        tokens.push({ text: m[0], type: rule.type });
        pos += m[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      buffer += line[pos];
      pos += 1;
    }
  }

  flush();
  return tokens;
}

/** Dominant token type of a line — used to colour the minimap bars. */
export function lineAccent(line: string, lang: Lang): TokenType {
  const tokens = tokenize(line, lang);
  const priority: TokenType[] = [
    "heading",
    "logWarn",
    "keyword",
    "property",
    "string",
    "comment",
  ];
  for (const type of priority) {
    if (tokens.some((t) => t.type === type)) return type;
  }
  return "plain";
}
