"use client";

import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useEffect, useState, memo } from "react";
import { BlogCardSkeleton } from "@/components/blog/BlogCardSkeleton";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  datetime: string;
  readingTime?: string;
}

const BlogCard = memo(({ post }: { post: BlogPost }) => {
  const { id, title, description, datetime, readingTime } = post;
  return (
    <Link href={`/${id}`}>
      <div className="flex max-w-xl flex-col items-start justify-between rounded-md border secondary-color-border p-5 cursor-pointer hover:opacity-80 transition-all duration-1000 group">
        <div className="flex items-center gap-x-1 text-xs">
          <time dateTime={datetime}>
            <p className="transition-all duration-1000">{datetime}</p>
          </time>
          {readingTime && (
            <span className="transition-all duration-1000 secondary-color-text">
              · {readingTime} read
            </span>
          )}
        </div>
        <div className="relative w-full">
          <h3 className="mt-3 text-lg font-semibold leading-6">
            <span className="inline-block">
              <p className="line-clamp-1 transition-all duration-1000">
                {title}
              </p>
              <span className="block h-0.5 w-full scale-x-0 transition-transform duration-500 secondary-color-bg group-hover:scale-x-100" />
            </span>
          </h3>
          <p className="mt-5 line-clamp-1 text-sm leading-6 transition-all duration-1000">
            {description}
          </p>
        </div>
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
          ...doc.data(),
          id: doc.id,
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
      <div className="grid md:grid-cols-2 gap-4 place-content-center pt-10">
        {[...Array(2)].map((_, index) => (
          <BlogCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (state.error) {
    return <div className="text-center pt-10 text-red-500">{state.error}</div>;
  }

  if (!state.posts.length) {
    return <div className="text-center pt-10">No blog posts found</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 place-content-center pt-10">
      {state.posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
