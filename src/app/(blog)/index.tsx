"use client";

import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { database } from "../../firebase/config";
import { useEffect, useState, memo } from "react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  datetime: string;
}

const BlogCard = memo(({ post }: { post: BlogPost }) => {
  const { id, title, description, datetime } = post;
  return (
    <Link href={`/${id}`}>
      <div className="flex max-w-xl flex-col items-start justify-between rounded-md border border-[#DDC6B6]/25 p-5 cursor-pointer hover:border-[#DDC6B6]/50">
        <div className="flex items-center gap-x-4 text-xs">
          <time dateTime={datetime}>
            <p>{datetime}</p>
          </time>
        </div>
        <div className="group relative">
          <h3 className="mt-3 text-lg font-semibold leading-6">
            <span className="group transition duration-300 inline-block">
              <p className="line-clamp-1">{title}</p>
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 secondary-color-bg" />
            </span>
          </h3>
          <p className="mt-5 line-clamp-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </Link>
  );
});

BlogCard.displayName = "BlogCard";

const BlogCardSkeleton = () => (
  <div className="flex max-w-xl flex-col items-start justify-between rounded-md border border-[#DDC6B6]/25 p-5">
    <div className="flex items-center gap-x-4 text-xs">
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="group relative w-full">
      <div className="mt-3 h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="mt-5 h-4 w-full bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const blogsCollection = collection(database, "blog");
        const blogsSnapshot = await getDocs(blogsCollection);
        const blogsData = blogsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as BlogPost[];

        setPosts(blogsData);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blog posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4 place-content-center pt-10">
        {[...Array(2)].map((_, index) => (
          <BlogCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center pt-10 text-red-500">{error}</div>;
  }

  if (!posts.length) {
    return <div className="text-center pt-10">No blog posts found</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 place-content-center pt-10">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
