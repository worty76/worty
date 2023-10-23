"use client"

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import author from "../../public/images/me.jpg";
import Blog from "./blog";
import {
  faFacebookF,
  faInstagram,
  faSteam,
  faGithub
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
        Hello there! My name is Le Thanh Dat. I am a React developer who loves
        to share open-source projects with people worldwide.
      </h1>
      <p>
        Like many other developers, I always want to build applications that
        people can use. I have a deep affection for various technologies, but my
        favorite one is React since it was my first programming language.
      </p>
      <p className="py-3">
        I love connecting with people and learning about their community also
        have a keen interest in their past projects and endeavors.
      </p>
      <p>
        In addition, if you want to collaborate with me in the future. Do not
        hesitate to shoot me an email at {" "}
        <span className="hover:bg-amber-950 duration-700 cursor-pointer">
          lethanhdat762003@gmail.com
        </span>
      </p>
      <p className="pt-5">My articles:</p>
      <Blog />
    </main>
  );
}
