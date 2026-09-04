"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { characters } from "@/components/fun/sprites";

const STORAGE_KEY = "mascot-preference";

interface MascotContextType {
  characters: typeof characters;
  enabled: Record<string, boolean>;
  toggle: (id: string) => void;
  setEnabled: (id: string, value: boolean) => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

const defaults = (): Record<string, boolean> =>
  Object.keys(characters).reduce<Record<string, boolean>>((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState<Record<string, boolean>>(defaults);

  // Hydrate from storage after mount to avoid server/client mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setEnabledState((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(characters)) {
          if (typeof parsed[id] === "boolean") next[id] = parsed[id];
        }
        return next;
      });
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persist = (next: Record<string, boolean>) => {
    setEnabledState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures (private mode etc.)
    }
  };

  const toggle = (id: string) => {
    if (!(id in characters)) return;
    persist({ ...enabled, [id]: !enabled[id] });
  };

  const setEnabled = (id: string, value: boolean) => {
    if (!(id in characters)) return;
    persist({ ...enabled, [id]: value });
  };

  return (
    <MascotContext.Provider value={{ characters, enabled, toggle, setEnabled }}>
      {children}
    </MascotContext.Provider>
  );
}

export const useMascot = () => {
  const context = useContext(MascotContext);
  if (context === undefined) {
    throw new Error("useMascot must be used within a MascotProvider");
  }
  return context;
};
