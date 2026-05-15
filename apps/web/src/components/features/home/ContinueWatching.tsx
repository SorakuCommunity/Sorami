"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { getTrendingAnime } from "@/lib/anime-client";
import type { Anime } from "@/lib/anime-client";

export function ContinueWatching() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingAnime(1).then((data) => {
      setAnimeList(data.slice(0, 4));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-5 h-5 text-soraku-primary" />
          <h2 className="text-2xl font-bold text-soraku-light">Continue Watching</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-soraku-surface border border-soraku-surface-light overflow-hidden">
              <div className="aspect-video bg-soraku-dark animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-soraku-dark rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-soraku-dark rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-5 h-5 text-soraku-primary" />
        <h2 className="text-2xl font-bold text-soraku-light">Continue Watching</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {animeList.map((anime) => (
          <Link
            key={anime.id}
            href={`/anime/${anime.id}`}
            className="rounded-lg bg-soraku-surface border border-soraku-surface-light overflow-hidden hover:border-soraku-primary/40 transition-colors"
          >
            <div className="relative aspect-video">
              <Image
                src={anime.poster}
                alt={anime.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-soraku-dark">
                <div className="h-full bg-soraku-primary" style={{ width: "30%" }} />
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-soraku-light text-sm line-clamp-1">
                {anime.title}
              </h3>
              <p className="text-soraku-secondary text-xs mt-1">
                {anime.type || anime.status}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
