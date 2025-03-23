"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { database } from "../../../firebase/config";

interface MyBlog {
  category: Array<string>;
  title: string;
  datetime: string;
  image: string;
  description: string;
  content: string;
  prevState: null;
  id: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<MyBlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const blogQuery = query(
          collection(database, "blog"),
          where("id", "==", params.id)
        );
        const blogDocs = await getDocs(blogQuery);

        if (blogDocs.empty) {
          setError("Blog not found");
          return;
        }

        const blogData = blogDocs.docs[0].data() as MyBlog;
        setBlog(blogData);
      } catch (err) {
        setError("Failed to fetch blog");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlog();
  }, [params.id]);

  if (isLoading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-20 bg-current opacity-20 rounded-full secondary-color-text"
              />
            ))}
          </div>

          <div className="space-y-3">
            <div className="h-10 w-3/4 bg-current opacity-20 rounded-lg secondary-color-text" />
            <div className="h-4 w-32 bg-current opacity-20 rounded secondary-color-text" />
          </div>

          <div className="aspect-w-16 aspect-h-9 bg-current opacity-20 rounded-xl secondary-color-text" />

          <div className="space-y-4">
            <div className="h-4 bg-current opacity-20 rounded w-full secondary-color-text" />
            <div className="h-4 bg-current opacity-20 rounded w-5/6 secondary-color-text" />
            <div className="h-4 bg-current opacity-20 rounded w-4/6 secondary-color-text" />
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Blog post not found</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <main className="w-[95%] max-w-[1100px] mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.category.map((item, index) => (
              <div
                key={index}
                className="px-3 py-1 primary-color-bg secondary-color-text border secondary-color-border
                          rounded-full text-sm font-medium hover:opacity-80 transition-all duration-1000"
              >
                {item}
              </div>
            ))}
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4 secondary-color-text duration-1000">
            {blog.title}
          </h1>
          <time className="secondary-color-text opacity-70 text-sm duration-1000">
            {new Date(blog.datetime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </main>

      <div className="my-8">
        <div className="aspect-w-16 aspect-h-9 relative rounded-xl overflow-hidden shadow-2xl">
          <Image
            src={blog.image}
            fill
            priority
            className="object-cover"
            alt={blog.title}
          />
        </div>
      </div>

      <article className="prose prose-lg max-w-none w-[95%] max-w-[800px] mx-auto">
        <p className="text-xl secondary-color-text italic text-center my-8 font-light duration-1000">
          {blog.description}
        </p>
        <div
          className="prose-headings:secondary-color-text prose-p:secondary-color-text prose-p:opacity-90 
                     prose-a:secondary-color-text hover:prose-a:opacity-80
                     prose-img:rounded-xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}
