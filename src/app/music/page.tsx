"use client";

import { useEffect, useState, memo } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FaPlay, FaYoutube } from "react-icons/fa";

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
}

const VideoModal = ({
  isOpen,
  onClose,
  videoUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="primary-color-bg rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold secondary-color-text">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors secondary-color-text"
          >
            ✕
          </button>
        </div>
        <div className="relative aspect-video bg-black">
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const MusicRow = memo(
  ({ music, onPlay }: { music: Music; onPlay: () => void }) => {
    const { title, artist, coverImage, genre, year } = music;

    return (
      <div
        onClick={onPlay}
        className="group flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      >
        {/* Play Button */}
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
          <FaPlay className="secondary-color-text opacity-60 group-hover:opacity-100 ml-0.5 transition-colors" size={14} />
        </div>

        {/* Cover Image */}
        <div className="relative w-14 h-14 flex-shrink-0 bg-white/10 rounded-lg overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            quality={100}
            unoptimized
            className="object-cover"
            sizes="56px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold secondary-color-text truncate">{title}</h3>
          <p className="text-sm secondary-color-text opacity-60 truncate">{artist}</p>
        </div>

        {/* Genre Pills */}
        <div className="hidden sm:flex flex-wrap gap-1.5">
          {genre.slice(0, 2).map((g, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-white/10 secondary-color-text rounded-full"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Year */}
        <p className="text-sm secondary-color-text opacity-40 flex-shrink-0 hidden md:block">{year}</p>

        {/* YouTube Link */}
        {music.spotifyLink && (
          <a
            href={music.spotifyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors flex-shrink-0"
          >
            <FaYoutube size={16} />
          </a>
        )}
      </div>
    );
  }
);

MusicRow.displayName = "MusicRow";

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
          music: musicList,
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
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
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold secondary-color-text">Music</h1>
            <p className="secondary-color-text opacity-60">{state.music.length} tracks</p>
          </div>

          {/* List */}
          <div className="space-y-3">
            {state.music.map((item) => (
              <MusicRow
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
      />
    </>
  );
}
