"use client";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/**
 * Numbered pagination with prev/next and ellipsis for long ranges.
 * Renders nothing when there is only one page.
 */
export function Pagination({ page, totalPages, onChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build the page list: 1 … 4 5 6 … 12
  const pageNumbers: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    const isNear = Math.abs(i - page) <= 1;
    if (i === 1 || i === totalPages || isNear) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "…") {
      pageNumbers.push("…");
    }
  }

  const baseButton =
    "min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center";
  const idleButton = `${baseButton} secondary-color-text opacity-60 hover:opacity-100 hover:bg-[rgb(var(--primary-text-rgb)_/_0.08)]`;
  const disabledButton = `${baseButton} secondary-color-text opacity-30 cursor-not-allowed`;

  return (
    <nav className={`flex items-center justify-center gap-1.5 flex-wrap ${className}`} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={page === 1 ? disabledButton : idleButton}
      >
        <FaChevronLeft size={12} />
      </button>

      {pageNumbers.map((p, index) =>
        p === "…" ? (
          <span key={`ellipsis-${index}`} className="min-w-[1.5rem] text-center secondary-color-text opacity-40 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={
              p === page
                ? `${baseButton} secondary-color-bg primary-color-text shadow-md`
                : idleButton
            }
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={page === totalPages ? disabledButton : idleButton}
      >
        <FaChevronRight size={12} />
      </button>
    </nav>
  );
}
