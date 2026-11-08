import type { JourneyWeather, SkyKey } from "@/data/journey";

/**
 * Time-of-day palettes. Every colour in the scenery reads from these through
 * CSS variables, so blending two palettes re-lights the whole world
 * (sky, mountains, buildings, character) — like a colour script in anime.
 */
export interface Palette {
  skyTop: string;
  skyMid: string;
  skyHor: string;
  sun: string;
  cloud: string;
  cloudSh: string;
  fog: string;
  far: string;
  midl: string;
  near: string;
  ground: string;
  rim: string;
  sunX: number;
  sunY: number;
  moonX: number;
  moonY: number;
  moon: number;
  stars: number;
  glow: number;
  rays: number;
  lights: number;
  cloudOp: number;
  fogOp: number;
  heroB: number;
}

const base = {
  moonX: 0.78,
  moonY: 0.18,
  moon: 0,
  stars: 0,
  glow: 0.4,
  rays: 0,
  lights: 0,
  cloudOp: 0.9,
  fogOp: 0.35,
  heroB: 1,
};

export const PALETTES: Record<SkyKey, Palette> = {
  predawn: {
    ...base,
    skyTop: "#0b1030", skyMid: "#2a2a5e", skyHor: "#7a5582", sun: "#ffd7a8",
    cloud: "#5a4f86", cloudSh: "#3a3466", fog: "#4b3f73",
    far: "#33356a", midl: "#262852", near: "#1b1d3e", ground: "#15172f", rim: "#a58fe0",
    sunX: 0.74, sunY: 1.1, moonX: 0.2, moonY: 0.2, moon: 0.7, stars: 0.85,
    glow: 0.25, lights: 0.7, cloudOp: 0.6, fogOp: 0.45, heroB: 0.62,
  },
  dawn: {
    ...base,
    skyTop: "#2b3a78", skyMid: "#c07c9c", skyHor: "#ffc48c", sun: "#fff0c8",
    cloud: "#ffd2b8", cloudSh: "#b57a98", fog: "#e9a8a2",
    far: "#8a76a6", midl: "#5f4f85", near: "#3d3264", ground: "#2c244a", rim: "#ffb88e",
    sunX: 0.74, sunY: 0.72, stars: 0.12, glow: 0.8, rays: 0.55, lights: 0.25, heroB: 0.85,
  },
  morning: {
    ...base,
    skyTop: "#3f86dc", skyMid: "#8cc6f2", skyHor: "#f6ebcf", sun: "#fffbe6",
    cloud: "#ffffff", cloudSh: "#b8cde6", fog: "#dcebf3",
    far: "#94b8d8", midl: "#6595b4", near: "#3f7190", ground: "#4d7a4c", rim: "#fff4cc",
    sunX: 0.8, sunY: 0.26, glow: 0.45, rays: 0.35, heroB: 1,
  },
  noon: {
    ...base,
    skyTop: "#2a78de", skyMid: "#76bcf6", skyHor: "#dcf1ff", sun: "#ffffff",
    cloud: "#ffffff", cloudSh: "#a9c6e8", fog: "#e2f2ff",
    far: "#9cc2e2", midl: "#6c9ec2", near: "#3f789a", ground: "#5a8a4b", rim: "#ffffff",
    sunX: 0.5, sunY: 0.1, glow: 0.3, rays: 0.2, heroB: 1.04,
  },
  afternoon: {
    ...base,
    skyTop: "#3a7cd2", skyMid: "#9ccaf0", skyHor: "#fde5ba", sun: "#fff8dc",
    cloud: "#fffaf0", cloudSh: "#c4c6e2", fog: "#f3e6cf",
    far: "#a2b4d0", midl: "#7290b0", near: "#4a6888", ground: "#5a7a4c", rim: "#fff0c0",
    sunX: 0.28, sunY: 0.3, glow: 0.5, rays: 0.4, heroB: 1,
  },
  golden: {
    ...base,
    skyTop: "#5a78c8", skyMid: "#f2aa7a", skyHor: "#ffd89c", sun: "#fff2c2",
    cloud: "#ffe0b0", cloudSh: "#d48a8a", fog: "#ffcf9e",
    far: "#c48e8e", midl: "#8e627c", near: "#5c3f60", ground: "#4a3450", rim: "#ffc47c",
    sunX: 0.7, sunY: 0.6, glow: 0.95, rays: 0.85, lights: 0.3, heroB: 0.95,
  },
  sunset: {
    ...base,
    skyTop: "#33398a", skyMid: "#e2706f", skyHor: "#ffb46c", sun: "#ffe2a0",
    cloud: "#ffb08a", cloudSh: "#8e4f7e", fog: "#e98a7c",
    far: "#9c6080", midl: "#6e4270", near: "#452a5a", ground: "#321f45", rim: "#ff9c6c",
    sunX: 0.62, sunY: 0.76, stars: 0.05, glow: 1, rays: 0.75, lights: 0.55, heroB: 0.86,
  },
  dusk: {
    ...base,
    skyTop: "#1a1f56", skyMid: "#5a3f88", skyHor: "#da7c8e", sun: "#ffb08a",
    cloud: "#8a6aa8", cloudSh: "#4a3a78", fog: "#7a5a92",
    far: "#4e3f76", midl: "#362b5e", near: "#231c44", ground: "#191434", rim: "#d08cd8",
    sunX: 0.6, sunY: 0.98, moonX: 0.22, moonY: 0.22, moon: 0.4, stars: 0.4,
    glow: 0.55, lights: 0.85, cloudOp: 0.7, fogOp: 0.4, heroB: 0.74,
  },
  night: {
    ...base,
    skyTop: "#04071a", skyMid: "#0f1a44", skyHor: "#2c3370", sun: "#ffb08a",
    cloud: "#2e3870", cloudSh: "#1a2150", fog: "#2a3068",
    far: "#1e2450", midl: "#151a3c", near: "#0e112c", ground: "#0b0d22", rim: "#7f92f0",
    sunX: 0.5, sunY: 1.3, moonX: 0.76, moonY: 0.17, moon: 1, stars: 1,
    glow: 0.18, lights: 1, cloudOp: 0.45, fogOp: 0.3, heroB: 0.66,
  },
  storm: {
    ...base,
    skyTop: "#151a26", skyMid: "#283044", skyHor: "#465068", sun: "#cccccc",
    cloud: "#3c4458", cloudSh: "#232a3a", fog: "#3a4256",
    far: "#343c50", midl: "#262d3e", near: "#1a2030", ground: "#131722", rim: "#93a8c8",
    sunX: 0.5, sunY: 1.3, stars: 0, glow: 0, lights: 0.85, cloudOp: 1, fogOp: 0.6, heroB: 0.6,
  },
  sunrise: {
    ...base,
    skyTop: "#3a58a8", skyMid: "#f0a0a2", skyHor: "#ffe2aa", sun: "#fff4d0",
    cloud: "#ffe6cf", cloudSh: "#c08aa8", fog: "#f6c3b6",
    far: "#a48ca8", midl: "#706392", near: "#473f6a", ground: "#3a3a5a", rim: "#ffd2a0",
    sunX: 0.3, sunY: 0.68, glow: 0.85, rays: 0.95, lights: 0.2, heroB: 0.92,
  },
};

