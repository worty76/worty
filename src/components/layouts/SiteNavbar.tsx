"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

/**
 * The public navbar duplicates the admin sidebar, so it hides itself
 * on /admin routes. Client wrapper so the root layout can stay a server
 * component (required for metadata exports).
 */
export function SiteNavbar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar />;
}
