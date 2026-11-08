"use client";

import { MeshReflectorMaterial, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree, type GroupProps } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ExhibitId } from "@/data/exhibits";

/** colors derived from the site theme (see page.tsx buildPalette) */
export interface HallPalette {
  isDark: boolean;
  bg: string;
  floor: string;
  base: string;
  baseTop: string;
  glass: string;
  neon: string;
  soft: string;
}

type HoverRef = { v: number };

/** fallback = the site's default (dark) theme values */
export const DEFAULT_PALETTE: HallPalette = {
  isDark: true,
  bg: "rgb(38, 34, 35)",
  floor: "rgb(30, 27, 28)",
  base: "rgb(21, 19, 19)",
  baseTop: "rgb(17, 15, 16)",
  glass: "rgb(146, 128, 118)",
  neon: "rgb(221, 198, 182)",
  soft: "rgb(130, 116, 109)",
};

/* ------------------------------------------------------------------ */
/* timing + easing                                                      */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const INTRO = 2.8; // seconds of camera fly-in
const LIGHT_UP = [0.35, 0.65, 0.95]; // staged neon: floor band → top band → glass rim
const HOLO_DELAY = 1.25; // first hologram materializes after this
const HOLO_Y = 2.85; // hologram centre height
const HALF = 1.2; // half height of a hologram (for the scan reveal)
const IN_TIME = 1.15;
const OUT_TIME = 0.55;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const rand = (n: number) => Math.floor(Math.random() * n);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const ORIGIN = V();

/* ------------------------------------------------------------------ */
/* shared hologram geometry + materials                                 */
/* ------------------------------------------------------------------ */

const G = {
  core: new THREE.IcosahedronGeometry(0.27, 0),
  shell: new THREE.IcosahedronGeometry(0.44, 1),
  box: new THREE.BoxGeometry(0.2, 0.2, 0.2),
  dot: new THREE.SphereGeometry(0.035, 10, 10),
  msg: new THREE.BoxGeometry(0.075, 0.075, 0.075),
  tube: new THREE.CylinderGeometry(0.24, 0.24, 1.6, 18, 5, true),
  hex: new THREE.CylinderGeometry(0.4, 0.42, 0.1, 6),
  pod: new THREE.BoxGeometry(0.13, 0.13, 0.13),
  octa: new THREE.OctahedronGeometry(0.17),
  device: new THREE.OctahedronGeometry(0.075),
  broker: new THREE.IcosahedronGeometry(0.33, 1),
  ring: new THREE.RingGeometry(0.96, 1, 72),
  disk: new THREE.CylinderGeometry(0.5, 0.5, 0.24, 40),
  torus: new THREE.TorusGeometry(0.64, 0.016, 3, 56),
};

const edgeCache = new WeakMap<THREE.BufferGeometry, THREE.EdgesGeometry>();
function edgesOf(g: THREE.BufferGeometry) {
  let e = edgeCache.get(g);
  if (!e) {
    e = new THREE.EdgesGeometry(g, 25);
    edgeCache.set(g, e);
  }
  return e;
}

function makeMats(palette: HallPalette, plane: THREE.Plane) {
  const blending = palette.isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
  const color = new THREE.Color(palette.neon);
  const base = {
    color,
    transparent: true,
    depthWrite: false,
    blending,
    clippingPlanes: [plane],
    toneMapped: false,
  };
  return {
    face: new THREE.MeshBasicMaterial({ ...base, opacity: palette.isDark ? 0.07 : 0.13, side: THREE.DoubleSide }),
    wire: new THREE.MeshBasicMaterial({ ...base, wireframe: true, opacity: palette.isDark ? 0.36 : 0.6 }),
    edge: new THREE.LineBasicMaterial({ ...base, opacity: palette.isDark ? 0.85 : 0.95 }),
    line: new THREE.LineBasicMaterial({ ...base, opacity: palette.isDark ? 0.28 : 0.5 }),
    solid: new THREE.MeshBasicMaterial({ ...base, opacity: 1 }),
  };
}
type Mats = ReturnType<typeof makeMats>;

