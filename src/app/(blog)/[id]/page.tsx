"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/config";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MyBlog {
  category: Array<string>;
  title: string;
  datetime: string;
  image: string;
  description: string;
  content: string;
  prevState: null;
  id: string;
  readingTime?: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<MyBlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const blogQuery = query(
          collection(db, "blog"),
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

  if (error) {
    return window.location.replace("/");
  }

  if (!blog) {
    return window.location.replace("/");
  }

  const markdownComponents: Components = {
    code({ inline, className, children, ...props }: any) {
      if (!inline) {
        return (
          <pre className="p-4 rounded-md overflow-x-auto my-4 bg-gray-100">
            <code className="block whitespace-pre secondary-color-text text-sm">
              {children}
            </code>
          </pre>
        );
      }

      return (
        <code
          className="px-1 py-0.5 rounded text-sm bg-gray-100 secondary-color-text"
          {...props}
        >
          {children}
        </code>
      );
    },
    a({ children, ...props }) {
      return (
        <a
          className="secondary-color-text underline hover:opacity-80 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote
          className="border-l-4 pl-4 my-6 italic secondary-color-text opacity-90"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    ul({ children, ...props }) {
      return (
        <ul
          className="list-disc pl-6 my-6 secondary-color-text opacity-90 space-y-2"
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol({ children, ...props }) {
      return (
        <ol
          className="list-decimal pl-6 my-6 secondary-color-text opacity-90 space-y-2"
          {...props}
        >
          {children}
        </ol>
      );
    },
    p({ children, ...props }) {
      return (
        <p
          className="secondary-color-text opacity-90 leading-relaxed mb-6"
          {...props}
        >
          {children}
        </p>
      );
    },
    h2({ children, ...props }) {
      return (
        <h2
          className="text-2xl font-semibold secondary-color-text mt-8 mb-4"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      return (
        <h3
          className="text-xl font-semibold secondary-color-text mt-6 mb-3"
          {...props}
        >
          {children}
        </h3>
      );
    },
    img({ ...props }: any) {
      return (
        <img
          className="rounded-xl shadow-lg my-6 max-w-full h-auto"
          loading="lazy"
          alt={props.alt || "Blog content image"}
          {...props}
        />
      );
    },
  };

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
            {blog.readingTime && <span> · {blog.readingTime} read</span>}
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
        <p className="text-lg secondary-color-text italic text-center my-8 font-light duration-1000">
          {blog.description}
        </p>
        <ReactMarkdown
          className="prose-headings:secondary-color-text prose-p:secondary-color-text prose-p:opacity-90 
                     prose-a:secondary-color-text hover:prose-a:opacity-80
                     prose-img:rounded-xl prose-img:shadow-lg
                     prose-p:text-justify prose-p:leading-relaxed
                     prose-headings:mt-8 prose-headings:mb-4
                     prose-p:mb-6 prose-ul:my-6 prose-li:my-2
                     prose-h2:text-2xl prose-h3:text-xl
                     prose-code:text-sm prose-pre:bg-gray-100
                     max-w-none"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {blog.content || ""}
        </ReactMarkdown>
      </article>

      <div className="mt-16 mb-8 text-center">
        <h3 className="text-xl font-semibold secondary-color-text mb-4">
          Did you enjoy this article?
        </h3>
        <p className="mb-6 secondary-color-text opacity-80">
          If you found this content helpful, consider supporting my work!
        </p>
        <Link
          href="/support"
          className="inline-block px-6 py-3 primary-color-bg secondary-color-text 
                     border secondary-color-border rounded-full font-medium 
                     hover:opacity-80 transition-all duration-500"
        >
          Support My Work
        </Link>
      </div>
    </div>
  );
}
