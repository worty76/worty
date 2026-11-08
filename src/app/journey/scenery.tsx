/**
 * Hand-drawn (procedural) SVG worlds for /journey.
 *
 * Every world is split into parallax layers. Each layer is one 1600×900 tile
 * that is seamless horizontally (shapes are generated with whole-period sine
 * waves or kept inside the tile), rendered 3× side by side and slid by the page
 * engine. All colours come from CSS variables (see palettes.ts + journey.css),
 * so the time of day re-lights everything at once.
 *
 * Shapes of the same colour are merged into a single <path> to keep the DOM
 * small — the whole page is only a few hundred SVG nodes.
 */
import type { ReactNode } from "react";
import type { JourneySetting } from "@/data/journey";

export const TILE_W = 1600;
export const TILE_H = 900;
export const GROUND_Y = 780; // feet line, shared by every world

const W = TILE_W;
const H = TILE_H;
const G = GROUND_Y;
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ */
/* tiny geometry kit                                                    */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** rectangle sub-path (clockwise) */
const R = (x: number, y: number, w: number, h: number) =>
  `M${n1(x)},${n1(y)}h${n1(w)}v${n1(h)}h${n1(-w)}Z`;

/** (rotated) ellipse sub-path, clockwise so merged shapes union cleanly */
const E = (cx: number, cy: number, rx: number, ry: number, deg = 0) => {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t) * rx;
  const s = Math.sin(t) * rx;
  const a = `${n1(rx)},${n1(ry)} ${n1(deg)} 1 1`;
  return `M${n1(cx - c)},${n1(cy - s)}A${a} ${n1(cx + c)},${n1(cy + s)}A${a} ${n1(cx - c)},${n1(cy - s)}Z`;
};

/** seamless wavy horizon: whole-period sines so y(0) === y(W) */
function ridge(seed: number, base: number, amp: number, ks: number[], step = 16) {
  const r = rng(seed);
  const ph = ks.map(() => r() * TAU);
  const pts: string[] = [];
  for (let x = 0; x <= W; x += step) {
    let y = base;
    ks.forEach((k, i) => {
      y -= (amp / (i + 1)) * Math.sin((TAU * k * x) / W + ph[i]);
    });
    pts.push(`${x},${n1(y)}`);
  }
  const line = "M" + pts.join("L");
  return { line, fill: `${line}L${W},${H}L0,${H}Z` };
}

/** filled leaf / frond from a → b with a given belly width */
function leaf(ax: number, ay: number, bx: number, by: number, w: number, droop = 0) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2 + droop;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * w;
  const py = (dx / len) * w;
  return `M${n1(ax)},${n1(ay)}Q${n1(mx + px)},${n1(my + py)} ${n1(bx)},${n1(by)}Q${n1(mx - px)},${n1(my - py)} ${n1(ax)},${n1(ay)}Z`;
}

function palm(x: number, base: number, h: number, lean: number, seed: number) {
  const r = rng(seed);
  const tx = x + lean;
  const ty = base - h;
  const trunk = `M${x - 7},${base}Q${x + lean * 0.15},${base - h * 0.55} ${tx - 3},${ty}L${tx + 3},${ty}Q${x + lean * 0.15 + 12},${base - h * 0.55} ${x + 7},${base}Z`;
  let fronds = "";
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI + (i / 8) * Math.PI + (r() - 0.5) * 0.25;
    const L = 70 + r() * 45;
    const ex = tx + Math.cos(a) * L;
    const ey = ty + Math.sin(a) * L * 0.55 + 30 + r() * 20;
    fronds += leaf(tx, ty, ex, ey, 11, -18);
  }
  fronds += E(tx, ty + 4, 9, 7);
  return { trunk, fronds };
}

function grass(seed: number, xs: number[], baseY: number, maxH: number, spread = 70) {
  const r = rng(seed);
  let d = "";
  xs.forEach((x0) => {
    const blades = 9 + Math.floor(r() * 6);
    for (let i = 0; i < blades; i++) {
      const x = x0 + (r() - 0.5) * spread;
      const h = maxH * (0.45 + r() * 0.55);
      const lean = (r() - 0.5) * h * 0.7;
      const w = 4 + r() * 5;
      d += `M${n1(x)},${baseY}Q${n1(x + lean * 0.3)},${n1(baseY - h * 0.6)} ${n1(x + lean)},${n1(baseY - h)}Q${n1(x + w + lean * 0.3)},${n1(baseY - h * 0.5)} ${n1(x + w)},${baseY}Z`;
    }
  });
  return d;
}

/** tufts sitting on the ground line */
function tufts(seed: number, count: number, y: number, h = 14) {
  const r = rng(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = 20 + r() * (W - 40);
    for (let b = 0; b < 4; b++) {
      const bx = x + b * 4 - 6;
      const bh = h * (0.5 + r() * 0.6);
      const lean = (r() - 0.5) * 10;
      d += `M${n1(bx)},${y}L${n1(bx + lean)},${n1(y - bh)}L${n1(bx + 3)},${y}Z`;
    }
  }
  return d;
}

/** buildings laid edge to edge across the tile (seamless by construction) */
function skyline(
  seed: number,
  base: number,
  minH: number,
  maxH: number,
  minW: number,
  maxW: number,
  winEvery: number,
  litChance: number
) {
  const r = rng(seed);
  let body = "";
  let lit = "";
  let x = 0;
  const tops: { x: number; w: number; top: number }[] = [];
  while (x < W) {
    let w = minW + r() * (maxW - minW);
    if (W - x - w < minW) w = W - x;
    const h = minH + r() * (maxH - minH);
    const top = base - h;
    body += R(x, top, w + 0.6, h + 200);
    if (r() < 0.35) body += R(x + w * 0.3, top - 14, w * 0.4, 16);
    if (r() < 0.25) body += R(x + w * 0.5, top - 40, 2, 40);
    tops.push({ x, w, top });
    if (winEvery > 0) {
      for (let wy = top + 10; wy < base - 8; wy += winEvery) {
        for (let wx = x + 6; wx < x + w - 8; wx += winEvery * 0.8) {
          if (r() < litChance) lit += R(wx, wy, winEvery * 0.35, winEvery * 0.45);
        }
      }
    }
    x += w;
  }
  return { body, lit, tops };
}

function cloud(cx: number, cy: number, s: number) {
  const blobs: [number, number, number][] = [
    [-70, 6, 34],
    [-34, -16, 46],
    [8, -30, 54],
    [52, -12, 44],
    [86, 8, 30],
    [0, 8, 44],
    [-40, 12, 34],
    [44, 12, 36],
  ];
  let shade = "";
  let lit = "";
  blobs.forEach(([x, y, r]) => {
    shade += E(cx + x * s, cy + y * s, r * s, r * s);
    lit += E(cx + (x - 5) * s, cy + (y - 9) * s, r * s * 0.9, r * s * 0.9);
  });
  const bottom = E(cx + 4 * s, cy + 34 * s, 88 * s, 14 * s);
  return { shade, lit, bottom };
}

