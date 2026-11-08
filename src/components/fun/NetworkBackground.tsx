"use client";

import { useEffect, useRef } from "react";

/**
 * Living service-mesh background.
 *
 * A quiet graph of "services" (nodes) wired to their nearest neighbours.
 * Requests (packets) hop from service to service; nodes pulse when they
 * receive one. Every so often a node goes down — traffic reroutes around it,
 * dropped packets fizzle out — and then it recovers. The cursor lights up the
 * links around it, and a click fans a request out from the closest service.
 *
 * Readability first: the graph fades out behind the centre content column,
 * runs at low contrast, is theme-aware (reads --primary-text-rgb) and renders
 * one static frame under prefers-reduced-motion.
 */

type RGB = { r: number; g: number; b: number };

interface Node {
  x: number;
  y: number;
  bx: number;
  by: number;
  r: number;
  ph: number;
  load: number;
  down: number; // seconds left offline (0 = healthy)
  heal: number; // 0..1 pulse when it comes back
  label: string | null;
  nbrs: number[];
  fade: number; // 0..1 visibility (content-column fade)
}

interface Packet {
  from: number;
  to: number;
  t: number;
  speed: number;
  hops: number;
  req: boolean; // user-triggered (brighter)
  dropped: number; // >0 while fizzling out
}

const LABELS = [
  "api-gateway", "auth", "orders", "users", "payments", "queue", "cache", "postgres",
  "worker", "events", "search", "notify", "mqtt", "redis", "billing", "inventory",
  "ws", "cron", "metrics", "rabbitmq",
];

