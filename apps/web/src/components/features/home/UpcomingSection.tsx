"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { getAiringAnime } from "@/lib/anime-server";
import type { Anime } from "@/lib/anime-server";

export function UpcomingSection() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAiringAnime(1)
      .then(setAnime)
      .finally(() => setLoading(false));
  }, []);

  const statusStyles: Record<string, string> = {
    ONGOING: "bg-soraku-primary text-white",
    COMPLETED: "bg-soraku-secondary text-white",
    UPCOMING: "bg-yellow-600 text-white",
  };

  return (
    <section className="py-8 md:py-12 px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-3 mb-6">
        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-soraku-primary" />
        <h2 className="text-xl md:text-2xl font-bold text-soraku-light">Upcoming Releases</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-soraku-surface border border-soraku-surface-light overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-soraku-surface-light" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-soraku-surface-light rounded w-3/4" />
                  <div className="h-3 bg-soraku-surface-light rounded w-1/3" />
                </div>
              </div>
            ))
          : anime.slice(0, 8).map((a) => (
              <Link
                key={a.id}
                href={`/anime/${a.id}`}
                className="bg-soraku-surface border border-soraku-surface-light rounded-lg overflow-hidden hover:border-soraku-primary/40 transition-colors group"
              >
                <div className="relative aspect-[2/3]">
                  <Image
                    src={a.poster}
                    alt={a.title}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm text-soraku-light line-clamp-2 leading-tight">
                    {a.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {a.status && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${statusStyles[a.status]}`}>
                        {a.status === "ONGOING" ? "Airing" : a.status === "COMPLETED" ? "Completed" : "Upcoming"}
                      </span>
                    )}
                    {a.type && (
                      <span className="px-2 py-0.5 text-xs rounded bg-soraku-primary/20 text-soraku-primary">
                        {a.type}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
