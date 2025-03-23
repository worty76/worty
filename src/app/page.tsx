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
          Hello there! My name is Le Thanh Dat, and I am a Backend Developer
          with a strong passion for building scalable and efficient applications
          using Node.js.
        </h1>

        <div className="space-y-3">
          <p className="duration-1000">
            I enjoy working with various backend technologies and architectures,
            but my favorite stack revolves around Node.js, as it allows me to
            craft high-performance and real-time solutions. I believe in
            building APIs and services that are reliable, easy to maintain, and
            designed for growth.
          </p>

          <p className="duration-1000">
            I am always looking to collaborate with others and learn from the
            experiences of fellow developers. If you're interested in discussing
            tech, exploring new projects, or collaborating on backend-related
            challenges, feel free to reach out!
          </p>

          <p className="duration-1000">
            You can also connect with me via email at{" "}
            <a
              href="mailto:lethanhdat762003@gmail.com"
              className="hover:opacity-80 cursor-pointer secondary-color-text duration-1000"
            >
              lethanhdat762003@gmail.com
            </a>
          </p>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="duration-1000 secondary-color-text">My articles:</h2>
        <Blog />
      </section>

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
