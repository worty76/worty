"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchCollectionCached } from "@/lib/firestore-cache";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { FaTag, FaFilter } from "react-icons/fa";

export const dynamic = "force-dynamic";

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
  deleted?: boolean;
}

type FilterType = "category" | "tag";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterType, setFilterType] = useState<FilterType>("category");

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const galleryList = await fetchCollectionCached<GalleryItem>("gallery");

        // Sort by featured first, then date
        galleryList.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setItems(galleryList.filter((item) => item.deleted !== true));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Memoized filter options
  const uniqueCategories = Array.from(new Set(items.map((item) => item.category || "Other")));
  const categories = ["All", ...uniqueCategories].sort();
  const uniqueTags = Array.from(new Set(items.flatMap((item) => item.tags || [])));
  const tags = ["All", ...uniqueTags].sort();

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);

  const handleFilterTypeChange = useCallback((type: FilterType) => {
    setFilterType(type);
    setActiveFilter("All");
  }, []);

  const currentFilters = filterType === "category" ? categories : tags;
  const filterForGrid = activeFilter === "All" ? undefined : activeFilter;

  // Calculate stats
  const stats = {
    memories: items.length,
    categories: categories.length - 1,
    tags: tags.length - 1,
  };

  return (
    <main className="min-h-screen transition-colors duration-1000 py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mg-head mb-12">
          <span className="mg-kana">思い出</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold secondary-color-text mb-5 transition-colors duration-1000">
            My <span className="mg-brush">Memories</span>
          </h1>
          <p className="secondary-color-text opacity-70 text-lg max-w-2xl mx-auto transition-colors duration-1000">
            A collection of moments and adventures from my journey
          </p>
        </div>

        {/* Filter Type Toggle */}
        {!loading && items.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex gap-2">
              <button
                onClick={() => handleFilterTypeChange("category")}
                className={`mg-chip ${filterType === "category" ? "is-on" : ""}`}
              >
                <FaFilter size={12} />
                Categories
              </button>
              <button
                onClick={() => handleFilterTypeChange("tag")}
                className={`mg-chip ${filterType === "tag" ? "is-on" : ""}`}
              >
                <FaTag size={12} />
                Tags
              </button>
            </div>
          </div>
        )}

        {/* Category/Tag Filters */}
        {!loading && currentFilters.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {currentFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`mg-chip ${activeFilter === filter ? "is-on" : ""}`}
              >
                {filterType === "tag" && filter !== "All" ? `#${filter}` : filter}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && items.length > 0 && (
          <div className="flex justify-center gap-6 mb-8 text-sm secondary-color-text opacity-60">
            <span>{stats.memories} memories</span>
            <span>•</span>
            <span>{stats.categories} categories</span>
            <span>•</span>
            <span>{stats.tags} tags</span>
          </div>
        )}

        {/* Gallery Grid - Pass items as prop to avoid duplicate fetch */}
        <GalleryGrid items={items} filter={filterForGrid} />
      </div>
    </main>
  );
}
