"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/theme-context";
import { DEFAULT_PALETTE, type HallPalette } from "@/components/systems/PedestalScene";
import { EXHIBITS } from "@/data/exhibits";
import "./systems.css";

const PedestalScene = dynamic(() => import("@/components/systems/PedestalScene"), { ssr: false });

const AUTOPLAY_S = 11;

const parseTriplet = (v: string) =>
  v
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((n) => !isNaN(n));

const rgbStr = (c: number[]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const scale = (c: number[], f: number) => c.map((v) => Math.round(Math.min(255, Math.max(0, v * f))));
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const lum = (c: number[]) => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;

/** read the live theme variables and derive every color the hall uses */
function buildPalette(): HallPalette {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  const s = getComputedStyle(document.documentElement);
  const bg = parseTriplet(s.getPropertyValue("--primary-bg-rgb"));
  const tx = parseTriplet(s.getPropertyValue("--primary-text-rgb"));
  if (bg.length < 3 || tx.length < 3) return DEFAULT_PALETTE;
  return {
    isDark: lum(bg) < 0.5,
    bg: rgbStr(bg),
    floor: rgbStr(scale(bg, 0.8)),
    base: rgbStr(scale(bg, 0.55)),
    baseTop: rgbStr(scale(bg, 0.45)),
    glass: rgbStr(mix(tx, bg, 0.35)),
    neon: rgbStr(tx),
    soft: rgbStr(mix(tx, bg, 0.5)),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function SystemsPage() {
  const { isReversed } = useTheme();
  const [palette, setPalette] = useState<HallPalette>(DEFAULT_PALETTE);
  const [index, setIndex] = useState(0);
  // null until we know — the autoplay timer only mounts once motion is known to be allowed
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "the display hall · worty";
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    setPalette(buildPalette());
    // also catch the CSS transition end, so mid-transition reads don't stick
    const id = window.setTimeout(() => setPalette(buildPalette()), 500);
    return () => window.clearTimeout(id);
  }, [isReversed]);

  const go = useCallback((d: number) => setIndex((i) => (i + d + EXHIBITS.length) % EXHIBITS.length), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const ex = EXHIBITS[index];

  return (
    <main className="sys fixed inset-0 overflow-hidden select-none bg-[var(--color-primary-bg)]">
      <PedestalScene palette={palette} exhibit={ex.id} onHologramClick={() => go(1)} reducedMotion={!!reduced} />

      {/* vignette so the UI reads on top of the scene */}
      <div className="sys-vignette" aria-hidden />

      <Link href="/" className="sys-back mg-btn">
        ← back home
      </Link>

      <header className="sys-title">
        <span className="mg-kana">展示室</span>
        <h1>
          The Display <span className="mg-brush">Hall</span>
        </h1>
      </header>

      {/* exhibit plaque */}
      <section className="sys-plaque mg-panel mg-static" aria-live="polite">
        <div className="sys-plaque-top">
          <span className="mg-no">
            EXHIBIT {pad2(index + 1)} / {pad2(EXHIBITS.length)}
          </span>
          <div className="sys-dots" role="tablist" aria-label="Exhibits">
            {EXHIBITS.map((e, i) => (
              <button
                key={e.id}
                role="tab"
                aria-selected={i === index}
                aria-label={e.title}
                className={i === index ? "is-on" : ""}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>

        <div key={ex.id} className="sys-copy">
          <h2>{ex.title}</h2>
          <p>{ex.blurb}</p>
          <div className="sys-tags">
            {ex.tags.map((t) => (
              <span key={t} className="mg-caption">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="sys-controls">
          <button className="mg-btn" onClick={() => go(-1)} aria-label="Previous exhibit">
            ←
          </button>
          <button className="mg-btn mg-btn-ink" onClick={() => go(1)}>
            Next exhibit →
          </button>
        </div>

        {/* autoplay: the bar fills, then the next exhibit comes up (pauses on hover) */}
        {reduced === false && (
          <div className="sys-timer" aria-hidden>
            <div key={index} style={{ animationDuration: `${AUTOPLAY_S}s` }} onAnimationEnd={() => go(1)} />
          </div>
        )}
      </section>

      <p className="sys-hint">drag to orbit · scroll to zoom · click the hologram or use ← → to switch</p>
    </main>
  );
}
