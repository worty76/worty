"use client";

import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { app, database } from "../../firebase/config";
import { useEffect, useState } from "react";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  async function getBlogs() {
    let blogsArr: any[] = [];
    const blogs = await getDocs(collection(database, "blog"));
    blogs.docs.map((doc) => {
      blogsArr.push(doc.data());
    });
    setPosts(blogsArr);
  }

  useEffect(() => {
    getBlogs();
  }, []);

  return (
    // justify-items-center parents attribute
    <div className="grid grid-cols-2 gap-4 place-content-center pt-10">
      {posts.map((post) => (
        <Link href={"blog/" + post["id"]} key={post["id"]}>
          <div className="flex max-w-xl flex-col items-start justify-between rounded-md border border-[#DDC6B6]/25 p-5 cursor-pointer hover:border-[#DDC6B6]/50">
            <div className="flex items-center gap-x-4 text-xs">
              <time 
                dateTime={post["datetime"]}
                className="secondary-color-text"
              >
                {post["datetime"]}
              </time>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-lg font-semibold leading-6 secondary-color-text">
                <span className="group transition duration-300 inline-block">
                  <p className="line-clamp-1">{post["title"]}</p>
                  <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 secondary-color-bg" />
                </span>
              </h3>
              <p className="mt-5 line-clamp-1 text-sm leading-6 secondary-color-text">
                {post["description"]}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
