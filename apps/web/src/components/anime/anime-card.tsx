"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Star, Play } from "lucide-react";

export interface AnimeCardProps {
  anime: {
    id: string;
    title: string;
    poster: string;
    rating?: number;
    episodes?: number;
    type?: string;
    status?: string;
    genres?: string[];
    studio?: string;
    year?: number;
    season?: string;
  };
  rank?: number;
  showRank?: boolean;
  onWatchClick?: () => void;
  variant?: "default" | "large" | "horizontal";
}

export function AnimeCard({
  anime,
  rank,
  showRank = false,
  onWatchClick,
  variant = "default",
}: AnimeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setRotation({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const isLarge = variant === "large";
  const isHorizontal = variant === "horizontal";

  const seasonLabel =
    anime.season && anime.year
      ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`
      : anime.year
        ? String(anime.year)
        : null;

  if (isHorizontal) {
    return (
      <Link
        href={`/anime/${anime.id}`}
        className="flex gap-4 p-3 rounded-lg bg-soraku-surface border border-soraku-surface-light hover:border-soraku-primary/40 transition-colors"
      >
        <div className="relative w-24 h-32 md:w-28 md:h-40 rounded-lg overflow-hidden shrink-0">
          <Image
            src={anime.poster}
            alt={anime.title}
            fill
            className="object-cover"
            sizes="112px"
          />
          <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1">
            {anime.type && (
              <span className="bg-white/20 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                {anime.type}
              </span>
            )}
            {anime.episodes && (
              <span className="bg-soraku-primary text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                {anime.episodes}eps
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-soraku-light line-clamp-2 leading-tight">
            {anime.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-soraku-secondary">
            {anime.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {anime.rating.toFixed(1)}
              </span>
            )}
            {anime.episodes && <span>{anime.episodes} eps</span>}
            {anime.year && <span>{anime.year}</span>}
          </div>
          {anime.type && (
            <span className="mt-2 text-xs text-soraku-secondary/70">
              {anime.type}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/anime/${anime.id}`}
      className={cn(
        "group/card relative block",
        isLarge ? "w-[160px] md:w-[200px]" : "w-[130px] md:w-[160px]"
      )}
    >
      <div className="relative">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1})`,
            transition: "transform 0.3s ease-out",
          }}
          className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg"
        >
          <Image
            src={anime.poster}
            alt={anime.title}
            fill
            className="object-cover"
            sizes={isLarge ? "200px" : "160px"}
          />

          {/* Glare */}
          <div
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              opacity: glare.opacity,
            }}
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          />

          {/* Play button overlay */}
          {onWatchClick && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWatchClick();
              }}
              className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-soraku-primary/90 flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
            </button>
          )}

          {/* Rank badge */}
          {showRank && rank && (
            <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded text-xs font-bold bg-soraku-surface-light/90 text-soraku-light backdrop-blur-sm">
              #{rank}
            </div>
          )}

          {/* Status: Upcoming */}
          {anime.status === "NOT_YET_RELEASED" && (
            <span className="absolute top-2 right-2 z-20 px-2 py-0.5 text-xs font-semibold rounded bg-soraku-accent text-soraku-dark">
              Upcoming
            </span>
          )}

          {/* Bottom badges */}
          <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5">
            {anime.type && (
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-bold">
                {anime.type}
              </span>
            )}
            {anime.episodes && (
              <span className="bg-soraku-primary text-white px-2 py-0.5 rounded text-xs font-bold">
                {anime.episodes} eps
              </span>
            )}
          </div>
        </div>

        {/* Popup tooltip */}
        <div className="absolute left-full top-0 ml-4 z-50 hidden lg:group-hover/card:block animate-fade-in-up pointer-events-none">
          <div className="bg-soraku-surface rounded-2xl p-4 shadow-2xl w-[260px] min-h-[200px] relative border border-soraku-surface-light">
            <div className="absolute -left-[6px] top-6 w-3 h-3 bg-soraku-surface rotate-45 rounded-sm border-l border-t border-soraku-surface-light" />

            {seasonLabel && (
              <h4 className="text-base font-bold text-soraku-light mb-2">
                {seasonLabel}
              </h4>
            )}

            {anime.studio && (
              <p className="text-sm text-soraku-primary font-medium mb-2">
                {anime.studio}
              </p>
            )}

            <p className="text-xs text-soraku-secondary mb-3">
              {anime.type}
              {anime.type && anime.episodes && " · "}
              {anime.episodes && `${anime.episodes} episodes`}
            </p>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-soraku-primary/20 text-soraku-primary"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {anime.rating && (
              <div className="flex items-center gap-1 mt-3">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-soraku-light font-medium">
                  {anime.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-soraku-light line-clamp-2 group-hover/card:text-soraku-primary transition-colors leading-tight">
        {anime.title}
      </h3>
    </Link>
  );
}
