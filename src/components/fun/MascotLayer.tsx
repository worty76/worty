"use client";

import { SpriteMascot } from "./SpriteMascot";
import { useMascot } from "@/context/mascot-context";
import { usePathname } from "next/navigation";

export function MascotLayer() {
  const pathname = usePathname();
  const { characters, enabled } = useMascot();

  // the story page has its own character — no 2D mascots there or in admin
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/journey")) return null;

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
