"use client";

import { Profile } from "@/components/main/Profile";
import Blog from "./(blog)";

export default function Home() {
  return (
    <main className="py-5 px-5 w-[95%] max-w-[1100px] mx-auto">
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
    </main>
  );
}
