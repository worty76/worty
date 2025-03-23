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
      <div className="flex max-w-xl flex-col items-start justify-between rounded-md border secondary-color-border p-5 cursor-pointer hover:opacity-80 transition-all duration-1000 group">
        <div className="flex items-center gap-x-4 text-xs">
          <time dateTime={datetime}>
            <p className="transition-all duration-1000">{datetime}</p>
          </time>
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

const BlogCardSkeleton = () => (
  <div className="flex max-w-xl flex-col items-start justify-between rounded-md border secondary-color-border p-5 primary-color-bg transition-all duration-1000">
    <div className="flex items-center gap-x-4 text-xs">
      <div className="h-3 w-24 secondary-color-bg opacity-20 rounded animate-[pulse_2s_ease-in-out_infinite]" />
    </div>
    <div className="group relative w-full">
      <div className="mt-3 h-6 w-3/4 secondary-color-bg opacity-20 rounded animate-[pulse_2s_ease-in-out_infinite]" />
      <div className="mt-5 h-4 w-full secondary-color-bg opacity-20 rounded animate-[pulse_2s_ease-in-out_infinite]" />
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
