"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlay, FaYoutube } from "react-icons/fa";
import { LoadingSkeleton, EmptyState } from "@/components/ui/LoadingStates";
import { FilterButtonGroup } from "@/components/ui/Card";

interface MusicItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverImage: string;
  year: string;
  genre: string[];
  spotifyLink?: string;
}

interface MusicListProps {
  onEdit: (item: MusicItem) => void;
  refreshTrigger: number;
}

export function MusicList({ onEdit, refreshTrigger }: MusicListProps) {
  const [items, setItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const musicCollection = collection(db, "music");
        const musicSnapshot = await getDocs(musicCollection);
        const musicList = musicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MusicItem[];

        // Sort by year (newest first)
        musicList.sort((a, b) => parseInt(b.year) - parseInt(a.year));

        setItems(musicList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching music:", error);
        toast.error("Failed to load music");
        setLoading(false);
      }
    };

    fetchMusic();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;

    try {
      await deleteDoc(doc(db, "music", id));
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Music deleted successfully!");
    } catch (error) {
      console.error("Error deleting music:", error);
      toast.error("Failed to delete music");
    }
  };

  // Get all unique genres for filtering
  const allGenres = ["All", ...Array.from(new Set(items.flatMap((i) => i.genre || [])))].sort();

  const filteredItems = filter === "All"
    ? items
    : items.filter((item) => item.genre.includes(filter));

  if (loading) {
    return <LoadingSkeleton count={8} type="card" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="🎵"
        title="No music yet"
        description='Click "Create New" to add your first track'
      />
    );
  }

  return (
    <div>
      <FilterButtonGroup
        filters={allGenres}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl group"
          >
            {/* Cover Image */}
            <div className="relative w-16 h-16 flex-shrink-0 bg-white/10 rounded-lg overflow-hidden">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                quality={100}
                unoptimized
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold secondary-color-text truncate">{item.title}</h3>
              <p className="text-sm secondary-color-text opacity-60 truncate">{item.artist}</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {item.genre.slice(0, 3).map((g, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-white/10 secondary-color-text rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Year */}
            <p className="text-sm secondary-color-text opacity-40 flex-shrink-0 hidden sm:block">
              {item.year}
            </p>

            {/* YouTube Link */}
            {item.spotifyLink && (
              <a
                href={item.spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors flex-shrink-0"
                title="Open YouTube"
              >
                <FaYoutube size={16} />
              </a>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 secondary-color-text opacity-60 hover:opacity-100 hover:bg-white/10 rounded-full transition-colors"
                title="Edit"
              >
                <FaEdit size={14} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-500 opacity-60 hover:opacity-100 hover:bg-red-500/10 rounded-full transition-colors"
                title="Delete"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="secondary-color-text opacity-60 text-sm mt-6 text-center">
        {filteredItems.length} {filteredItems.length === 1 ? "track" : "tracks"}
        {filter !== "All" && ` in ${filter}`}
      </p>
    </div>
  );
}
