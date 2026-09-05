"use client";

import { Profile } from "@/components/main/Profile";
import Blog from "./(blog)";
import Link from "next/link";

export default function Home() {
  return (
    <main className="py-5 px-5 w-[95%] max-w-[1100px] mx-auto relative">
      <Profile />

      <section>
        <h1 className="py-7 text-2xl duration-1000">
          Hi, I&apos;m Dat - a Go developer passionate about building scalable, efficient applications.
        </h1>

        <div className="space-y-3">
          <p className="duration-1000">
            I&apos;m just a normal guy with no fancy achievements or extraordinary
            background - just someone trying to grow, learn, and become a little
            better every single day. I enjoy working with various backend
            technologies and architectures, but my favorite stack revolves around
            Go, as it allows me to craft high-performance and real-time solutions.
            I believe in building APIs and services that are reliable, easy to
            maintain, and designed for growth.
          </p>

          <p className="duration-1000">
            I am always looking to collaborate with others and learn from the
            experiences of fellow developers. If you're interested in discussing
            tech, exploring new projects, or collaborating on backend-related
            challenges, feel free to reach out!
          </p>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="duration-1000 secondary-color-text">My articles:</h2>
        <Blog />
      </section>

      {/* Journey link */}
      <Link
        href="/timeline"
        className="fixed bottom-20 right-8 flex items-center gap-2 group secondary-color-text duration-1000"
      >
        <span className="hidden md:block text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-1000">
          my journey
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transform transition-transform duration-1000 group-hover:translate-x-1 hidden md:block "
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>

      <Link
        href="/music"
        className="fixed bottom-8 right-8 flex items-center gap-2 group secondary-color-text duration-1000"
      >
        <span className="hidden md:block text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-1000">
          my favorite musics
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transform transition-transform duration-1000 group-hover:translate-x-1 hidden md:block "
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
    </main>
  );
}