/* ------------------------------------------------------------------ */
/* layer wrapper                                                        */
/* ------------------------------------------------------------------ */

function Layer({ depth, children }: { depth: number; children: ReactNode }) {
  return (
    <div className="jr-layer" data-depth={depth}>
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          className="jr-tile"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          overflow="visible"
          aria-hidden
        >
          {children}
        </svg>
      ))}
    </div>
  );
}

const Haze = () => <div className="jr-haze" aria-hidden />;

/* ------------------------------------------------------------------ */
/* shared sky layers                                                    */
/* ------------------------------------------------------------------ */

const CLOUDS = (() => {
  const list = [
    cloud(180, 170, 1.15),
    cloud(620, 300, 0.7),
    cloud(980, 130, 1.4),
    cloud(1380, 260, 0.85),
  ];
  let wisps = "";
  const r = rng(77);
  for (let i = 0; i < 9; i++) wisps += E(80 + r() * 1440, 360 + r() * 140, 90 + r() * 110, 3 + r() * 3);
  return (
    <g className="jr-clouds">
      <path className="f-cloud-sh" d={list.map((c) => c.shade + c.bottom).join("")} />
      <path className="f-cloud" d={list.map((c) => c.lit).join("")} />
      <path className="f-cloud" opacity={0.5} d={wisps} />
    </g>
  );
})();

