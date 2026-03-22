"use client";

import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useEffect, useState, memo, useRef } from "react";
import { BlogCardSkeleton } from "@/components/blog/BlogCardSkeleton";
import { StatusBadge, BlogStatus } from "@/components/ui/StatusBadge";
import { annotate } from "rough-notation";

interface BlogPost {
  docId: string;
  title: string;
  description: string;
  datetime: string;
  readingTime?: string;
  status?: BlogStatus;
}

// Format date like "5 days ago" similar to xetera.dev
function formatDistance(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `Posted ${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }
  return "Posted just now";
}

const BlogCard = memo(({ post }: { post: BlogPost }) => {
  const { docId, title, datetime, readingTime, status } = post;

  const isPublished = status === "published";
  const titleRef = useRef<HTMLParagraphElement>(null);
  const annotationRef = useRef<ReturnType<typeof annotate> | null>(null);

  const handleMouseEnter = () => {
    if (!titleRef.current) return;

    // Use a computed color that matches the current theme
    const testElement = document.createElement("div");
    testElement.className = "secondary-color-text";
    document.body.appendChild(testElement);
    const color = getComputedStyle(testElement).color;
    document.body.removeChild(testElement);

    annotationRef.current = annotate(titleRef.current, {
      type: "underline",
      color: color,
      padding: 2,
      strokeWidth: 2,
      animationDuration: 400,
    });

    annotationRef.current.show();
  };

  const handleMouseLeave = () => {
    if (annotationRef.current) {
      annotationRef.current.remove();
      annotationRef.current = null;
    }
  };

  return (
    <Link
      href={`/${docId}`}
      className="flex flex-col gap-2 group transition-transform duration-300 transform-gpu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 className="article-title text-xl font-heading font-semibold leading-5 secondary-color-text transition-colors duration-1000">
        <span ref={titleRef} className="inline-block">
          {title}
        </span>
        {!isPublished && status && (
          <span className="ml-2">
            <StatusBadge status={status} size="sm" />
          </span>
        )}
      </h2>
      <div className="flex items-center gap-2 text-sm secondary-color-text opacity-60 transition-colors duration-1000">
        <time dateTime={datetime}>{formatDistance(datetime)}</time>
        {readingTime && (
          <>
            <span>·</span>
            <span>{readingTime} read</span>
          </>
        )}
      </div>
    </Link>
  );
});

BlogCard.displayName = "BlogCard";

export default function Blog() {
  const [state, setState] = useState({
    posts: [] as BlogPost[],
    isLoading: true,
    error: null as string | null,
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsCollection = collection(db, "blog");
        const blogsSnapshot = await getDocs(blogsCollection);
        const blogsData = blogsSnapshot.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        })) as BlogPost[];

        setState((prev) => ({ ...prev, posts: blogsData, isLoading: false }));
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to load blog posts",
          isLoading: false,
        }));
      }
    };

    fetchBlogs();
  }, []);

  if (state.isLoading) {
    return (
      <div className="w-full max-w-4xl px-4 py-12">
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="w-full max-w-4xl px-4 py-12">
        <div className="text-red-500">{state.error}</div>
      </div>
    );
  }

  if (!state.posts.length) {
    return (
      <div className="w-full max-w-4xl px-4 py-12">
        <div className="secondary-color-text opacity-60">
          No blog posts found
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl py-4">
      <div className="flex flex-col gap-4">
        {state.posts.map((post) => (
          <BlogCard key={post.docId} post={post} />
        ))}
      </div>
    </div>
  );
}
