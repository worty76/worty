"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import author from "../../public/images/me.jpg";
import Blog from "./blog";
import {
  faFacebookF,
  faInstagram,
  faSteam,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const uri = [
  {
    uri: "https://www.facebook.com/w0rzt/",
    icon: faFacebookF,
  },
  {
    uri: "https://www.instagram.com/wortttttz/",
    icon: faInstagram,
  },
  {
    uri: "https://steamcommunity.com/id/worty76/",
    icon: faSteam,
  },
  {
    uri: "https://www.github.com/Worty76",
    icon: faGithub,
  },
];

export default function Home() {
  return (
    // mt-8 w-full - parents attributes used to be
    <main className="min-h-screen py-5 px-5">
      <div className="flex items-center">
        <Image
          src={author}
          width={150}
          height={150}
          alt="Picture of the author"
          className="rounded-xl md:hover:w-64 duration-700"
        />
        <div className="pl-5">
          <div className="flex justify-around w-32">
            {uri.map((url, index) => {
              return (
                <a href={url["uri"]} key={index}>
                  <FontAwesomeIcon
                    key={index}
                    icon={url["icon"]}
                    className="cursor-pointer duration-700 rounded-md"
                    style={{ color: "#ddc6b6", width: "20px", height: "20px" }}
                  />
                </a>
              );
            })}
          </div>
          <p className="text-sm pt-2">
            <i>&quot;Simplicity is the ultimate sophistication.&quot;</i>
          </p>
        </div>
      </div>

      <h1 className="py-10 text-2xl">
        Hello there! My name is Le Thanh Dat, and I am a Backend Developer with
        a strong passion for building scalable and efficient applications using
        Node.js.
      </h1>
      <p>
        I enjoy working with various backend technologies and architectures, but
        my favorite stack revolves around Node.js, as it allows me to craft
        high-performance and real-time solutions. I believe in building APIs and
        services that are reliable, easy to maintain, and designed for growth.
      </p>
      <p className="py-3">
        I am always looking to collaborate with others and learn from the
        experiences of fellow developers. If you're interested in discussing
        tech, exploring new projects, or collaborating on backend-related
        challenges, feel free to reach out!
      </p>
      <p>
        You can also connect with me via email at{" "}
        <span className="hover:bg-amber-950 duration-700 cursor-pointer">
          lethanhdat762003@gmail.com
        </span>
      </p>
      <p className="pt-5">My articles:</p>
      <Blog />
    </main>
  );
}