const CONTENT_W = 1100; // keep in sync with the page max width
const MOUSE_R = 180;

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let last = 0;
    let time = 0;
    let nextFail = 6;
    let spawnAcc = 0;
    let rgb: RGB = { r: 221, g: 198, b: 182 };
    const mouse = { x: -9999, y: -9999 };
    let nodes: Node[] = [];
    let packets: Packet[] = [];

    const readTheme = () => {
      const c = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-text-rgb")
        .trim()
        .split(/\s+/)
        .map(Number);
      if (c.length === 3 && c.every((n) => !Number.isNaN(n))) rgb = { r: c[0], g: c[1], b: c[2] };
    };
    const col = (a: number) => `rgba(${rgb.r},${rgb.g},${rgb.b},${a.toFixed(3)})`;

    /** 0.28 inside the reading column, 1 in the margins */
    const fadeAt = (x: number) => {
      if (w < CONTENT_W + 160) return 0.5;
      const half = CONTENT_W / 2;
      const d = Math.abs(x - w / 2) - half + 40;
      return 0.28 + 0.72 * Math.min(1, Math.max(0, d / 140));
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // jittered grid → evenly spread but organic
      const cell = w < 640 ? 118 : 150;
      const cols = Math.ceil(w / cell) + 1;
      const rows = Math.ceil(h / cell) + 1;
      nodes = [];
      let li = 0;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          if (Math.random() < 0.18) continue;
          const bx = (cx - 0.25 + Math.random() * 0.8) * cell;
          const by = (cy - 0.25 + Math.random() * 0.8) * cell;
          const fade = fadeAt(bx);
          nodes.push({
            x: bx,
            y: by,
            bx,
            by,
            r: 1.8 + Math.random() * 1.6,
            ph: Math.random() * Math.PI * 2,
            load: 0,
            down: 0,
            heal: 0,
            label: fade > 0.9 && w >= 900 && Math.random() < 0.32 ? LABELS[li++ % LABELS.length] : null,
            nbrs: [],
            fade,
          });
        }
      }
      // connect each node to its 2–3 nearest neighbours
      const maxD = cell * 1.9;
      nodes.forEach((n, i) => {
        const near = nodes
          .map((m, j) => ({ j, d: Math.hypot(m.bx - n.bx, m.by - n.by) }))
          .filter((o) => o.j !== i && o.d < maxD)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2 + (Math.random() < 0.4 ? 1 : 0));
        near.forEach(({ j }) => {
          if (!n.nbrs.includes(j)) n.nbrs.push(j);
          if (!nodes[j].nbrs.includes(i)) nodes[j].nbrs.push(i);
        });
      });
      packets = [];
    };

    const healthyNbr = (at: number, avoid: number) => {
      const opts = nodes[at].nbrs.filter((j) => j !== avoid && nodes[j].down <= 0);
      return opts.length ? opts[Math.floor(Math.random() * opts.length)] : -1;
    };

    const spawn = (from: number, req = false, to = -1) => {
      if (nodes[from].down > 0) return;
      const dest = to >= 0 ? to : healthyNbr(from, -1);
      if (dest < 0) return;
      packets.push({
        from,
        to: dest,
        t: 0,
        speed: (req ? 210 : 95 + Math.random() * 70) / Math.max(40, Math.hypot(nodes[dest].bx - nodes[from].bx, nodes[dest].by - nodes[from].by)),
        hops: req ? 3 : 1 + Math.floor(Math.random() * 4),
        req,
        dropped: 0,
      });
    };

    const update = (dt: number) => {
      time += dt;
      // gentle drift
      for (const n of nodes) {
        n.x = n.bx + Math.sin(time * 0.25 + n.ph) * 5;
        n.y = n.by + Math.cos(time * 0.21 + n.ph) * 5;
        n.load = Math.max(0, n.load - dt * 1.6);
        n.heal = Math.max(0, n.heal - dt * 0.9);
        if (n.down > 0) {
          n.down -= dt;
          if (n.down <= 0) n.heal = 1;
        }
      }
      // chaos monkey: take a random service down now and then
      nextFail -= dt;
      if (nextFail <= 0 && nodes.length) {
        nextFail = 7 + Math.random() * 8;
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        if (n.down <= 0) n.down = 3.5 + Math.random() * 2;
      }
      // background traffic
      spawnAcc += dt * Math.min(14, nodes.length * 0.12);
      while (spawnAcc > 1) {
        spawnAcc -= 1;
        if (packets.length < 70 && nodes.length) spawn(Math.floor(Math.random() * nodes.length));
      }
      // move packets
      const next: Packet[] = [];
      for (const p of packets) {
        if (p.dropped > 0) {
          p.dropped -= dt * 2.2;
          if (p.dropped > 0) next.push(p);
          continue;
        }
        p.t += p.speed * dt;
        if (p.t < 1) {
          next.push(p);
          continue;
        }
        const at = nodes[p.to];
        if (at.down > 0) {
          // destination is down → the request fails
          p.t = 1;
          p.dropped = 1;
          next.push(p);
          continue;
        }
        at.load = Math.min(1, at.load + (p.req ? 1 : 0.7));
        if (p.hops > 1) {
          const nx = healthyNbr(p.to, p.from); // reroutes around dead nodes
          if (nx >= 0) {
            const d = Math.max(40, Math.hypot(nodes[nx].bx - at.bx, nodes[nx].by - at.by));
            next.push({ ...p, from: p.to, to: nx, t: 0, hops: p.hops - 1, speed: (p.req ? 210 : 95 + Math.random() * 70) / d });
          }
        }
      }
      packets = next;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const glowAt = (x: number, y: number) => Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / MOUSE_R);

      // links
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (const j of a.nbrs) {
          if (j < i) continue;
          const b = nodes[j];
          const g = glowAt((a.x + b.x) / 2, (a.y + b.y) / 2);
          const dead = a.down > 0 || b.down > 0;
          const alpha = (0.075 + g * 0.3) * Math.min(a.fade, b.fade) * (dead ? 0.35 : 1);
          ctx.strokeStyle = col(alpha);
          ctx.setLineDash(dead ? [3, 5] : []);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // packets with short trails
      for (const p of packets) {
        const a = nodes[p.from];
        const b = nodes[p.to];
        const f = Math.min(a.fade, b.fade);
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        if (p.dropped > 0) {
          // fizzle: a small expanding ✕
          const s = 3 + (1 - p.dropped) * 5;
          ctx.strokeStyle = col(0.5 * p.dropped * f);
          ctx.beginPath();
          ctx.moveTo(x - s, y - s);
          ctx.lineTo(x + s, y + s);
          ctx.moveTo(x + s, y - s);
          ctx.lineTo(x - s, y + s);
          ctx.stroke();
          continue;
        }
        const tail = Math.max(0, p.t - 0.18);
        const grad = ctx.createLinearGradient(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail, x, y);
        grad.addColorStop(0, col(0));
        grad.addColorStop(1, col((p.req ? 0.8 : 0.42) * f));
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.req ? 2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = col((p.req ? 0.95 : 0.6) * f);
        const s = p.req ? 3.4 : 2.4;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      ctx.lineWidth = 1;

      // services
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (const n of nodes) {
        const g = glowAt(n.x, n.y);
        const f = n.fade;
        if (n.down > 0) {
          const blink = 0.5 + 0.5 * Math.sin(time * 8);
          ctx.strokeStyle = col((0.18 + 0.2 * blink) * f);
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = col((0.22 + n.load * 0.5 + g * 0.5) * f);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + n.load * 1.2 + g * 1.5, 0, Math.PI * 2);
          ctx.fill();
          if (n.load > 0.05) {
            ctx.strokeStyle = col(n.load * 0.28 * f);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + (1 - n.load) * 14, 0, Math.PI * 2);
            ctx.stroke();
          }
          if (n.heal > 0) {
            ctx.strokeStyle = col(n.heal * 0.45 * f);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + (1 - n.heal) * 26, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        if (n.label) {
          ctx.fillStyle = col((n.down > 0 ? 0.22 : 0.13 + g * 0.35) * f);
          ctx.fillText(n.down > 0 ? `${n.label} ✕` : n.label, n.x + 8, n.y + 3.5);
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      build();
      if (reduced) {
        draw();
      } else {
        // warm up so the first frame already has traffic
        for (let i = 0; i < 90; i++) update(1 / 30);
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    let resizeT: ReturnType<typeof setTimeout> | null = null;
    let lastW = window.innerWidth;
    const onResize = () => {
      // mobile URL-bar show/hide only changes height — don't rebuild for that
      if (Math.abs(window.innerWidth - lastW) < 2 && Math.abs(window.innerHeight - h) < 160) {
        h = window.innerHeight;
        return;
      }
      lastW = window.innerWidth;
      if (resizeT) clearTimeout(resizeT);
      resizeT = setTimeout(start, 150);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onDown = (e: PointerEvent) => {
      if (reduced || !nodes.length) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("a,button,input,textarea,select,[role=button]")) return;
      // fan a request out from the closest healthy service
      let best = -1;
      let bd = Infinity;
      nodes.forEach((n, i) => {
        const d = Math.hypot(n.x - e.clientX, n.y - e.clientY);
        if (d < bd && n.down <= 0) {
          bd = d;
          best = i;
        }
      });
      if (best < 0 || bd > 260) return;
      nodes[best].load = 1;
      nodes[best].nbrs.forEach((j) => spawn(best, true, j));
    };
    const onMotion = () => {
      reduced = motion.matches;
      start();
    };

    readTheme();
    const themeObserver = new MutationObserver(() => {
      readTheme();
      if (reduced) draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    motion.addEventListener("change", onMotion);
    start();

    return () => {
      cancelAnimationFrame(raf);
      if (resizeT) clearTimeout(resizeT);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      motion.removeEventListener("change", onMotion);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
