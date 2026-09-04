"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const CELL_W = 64;
const CELL_H = 79;
const FRAME_COUNT = 103;
const MARGIN = 40; // side padding the mascot bounces between
const SPEED = 70; // px/s while his walk frames are on screen

/**
 * How fast each frame carries the character across the screen (px/s, 0 = planted).
 * Walk is steady, dash frames are fast, lunging attacks drift, idle/book/skill stay put.
 */
const moveSpeed = (f: number): number => {
  if (f >= 3 && f <= 4) return 50; // walk
  if (f >= 10 && f <= 19) return 20; // dash attacks
  if (f >= 20 && f <= 22) return 70; // flying kicks
  if (f >= 36 && f <= 52) return 30; // lunging punches/slashes
  if (f >= 56 && f <= 67) return 20; // kick combos / dashes
  if (f >= 68 && f <= 86) return 20; // sword lunges
  return 0; // idle, jumps, knockdowns, book draws, Skill Hunter
};

/**
 * Kuroro performs his entire sprite sheet in order (frame 0 → 102, then loops).
 * Sheet order: idle → walk → the full move list → Skill Hunter finale.
 * He only drifts across the screen while his walk frames (3–4) are showing.
 * Strip: public/sprites/kuroro.png — 103 uniform cells, bottom-aligned.
 */
export function SpriteMascot() {
  const pathname = usePathname();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: MARGIN + 40, dir: 1 as 1 | -1 });
  const [dir, setDir] = useState<1 | -1>(-1);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 639px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setHidden(small.matches);
      setReduced(motion.matches);
    };
    update();
    small.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      small.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (hidden || reduced) return;
    let raf = 0;
    let last = performance.now();
    let frame = 0;
    let acc = 0;

    // idle/stance frames breathe slower; the walk pair moves quickly
    const frameDuration = (f: number) => (f <= 2 ? 450 : f <= 4 ? 120 : 150);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      acc += dt * 1000;
      if (acc >= frameDuration(frame)) {
        acc = 0;
        frame = (frame + 1) % FRAME_COUNT;
        if (innerRef.current) {
          innerRef.current.style.backgroundPosition = `-${frame * CELL_W}px 0`;
        }
      }

      // moving actions carry him across the screen; walls flip his direction
      const speed = moveSpeed(frame);
      if (speed > 0) {
        const p = pos.current;
        p.x += p.dir * speed * dt;
        const max = window.innerWidth - MARGIN - CELL_W;
        let flipped = false;
        if (p.x >= max) {
          p.x = max;
          p.dir = -1;
          flipped = true;
        }
        if (p.x <= MARGIN) {
          p.x = MARGIN;
          p.dir = 1;
          flipped = true;
        }
        if (flipped) setDir(p.dir);
        if (outerRef.current) {
          // sprites face left natively — flip when moving right
          outerRef.current.style.transform = `translateX(${p.x}px) scaleX(${p.dir === -1 ? -1 : 1})`;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hidden, reduced]);

  if (pathname?.startsWith("/admin") || hidden) return null;

  return (
    <div
      ref={outerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: CELL_W,
        height: CELL_H,
        zIndex: 30,
        pointerEvents: "none",
        transform: `translateX(${pos.current.x}px) scaleX(${dir === -1 ? -1 : 1})`,
      }}
    >
      <div
        ref={innerRef}
        title="Kuroro"
        className="kuroro-frame"
        style={{
          width: CELL_W,
          height: CELL_H,
          backgroundImage: "url(/sprites/kuroro.png)",
          backgroundPosition: reduced ? "0 0" : undefined,
          cursor: "pointer",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