export function CloudLayer() {
  return (
    <div className="jr-cloudwrap">
      <Layer depth={0.035}>{CLOUDS}</Layer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vietnam kit: shophouses + signboards, power lines, lanterns,          */
/* quang gánh vendor, buffalo, nón lá farmer, cổng làng, the flag,       */
/* Saigon landmarks                                                     */
/* ------------------------------------------------------------------ */

interface Sign {
  x: number;
  y: number;
  w: number;
  h: number;
  c: number;
  text: string;
}

/** narrow tube houses (nhà ống) laid edge to edge, each with a shop + signboard */
function shophouses(seed: number, minH: number, maxH: number, signText: string[], awnings: boolean, litP: number) {
  const r = rng(seed);
  const bodies: string[] = ["", "", "", ""];
  const awn: string[] = ["", "", ""];
  let balc = "";
  let win = "";
  let lit = "";
  let tanks = "";
  let shop = "";
  let shopLit = "";
  const signs: Sign[] = [];
  let x = 0;
  let i = 0;
  while (x < W) {
    let w = 76 + r() * 50;
    if (W - x - w < 76) w = W - x;
    const h = minH + r() * (maxH - minH);
    const t = G - 10 - h;
    bodies[Math.floor(r() * 4)] += R(x, t, w + 0.6, h + 12);
    for (let fy = t + 18; fy < G - 150; fy += 58) {
      balc += R(x + 5, fy + 40, w - 10, 6);
      win += R(x + 12, fy, w * 0.3, 30) + R(x + w * 0.55, fy, w * 0.3, 30);
      if (r() < litP) lit += R(x + 12, fy, w * 0.3, 30);
      if (r() < litP) lit += R(x + w * 0.55, fy, w * 0.3, 30);
    }
    if (r() < 0.55) tanks += R(x + w * 0.2, t - 22, 30, 22) + E(x + w * 0.2 + 15, t - 22, 15, 5);
    shop += R(x + 8, G - 74, w - 16, 64);
    if (r() < 0.8) shopLit += R(x + 13, G - 68, w - 26, 52);
    if (awnings) awn[i % 3] += `M${n1(x + 3)},${G - 84}L${n1(x + w - 3)},${G - 84}L${n1(x + w + 4)},${G - 64}L${n1(x - 4)},${G - 64}Z`;
    signs.push({ x: x + 8, y: G - 118, w: w - 16, h: 28, c: Math.floor(r() * 4), text: signText[i % signText.length] });
    x += w;
    i++;
  }
  return { bodies, awn, balc, win, lit, tanks, shop, shopLit, signs };
}

/** painted Vietnamese shop signs; at night they glow */
function SignBoards({ signs }: { signs: Sign[] }) {
  const d = ["", "", "", ""];
  signs.forEach((s) => (d[s.c] += R(s.x, s.y, s.w, s.h)));
  return (
    <g>
      {d.map((dd, i) => (
        <path key={`g${i}`} className={`f-vn${i + 1} jr-glow`} d={dd} filter="url(#jr-blur)" />
      ))}
      {d.map((dd, i) => (
        <path key={i} className={`f-vn${i + 1}`} d={dd} />
      ))}
      {signs.map((s, i) => {
        const est = s.text.length * 9.4;
        return (
          <text
            key={`t${i}`}
            x={s.x + s.w / 2}
            y={s.y + s.h / 2 + 5.5}
            className={`t-sign t-vn${s.c + 1}`}
            textLength={est > s.w - 12 ? s.w - 12 : undefined}
            lengthAdjust="spacingAndGlyphs"
          >
            {s.text}
          </text>
        );
      })}
    </g>
  );
}

/** wire spans between poles, plus the wrap-around spans into the next tile */
function spansOf(poles: number[]): [number, number][] {
  const s: [number, number][] = [[poles[poles.length - 1] - W, poles[0]]];
  for (let i = 0; i < poles.length - 1; i++) s.push([poles[i], poles[i + 1]]);
  s.push([poles[poles.length - 1], poles[0] + W]);
  return s;
}

function powerLines(poles: number[], heights: number[], tangles = true) {
  let pole = "";
  poles.forEach((p) => {
    pole += R(p - 5, 300, 10, G - 300) + R(p - 44, 330, 88, 6) + R(p - 32, 372, 64, 5) + R(p - 9, 470, 18, 26);
  });
  let wires = "";
  spansOf(poles).forEach(([a, b]) => {
    heights.forEach((y, i) => {
      wires += `M${a},${y}Q${(a + b) / 2},${y + 30 + i * 9} ${b},${y}`;
    });
  });
  if (tangles) {
    poles.forEach((p) => {
      for (let i = 0; i < 4; i++) wires += E(p + (i % 2 ? 14 : -12), 462 + i * 9, 15 - i * 2, 6);
    });
  }
  return { pole, wires };
}

/** strings of red / yellow lanterns (đèn lồng) hung between poles */
function lanternStrings(poles: number[], y0: number, sag: number) {
  let wire = "";
  let red = "";
  let yellow = "";
  let caps = "";
  let k = 0;
  spansOf(poles).forEach(([a, b]) => {
    const cx = (a + b) / 2;
    const cy = y0 + sag * 2;
    wire += `M${a},${y0}Q${cx},${cy} ${b},${y0}`;
    const n = Math.max(3, Math.round((b - a) / 52));
    for (let j = 1; j < n; j++) {
      const t = j / n;
      const x = (1 - t) * (1 - t) * a + 2 * (1 - t) * t * cx + t * t * b;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y0;
      const L = E(x, y + 18, 9, 11);
      if (k++ % 2) yellow += L;
      else red += L;
      caps += R(x - 0.6, y, 1.2, 8) + R(x - 5, y + 6, 10, 3) + R(x - 5, y + 28, 10, 3) + R(x - 0.6, y + 30, 1.2, 8);
    }
  });
  return { wire, red, yellow, caps };
}

/** street vendor with nón lá and quang gánh (shoulder pole + two baskets) */
function vendor(x: number) {
  const y = G;
  return {
    hat: `M${x - 28},${y - 124}L${x + 2},${y - 152}L${x + 32},${y - 124}Q${x + 2},${y - 117} ${x - 28},${y - 124}Z`,
    shirt: `M${x - 12},${y - 122}L${x + 15},${y - 122}L${x + 19},${y - 62}L${x - 15},${y - 62}Z`,
    dark:
      R(x - 13, y - 64, 11, 62) +
      R(x + 4, y - 64, 11, 62) +
      E(x + 4, y - 126, 8, 7) +
      `M${x - 76},${y - 113}Q${x},${y - 126} ${x + 80},${y - 113}L${x + 80},${y - 109}Q${x},${y - 122} ${x - 76},${y - 109}Z`,
    strings: `M${x - 70},${y - 112}L${x - 88},${y - 46}M${x - 70},${y - 112}L${x - 52},${y - 46}M${x + 74},${y - 112}L${x + 56},${y - 46}M${x + 74},${y - 112}L${x + 92},${y - 46}`,
    baskets:
      `M${x - 92},${y - 46}L${x - 48},${y - 46}Q${x - 52},${y - 14} ${x - 70},${y - 12}Q${x - 88},${y - 14} ${x - 92},${y - 46}Z` +
      `M${x + 52},${y - 46}L${x + 96},${y - 46}Q${x + 92},${y - 14} ${x + 74},${y - 12}Q${x + 56},${y - 14} ${x + 52},${y - 46}Z`,
    goods: E(x - 70, y - 48, 21, 7) + E(x + 74, y - 48, 21, 7) + E(x - 78, y - 54, 7, 6) + E(x - 64, y - 55, 7, 6) + E(x + 68, y - 55, 7, 6) + E(x + 82, y - 54, 7, 6),
  };
}

/** water buffalo (con trâu), facing right, with an egret on its back */
function buffalo(cx: number, cy: number) {
  return {
    body:
      E(cx, cy, 58, 30) +
      `M${cx + 36},${cy - 22}Q${cx + 62},${cy - 28} ${cx + 72},${cy - 6}L${cx + 56},${cy + 12}Z` +
      E(cx + 74, cy + 2, 18, 13, 32) +
      R(cx - 46, cy + 14, 12, 32) +
      R(cx - 28, cy + 16, 12, 30) +
      R(cx + 20, cy + 16, 12, 30) +
      R(cx + 38, cy + 14, 12, 32),
    horns:
      `M${cx + 64},${cy - 10}Q${cx + 46},${cy - 36} ${cx + 22},${cy - 30}Q${cx + 44},${cy - 30} ${cx + 58},${cy - 4}Z` +
      `M${cx + 76},${cy - 10}Q${cx + 96},${cy - 34} ${cx + 74},${cy - 44}Q${cx + 88},${cy - 30} ${cx + 70},${cy - 6}Z`,
    tail: `M${cx - 56},${cy - 8}Q${cx - 72},${cy + 8} ${cx - 64},${cy + 32}`,
    egret: E(cx - 14, cy - 36, 11, 6, -10) + `M${cx - 6},${cy - 40}Q${cx},${cy - 54} ${cx + 6},${cy - 52}L${cx + 14},${cy - 50}L${cx + 5},${cy - 48}Q${cx + 1},${cy - 46} ${cx - 2},${cy - 38}Z`,
  };
}

/** rice farmer in nón lá, bent over planting */
function farmer(x: number, y: number) {
  return {
    hat: `M${x - 30},${y - 58}L${x - 6},${y - 82}L${x + 18},${y - 58}Q${x - 6},${y - 52} ${x - 30},${y - 58}Z`,
    limbs: `M${x + 12},${y - 22}L${x - 8},${y - 52}M${x - 6},${y - 48}L${x - 16},${y - 8}M${x - 4},${y - 46}L${x + 2},${y - 10}M${x + 12},${y - 22}L${x + 4},${y}M${x + 12},${y - 22}L${x + 20},${y}`,
  };
}

/** traditional village gate (cổng làng) */
function villageGate(x: number) {
  const base = 690;
  return {
    wall: R(x - 72, 600, 22, base - 600) + R(x + 50, 600, 22, base - 600) + R(x - 50, 600, 100, 26) + R(x - 20, 572, 40, 30),
    roof:
      `M${x - 98},${604}Q${x - 86},${600} ${x - 80},${590}L${x + 80},${590}Q${x + 86},${600} ${x + 98},${604}L${x + 84},${602}L${x + 64},${598}L${x - 64},${598}L${x - 84},${602}Z` +
      `M${x - 46},${578}Q${x - 38},${574} ${x - 34},${566}L${x + 34},${566}Q${x + 38},${574} ${x + 46},${578}L${x + 36},${576}L${x - 36},${576}Z`,
    plaque: R(x - 30, 606, 60, 14),
  };
}

function star(cx: number, cy: number, r: number) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.4 : r;
    d += `${i ? "L" : "M"}${n1(cx + Math.cos(a) * rr)},${n1(cy + Math.sin(a) * rr)}`;
  }
  return d + "Z";
}

/** Saigon skyline icons: a Landmark-81-like tower and a Bitexco-like tower */
function landmark81(x: number, base: number, top: number) {
  const h = base - top;
  const y = (k: number) => n1(top + h * k);
  return `M${x},${base}L${x},${y(0.3)}L${x + 8},${y(0.22)}L${x + 15},${y(0.15)}L${x + 23},${y(0.1)}L${x + 30},${y(0.05)}L${x + 34},${top}L${x + 38},${y(0.05)}L${x + 45},${y(0.1)}L${x + 53},${y(0.15)}L${x + 60},${y(0.22)}L${x + 68},${y(0.3)}L${x + 68},${base}Z`;
}
function bitexco(x: number, base: number, top: number) {
  const h = base - top;
  return {
    body: `M${x},${base}L${x + 4},${n1(top + h * 0.35)}Q${x + 18},${n1(top + h * 0.05)} ${x + 30},${top}Q${x + 44},${n1(top + h * 0.05)} ${x + 56},${n1(top + h * 0.35)}L${x + 60},${base}Z`,
    pad: E(x + 50, top + h * 0.26, 26, 5),
  };
}