/** translucent body + crisp edges (or a wireframe for round things) */
function Holo({ geo, m, wire = false, ...rest }: { geo: THREE.BufferGeometry; m: Mats; wire?: boolean } & GroupProps) {
  return (
    <group {...rest}>
      <mesh geometry={geo} material={m.face} />
      {wire ? <mesh geometry={geo} material={m.wire} /> : <lineSegments geometry={edgesOf(geo)} material={m.edge} />}
    </group>
  );
}

function useLines(build: () => THREE.Vector3[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(build()), []);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

function useRefs<T>() {
  const list = useRef<T[]>([]);
  const set = useCallback((i: number) => (el: T | null) => {
    if (el) list.current[i] = el;
  }, []);
  return [list, set] as const;
}

/* ------------------------------------------------------------------ */
/* exhibit 1 — service mesh: gateway + services, requests ping-ponging  */
/* ------------------------------------------------------------------ */

function MeshExhibit({ m }: { m: Mats }) {
  const svc = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * TAU;
        return V(Math.cos(a) * 0.95, i % 2 ? 0.34 : -0.34, Math.sin(a) * 0.95);
      }),
    []
  );
  const links = useLines(() => svc.flatMap((s, i) => [ORIGIN, s, s, svc[(i + 1) % 6]]));
  const flows = useMemo(
    () => Array.from({ length: 11 }, (_, i) => ({ s: i % 6, v: 0.32 + Math.random() * 0.4, o: Math.random() * 2 })),
    []
  );
  const [dots, setDot] = useRefs<THREE.Object3D>();
  const [boxes, setBox] = useRefs<THREE.Object3D>();
  const core = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flows.forEach((f, i) => {
      const d = dots.current[i];
      if (!d) return;
      const k = (t * f.v + f.o) % 2;
      d.position.lerpVectors(ORIGIN, svc[f.s], easeInOut(k < 1 ? k : 2 - k));
    });
    boxes.current.forEach((b, i) => b.rotation.set(t * 0.5 + i, t * 0.7 + i * 2, 0));
    if (core.current) {
      core.current.rotation.y = -t * 0.4;
      core.current.rotation.x = t * 0.25;
    }
  });

  return (
    <group>
      <group ref={core}>
        <Holo geo={G.core} m={m} />
        <Holo geo={G.shell} m={m} wire />
      </group>
      {svc.map((s, i) => (
        <group key={i} position={s} ref={setBox(i)}>
          <Holo geo={G.box} m={m} />
        </group>
      ))}
      <lineSegments geometry={links} material={m.line} />
      {flows.map((_, i) => (
        <mesh key={i} geometry={G.dot} material={m.solid} ref={setDot(i)} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* exhibit 2 — message queue: producers → tube → consumers              */
/* ------------------------------------------------------------------ */

function QueueExhibit({ m }: { m: Mats }) {
  const P = useMemo(() => [-0.5, 0, 0.5].map((y) => V(-1.15, y, 0)), []);
  const C = useMemo(() => [-0.5, 0, 0.5].map((y) => V(1.15, y, 0)), []);
  const IN = useMemo(() => V(-0.8, 0, 0), []);
  const OUT = useMemo(() => V(0.8, 0, 0), []);
  const links = useLines(() => [...P.flatMap((p) => [p, IN]), ...C.flatMap((c) => [OUT, c])]);
  const msgs = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => ({
        p: i % 3,
        c: rand(3),
        v: 0.16 + Math.random() * 0.06,
        o: i / 13,
        a: (i / 13) * TAU,
      })),
    []
  );
  const [cubes, setCube] = useRefs<THREE.Object3D>();
  const tmp = useMemo(() => V(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    msgs.forEach((g, i) => {
      const c = cubes.current[i];
      if (!c) return;
      const k = (t * g.v + g.o) % 1;
      if (k < 0.22) c.position.lerpVectors(P[g.p], IN, easeInOut(k / 0.22));
      else if (k < 0.78) {
        // inside the queue each message keeps its own lane
        c.position.lerpVectors(IN, OUT, (k - 0.22) / 0.56);
        tmp.set(0, Math.sin(g.a) * 0.1, Math.cos(g.a) * 0.1);
        c.position.add(tmp);
      } else c.position.lerpVectors(OUT, C[g.c], easeInOut((k - 0.78) / 0.22));
      c.rotation.set(t * 2 + i, t * 1.4 + i, 0);
    });
  });

  return (
    <group>
      {P.map((p, i) => (
        <Holo key={`p${i}`} geo={G.box} m={m} position={p} />
      ))}
      {C.map((c, i) => (
        <Holo key={`c${i}`} geo={G.box} m={m} position={c} />
      ))}
      <group rotation={[0, 0, Math.PI / 2]}>
        <Holo geo={G.tube} m={m} wire />
      </group>
      <lineSegments geometry={links} material={m.line} />
      {msgs.map((_, i) => (
        <mesh key={i} geometry={G.msg} material={m.solid} ref={setCube(i)} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* exhibit 3 — cluster: pods scale up/down, scheduler sends them out    */
/* ------------------------------------------------------------------ */

function ClusterExhibit({ m }: { m: Mats }) {
  const nodes = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const a = (i / 3) * TAU + Math.PI / 6;
        return V(Math.cos(a) * 0.68, -0.55, Math.sin(a) * 0.68);
      }),
    []
  );
  const slots = useMemo(
    () =>
      nodes.flatMap((n, ni) =>
        [
          [-0.1, -0.1],
          [0.1, -0.1],
          [-0.1, 0.1],
          [0.1, 0.1],
        ].map(([dx, dz]) => ({ ni, pos: V(n.x + dx, n.y + 0.13, n.z + dz) }))
      ),
    [nodes]
  );
  const cp = useMemo(() => V(0, 0.7, 0), []);
  const links = useLines(() => nodes.flatMap((n) => [cp, V(n.x, n.y + 0.06, n.z)]));
  const on = useRef(slots.map((_, i) => i % 3 !== 2));
  const scale = useRef(slots.map(() => 0));
  const pulses = useRef([0, 1, 2].map(() => ({ t: -1, to: 0 })));
  const [pods, setPod] = useRefs<THREE.Object3D>();
  const [pulseEls, setPulse] = useRefs<THREE.Object3D>();
  const brain = useRef<THREE.Group>(null);
  const timer = useRef(0);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    timer.current += dt;
    if (timer.current > 0.95) {
      timer.current = 0;
      const offs = on.current.flatMap((v, i) => (v ? [] : [i]));
      const ons = on.current.flatMap((v, i) => (v ? [i] : []));
      if (offs.length && (Math.random() < 0.55 || ons.length < 5)) {
        const i = offs[rand(offs.length)];
        const p = pulses.current.find((q) => q.t < 0);
        on.current[i] = true;
        if (p) {
          p.t = 0;
          p.to = slots[i].ni;
        }
      } else if (ons.length > 4) on.current[ons[rand(ons.length)]] = false;
    }
    slots.forEach((_, i) => {
      scale.current[i] += ((on.current[i] ? 1 : 0) - scale.current[i]) * Math.min(1, dt * 7);
      const r = pods.current[i];
      if (r) {
        r.scale.setScalar(Math.max(0.0001, scale.current[i]));
        r.rotation.y = t * 0.6 + i;
      }
    });
    pulses.current.forEach((p, i) => {
      const r = pulseEls.current[i];
      if (!r) return;
      if (p.t < 0) {
        r.visible = false;
        return;
      }
      p.t += dt / 0.5;
      if (p.t >= 1) {
        p.t = -1;
        r.visible = false;
        return;
      }
      const n = nodes[p.to];
      r.visible = true;
      r.position.set(cp.x + (n.x - cp.x) * p.t, cp.y + (n.y + 0.06 - cp.y) * p.t, cp.z + (n.z - cp.z) * p.t);
    });
    if (brain.current) brain.current.rotation.y = t * 0.8;
  });

  return (
    <group>
      {nodes.map((n, i) => (
        <Holo key={i} geo={G.hex} m={m} position={n} />
      ))}
      {slots.map((s, i) => (
        <group key={i} position={s.pos} ref={setPod(i)}>
          <Holo geo={G.pod} m={m} />
        </group>
      ))}
      <group ref={brain} position={cp}>
        <Holo geo={G.octa} m={m} />
      </group>
      <lineSegments geometry={links} material={m.line} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={G.dot} material={m.solid} ref={setPulse(i)} visible={false} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* exhibit 4 — IoT broker: devices publish, broker fans out             */
/* ------------------------------------------------------------------ */

const ORBITS = [
  { r: 0.8, tilt: 0.38 },
  { r: 1.08, tilt: -0.28 },
];

function IotExhibit({ m }: { m: Mats }) {
  const devs = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({ o: i % 2, ph: (i / 8) * TAU + Math.random(), v: 0.18 + Math.random() * 0.12 })),
    []
  );
  const orbitGeos = useMemo(
    () =>
      ORBITS.map(({ r, tilt }) =>
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 97 }, (_, k) => {
            const a = (k / 96) * TAU;
            const z = Math.sin(a) * r;
            return V(Math.cos(a) * r, -z * Math.sin(tilt), z * Math.cos(tilt));
          })
        )
      ),
    []
  );
  useEffect(() => () => orbitGeos.forEach((g) => g.dispose()), [orbitGeos]);
  const ringMat = useMemo(() => m.solid.clone(), [m]);
  useEffect(() => () => ringMat.dispose(), [ringMat]);

  const [devEls, setDev] = useRefs<THREE.Object3D>();
  const [pktEls, setPkt] = useRefs<THREE.Object3D>();
  const ring = useRef<THREE.Mesh>(null);
  const pkts = useRef(Array.from({ length: 9 }, () => ({ t: -1, from: -1, to: -1 })));
  const ringT = useRef(-1);
  const timer = useRef(0);
  const a = useMemo(() => V(), []);
  const b = useMemo(() => V(), []);

  const devPos = (i: number, t: number, out: THREE.Vector3) => {
    const d = devs[i];
    const { r, tilt } = ORBITS[d.o];
    const ang = d.ph + t * d.v;
    const z = Math.sin(ang) * r;
    return out.set(Math.cos(ang) * r, -z * Math.sin(tilt), z * Math.cos(tilt));
  };
  const spawn = (from: number, to: number) => {
    const p = pkts.current.find((q) => q.t < 0);
    if (p) Object.assign(p, { t: 0, from, to });
  };

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    devs.forEach((_, i) => {
      const el = devEls.current[i];
      if (el) {
        devPos(i, t, el.position);
        el.rotation.y = t * 1.5 + i;
      }
    });
    timer.current += dt;
    if (timer.current > 0.8) {
      timer.current = 0;
      spawn(rand(devs.length), -1); // a device publishes
    }
    pkts.current.forEach((p, i) => {
      const el = pktEls.current[i];
      if (!el) return;
      if (p.t < 0) {
        el.visible = false;
        return;
      }
      p.t += dt / 0.5;
      if (p.t >= 1) {
        if (p.to === -1) {
          // reached the broker → pulse + fan out to two subscribers
          ringT.current = 0;
          const s1 = (p.from + 1 + rand(devs.length - 1)) % devs.length;
          const s2 = (s1 + 1 + rand(devs.length - 2)) % devs.length;
          p.t = -1;
          spawn(-1, s1);
          if (s2 !== p.from) spawn(-1, s2);
        } else p.t = -1;
        el.visible = false;
        return;
      }
      if (p.from === -1) a.copy(ORIGIN);
      else devPos(p.from, t, a);
      if (p.to === -1) b.copy(ORIGIN);
      else devPos(p.to, t, b);
      el.visible = true;
      el.position.lerpVectors(a, b, easeInOut(p.t));
    });
    if (ring.current) {
      if (ringT.current >= 0) {
        ringT.current += dt / 0.7;
        if (ringT.current >= 1) ringT.current = -1;
      }
      const k = ringT.current < 0 ? 1 : ringT.current;
      ring.current.visible = ringT.current >= 0;
      ring.current.scale.setScalar(0.38 + easeOut(k) * 0.9);
      ringMat.opacity = (1 - k) * 0.85;
    }
  });

  return (
    <group>
      <Holo geo={G.broker} m={m} wire />
      {orbitGeos.map((g, i) => (
        <lineLoop key={i} geometry={g} material={m.line} />
      ))}
      {devs.map((_, i) => (
        <group key={i} ref={setDev(i)}>
          <Holo geo={G.device} m={m} />
        </group>
      ))}
      <mesh ref={ring} geometry={G.ring} material={ringMat} rotation={[-Math.PI / 2, 0, 0]} visible={false} />
      {pkts.current.map((_, i) => (
        <mesh key={i} geometry={G.dot} material={m.solid} ref={setPkt(i)} visible={false} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* exhibit 5 — cache & database: hits bounce off Redis, misses go deep  */
/* ------------------------------------------------------------------ */

function StorageExhibit({ m }: { m: Mats }) {
  const [qs, setQ] = useRefs<THREE.Object3D>();
  const [keys, setKey] = useRefs<THREE.Object3D>();
  const cache = useRef<THREE.Group>(null);
  const queries = useRef(Array.from({ length: 8 }, (_, i) => ({ t: -i * 0.35, hit: true, x: 0, z: 0, dur: 1 })));

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (cache.current) cache.current.rotation.y = t * 1.6;
    keys.current.forEach((k, i) => {
      const a = t * 1.6 + (i / 8) * TAU;
      k.position.set(Math.cos(a) * 0.64, 0.55, Math.sin(a) * 0.64);
    });
    queries.current.forEach((q, i) => {
      const el = qs.current[i];
      if (!el) return;
      q.t += dt / q.dur;
      if (q.t >= 1) {
        q.hit = Math.random() < 0.7;
        q.dur = q.hit ? 1.1 : 2.3;
        q.t = 0;
        const r = Math.random() * 0.28;
        const ang = Math.random() * TAU;
        q.x = Math.cos(ang) * r;
        q.z = Math.sin(ang) * r;
      }
      el.visible = q.t >= 0;
      if (q.t < 0) return;
      const bottom = q.hit ? 0.55 : -0.32;
      const k = q.t < 0.5 ? easeInOut(q.t / 0.5) : 1 - easeInOut((q.t - 0.5) / 0.5);
      el.position.set(q.x, 1.1 + (bottom - 1.1) * k, q.z);
    });
  });

  return (
    <group>
      {[-0.62, -0.31, 0].map((y) => (
        <Holo key={y} geo={G.disk} m={m} position={[0, y, 0]} />
      ))}
      <group ref={cache} position={[0, 0.55, 0]}>
        <Holo geo={G.torus} m={m} wire rotation={[Math.PI / 2, 0, 0]} />
      </group>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`k${i}`} geometry={G.dot} material={m.solid} ref={setKey(i)} scale={0.8} />
      ))}
      {queries.current.map((_, i) => (
        <mesh key={i} geometry={G.msg} material={m.solid} ref={setQ(i)} visible={false} />
      ))}
    </group>
  );
}

