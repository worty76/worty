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
          {/* Skeleton for categories */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-20 bg-[#DDC6B6]/20 rounded-full" />
            ))}
          </div>

          {/* Skeleton for title */}
          <div className="space-y-3">
            <div className="h-10 w-3/4 bg-[#DDC6B6]/20 rounded-lg" />
            <div className="h-4 w-32 bg-[#DDC6B6]/20 rounded" />
          </div>

          {/* Skeleton for image */}
          <div className="aspect-w-16 aspect-h-9 bg-[#DDC6B6]/20 rounded-xl" />

          {/* Skeleton for content */}
          <div className="space-y-4">
            <div className="h-4 bg-[#DDC6B6]/20 rounded w-full" />
            <div className="h-4 bg-[#DDC6B6]/20 rounded w-5/6" />
            <div className="h-4 bg-[#DDC6B6]/20 rounded w-4/6" />
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
      <main>
        <div className="mb-6">
          {/* Category tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.category.map((item, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-[#DDC6B6]/10 text-[#DDC6B6] border border-[#DDC6B6]/20 
                          rounded-full text-sm font-medium hover:bg-[#DDC6B6]/20 transition-colors"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Title and date */}
          <h1 className="text-4xl font-bold leading-tight mb-4 text-[#DDC6B6]">
            {blog.title}
          </h1>
          <time className="text-[#DDC6B6]/70 text-sm">
            {new Date(blog.datetime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </main>

      {/* Image section */}
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

      {/* Article content */}
      <article className="prose prose-lg max-w-none">
        <p className="text-xl text-[#DDC6B6] italic text-center my-8 font-light">
          {blog.description}
        </p>
        <div
          className="prose-headings:text-[#DDC6B6] prose-p:text-[#DDC6B6]/90 
                     prose-a:text-[#DDC6B6] hover:prose-a:text-[#DDC6B6]/80
                     prose-img:rounded-xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}