const TOWN_SIGNS = ["INTERNET", "GAME NET", "TẠP HÓA", "PHỞ", "CÀ PHÊ", "SỬA XE", "BÁNH MÌ", "TRÀ ĐÁ", "NHÀ THUỐC", "SIM THẺ", "HỚT TÓC", "CƠM"];
const CITY_SIGNS = ["CƠM TẤM", "BÚN BÒ", "TRÀ SỮA", "HỦ TIẾU", "CÀ PHÊ", "BÁNH MÌ", "KARAOKE", "PHỞ 24", "BIA HƠI", "ỐC", "LẨU", "XÔI"];

function stools(xs: number[]) {
  let red = "";
  let blue = "";
  let table = "";
  xs.forEach((x, i) => {
    table += R(x - 22, G - 30, 44, 5) + R(x - 18, G - 26, 4, 26) + R(x + 14, G - 26, 4, 26);
    [-34, 34].forEach((dx, j) => {
      const s = `M${x + dx - 10},${G}L${x + dx - 8},${G - 16}L${x + dx + 8},${G - 16}L${x + dx + 10},${G}Z` + R(x + dx - 10, G - 19, 20, 4);
      if ((i + j) % 2) blue += s;
      else red += s;
    });
  });
  return { red, blue, table };
}

/* ------------------------------------------------------------------ */
/* worlds                                                               */
/* ------------------------------------------------------------------ */

interface World {
  back: ReactNode;
  front: ReactNode;
}

/* ---------- hometown: mountains, bamboo, rice terraces ---------- */
const hometown: World = (() => {
  const m1 = ridge(11, 455, 80, [2, 3, 5, 13]);
  const m2 = ridge(12, 560, 46, [3, 4, 7, 17]);
  const hills = ridge(13, 662, 22, [2, 5, 9]);

  const r = rng(5);
  let stalks = "";
  let leaves = "";
  [
    [110, 210],
    [470, 170],
    [820, 230],
    [1460, 200],
  ].forEach(([x, h]) => {
    for (let i = 0; i < 8; i++) {
      const x0 = x + (r() - 0.5) * 60;
      const hh = h * (0.65 + r() * 0.35);
      const lean = (r() - 0.5) * 90;
      const x1 = x0 + lean;
      const y1 = 690 - hh;
      stalks += `M${n1(x0)},690Q${n1(x0 + lean * 0.15)},${n1(690 - hh * 0.5)} ${n1(x1)},${n1(y1)}`;
      for (let j = 0; j < 10; j++) {
        const t = 0.4 + (j / 10) * 0.6;
        const px = x0 + (x1 - x0) * t * t;
        const py = 690 - hh * t;
        leaves += E(px + (r() - 0.5) * 34, py + (r() - 0.5) * 16, 15 + r() * 10, 3.5 + r() * 2, (r() - 0.5) * 80);
      }
    }
  });

  // little house with tiled roof
  const hx = 1110;
  const house = {
    wall: R(hx - 62, 630, 124, 62),
    roof: `M${hx - 82},636L${hx - 44},594L${hx + 44},594L${hx + 82},636Z`,
    dark: R(hx - 12, 652, 24, 40) + R(hx - 82, 634, 164, 5),
    win: R(hx - 48, 646, 22, 18) + R(hx + 26, 646, 22, 18),
    smoke: `M${hx + 30},592c-10,-18 14,-26 4,-44c-8,-14 10,-22 6,-36`,
  };

  // terraces
  const wave = (base: number, amp: number, k: number, ph: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= W; x += 20) pts.push(`${x},${n1(base + amp * Math.sin((TAU * k * x) / W + ph))}`);
    return "M" + pts.join("L");
  };
  const b1 = wave(700, 5, 2, 0.4);
  const w1 = wave(708, 4, 2, 0.4);
  const b2 = wave(738, 4, 3, 1.2);
  const w2 = wave(745, 3, 3, 1.2);
  const close = `L${W},${H}L0,${H}Z`;
  let seedlings = "";
  for (let x = 30; x < W - 30; x += 46 + r() * 70) {
    const y = r() < 0.5 ? 722 + r() * 8 : 758 + r() * 10;
    seedlings += `M${n1(x)},${n1(y)}l-4,-9M${n1(x + 2)},${n1(y)}l1,-11M${n1(x + 4)},${n1(y)}l5,-8`;
  }
  let shine = "";
  for (let i = 0; i < 26; i++) {
    const x = r() * (W - 80);
    const y = r() < 0.5 ? 716 + r() * 12 : 752 + r() * 14;
    shine += `M${n1(x)},${n1(y)}h${n1(20 + r() * 50)}`;
  }

  const p1 = palm(300, 742, 250, 26, 1);
  const p2 = palm(1265, 742, 205, -22, 2);

  const gate = villageGate(560);
  const bf = buffalo(640, 714);
  const fm = farmer(1010, 764);
  const fm2 = farmer(1090, 760);

  const road = ridge(14, G - 2, 3, [2, 3]);
  let pebbles = "";
  for (let i = 0; i < 40; i++) pebbles += E(r() * W, 800 + r() * 90, 2 + r() * 4, 1.5 + r() * 2);

  return {
    back: (
      <>
        <Layer depth={0.06}>
          <path className="f-far" d={m1.fill} />
          <path className="s-rim s-faint" d={m1.line} />
          <path className="f-farmid" d={m2.fill} />
        </Layer>
        <Haze />
        <Layer depth={0.22}>
          <path className="f-mid" d={hills.fill} />
          <path className="s-mid" d={stalks} strokeWidth={5} />
          <path className="f-mid" d={leaves} />
          <path className="f-wall" d={house.wall} />
          <path className="f-roof" d={house.roof} />
          <path className="f-mid" d={house.dark} />
          <path className="f-lit" d={house.win} />
          <path className="s-smoke" d={house.smoke} />
          <path className="f-gate" d={gate.wall} />
          <path className="f-roof" d={gate.roof} />
          <path className="f-flag" d={gate.plaque} />
        </Layer>
        <Layer depth={0.55}>
          <path className="f-near" d={b1 + close} />
          <path className="f-water" d={w1 + close} />
          <path className="f-near" d={b2 + close} />
          <path className="f-water" d={w2 + close} />
          <path className="s-rim" d={b1} />
          <path className="s-rim" d={b2} />
          <path className="s-shine" d={shine} />
          <path className="s-seed" d={seedlings} />
          <path className="f-near" d={p1.trunk + p2.trunk} />
          <path className="f-near" d={p1.fronds + p2.fronds} />
          <path className="f-buffalo" d={bf.body + bf.horns} />
          <path className="s-buffalo" d={bf.tail} />
          <path className="f-egret" d={bf.egret} />
          <path className="s-figure" d={fm.limbs + fm2.limbs} />
          <path className="f-hat" d={fm.hat + fm2.hat} />
        </Layer>
        <Layer depth={1}>
          <path className="f-ground" d={road.fill} />
          <path className="s-rim" d={road.line} />
          <path className="f-pebble" d={pebbles} />
          <path className="f-ground" d={tufts(15, 18, G + 2)} />
        </Layer>
      </>
    ),
    front: (
      <Layer depth={1.35}>
        <path className="f-fg" d={grass(16, [240, 1000, 1480], H + 4, 120)} />
      </Layer>
    ),
  };
})();

