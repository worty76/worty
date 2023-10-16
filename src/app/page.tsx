"use client"

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import author from "../../public/lethanhdat.jpg";
import Blog from "./blog";
import {
  faDiscord,
  faFacebookF,
  faInstagram,
  faSteam,
} from "@fortawesome/free-brands-svg-icons";
const uri = [
  {
    uri: "https://www.facebook.com/w0rzt/",
    icon: faDiscord,
  },
  {
    uri: "https://www.facebook.com/w0rzt/",
    icon: faFacebookF,
  },
  {
    uri: "https://www.instagram.com/wortttttz/",
    icon: faInstagram,
  },
  {
    uri: "https://steamcommunity.com/id/noway312312312/",
    icon: faSteam,
  },
];

export default function Home() {
  return (
    //mt-8 w-full - parents attributes used to be
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
          <p className="secondary-color-text text-sm pt-2">
            <i>&quot;Simplicity is the ultimate sophistication.&quot;</i>
          </p>
          {/* <button className="primary-color-bg hover:bg-amber-950 text-white font-bold py-2 px-4 rounded-xl duration-300 secondary-color-text border border-[#DDC6B6]/25 mt-2">
            support
          </button> */}
        </div>
      </div>

      <h1 className="my-10 text-2xl secondary-color-text">
        Hello there! My name is Le Thanh Dat. I am a React developer who loves
        to share open-source projects with people worldwide.
      </h1>
      <p className="secondary-color-text">
        Like many other developers, I always want to build applications that
        people can use. I have a deep affection for various technologies, but my
        favorite one is React since it was my first programming language.
      </p>
      <p className="secondary-color-text pt-5">
        I love connecting with people and learning about their community also
        have a keen interest in their past projects and endeavors.
      </p>
      <p className="secondary-color-text pt-5">
        In addition, if you want to collaborate with me in the future. Do not
        hesitate to shoot me an email at{" "}
        <span className="hover:bg-amber-950 duration-700 cursor-pointer">
          lethanhdat762003@gmail.com
        </span>
      </p>
      <p className="secondary-color-text pt-5">My articles:</p>

      <Blog />
    </main>
  );
}