/* ------------------------------------------------------------------ */
/* colour maths                                                         */
/* ------------------------------------------------------------------ */

type RGB = [number, number, number];
const hexCache = new Map<string, RGB>();
function hex(c: string): RGB {
  let v = hexCache.get(c);
  if (!v) {
    const n = parseInt(c.slice(1), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    hexCache.set(c, v);
  }
  return v;
}
function mixHex(a: string, b: string, t: number): string {
  const A = hex(a);
  const B = hex(b);
  const r = Math.round(A[0] + (B[0] - A[0]) * t);
  const g = Math.round(A[1] + (B[1] - A[1]) * t);
  const bl = Math.round(A[2] + (B[2] - A[2]) * t);
  return `rgb(${r} ${g} ${bl})`;
}

const COLOR_KEYS = [
  ["skyTop", "--sky-top"],
  ["skyMid", "--sky-mid"],
  ["skyHor", "--sky-hor"],
  ["sun", "--sun"],
  ["cloud", "--cloud"],
  ["cloudSh", "--cloud-sh"],
  ["fog", "--fog"],
  ["far", "--far"],
  ["midl", "--midl"],
  ["near", "--near"],
  ["ground", "--ground"],
  ["rim", "--rim"],
] as const;

const NUM_KEYS = [
  ["sunX", "--sun-x"],
  ["sunY", "--sun-y"],
  ["moonX", "--moon-x"],
  ["moonY", "--moon-y"],
  ["moon", "--moon"],
  ["stars", "--stars"],
  ["glow", "--glow"],
  ["rays", "--rays"],
  ["lights", "--lights"],
  ["cloudOp", "--cloud-op"],
  ["fogOp", "--fog-op"],
  ["heroB", "--hero-b"],
] as const;

/** Writes the blend of two palettes straight onto an element as CSS vars. */
export function applyPalette(el: HTMLElement, a: Palette, b: Palette, t: number) {
  const s = el.style;
  for (const [k, v] of COLOR_KEYS) s.setProperty(v, mixHex(a[k], b[k], t));
  for (const [k, v] of NUM_KEYS) s.setProperty(v, (a[k] + (b[k] - a[k]) * t).toFixed(4));
}

/* ------------------------------------------------------------------ */
/* weather                                                              */
/* ------------------------------------------------------------------ */

export interface WeatherState {
  petals: number;
  rain: number;
  motes: number;
  petalColor: string;
  moteColor: string;
}

export function toWeather(w?: JourneyWeather): WeatherState {
  return {
    petals: w?.petals ?? 0,
    rain: w?.rain ?? 0,
    motes: w?.motes ?? 0,
    petalColor: w?.petalColor ?? "#ff6b8a",
    moteColor: w?.moteColor ?? "#fff1c4",
  };
}

export function mixWeather(a: WeatherState, b: WeatherState, t: number): WeatherState {
  return {
    petals: a.petals + (b.petals - a.petals) * t,
    rain: a.rain + (b.rain - a.rain) * t,
    motes: a.motes + (b.motes - a.motes) * t,
    petalColor: t < 0.5 ? a.petalColor : b.petalColor,
    moteColor: t < 0.5 ? a.moteColor : b.moteColor,
  };
}
