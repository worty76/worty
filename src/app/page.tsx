"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import author from "../../public/images/me.jpg";
import Blog from "./(blog)";
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
    <div className="py-5 px-5 w-[95%] max-w-[1100px] mx-auto">
      <div className="flex items-center">
        <Image
          src={author}
          width={150}
          height={150}
          alt="Picture of the author"
          className="rounded-xl md:hover:w-64 duration-1000"
        />
        <div className="pl-5">
          <div className="flex justify-around w-32">
            {uri.map((url, index) => {
              return (
                <a href={url["uri"]} key={index}>
                  <FontAwesomeIcon
                    key={index}
                    icon={url["icon"]}
                    className="cursor-pointer duration-1000 rounded-md hover:opacity-80"
                    style={{
                      color: "var(--color-primary-text)",
                      width: "20px",
                      height: "20px",
                    }}
                  />
                </a>
              );
            })}
          </div>
          <p className="text-sm pt-2 duration-1000">
            <i>&quot;Simplicity is the ultimate sophistication.&quot;</i>
          </p>
        </div>
      </div>

      <h1 className="py-10 text-2xl duration-1000">
        Hello there! My name is Le Thanh Dat, and I am a Backend Developer with
        a strong passion for building scalable and efficient applications using
        Node.js.
      </h1>
      <p className="duration-1000">
        I enjoy working with various backend technologies and architectures, but
        my favorite stack revolves around Node.js, as it allows me to craft
        high-performance and real-time solutions. I believe in building APIs and
        services that are reliable, easy to maintain, and designed for growth.
      </p>
      <p className="py-3 duration-1000">
        I am always looking to collaborate with others and learn from the
        experiences of fellow developers. If you're interested in discussing
        tech, exploring new projects, or collaborating on backend-related
        challenges, feel free to reach out!
      </p>
      <p className="duration-1000">
        You can also connect with me via email at{" "}
        <span className="hover:opacity-80 cursor-pointer secondary-color-text duration-1000">
          lethanhdat762003@gmail.com
        </span>
      </p>
      <p className="pt-5 duration-1000">My articles:</p>
      <Blog />
    </div>
  );
}
