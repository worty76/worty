"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faHandshakeAngle,
  faImages,
  faMusic,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";

export default function Navbar() {
  const pathname = usePathname();
  const { isReversed, toggleTheme } = useTheme();

  // Define navigation links
  const navLinks = [
    { href: "/", icon: faHome, label: "Home" },
    { href: "/gallery", icon: faImages, label: "Gallery" },
    { href: "/support", icon: faHandshakeAngle, label: "Support" },
  ];

  // Get links to show (exclude current page)
  const visibleLinks = navLinks.filter((link) => link.href !== pathname);

  return (
    <nav className="w-full opacity-100 duration-1000 relative">
      <div className="justify-between px-4 mx-auto md:items-center flex md:px-8">
        <div className="flex items-center py-3">
          <button
            onClick={toggleTheme}
            className="primary-color-bg hover:opacity-80 font-bold py-2 px-4 rounded-xl duration-1000 secondary-color-text border secondary-color-border w-12 h-12 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            <FontAwesomeIcon
              icon={isReversed ? faMoon : faSun}
              style={{ color: "var(--color-primary-text)" }}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 py-3">
          {visibleLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="primary-color-bg hover:opacity-80 font-bold py-2 px-4 rounded-xl duration-1000 secondary-color-text border secondary-color-border w-12 h-12 flex items-center justify-center"
              aria-label={link.label}
            >
              <FontAwesomeIcon
                icon={link.icon}
                style={{ color: "var(--color-primary-text)" }}
              />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