const MODELS: Record<ExhibitId, (p: { m: Mats }) => JSX.Element> = {
  mesh: MeshExhibit,
  queue: QueueExhibit,
  cluster: ClusterExhibit,
  iot: IotExhibit,
  storage: StorageExhibit,
};

/* ------------------------------------------------------------------ */
/* hologram: scan-beam materialize / dematerialize between exhibits     */
/* ------------------------------------------------------------------ */

function Hologram({
  exhibit,
  onClick,
  hover,
  palette,
}: {
  exhibit: ExhibitId;
  onClick: () => void;
  hover: HoverRef;
  palette: HallPalette;
}) {
  const [shown, setShown] = useState<ExhibitId>(exhibit);
  const shownRef = useRef(exhibit);
  const wanted = useRef(exhibit);
  const phase = useRef<"wait" | "in" | "idle" | "out">("wait");
  const prog = useRef(0);
  const over = useRef(false);
  const group = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Group>(null);

  const plane = useMemo(() => new THREE.Plane(V(0, -1, 0), -10), []);
  const mats = useMemo(() => makeMats(palette, plane), [palette, plane]);
  useEffect(() => () => Object.values(mats).forEach((x) => x.dispose()), [mats]);
  const scanMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(palette.neon),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: palette.isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [palette]
  );
  useEffect(() => () => scanMat.dispose(), [scanMat]);

  useEffect(() => {
    wanted.current = exhibit;
    if (exhibit !== shownRef.current && phase.current !== "wait") phase.current = "out";
  }, [exhibit]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    g.rotation.y += dt * 0.32;
    const yc = HOLO_Y + Math.sin(t * 0.9) * 0.08;
    g.position.y = yc;
    const s = over.current ? 1.06 : 1;
    g.scale.lerp(V(s, s, s), Math.min(1, dt * 6));

    // transition state machine
    if (phase.current === "wait" && t > HOLO_DELAY) {
      phase.current = "in";
      prog.current = 0;
    } else if (phase.current === "in") {
      prog.current = Math.min(1, prog.current + dt / IN_TIME);
      if (prog.current >= 1) phase.current = "idle";
    } else if (phase.current === "out") {
      prog.current = Math.max(0, prog.current - dt / OUT_TIME);
      if (prog.current <= 0) {
        shownRef.current = wanted.current;
        setShown(wanted.current);
        phase.current = "in";
      }
    } else if (phase.current === "idle" && wanted.current !== shownRef.current) {
      phase.current = "out";
    }

    const p = phase.current === "wait" ? 0 : easeInOut(prog.current);
    const bottom = yc - HALF;
    const cut = bottom + p * HALF * 2.15;
    plane.constant = phase.current === "idle" ? 100 : cut; // keeps everything below `cut`

    const scanning = phase.current === "in" || phase.current === "out";
    if (scan.current) {
      scan.current.visible = scanning;
      scan.current.position.y = cut - yc;
      scanMat.opacity = scanning ? 0.9 * Math.sin(Math.PI * clamp01(prog.current)) + 0.1 : 0;
    }

    // hologram flicker (stronger while it is being drawn)
    const jitter = scanning ? 0.05 : 0.02;
    mats.face.opacity = (palette.isDark ? 0.07 : 0.13) + jitter * Math.sin(t * 23) * Math.sin(t * 5.3);
    mats.edge.opacity = (palette.isDark ? 0.85 : 0.95) - (scanning ? 0.25 * Math.random() : 0.06 * Math.abs(Math.sin(t * 13.7)));
  });

  const Model = MODELS[shown];

  return (
    <group
      ref={group}
      position={[0, HOLO_Y, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        over.current = true;
        hover.v++;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        over.current = false;
        hover.v--;
        document.body.style.cursor = "auto";
      }}
    >
      <Model key={shown} m={mats} />
      {/* scan beam: a bright ring + soft disc sweeping through the model */}
      <group ref={scan} visible={false}>
        <mesh geometry={G.ring} material={scanMat} rotation={[-Math.PI / 2, 0, 0]} scale={1.25} />
        <mesh material={scanMat} rotation={[-Math.PI / 2, 0, 0]} scale={1.22}>
          <circleGeometry args={[1, 64]} />
        </mesh>
      </group>
      <pointLight color={palette.neon} intensity={palette.isDark ? 0.9 : 0.5} distance={6} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* hall pieces                                                          */
/* ------------------------------------------------------------------ */

function useGlowTexture() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.35, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/** a hex neon ring that lights up during the intro and brightens on hover */
function NeonBand({
  radius,
  y,
  height = 0.06,
  delay,
  hover,
  palette,
}: {
  radius: number;
  y: number;
  height?: number;
  delay: number;
  hover: HoverRef;
  palette: HallPalette;
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const glowMat = useRef<THREE.SpriteMaterial>(null);
  const glow = useGlowTexture();
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const lit = t < delay ? 0 : t < delay + 0.25 ? (Math.random() > 0.5 ? 1 : 0.2) : 1; // flicker on, like a tube
    const target = lit * (hover.v > 0 ? 2.4 : 1.1);
    if (mat.current) mat.current.emissiveIntensity += (target - mat.current.emissiveIntensity) * Math.min(1, dt * 9);
    if (glowMat.current) glowMat.current.opacity = 0.26 * lit;
  });
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 6, 1, true]} />
        <meshStandardMaterial
          ref={mat}
          color={palette.neon}
          emissive={palette.neon}
          emissiveIntensity={0}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {palette.isDark && (
        <sprite scale={[radius * 2.6, radius * 1.2, 1]}>
          <spriteMaterial
            ref={glowMat}
            map={glow}
            color={palette.neon}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}
    </group>
  );
}

