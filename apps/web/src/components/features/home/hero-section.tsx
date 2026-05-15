"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Star, Info, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayerStore } from "@/store/player.store";
import type { Anime } from "@/types";

interface HeroSectionProps {
  anime: Anime;
  index: number;
}

export function HeroSection({ anime, index }: HeroSectionProps) {
  const setAnime = usePlayerStore((s) => s.setAnime);

  const statusLabel = anime.status === "ONGOING" ? "Airing" : anime.status === "COMPLETED" ? "Completed" : "Upcoming";
  const statusVariant = anime.status === "ONGOING" ? "airing" : anime.status === "COMPLETED" ? "completed" : "upcoming";

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={anime.banner || anime.poster}
          alt={anime.title}
          fill
          className="object-cover"
          priority={index === 0}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-soraku-dark via-soraku-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-soraku-dark/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-[1400px] px-4 md:px-6 relative h-full flex items-end pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Spotlight Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 text-sm font-bold bg-soraku-primary text-white rounded-lg">
              #{index + 1} Spotlight
            </span>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {anime.type && <Badge variant="secondary">{anime.type}</Badge>}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white">
            {anime.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-3 text-soraku-secondary text-sm">
            {anime.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-soraku-light font-medium">{anime.rating.toFixed(1)}</span>
              </span>
            )}
            {anime.totalEpisodes && (
              <span>{anime.totalEpisodes} Episodes</span>
            )}
            {anime.year && (
              <span>{anime.year}</span>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.slice(0, 4).map((genre) => (
                <Link
                  key={genre}
                  href={`/genre/${genre.toLowerCase()}`}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-soraku-secondary/20 text-soraku-light hover:bg-soraku-primary/20 hover:text-soraku-primary transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-soraku-secondary/80 mb-5 line-clamp-2 text-sm">
            {anime.description || "No description available."}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="accent" 
              size="lg" 
              className="gap-2"
              onClick={() => setAnime(anime.id, `${anime.id}-1`, 1)}
              asChild
            >
              <Link href={`/watch/${anime.id}?ep=1`}>
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link href={`/anime/${anime.id}`}>
                <Info className="w-5 h-5" />
                Details
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}