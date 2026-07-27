/**
 * The system graph.
 *
 * This is the single source of truth for the whole portfolio: the 3D topology,
 * the domain explorers and the navigation all read from here, so the spatial
 * scene and the DOM content can never drift apart.
 *
 * Coordinates place all three domains inside ONE architecture rather than
 * three separate scenes — physical devices sit out on -X, application services
 * run through the middle, and cloud infrastructure wraps around +X/-Z.
 *
 * `evidence` is what Karthic actually did at that point in the system. Where
 * no real evidence exists yet it is prefixed PLACEHOLDER: and must be replaced
 * before this goes live — nothing here is invented to look impressive.
 */

export type DomainId = "iot" | "backend" | "cloud";

export type NodeKind =
  | "sensor"
  | "device"
  | "edge"
  | "client"
  | "gateway"
  | "auth"
  | "api"
  | "service"
  | "cache"
  | "database"
  | "queue"
  | "worker"
  | "loadbalancer"
  | "container"
  | "storage"
  | "monitor"
  | "actuator";

export interface SystemNode {
  id: string;
  domain: DomainId;
  kind: NodeKind;
  label: string;
  /** One line: what this component does in the system. */
  role: string;
  tech: string[];
  /** What he built here. PLACEHOLDER: marks unverified content. */
  evidence: string;
  /** Project ids that exercise this node. */
  projects?: string[];
  pos: [number, number, number];
}

export type EdgeKind =
  | "telemetry"
  | "request"
  | "persist"
  | "event"
  | "deploy"
  | "observe"
  | "control";

export interface SystemEdge {
  from: string;
  to: string;
  kind: EdgeKind;
}

export interface Domain {
  id: DomainId;
  index: number;
  title: string;
  /** The question this part of the system answers. */
  premise: string;
  /** Ordered walk through this domain, by node id. */
  flow: string[];
  /** Where the camera docks to read this domain. */
  camera: { position: [number, number, number]; target: [number, number, number] };
}

/* ------------------------------------------------------------------ nodes */

