"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaTimes,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
} from "react-icons/fa";

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

function getVideoId(url: string): string | null {
  const match = url.match(/(?:embed\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const MusicCard = memo(
  ({ music, onPlay, isCurrentTrack, isPlaying }: {
    music: Music;
    onPlay: () => void;
    isCurrentTrack: boolean;
    isPlaying: boolean;
  }) => {
    return (
      <div onClick={onPlay} className="group cursor-pointer">
        <div className="relative aspect-square rounded-xl overflow-hidden secondary-color-bg/50 mb-3">
          <Image
            src={music.coverImage}
            alt={music.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
            {isCurrentTrack && isPlaying ? (
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-100 scale-100 shadow-lg">
                <div className="flex items-end gap-[3px] h-4">
                  <span className="w-[3px] bg-primary-color-bg rounded-full animate-[eq_0.8s_ease-in-out_infinite]" />
                  <span className="w-[3px] bg-primary-color-bg rounded-full animate-[eq_0.8s_ease-in-out_0.2s_infinite]" />
                  <span className="w-[3px] bg-primary-color-bg rounded-full animate-[eq_0.8s_ease-in-out_0.4s_infinite]" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                <FaPlay className="secondary-color-text ml-0.5" size={16} />
              </div>
            )}
          </div>
        </div>
        <h3 className={`text-sm font-medium truncate ${isCurrentTrack ? "text-white" : "secondary-color-text"}`}>
          {music.title}
        </h3>
        <p className={`text-xs truncate mt-0.5 ${isCurrentTrack ? "secondary-color-text opacity-70" : "secondary-color-text opacity-45"}`}>
          {music.artist}
        </p>
      </div>
    );
  }
);

MusicCard.displayName = "MusicCard";

export default function Music() {
  const [music, setMusic] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [filterArtist, setFilterArtist] = useState<string | null>(null);

  const artists = Array.from(new Set(music.map((m) => m.artist))).sort();
  const artistCounts = artists.reduce((acc, a) => { acc[a] = music.filter(m => m.artist === a).length; return acc; }, {} as Record<string, number>);
  const filteredMusic = filterArtist ? music.filter((m) => m.artist === filterArtist) : music;
  const ITEMS_PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const visibleMusic = filteredMusic.slice(0, visibleCount);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filterArtist]);

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredMusic.length) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredMusic.length));
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredMusic.length]);

  const playerRef = useRef<YT.Player | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isApiReady = useRef(false);
  const apiLoadCallbacks = useRef<(() => void)[]>([]);
  const handleNextRef = useRef<() => void>(() => {});

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window !== "undefined" && !window.YT) {
      window.onYouTubeIframeAPIReady = () => {
        isApiReady.current = true;
        apiLoadCallbacks.current.forEach((cb) => cb());
        apiLoadCallbacks.current = [];
      };

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    } else if (window.YT) {
      isApiReady.current = true;
    }
  }, []);

  const createPlayer = useCallback((videoId: string) => {
    const init = () => {
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        playerRef.current.playVideo();
        return;
      }

      if (!containerRef.current) return;

      // Ensure the container has a unique id
      const playerId = "yt-player-hidden";
      let existingDiv = document.getElementById(playerId);
      if (!existingDiv) {
        existingDiv = document.createElement("div");
        existingDiv.id = playerId;
        containerRef.current.appendChild(existingDiv);
      }

      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
            event.target.setPlaybackRate(playbackRate);
            setDuration(event.target.getDuration());
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(playerRef.current?.getDuration() || 0);
              startProgressPoll();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressPoll();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              stopProgressPoll();
              handleNextRef.current();
            }
          },
        },
      });
    };

    if (isApiReady.current) {
      init();
    } else {
      apiLoadCallbacks.current.push(init);
    }
  }, [volume, playbackRate]);

  const startProgressPoll = useCallback(() => {
    stopProgressPoll();
    progressRef.current = setInterval(() => {
      if (playerRef.current) {
        setProgress(playerRef.current.getCurrentTime());
      }
    }, 250);
  }, []);

  const stopProgressPoll = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  // Fetch music
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const musicCollection = collection(db, "music");
        const musicSnapshot = await getDocs(musicCollection);
        const musicList = musicSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Music))
          .filter((m) => m.deleted !== true);
        setMusic(musicList);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch music data");
        setIsLoading(false);
        console.error("Error fetching music:", err);
      }
    };
    fetchMusic();
  }, []);

  const musicRef = useRef(music);
  musicRef.current = music;
  const currentTrackIndexRef = useRef(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;

  const handlePlay = useCallback(
    (index: number) => {
      const track = musicRef.current[index];
      if (!track?.spotifyLink) return;

      const videoId = getVideoId(track.spotifyLink);
      if (!videoId) return;

      setCurrentTrackIndex(index);
      setShowPlayer(true);
      setProgress(0);
      createPlayer(videoId);
    },
    [createPlayer]
  );

  const handleNextInternal = useCallback(() => {
    const len = musicRef.current.length;
    if (len === 0) return;
    const cur = currentTrackIndexRef.current;
    const newIndex = cur >= len - 1 ? 0 : cur + 1;
    handlePlay(newIndex);
  }, [handlePlay]);

  handleNextRef.current = handleNextInternal;

  const handleTogglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playerRef.current.getPlayerState() === YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, []);

  const handlePrev = useCallback(() => {
    const len = musicRef.current.length;
    if (len === 0) return;
    const cur = currentTrackIndexRef.current;
    const newIndex = cur <= 0 ? len - 1 : cur - 1;
    handlePlay(newIndex);
  }, [handlePlay]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const seekTime = ratio * duration;
    playerRef.current.seekTo(seekTime, true);
    setProgress(seekTime);
  }, [duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    playerRef.current?.setVolume(vol);
  }, []);

  const handleSpeedCycle = useCallback(() => {
    const currentIdx = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIdx = (currentIdx + 1) % PLAYBACK_RATES.length;
    const newRate = PLAYBACK_RATES[nextIdx];
    setPlaybackRate(newRate);
    playerRef.current?.setPlaybackRate(newRate);
  }, [playbackRate]);

  const handleClose = useCallback(() => {
    playerRef.current?.stopVideo();
    playerRef.current?.destroy();
    playerRef.current = null;
    stopProgressPoll();
    setShowPlayer(false);
    setIsPlaying(false);
    setCurrentTrackIndex(-1);
    setProgress(0);
    setDuration(0);
  }, [stopProgressPoll]);

  const currentTrack = currentTrackIndex >= 0 ? music[currentTrackIndex] : null;

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-red-400 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen primary-color-bg transition-colors duration-1000">
      {/* Hidden YouTube player container */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12 pb-40">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest secondary-color-text opacity-30 mb-2">
            Collection
          </p>
          <h1 className="text-2xl font-bold secondary-color-text">Favorite Music</h1>
          <p className="text-sm secondary-color-text opacity-40 mt-1">{filteredMusic.length} tracks</p>
        </div>

        {/* Artist filter */}
        {artists.length > 0 && (
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest secondary-color-text opacity-30 mb-3">Artists</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterArtist(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterArtist === null
                    ? "bg-[rgb(221,198,182)] text-[rgb(38,34,35)]"
                    : "bg-white/5 secondary-color-text opacity-60 hover:opacity-100"
                }`}
              >
                All ({music.length})
              </button>
              {artists.map((artist) => (
                <button
                  key={artist}
                  onClick={() => setFilterArtist(artist)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterArtist === artist
                      ? "bg-[rgb(221,198,182)] text-[rgb(38,34,35)]"
                      : "bg-white/5 secondary-color-text opacity-60 hover:opacity-100"
                  }`}
                >
                  {artist} ({artistCounts[artist]})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleMusic.map((item) => {
            const idx = music.indexOf(item);
            return (
              <MusicCard
                key={item.id}
                music={item}
                onPlay={() => handlePlay(idx)}
                isCurrentTrack={idx === currentTrackIndex}
                isPlaying={idx === currentTrackIndex && isPlaying}
              />
            );
          })}
        </div>
        {/* Infinite scroll sentinel */}
        {visibleCount < filteredMusic.length && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-[rgb(221,198,182)]/20 border-t-[rgb(221,198,182)] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom Player Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          showPlayer ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Progress bar - clickable to seek */}
        <div
          className="h-1 bg-secondary-color-bg/30 cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-amber-500/80 group-hover:bg-amber-500 transition-colors"
            style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
          />
        </div>

        {/* Controls */}
        <div className="secondary-color-bg/95 backdrop-blur-xl border-t border-secondary-color-border/10">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
            {/* Song info */}
            {currentTrack && (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                  <Image
                    src={currentTrack.coverImage}
                    alt={currentTrack.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium secondary-color-text truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs secondary-color-text opacity-50 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            )}

            {/* Center controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 secondary-color-text opacity-60 hover:opacity-100 transition-colors"
              >
                <FaStepBackward size={14} />
              </button>
              <button
                onClick={handleTogglePlay}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <FaPause className="secondary-color-text" size={14} />
                ) : (
                  <FaPlay className="secondary-color-text ml-0.5" size={14} />
                )}
              </button>
              <button
                onClick={handleNextInternal}
                className="p-2 secondary-color-text opacity-60 hover:opacity-100 transition-colors"
              >
                <FaStepForward size={14} />
              </button>
            </div>

            {/* Time display */}
            <div className="text-[11px] secondary-color-text opacity-40 font-mono hidden sm:flex items-center gap-1.5 w-24 justify-center">
              <span>{formatTime(progress)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Volume control - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  const newVol = volume > 0 ? 0 : 80;
                  setVolume(newVol);
                  playerRef.current?.setVolume(newVol);
                }}
                className="secondary-color-text opacity-60 hover:opacity-100 transition-colors"
              >
                {volume === 0 ? (
                  <FaVolumeMute size={14} />
                ) : volume < 50 ? (
                  <FaVolumeDown size={14} />
                ) : (
                  <FaVolumeUp size={14} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Speed control */}
            <button
              onClick={handleSpeedCycle}
              className="text-[11px] font-bold secondary-color-text opacity-60 hover:opacity-100 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
            >
              {playbackRate}x
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 secondary-color-text opacity-40 hover:opacity-100 transition-colors ml-1"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe for equalizer animation */}
      <style jsx global>{`
        @keyframes eq {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </main>
  );
}
