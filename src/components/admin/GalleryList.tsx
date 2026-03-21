"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
  location?: string;
  category?: string;
}

interface GalleryListProps {
  onEdit: (item: GalleryItem) => void;
  refreshTrigger: number;
}

export function GalleryList({ onEdit, refreshTrigger }: GalleryListProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const galleryCollection = collection(db, "gallery");
        const gallerySnapshot = await getDocs(galleryCollection);
        const galleryList = gallerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryItem[];

        // Sort by date (newest first)
        galleryList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setItems(galleryList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gallery:", error);
        toast.error("Failed to load memories");
        setLoading(false);
      }
    };

    fetchGallery();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memory?")) return;

    try {
      await deleteDoc(doc(db, "gallery", id));
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Memory deleted successfully!");
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error("Failed to delete memory");
    }
  };

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category || "Other")))];

  const filteredItems = filter === "All" ? items : items.filter((item) => item.category === filter);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="secondary-color-text opacity-70">No memories yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === cat
                ? "secondary-color-bg primary-color-text"
                : "bg-white/10 secondary-color-text hover:bg-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
              <p className="text-white text-xs text-center px-2 line-clamp-2 font-heading font-medium">
                {item.title}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 bg-red-500/70 hover:bg-red-500 rounded-full text-white text-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Category badge */}
            {item.category && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                {item.category}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="secondary-color-text opacity-60 text-sm mt-4">
        {filteredItems.length} {filteredItems.length === 1 ? "memory" : "memories"}
        {filter !== "All" && ` in ${filter}`}
      </p>
    </div>
  );
}
