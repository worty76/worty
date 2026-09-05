"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logPageView } from "@/firebase/analytics";

/** Fires a GA page_view on every route change (incl. the first load). */
export function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    logPageView(pathname);
  }, [pathname]);

  return null;
}
