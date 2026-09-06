"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  NODE_MAP,
  SYSTEM_EDGES,
  SYSTEM_NODES,
  type SystemNode,
} from "@/data/systems";

const NODE_W = 160;
const NODE_H = 52;
const CLIENT_W = 110;

const nodeW = (n: SystemNode) => (n.kind === "client" ? CLIENT_W : NODE_W);

/** distance from a box center to its border along a unit direction */
const boxTrim = (w: number, ux: number, uy: number) => {
  const tx = Math.abs(ux) < 1e-6 ? Infinity : w / 2 / Math.abs(ux);
  const ty = Math.abs(uy) < 1e-6 ? Infinity : NODE_H / 2 / Math.abs(uy);
  return Math.min(tx, ty);
};

/** dashed hand-drawn zone outlines: "what lives where" */
const ZONES = [
  { x: 385, y: 12, w: 230, h: 288, label: "the edge" },
  { x: 125, y: 320, w: 750, h: 92, label: "the services — small, focused, replaceable" },
  { x: 15, y: 458, w: 420, h: 88, label: "state" },
  { x: 520, y: 458, w: 458, h: 88, label: "events & the slow lane" },
];

const STEPS = [
  "a request lands at the front door — the gateway checks who you are and points you to the right room.",
  "reads try Redis first. the database is the backup plan, not the default.",
  "writes commit to PostgreSQL — the one box that is never allowed to lie.",
  "when something important happens, services publish a fact to Kafka instead of calling each other.",
  "slow work (emails, pushes, whatever) happens later in workers — nobody waits for it.",
];