/* ---------- school: yellow building, red phượng trees ---------- */
const school: World = (() => {
  const hills = ridge(21, 560, 34, [2, 3, 8]);
  const r = rng(22);
  let blocks = "";
  for (let x = 0; x < W; ) {
    const w = 30 + r() * 50;
    blocks += R(x, 600 - (20 + r() * 50), w + 0.5, 120);
    x += w;
  }

  // three-storey school building, 100px bays
  const top = 478;
  const floorH = 76;
  let cols = "";
  let shade = "";
  let wins = "";
  let lit = "";
  let rail = "";
  let tiles = "";
  for (let x = 0; x < W; x += 100) cols += R(x, top, 12, 230);
  for (let f = 0; f < 3; f++) {
    const y = top + f * floorH;
    shade += R(0, y, W, 12);
    for (let x = 0; x < W; x += 100) {
      const door = (x / 100 + f) % 3 === 0;
      if (door) wins += R(x + 40, y + 24, 26, 50);
      else {
        wins += R(x + 26, y + 26, 22, 26) + R(x + 62, y + 26, 22, 26);
        if (r() < 0.3) lit += R(x + 26, y + 26, 22, 26);
      }
    }
    if (f < 2) {
      const ry = y + floorH - 18;
      rail += R(0, ry, W, 4);
      for (let x = 0; x < W; x += 9) rail += R(x, ry, 2, 18);
    }
  }
  for (let x = 0; x < W; x += 13) tiles += `M${x},446l-3,30`;
  const roof = `M0,476L0,452L${W},452L${W},476Z`;
  const flag = { pole: R(799, 360, 3, 94), cloth: R(802, 362, 48, 32), star: star(826, 378, 9) };
  const board = { frame: R(560, 404, 3, 48) + R(717, 404, 3, 48), face: R(548, 398, 184, 32) };
  const banner = R(900, 594, 560, 22);

  // phượng trees
  let trunk = "";
  let green = "";
  let redDark = "";
  let red = "";
  let redHi = "";
  [230, 800, 1370].forEach((x, ti) => {
    const tr = rng(100 + ti);
    trunk += `M${x - 14},${G - 20}Q${x - 6},620 ${x - 4},540L${x - 90},500L${x - 84},492L${x},528L${x + 70},488L${x + 76},496L${x + 8},548Q${x + 8},640 ${x + 16},${G - 20}Z`;
    for (let i = 0; i < 26; i++) {
      const dx = (tr() - 0.5) * 380;
      const dome = (1 - Math.abs(dx) / 190) * 46;
      const cx = x + dx;
      const cy = 478 + (tr() - 0.5) * 70 - dome;
      const rad = 28 + tr() * 30;
      green += E(cx + (tr() - 0.5) * 20, cy + 14, rad * 0.9, rad * 0.7);
      redDark += E(cx, cy + 10, rad, rad * 0.78);
      red += E(cx - 4, cy - 2, rad * 0.86, rad * 0.66);
      // tiny flower clusters on the lit (upper) side of each puff
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI * (0.15 + tr() * 0.7);
        const d = rad * (0.25 + tr() * 0.5);
        redHi += E(cx - 4 + Math.cos(a) * d, cy - 2 + Math.sin(a) * d * 0.7, 3 + tr() * 4, 2.5 + tr() * 3);
      }
    }
  });

  let petals = "";
  for (let i = 0; i < 70; i++) petals += E(r() * W, 790 + r() * 100, 3 + r() * 3, 1.6 + r() * 1.4, r() * 180);
  let yard = "";
  for (let x = 0; x < W; x += 80) yard += `M${x},${G}l-30,${H - G}`;
  yard += `M0,${G + 44}H${W}`;

  return {
    back: (
      <>
        <Layer depth={0.06}>
          <path className="f-far" d={hills.fill} />
          <path className="f-farmid" d={blocks} />
        </Layer>
        <Haze />
        <Layer depth={0.24}>
          <path className="f-roof" d={roof} />
          <path className="s-roofline" d={tiles} />
          <path className="f-wall" d={R(0, top, W, 240)} />
          <path className="f-wall-sh" d={shade} />
          <path className="f-wall-col" d={cols} />
          <path className="f-win" d={wins} />
          <path className="f-lit" d={lit} />
          <path className="f-wall-col" d={rail} />
          <path className="f-wall-sh" d={R(0, 700, W, 20)} />
          <path className="f-near" d={flag.pole + board.frame} />
          <g className="jr-flag">
            <path className="f-flag" d={flag.cloth} />
            <path className="f-star" d={flag.star} />
          </g>
          <path className="f-vn2" d={board.face} />
          <text x={640} y={421} className="t-sign t-vn2 t-big">
            TRƯỜNG THPT
          </text>
          <path className="f-flag" d={banner} />
          <text x={1180} y={610} className="t-sign t-vn1" textLength={520} lengthAdjust="spacingAndGlyphs">
            TIÊN HỌC LỄ · HẬU HỌC VĂN
          </text>
        </Layer>
        <Layer depth={0.55}>
          <path className="f-trunk" d={trunk} />
          <path className="f-leaf" d={green} />
          <path className="f-phuong-dk" d={redDark} />
          <path className="f-phuong" d={red} />
          <path className="f-phuong-hi" d={redHi} />
        </Layer>
        <Layer depth={1}>
          <path className="f-yard" d={R(0, G - 2, W, H - G + 4)} />
          <path className="s-tile" d={yard} />
          <path className="s-rim" d={`M0,${G - 1}H${W}`} />
          <path className="f-phuong" d={petals} />
        </Layer>
      </>
    ),
    front: (
      <Layer depth={1.35}>
        <path className="f-fg" d={grass(23, [120, 1180], H + 4, 90)} />
      </Layer>
    ),
  };
})();

/* ---------- city: tube houses, neon, tangled power lines ---------- */
function scooter(x: number, y: number) {
  return (
    E(x - 40, y, 20, 20) +
    E(x + 44, y, 20, 20) +
    `M${x - 64},${y - 8}Q${x - 70},${y - 46} ${x - 30},${y - 52}L${x + 6},${y - 52}L${x + 20},${y - 26}L${x + 40},${y - 30}L${x + 50},${y - 92}L${x + 62},${y - 92}L${x + 58},${y - 30}Q${x + 72},${y - 20} ${x + 66},${y - 6}Z` +
    R(x - 46, y - 64, 52, 12)
  );
}

