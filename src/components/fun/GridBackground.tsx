"use client";

import { useEffect, useRef } from "react";

const SPACING = 44; // grid cell size in px
const DOT = 2; // base pixel size
const MOUSE_RADIUS = 170; // glow radius around the cursor (px)

type RGB = { r: number; g: number; b: number };

/**
 * Living pixel-field background: a grid of tiny squares that shimmers in slow
 * waves and glows around the cursor. Theme-aware (reads --primary-text-rgb),
 * static under prefers-reduced-motion. Replaces the flat blueprint grid.
 */
export function GridBackground() {
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
    const mouse = { x: -9999, y: -9999 };
    let text: RGB = { r: 221, g: 198, b: 182 };

    const readTheme = () => {
      const channels = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-text-rgb")
        .trim()
        .split(/\s+/)
        .map(Number);
      if (channels.length === 3 && channels.every((n) => !Number.isNaN(n))) {
        text = { r: channels[0], g: channels[1], b: channels[2] };
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // deterministic pseudo-random per cell — the base texture never flickers
    const jitter = (col: number, row: number) => {
      const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const cx = col * SPACING;
          const cy = row * SPACING;
          const base = 0.05 + jitter(col, row) * 0.05;

          // slow diagonal shimmer sweeping across the grid
          const wave = reduced
            ? 0
            : Math.max(0, Math.sin(time * 0.5 - (cx + cy) * 0.006));
          // glow around the cursor
          const dist = Math.hypot(cx - mouse.x, cy - mouse.y);
          const glow = reduced ? 0 : Math.max(0, 1 - dist / MOUSE_RADIUS);

          const alpha = base + wave * 0.05 + glow * 0.4;
          const size = DOT + glow * 2.5 + wave * 1.2;
          ctx.fillStyle = `rgba(${text.r}, ${text.g}, ${text.b}, ${alpha})`;
          ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        }
      }
    };

    const loop = (now: number) => {
      time += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      resize();
      if (reduced) {
        draw(performance.now()); // one static frame, no loop
      } else {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const onResize = () => start();
    const onMotionChange = () => {
      reduced = motion.matches;
      start();
    };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onBlur = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    readTheme();
    const themeObserver = new MutationObserver(() => {
      readTheme();
      if (reduced) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("blur", onBlur);
    motion.addEventListener("change", onMotionChange);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("blur", onBlur);
      motion.removeEventListener("change", onMotionChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
