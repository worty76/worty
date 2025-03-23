"use client";

import { useEffect, useState, memo } from "react";
import Image from "next/image";
import { MusicCardSkeleton } from "@/components/music/MusicCardSkeleton";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="primary-color-bg rounded-lg max-w-4xl w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold secondary-color-text">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:opacity-70 secondary-color-text"
          >
            ✕
          </button>
        </div>
        <div className="relative aspect-video">
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full rounded-lg"
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

const MusicCard = memo(
  ({ music, onPlay }: { music: Music; onPlay: () => void }) => {
    const { title, artist, coverImage, genre, spotifyLink, year } = music;
    return (
      <div
        onClick={onPlay}
        className="group relative overflow-hidden rounded-lg bg-gradient-to-b from-gray-100/10 to-gray-200/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] cursor-pointer"
      >
        <div className="relative aspect-square">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-all duration-500 group-hover:brightness-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />
        </div>
        <div className="p-4 ">
          <div className="flex flex-wrap gap-2 mb-2 duration-1000">
            {genre.map((g, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full primary-color-bg secondary-color-text backdrop-blur-sm transition-all duration-1000"
              >
                {g}
              </span>
            ))}
          </div>
          <h3 className="font-semibold secondary-color-text line-clamp-1 duration-1000">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm secondary-color-text opacity-70 duration-1000">
              {artist}
            </p>
            <span className="text-xs secondary-color-text opacity-60 duration-1000">
              •
            </span>
            <p className="text-xs secondary-color-text opacity-60 duration-1000">
              {year}
            </p>
          </div>
          {spotifyLink && (
            <a
              href={spotifyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm secondary-color-text opacity-70 hover:opacity-100 transition-all duration-1000"
            >
              Listen on Youtube
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z" />
              </svg>
            </a>
          )}
        </div>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <MusicCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center text-red-500 p-4 rounded-lg bg-red-50">
          <p>{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {state.music.map((item) => (
            <MusicCard
              key={item.id}
              music={item}
              onPlay={() => handlePlay(item)}
            />
          ))}
        </div>
      </div>
      <VideoModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        videoUrl={modal.currentMusic?.spotifyLink}
        title={modal.currentMusic?.title || ""}
      />
    </>
  );
}