export const NODES: SystemNode[] = [
  /* ---- IoT: the physical edge ------------------------------------- */
  {
    id: "phenomenon",
    domain: "iot",
    kind: "sensor",
    label: "Physical world",
    role: "Lane markings, obstacles and distance — the signal before it is data.",
    tech: ["Optics", "Ultrasonic"],
    evidence:
      "Autonomous vehicle prototype operating on real driving surfaces rather than simulation.",
    projects: ["autonomous-car"],
    pos: [-26, 1.5, 6],
  },
  {
    id: "sensors",
    domain: "iot",
    kind: "sensor",
    label: "Sensor array",
    role: "Camera and proximity sensors sampling the environment continuously.",
    tech: ["Camera", "Proximity sensors", "Multi-sensor fusion"],
    evidence:
      "Fused several sensor inputs so a single noisy reading could not steer the vehicle.",
    projects: ["autonomous-car"],
    pos: [-21, -1, 3],
  },
  {
    id: "mcu",
    domain: "iot",
    kind: "device",
    label: "Microcontroller",
    role: "Reads sensors on a fixed loop and drives the control output.",
    tech: ["Raspberry Pi", "Python", "GPIO"],
    evidence:
      "Control loop tuned iteratively for low latency; directional accuracy improved ~45%.",
    projects: ["autonomous-car"],
    pos: [-17, 2, 0],
  },
  {
    id: "edge",
    domain: "iot",
    kind: "edge",
    label: "Edge processing",
    role: "Vision runs on-device so decisions do not wait on a round trip.",
    tech: ["OpenCV", "Lane detection", "Obstacle detection"],
    evidence:
      "Real-time lane recognition and obstacle detection computed at the edge.",
    projects: ["autonomous-car"],
    pos: [-12.5, -1.5, 4],
  },
  {
    id: "actuator",
    domain: "iot",
    kind: "actuator",
    label: "Actuation",
    role: "Steering and drive response — the loop closing back into the world.",
    tech: ["Motor control", "PWM"],
    evidence: "Path planning translated into smooth navigation commands.",
    projects: ["autonomous-car"],
    pos: [-21, 4.5, -2],
  },

  /* ---- Backend: the application path ------------------------------- */
  {
    id: "client",
    domain: "backend",
    kind: "client",
    label: "Client",
    role: "Browser or device opening a request against the platform.",
    tech: ["React", "REST"],
    evidence: "Front ends consuming the APIs documented via OpenAPI/Swagger.",
    projects: ["intelli-credit"],
    pos: [-6, 0, 2],
  },
  {
    id: "gateway",
    domain: "backend",
    kind: "gateway",
    label: "API Gateway",
    role: "Single entry point: routing, load balancing and request filtering.",
    tech: ["Spring Cloud Gateway", "Eureka"],
    evidence:
      "Centralised routing across 4+ services with service discovery instead of hardcoded hosts.",
    projects: ["ecommerce"],
    pos: [-2, 2.5, 0],
  },
  {
    id: "auth",
    domain: "backend",
    kind: "auth",
    label: "Authentication",
    role: "Verifies identity and resolves role before anything else executes.",
    tech: ["Spring Security", "JWT", "RBAC"],
    evidence:
      "20+ endpoints protected with JWT and role-based access control; zero unauthorized access in testing.",
    projects: ["secure-agent"],
    pos: [1.5, -1.5, 3],
  },
  {
    id: "api",
    domain: "backend",
    kind: "api",
    label: "API layer",
    role: "Versioned REST surface with documented contracts.",
    tech: ["Spring MVC", "REST", "OpenAPI / Swagger"],
    evidence:
      "Contract-first APIs that cut frontend integration time by roughly 40%.",
    projects: ["secure-agent"],
    pos: [5, 1.5, 0],
  },
  {
    id: "service",
    domain: "backend",
    kind: "service",
    label: "Service layer",
    role: "Domain logic, isolated from transport and persistence concerns.",
    tech: ["Spring Boot", "Java 17", "FastAPI"],
    evidence:
      "Agent lifecycle management — registration, activation, monitoring, deactivation.",
    projects: ["secure-agent", "intelli-credit"],
    pos: [9, -1, 3],
  },
  {
    id: "cache",
    domain: "backend",
    kind: "cache",
    label: "Cache",
    role: "Absorbs repeat reads before they reach the database.",
    tech: ["Redis"],
    evidence: "PLACEHOLDER: describe a specific caching decision and its effect.",
    pos: [12.5, 3.5, 5],
  },
  {
    id: "database",
    domain: "backend",
    kind: "database",
    label: "Persistence",
    role: "Relational and document stores behind a tuned data-access layer.",
    tech: ["PostgreSQL", "MySQL", "MongoDB", "Spring Data JPA", "Hibernate"],
    evidence:
      "Custom JPA query strategies cut response time ~35% under load and query execution ~25% on high-volume inventory operations.",
    projects: ["secure-agent", "store-management"],
    pos: [13, -3, 0],
  },
  {
    id: "queue",
    domain: "backend",
    kind: "queue",
    label: "Message queue",
    role: "Decouples producers from consumers so slow work cannot block a request.",
    tech: ["Apache Kafka"],
    evidence: "PLACEHOLDER: name the events published and who consumes them.",
    pos: [17, 1, 4],
  },
  {
    id: "worker",
    domain: "backend",
    kind: "worker",
    label: "Async workers",
    role: "Long-running work — document parsing, retrieval, report generation.",
    tech: ["OCR", "LangChain", "FAISS", "OpenAI API"],
    evidence:
      "RAG pipeline over financial documents: retrieval accuracy +60% vs keyword search, 50+ document types parsed, review effort down ~70%.",
    projects: ["intelli-credit"],
    pos: [20.5, -2, 1],
  },

  /* ---- Cloud: how it runs ------------------------------------------ */
  {
    id: "loadbalancer",
    domain: "cloud",
    kind: "loadbalancer",
    label: "Ingress",
    role: "Distributes incoming traffic across healthy instances.",
    tech: ["Load balancing", "Health checks"],
    evidence:
      "Gateway-level routing and load balancing across independently deployable services.",
    projects: ["ecommerce"],
    pos: [3, 7.5, -12],
  },
  {
    id: "containers",
    domain: "cloud",
    kind: "container",
    label: "Containers",
    role: "Every service ships as an image; environments are reproducible.",
    tech: ["Docker", "Docker Compose"],
    evidence:
      "Containerised all services — environment setup time down roughly 50% and consistent across environments.",
    projects: ["ecommerce"],
    pos: [8, 5.5, -15],
  },
  {
    id: "pipeline",
    domain: "cloud",
    kind: "container",
    label: "CI/CD",
    role: "Build, test and publish on every push.",
    tech: ["GitHub Actions", "Maven"],
    evidence:
      "Git-based workflow with enforced review; team delivery speed improved ~30%.",
    pos: [13, 8, -13],
  },
  {
    id: "instances",
    domain: "cloud",
    kind: "container",
    label: "Compute",
    role: "Where the containers actually run.",
    tech: ["AWS EC2", "Linux"],
    evidence: "PLACEHOLDER: instance sizing, scaling policy and what drove it.",
    pos: [17.5, 5, -16],
  },
  {
    id: "objectstore",
    domain: "cloud",
    kind: "storage",
    label: "Object storage",
    role: "Durable storage for documents and build artefacts.",
    tech: ["AWS S3"],
    evidence: "PLACEHOLDER: what is stored, retention and access pattern.",
    pos: [21, 7.5, -12],
  },
  {
    id: "monitor",
    domain: "cloud",
    kind: "monitor",
    label: "Observability",
    role: "Audit trails and activity logging across the platform.",
    tech: ["Audit logging", "Token validation middleware"],
    evidence:
      "Activity tracked end to end for security compliance on the agent platform.",
    projects: ["secure-agent"],
    pos: [10, 9.5, -9],
  },
];

