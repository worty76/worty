"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BlogForm } from "@/components/admin/BlogForm";
import { useAuth } from "@/context/auth-context";

export const dynamic = "force-dynamic";

interface EditingBlog {
  id?: string;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string[];
  datetime: string;
}

export default function AdminPage() {
  const [editingBlog, setEditingBlog] = useState<EditingBlog | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen primary-color-bg flex items-center justify-center">
        <div className="secondary-color-text text-xl">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const handleEdit = (blog: any) => {
    setEditingBlog({
      id: blog.id,
      title: blog.title,
      description: blog.description || "",
      content: blog.content || "",
      image: blog.image || "",
      category: blog.category || [],
      datetime: blog.datetime,
    });
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingBlog(null);
  };

  const handleLogout = async () => {
    await logOut();
    router.push("/admin/login");
  };

  return (
    <main className="min-h-screen primary-color-bg py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold secondary-color-text">
              Admin Dashboard
            </h1>
            <p className="secondary-color-text opacity-70 text-sm">
              Logged in as {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border secondary-color-border secondary-color-text font-medium hover:bg-white/5 transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Form Section - Full Width */}
        <div className="w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 lg:p-10">
            <div className="mb-8 pb-6 ">
              <h2 className="text-2xl md:text-3xl font-bold secondary-color-text">
                {editingBlog?.id
                  ? "✏️ Edit Blog Post"
                  : "📝 Create New Blog Post"}
              </h2>
              <p className="text-sm secondary-color-text opacity-60 mt-2">
                {editingBlog?.id
                  ? "Make changes to your existing post"
                  : "Write and publish a new blog story"}
              </p>
            </div>

            <BlogForm
              initialData={editingBlog || undefined}
              onSuccess={handleSuccess}
            />

            {editingBlog?.id && (
              <button
                onClick={() => {
                  setEditingBlog(null);
                }}
                className="mt-6 px-6 py-2 rounded-lg border secondary-color-border secondary-color-text font-medium hover:bg-white/5 transition-colors duration-200"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
