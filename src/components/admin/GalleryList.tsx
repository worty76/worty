"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaMapMarkerAlt, FaCalendar, FaStar, FaTag } from "react-icons/fa";
import { LoadingSkeleton, EmptyState } from "@/components/ui/LoadingStates";
import { FilterButtonGroup } from "@/components/ui/Card";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
  location?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
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

        // Sort: featured first, then by date (newest first)
        galleryList.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

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
      console.error("Error deleting gallery:", error);
      toast.error("Failed to delete memory");
    }
  };

  // Get all unique categories and tags for filtering
  const allCategories = ["All", ...Array.from(new Set(items.map((i) => i.category || "Other")))];
  const allTags = ["All", ...Array.from(new Set(items.flatMap((i) => i.tags || [])))];

  // Combine filter options
  const filterOptions = Array.from(new Set([...allCategories, ...allTags]));

  const filteredItems = filter === "All"
    ? items
    : items.filter((item) =>
        item.category === filter || item.tags?.includes(filter)
      );

  if (loading) {
    return <LoadingSkeleton count={12} type="square" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        emoji=""
        title="No memories yet"
        description='Click "Create New" to add your first memory'
      />
    );
  }

  return (
    <div>
      <FilterButtonGroup
        filters={filterOptions}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-secondary-color-border cursor-pointer"
            onClick={() => onEdit(item)}
          >
            {/* Featured badge */}
            {item.featured && (
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-yellow-500/90 text-white rounded-full text-xs font-semibold shadow-lg">
                <FaStar size={8} />
                Featured
              </div>
            )}

            {/* Category badge */}
            {item.category && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                {item.category}
              </div>
            )}

            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              quality={90}
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium font-heading line-clamp-1 mb-1">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                  {item.location && (
                    <span className="flex items-center gap-1 truncate">
                      <FaMapMarkerAlt size={10} />
                      {item.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FaCalendar size={10} />
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-1.5 py-0.5 bg-white/20 rounded text-white text-xs"
                      >
                        <FaTag size={8} />
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-white/20 rounded text-white text-xs">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs transition-colors"
                  >
                    <FaEdit size={10} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xs transition-colors"
                  >
                    <FaTrash size={10} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="secondary-color-text opacity-60 text-sm mt-6 text-center">
        {filteredItems.length} {filteredItems.length === 1 ? "memory" : "memories"}
        {filter !== "All" && ` in ${filter}`}
      </p>
    </div>
  );
}
