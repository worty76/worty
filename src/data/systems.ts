export interface SystemNode {
  id: string;
  label: string;
  sub: string;
  kind: "client" | "infra" | "service" | "data" | "queue";
  x: number; // viewBox 1000×600, rect is centered on (x, y)
  y: number;
  blurb: string;
}

export interface SystemEdge {
  from: string;
  to: string;
  label?: string;
}

export const SYSTEM_NODES: SystemNode[] = [
  {
    id: "client",
    label: "Client",
    sub: "browser · app",
    kind: "client",
    x: 500,
    y: 48,
    blurb:
      "Users (or other services) start here. Every request begins as a leap of faith across the network.",
  },
  {
    id: "lb",
    label: "CDN / Load Balancer",
    sub: "traffic cop",
    kind: "infra",
    x: 500,
    y: 150,
    blurb:
      "Spreads traffic across gateway replicas, terminates TLS and absorbs static load. First line of defense — and the first thing that falls on a traffic spike.",
  },
  {
    id: "gateway",
    label: "API Gateway",
    sub: "single entry point",
    kind: "infra",
    x: 500,
    y: 252,
    blurb:
      "One front door: routing, rate limits, token checks. Services behind it stay dumb and focused on business logic.",
  },
  {
    id: "auth",
    label: "Auth",
    sub: "stateless service",
    kind: "service",
    x: 225,
    y: 362,
    blurb:
      "Verifies tokens and owns identity. Stateless on purpose — you can run ten copies and the load balancer won't care.",
  },
  {
    id: "orders",
    label: "Orders",
    sub: "core domain",
    kind: "service",
    x: 500,
    y: 362,
    blurb:
      "The heart of the business. Reads try Redis first (cache-aside); a MISS falls through to Postgres. Writes always hit the database.",
  },
  {
    id: "payments",
    label: "Payments",
    sub: "moves money",
    kind: "service",
    x: 775,
    y: 362,
    blurb:
      "Never trusts the network: idempotency keys, timeouts and retries everywhere. After committing, it publishes an event instead of emailing anyone directly.",
  },
  {
    id: "redis",
    label: "Redis",
    sub: "cache · in-memory",
    kind: "data",
    x: 105,
    y: 490,
    blurb:
      "Absorbs most reads before they reach the database. It can vanish and the system degrades instead of dying — that's graceful degradation.",
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    sub: "source of truth",
    kind: "data",
    x: 330,
    y: 500,
    blurb:
      "The one component that must not lie. If this goes down, nothing works — which is exactly why it gets replicas, backups and pagers.",
  },
  {
    id: "kafka",
    label: "Kafka",
    sub: "event backbone",
    kind: "queue",
    x: 620,
    y: 500,
    blurb:
      "Services publish facts ('PaymentCompleted'); whoever cares subscribes at their own pace. This decoupling is what keeps microservices sane.",
  },
  {
    id: "notifier",
    label: "Notifier",
    sub: "async worker",
    kind: "service",
    x: 880,
    y: 490,
    blurb:
      "Consumes events and sends emails and pushes. Slow on purpose — the user's request never waits for an email. Irony: if the site is down, nobody gets told.",
  },
];

export const SYSTEM_EDGES: SystemEdge[] = [
  { from: "client", to: "lb" },
  { from: "lb", to: "gateway" },
  { from: "gateway", to: "auth" },
  { from: "gateway", to: "orders" },
  { from: "gateway", to: "payments" },
  { from: "auth", to: "postgres", label: "users" },
  { from: "orders", to: "redis", label: "cache-aside" },
  { from: "orders", to: "postgres" },
  { from: "payments", to: "postgres" },
  { from: "orders", to: "kafka", label: "events" },
  { from: "kafka", to: "notifier", label: "consume" },
];

export const NODE_MAP: Record<string, SystemNode> = Object.fromEntries(
  SYSTEM_NODES.map((n) => [n.id, n])
);
