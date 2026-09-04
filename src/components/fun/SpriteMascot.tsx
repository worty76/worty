"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  characters,
  framePosition,
  State,
  type Character,
  type Direction,
  type StateName,
} from "./sprites";

export interface SpriteHandle {
  play: (action: string) => void;
  resume: () => void;
}

interface Props {
  character?: Character;
  initialAction?: string;
  triggerAction?: string;
  startX?: number;
}

const DEFAULT_MARGIN = 40;

// The full move list in sprite-sheet order — performed start to finish, looping
const TOUR: StateName[] = [
  State.idle,
  State.walk,
  State.dash,
  State.flyKick,
  State.lunge,
  State.kickCombo,
  State.sword,
  State.skill,
];

// how long looping actions hold before the tour moves on (ms)
const LOOP_HOLD: Partial<Record<StateName, number>> = {
  [State.idle]: 1400,
  [State.walk]: 2500,
};

export const SpriteMascot = forwardRef<SpriteHandle, Props>(function SpriteMascot(
  { character = characters.kuroro, initialAction, triggerAction, startX },
  ref,
) {
  const pathname = usePathname();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, dir: -1 as Direction });
  const stateRef = useRef({ name: character.idle, frame: character.actions[character.idle].start });
  const tourIndex = useRef(0);
  const holdUntil = useRef(0);
  const [dir, setDir] = useState<Direction>(-1);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);

  const margin = character.margin ?? DEFAULT_MARGIN;
  const { cellW, cellH } = character;
  const initialX = startX ?? margin + cellW;

  const paint = () => {
    if (!innerRef.current) return;
    const { x, y } = framePosition(stateRef.current.frame, cellW, cellH, character.cols);
    innerRef.current.style.backgroundPosition = `${x}px ${y}px`;
  };

  const applyTransform = () => {
    if (!outerRef.current) return;
    // sprites face right natively — mirror when moving left
    outerRef.current.style.transform = `translateX(${pos.current.x}px) scaleX(${pos.current.dir})`;
  };

  // place the character at its start position (and keep it there on prop changes)
  useEffect(() => {
    pos.current.x = initialX;
    applyTransform();
  }, [initialX]);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const small = window.matchMedia("(max-width: 639px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setHidden(small.matches);
      setReduced(motion.matches);
      if (small.matches) {
        console.info("[mascot] hidden: viewport is under 640px");
      } else if (motion.matches) {
        console.info(
          "[mascot] frozen on purpose: prefers-reduced-motion is ON in your OS/browser"
        );
      }
    };
    update();
    small.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      small.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, [pathname]);

  useEffect(() => {
    if (hidden || reduced) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    // enter a tour action: reset the frame pointer and schedule its end
    const enter = (index: number, now: number) => {
      tourIndex.current = index;
      const name = TOUR[index % TOUR.length];
      const action = character.actions[name];
      const frames = action.end - action.start + 1;
      stateRef.current = { name, frame: action.start };
      acc = 0;
      holdUntil.current = now + (action.loop ? LOOP_HOLD[name] ?? 1500 : frames * action.frameDuration);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const name = TOUR[tourIndex.current % TOUR.length];
      const action = character.actions[name];
      if (!action) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (stateRef.current.name !== name) {
        // returning from an imperative play()/trigger — resync to the tour
        stateRef.current = { name, frame: action.start };
        holdUntil.current = now + (action.loop ? LOOP_HOLD[name] ?? 1500 : (action.end - action.start + 1) * action.frameDuration);
        acc = 0;
      }

      // rotate to the next action once the hold or frames run out
      if (now >= holdUntil.current) {
        enter(tourIndex.current + 1, now);
        // re-schedule BEFORE returning, or the rAF chain dies here and the
        // sprite freezes forever
        raf = requestAnimationFrame(tick);
        return;
      }

      acc += dt * 1000;
      if (acc >= action.frameDuration) {
        acc = 0;
        // advance; loop actions wrap, non-loop actions hold their last frame
        if (action.loop && stateRef.current.frame >= action.end) {
          stateRef.current.frame = action.start;
        } else if (stateRef.current.frame < action.end) {
          stateRef.current.frame += 1;
        }
        paint();
      }

      // moving actions carry the character; walls flip its direction
      const speed = action.speed ?? 0;
      if (speed > 0) {
        const p = pos.current;
        p.x += p.dir * speed * dt;
        const max = window.innerWidth - margin - cellW;
        let flipped = false;
        if (p.x >= max) {
          p.x = max;
          p.dir = -1;
          flipped = true;
        }
        if (p.x <= margin) {
          p.x = margin;
          p.dir = 1;
          flipped = true;
        }
        if (flipped) setDir(p.dir);
        applyTransform();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hidden, reduced, character, cellW, cellH, margin]);

  useImperativeHandle(ref, () => ({
    play: (name: string) => {
      const action = character.actions[name];
      if (action) stateRef.current = { name, frame: action.start };
    },
    resume: () => {
      const idle = character.actions[character.idle];
      stateRef.current = { name: idle.name, frame: idle.start };
    },
  }), [character]);

  const setInitial = (action?: string) => {
    const target = action ?? initialAction ?? character.idle;
    const a = character.actions[target] ?? character.actions[character.idle];
    stateRef.current = { name: a.name, frame: a.start };
  };

  useEffect(() => {
    setInitial(initialAction);
    pos.current.x = initialX;
    applyTransform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id, initialAction]);

  if (pathname?.startsWith("/admin") || hidden) return null;

  const onTrigger = triggerAction && character.actions[triggerAction]
    ? () => {
        const a = character.actions[triggerAction];
        stateRef.current = { name: a.name, frame: a.start };
      }
    : undefined;

  return (
    <div
      ref={outerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: cellW,
        height: cellH,
        zIndex: 30,
        pointerEvents: "none",
        transform: `translateX(${pos.current.x}px) scaleX(${dir})`,
      }}
    >
      <div
        ref={innerRef}
        title={character.title}
        onClick={onTrigger}
        className="kuroro-frame"
        style={{
          width: cellW,
          height: cellH,
          backgroundImage: `url(${character.src})`,
          backgroundPosition: reduced ? "0 0" : undefined,
          cursor: onTrigger ? "pointer" : "default",
          pointerEvents: onTrigger ? "auto" : "none",
        }}
      />
    </div>
  );
});