/** a shophouse street layer (mid depth): houses, shops, awnings, signboards */
function Street({ sh }: { sh: ReturnType<typeof shophouses> }) {
  return (
    <>
      <path className="f-h1" d={sh.bodies[0]} />
      <path className="f-h2" d={sh.bodies[1]} />
      <path className="f-h3" d={sh.bodies[2]} />
      <path className="f-h4" d={sh.bodies[3]} />
      <path className="f-mid" d={sh.balc + sh.tanks} />
      <path className="f-win" d={sh.win + sh.shop} />
      <path className="f-lit" d={sh.lit} />
      <path className="f-shop-lit" d={sh.shopLit} />
      <path className="f-awn1" d={sh.awn[0]} />
      <path className="f-awn2" d={sh.awn[1]} />
      <path className="f-awn3" d={sh.awn[2]} />
      <SignBoards signs={sh.signs} />
    </>
  );
}

/* ---------- town: small Vietnamese street, quán net, trà đá stools ---------- */
const town: World = (() => {
  const hills = ridge(71, 560, 40, [2, 3, 7]);
  const r = rng(72);
  let roofs = "";
  for (let x = 0; x < W; ) {
    let w = 50 + r() * 60;
    if (W - x - w < 50) w = W - x;
    const h = 24 + r() * 34;
    roofs += R(x + 2, 616 - h, w - 6, h + 80) + `M${n1(x - 4)},${n1(616 - h)}L${n1(x + w / 2 - 2)},${n1(598 - h)}L${n1(x + w)},${n1(616 - h)}Z`;
    x += w;
  }
  const sh = shophouses(73, 150, 250, TOWN_SIGNS, true, 0.35);
  const pl = powerLines([220, 760, 1300], [338, 344, 388, 430]);
  const st = stools([330, 1080]);
  const tree = { trunk: R(612, 600, 14, 180), leaves: "" };
  const tr = rng(74);
  for (let i = 0; i < 14; i++) tree.leaves += E(619 + (tr() - 0.5) * 170, 560 + (tr() - 0.5) * 80, 30 + tr() * 22, 24 + tr() * 16);
  let side = "";
  for (let sx = 0; sx < W; sx += 64) side += `M${sx},${G}V${H}`;
  side += `M0,${G + 40}H${W}`;

  return {
    back: (
      <>
        <Layer depth={0.06}>
          <path className="f-far" d={hills.fill} />
          <path className="s-rim s-faint" d={hills.line} />
          <path className="f-farmid" d={roofs} />
        </Layer>
        <Haze />
        <Layer depth={0.3}>
          <Street sh={sh} />
        </Layer>
        <Layer depth={0.6}>
          <path className="f-trunk" d={tree.trunk} />
          <path className="f-leaf" d={tree.leaves} />
          <path className="f-near" d={pl.pole} />
          <path className="s-wire" d={pl.wires} />
        </Layer>
        <Layer depth={1}>
          <path className="f-side" d={R(0, G - 2, W, H - G + 4)} />
          <path className="s-tile" d={side} />
          <path className="s-rim" d={`M0,${G - 1}H${W}`} />
          <path className="f-near" d={st.table} />
          <path className="f-stool-r" d={st.red} />
          <path className="f-stool-b" d={st.blue} />
        </Layer>
      </>
    ),
    front: (
      <Layer depth={1.35}>
        <path className="f-fg" d={scooter(560, 884) + scooter(1420, 890)} />
      </Layer>
    ),
  };
})();

/* ---------- city: Saigon tube houses, signs, lanterns, power lines ---------- */
const city: World = (() => {
  const far = skyline(31, 650, 130, 330, 40, 110, 14, 0.18);
  const lm = landmark81(1180, 650, 150);
  const sh = shophouses(32, 210, 350, CITY_SIGNS, false, 0.45);
  const poles = [150, 550, 950, 1350];
  const pl = powerLines(poles, [333, 338, 374, 378, 420, 452]);
  const ln = lanternStrings(poles, 470, 26);

  const lamps = [350, 1150];
  let lampPole = "";
  let cone = "";
  let bulb = "";
  lamps.forEach((lx) => {
    lampPole += `M${lx - 4},${G}L${lx - 3},450Q${lx},420 ${lx + 40},420L${lx + 40},426Q${lx + 6},428 ${lx + 4},452L${lx + 4},${G}Z`;
    lampPole += R(lx + 30, 424, 26, 8);
    cone += `M${lx + 34},432L${lx - 50},${G}L${lx + 130},${G}L${lx + 52},432Z`;
    bulb += E(lx + 43, 434, 12, 6);
  });
  const vd = vendor(980);
  const st = stools([640]);

  let side = "";
  for (let sx = 0; sx < W; sx += 64) side += `M${sx},${G}V${H}`;
  side += `M0,${G + 40}H${W}`;

  return {
    back: (
      <>
        <Layer depth={0.06}>
          <path className="f-far" d={far.body + lm} />
          <path className="f-lit-far" d={far.lit} />
          <path className="f-beacon" d={E(1214, 146, 4, 4)} />
        </Layer>
        <Haze />
        <Layer depth={0.3}>
          <Street sh={sh} />
        </Layer>
        <Layer depth={0.6}>
          <path className="f-near" d={pl.pole} />
          <path className="s-wire" d={pl.wires + ln.wire} />
          <path className="f-lantern-r jr-glow" d={ln.red} filter="url(#jr-blur)" />
          <path className="f-lantern-y jr-glow" d={ln.yellow} filter="url(#jr-blur)" />
          <path className="f-lantern-r" d={ln.red} />
          <path className="f-lantern-y" d={ln.yellow} />
          <path className="f-near" d={ln.caps} />
          <path className="f-cone" d={cone} />
          <path className="f-near" d={lampPole} />
          <path className="f-bulb" d={bulb} />
        </Layer>
        <Layer depth={1}>
          <path className="f-side" d={R(0, G - 2, W, H - G + 4)} />
          <path className="s-tile" d={side} />
          <path className="s-rim" d={`M0,${G - 1}H${W}`} />
          <path className="f-near" d={st.table + vd.dark} />
          <path className="f-stool-r" d={st.red} />
          <path className="f-stool-b" d={st.blue} />
          <path className="s-figure s-thin" d={vd.strings} />
          <path className="f-basket" d={vd.baskets} />
          <path className="f-fruit" d={vd.goods} />
          <path className="f-shirt" d={vd.shirt} />
          <path className="f-hat" d={vd.hat} />
        </Layer>
      </>
    ),
    front: (
      <Layer depth={1.35}>
        <path className="f-fg" d={scooter(430, 880) + scooter(1240, 892)} />
      </Layer>
    ),
  };
})();