export default function SystemsPage() {
  const [selected, setSelected] = useState<SystemNode | null>(null);

  useEffect(() => {
    document.title = "how I see distributed systems · worty";
  }, []);

  const inkSoft = "rgb(var(--primary-text-rgb) / 0.4)";

  const edges = useMemo(
    () =>
      SYSTEM_EDGES.map((e) => {
        const a = NODE_MAP[e.from];
        const b = NODE_MAP[e.to];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const ta = boxTrim(nodeW(a), ux, uy);
        const tb = boxTrim(nodeW(b), ux, uy);
        const sx = a.x + ux * (ta + 3);
        const sy = a.y + uy * (ta + 3);
        const ex = b.x - ux * (tb + 5);
        const ey = b.y - uy * (tb + 5);
        return { ...e, sx, sy, ex, ey };
      }),
    []
  );

  const scrap =
    "rounded-[14px_5px_16px_6px] border border-[rgb(var(--primary-text-rgb)_/_0.22)] bg-white/[0.04]";

  return (
    <main className="min-h-screen px-4 py-10">
      {/* the paper sheet */}
      <div
        className="relative max-w-6xl mx-auto rounded-[20px_8px_24px_10px] border border-[rgb(var(--primary-text-rgb)_/_0.28)] px-4 md:px-8 pt-7 pb-6 shadow-[0_20px_60px_rgb(0_0_0/0.35)]"
        style={{
          background:
            "linear-gradient(rgba(var(--primary-text-rgb) / 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--primary-text-rgb) / 0.03) 1px, transparent 1px), var(--color-primary-bg)",
          backgroundSize: "26px 26px, 26px 26px, auto",
        }}
      >
        {/* washi tape */}
        <div className="absolute -top-3 left-8 w-24 h-7 rotate-[-7deg] rounded-[3px] bg-[rgb(var(--primary-text-rgb)/0.16)]" />
        <div className="absolute -top-2 right-12 w-20 h-6 rotate-[5deg] rounded-[3px] bg-[rgb(var(--primary-text-rgb)/0.13)]" />

        <Link
          href="/"
          className="inline-block [font-family:var(--font-hand)] text-sm secondary-color-text opacity-70 hover:opacity-100 transition-opacity border border-[rgb(var(--primary-text-rgb)_/_0.3)] rounded-[10px_4px_12px_5px] px-3 py-1 -rotate-1"
        >
          {"\u2190 back home"}
        </Link>

        <h1 className="[font-family:var(--font-sketch)] text-5xl md:text-6xl secondary-color-text mt-4 -rotate-1 leading-none">
          how I see distributed systems
        </h1>
        <svg
          width="260"
          height="14"
          viewBox="0 0 260 14"
          className="mt-1 mb-3 -rotate-1"
          aria-hidden="true"
        >
          <path
            d="M3 8 Q 30 3, 62 7 T 128 6 T 195 8 T 257 5"
            fill="none"
            stroke="rgb(var(--primary-text-rgb) / 0.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="secondary-color-text opacity-60 text-sm md:text-base max-w-2xl mb-6">
          what a microservices architecture looks like when I draw it from
          memory. no moving parts here — just the map, the neighborhoods, and
          a few notes to self. click any box if you want the long version.
        </p>

        <div className="grid md:grid-cols-[1fr_300px] gap-4">
          {/* the sketch */}
          <div className={`relative ${scrap} overflow-x-auto p-1`}>
            <svg
              viewBox="0 0 1000 620"
              className="w-full min-w-[640px] block"
              role="img"
              aria-label="Hand-drawn sketch of a microservices architecture"
            >
              <defs>
                <filter id="sketch" x="-4%" y="-4%" width="108%" height="108%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.022"
                    numOctaves="2"
                    seed="11"
                    result="n"
                  />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
                </filter>
              </defs>

              {/* hand-drawn ink: zones, edges, doodles */}
              <g filter="url(#sketch)" fill="none" strokeLinecap="round">
                {ZONES.map((z) => (
                  <rect
                    key={z.label}
                    x={z.x}
                    y={z.y}
                    width={z.w}
                    height={z.h}
                    rx={16}
                    stroke="rgb(var(--primary-text-rgb) / 0.22)"
                    strokeWidth={1.4}
                    strokeDasharray="9 7"
                  />
                ))}
                {edges.map((e) => {
                  const ang = Math.atan2(e.ey - e.sy, e.ex - e.sx);
                  const dashed = e.to === "notifier";
                  return (
                    <g key={`${e.from}-${e.to}`} stroke={inkSoft} strokeWidth={1.6}>
                      <line
                        x1={e.sx}
                        y1={e.sy}
                        x2={e.ex}
                        y2={e.ey}
                        strokeDasharray={dashed ? "7 6" : undefined}
                      />
                      <line x1={e.ex} y1={e.ey} x2={e.ex - 12 * Math.cos(ang + 0.5)} y2={e.ey - 12 * Math.sin(ang + 0.5)} />
                      <line x1={e.ex} y1={e.ey} x2={e.ex - 12 * Math.cos(ang - 0.5)} y2={e.ey - 12 * Math.sin(ang - 0.5)} />
                    </g>
                  );
                })}
                {/* coffee stain, obviously */}
                <circle cx={925} cy={52} r={16} stroke="rgb(var(--primary-text-rgb) / 0.14)" strokeWidth={2} />
                <circle cx={925} cy={52} r={21} stroke="rgb(var(--primary-text-rgb) / 0.09)" strokeWidth={1.5} strokeDasharray="30 14" />
              </g>

              {/* zone labels */}
              {ZONES.map((z) => (
                <text
                  key={`zl-${z.label}`}
                  x={z.x + 6}
                  y={z.y - 7}
                  fontSize={16}
                  fill="rgb(var(--primary-text-rgb) / 0.4)"
                  style={{ fontFamily: "var(--font-sketch)" }}
                  transform={`rotate(-0.8 ${z.x} ${z.y})`}
                >
                  {z.label}
                </text>
              ))}

              {/* edge labels */}
              {edges
                .filter((e) => e.label)
                .map((e) => (
                  <text
                    key={`lbl-${e.from}-${e.to}`}
                    x={(e.sx + e.ex) / 2}
                    y={(e.sy + e.ey) / 2 - 8}
                    textAnchor="middle"
                    fontSize={13}
                    fill="rgb(var(--primary-text-rgb) / 0.45)"
                    style={{ fontFamily: "var(--font-hand)" }}
                    transform={`rotate(-1.5 ${(e.sx + e.ex) / 2} ${(e.sy + e.ey) / 2})`}
                  >
                    {e.label}
                  </text>
                ))}

              {/* margin notes (notes to self) */}
              <g fill="rgb(var(--primary-text-rgb) / 0.5)" style={{ fontFamily: "var(--font-sketch)" }}>
                <text x={40} y={584} fontSize={19} transform="rotate(-2 40 584)">{"psst \u2014 ~90% of reads"}</text>
                <text x={40} y={606} fontSize={19} transform="rotate(-2 40 606)">{"never actually reach the DB"}</text>
                <text x={520} y={592} fontSize={17} transform="rotate(1.2 520 592)">{"services don\u2019t call each other \u2014 they gossip through events"}</text>
                <text x={608} y={242} fontSize={18} transform="rotate(-1.5 608 242)">{"one door. many rooms."}</text>
                <text x={500} y={616} fontSize={15} textAnchor="middle" opacity={0.75} transform="rotate(-0.6 500 616)">{"fig. 1 \u2014 the system, from memory"}</text>
              </g>

              {/* nodes — hand-placed, slightly tilted */}
              {SYSTEM_NODES.map((n, i) => {
                const w = nodeW(n);
                const tilt = ((i * 53) % 5) - 2;
                const isPicked = selected?.id === n.id;
                const border = isPicked
                  ? "rgb(var(--primary-text-rgb) / 0.9)"
                  : "rgb(var(--primary-text-rgb) / 0.45)";
                return (
                  <g
                    key={n.id}
                    onClick={() => setSelected(n)}
                    className="cursor-pointer"
                    transform={`rotate(${tilt} ${n.x} ${n.y})`}
                  >
                    <g filter="url(#sketch)">
                      <rect
                        x={n.x - w / 2}
                        y={n.y - NODE_H / 2}
                        width={w}
                        height={NODE_H}
                        rx={9}
                        fill="var(--color-primary-bg)"
                        stroke={border}
                        strokeWidth={isPicked ? 2.2 : 1.5}
                      />
                      <rect
                        x={n.x - w / 2 + 3}
                        y={n.y - NODE_H / 2 + 3}
                        width={w - 6}
                        height={NODE_H - 6}
                        rx={7}
                        fill="none"
                        stroke={border}
                        strokeWidth={0.8}
                        opacity={0.45}
                      />
                      {n.kind === "client" && (
                        <rect
                          x={n.x - w / 2 - 4}
                          y={n.y - NODE_H / 2 - 4}
                          width={w + 8}
                          height={NODE_H + 8}
                          rx={11}
                          fill="none"
                          stroke="rgb(var(--primary-text-rgb) / 0.3)"
                          strokeWidth={1}
                          strokeDasharray="6 5"
                        />
                      )}
                    </g>
                    <text
                      x={n.x}
                      y={n.y - 2}
                      textAnchor="middle"
                      fontSize={16}
                      fontWeight={600}
                      fill="var(--color-primary-text)"
                      style={{ fontFamily: "var(--font-hand)" }}
                    >
                      {n.label}
                    </text>
                    <text
                      x={n.x}
                      y={n.y + 14}
                      textAnchor="middle"
                      fontSize={10}
                      fill="rgb(var(--primary-text-rgb) / 0.5)"
                      style={{ fontFamily: "var(--font-hand)" }}
                    >
                      {n.sub}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* sticky note — click a box to fill it */}
          <div className={`relative ${scrap} p-4 min-h-[140px] md:rotate-[0.6deg]`}>
            <div className="absolute -top-2.5 right-6 w-14 h-4 rotate-[4deg] rounded-[2px] bg-[rgb(var(--primary-text-rgb)/0.14)]" />
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="[font-family:var(--font-sketch)] text-2xl secondary-color-text leading-tight">
                    {selected.label}
                  </p>
                  <button
                    onClick={() => setSelected(null)}
                    className="secondary-color-text opacity-40 hover:opacity-100 text-sm"
                    aria-label="close"
                  >
                    {"\u2715"}
                  </button>
                </div>
                <p className="text-[11px] uppercase tracking-wider secondary-color-text opacity-40 mb-1">
                  {selected.kind} · {selected.sub}
                </p>
                <p className="secondary-color-text opacity-70 text-sm leading-relaxed">
                  {selected.blurb}
                </p>
              </>
            ) : (
              <p className="secondary-color-text opacity-50 text-sm [font-family:var(--font-hand)] leading-relaxed">
                {"click any box on the sketch\u2026I wrote a note about each one, the way I\u2019d explain it over coffee."}
              </p>
            )}
          </div>
        </div>

        {/* the story, in five lines */}
        <div className={`relative ${scrap} p-5 mt-4 md:-rotate-[0.3deg]`}>
          <p className="[font-family:var(--font-sketch)] text-2xl secondary-color-text mb-2">
            the whole idea, in five lines:
          </p>
          <ol className="space-y-1">
            {STEPS.map((s, i) => (
              <li
                key={i}
                className="[font-family:var(--font-hand)] secondary-color-text opacity-75 text-sm md:text-base leading-relaxed flex gap-2.5"
              >
                <span className="secondary-color-text opacity-50 shrink-0">
                  {"\u2460\u2461\u2462\u2463\u2464"[i]}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
