"use client";

import { useEffect, useState } from "react";

/**
 * Client-side pagination over an already-loaded array.
 * Pairs with the <Pagination /> UI component.
 *
 * @param items        the (filtered) array to paginate
 * @param itemsPerPage page size
 * @param resetKey     when this changes (filter/search/trash toggles),
 *                     the page resets to 1
 */
export function usePagination<T>(items: T[], itemsPerPage: number, resetKey?: string | number) {
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  // Keep the page in range if the data set shrinks
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const start = (safePage - 1) * itemsPerPage;

  return {
    page: safePage,
    totalPages,
    total,
    paginatedItems: items.slice(start, start + itemsPerPage),
    setPage,
  };
}
