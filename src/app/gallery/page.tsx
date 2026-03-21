"use client";

import { useState } from "react";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "All",
  "Adventure",
  "Travel",
  "Food",
  "Friends",
  "Nature",
  "Events",
  "Other",
];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <main className="min-h-screen primary-color-bg py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold secondary-color-text mb-4">
            My Memories
          </h1>
          <p className="secondary-color-text opacity-70 text-lg max-w-2xl mx-auto">
            A collection of moments and adventures from my journey
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                activeFilter === category
                  ? "secondary-color-bg primary-color-text shadow-lg"
                  : "bg-white/10 secondary-color-text hover:bg-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <GalleryGrid
          filter={activeFilter === "All" ? undefined : activeFilter}
        />
      </div>
    </main>
  );
}
