"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { app, database } from "../../../firebase/config";

export default function Page({ params }: { params: { slug: string } }) {
  const [blog, setBlog] = useState();

  async function getBlogs() {
    const blogs = await getDocs(collection(database, "blog"));
    blogs.docs.map((doc) => {
      if (doc.data().id == params.id) {
        setBlog(doc.data());
      }
    });
  }

  useEffect(() => {
    getBlogs();
  }, []);

  return (
    <div>
      <main>
        <div className="secondary-color-text flex">
          {blog?.["category"]?.map((item: string, index: number) => {
            return (
              <div
                key={index}
                className="m-1 p-1 border border-[#DDC6B6]/50 rounded-md"
              >
                {item}
              </div>
            );
          })}
        </div>
        <h1 className="my-5 text-4xl secondary-color-text font-bold">
          {blog?.["title"]}
        </h1>
        <p className="secondary-color-text">Date: {blog?.["datetime"]}</p>
      </main>
      <div className="w-full justify-center flex py-5 px-5">
        {blog ? (
          <Image
            src={blog?.["image"]}
            width={1300}
            height={240}
            quality={100}
            priority
            className="rounded-md shadow-lg outline outline-1 outline-body-800 object-cover wide-media overflow-hidden object-fit-cover h-auto"
            alt="imageAttributes"
          />
        ) : (
          ""
        )}
      </div>
      <article className="lg:px-0 larger-line-height text-xl leading-10 my-2xl leading-looser w-full px-5">
        <p className="py-10 text-2xl text-[#BBB0A4] text-center">
          {blog?.["description"]}
        </p>
        <div
          className="secondary-color-text pb-10"
          dangerouslySetInnerHTML={{ __html: blog?.["content"] }}
        ></div>
      </article>
    </div>
  );
}
