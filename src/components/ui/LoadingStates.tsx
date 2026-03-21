"use client";

import { ReactNode } from "react";

interface LoadingSkeletonProps {
  count?: number;
  type?: "card" | "square";
}

export function LoadingSkeleton({ count = 4, type = "card" }: LoadingSkeletonProps) {
  if (type === "square") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white/5 rounded-xl overflow-hidden"
          style={{ minHeight: "280px" }}
        >
          <div className="aspect-video bg-white/10 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-white/10 rounded animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
}

export function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-4xl">{emoji}</span>
      </div>
      <h3 className="secondary-color-text font-semibold text-lg mb-2">{title}</h3>
      <p className="secondary-color-text opacity-60 text-sm">{description}</p>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text = "Loading..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin secondary-color-text`} />
      {text && <p className="secondary-color-text text-lg">{text}</p>}
    </div>
  );
}
