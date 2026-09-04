"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaPaw, FaTimes } from "react-icons/fa";
import { useMascot } from "@/context/mascot-context";
import type { Character } from "@/components/fun/sprites";

/** Static preview of a character's idle pose, cropped from its sheet */
function MascotPreview({ c }: { c: Character }) {
  const scale = 0.5;
  const idle = c.actions[c.idle];
  const px = (idle.start % c.cols) * c.cellW * scale;
  const py = Math.floor(idle.start / c.cols) * c.cellH * scale;
  return (
    <span
      aria-hidden="true"
      className="kuroro-frame shrink-0 rounded-lg bg-white/[0.06] border border-[rgb(var(--primary-text-rgb)_/_0.1)]"
      style={{
        width: c.cellW * scale,
        height: c.cellH * scale,
        backgroundImage: `url(${c.src})`,
        backgroundSize: `${c.cols * c.cellW * scale}px auto`,
        backgroundPosition: `-${px}px -${py}px`,
      }}
    />
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
        on ? "secondary-color-bg" : "bg-white/20"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </span>
  );
}

export function MascotToolbar() {
  const pathname = usePathname();
  const { characters, enabled, toggle } = useMascot();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  const roster = Object.values(characters);
  const activeCount = roster.filter((c) => enabled[c.id]).length;

  return (
    <div className="fixed left-5 bottom-5 z-50">
      {open && (
        <div className="absolute bottom-[60px] left-0 w-64 rounded-2xl border border-[rgb(var(--primary-text-rgb)_/_0.15)] bg-[var(--color-surface)] shadow-2xl p-3 animate-mascot-pop">
          <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-[rgb(var(--primary-text-rgb)_/_0.1)]">
            <span className="font-heading font-semibold text-sm secondary-color-text">
              Mascots
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 secondary-color-text opacity-50 hover:opacity-100 transition-opacity"
            >
              <FaTimes size={13} />
            </button>
          </div>

          <div className="space-y-1">
            {roster.map((c) => {
              const on = !!enabled[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <MascotPreview c={c} />
                  <span className="flex-1 text-sm secondary-color-text">{c.title}</span>
                  <Toggle on={on} />
                </button>
              );
            })}
          </div>

          <p className="px-1 pt-2 text-[11px] secondary-color-text opacity-40">
            {activeCount > 0
              ? "Mascots are wandering the site"
              : "Enable one and it will wander the site"}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Mascot settings"
        title="Mascot settings"
        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
          open
            ? "secondary-color-bg primary-color-text shadow-lg"
            : "bg-white/[0.06] secondary-color-text border border-[rgb(var(--primary-text-rgb)_/_0.15)] hover:bg-white/[0.1] hover:border-[rgb(var(--primary-text-rgb)_/_0.3)]"
        }`}
      >
        <FaPaw size={18} />
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full secondary-color-bg primary-color-text text-[10px] font-bold flex items-center justify-center border border-[rgb(var(--primary-bg-rgb)_/_0.8)]">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}
