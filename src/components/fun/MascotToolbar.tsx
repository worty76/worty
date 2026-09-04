"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaPaw, FaTimes } from "react-icons/fa";
import { useMascot } from "@/context/mascot-context";

const fabStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--color-surface)",
  color: "var(--color-primary-text)",
  border: "1px solid rgb(var(--primary-text-rgb) / 0.15)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  cursor: "pointer",
};

const panelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 60,
  left: 0,
  width: 220,
  background: "var(--color-surface)",
  color: "var(--color-primary-text)",
  borderRadius: 12,
  padding: "12px 14px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  border: "1px solid rgb(var(--primary-text-rgb) / 0.15)",
};

export function MascotToolbar() {
  const pathname = usePathname();
  const { characters, enabled, toggle } = useMascot();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div style={{ position: "fixed", left: 20, bottom: 20, zIndex: 50 }}>
      {open && (
        <div style={panelStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>Mascots</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 2 }}
            >
              <FaTimes size={14} />
            </button>
          </div>
          {Object.values(characters).map((c) => (
            <label
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={!!enabled[c.id]}
                onChange={() => toggle(c.id)}
                style={{ accentColor: "var(--color-primary-text)" }}
              />
              {c.title}
            </label>
          ))}
        </div>
      )}
      <button style={fabStyle} onClick={() => setOpen((o) => !o)} aria-label="Toggle mascots">
        <FaPaw size={20} />
      </button>
    </div>
  );
}
