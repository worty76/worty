"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  CREDITS,
  HERO_NAME,
  JOURNEY,
  JOURNEY_TAGLINE,
  JOURNEY_TITLE,
  lineFx,
  lineText,
  type JourneySetting,
} from "@/data/journey";
import { PALETTES, applyPalette, mixWeather, toWeather, type Palette, type WeatherState } from "./palettes";
import { CloudLayer, SceneDefs, STARS, TILE_H, TILE_W, WORLDS } from "./scenery";
import { HeroSVG, heroScale } from "./Hero";
import { OLD_SITE_URL } from "@/lib/site";
import { Weather } from "./particles";
import "./journey.css";

/* ------------------------------------------------------------------ */
/* timeline: 1 scroll unit (= 1 screen height) per beat                 */
/* ------------------------------------------------------------------ */

type Seg =
  | { kind: "intro" }
  | { kind: "title"; ch: number }
  | { kind: "line"; ch: number; li: number }
  | { kind: "outro" };

const TL = (() => {
  const segs: Seg[] = [{ kind: "intro" }];
  const ranges: { start: number; end: number }[] = [];
  JOURNEY.forEach((c, ch) => {
    const start = segs.length;
    segs.push({ kind: "title", ch });
    c.lines.forEach((_, li) => segs.push({ kind: "line", ch, li }));
    ranges.push({ start, end: segs.length });
  });
  const outroStart = segs.length;
  segs.push({ kind: "outro" }, { kind: "outro" });
  return { segs, ranges, outroStart, total: segs.length };
})();

const SETTINGS = Array.from(new Set(JOURNEY.map((c) => c.setting))) as JourneySetting[];
const KANJI = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const WORLD_PER_UNIT = 560; // tile px walked per scroll unit
const BLEND = 0.35; // half-width of the dissolve between chapters (units)
const pad2 = (n: number) => String(n).padStart(2, "0");

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/* time-of-day + weather keyframes along the scroll axis */
const PAL_KEYS: { u: number; v: Palette }[] = [];
const WX_KEYS: { u: number; v: WeatherState }[] = [];
const DEBT_KEYS: { u: number; v: number }[] = [];
JOURNEY.forEach((c, i) => {
  const r = TL.ranges[i];
  PAL_KEYS.push({ u: r.start, v: PALETTES[c.sky[0]] }, { u: r.end - 0.45, v: PALETTES[c.sky[1]] });
  const w = toWeather(c.weather);
  WX_KEYS.push({ u: r.start, v: w }, { u: r.end - 0.45, v: w });
  DEBT_KEYS.push({ u: r.start, v: c.debt[0] }, { u: r.end - 0.45, v: c.debt[1] });
});

function span<T>(keys: { u: number; v: T }[], u: number): [T, T, number] {
  if (u <= keys[0].u) return [keys[0].v, keys[0].v, 0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (u <= b.u) return [a.v, b.v, b.u === a.u ? 1 : smooth((u - a.u) / (b.u - a.u))];
  }
  const l = keys[keys.length - 1].v;
  return [l, l, 0];
}