/* ------------------------------------------------------------------ edges */

export const EDGES: SystemEdge[] = [
  // physical loop
  { from: "phenomenon", to: "sensors", kind: "telemetry" },
  { from: "sensors", to: "mcu", kind: "telemetry" },
  { from: "mcu", to: "edge", kind: "telemetry" },
  { from: "edge", to: "actuator", kind: "control" },
  { from: "actuator", to: "phenomenon", kind: "control" },
  // edge reaches the platform
  { from: "edge", to: "gateway", kind: "telemetry" },
  // request path
  { from: "client", to: "gateway", kind: "request" },
  { from: "gateway", to: "auth", kind: "request" },
  { from: "auth", to: "api", kind: "request" },
  { from: "api", to: "service", kind: "request" },
  { from: "service", to: "cache", kind: "request" },
  { from: "service", to: "database", kind: "persist" },
  { from: "cache", to: "database", kind: "persist" },
  { from: "service", to: "queue", kind: "event" },
  { from: "queue", to: "worker", kind: "event" },
  { from: "worker", to: "database", kind: "persist" },
  // infrastructure
  { from: "loadbalancer", to: "gateway", kind: "request" },
  { from: "pipeline", to: "containers", kind: "deploy" },
  { from: "containers", to: "instances", kind: "deploy" },
  { from: "containers", to: "service", kind: "deploy" },
  { from: "instances", to: "objectstore", kind: "persist" },
  { from: "worker", to: "objectstore", kind: "persist" },
  { from: "monitor", to: "service", kind: "observe" },
  { from: "monitor", to: "gateway", kind: "observe" },
  { from: "monitor", to: "instances", kind: "observe" },
];

/* ---------------------------------------------------------------- domains */

export const DOMAINS: Domain[] = [
  {
    id: "iot",
    index: 0,
    title: "IoT & Edge",
    premise:
      "A system that touches the physical world has to decide locally — the network is not always there, and latency is a safety property.",
    flow: ["phenomenon", "sensors", "mcu", "edge", "actuator"],
    camera: { position: [-19, 2, 16], target: [-19, 1, 1] },
  },
  {
    id: "backend",
    index: 1,
    title: "Backend Engineering",
    premise:
      "One request, followed all the way down: who is allowed in, what runs, what is written, and what is deferred.",
    flow: [
      "client",
      "gateway",
      "auth",
      "api",
      "service",
      "cache",
      "database",
      "queue",
      "worker",
    ],
    camera: { position: [7, 1, 20], target: [7, 0, 1] },
  },
  {
    id: "cloud",
    index: 2,
    title: "Cloud & Delivery",
    premise:
      "The same services, seen as infrastructure: how they are built, shipped, run and watched.",
    flow: [
      "pipeline",
      "containers",
      "instances",
      "loadbalancer",
      "objectstore",
      "monitor",
    ],
    camera: { position: [12, 9, 4], target: [12, 6, -13] },
  },
];

/* ------------------------------------------------------------- accessors */

export const NODE_BY_ID = new Map(NODES.map((n) => [n.id, n]));

export const getNode = (id: string) => NODE_BY_ID.get(id);

export const getDomain = (id: DomainId) =>
  DOMAINS.find((d) => d.id === id) ?? DOMAINS[1];

/** Neighbours in either direction — used to highlight dependencies on hover. */
export function neighboursOf(id: string): Set<string> {
  const out = new Set<string>();
  EDGES.forEach((e) => {
    if (e.from === id) out.add(e.to);
    if (e.to === id) out.add(e.from);
  });
  return out;
}

/** Human-readable label for an edge type, shown on connection hover. */
export const EDGE_LABEL: Record<EdgeKind, string> = {
  telemetry: "telemetry",
  request: "request",
  persist: "write",
  event: "event",
  deploy: "deploy",
  observe: "observe",
  control: "control",
};