/* ---------- office: glass towers, plaza, trees ---------- */
const office: World = (() => {
  const far = skyline(41, 700, 260, 520, 90, 170, 0, 0);
  let mull = "";
  let beacons = "";
  far.tops.forEach((t) => {
    for (let mx = t.x + 14; mx < t.x + t.w - 6; mx += 18) mull += `M${n1(mx)},${n1(t.top + 6)}V700`;
    if (t.top < 300) beacons += E(t.x + t.w / 2, t.top - 4, 4, 4);
  });

  const r = rng(42);
  let bodies = "";
  let bands = "";
  let lit = "";
  for (let x = 0; x < W; ) {
    let w = 150 + r() * 120;
    if (W - x - w < 150) w = W - x;
    const h = 170 + r() * 150;
    const t = 745 - h;
    bodies += R(x + 6, t, w - 12, h + 10);
    for (let y = t + 14; y < 735; y += 24) {
      bands += R(x + 14, y, w - 28, 10);
      if (r() < 0.4) lit += R(x + 14 + r() * (w - 80), y, 40 + r() * 30, 10);
    }
    x += w;
  }

  let trunk = "";
  let canopy = "";
  let hi = "";
  for (let tx = 130; tx < W; tx += 270) {
    trunk += R(tx - 5, 690, 10, 90);
    for (let i = 0; i < 9; i++) {
      const cx = tx + (r() - 0.5) * 80;
      const cy = 650 + (r() - 0.5) * 60;
      const rad = 26 + r() * 16;
      canopy += E(cx, cy, rad, rad * 0.9);
      if (r() < 0.6) hi += E(cx - 8, cy - 10, rad * 0.5, rad * 0.4);
    }
  }
  const hedge = ridge(43, 770, 6, [8, 13]);
  let plaza = "";
  for (let x = 0; x < W; x += 100) plaza += `M${x},${G}l-60,${H - G}`;
  plaza += `M0,${G + 30}H${W}M0,${G + 80}H${W}`;

  return {
    back: (
      <>
        <Layer depth={0.06}>
          <path className="f-glass-far" d={far.body + landmark81(1010, 700, 70) + bitexco(380, 700, 200).body + bitexco(380, 700, 200).pad} />
          <path className="s-mullion" d={`M1044,90V700M1030,220V700M1058,220V700`} />
          <path className="s-mullion" d={mull} />
          <path className="f-beacon" d={beacons} />
        </Layer>
        <Haze />
        <Layer depth={0.28}>
          <path className="f-mid" d={bodies} />
          <path className="f-glass" d={bands} />
          <path className="f-lit" d={lit} />
        </Layer>
        <Layer depth={0.6}>
          <path className="f-trunk" d={trunk} />
          <path className="f-leaf" d={canopy} />
          <path className="f-leaf-hi" d={hi} />
          <path className="f-leaf-dk" d={hedge.fill} />
        </Layer>
        <Layer depth={1}>
          <path className="f-plaza" d={R(0, G - 2, W, H - G + 4)} />
          <path className="s-tile" d={plaza} />
          <path className="s-rim" d={`M0,${G - 1}H${W}`} />
        </Layer>
      </>
    ),
    front: (
      <Layer depth={1.35}>
        <path
          className="f-fg"
          d={E(300, 900, 90, 44) + E(380, 890, 60, 40) + E(1210, 905, 110, 46) + E(1100, 900, 60, 34)}
        />
      </Layer>
    ),
  };
})();

/* ---------- coast: sea, lighthouse, palms, guard-rail road ---------- */
const coast: World = (() => {
  const r = rng(51);
  let glints = "";
  for (let i = 0; i < 60; i++) {
    const y = 616 + Math.pow(r(), 1.6) * 160;
    glints += `M${n1(r() * W)},${n1(y)}h${n1(8 + (y - 600) * 0.25 * r())}`;
  }
  const islands =
    `M180,612Q260,560 330,590Q400,550 520,612Z` + `M980,612Q1040,584 1100,596Q1160,576 1260,612Z`;

  const lx = 1180;
  const rock = `M${lx - 120},700Q${lx - 90},650 ${lx - 30},660Q${lx + 10},630 ${lx + 60},662Q${lx + 110},660 ${lx + 130},700Z`;
  const tower = `M${lx - 20},664L${lx - 13},540L${lx + 13},540L${lx + 20},664Z`;
  const bands = R(lx - 18, 610, 36, 14) + R(lx - 16, 570, 32, 12);
  const lantern = R(lx - 12, 520, 24, 20) + `M${lx - 16},520L${lx},504L${lx + 16},520Z`;
  const beam = `M${lx},528L${lx - 900},470L${lx - 900},600Z`;

  const dunes = ridge(52, 772, 7, [3, 7, 11]);
  const p1 = palm(180, 772, 240, 30, 3);
  const p2 = palm(760, 772, 200, -26, 4);
  const p3 = palm(1440, 772, 260, 18, 5);
  let rail = R(0, 744, W, 9);
  for (let x = 10; x < W; x += 80) rail += R(x, 744, 6, 34);

  let dash = "";
  for (let x = 20; x < W; x += 160) dash += R(x, 846, 80, 5);

  return {
    back: (
      <>
        <Layer depth={0.03}>
          <path className="f-sea" d={R(0, 610, W, 180)} />
          <path className="f-sea-hi" d={R(0, 608, W, 3)} />
          <path className="f-far" d={islands} />
          <path className="s-glint" d={glints} />
        </Layer>
        <div className="jr-sea-glint" aria-hidden />
        <Layer depth={0.22}>
          <path className="f-beam" d={beam} />
          <path className="f-mid" d={rock} />
          <path className="f-tower" d={tower} />
          <path className="f-flag" d={bands} />
          <path className="f-mid" d={lantern} />
          <path className="f-bulb" d={E(lx, 530, 7, 6)} />
        </Layer>
        <Layer depth={0.6}>
          <path className="f-near" d={dunes.fill} />
          <path className="s-rim" d={dunes.line} />
          <path className="f-near" d={p1.trunk + p2.trunk + p3.trunk} />
          <path className="f-near" d={p1.fronds + p2.fronds + p3.fronds} />
        </Layer>
        <Layer depth={1}>
          <path className="f-rail" d={rail} />
          <path className="f-asphalt" d={R(0, G - 2, W, H - G + 4)} />
          <path className="s-rim" d={`M0,${G - 1}H${W}`} />
          <path className="f-dash" d={dash} />
        </Layer>
      </>
    ),
    front: (
      <Layer depth={1.35}>
        <path className="f-fg" d={grass(53, [600, 1500], H + 4, 100)} />
      </Layer>
    ),
  };
})();

