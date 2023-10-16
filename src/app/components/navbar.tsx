"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshakeAngle } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  return (
    <div>
      <nav className="w-full opacity-100 duration-700 relative">
        {/* lg:max-w-7xl */}
        <div className="justify-between px-4 mx-auto md:items-center flex md:px-8">
          <div>
            <div className="flex items-center justify-between py-3 md:py-3">
              <p className="max-sm:text-sm max-sm:text-sm">
                {/* &#169; Made by Le Thanh Dat */}
                {/* <button
                  className="primary-color-bg hover:bg-amber-950 text-white font-bold py-2 px-4 rounded-xl duration-300 secondary-color-text border border-[#DDC6B6]/25"
                >
                  <FontAwesomeIcon icon={faSun} size="1x" />
                </button> */}
              </p>
            </div>
          </div>
          <div>
            {/* max-sm:hidden max-md:hidden : hide on smartphone */}
            <div className="flex items-center justify-between py-3 md:py-3">
              <Link
                href={"/support"}
                className="primary-color-bg hover:bg-[#FFF1E6] font-bold py-2 px-4 rounded-xl duration-300 secondary-color-text border border-[#DDC6B6]/25"
              >
                <FontAwesomeIcon icon={faHandshakeAngle} style={{color: "#ddc6b6"}} />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