function Pedestal({ hover, palette }: { hover: HoverRef; palette: HallPalette }) {
  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        hover.v++;
      }}
      onPointerOut={() => {
        hover.v--;
      }}
    >
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.25, 2.45, 0.6, 6]} />
        <meshStandardMaterial color={palette.base} roughness={0.92} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[2.05, 2.25, 0.06, 6]} />
        <meshStandardMaterial color={palette.baseTop} roughness={0.8} metalness={0.3} />
      </mesh>
      <NeonBand radius={2.27} y={0.585} height={0.055} delay={LIGHT_UP[1]} hover={hover} palette={palette} />
      <NeonBand radius={2.47} y={0.035} height={0.05} delay={LIGHT_UP[0]} hover={hover} palette={palette} />
    </group>
  );
}

/** projector beam rising from the glass slab, with drifting scanlines */
function Beam({ palette }: { palette: HallPalette }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    for (let y = 0; y < 256; y++) {
      const fade = Math.pow(1 - y / 255, 1.6); // canvas top maps to the beam's base: bright at the emitter, fading upward
      const line = y % 8 < 2 ? 1 : 0.55;
      ctx.fillStyle = `rgba(255,255,255,${(fade * line).toFixed(3)})`;
      ctx.fillRect(0, y, 8, 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }, dt) => {
    tex.offset.y -= dt * 0.08;
    const t = clock.elapsedTime;
    if (mat.current) {
      const on = clamp01((t - HOLO_DELAY + 0.3) / 0.6);
      mat.current.opacity = on * (palette.isDark ? 0.2 : 0.1) * (0.92 + 0.08 * Math.sin(t * 17));
    }
  });
  return (
    <mesh position={[0, 1.12, 0]}>
      <cylinderGeometry args={[1.3, 0.2, 2.1, 48, 1, true]} />
      <meshBasicMaterial
        ref={mat}
        map={tex}
        color={palette.neon}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={palette.isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/** levitating glass slab with its own neon rim, emitter and beam */
function GlassFrame({ hover, palette }: { hover: HoverRef; palette: HallPalette }) {
  const group = useRef<THREE.Group>(null);
  const glow = useGlowTexture();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = 1.45 + Math.sin(t * 0.8 + 1.3) * 0.07;
      group.current.rotation.y = Math.sin(t * 0.15) * 0.12;
    }
  });
  return (
    <group
      ref={group}
      position={[0, 1.45, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover.v++;
      }}
      onPointerOut={() => {
        hover.v--;
      }}
    >
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 0.16, 6]} />
        <meshPhysicalMaterial
          color={palette.glass}
          transmission={1}
          thickness={0.5}
          roughness={0.06}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
        />
      </mesh>
      <NeonBand radius={1.53} y={0} height={0.05} delay={LIGHT_UP[2]} hover={hover} palette={palette} />
      {/* emitter */}
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color={palette.neon} toneMapped={false} />
      </mesh>
      {palette.isDark && (
        <sprite position={[0, 0.1, 0]} scale={[1.1, 1.1, 1]}>
          <spriteMaterial map={glow} color={palette.neon} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      )}
      <Beam palette={palette} />
    </group>
  );
}

