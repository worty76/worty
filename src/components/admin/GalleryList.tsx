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
        const gallerySnapshot = await getDocs(collection(db, "gallery"));
        const galleryList = gallerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryItem[];
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

  const allCategories = ["All", ...Array.from(new Set(items.map((i) => i.category || "Other")))];
  const allTags = ["All", ...Array.from(new Set(items.flatMap((i) => i.tags || [])))];
  const filterOptions = Array.from(new Set([...allCategories, ...allTags]));
  const filteredItems = filter === "All"
    ? items
    : items.filter((item) => item.category === filter || item.tags?.includes(filter));

  if (loading) return <LoadingSkeleton count={6} type="square" />;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-white/[0.04] hover:bg-white/[0.07] transition-all duration-200 border border-[rgba(221,198,182,0.08)] hover:border-[rgba(221,198,182,0.2)] cursor-pointer"
            onClick={() => onEdit(item)}
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                quality={90}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />

              {/* Featured badge */}
              {item.featured && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/90 text-white rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm">
                  <FaStar size={9} />
                  Featured
                </div>
              )}

              {/* Category badge */}
              {item.category && (
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                  {item.category}
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary-color-bg/90 hover:bg-secondary-color-bg primary-color-text rounded-xl text-sm font-medium transition-colors shadow-lg"
                >
                  <FaEdit size={12} />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500/90 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg"
                >
                  <FaTrash size={12} />
                  Delete
                </button>
              </div>
            </div>

            {/* Info - always visible */}
            <div className="p-4">
              <h3 className="secondary-color-text font-heading font-semibold text-sm line-clamp-1 mb-2">
                {item.title}
              </h3>

              <div className="flex items-center gap-3 secondary-color-text opacity-50 text-xs mb-2">
                {item.location && (
                  <span className="flex items-center gap-1 truncate">
                    <FaMapMarkerAlt size={10} />
                    {item.location}
                  </span>
                )}
                <span className="flex items-center gap-1 shrink-0">
                  <FaCalendar size={10} />
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.06] rounded-md secondary-color-text opacity-50 text-xs"
                    >
                      <FaTag size={7} />
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-white/[0.06] rounded-md secondary-color-text opacity-50 text-xs">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
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
