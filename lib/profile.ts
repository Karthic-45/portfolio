/**
 * Identity, projects and career content.
 *
 * Everything here is drawn from Karthic's CV. Anything not evidenced there is
 * prefixed PLACEHOLDER: rather than invented — no fabricated versions,
 * percentages, employers or certifications.
 */

export const PROFILE = {
  name: "Karthic N",
  roles: ["Backend Developer", "Cloud Architect", "IoT Engineer"],
  location: "Tamil Nadu, India",
  availability: "Open to backend, cloud and applied-GenAI roles",
  /** One sentence a recruiter can repeat to a hiring manager. */
  positioning:
    "Builds the whole path — devices at the edge, the services that process what they send, and the infrastructure it all runs on.",
  summary:
    "Backend developer working in Java and Spring Boot across REST APIs, microservices and distributed systems, with production experience wiring Generative AI — RAG pipelines and document intelligence — into enterprise backends, and hands-on IoT work from sensors through to control loops.",
};

export const EMAIL = "karthicnandakumar4545@gmail.com";
export const PHONE_DISPLAY = "+91 89400 51266";
export const PHONE_HREF = "tel:+918940051266";
export const GITHUB = "https://github.com/Karthic-45";
export const LINKEDIN = "https://www.linkedin.com/in/karthic45";

/* ---------------------------------------------------------------- projects */

export interface ProjectComponent {
  id: string;
  label: string;
  /** Row in the architecture diagram: 0 = entry, higher = deeper. */
  tier: number;
}

export interface Project {
  id: string;
  name: string;
  summary: string;
  domains: ("backend" | "cloud" | "iot")[];
  /** Nodes in the shared system graph this project actually exercises. */
  touches: string[];
  problem: string;
  architecture: string;
  decisions: string[];
  result: { value: string; label: string }[];
  stack: string[];
  /** Left null when there is no public repo yet, rather than faking one. */
  repo?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "intelli-credit",
    name: "Intelli-Credit",
    summary: "Corporate credit decisioning driven by retrieval, not keywords.",
    domains: ["backend"],
    touches: ["client", "api", "service", "queue", "worker", "database"],
    problem:
      "Credit analysts read financial statements, GST filings and bank statements by hand for every corporate loan — slow, inconsistent between reviewers, and difficult to audit afterwards.",
    architecture:
      "Documents land through OCR, are chunked and embedded into a FAISS index, and a retrieval step assembles only the relevant financial context before the model is asked for a recommendation. Appraisal memos are generated from the same evidence, so every decision can be traced back to source text.",
    decisions: [
      "Chose vector retrieval over keyword search because financial phrasing varies too much between issuers for term matching to be reliable.",
      "Kept generation behind a retrieval step so the model answers from retrieved documents instead of memory.",
      "Ran document parsing asynchronously — a 60-page statement cannot block an HTTP request.",
    ],
    result: [
      { value: "−70%", label: "manual review effort" },
      { value: "+60%", label: "retrieval accuracy vs keyword" },
      { value: "50+", label: "document types parsed" },
    ],
    stack: ["FastAPI", "LangChain", "FAISS", "PostgreSQL", "OCR", "React"],
  },
  {
    id: "secure-agent",
    name: "SecureAgent",
    summary: "Lifecycle and access control for AI agents.",
    domains: ["backend", "cloud"],
    touches: ["gateway", "auth", "api", "service", "database", "monitor"],
    problem:
      "AI agents were being registered and run with no lifecycle controls, no access boundaries and no audit trail — nobody could say which agent did what.",
    architecture:
      "A Spring Boot platform covering registration, activation, monitoring and deactivation. Spring Security enforces JWT authentication and RBAC at the edge of every endpoint; token validation middleware and activity logging sit behind it so each action is attributable.",
    decisions: [
      "Put authorisation in front of the API layer rather than inside handlers, so a missed check cannot expose an endpoint.",
      "Made audit logging non-optional on state changes — attribution is the point of the platform.",
      "Tuned the JPA access layer with custom queries once load testing showed the default fetch strategy was the bottleneck.",
    ],
    result: [
      { value: "20+", label: "endpoints secured" },
      { value: "0", label: "unauthorized access in testing" },
      { value: "−35%", label: "response time under load" },
    ],
    stack: ["Java", "Spring Boot", "Spring Security", "JWT", "MySQL"],
  },
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    summary: "A monolith split into services that can ship independently.",
    domains: ["backend", "cloud"],
    touches: ["gateway", "service", "containers", "loadbalancer", "pipeline"],
    problem:
      "A single deployable codebase meant every change — however small — required redeploying the entire system, and nothing could be scaled on its own.",
    architecture:
      "Product, User, Order and Payment became independently deployable services registered with Eureka. An API Gateway handles routing, load balancing and request filtering so clients keep one entry point. Docker Compose reproduces the whole topology locally.",
    decisions: [
      "Split along business capability rather than technical layer, so a change usually lands in one service.",
      "Used service discovery instead of hardcoded hosts so instances can move without config edits.",
      "Containerised every service to close the gap between local and deployed environments.",
    ],
    result: [
      { value: "4", label: "independently deployable services" },
      { value: "−50%", label: "environment setup time" },
    ],
    stack: ["Spring Boot", "Spring Cloud", "Eureka", "Docker", "MySQL"],
  },
  {
    id: "autonomous-car",
    name: "Autonomous Vehicle Prototype",
    summary: "Perception and control running on constrained hardware.",
    domains: ["iot"],
    touches: ["phenomenon", "sensors", "mcu", "edge", "actuator"],
    problem:
      "Navigate a real surface using only what fits on a Raspberry Pi — no offboard compute, and a control loop tight enough that a late decision is a collision.",
    architecture:
      "Camera and proximity sensors feed a fused input stream. OpenCV performs lane recognition and obstacle detection on-device, path planning turns that into a heading, and motor control closes the loop back into the physical world.",
    decisions: [
      "Kept perception on the edge — a network round trip inside a control loop is a safety risk, not a latency inconvenience.",
      "Fused multiple sensors so one noisy reading could not steer the vehicle.",
      "Tuned the control logic iteratively against real runs rather than trusting bench values.",
    ],
    result: [{ value: "+45%", label: "directional accuracy after tuning" }],
    stack: ["Raspberry Pi", "Python", "OpenCV", "Sensors"],
  },
  {
    id: "store-management",
    name: "Store Management System",
    summary: "Inventory and supplier backend with reporting.",
    domains: ["backend"],
    touches: ["api", "service", "database"],
    problem:
      "Stock levels and supplier records were tracked manually, so there was no real-time visibility and no reliable basis for reporting.",
    architecture:
      "REST services for inventory, sales and supplier management over a relational store, with an analytical reporting path for high-volume queries.",
    decisions: [
      "Tuned the Spring Data JPA layer against realistic data volumes rather than a seeded dev database.",
      "Separated the reporting read path from transactional writes.",
    ],
    result: [{ value: "−25%", label: "average query execution time" }],
    stack: ["Java", "Spring Boot", "MySQL", "Spring Data JPA"],
  },
];