/** dashed rings on the floor turning slowly in opposite directions */
function FloorRings({ palette }: { palette: HallPalette }) {
  const rings = useMemo(
    () =>
      [3.15, 3.9, 5.2].map((r) => {
        const g = new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 181 }, (_, k) => V(Math.cos((k / 180) * TAU) * r, 0, Math.sin((k / 180) * TAU) * r))
        );
        const line = new THREE.Line(
          g,
          new THREE.LineDashedMaterial({
            color: palette.neon,
            dashSize: r * 0.09,
            gapSize: r * 0.06,
            transparent: true,
            opacity: palette.isDark ? 0.22 : 0.35,
          })
        );
        line.computeLineDistances();
        return line;
      }),
    [palette]
  );
  useEffect(
    () => () =>
      rings.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }),
    [rings]
  );
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    rings.forEach((l, i) => {
      l.rotation.y = t * (i % 2 ? -0.05 : 0.07);
      (l.material as THREE.LineDashedMaterial).opacity = (palette.isDark ? 0.22 : 0.35) * clamp01((t - 0.2 - i * 0.25) / 0.6);
    });
  });
  return (
    <group ref={group} position={[0, 0.01, 0]}>
      {rings.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

function Floor({ palette }: { palette: HallPalette }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[280, 60]}
        resolution={1024}
        mixBlur={1}
        mixStrength={palette.isDark ? 9 : 5}
        roughness={0.9}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={palette.floor}
        metalness={palette.isDark ? 0.5 : 0.2}
        mirror={palette.isDark ? 0.55 : 0.35}
      />
    </mesh>
  );
}

