"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import { GalleryForm } from "@/components/admin/GalleryForm";
import { MusicForm } from "@/components/admin/MusicForm";
import { BlogList } from "@/components/admin/BlogList";
import { GalleryList } from "@/components/admin/GalleryList";
import { MusicList } from "@/components/admin/MusicList";
import { useAuth } from "@/context/auth-context";
import { db } from "@/firebase/config";
import {
  FaPen,
  FaImages,
  FaMusic,
  FaPlus,
  FaList,
  FaSignOutAlt,
  FaUserCircle,
  FaHome,
  FaArrowLeft,
} from "react-icons/fa";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingStates";
import { BlogStatus } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

type Tab = "home" | "blog" | "gallery" | "music";
type View = "form" | "list";

interface EditingBlog {
  docId?: string;
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
  tags?: string[];
  featured?: boolean;
}

interface EditingMusic {
  id?: string;
  title: string;
  artist: string;
  album?: string;
  coverImage: string;
  year: string;
  genre: string[];
  spotifyLink?: string;
}

interface Stats {
  blogCount: number;
  galleryCount: number;
  musicCount: number;
}

const NAV_ITEMS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Overview", icon: <FaHome size={16} /> },
  { key: "blog", label: "Blog Posts", icon: <FaPen size={16} /> },
  { key: "gallery", label: "Gallery", icon: <FaImages size={16} /> },
  { key: "music", label: "Music", icon: <FaMusic size={16} /> },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [currentView, setCurrentView] = useState<View>("list");
  const [editingBlog, setEditingBlog] = useState<EditingBlog | null>(null);
  const [editingGallery, setEditingGallery] = useState<EditingGallery | null>(null);
  const [editingMusic, setEditingMusic] = useState<EditingMusic | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [existingGenres, setExistingGenres] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ blogCount: 0, galleryCount: 0, musicCount: 0 });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const [blogSnap, gallerySnap, musicSnap] = await Promise.all([
          getDocs(collection(db, "blog")),
          getDocs(collection(db, "gallery")),
          getDocs(collection(db, "music")),
        ]);
        setStats({
          blogCount: blogSnap.size,
          galleryCount: gallerySnap.size,
          musicCount: musicSnap.size,
        });
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchTags = async () => {
      if (activeTab !== "gallery") return;
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "gallery"));
        const tagsSet = new Set<string>();
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.tags && Array.isArray(data.tags)) {
            data.tags.forEach((tag: string) => tagsSet.add(tag));
          }
        });
        setExistingTags(Array.from(tagsSet));
      } catch (e) { console.error(e); }
    };
    fetchTags();
  }, [activeTab]);

  useEffect(() => {
    const fetchGenres = async () => {
      if (activeTab !== "music") return;
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "music"));
        const genresSet = new Set<string>();
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.genre && Array.isArray(data.genre)) {
            data.genre.forEach((genre: string) => genresSet.add(genre));
          }
        });
        setExistingGenres(Array.from(genresSet));
      } catch (e) { console.error(e); }
    };
    fetchGenres();
  }, [activeTab]);

  if (loading) {
    return (
      <main className="min-h-screen primary-color-bg flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }
  if (!user) return null;

  const handleBlogEdit = (blog: any) => {
    setEditingBlog({
      docId: blog.docId, title: blog.title, description: blog.description || "",
      content: blog.content || "", image: blog.image || "", category: blog.category || [],
      datetime: blog.datetime, status: blog.status || "draft",
    });
    setCurrentView("form");
  };

  const handleGalleryEdit = (item: any) => {
    setEditingGallery({
      id: item.id, title: item.title, description: item.description || "",
      imageUrl: item.imageUrl, date: item.date, location: item.location || "",
      category: item.category || "Travel", tags: item.tags || [], featured: item.featured || false,
    });
    setCurrentView("form");
  };

  const handleMusicEdit = (item: any) => {
    setEditingMusic({
      id: item.id, title: item.title, artist: item.artist, album: item.album || "",
      coverImage: item.coverImage, year: item.year, genre: item.genre || [],
      spotifyLink: item.spotifyLink || "",
    });
    setCurrentView("form");
  };

  const handleNewPost = () => {
    setEditingBlog(null);
    setEditingGallery(null);
    setEditingMusic(null);
    setCurrentView("form");
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingBlog(null);
    setEditingGallery(null);
    setEditingMusic(null);
    setCurrentView("list");
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setEditingGallery(null);
    setEditingMusic(null);
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
    setEditingMusic(null);
    setMobileNavOpen(false);
  };

  const formHeaderInfo =
    activeTab === "blog"
      ? { title: editingBlog?.docId ? "Edit Blog Post" : "Create New Post", description: editingBlog?.docId ? "Update your existing blog post" : "Share your thoughts with the world" }
      : activeTab === "gallery"
      ? { title: editingGallery?.id ? "Edit Memory" : "Add New Memory", description: editingGallery?.id ? "Update your memory" : "Add a new moment to your gallery" }
      : { title: editingMusic?.id ? "Edit Track" : "Add New Track", description: editingMusic?.id ? "Update this track" : "Add a new track to your collection" };

  const listHeaderInfo =
    activeTab === "blog"
      ? { title: "Your Blog Posts", description: "Manage and edit your blog posts" }
      : activeTab === "gallery"
      ? { title: "Your Memories", description: "Manage your photo gallery" }
      : { title: "Your Music", description: "Manage your music collection" };

  const contentTab = activeTab as "blog" | "gallery" | "music";

  // Stats cards
  const statCards = [
    { label: "Blog Posts", count: stats.blogCount, icon: <FaPen size={20} />, color: "from-blue-500/20 to-blue-600/5" },
    { label: "Gallery Items", count: stats.galleryCount, icon: <FaImages size={20} />, color: "from-emerald-500/20 to-emerald-600/5" },
    { label: "Music Tracks", count: stats.musicCount, icon: <FaMusic size={20} />, color: "from-purple-500/20 to-purple-600/5" },
  ];

  const renderContent = () => {
    // Dashboard home
    if (activeTab === "home") {
      return (
        <div className="space-y-8">
          <div>
            <h2 className="secondary-color-text font-heading text-2xl font-bold mb-1">Dashboard</h2>
            <p className="secondary-color-text opacity-60 text-sm">Welcome back. Here&apos;s an overview of your content.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((card) => (
              <button
                key={card.label}
                onClick={() => handleTabChange(card.label.toLowerCase().includes("blog") ? "blog" : card.label.toLowerCase().includes("gallery") ? "gallery" : "music")}
                className="relative overflow-hidden rounded-2xl border border-[rgba(221,198,182,0.08)] bg-gradient-to-br hover:border-[rgba(221,198,182,0.2)] transition-all duration-200 text-left group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-60 group-hover:opacity-80 transition-opacity`} />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="secondary-color-text opacity-40">{card.icon}</span>
                  </div>
                  <p className="secondary-color-text font-heading text-3xl font-bold mb-1">{card.count}</p>
                  <p className="secondary-color-text opacity-60 text-sm">{card.label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="secondary-color-text font-heading font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="secondary" fullWidth onClick={() => { setActiveTab("blog"); handleNewPost(); }} icon={<FaPlus size={14} />}>
                New Blog Post
              </Button>
              <Button variant="secondary" fullWidth onClick={() => { setActiveTab("gallery"); handleNewPost(); }} icon={<FaPlus size={14} />}>
                New Gallery Item
              </Button>
              <Button variant="secondary" fullWidth onClick={() => { setActiveTab("music"); handleNewPost(); }} icon={<FaPlus size={14} />}>
                New Music Track
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Form view
    if (currentView === "form") {
      return (
        <div>
          <button onClick={handleCancelEdit} className="flex items-center gap-2 secondary-color-text opacity-60 hover:opacity-100 text-sm mb-6 transition-opacity">
            <FaArrowLeft size={12} />
            Back to list
          </button>
          <Card>
            <CardHeader title={formHeaderInfo.title} description={formHeaderInfo.description} />
            <div className="p-6 sm:p-8">
              {activeTab === "blog" ? (
                <BlogForm initialData={editingBlog || undefined} onSuccess={handleSuccess} />
              ) : activeTab === "gallery" ? (
                <GalleryForm initialData={editingGallery || undefined} onSuccess={handleSuccess} existingTags={existingTags} />
              ) : (
                <MusicForm initialData={editingMusic || undefined} onSuccess={handleSuccess} existingGenres={existingGenres} />
              )}
            </div>
          </Card>
        </div>
      );
    }

    // List view
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="secondary-color-text font-heading text-2xl font-bold">{listHeaderInfo.title}</h2>
            <p className="secondary-color-text opacity-60 text-sm mt-1">{listHeaderInfo.description}</p>
          </div>
          <Button onClick={handleNewPost} icon={<FaPlus size={14} />}>
            Create New
          </Button>
        </div>
        <Card>
          <div className="p-6 sm:p-8">
            {activeTab === "blog" ? (
              <BlogList onEdit={handleBlogEdit} refreshTrigger={refreshTrigger} />
            ) : activeTab === "gallery" ? (
              <GalleryList onEdit={handleGalleryEdit} refreshTrigger={refreshTrigger} />
            ) : (
              <MusicList onEdit={handleMusicEdit} refreshTrigger={refreshTrigger} />
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen primary-color-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[rgba(221,198,182,0.08)] bg-[rgba(0,0,0,0.15)] sticky top-0 h-screen z-30">
        {/* Logo */}
        <div className="p-6 border-b border-[rgba(221,198,182,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
              <span className="secondary-color-text font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="font-heading font-bold secondary-color-text text-sm">Admin Panel</h1>
              <p className="text-xs secondary-color-text opacity-40">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => handleTabChange(item.key)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${activeTab === item.key
                  ? "bg-white/[0.08] secondary-color-text shadow-sm"
                  : "secondary-color-text opacity-60 hover:opacity-90 hover:bg-white/[0.04]"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-[rgba(221,198,182,0.08)]">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
            <FaUserCircle className="secondary-color-text opacity-40" size={18} />
            <span className="secondary-color-text text-xs truncate">{user.email}</span>
          </div>
          <Button variant="ghost" size="sm" fullWidth onClick={handleLogout} icon={<FaSignOutAlt size={12} />}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 border-b border-[rgba(221,198,182,0.08)] backdrop-blur-xl bg-[rgb(38,34,35)]/90">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <span className="secondary-color-text font-bold">W</span>
            </div>
            <h1 className="font-heading font-bold secondary-color-text text-sm">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout} icon={<FaSignOutAlt size={12} />} />
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => handleTabChange(item.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                ${activeTab === item.key
                  ? "bg-white/[0.08] secondary-color-text"
                  : "secondary-color-text opacity-50 hover:opacity-80"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 pt-40 lg:pt-8 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
