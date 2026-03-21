"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import { GalleryForm } from "@/components/admin/GalleryForm";
import { BlogList } from "@/components/admin/BlogList";
import { GalleryList } from "@/components/admin/GalleryList";
import { useAuth } from "@/context/auth-context";
import {
  FaPen,
  FaImages,
  FaPlus,
  FaList,
  FaSignOutAlt,
  FaUserCircle,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { useTheme } from "@/context/theme-context";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingStates";
import { BlogStatus } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

type Tab = "blog" | "gallery";
type View = "form" | "list";

interface EditingBlog {
  id?: string;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string[];
  datetime: string;
  status?: BlogStatus;
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
  const [currentView, setCurrentView] = useState<View>("list");
  const [editingBlog, setEditingBlog] = useState<EditingBlog | null>(null);
  const [editingGallery, setEditingGallery] = useState<EditingGallery | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading, logOut } = useAuth();
  const { isReversed, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen primary-color-bg flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (!user) {
    return null;
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
      status: blog.status || "draft",
    });
    setCurrentView("form");
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
    setCurrentView("form");
  };

  const handleNewPost = () => {
    setEditingBlog(null);
    setEditingGallery(null);
    setCurrentView("form");
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingBlog(null);
    setEditingGallery(null);
    setCurrentView("list");
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setEditingGallery(null);
    setCurrentView("list");
  };

  const handleLogout = async () => {
    await logOut();
    router.push("/admin/login");
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentView("list");
    setEditingBlog(null);
    setEditingGallery(null);
  };

  const formHeaderInfo = activeTab === "blog"
    ? {
        title: editingBlog?.id ? "Edit Blog Post" : "Create New Post",
        description: editingBlog?.id ? "Update your existing blog post" : "Share your thoughts with the world",
      }
    : {
        title: editingGallery?.id ? "Edit Memory" : "Add New Memory",
        description: editingGallery?.id ? "Update your memory" : "Add a new moment to your gallery",
      };

  const listHeaderInfo = activeTab === "blog"
    ? {
        title: "Your Blog Posts",
        description: "Manage and edit your blog posts",
      }
    : {
        title: "Your Memories",
        description: "Manage your photo gallery",
      };

  return (
    <div className="min-h-screen primary-color-bg">
      <nav className="sticky top-0 z-40 border-b secondary-color-border backdrop-blur-xl bg-primary-bg/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl secondary-color-bg flex items-center justify-center">
                <span className="primary-color-text font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="font-heading font-bold secondary-color-text">Admin</h1>
                <p className="text-xs secondary-color-text opacity-60">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg secondary-color-bg primary-color-text hover:opacity-80 transition-opacity"
                title="Toggle theme"
              >
                {isReversed ? <FaMoon size={16} /> : <FaSun size={16} />}
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                <FaUserCircle className="secondary-color-text opacity-60" size={16} />
                <span className="secondary-color-text text-sm truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                icon={<FaSignOutAlt size={14} />}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
            <Button
              variant={activeTab === "blog" ? "primary" : "ghost"}
              size="md"
              onClick={() => handleTabChange("blog")}
              icon={<FaPen size={14} />}
            >
              Blog Posts
            </Button>
            <Button
              variant={activeTab === "gallery" ? "primary" : "ghost"}
              size="md"
              onClick={() => handleTabChange("gallery")}
              icon={<FaImages size={14} />}
            >
              Gallery
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {currentView === "form" ? (
              <Button
                variant="secondary"
                onClick={handleCancelEdit}
                icon={<FaList size={14} />}
              >
                Back to List
              </Button>
            ) : (
              <Button
                onClick={handleNewPost}
                icon={<FaPlus size={14} />}
              >
                Create New
              </Button>
            )}
          </div>
        </div>

        {currentView === "form" ? (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader
                title={formHeaderInfo.title}
                description={formHeaderInfo.description}
              />
              <div className="p-8">
                {activeTab === "blog" ? (
                  <BlogForm
                    initialData={editingBlog || undefined}
                    onSuccess={handleSuccess}
                  />
                ) : (
                  <GalleryForm
                    initialData={editingGallery || undefined}
                    onSuccess={handleSuccess}
                  />
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader
              title={listHeaderInfo.title}
              description={listHeaderInfo.description}
            />
            <div className="p-8">
              {activeTab === "blog" ? (
                <BlogList
                  onEdit={handleBlogEdit}
                  refreshTrigger={refreshTrigger}
                />
              ) : (
                <GalleryList
                  onEdit={handleGalleryEdit}
                  refreshTrigger={refreshTrigger}
                />
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
