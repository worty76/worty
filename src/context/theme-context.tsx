"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface ThemeContextType {
  isReversed: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Keep in sync with the 400ms transition in globals.css (html.theme-transition)
const THEME_TRANSITION_MS = 400;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isReversed, setIsReversed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-preference");
      return saved === "reversed";
    }
    return false;
  });
  const themeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleTheme = () => {
    const root = document.documentElement;
    const newValue = !root.hasAttribute("data-theme");

    // Animate every element's theme colors at the same pace (see globals.css).
    // The reflow forces a style flush so the transition class is active before
    // the colors change — otherwise the swap happens in the same recalc and
    // elements snap instead of animating.
    root.classList.add("theme-transition");
    void root.offsetWidth;
    if (themeTimer.current) clearTimeout(themeTimer.current);
    themeTimer.current = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, THEME_TRANSITION_MS + 100);

    if (newValue) {
      root.setAttribute("data-theme", "reversed");
      localStorage.setItem("theme-preference", "reversed");
    } else {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme-preference", "default");
    }
    setIsReversed(newValue);
  };

  // Set initial theme (before-paint script in layout.tsx already handles the
  // no-flash case; this keeps React state and the DOM attribute in sync)
  useEffect(() => {
    if (isReversed) {
      document.documentElement.setAttribute("data-theme", "reversed");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isReversed]);

  useEffect(() => {
    return () => {
      if (themeTimer.current) clearTimeout(themeTimer.current);
      document.documentElement.classList.remove("theme-transition");
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ isReversed, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
