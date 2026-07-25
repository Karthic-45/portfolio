export type Line =
  | { kind: "blank" }
  | { kind: "comment"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "plain"; text: string }
  | { kind: "prose"; text: string }
  | { kind: "kv"; key: string; value: string }
  | { kind: "listItem"; text: string }
  | { kind: "log"; timestamp: string; level: string; message: string }
  | {
      kind: "command";
      text: string;
      action: "mailto" | "tel" | "link";
      href: string;
      note?: string;
    };

export interface WorkspaceFile {
  id: string;
  name: string;
  badge: string;
  folder?: string;
  lines: Line[];
}

const GITHUB = "https://github.com/Karthic-45";

function tsProjectLines(p: {
  category: string;
  name: string;
  role: string;
  stack: string[];
  highlights: string[];
}): Line[] {
  return [
    { kind: "comment", text: `// ${p.category}` },
    { kind: "plain", text: "export const project = {" },
    { kind: "kv", key: "  name", value: `"${p.name}",` },
    { kind: "kv", key: "  role", value: `"${p.role}",` },
    {
      kind: "kv",
      key: "  stack",
      value: `[${p.stack.map((s) => `"${s}"`).join(", ")}],`,
    },
    { kind: "plain", text: "  highlights: [" },
    ...p.highlights.map(
      (h): Line => ({ kind: "listItem", text: `"${h}",` })
    ),
    { kind: "plain", text: "  ]," },
    { kind: "kv", key: "  repo", value: `"github.com/Karthic-45"` },
    { kind: "plain", text: "};" },
  ];
}