/** cinematic fly-in from high and far, settling into the orbit view */
const CAM_FROM = V(13, 9.5, 16);
const CAM_TO = V(6.4, 4.1, 7.4);
const TARGET = V(0, 2.1, 0);
function IntroCamera({ onDone }: { onDone: () => void }) {
  const { camera } = useThree();
  const t = useRef(0);
  const done = useRef(false);
  useFrame((_, dt) => {
    if (done.current) return;
    t.current = Math.min(1, t.current + dt / INTRO);
    const e = easeInOut(t.current);
    camera.position.lerpVectors(CAM_FROM, CAM_TO, e);
    // a little arc so it swings around instead of sliding
    camera.position.applyAxisAngle(V(0, 1, 0), (1 - e) * 0.6);
    camera.lookAt(TARGET);
    if (t.current >= 1) {
      done.current = true;
      onDone();
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */

export default function PedestalScene({
  palette = DEFAULT_PALETTE,
  exhibit = "mesh",
  onHologramClick,
  reducedMotion = false,
}: {
  palette?: HallPalette;
  exhibit?: ExhibitId;
  onHologramClick?: () => void;
  reducedMotion?: boolean;
}) {
  const hover = useRef<HoverRef>({ v: 0 }).current;
  const [ready, setReady] = useState(reducedMotion);
  const [auto, setAuto] = useState(true);
  const resumeTimer = useRef<number | null>(null);

  const onInteractStart = useCallback(() => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    setAuto(false);
  }, []);
  const onInteractEnd = useCallback(() => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setAuto(true), 4000);
  }, []);
  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: reducedMotion ? CAM_TO.toArray() : CAM_FROM.toArray(), fov: 38 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl, camera }) => {
        gl.localClippingEnabled = true;
        camera.lookAt(TARGET);
      }}
    >
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 14, 34]} />

      <ambientLight intensity={palette.isDark ? 0.18 : 0.5} />
      <spotLight position={[7, 10, 5]} angle={0.5} penumbra={1} intensity={palette.isDark ? 1.1 : 1.4} color={palette.soft} />
      <pointLight position={[-5, 3, -4]} intensity={0.5} color={palette.soft} />

      <Pedestal hover={hover} palette={palette} />
      <GlassFrame hover={hover} palette={palette} />
      <Hologram exhibit={exhibit} onClick={() => onHologramClick?.()} hover={hover} palette={palette} />
      <FloorRings palette={palette} />
      <Floor palette={palette} />

      <Sparkles
        count={80}
        scale={[14, 7, 14]}
        position={[0, 3.4, 0]}
        size={2}
        speed={0.22}
        opacity={palette.isDark ? 0.32 : 0.45}
        color={palette.neon}
      />

      {!ready && <IntroCamera onDone={() => setReady(true)} />}
      <OrbitControls
        enabled={ready}
        autoRotate={ready && auto}
        autoRotateSpeed={0.55}
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={TARGET}
        onStart={onInteractStart}
        onEnd={onInteractEnd}
      />
    </Canvas>
  );
}