/* -------------------------------------------------------------- evolution */

export interface Era {
  id: string;
  period: string;
  title: string;
  org: string;
  /** Rough system complexity 1-5 — drives how much topology is drawn. */
  scale: number;
  owned: string;
  changed: string;
  impact: string;
  tags: string[];
}

export const ERAS: Era[] = [
  {
    id: "single-service",
    period: "PLACEHOLDER: start year",
    title: "Single services",
    org: "Coursework and self-directed builds",
    scale: 1,
    owned: "One application, one database, end to end.",
    changed:
      "Moved from scripts to structured Spring Boot services with a real persistence layer.",
    impact:
      "Store Management System: inventory, sales and supplier APIs with tuned queries.",
    tags: ["Java", "Spring Boot", "MySQL"],
  },
  {
    id: "physical",
    period: "PLACEHOLDER: year",
    title: "Systems that touch the world",
    org: "Autonomous vehicle prototype",
    scale: 2,
    owned: "Perception, control loop and hardware integration.",
    changed:
      "Took on latency and reliability as physical constraints rather than metrics on a dashboard.",
    impact: "Directional accuracy improved ~45% through iterative tuning.",
    tags: ["Raspberry Pi", "OpenCV", "Sensors"],
  },
  {
    id: "distributed",
    period: "PLACEHOLDER: year",
    title: "Distributed systems",
    org: "E-Commerce platform",
    scale: 4,
    owned: "Service decomposition, gateway routing and containerisation.",
    changed:
      "Split a monolith into four independently deployable services behind discovery and a gateway.",
    impact: "Environment setup time down ~50%; services ship independently.",
    tags: ["Spring Cloud", "Eureka", "Docker"],
  },
  {
    id: "lead",
    period: "2024 — Present",
    title: "Leading delivery",
    org: "Technical Lead · Sri Krishna College of Technology",
    scale: 5,
    owned:
      "API design, schema planning and microservice decomposition across the team's projects; mentoring four developers.",
    changed:
      "Introduced Git-based workflows and enforced code review, and took platform security from an afterthought to a design input.",
    impact:
      "Team delivery speed improved ~30%; 20+ endpoints secured with zero unauthorized access in testing.",
    tags: ["Leadership", "System design", "Security"],
  },
];

/* ----------------------------------------------------------- quick profile */

/** What a recruiter needs inside ten seconds. */
export const QUICK_PROFILE = {
  strongest: [
    {
      area: "Backend engineering",
      proof: "Spring Boot services, REST APIs, JWT/RBAC security, JPA tuning",
    },
    {
      area: "Distributed systems",
      proof: "Monolith → 4 services with Eureka discovery and gateway routing",
    },
    {
      area: "Applied Generative AI",
      proof: "FAISS RAG pipeline and OCR document intelligence in production paths",
    },
    {
      area: "IoT & edge",
      proof: "On-device OpenCV perception and a tuned real-time control loop",
    },
  ],
  headline: [
    { value: "5", label: "systems built end to end" },
    { value: "20+", label: "endpoints secured" },
    { value: "−70%", label: "manual review effort removed" },
    { value: "4", label: "developers led" },
  ],
  education: "B.E. Computer Science — Sri Krishna College of Technology (expected 2028), CGPA 8.0/10.0",
};
