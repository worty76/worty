"use client";

import { useEffect, useState, memo } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FaPlay, FaYoutube, FaTimes } from "react-icons/fa";

export const dynamic = "force-dynamic";

interface Music {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverImage: string;
  year: string;
  genre: string[];
  spotifyLink?: string;
  deleted?: boolean;
}

const VideoModal = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  artist,
  coverImage,
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title: string;
  artist: string;
  coverImage: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Now playing bar at top */}
        <div className="flex items-center gap-3 p-4 secondary-color-bg rounded-t-2xl border-b border-secondary-color-border/20">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={coverImage}
              alt={title}
              fill
              unoptimized
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium secondary-color-text truncate">{title}</p>
            <p className="text-xs secondary-color-text/50 truncate">{artist}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 secondary-color-text/40 hover:secondary-color-text hover:bg-secondary-color-bg rounded-full transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Video */}
        <div className="relative aspect-video bg-black rounded-b-2xl overflow-hidden">
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

const MusicCard = memo(
  ({ music, onPlay }: { music: Music; onPlay: () => void }) => {
    const { title, artist, coverImage } = music;

    return (
      <div
        onClick={onPlay}
        className="group cursor-pointer"
      >
        {/* Cover */}
        <div className="relative aspect-square rounded-xl overflow-hidden secondary-color-bg/50 mb-3">
          <Image
            src={coverImage}
            alt={title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <FaPlay className="text-primary-color-bg ml-0.5" size={16} />
            </div>
          </div>
        </div>

        {/* Info */}
        <h3 className="text-sm font-medium secondary-color-text truncate">{title}</h3>
        <p className="text-xs secondary-color-text/45 truncate mt-0.5">{artist}</p>
      </div>
    );
  }
);

MusicCard.displayName = "MusicCard";

export default function Music() {
  const [state, setState] = useState({
    music: [] as Music[],
    isLoading: true,
    error: null as string | null,
  });
  const [modal, setModal] = useState({
    isOpen: false,
    currentMusic: null as Music | null,
  });

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const musicCollection = collection(db, "music");
        const musicSnapshot = await getDocs(musicCollection);
        const musicList = musicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Music[];

        setState((prev) => ({
          ...prev,
          music: musicList.filter((m) => m.deleted !== true),
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Failed to fetch music data",
          isLoading: false,
        }));
        console.error("Error fetching music:", error);
      }
    };

    fetchMusic();
  }, []);

  const handlePlay = (music: Music) => {
    setModal({
      isOpen: true,
      currentMusic: music,
    });
  };

  const handleCloseModal = () => {
    setModal({
      isOpen: false,
      currentMusic: null,
    });
  };

  if (state.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="aspect-square bg-secondary-color-bg/30 rounded-xl animate-pulse" />
              <div className="mt-3 h-3 w-3/4 bg-secondary-color-bg/30 rounded animate-pulse" />
              <div className="mt-1.5 h-2.5 w-1/2 bg-secondary-color-bg/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-red-400 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen primary-color-bg transition-colors duration-1000">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest secondary-color-text/30 mb-2">Collection</p>
            <h1 className="text-2xl font-bold secondary-color-text">Favorite Music</h1>
            <p className="text-sm secondary-color-text/40 mt-1">{state.music.length} tracks</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {state.music.map((item) => (
              <MusicCard
                key={item.id}
                music={item}
                onPlay={() => handlePlay(item)}
              />
            ))}
          </div>
        </div>
      </main>

      <VideoModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        videoUrl={modal.currentMusic?.spotifyLink}
        title={modal.currentMusic?.title || ""}
        artist={modal.currentMusic?.artist || ""}
        coverImage={modal.currentMusic?.coverImage || ""}
      />
    </>
  );
}
