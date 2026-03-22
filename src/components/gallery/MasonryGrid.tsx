"use client";

import { ReactNode } from "react";

interface MasonryGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    xlDesktop?: number;
  };
  gap?: string;
  className?: string;
}

/**
 * Masonry grid layout using CSS columns
 * Items will flow naturally and fill available space
 */
export function MasonryGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "1rem",
  className = "",
}: MasonryGridProps) {
  const mobileCols = columns.mobile || 1;
  const tabletCols = columns.tablet || 2;
  const desktopCols = columns.desktop || 3;
  const xlDesktopCols = columns.xlDesktop || desktopCols;

  return (
    <div
      className={`masonry-grid ${className}`}
      style={{
        columnCount: mobileCols,
        columnGap: gap,
      }}
    >
      <style>{`
        .masonry-grid {
          column-count: ${mobileCols};
          column-gap: ${gap};
        }
        @media (min-width: 640px) {
          .masonry-grid {
            column-count: ${tabletCols};
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: ${desktopCols};
          }
        }
        @media (min-width: 1280px) {
          .masonry-grid {
            column-count: ${xlDesktopCols};
          }
        }
        .masonry-grid > * {
          break-inside: avoid;
          margin-bottom: ${gap};
        }
      `}</style>
      {children}
    </div>
  );
}
