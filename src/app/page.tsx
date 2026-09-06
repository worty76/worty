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
          Hi, I&apos;m Dat - a Go developer passionate about distributed systems.
        </h1>

        <div className="space-y-3">
          <p className="duration-1000">
            I&apos;m just a normal guy with no fancy achievements or
            extraordinary background - just someone who enjoys learning,
            building things, and becoming a little better every day.
          </p>

          <p className="duration-1000">
            I&apos;m particularly interested in distributed systems, where
            multiple services, machines, and components have to work together
            reliably at scale. I enjoy thinking about how systems communicate,
            handle failures, process data, and remain resilient as they grow.
          </p>

          <p className="duration-1000">
            My favorite stack revolves around Go, especially for building
            high-performance backend services, APIs, message-driven systems,
            and real-time applications. I&apos;m always curious about topics
            like microservices, event-driven architecture, messaging,
            concurrency, observability, and system scalability.
          </p>
          <p className="duration-1000">
            I&apos;m always looking to learn from other developers, explore
            interesting technical problems, and collaborate on projects
            involving backend engineering and distributed systems. If
            you&apos;re interested in discussing systems, exploring new ideas,
            or building something together, feel free to reach out.
          </p>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="duration-1000 secondary-color-text">My articles:</h2>
        <Blog />
      </section>

      {/* Systems link */}
      <Link
        href="/systems"
        className="fixed bottom-44 right-8 flex items-center gap-2 group secondary-color-text duration-1000"
      >
        <span className="hidden md:block text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-1000">
          how I see distributed systems
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
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="8.5" y="14" width="7" height="7" rx="1" />
          <path d="M6.5 10v2a2 2 0 0 0 2 2h0" />
          <path d="M17.5 10v2a2 2 0 0 1-2 2h0" />
        </svg>
      </Link>

      {/* Story link */}
      <Link
        href="/journey"
        className="fixed bottom-32 right-8 flex items-center gap-2 group secondary-color-text duration-1000"
      >
        <span className="hidden md:block text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-1000">
          walk through my story
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
