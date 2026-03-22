"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaCalendar, FaTag } from "react-icons/fa";
import { LoadingSkeleton, EmptyState } from "@/components/ui/LoadingStates";
import { FilterButtonGroup } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, BlogStatus } from "@/components/ui/StatusBadge";

interface BlogPost {
  docId: string; // Firestore document ID
  title: string;
  description: string;
  image: string;
  category: string[];
  datetime: string;
  status?: BlogStatus;
}

interface BlogListProps {
  onEdit: (post: BlogPost) => void;
  refreshTrigger: number;
}

export function BlogList({ onEdit, refreshTrigger }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogCollection = collection(db, "blog");
        const blogSnapshot = await getDocs(blogCollection);
        const blogList = blogSnapshot.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        })) as BlogPost[];

        blogList.sort(
          (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
        );

        setPosts(blogList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load blog posts");
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      await deleteDoc(doc(db, "blog", id));
      setPosts((prev) => prev.filter((post) => post.docId !== id));
      toast.success("Blog post deleted successfully!");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog post");
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(posts.flatMap((p) => p.category || []))),
  ];

  const filteredPosts =
    filter === "All"
      ? posts
      : posts.filter((post) => post.category?.includes(filter));

  if (loading) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        emoji=""
        title="No posts yet"
        description='Click "Create New" to write your first blog post'
      />
    );
  }

  return (
    <div>
      <FilterButtonGroup
        filters={categories}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {filteredPosts.map((post) => (
          <div
            key={post.docId}
            className="group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all duration-200 border border-transparent hover:border-secondary-color-border"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                quality={90}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => onEdit(post)}
                  icon={<FaEdit size={14} />}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(post.id)}
                  icon={<FaTrash size={14} />}
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="secondary-color-text font-semibold font-heading text-lg line-clamp-1 flex-1">
                  {post.title}
                </h3>
                <StatusBadge status={post.status || "draft"} size="sm" />
              </div>
              <p className="secondary-color-text opacity-70 text-sm line-clamp-2 mb-4">
                {post.description}
              </p>

              <div className="flex items-center justify-between text-xs secondary-color-text opacity-50">
                <div className="flex items-center gap-1">
                  <FaCalendar size={12} />
                  <span>{post.datetime}</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {post.category?.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 bg-white/10 rounded-full flex items-center gap-1"
                    >
                      <FaTag size={10} />
                      {cat}
                    </span>
                  ))}
                  {post.category && post.category.length > 2 && (
                    <span className="px-2 py-1 bg-white/10 rounded-full">
                      +{post.category.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="secondary-color-text opacity-60 text-sm mt-6 text-center">
        {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
        {filter !== "All" && ` in ${filter}`}
      </p>
    </div>
  );
}
