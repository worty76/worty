"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FaSearchPlus, FaSearchMinus, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

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

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [selectedImage]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.1, 3));
    } else {
      setZoom((prev) => {
        const newZoom = Math.max(prev - 0.1, 1);
        if (newZoom === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newZoom;
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex((item) => item.id === selectedImage.id);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0) newIndex = filteredItems.length - 1;
    if (newIndex >= filteredItems.length) newIndex = 0;

    setSelectedImage(filteredItems[newIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setSelectedImage(null);
    if (e.key === "ArrowLeft") handleNavigate("prev");
    if (e.key === "ArrowRight") handleNavigate("next");
    if (e.key === "+" || e.key === "=") handleZoomIn();
    if (e.key === "-" || e.key === "_") handleZoomOut();
    if (e.key === "0") handleResetZoom();
  };

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
              quality={90}
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
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-4xl transition-colors duration-300 z-10 p-2"
            title="Close (Esc)"
          >
            <FaTimes />
          </button>

          {/* Navigation buttons */}
          {filteredItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate("prev");
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl transition-colors duration-300 z-10 p-3 bg-black/30 hover:bg-black/50 rounded-full"
                title="Previous (←)"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate("next");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl transition-colors duration-300 z-10 p-3 bg-black/30 hover:bg-black/50 rounded-full"
                title="Next (→)"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= 1}
              className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom Out (-)"
            >
              <FaSearchMinus size={18} />
            </button>
            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 3}
              className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom In (+)"
            >
              <FaSearchPlus size={18} />
            </button>
            {zoom > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                className="ml-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white text-sm rounded-full transition-colors duration-300"
                title="Reset Zoom (0)"
              >
                Reset
              </button>
            )}
          </div>

          {/* Image container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-6xl w-full max-h-[85vh] flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              ref={imageRef}
              onWheel={handleWheel}
              className="relative transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: "center",
              }}
            >
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                width={1920}
                height={1080}
                quality={100}
                unoptimized
                className="max-w-full max-h-[80vh] object-contain"
                draggable={false}
              />
            </div>
          </div>

          {/* Image info */}
          <div className="absolute top-4 left-4 max-w-md text-left z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-heading text-xl font-semibold">
                {selectedImage.title}
              </h3>
              {selectedImage.description && (
                <p className="text-white/80 mt-2 text-sm">
                  {selectedImage.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/60">
                {selectedImage.date && (
                  <span>📅 {new Date(selectedImage.date).toLocaleDateString()}</span>
                )}
                {selectedImage.location && (
                  <span>📍 {selectedImage.location}</span>
                )}
                {selectedImage.category && (
                  <span>🏷️ {selectedImage.category}</span>
                )}
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="absolute top-4 right-16 text-white/50 text-xs hidden md:block">
            <div className="bg-black/50 rounded px-2 py-1">
              Scroll/Pan to zoom • Drag to move • Arrows to navigate
            </div>
          </div>
        </div>
      )}
    </>
  );
}
