"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = "", noPadding = false }: CardProps) {
  return (
    <div className={`bg-white/5 backdrop-blur-md rounded-2xl border secondary-color-border overflow-hidden ${className}`}>
      {noPadding ? children : <div className="p-8">{children}</div>}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  emoji?: string;
}

export function CardHeader({ title, description, emoji }: CardHeaderProps) {
  return (
    <div className="px-8 py-6 border-b secondary-color-border">
      <h2 className="text-2xl font-bold secondary-color-text font-heading">
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h2>
      {description && (
        <p className="secondary-color-text opacity-60 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}

interface FilterButtonGroupProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterButtonGroup({ filters, activeFilter, onFilterChange }: FilterButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeFilter === filter
              ? "secondary-color-bg primary-color-text shadow-md"
              : "bg-white/5 secondary-color-text hover:bg-white/10"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
