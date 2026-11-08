/**
 * Exhibits in /systems — "the display hall".
 * Each one is a small animated hologram of a system pattern (see
 * components/systems/PedestalScene.tsx). Edit the words here freely;
 * `id` picks the hologram model.
 */
export type ExhibitId = "mesh" | "queue" | "cluster" | "iot" | "storage";

export interface Exhibit {
  id: ExhibitId;
  title: string;
  blurb: string;
  tags: string[];
}

export const EXHIBITS: Exhibit[] = [
  {
    id: "mesh",
    title: "Service Mesh",
    blurb:
      "Small, focused services behind one gateway. Each can fail, scale and deploy on its own — the gateway keeps the chaos out of sight.",
    tags: ["Go", "Microservices", "API Gateway"],
  },
  {
    id: "queue",
    title: "Message Queue",
    blurb:
      "Producers drop a message and move on; consumers pick it up at their own pace. Nobody waits, nobody blocks — that's how a system survives a traffic spike.",
    tags: ["RabbitMQ", "Event-driven", "Async"],
  },
  {
    id: "cluster",
    title: "The Cluster",
    blurb:
      "Pods come and go. When one dies, the scheduler quietly starts another somewhere else. Machines are cattle, not pets.",
    tags: ["Kubernetes", "Docker", "Self-healing"],
  },
  {
    id: "iot",
    title: "IoT Broker",
    blurb:
      "Lots of tiny devices publish to one broker over MQTT, and it fans every message out to whoever subscribed — like the IoT platforms I've worked on.",
    tags: ["MQTT", "IoT", "Pub/Sub"],
  },
  {
    id: "storage",
    title: "Cache & Database",
    blurb:
      "Reads try Redis first; only a miss goes down to PostgreSQL. A fast path for most requests, and the truth always safe underneath.",
    tags: ["Redis", "PostgreSQL", "Caching"],
  },
];
