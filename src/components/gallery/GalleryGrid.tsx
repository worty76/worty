"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
  location?: string;
  category?: string;
}

interface GalleryGridProps {
  filter?: string;
}

export function GalleryGrid({ filter }: GalleryGridProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

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
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setItems(galleryList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gallery:", err);
        setError("Failed to load gallery");
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const filteredItems = filter
    ? items.filter((item) =>
        item.category?.toLowerCase().includes(filter.toLowerCase()),
      )
    : items;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-white/5 rounded-lg animate-pulse duration-1000"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 transition-colors duration-1000">{error}</p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="secondary-color-text opacity-70 transition-colors duration-1000">
          No memories found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-1000"
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium font-heading text-sm truncate">
                  {item.title}
                </p>
                {item.location && (
                  <p className="text-white/70 text-xs truncate mt-1">
                    📍 {item.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-4xl transition-colors duration-1000"
          >
            ×
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="relative aspect-auto max-h-[70vh] w-full rounded-lg overflow-hidden">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-white font-heading text-xl font-semibold">
                {selectedImage.title}
              </h3>
              {selectedImage.description && (
                <p className="text-white/70 mt-2 max-w-2xl mx-auto">
                  {selectedImage.description}
                </p>
              )}
              <div className="flex justify-center gap-4 mt-3 text-sm text-white/50">
                {selectedImage.date && (
                  <span>
                    📅 {new Date(selectedImage.date).toLocaleDateString()}
                  </span>
                )}
                {selectedImage.location && (
                  <span>📍 {selectedImage.location}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
