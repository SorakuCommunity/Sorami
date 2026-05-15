"use client";

import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  List,
  Star,
  Clock,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/container";
import { usePlayerStore } from "@/store/playerStore";

interface AnimeInfo {
  id: string;
  title: string;
  titleEnglish?: string;
  titleNative?: string;
  poster: string;
  cover?: string;
  description?: string;
  rating?: number;
  totalEpisodes?: number;
  status: string;
  genres?: string[];
  releaseDate?: string;
  duration?: string;
  studios?: string[];
  type?: string;
}

interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  image?: string;
  isSubbed?: boolean;
  isDubbed?: boolean;
}

interface Source {
  url: string;
  quality: string;
  isM3U8?: boolean;
}

interface Subtitle {
  url: string;
  label: string;
  lang?: string;
}

function HlsPlayer({
  src,
  poster,
  subtitles = [],
  onTimeUpdate,
  onEnded,
  initialTime = 0,
}: {
  src: string;
  poster?: string;
  subtitles?: Subtitle[];
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  initialTime?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    volume,
    isMuted,
    playbackSpeed,
    selectedSubtitle,
    introSkipSeconds,
    isPlaying,
    currentTime,
    duration,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    setSelectedSubtitle,
    setIsPlaying,
    setCurrentTime,
    setDuration,
  } = usePlayerStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (src.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const skipBack = () => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    const newTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
    videoRef.current.currentTime = newTime;
  };

  const skipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + introSkipSeconds,
        videoRef.current.duration || 0
      );
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (videoRef.current) videoRef.current.volume = value;
  };

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  const handleSubtitleChange = (subtitle: Subtitle | null) => {
    setSelectedSubtitle(subtitle?.label || null);
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      for (let i = 0; i < videoRef.current.textTracks.length; i++) {
        videoRef.current.textTracks[i].mode =
          subtitle && subtitle.label === videoRef.current.textTracks[i].label
            ? "showing"
            : "hidden";
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const time = (e.target as HTMLVideoElement).currentTime;
          setCurrentTime(time);
          onTimeUpdate?.(time);
        }}
        onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
        onEnded={onEnded}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) setDuration(video.duration);
        }}
      >
        {subtitles.map((subtitle, index) => (
          <track
            key={index}
            kind="captions"
            src={subtitle.url}
            label={subtitle.label}
            lang={subtitle.lang || "en"}
            default={selectedSubtitle === subtitle.label}
          />
        ))}
      </video>

      {/* Center play/pause overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-black/50 hover:bg-black/70"
            onClick={skipBack}
          >
            <SkipBack className="h-6 w-6 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-soraku-primary hover:bg-soraku-primary/90"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-black/50 hover:bg-black/70"
            onClick={skipForward}
          >
            <SkipForward className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="relative h-1 bg-white/30 rounded-full cursor-pointer group/slider">
            <div
              className="absolute h-full bg-soraku-primary rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 accent-soraku-primary cursor-pointer"
                />
              </div>

              <span className="text-white text-sm font-medium tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20 text-xs"
                onClick={skipIntro}
              >
                Skip Intro
              </Button>

              {/* Settings dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1C1E22] border border-white/10 rounded-lg shadow-xl z-50 py-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Speed
                    </div>
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          handleSpeedChange(speed);
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-white/10 ${
                          playbackSpeed === speed
                            ? "text-soraku-primary"
                            : "text-white/80"
                        }`}
                      >
                        {speed}x {playbackSpeed === speed && "✓"}
                      </button>
                    ))}
                    {subtitles.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 text-xs font-semibold text-white/60 uppercase tracking-wider mt-2">
                          Subtitles
                        </div>
                        <button
                          onClick={() => {
                            handleSubtitleChange(null);
                            setShowSettings(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-white/10 ${
                            selectedSubtitle === null
                              ? "text-soraku-primary"
                              : "text-white/80"
                          }`}
                        >
                          Off {selectedSubtitle === null && "✓"}
                        </button>
                        {subtitles.map((sub) => (
                          <button
                            key={sub.label}
                            onClick={() => {
                              handleSubtitleChange(sub);
                              setShowSettings(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-white/10 ${
                              selectedSubtitle === sub.label
                                ? "text-soraku-primary"
                                : "text-white/80"
                            }`}
                          >
                            {sub.label} {selectedSubtitle === sub.label && "✓"}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0F] p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="w-full aspect-video rounded-lg mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <WatchPageContent />
    </Suspense>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);
  if (hours > 0) {
    return `${hours}:${String(mins % 60).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

const SERVERS = ["Auto", "Sorami", "Hikari", "Sora", "Bun", "Yun", "Kaze", "Hana"] as const;

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function WatchPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const epParam = searchParams.get("ep");
  const urlSlug = params.slug ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) : undefined;

  const [anime, setAnime] = useState<AnimeInfo | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSource, setCurrentSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesFetched, setSourcesFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentServer, setCurrentServer] = useState<string>("Auto");
  const { setIsPlaying } = usePlayerStore();

  const currentEpisodeNumber = epParam ? parseInt(epParam) : 1;
  const currentEpisode = episodes.find((ep) => ep.number === currentEpisodeNumber);
  const derivedSlug = useMemo(() => anime ? slugify(anime.titleEnglish || anime.title) : urlSlug || id, [anime, urlSlug, id]);
  const slug = urlSlug || derivedSlug;

  const fetchAnime = useCallback(async () => {
    try {
      const res = await fetch(`/api/anime/${id}`);
      if (!res.ok) throw new Error("Failed to fetch anime");
      const data = await res.json();
      setAnime(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load anime");
    }
  }, [id]);

  const fetchEpisodes = useCallback(async () => {
    setEpisodesLoading(true);
    try {
      const res = await fetch(`/api/anime/${id}/episodes`);
      if (!res.ok) throw new Error("Failed to fetch episodes");
      const data = await res.json();
      setEpisodes(data);
    } catch (err) {
      console.error("Failed to fetch episodes:", err);
    } finally {
      setEpisodesLoading(false);
    }
  }, [id]);

  const fetchSources = useCallback(async (episodeId: string) => {
    setSourcesLoading(true);
    setSourcesFetched(false);
    try {
      const serverParam = currentServer !== "Auto" ? `?server=${currentServer}` : "";
      const res = await fetch(`/api/anime/episode/sources/${episodeId}${serverParam}`);
      if (!res.ok) throw new Error("Failed to fetch sources");
      const data = await res.json();
      setSources(data.sources || []);
      setSubtitles(data.subtitles || []);
      const m3u8 = data.sources?.find(
        (s: Source) => s.isM3U8 || s.quality === "default" || s.url.endsWith(".m3u8")
      );
      const rawUrl = m3u8?.url || data.sources?.[0]?.url || "";
      // Proxy m3u8 through Next.js API to bypass CDN blocks (only m3u8, not .ts)
      const proxiedUrl = rawUrl ? `/api/stream/proxy?url=${encodeURIComponent(rawUrl)}` : "";
      setCurrentSource(proxiedUrl);
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    } finally {
      setSourcesLoading(false);
      setSourcesFetched(true);
    }
  }, [currentServer]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAnime(), fetchEpisodes()]).finally(() => setLoading(false));
  }, [fetchAnime, fetchEpisodes]);

  useEffect(() => {
    if (currentEpisode?.id) {
      fetchSources(currentEpisode.id);
    }
  }, [currentEpisode?.id, fetchSources]);

  useEffect(() => {
    setIsPlaying(false);
  }, [currentEpisodeNumber, setIsPlaying]);

  const navigateEpisode = useCallback(
    (episodeNumber: number) => {
      const path = slug ? `/watch/${id}/${slug}?ep=${episodeNumber}` : `/watch/${id}?ep=${episodeNumber}`;
      router.push(path, { scroll: false });
    },
    [router, id, slug]
  );

  useEffect(() => {
    setIsPlaying(false);
    setCurrentSource("");
  }, [epParam, setIsPlaying]);

  const handleEpisodeEnded = useCallback(() => {
    if (currentEpisode && episodes.length > 0) {
      const nextEpisode = episodes.find(
        (ep) => ep.number === currentEpisodeNumber + 1
      );
      if (nextEpisode) {
        navigateEpisode(nextEpisode.number);
      }
    }
  }, [currentEpisode, episodes, currentEpisodeNumber, navigateEpisode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space": {
          e.preventDefault();
          const video = document.querySelector("video");
          if (video) {
            if (video.paused) video.play();
            else video.pause();
          }
          break;
        }
        case "KeyF": {
          e.preventDefault();
          const container = document.querySelector("[data-player-container]");
          if (container) {
            if (!document.fullscreenElement) {
              container.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const video = document.querySelector("video");
          if (video) {
            video.currentTime = Math.max(0, video.currentTime - 10);
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const video = document.querySelector("video");
          if (video) {
            video.currentTime = Math.min(
              video.duration || 0,
              video.currentTime + 10
            );
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const video = document.querySelector("video");
          if (video) {
            const newVol = Math.min(1, video.volume + 0.1);
            video.volume = newVol;
          }
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const video = document.querySelector("video");
          if (video) {
            const newVol = Math.max(0, video.volume - 0.1);
            video.volume = newVol;
          }
          break;
        }
        case "KeyM": {
          e.preventDefault();
          const video = document.querySelector("video");
          if (video) {
            video.muted = !video.muted;
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="w-full aspect-video rounded-lg mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white/80 mb-4">
            {error || "Anime not found"}
          </h1>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <div className="max-w-[1920px] mx-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:text-white shrink-0"
            asChild
          >
            <Link href={`/anime/${id}`}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {anime.title}
            </h1>
            <span className="text-white/40 shrink-0">•</span>
            <span className="text-sm text-white/60 shrink-0">
              EP {currentEpisodeNumber}
            </span>
          </div>
          {currentEpisode?.title && (
            <span className="text-sm text-white/40 hidden sm:block truncate">
              &mdash; {currentEpisode.title}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 px-4 pb-6 lg:px-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Player */}
            <div
              data-player-container
              className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
            >
              {sourcesLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  {currentEpisode?.image && (
                    <Image
                      src={currentEpisode.image}
                      alt={currentEpisode?.title || ""}
                      fill
                      className="object-cover opacity-40"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-soraku-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/60 text-sm">Loading stream...</p>
                  </div>
                </div>
              ) : sourcesFetched && sources.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  {currentEpisode?.image && (
                    <Image
                      src={currentEpisode.image}
                      alt={currentEpisode?.title || ""}
                      fill
                      className="object-cover opacity-40"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-soraku-surface flex items-center justify-center">
                      <span className="text-2xl">📺</span>
                    </div>
                    <p className="text-white/80 text-sm font-medium">No sources available</p>
                    <p className="text-white/40 text-xs">Try a different episode or server</p>
                  </div>
                </div>
              ) : !currentSource ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <p className="text-white/60 text-sm">No video source</p>
                </div>
              ) : (
                <HlsPlayer
                  src={currentSource}
                  poster={currentEpisode?.image || anime.poster}
                  subtitles={subtitles}
                  onEnded={handleEpisodeEnded}
                />
              )}
            </div>

            {/* Server selection */}
            <div className="mt-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                <span className="text-xs text-white/40 font-medium shrink-0">Servers:</span>
                {SERVERS.map((server) => (
                  <button
                    key={server}
                    onClick={() => setCurrentServer(server)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      currentServer === server
                        ? "bg-soraku-primary text-white shadow-lg shadow-soraku-primary/25"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {server}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode navigation */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentEpisodeNumber <= 1}
                onClick={() => navigateEpisode(currentEpisodeNumber - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden gap-1 text-white/60"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <List className="h-4 w-4" />
                Episodes
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentEpisodeNumber >= (anime.totalEpisodes || episodes.length)}
                onClick={() => navigateEpisode(currentEpisodeNumber + 1)}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Anime info */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative w-20 aspect-[2/3] rounded-md overflow-hidden shrink-0 hidden sm:block">
                  <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white">
                    {anime.titleEnglish || anime.title}
                  </h2>
                  {anime.titleNative && (
                    <p className="text-sm text-white/40 mt-0.5">
                      {anime.titleNative}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/60">
                    {anime.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {anime.rating}
                      </span>
                    )}
                    {anime.releaseDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {anime.releaseDate}
                      </span>
                    )}
                    {anime.duration && (
                      <span className="flex items-center gap-1">
                        <Tv className="w-3.5 h-3.5" />
                        {anime.duration}
                      </span>
                    )}
                    {anime.status && (
                      <Badge
                        variant={anime.status === "ONGOING" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {anime.status}
                      </Badge>
                    )}
                  </div>
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {anime.genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="text-xs border-white/10 text-white/50"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {anime.description && (
                    <p className="text-sm text-white/50 leading-relaxed mt-3 line-clamp-3">
                      {anime.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Episode sidebar */}
          <div
            className={`${
              showSidebar ? "block" : "hidden"
            } lg:block w-full lg:w-80 xl:w-96 shrink-0`}
          >
            <div className="bg-white/[0.03] rounded-lg border border-white/[0.06] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <List className="h-4 w-4 text-soraku-primary" />
                <span className="text-sm font-semibold text-white">
                  Episodes
                </span>
                {anime.totalEpisodes && (
                  <span className="text-xs text-white/40 ml-auto">
                    {episodes.length} of {anime.totalEpisodes}
                  </span>
                )}
              </div>

              {episodesLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : episodes.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">
                  No episodes available
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-240px)] scrollbar-hide">
                  {episodes.map((ep) => (
                    <button
                      key={ep.number}
                      onClick={() => navigateEpisode(ep.number)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-white/[0.03] last:border-b-0 ${
                        ep.number === currentEpisodeNumber
                          ? "bg-soraku-primary/10 border-l-2 border-l-soraku-primary"
                          : "hover:bg-white/[0.04] border-l-2 border-l-transparent"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          ep.number === currentEpisodeNumber
                            ? "bg-soraku-primary text-white"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {ep.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm truncate ${
                            ep.number === currentEpisodeNumber
                              ? "text-white font-medium"
                              : "text-white/60"
                          }`}
                        >
                          {ep.title || `Episode ${ep.number}`}
                        </p>
                      </div>
                      {ep.isDubbed && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-5 border-white/10 text-white/40 shrink-0"
                        >
                          DUB
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
