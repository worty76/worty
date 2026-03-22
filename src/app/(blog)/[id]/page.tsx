"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { StatusBadge, BlogStatus } from "@/components/ui/StatusBadge";

interface MyBlog {
  category: Array<string>;
  title: string;
  datetime: string;
  image: string;
  description: string;
  content: string;
  docId: string; // Firestore document ID
  prevState: null;
  readingTime?: string;
  status?: BlogStatus;
}

export default function Page({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<MyBlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable @next/next/no-img-element */

  useEffect(() => {
    async function fetchBlog() {
      try {
        // Use document ID directly - more efficient and reliable
        const blogDoc = await getDoc(doc(db, "blog", params.id));

        if (!blogDoc.exists()) {
          setError("Blog not found");
          return;
        }

        const blogData = {
          docId: blogDoc.id,
          ...blogDoc.data(),
        } as MyBlog;

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
          <pre className="rounded-md overflow-x-auto primary-color-bg">
            <code className="block whitespace-pre secondary-color-text text-sm font-mono">
              {children}
            </code>
          </pre>
        );
      }

      return (
        <code
          className="rounded text-sm secondary-color-text font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1({ children, ...props }) {
      return (
        <h1
          className="text-4xl font-bold secondary-color-text mt-8 mb-4 pb-3"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2({ children, ...props }) {
      return (
        <h2
          className="text-3xl font-bold secondary-color-text mt-7 mb-4 pb-2"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      return (
        <h3
          className="text-2xl font-bold secondary-color-text mt-6 mb-3"
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4({ children, ...props }) {
      return (
        <h4
          className="text-xl font-semibold secondary-color-text mt-5 mb-2"
          {...props}
        >
          {children}
        </h4>
      );
    },
    h5({ children, ...props }) {
      return (
        <h5
          className="text-lg font-semibold secondary-color-text mt-4 mb-2"
          {...props}
        >
          {children}
        </h5>
      );
    },
    h6({ children, ...props }) {
      return (
        <h6
          className="text-base font-semibold secondary-color-text mt-3 mb-2"
          {...props}
        >
          {children}
        </h6>
      );
    },
    p({ children, ...props }) {
      return (
        <p className="secondary-color-text leading-7 my-4" {...props}>
          {children}
        </p>
      );
    },
    a({ children, ...props }) {
      return (
        <a
          className="secondary-color-text underline hover:opacity-80 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul({ children, ...props }) {
      return (
        <ul
          className="list-disc list-outside secondary-color-text my-4 ml-6 space-y-2"
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol({ children, ...props }) {
      return (
        <ol
          className="list-decimal list-outside secondary-color-text my-4 ml-6 space-y-2"
          {...props}
        >
          {children}
        </ol>
      );
    },
    li({ children, ...props }) {
      return (
        <li className="secondary-color-text" {...props}>
          {children}
        </li>
      );
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote
          className="border-l-4 secondary-color-border pl-4 py-2 my-4 secondary-color-text italic opacity-80 bg-black/10 rounded-r"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    table({ children, ...props }) {
      return (
        <div className="overflow-x-auto my-6">
          <table
            className="min-w-full border-collapse border secondary-color-border"
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    thead({ children, ...props }) {
      return (
        <thead className="bg-black/20" {...props}>
          {children}
        </thead>
      );
    },
    tbody({ children, ...props }) {
      return <tbody {...props}>{children}</tbody>;
    },
    tr({ children, ...props }) {
      return (
        <tr className="border-b secondary-color-border" {...props}>
          {children}
        </tr>
      );
    },
    th({ children, ...props }) {
      return (
        <th
          className="border secondary-color-border px-4 py-3 secondary-color-text font-bold text-left"
          {...props}
        >
          {children}
        </th>
      );
    },
    td({ children, ...props }) {
      return (
        <td
          className="border secondary-color-border px-4 py-2 secondary-color-text"
          {...props}
        >
          {children}
        </td>
      );
    },
    img({ src, alt, ...props }: any) {
      const isCentered = props["data-align"] === "center" || props.className?.includes("text-center");

      return (
        <div className={isCentered ? "flex justify-center my-6" : "my-6"}>
          <img
            className="rounded-lg max-w-full h-auto border secondary-color-border shadow-md"
            loading="lazy"
            alt={alt || "Blog content image"}
            src={src}
            {...props}
          />
        </div>
      );
    },
    hr({ ...props }) {
      return (
        <hr
          className="my-8 border-t-2 secondary-color-border opacity-30"
          {...props}
        />
      );
    },
    strong({ children, ...props }) {
      return (
        <strong className="font-bold secondary-color-text" {...props}>
          {children}
        </strong>
      );
    },
    em({ children, ...props }) {
      return (
        <em className="italic secondary-color-text" {...props}>
          {children}
        </em>
      );
    },
    del({ children, ...props }) {
      return (
        <del
          className="line-through secondary-color-text opacity-70"
          {...props}
        >
          {children}
        </del>
      );
    },
    input({ ...props }: any) {
      if (props.type === "checkbox") {
        return (
          <input
            type="checkbox"
            disabled
            className="mr-2 cursor-default"
            {...props}
            s
          />
        );
      }
      return <input {...props} />;
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <main className="w-[100%] max-w-[1100px] mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {blog.status && blog.status !== "published" && (
              <StatusBadge status={blog.status} />
            )}
            <div className="flex flex-wrap gap-2">
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

      <div className="my-8 w-full">
        <div className="aspect-video w-full relative rounded-xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
          <Image
            src={blog.image}
            fill
            priority
            quality={95}
            className="object-cover"
            alt={blog.title}
          />
        </div>
      </div>

      <article className="prose prose-lg max-w-none w-full max-w-4xl mx-auto">
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
