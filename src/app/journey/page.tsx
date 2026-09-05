"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { JOURNEY_SCENES } from "@/data/journey";
import "./journey.css";

const N_SCENES = JOURNEY_SCENES.length;
const PROGRESS_KEY = "worty-journey-progress";
const WALK_SPEED = 300; // px per second
const EDGE = 90; // px from the screen edge that triggers a scene change

export default function JourneyPage() {
  const restored = useRef(
    (() => {
      try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        if (!raw) return 0;
        const idx = JOURNEY_SCENES.findIndex((s) => s.id === JSON.parse(raw).scene);
        return idx >= 0 ? idx : 0;
      } catch {
        return 0;
      }
    })()
  );

  const [sceneIdx, setSceneIdx] = useState(restored.current);
  const [fade, setFade] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [facing, setFacing] = useState(1);
  const [moving, setMoving] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const touchDirRef = useRef(0);
  const transitioningRef = useRef(false);
  const movingRef = useRef(false);
  const facingRef = useRef(1);
  const sceneIdxRef = useRef(restored.current);
  const initedRef = useRef(false);

  const scene = JOURNEY_SCENES[sceneIdx];
  const lines = scene.lines;

  /* ------------------------------ scene switch ----------------------------- */
  const goScene = useCallback((nextRaw: number, enterFrom: "left" | "right" | "center") => {
    const next = ((nextRaw % N_SCENES) + N_SCENES) % N_SCENES;
    if (transitioningRef.current || next === sceneIdxRef.current) return;
    transitioningRef.current = true;
    movingRef.current = false;
    setMoving(false);
    setFade(true);
    window.setTimeout(() => {
      sceneIdxRef.current = next;
      setSceneIdx(next);
      setLineIdx(0);
      setPanelOpen(true);
      const w = stageRef.current?.clientWidth ?? 800;
      xRef.current =
        enterFrom === "left"
          ? EDGE + 60
          : enterFrom === "right"
            ? w - EDGE - 60
            : w / 2;
      setFade(false);
      window.setTimeout(() => {
        transitioningRef.current = false;
      }, 350);
    }, 420);
  }, []);

  /* ----------------------------- walk loop --------------------------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const stage = stageRef.current;

      if (stage && !transitioningRef.current) {
        if (!initedRef.current) {
          initedRef.current = true;
          xRef.current = stage.clientWidth / 2;
        }
        const k = keysRef.current;
        let dir = 0;
        if (k.a || k.arrowleft || touchDirRef.current < 0) dir -= 1;
        if (k.d || k.arrowright || touchDirRef.current > 0) dir += 1;

        if (dir !== 0) {
          xRef.current += dir * WALK_SPEED * dt;
          if (dir !== facingRef.current) {
            facingRef.current = dir;
            setFacing(dir);
          }
          if (!movingRef.current) {
            movingRef.current = true;
            setMoving(true);
            setHasMoved(true);
          }
        } else if (movingRef.current) {
          movingRef.current = false;
          setMoving(false);
        }

        const w = stage.clientWidth;
        if (xRef.current > w - EDGE) goScene(sceneIdxRef.current + 1, "left");
        else if (xRef.current < EDGE) goScene(sceneIdxRef.current - 1, "right");

        const px = Math.min(Math.max(xRef.current, 40), w - 40);
        if (charRef.current) {
          charRef.current.style.transform = `translateX(${px}px) scaleX(${facingRef.current})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goScene]);

  /* --------------------------- keyboard input ------------------------------ */
  const advance = useCallback(() => {
    if (transitioningRef.current) return;
    if (!panelOpen) {
      setLineIdx(0);
      setPanelOpen(true);
      return;
    }
    if (lineIdx < lines.length - 1) setLineIdx(lineIdx + 1);
    else setPanelOpen(false);
  }, [panelOpen, lineIdx, lines.length]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowleft", "arrowright", " "].includes(key)) e.preventDefault();
      keysRef.current[key] = true;
      if (key === "e" || key === "enter" || key === " ") advance();
      if (key === "escape") setPanelOpen(false);
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [advance]);

  /* ----------------------- title + progress memory ------------------------- */
  useEffect(() => {
    document.title = `${scene.name} · my story`;
    try {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ scene: scene.id, line: lineIdx })
      );
    } catch {
      /* private mode — fine */
    }
  }, [scene, lineIdx]);

  // greet the reader with the first line of the scene
  useEffect(() => {
    const t = window.setTimeout(() => setPanelOpen(true), 700);
    return () => window.clearTimeout(t);
  }, []);

  const jumpTo = (i: number) => {
    if (i === sceneIdxRef.current) return;
    goScene(i, "center");
  };

  return (
    <main
      ref={stageRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ touchAction: "none" }}
    >
      {/* scene background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{ backgroundImage: `url(${scene.image})`, opacity: fade ? 0 : 1 }}
      />
      {/* vignette + bottom gradient for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

      {/* character */}
      <div ref={charRef} className="jrny-char">
        <div style={{ transform: "scale(1.25)", transformOrigin: "bottom center" }}>
          <div className={`jrny-body ${moving ? "jrny-walking" : ""}`}>
            <div className="jrny-shadow" />
            <div className="jrny-leg jrny-leg-l" />
            <div className="jrny-leg jrny-leg-r" />
            <div className="jrny-torso">
              <div className="jrny-arm jrny-arm-l" />
              <div className="jrny-arm jrny-arm-r" />
            </div>
            <div className="jrny-head">
              <div className="jrny-hair" />
              <div className="jrny-eye jrny-eye-l" />
              <div className="jrny-eye jrny-eye-r" />
            </div>
          </div>
        </div>
      </div>

      {/* top bar: back home + scene title */}
      <div className="absolute top-5 left-5 flex flex-col gap-2">
        <Link
          href="/"
          className="w-fit rounded-full bg-black/45 px-4 py-1.5 text-sm text-white/85 backdrop-blur-md transition-colors hover:bg-black/65 hover:text-white"
        >
          ← back home
        </Link>
        <div className="flex items-baseline gap-3">
          <h1 className="font-heading text-2xl font-bold text-white drop-shadow-lg">
            {scene.name}
          </h1>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
            {scene.era}
          </span>
        </div>
      </div>

      {/* scene chips */}
      <div className="absolute top-5 right-5 flex gap-1.5 rounded-full bg-black/40 p-1.5 backdrop-blur-md">
        {JOURNEY_SCENES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => jumpTo(i)}
            title={s.name}
            aria-label={s.name}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              i === sceneIdx
                ? "scale-125 bg-white"
                : "bg-white/35 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* controls hint */}
      <p
        className={`absolute bottom-6 left-6 text-xs text-white/60 transition-opacity duration-700 hidden md:block ${
          hasMoved ? "opacity-0" : "opacity-100"
        }`}
      >
        ← → or A/D to walk · E to read
      </p>

      {/* mobile walk buttons */}
      <div className="md:hidden">
        <button
          aria-label="walk left"
          onPointerDown={() => (touchDirRef.current = -1)}
          onPointerUp={() => (touchDirRef.current = 0)}
          onPointerLeave={() => (touchDirRef.current = 0)}
          className="fixed bottom-28 left-5 z-10 h-14 w-14 rounded-full bg-black/45 text-xl text-white/85 backdrop-blur-md active:bg-black/70"
        >
          ◀
        </button>
        <button
          aria-label="walk right"
          onPointerDown={() => (touchDirRef.current = 1)}
          onPointerUp={() => (touchDirRef.current = 0)}
          onPointerLeave={() => (touchDirRef.current = 0)}
          className="fixed bottom-28 right-5 z-10 h-14 w-14 rounded-full bg-black/45 text-xl text-white/85 backdrop-blur-md active:bg-black/70"
        >
          ▶
        </button>
      </div>

      {/* story panel */}
      {panelOpen && (
        <div
          onClick={advance}
          className="absolute bottom-8 left-1/2 w-[min(92vw,640px)] -translate-x-1/2 cursor-pointer rounded-2xl border border-white/15 bg-black/55 px-6 py-5 shadow-2xl backdrop-blur-md transition-opacity duration-500"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              {scene.name} · {lineIdx + 1}/{lines.length}
            </p>
            <p className="text-[11px] text-white/40">
              {lineIdx < lines.length - 1 ? "E / click ▾" : "E / click to close"}
            </p>
          </div>
          <p
            key={`${scene.id}-${lineIdx}`}
            className="jrny-fadein text-[15px] leading-relaxed text-white/90"
          >
            {lines[lineIdx]}
          </p>
        </div>
      )}

    </main>
  );
}
