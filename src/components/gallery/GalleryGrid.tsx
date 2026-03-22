"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { db } from "@/firebase/config";
import { FaSearchPlus, FaSearchMinus, FaTimes, FaChevronLeft, FaChevronRight, FaStar, FaTag } from "react-icons/fa";

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

interface GalleryGridProps {
  items?: GalleryItem[];
  filter?: string;
}

interface ImageDimensions {
  [key: string]: { width: number; height: number; aspectRatio: number };
}

export function GalleryGrid({ items: propItems, filter }: GalleryGridProps) {
  const [items, setItems] = useState<GalleryItem[]>(propItems || []);
  const [loading, setLoading] = useState(!propItems);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({});
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const imageRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const loadingImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch data only if not provided as prop
  useEffect(() => {
    if (propItems) {
      setItems(propItems);
      setLoading(false);
      return;
    }

    const fetchGallery = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
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
      } catch (err) {
        console.error("Error fetching gallery:", err);
        setError("Failed to load gallery");
        setLoading(false);
      }
    };

    fetchGallery();
  }, [propItems]);

  // Cleanup function for loading images
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    return () => {
      // Cancel any pending image loads
      const currentLoadingImages = loadingImagesRef.current;
      currentLoadingImages.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = "";
      });
      currentLoadingImages.clear();

      // Disconnect intersection observer
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Filter by category or tags (memoized)
  const filteredItems = useMemo(() => {
    if (!filter) return items;

    return items.filter((item) => {
      const categoryMatch = item.category?.toLowerCase().includes(filter.toLowerCase());
      const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()));
      return categoryMatch || tagMatch;
    });
  }, [items, filter]);

  // Collect all unique tags from filtered items (memoized)
  const allTags = useMemo(() => {
    return Array.from(
      new Set(filteredItems.flatMap(item => item.tags || []))
    ).sort();
  }, [filteredItems]);

  // Setup Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgId = entry.target.getAttribute("data-img-id");
            if (imgId) {
              setVisibleIds((prev) => new Set(Array.from(prev).concat(imgId)));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: "200px" } // Load images 200px before they enter viewport
    );

    intersectionObserverRef.current = observer;

    // Observe all image containers
    const containers = containerRef.current.querySelectorAll("[data-img-id]");
    containers.forEach((container) => observer.observe(container));

    return () => observer.disconnect();
  }, [filteredItems, loading]);

  // Load image dimensions for visible images only
  useEffect(() => {
    const itemsToLoad = filteredItems.filter(
      (item) => visibleIds.has(item.id) && !imageDimensions[item.id]
    );

    if (itemsToLoad.length === 0) return;

    itemsToLoad.forEach((item) => {
      // Skip if already loading
      if (loadingImagesRef.current.has(item.id)) return;

      const img = new window.Image();
      loadingImagesRef.current.set(item.id, img);

      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setImageDimensions((prev) => ({
          ...prev,
          [item.id]: { width: img.width, height: img.height, aspectRatio },
        }));
        loadingImagesRef.current.delete(item.id);
      };

      img.onerror = () => {
        loadingImagesRef.current.delete(item.id);
        // Set default dimensions on error
        setImageDimensions((prev) => ({
          ...prev,
          [item.id]: { width: 1, height: 1, aspectRatio: 1 },
        }));
      };

      img.src = item.imageUrl;
    });
  }, [visibleIds, filteredItems, imageDimensions]);

  // Reset zoom when image changes (memoized)
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [selectedImage]);

  // Memoize event handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position.x, position.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, zoom, dragStart.x, dragStart.y]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleNavigate = useCallback((direction: "prev" | "next") => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex((item) => item.id === selectedImage.id);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0) newIndex = filteredItems.length - 1;
    if (newIndex >= filteredItems.length) newIndex = 0;

    setSelectedImage(filteredItems[newIndex]);
  }, [selectedImage, filteredItems]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setSelectedImage(null);
    if (e.key === "ArrowLeft") handleNavigate("prev");
    if (e.key === "ArrowRight") handleNavigate("next");
    if (e.key === "+" || e.key === "=") handleZoomIn();
    if (e.key === "-" || e.key === "_") handleZoomOut();
    if (e.key === "0") handleResetZoom();
  }, [handleNavigate, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Get aspect ratio style based on image dimensions
  const getItemStyle = useCallback((itemId: string) => {
    const dims = imageDimensions[itemId];
    if (!dims) {
      return { aspectRatio: 1 }; // Default to square while loading
    }

    // Clamp aspect ratio between 0.6 and 1.5 to prevent extreme sizes
    const clampedRatio = Math.max(0.6, Math.min(1.5, dims.aspectRatio));
    return { aspectRatio: clampedRatio };
  }, [imageDimensions]);

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
      {/* Tags cloud */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm secondary-color-text opacity-60 flex items-center gap-1 mr-2">
              <FaTag size={12} />
              Popular tags:
            </span>
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 secondary-color-text rounded-full text-sm transition-colors duration-300"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Masonry Grid */}
      <div ref={containerRef} className="masonry-grid">
        <style>{`
          .masonry-grid {
            column-count: 1;
            column-gap: 1rem;
          }
          @media (min-width: 640px) {
            .masonry-grid {
              column-count: 2;
            }
          }
          @media (min-width: 1024px) {
            .masonry-grid {
              column-count: 3;
            }
          }
          @media (min-width: 1280px) {
            .masonry-grid {
              column-count: 4;
            }
          }
          .masonry-item {
            break-inside: avoid;
            margin-bottom: 1rem;
          }
        `}</style>

        {filteredItems.map((item) => {
          const itemStyle = getItemStyle(item.id);

          return (
            <div
              key={item.id}
              data-img-id={item.id}
              onClick={() => setSelectedImage(item)}
              className="masonry-item group relative overflow-hidden rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-300"
              style={{ aspectRatio: itemStyle.aspectRatio }}
            >
              {/* Featured badge */}
              {item.featured && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-yellow-500/90 text-white rounded-full text-xs font-semibold shadow-lg">
                  <FaStar size={8} />
                  Featured
                </div>
              )}

              {/* Category badge */}
              {item.category && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs">
                  {item.category}
                </div>
              )}

              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                quality={90}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-medium font-heading text-sm truncate mb-1">
                    {item.title}
                  </p>
                  {item.location && (
                    <p className="text-white/70 text-xs truncate">
                      📍 {item.location}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-heading text-xl font-semibold">
                  {selectedImage.title}
                </h3>
                {selectedImage.featured && (
                  <FaStar className="text-yellow-400 flex-shrink-0 mt-1" size={16} />
                )}
              </div>
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
              {/* Tags in lightbox */}
              {selectedImage.tags && selectedImage.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedImage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="absolute top-4 right-16 text-white/50 text-xs hidden md:block">
            <div className="bg-black/50 rounded px-2 py-1">
              Scroll to zoom • Drag to move • Arrows to navigate
            </div>
          </div>
        </div>
      )}
    </>
  );
}
