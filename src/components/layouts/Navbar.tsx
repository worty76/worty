"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandshakeAngle,
  faCircleUser,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";

export default function Navbar() {
  const pathname = usePathname();
  const { isReversed, toggleTheme } = useTheme();

  return (
    <div>
      <nav className="w-full opacity-100 duration-1000 relative">
        <div className="justify-between px-4 mx-auto md:items-center flex md:px-8">
          <div>
            <div className="flex items-center justify-between py-3 md:py-3">
              <button
                onClick={toggleTheme}
                className="primary-color-bg hover:opacity-80 font-bold py-2 px-4 rounded-xl duration-1000 secondary-color-text border secondary-color-border w-12 h-12 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={isReversed ? faMoon : faSun}
                  style={{ color: "var(--color-primary-text)" }}
                />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between py-3 md:py-3">
              {pathname !== "/" ? (
                <Link
                  href={"/"}
                  className="primary-color-bg hover:opacity-80 font-bold py-2 px-4 rounded-xl duration-1000 secondary-color-text border secondary-color-border w-12 h-12 flex items-center justify-center"
                >
                  <FontAwesomeIcon
                    icon={faCircleUser}
                    style={{ color: "var(--color-primary-text)" }}
                  />
                </Link>
              ) : (
                <Link
                  href={"/support"}
                  className="primary-color-bg hover:opacity-80 font-bold py-2 px-4 rounded-xl duration-1000 secondary-color-text border secondary-color-border w-12 h-12 flex items-center justify-center"
                >
                  <FontAwesomeIcon
                    icon={faHandshakeAngle}
                    style={{ color: "var(--color-primary-text)" }}
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
