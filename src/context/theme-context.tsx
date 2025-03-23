"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isReversed: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isReversed, setIsReversed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-preference");
      return saved === "reversed";
    }
    return false;
  });

  const toggleTheme = () => {
    setIsReversed((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.setAttribute("data-theme", "reversed");
        localStorage.setItem("theme-preference", "reversed");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme-preference", "default");
      }
      return newValue;
    });
  };

  // Set initial theme
  useEffect(() => {
    if (isReversed) {
      document.documentElement.setAttribute("data-theme", "reversed");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isReversed]);

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
