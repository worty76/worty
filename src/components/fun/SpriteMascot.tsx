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
  advanceFrame,
  characters,
  framePosition,
  type Character,
  type Direction,
} from "./sprites";

export interface SpriteHandle {
  play: (action: string) => void;
  resume: () => void;
}

interface Props {
  character?: Character;
  initialAction?: string;
  triggerAction?: string;
}

const DEFAULT_MARGIN = 40;

export const SpriteMascot = forwardRef<SpriteHandle, Props>(function SpriteMascot(
  { character = characters.kuroro, initialAction, triggerAction },
  ref,
) {
  const pathname = usePathname();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, dir: -1 as Direction });
  const stateRef = useRef({ name: character.idle, frame: character.actions[character.idle].start });
  const [dir, setDir] = useState<Direction>(-1);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);

  const margin = character.margin ?? DEFAULT_MARGIN;
  const { cellW, cellH } = character;

  useEffect(() => {
    pos.current.x = margin + cellW;
  }, [margin, cellW]);

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
    let acc = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const st = stateRef.current;
      const action = character.actions[st.name];
      if (!action) {
        raf = requestAnimationFrame(tick);
        return;
      }

      acc += dt * 1000;
      if (acc >= action.frameDuration) {
        acc = 0;
        stateRef.current = advanceFrame(st, action, character);
      }

      const cur = character.actions[stateRef.current.name];
      if (innerRef.current) {
        const { x, y } = framePosition(stateRef.current.frame, cellW, cellH, character.cols);
        innerRef.current.style.backgroundPosition = `${x}px ${y}px`;
      }

      const speed = cur?.speed ?? 0;
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
        if (outerRef.current) {
          outerRef.current.style.transform = `translateX(${p.x}px) scaleX(${p.dir === -1 ? -1 : 1})`;
        }
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
        transform: `translateX(${pos.current.x}px) scaleX(${dir === -1 ? -1 : 1})`,
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