/* ---------- rooftop: dense night skyline, water tanks, laundry ---------- */
const rooftop: World = (() => {
  const far = skyline(61, 690, 120, 380, 30, 80, 11, 0.4);
  const r = rng(62);
  const bokeh: string[] = ["", "", ""];
  for (let i = 0; i < 40; i++) bokeh[i % 3] += E(r() * W, 470 + r() * 240, 6 + r() * 14, 6 + r() * 14);

  const mid = skyline(63, 765, 70, 210, 90, 200, 16, 0.35);
  let ant = "";
  let beacons = "";
  mid.tops.forEach((t, i) => {
    if (i % 2 === 0) {
      ant += R(t.x + t.w * 0.7, t.top - 60, 3, 60) + R(t.x + t.w * 0.7 - 12, t.top - 44, 27, 2);
      beacons += E(t.x + t.w * 0.7 + 1.5, t.top - 62, 3.5, 3.5);
    }
  });
  // small neon sign on a rooftop: frame + glowing strokes
  const board = {
    frame: R(1040, 560, 6, 40) + R(1150, 560, 6, 40),
    face: R(1010, 500, 176, 62),
    neon: "M1030,518h56M1030,532h90M1030,546h40M1132,516l16,16l-16,16M1162,516v32",
  };

  // rooftop props (same plane as the hero → ground layer)
  // stainless water tank on a steel stand (every Vietnamese rooftop has one)
  const tank = R(250, 600, 150, 64) + E(250, 632, 13, 32) + E(400, 632, 13, 32);
  const tankLegs =
    R(266, 664, 7, 116) + R(378, 664, 7, 116) + R(258, 664, 136, 7) + `M270,700L382,760L382,768L270,708Z`;
  const tankHi = R(258, 610, 136, 7) + R(290, 600, 4, 64) + R(352, 600, 4, 64);
  const dish = `M610,720A48,48 0 0 1 690,690L650,736Z` + R(648, 730, 6, 50);
  const poles = R(820, 610, 5, 170) + R(1100, 610, 5, 170);
  const line = `M822,620Q962,650 1102,620`;
  const clothes: string[] = ["", "", ""];
  [
    [860, 0],
    [915, 1],
    [975, 2],
    [1035, 0],
  ].forEach(([cx, c], i) => {
    const y = 630 + Math.sin(((cx - 822) / 280) * Math.PI) * 26;
    clothes[c] +=
      i % 2
        ? `M${cx - 18},${y - 4}L${cx + 18},${y - 4}L${cx + 24},${y + 8}L${cx + 14},${y + 12}L${cx + 14},${y + 46}L${cx - 14},${y + 46}L${cx - 14},${y + 12}L${cx - 24},${y + 8}Z`
        : R(cx - 14, y - 2, 28, 52);
  });
  const pots = R(1330, 742, 44, 38) + R(1390, 750, 34, 30);
  const plants = leaf(1352, 744, 1320, 690, 9) + leaf(1352, 744, 1360, 680, 9) + leaf(1352, 744, 1392, 700, 9) + leaf(1407, 752, 1420, 708, 8) + leaf(1407, 752, 1386, 716, 8);
  let floor = "";
  for (let x = 0; x < W; x += 120) floor += `M${x},${G}l-40,${H - G}`;

  let rail = R(0, 846, W, 7);
  for (let x = 30; x < W; x += 90) rail += R(x, 846, 7, 70);

  return {
    back: (
      <>
        <Layer depth={0.05}>
          <path className="f-far" d={far.body + landmark81(1160, 690, 110)} />
          <path className="f-lit-far" d={far.lit} />
          <path className="f-lm-strip" d={R(1192, 150, 4, 540)} />
          <path className="f-beacon" d={E(1194, 106, 4, 4)} />
          {bokeh.map((d, i) => (
            <path key={i} className={`f-bokeh${i + 1}`} d={d} filter="url(#jr-blur)" />
          ))}
        </Layer>
        <Haze />
        <Layer depth={0.3}>
          <path className="f-mid" d={mid.body + ant + board.frame} />
          <path className="f-lit" d={mid.lit} />
          <path className="f-near" d={board.face} />
          <path className="s-neon jr-glow" d={board.neon + board.face} filter="url(#jr-blur)" />
          <path className="s-neon" d={board.neon} />
          <path className="s-neon s-neon-b" d={board.face} />
          <path className="f-beacon" d={beacons} />
        </Layer>
        <Layer depth={1}>
          <path className="f-roof-floor" d={R(0, G - 2, W, H - G + 4)} />
          <path className="s-tile" d={floor} />
          <path className="s-rim" d={`M0,${G - 1}H${W}`} />
          <path className="f-near" d={tankLegs + dish + poles + pots} />
          <path className="f-tank" d={tank} />
          <path className="f-tank-hi" d={tankHi} />
          <path className="s-wire" d={line} />
          <path className="f-cloth1" d={clothes[0]} />
          <path className="f-cloth2" d={clothes[1]} />
          <path className="f-cloth3" d={clothes[2]} />
          <path className="f-leaf" d={plants} />
        </Layer>
      </>
    ),
    front: (
      <Layer depth={1.35}>
        <path className="f-fg" d={rail} />
      </Layer>
    ),
  };
})();

export const WORLDS: Record<JourneySetting, World> = {
  hometown,
  town,
  school,
  city,
  office,
  coast,
  rooftop,
};

/* ------------------------------------------------------------------ */
/* fixed sky decorations                                                */
/* ------------------------------------------------------------------ */

export const STARS = (() => {
  const r = rng(91);
  let small = "";
  let big = "";
  let sparkle = "";
  for (let i = 0; i < 220; i++) {
    const x = r() * 1000;
    const y = Math.pow(r(), 1.4) * 520;
    if (r() < 0.86) small += E(x, y, 0.7 + r() * 0.7, 0.7 + r() * 0.7);
    else big += E(x, y, 1.4 + r(), 1.4 + r());
  }
  for (let i = 0; i < 12; i++) {
    const x = r() * 1000;
    const y = r() * 380;
    const s = 4 + r() * 4;
    sparkle += `M${n1(x)},${n1(y - s)}L${n1(x + 0.9)},${n1(y - 0.9)}L${n1(x + s)},${n1(y)}L${n1(x + 0.9)},${n1(y + 0.9)}L${n1(x)},${n1(y + s)}L${n1(x - 0.9)},${n1(y + 0.9)}L${n1(x - s)},${n1(y)}L${n1(x - 0.9)},${n1(y - 0.9)}Z`;
  }
  return (
    <svg className="jr-stars" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMin slice" aria-hidden>
      <path d={small} fill="#fff" opacity={0.75} />
      <path d={big} fill="#fff" className="jr-twinkle" />
      <path d={sparkle} fill="#fff" className="jr-twinkle jr-twinkle-b" />
    </svg>
  );
})();

/** shared <defs> referenced by every tile (filters work across inline svgs) */
export function SceneDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id="jr-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
    </svg>
  );
}