/** green → amber → red as the technical debt piles up */
function debtColor(d: number) {
  const a = d < 0.5 ? [95, 227, 154] : [255, 190, 80];
  const b = d < 0.5 ? [255, 190, 80] : [255, 77, 77];
  const k = d < 0.5 ? d / 0.5 : (d - 0.5) / 0.5;
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(" ")})`;
}

function chapterWeights(u: number): number[] {
  const n = JOURNEY.length;
  const w = new Array<number>(n).fill(0);
  let c = TL.ranges.findIndex((r) => u < r.end);
  if (c < 0) c = n - 1;
  const r = TL.ranges[c];
  w[c] = 1;
  if (c > 0 && u < r.start + BLEND) {
    const k = smooth((u - (r.start - BLEND)) / (2 * BLEND));
    w[c] = k;
    w[c - 1] = 1 - k;
  } else if (c < n - 1 && u > r.end - BLEND) {
    const k = smooth((u - (r.end - BLEND)) / (2 * BLEND));
    w[c] = 1 - k;
    w[c + 1] = k;
  }
  return w;
}

/* ------------------------------------------------------------------ */

export default function JourneyPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const debtRef = useRef<HTMLElement>(null);
  const unitRef = useRef(800);
  const targetRef = useRef(0);

  const [seg, setSeg] = useState(0);
  const [ch, setCh] = useState(0);

  const segObj = TL.segs[seg];
  const chapter = JOURNEY[ch];
  const titleCh = segObj.kind === "title" ? segObj.ch : ch;
  const lineCh = segObj.kind === "line" ? segObj.ch : ch;
  const line = segObj.kind === "line" ? lineText(JOURNEY[segObj.ch].lines[segObj.li]) : "";

  /* ---------------------------- navigation ----------------------------- */
  const scrollToSeg = useCallback((k: number, behavior: ScrollBehavior = "smooth") => {
    const unit = unitRef.current;
    let u: number;
    if (k <= 0) u = 0;
    else if (k >= TL.total - 1) u = TL.total;
    else if (k === TL.outroStart) u = TL.outroStart + 0.6;
    else u = k + 0.5;
    window.scrollTo({ top: u * unit, behavior });
  }, []);

  const next = useCallback(() => {
    const cur = targetRef.current;
    scrollToSeg(Math.floor(cur - 0.5 + 0.02) + 1);
  }, [scrollToSeg]);
  const prev = useCallback(() => {
    const cur = targetRef.current;
    scrollToSeg(Math.ceil(cur - 0.5 - 0.02) - 1);
  }, [scrollToSeg]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "ArrowDown" || k === "ArrowRight" || k === " " || k === "Enter" || k === "PageDown") {
        e.preventDefault();
        next();
      } else if (k === "ArrowUp" || k === "ArrowLeft" || k === "PageUp") {
        e.preventDefault();
        prev();
      } else if (k === "End") {
        e.preventDefault();
        scrollToSeg(TL.total, "auto");
      } else if (k === "Home") {
        e.preventDefault();
        scrollToSeg(0, "auto");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, scrollToSeg]);

  /* ------------------------------ engine ------------------------------- */
  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!stage || !root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const weather = new Weather(canvas);

    const layers = Array.from(stage.querySelectorAll<HTMLElement>(".jr-layer")).map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth || "0"),
      setting: el.closest("[data-setting]")?.getAttribute("data-setting") as JourneySetting | null,
      last: NaN,
    }));
    const settingEls = SETTINGS.map((s) => ({
      s,
      els: Array.from(stage.querySelectorAll<HTMLElement>(`[data-setting="${s}"]`)),
    }));

    let stageW = 0;
    let stageH = 0;
    let tileW = 0;
    const resize = () => {
      stageW = stage.clientWidth;
      stageH = stage.clientHeight;
      tileW = (stageH * TILE_W) / TILE_H;
      unitRef.current = window.innerHeight;
      root.style.height = `${TL.total * unitRef.current + window.innerHeight}px`;
      stage.style.setProperty("--tile-w", `${tileW}px`);
      weather.resize(stageW, stageH);
      layers.forEach((l) => (l.last = NaN));
    };
    resize();
    window.addEventListener("resize", resize);

    let us = window.scrollY / unitRef.current;
    let last = performance.now();
    let curSeg = -1;
    let curCh = -1;
    let typed = -1;
    let typedSeg = -1;
    let walking = false;
    let running = false;
    let facing = 1;
    let flashT = 0;
    let rewindPx = 0;
    let lastDebt = -1;
    let raf = 0;

    const setVar = (k: string, v: number) => stage.style.setProperty(k, v.toFixed(3));

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // --- scroll → story position (smoothed for a cinematic glide) ---
      const target = Math.min(Math.max(window.scrollY / unitRef.current, 0), TL.total);
      targetRef.current = target;
      const prevU = us;
      us = reduced ? target : us + (target - us) * (1 - Math.exp(-dt * 6));
      if (Math.abs(target - us) < 0.0005) us = target;
      const vel = dt > 0 ? (us - prevU) / dt : 0;

      // --- lighting & weather ---
      const [pa, pb, pt] = span(PAL_KEYS, us);
      applyPalette(stage, pa, pb, pt);
      const [wa, wb, wt] = span(WX_KEYS, us);
      const wx = mixWeather(wa, wb, wt);

      // --- which worlds are visible ---
      const cw = chapterWeights(us);
      const sw: Record<string, number> = {};
      JOURNEY.forEach((c, i) => (sw[c.setting] = Math.max(sw[c.setting] ?? 0, cw[i])));
      settingEls.forEach(({ s, els }) => {
        const o = sw[s] ?? 0;
        els.forEach((el) => {
          el.style.opacity = o.toFixed(3);
          el.style.visibility = o > 0.002 ? "visible" : "hidden";
        });
      });
      setVar("--coast", sw.coast ?? 0);

      // --- story beat (needed early for the rewind effect) ---
      const si = Math.min(Math.floor(us), TL.total - 1);
      const t = us - si;
      const s = TL.segs[si];
      let rw = 0;
      if (s.kind === "line" && lineFx(JOURNEY[s.ch].lines[s.li]) === "rewind" && !reduced) {
        rw = clamp01((t - 0.06) / 0.1) * (1 - smooth((t - 0.62) / 0.18));
      }
      // rewinding pulls the world backwards; when it fails, reality snaps back
      if (rw > 0.01) rewindPx += dt * rw * 900;
      else rewindPx *= Math.exp(-dt * 7);
      if (rewindPx < 0.5) rewindPx = 0;

      // --- parallax ---
      const shift = (us * WORLD_PER_UNIT - rewindPx) * (tileW / TILE_W);
      for (const l of layers) {
        if (l.setting && (sw[l.setting] ?? 0) <= 0.002) continue;
        const x = (((shift * l.depth) % tileW) + tileW) % tileW;
        if (Math.abs(x - l.last) < 0.05) continue;
        l.last = x;
        l.el.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
      }

      // --- hero ---
      const hero = heroRef.current;
      if (hero) {
        const sp = Math.abs(vel);
        const w = sp > 0.04 || rw > 0.05;
        const run = sp > 1.6;
        if (w !== walking) hero.classList.toggle("is-walking", (walking = w));
        if (run !== running) hero.classList.toggle("is-running", (running = run));
        const f = vel < -0.04 ? -1 : vel > 0.04 ? 1 : facing;
        if (f !== facing) hero.classList.toggle("is-left", (facing = f) < 0);
      }

      // --- story beats ---
      if (si !== curSeg) setSeg((curSeg = si));
      let dom = 0;
      cw.forEach((v, i) => v > cw[dom] && (dom = i));
      if (dom !== curCh) setCh((curCh = dom));

      const intro = 1 - smooth(us / 0.7);
      let title = 0;
      let dlg = 0;
      if (s.kind === "title") title = Math.min(clamp01((t - 0.04) / 0.18), clamp01((0.96 - t) / 0.2));
      if (s.kind === "line") {
        dlg = 1;
        if (TL.segs[si - 1]?.kind !== "line") dlg = Math.min(dlg, clamp01((t - 0.03) / 0.12));
        if (TL.segs[si + 1]?.kind !== "line") dlg = Math.min(dlg, clamp01((0.97 - t) / 0.12));
        const text = lineText(JOURNEY[s.ch].lines[s.li]);
        const n = Math.round(text.length * clamp01((t - 0.04) / 0.42));
        if (n !== typed || si !== typedSeg) {
          typed = n;
          typedSeg = si;
          if (textRef.current) textRef.current.textContent = text.slice(0, n);
          stage.classList.toggle("is-typed", n >= text.length);
        }
      }
      const outro = clamp01((us - TL.outroStart) / 2);
      setVar("--intro", intro);
      setVar("--rw", rw);
      const [da, db, dk] = span(DEBT_KEYS, us);
      const debt = da + (db - da) * dk;
      const dp = Math.round(debt * 100);
      setVar("--debt", debt);
      if (dp !== lastDebt) {
        lastDebt = dp;
        stage.style.setProperty("--debt-c", debtColor(debt));
        if (debtRef.current) debtRef.current.textContent = `${dp}%`;
      }
      setVar("--title", title);
      setVar("--dlg", dlg);
      setVar("--lb", Math.max(intro, title, clamp01((us - TL.outroStart) / 0.4)));
      setVar("--speed", reduced ? 0 : clamp01((Math.abs(vel) - 2.4) / 4));
      setVar("--end", clamp01((outro - 0.7) / 0.14));
      setVar("--outro", clamp01(outro / 0.05));
      if (creditsRef.current) {
        const creditsH = creditsRef.current.offsetHeight;
        const k = clamp01((outro - 0.02) / 0.66);
        const y = stageH * 0.95 + (-creditsH - 40 - stageH * 0.95) * k;
        creditsRef.current.style.transform = `translate3d(-50%,${y.toFixed(1)}px,0)`;
      }
      if (progRef.current) progRef.current.style.transform = `scaleX(${(us / TL.total).toFixed(4)})`;

      // --- weather + lightning ---
      if (!reduced) {
        weather.step(dt, wx, vel * WORLD_PER_UNIT * (tileW / TILE_W));
        if (wx.rain > 0.6 && Math.random() < dt * 0.22) flashT = 1;
        if (flashRef.current) {
          flashT = Math.max(0, flashT - dt * 2.6);
          const fl = flashT > 0 ? flashT * (0.6 + 0.4 * Math.sin(flashT * 40)) : 0;
          flashRef.current.style.opacity = (fl * 0.55).toFixed(3);
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      weather.clear();
    };
  }, []);

  useEffect(() => {
    document.title = seg === 0 ? `${JOURNEY_TITLE} · worty` : `EP.${pad2(ch + 1)} ${chapter.title} · worty`;
  }, [ch, seg, chapter.title]);

  const accent = { "--acc": chapter.accent } as CSSProperties;

  return (
    <div ref={rootRef} className="jr-root" style={{ height: `${(TL.total + 1) * 100}vh` }}>
      <div ref={stageRef} className="jr-stage" style={accent}>
        <SceneDefs />

        {/* ---------------- sky ---------------- */}
        <div className="jr-sky" />
        {STARS}
        <div className="jr-shooting" />
        <div className="jr-moon" />
        <div className="jr-sunglow" />
        <div className="jr-rays" />
        <div className="jr-sun" />
        <CloudLayer />

        {/* ---------------- worlds (behind hero) ---------------- */}
        {SETTINGS.map((s) => (
          <div key={s} className="jr-world" data-setting={s}>
            {WORLDS[s].back}
          </div>
        ))}

        {/* ---------------- hero ---------------- */}
        <div ref={heroRef} className="jr-hero" style={{ "--hero-s": heroScale(chapter.outfit) } as CSSProperties}>
          <div className="jr-hero-flip">
            <div key={chapter.outfit} className="jr-hero-pop">
              <HeroSVG outfit={chapter.outfit} />
            </div>
          </div>
        </div>

        {/* ---------------- foreground ---------------- */}
        {SETTINGS.map((s) => (
          <div key={s} className="jr-world jr-world-front" data-setting={s}>
            {WORLDS[s].front}
          </div>
        ))}

        <canvas ref={canvasRef} className="jr-weather" aria-hidden />
        <div ref={flashRef} className="jr-flash" />
        <div className="jr-speed" />
        <div className="jr-rewind" aria-hidden>
          <span>◀◀ REWIND</span>
          <i />
        </div>
        <div className="jr-vignette" />
        <div className="jr-grain" />

        {/* ---------------- intro ---------------- */}
        <section className="jr-intro" aria-hidden={seg !== 0}>
          <p className="jr-intro-kana">これまでの道</p>
          <h1 className="jr-intro-title">
            <span>worty</span>
            {JOURNEY_TITLE}
          </h1>
          <p className="jr-intro-tag">{JOURNEY_TAGLINE}</p>
          <button className="jr-intro-start" onClick={() => scrollToSeg(1)}>
            <span className="jr-mouse" aria-hidden />
            scroll to begin
          </button>
        </section>

        {/* ---------------- episode title card ---------------- */}
        <section className="jr-title" style={{ "--acc": JOURNEY[titleCh].accent } as CSSProperties} aria-hidden={segObj.kind !== "title"}>
          <div className="jr-title-kanji">第{KANJI[titleCh]}話</div>
          <p className="jr-title-ep">
            Episode {pad2(titleCh + 1)} <span>·</span> {JOURNEY[titleCh].era}
          </p>
          <h2 className="jr-title-h">{JOURNEY[titleCh].title}</h2>
          <div className="jr-title-brush" />
        </section>

        {/* ---------------- dialogue ---------------- */}
        <div
          className="jr-dlg"
          style={{ "--acc": JOURNEY[lineCh].accent } as CSSProperties}
          onClick={next}
          role="button"
          tabIndex={-1}
          aria-hidden={segObj.kind !== "line"}
        >
          <div className="jr-dlg-name">{HERO_NAME}</div>
          <p className="jr-dlg-text">
            <span ref={textRef} />
            <i className="jr-dlg-caret" aria-hidden>
              ▼
            </i>
          </p>
          <p className="jr-sr" aria-live="polite">
            {line}
          </p>
        </div>

        {/* ---------------- credits + ending ---------------- */}
        <div ref={creditsRef} className="jr-credits" aria-hidden={segObj.kind !== "outro"}>
          <p className="jr-credits-head">{JOURNEY_TITLE}</p>
          {CREDITS.map((c) => (
            <div key={c.role} className="jr-credit">
              <span>{c.role}</span>
              <strong>{c.name}</strong>
            </div>
          ))}
        </div>
        <section className="jr-end" aria-hidden={segObj.kind !== "outro"}>
          <p className="jr-end-kana">つづく</p>
          <h2 className="jr-end-h">To be continued…</h2>
          <div className="jr-end-links">
            <Link href="/">back home</Link>
            <Link href="/projects">see my projects</Link>
            <Link href="/timeline">milestones</Link>
            <button onClick={() => scrollToSeg(0, "auto")}>watch again ↺</button>
          </div>
          <a className="jr-end-old" href={OLD_SITE_URL} target="_blank" rel="noopener noreferrer">
            see where this site started (v1) ↗
          </a>
        </section>

        <div className="jr-lb jr-lb-top" />
        <div className="jr-lb jr-lb-bot" />

        {/* ---------------- HUD ---------------- */}
        <div className="jr-progress">
          <div ref={progRef} />
        </div>
        <div className="jr-hud-tl">
          <Link href="/" className="jr-back">
            ← home
          </Link>
          <div className="jr-era">
            <b>EP.{pad2(ch + 1)}</b>
            {chapter.era}
          </div>
          <div className="jr-debt" title="technical debt">
            <span>tech debt</span>
            <div className="jr-debt-bar">
              <i />
            </div>
            <b ref={debtRef}>5%</b>
          </div>
        </div>
        <nav className="jr-rail" aria-label="Episodes">
          {JOURNEY.map((c, i) => (
            <button
              key={c.id}
              className={i === ch && seg > 0 ? "is-on" : ""}
              onClick={() => scrollToSeg(TL.ranges[i].start, "auto")}
              style={{ "--acc": c.accent } as CSSProperties}
            >
              <span>{c.title}</span>
              <i>{pad2(i + 1)}</i>
            </button>
          ))}
          <button className="jr-rail-skip" onClick={() => scrollToSeg(TL.total, "auto")}>
            <span>skip to the end</span>
            <i>⏭</i>
          </button>
        </nav>
        <p className="jr-hint">scroll · ↓ / space to continue</p>
      </div>
    </div>
  );
}
