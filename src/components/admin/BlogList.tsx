"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaCalendar, FaTag, FaRecycle, FaTrashRestore } from "react-icons/fa";
import { LoadingSkeleton, EmptyState } from "@/components/ui/LoadingStates";
import { FilterButtonGroup } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, BlogStatus } from "@/components/ui/StatusBadge";

interface BlogPost {
  docId: string;
  title: string;
  description: string;
  image: string;
  category: string[];
  datetime: string;
  readingTime?: string;
  status?: BlogStatus;
  deleted?: boolean;
  deletedAt?: string | null;
  titleVi?: string;
  descriptionVi?: string;
  contentVi?: string;
  readingTimeVi?: string;
}

interface BlogListProps {
  onEdit: (post: BlogPost) => void;
  refreshTrigger: number;
}

export function BlogList({ onEdit, refreshTrigger }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showDeleted, setShowDeleted] = useState(false);

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
      await updateDoc(doc(db, "blog", id), { deleted: true, deletedAt: new Date().toISOString() });
      setPosts((prev) => prev.filter((post) => post.docId !== id));
      toast.success("Blog post moved to trash!");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog post");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await updateDoc(doc(db, "blog", id), { deleted: false, deletedAt: null });
      setPosts((prev) => prev.filter((post) => post.docId !== id));
      toast.success("Blog post restored!");
    } catch (error) {
      console.error("Error restoring blog:", error);
      toast.error("Failed to restore blog post");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("⚠️ This will permanently delete this post. Are you sure?")) return;
    const { deleteDoc } = await import("firebase/firestore");
    try {
      await deleteDoc(doc(db, "blog", id));
      setPosts((prev) => prev.filter((post) => post.docId !== id));
      toast.success("Blog post permanently deleted!");
    } catch (error) {
      console.error("Error permanently deleting blog:", error);
      toast.error("Failed to delete blog post");
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(posts.flatMap((p) => p.category || []))),
  ];

  const filteredPosts =
    (filter === "All"
      ? posts
      : posts.filter((post) => post.category?.includes(filter)))
    .filter((post) => showDeleted ? post.deleted === true : post.deleted !== true);

  const deletedCount = posts.filter((p) => p.deleted === true).length;

  if (loading) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  if (!showDeleted && posts.filter((p) => p.deleted !== true).length === 0) {
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
      <div className="flex items-center justify-between mb-4">
        <FilterButtonGroup
          filters={categories}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
        <button
          onClick={() => setShowDeleted((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showDeleted
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-white/5 secondary-color-text opacity-60 hover:opacity-100 border border-white/10"
          }`}
        >
          {showDeleted ? <FaTrashRestore size={12} /> : <FaTrash size={12} />}
          {showDeleted ? "Active Items" : `Trash${deletedCount > 0 ? ` (${deletedCount})` : ""}`}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredPosts.map((post) => (
          <div
            key={post.docId}
            className={`group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all duration-200 border border-transparent hover:border-secondary-color-border ${
              post.deleted ? "opacity-60" : ""
            }`}
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

              {post.deleted && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 text-white rounded text-xs font-semibold">
                  Deleted
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                {!post.deleted && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => onEdit(post)}
                      icon={<FaEdit size={14} />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(post.docId)}
                      icon={<FaTrash size={14} />}
                    >
                      Delete
                    </Button>
                  </>
                )}
                {post.deleted && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleRestore(post.docId)}
                      icon={<FaRecycle size={14} />}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handlePermanentDelete(post.docId)}
                      icon={<FaTrash size={14} />}
                    >
                      Delete Forever
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`secondary-color-text font-semibold font-heading text-lg line-clamp-1 flex-1 ${
                  post.deleted ? "line-through opacity-50" : ""
                }`}>
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
