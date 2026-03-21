"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import { GalleryForm } from "@/components/admin/GalleryForm";
import { GalleryList } from "@/components/admin/GalleryList";
import { useAuth } from "@/context/auth-context";

export const dynamic = "force-dynamic";

type Tab = "blog" | "gallery";

interface EditingBlog {
  id?: string;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string[];
  datetime: string;
}

interface EditingGallery {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
  location?: string;
  category?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("blog");
  const [editingBlog, setEditingBlog] = useState<EditingBlog | null>(null);
  const [editingGallery, setEditingGallery] = useState<EditingGallery | null>(null);
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

  const handleBlogEdit = (blog: any) => {
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

  const handleGalleryEdit = (item: any) => {
    setEditingGallery({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      date: item.date,
      location: item.location || "",
      category: item.category || "Travel",
    });
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingBlog(null);
    setEditingGallery(null);
  };

  const handleLogout = async () => {
    await logOut();
    router.push("/admin/login");
  };

  return (
    <main className="min-h-screen primary-color-bg py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("blog");
              setEditingBlog(null);
              setEditingGallery(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "blog"
                ? "secondary-color-bg primary-color-text"
                : "bg-white/10 secondary-color-text hover:bg-white/20"
            }`}
          >
            📝 Blog Posts
          </button>
          <button
            onClick={() => {
              setActiveTab("gallery");
              setEditingBlog(null);
              setEditingGallery(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "gallery"
                ? "secondary-color-bg primary-color-text"
                : "bg-white/10 secondary-color-text hover:bg-white/20"
            }`}
          >
            📷 Gallery
          </button>
        </div>

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 lg:p-10">
            <div className="mb-8 pb-6 border-b secondary-color-border">
              <h2 className="text-2xl md:text-3xl font-bold secondary-color-text">
                {editingBlog?.id ? "✏️ Edit Blog Post" : "📝 Create New Blog Post"}
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
                onClick={() => setEditingBlog(null)}
                className="mt-6 px-6 py-2 rounded-lg border secondary-color-border secondary-color-text font-medium hover:bg-white/5 transition-colors duration-200"
              >
                Cancel Edit
              </button>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 lg:p-10">
            <div className="mb-8 pb-6 border-b secondary-color-border">
              <h2 className="text-2xl md:text-3xl font-bold secondary-color-text">
                {editingGallery?.id ? "✏️ Edit Memory" : "📷 Add New Memory"}
              </h2>
              <p className="text-sm secondary-color-text opacity-60 mt-2">
                {editingGallery?.id
                  ? "Update your memory"
                  : "Add a new photo to your gallery"}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div>
                <GalleryForm
                  initialData={editingGallery || undefined}
                  onSuccess={handleSuccess}
                />

                {editingGallery?.id && (
                  <button
                    onClick={() => setEditingGallery(null)}
                    className="mt-6 px-6 py-2 rounded-lg border secondary-color-border secondary-color-text font-medium hover:bg-white/5 transition-colors duration-200"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Gallery List */}
              <div>
                <h3 className="text-lg font-semibold secondary-color-text mb-4">
                  Your Memories ({!editingGallery ? "view all" : "click to edit"})
                </h3>
                <GalleryList
                  onEdit={handleGalleryEdit}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
