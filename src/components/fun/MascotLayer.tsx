"use client";

import { SpriteMascot } from "./SpriteMascot";
import { useMascot } from "@/context/mascot-context";

export function MascotLayer() {
  const { characters, enabled } = useMascot();

  const active = Object.values(characters).filter((c) => enabled[c.id]);

  return (
    <>
      {active.map((c, i) => (
        <SpriteMascot
          key={c.id}
          character={c}
          startX={40 + c.cellW + i * (c.cellW + 24)}
        />
      ))}
    </>
  );
}
