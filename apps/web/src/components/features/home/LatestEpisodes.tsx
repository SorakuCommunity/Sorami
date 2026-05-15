"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentAnime } from "@/lib/anime-server";
import type { Anime } from "@/lib/anime-server";

export function LatestEpisodes() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentAnime(1).then((data) => {
      setAnimes(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="py-8 md:py-12 px-4 md:px-6">
        <h2 className="text-lg md:text-xl font-bold text-soraku-light mb-6">Latest Episodes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-soraku-surface border border-soraku-surface-light rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-soraku-surface-light" />
              <div className="p-2 space-y-2">
                <div className="h-4 bg-soraku-surface-light rounded w-3/4" />
                <div className="h-3 bg-soraku-surface-light rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 px-4 md:px-6">
      <h2 className="text-lg md:text-xl font-bold text-soraku-light mb-6">Latest Episodes</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {animes.map((anime) => (
          <Link
            key={anime.id}
            href={`/anime/${anime.id}`}
            className="group"
          >
            <div className="bg-soraku-surface border border-soraku-surface-light rounded-lg overflow-hidden hover:border-soraku-primary/40 transition-colors">
              <div className="relative aspect-[2/3]">
                <Image
                  src={anime.poster}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.6vw"
                />
                <div className="absolute top-2 left-2 bg-soraku-primary text-white text-xs font-medium px-2 py-0.5 rounded">
                  EP {anime.episodes || "?"}
                </div>
              </div>
              <div className="p-2">
                <h3 className="font-semibold text-soraku-light text-sm truncate group-hover:text-soraku-primary transition-colors">
                  {anime.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