export const FILES: WorkspaceFile[] = [
  {
    id: "about",
    name: "about.md",
    badge: "MD",
    lines: [
      { kind: "heading", text: "# Karthic N" },
      {
        kind: "comment",
        text: "> Backend Developer · Java & Spring Boot · Microservices · Generative AI Systems",
      },
      { kind: "blank" },
      {
        kind: "prose",
        text: "I'm a backend developer specializing in Java, Spring Boot, REST APIs, and microservices, with a growing focus on Generative AI integration.",
      },
      { kind: "blank" },
      {
        kind: "prose",
        text: "I design RAG-based document intelligence pipelines, secure systems with JWT and role-based access control, and ship production-grade software at the intersection of enterprise engineering and applied LLM technology.",
      },
      { kind: "blank" },
      { kind: "heading", text: "## Quick facts" },
      { kind: "listItem", text: "Location — Tamil Nadu, India" },
      { kind: "listItem", text: "Education — B.E. Computer Science, expected 2028" },
      { kind: "listItem", text: "Role — Technical Lead, College Project Team" },
    ],
  },
  {
    id: "skills",
    name: "skills.json",
    badge: "JSON",
    lines: [
      { kind: "plain", text: "{" },
      {
        kind: "kv",
        key: '  "languages"',
        value: '["Java", "Python", "SQL", "JavaScript", "HTML", "CSS"],',
      },
      {
        kind: "kv",
        key: '  "backend"',
        value:
          '["Spring Boot", "Spring MVC", "Spring Security", "Spring Data JPA", "Hibernate", "Spring Cloud", "Eureka Server"],',
      },
      {
        kind: "kv",
        key: '  "ai_genai"',
        value: '["OpenAI API", "LangChain", "RAG (FAISS)", "OCR", "FastAPI"],',
      },
      {
        kind: "kv",
        key: '  "databases"',
        value: '["MySQL", "PostgreSQL", "MongoDB", "Redis"],',
      },
      {
        kind: "kv",
        key: '  "tools_devops"',
        value:
          '["Git", "GitHub Actions", "Maven", "Docker", "Docker Compose", "Postman", "Swagger", "Linux"],',
      },
      {
        kind: "kv",
        key: '  "cloud_messaging"',
        value: '["AWS EC2", "AWS S3", "Apache Kafka"],',
      },
      {
        kind: "kv",
        key: '  "concepts"',
        value:
          '["OOP", "Design Patterns", "JWT/RBAC", "API Gateway", "Service Discovery", "Distributed Systems", "CI/CD"]',
      },
      { kind: "plain", text: "}" },
    ],
  },
  {
    id: "proj-intelli-credit",
    name: "intelli-credit.ts",
    badge: "TS",
    folder: "projects",
    lines: tsProjectLines({
      category: "GenAI · FinTech",
      name: "Intelli-Credit",
      role: "Corporate Credit Decisioning Engine",
      stack: ["FastAPI", "LangChain", "FAISS", "PostgreSQL", "React", "OCR"],
      highlights: [
        "LLM-driven credit appraisal platform automating loan risk assessment across financial documents, GST filings, and bank statements — cutting manual review effort by ~70%.",
        "FAISS-based RAG pipeline improved document retrieval accuracy by ~60% over keyword search.",
        "OCR-based document intelligence parsing 50+ scanned financial document types in near real-time.",
      ],
    }),
  },
  {
    id: "proj-secure-agent",
    name: "secure-agent.ts",
    badge: "TS",
    folder: "projects",
    lines: tsProjectLines({
      category: "Security · Platform",
      name: "SecureAgent",
      role: "Secure AI Agent Management Platform",
      stack: ["Java", "Spring Boot", "Spring Security", "JWT", "MySQL"],
      highlights: [
        "Production-grade backend for AI agent lifecycle management — registration, activation, monitoring, deactivation at scale.",
        "Secured 20+ API endpoints with JWT authentication and RBAC via Spring Security — zero unauthorized access incidents in testing.",
        "Optimized the persistence layer with Spring Data JPA custom queries, improving response time by ~35% under load.",
      ],
    }),
  },
  {
    id: "proj-ecommerce",
    name: "ecommerce-microservices.ts",
    badge: "TS",
    folder: "projects",
    lines: tsProjectLines({
      category: "Microservices",
      name: "E-Commerce Platform",
      role: "Decomposed Microservices Architecture",
      stack: ["Spring Boot", "Spring Cloud", "Docker", "MySQL", "Eureka"],
      highlights: [
        "Decomposed a monolithic e-commerce system into independently deployable Product, User, Order, and Payment microservices.",
        "Centralized API Gateway for routing, load balancing, and request filtering across 4+ services.",
        "Containerized all services with Docker Compose, cutting environment setup time by ~50%.",
      ],
    }),
  },
  {
    id: "proj-autonomous-car",
    name: "autonomous-car.py",
    badge: "PY",
    folder: "projects",
    lines: [
      { kind: "comment", text: "# IoT · Robotics" },
      { kind: "plain", text: "class AutonomousCar:" },
      {
        kind: "comment",
        text: '    """Autonomous vehicle prototype — Raspberry Pi + OpenCV."""',
      },
      { kind: "blank" },
      {
        kind: "kv",
        key: "    stack",
        value: '["Raspberry Pi", "Python", "OpenCV", "IoT", "Sensors"]',
      },
      { kind: "blank" },
      { kind: "plain", text: "    def highlights(self):" },
      { kind: "plain", text: "        return [" },
      {
        kind: "listItem",
        text: '"Combines obstacle detection, real-time lane recognition, and path planning via OpenCV.",',
      },
      {
        kind: "listItem",
        text: '"Multi-sensor fusion with calibrated low-latency control logic for smooth navigation.",',
      },
      {
        kind: "listItem",
        text: '"Improved directional accuracy by ~45% through iterative sensor tuning and algorithm refinement.",',
      },
      { kind: "plain", text: "        ]" },
      { kind: "blank" },
      { kind: "comment", text: "# >>> AutonomousCar().drive()" },
      { kind: "comment", text: "# Status: en route to the Projects section..." },
    ],
  },
  {
    id: "proj-store",
    name: "store-management.ts",
    badge: "TS",
    folder: "projects",
    lines: tsProjectLines({
      category: "Enterprise Backend",
      name: "Store Management System",
      role: "Inventory & Sales Backend",
      stack: ["Java", "Spring Boot", "MySQL"],
      highlights: [
        "Inventory, sales, and supplier management backend with REST APIs for real-time stock monitoring.",
        "Analytical report generation for high-volume inventory operations.",
        "Streamlined database interactions with Spring Data JPA, reducing average query time by ~25%.",
      ],
    }),
  },
  {
    id: "experience",
    name: "experience.log",
    badge: "LOG",
    lines: [
      { kind: "log", timestamp: "2024-01-01", level: "INFO", message: "role_start: Technical Lead @ College Project Team" },
      { kind: "log", timestamp: "2024-01-01", level: "INFO", message: "org: Sri Krishna College of Technology, Tamil Nadu" },
      { kind: "log", timestamp: "2024-03-10", level: "INFO", message: "Led a cross-functional team of 4 developers shipping an LLM-driven credit analysis platform." },
      { kind: "log", timestamp: "2024-05-22", level: "INFO", message: "Coordinated API design, DB schema planning, and microservices decomposition across all projects." },
      { kind: "log", timestamp: "2024-08-14", level: "INFO", message: "Established Git-based collaboration workflows and code review standards — delivery speed +30%." },
      { kind: "log", timestamp: "2024-11-02", level: "INFO", message: "Mentored junior developers on Spring Boot, REST API design, and JWT-based security." },
      { kind: "log", timestamp: "2028-06-01", level: "WARN", message: "expected_graduation: B.E. Computer Science, CGPA 8.0/10.0 (in progress)" },
    ],
  },
  {
    id: "achievements",
    name: "achievements.yml",
    badge: "YML",
    lines: [
      { kind: "plain", text: "metrics:" },
      { kind: "kv", key: "  credit_analysis_turnaround_reduction", value: "70%" },
      { kind: "kv", key: "  api_endpoints_secured", value: "20+" },
      { kind: "kv", key: "  critical_vulnerabilities", value: "0" },
      { kind: "kv", key: "  projects_shipped", value: "5+" },
      { kind: "kv", key: "  team_delivery_speed_improvement", value: "30%" },
      { kind: "blank" },
      { kind: "plain", text: "notes:" },
      {
        kind: "listItem",
        text: "Applied Generative AI tooling (OpenAI, LangChain, FAISS) inside Java-based enterprise backends.",
      },
      {
        kind: "listItem",
        text: "Zero critical vulnerabilities across the full test lifecycle on SecureAgent.",
      },
    ],
  },
  {
    id: "contact",
    name: "contact.sh",
    badge: "SH",
    lines: [
      { kind: "comment", text: "#!/bin/bash" },
      { kind: "comment", text: "# Let's build something worth shipping." },
      { kind: "blank" },
      { kind: "kv", key: "EMAIL=", value: '"karthicnandakumar4545@gmail.com"' },
      { kind: "kv", key: "PHONE=", value: '"+91 89400 51266"' },
      { kind: "blank" },
      {
        kind: "command",
        text: 'open "mailto:$EMAIL"',
        action: "mailto",
        href: "mailto:karthicnandakumar4545@gmail.com",
        note: "say hello",
      },
      {
        kind: "command",
        text: 'open "tel:$PHONE"',
        action: "tel",
        href: "tel:+918940051266",
        note: "give me a call",
      },
      {
        kind: "command",
        text: 'open "github.com/Karthic-45"',
        action: "link",
        href: GITHUB,
      },
      {
        kind: "command",
        text: 'open "linkedin.com/in/karthic45"',
        action: "link",
        href: "https://www.linkedin.com/in/karthic45",
      },
      { kind: "blank" },
      { kind: "plain", text: 'echo "Open to backend + GenAI opportunities."' },
    ],
  },
];
