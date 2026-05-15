"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Info, Plus, ChevronRight, Star, Clock, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { AnimeCard } from "@/components/anime/anime-card";

interface Anime {
  id: string;
  title: string;
  titleEnglish?: string;
  poster: string;
  banner?: string;
  cover?: string;
  description?: string;
  rating?: number;
  episodes?: number;
  totalEpisodes?: number;
  status: "ONGOING" | "COMPLETED" | "UPCOMING";
  year?: number;
  type?: string;
  genres?: string[];
}

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", 
  "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports"
];

function FeaturedAnime({ anime }: { anime: Anime }) {
  const statusLabel = anime.status === "ONGOING" ? "Releasing" : anime.status === "COMPLETED" ? "Completed" : "Upcoming";
  const statusVariant = anime.status === "ONGOING" ? "airing" : anime.status === "COMPLETED" ? "completed" : "upcoming";

  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={anime.banner || anime.poster}
          alt={anime.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-soraku-dark via-soraku-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-soraku-dark/90 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-soraku-dark" />
      </div>

      <Container className="relative h-full flex items-end pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={statusVariant} className="text-sm font-semibold">
              {statusLabel}
            </Badge>
            {anime.type && (
              <Badge variant="secondary" className="text-sm">
                {anime.type}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-white">
            {anime.title}
          </h1>

          <div className="flex items-center gap-4 mb-4 text-soraku-secondary">
            {anime.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-soraku-light font-medium">{anime.rating.toFixed(1)}</span>
              </span>
            )}
            {anime.totalEpisodes && (
              <span className="flex items-center gap-1">
                <Film className="w-4 h-4" />
                <span className="text-soraku-light">{anime.totalEpisodes} EPISODES</span>
              </span>
            )}
            {anime.year && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-soraku-light">{anime.year}</span>
              </span>
            )}
          </div>

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

          <p className="text-soraku-secondary/80 mb-6 line-clamp-2">
            {anime.description || "No description available."}
          </p>

          <div className="flex items-center gap-4">
            <Button variant="accent" size="lg" className="gap-2" asChild>
              <Link href={`/watch/${anime.id}?ep=1`}>
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Link>
            </Button>
            <Button variant="glass" size="lg" className="gap-2" asChild>
              <Link href={`/anime/${anime.id}`}>
                <Info className="w-5 h-5" />
                Details
              </Link>
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

interface SectionTitleProps {
  title: string;
  icon?: React.ReactNode;
  viewAllLink?: string;
}

function SectionTitle({ title, icon, viewAllLink }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between px-4 mb-4">
      <div className="flex items-center gap-3">
        {icon && <span className="text-soraku-primary">{icon}</span>}
        <h2 className="text-xl font-bold text-soraku-light">{title}</h2>
      </div>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="text-sm text-soraku-secondary hover:text-soraku-primary transition-colors flex items-center gap-1"
        >
          Open list
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

interface AnimeCardData {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  episodes?: number;
  type?: string;
  status?: string;
  year?: number;
}

function DiscoverSection({ title, icon, viewAllLink, anime }: { title: string; icon?: React.ReactNode; viewAllLink?: string; anime: AnimeCardData[] }) {
  return (
    <section className="py-6">
      <SectionTitle title={title} icon={icon} viewAllLink={viewAllLink} />
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2">
        {anime.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="shrink-0"
          >
            <AnimeCard anime={item} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function GenreSection({ genres }: { genres: string[] }) {
  return (
    <section className="py-8">
      <SectionTitle title="Browse by Genre" icon={<FilmIcon />} />
      <div className="flex flex-wrap gap-3 px-4">
        {genres.map((genre, index) => (
          <motion.div
            key={genre}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
          >
            <Link
              href={`/genre/${genre.toLowerCase()}`}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-soraku-dark/50 hover:bg-soraku-primary/10 border border-soraku-secondary/20 hover:border-soraku-primary/30 text-soraku-light hover:text-soraku-primary transition-all duration-200 font-medium"
            >
              {genre}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FilmIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function NewIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PopularIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function SeasonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

function mapAnimeToCard(anime: Anime): AnimeCardData {
  return {
    id: anime.id,
    title: anime.title,
    poster: anime.poster,
    rating: anime.rating,
    episodes: anime.totalEpisodes,
    status: anime.status,
    type: anime.type,
    year: anime.year,
  };
}

export default function DiscoverPage() {
  const [featured, setFeatured] = useState<Anime | null>(null);
  const [spotlight, setSpotlight] = useState<Anime[]>([]);
  const [trending, setTrending] = useState<AnimeCardData[]>([]);
  const [newAnime, setNewAnime] = useState<AnimeCardData[]>([]);
  const [popular, setPopular] = useState<AnimeCardData[]>([]);
  const [thisSeason, setThisSeason] = useState<AnimeCardData[]>([]);
  const [lastSeason, setLastSeason] = useState<AnimeCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [spotlightRes, trendingRes, popularRes, seasonalRes] = await Promise.all([
          fetch("/api/anime/spotlight"),
          fetch("/api/anime/trending"),
          fetch("/api/anime/popular"),
          fetch("/api/anime/seasonal"),
        ]);

        const spotlightData = await spotlightRes.json();
        const trendingData = await trendingRes.json();
        const popularData = await popularRes.json();
        const seasonalData = await seasonalRes.json();

        // Set spotlight (latest/newly released anime)
        setSpotlight(Array.isArray(spotlightData) ? spotlightData : []);
        
        // Set featured from spotlight
        if (Array.isArray(spotlightData) && spotlightData.length > 0) {
          setFeatured(spotlightData[0]);
        } else if (Array.isArray(trendingData) && trendingData.length > 0) {
          setFeatured(trendingData[0]);
        }

        const mappedTrending = Array.isArray(trendingData) ? trendingData.slice(0, 10).map(mapAnimeToCard) : [];
        const mappedPopular = Array.isArray(popularData) ? popularData.slice(0, 12).map(mapAnimeToCard) : [];
        const mappedSeasonal = Array.isArray(seasonalData) ? seasonalData.slice(0, 10).map(mapAnimeToCard) : [];

        setTrending(mappedTrending);
        setNewAnime(Array.isArray(trendingData) ? trendingData.slice(10, 20).map(mapAnimeToCard) : []);
        setPopular(mappedPopular);
        setThisSeason(mappedSeasonal);
        setLastSeason(Array.isArray(popularData) ? popularData.slice(12, 22).map(mapAnimeToCard) : []);
      } catch (error) {
        console.error("Failed to load anime data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-soraku-primary/30 border-t-soraku-primary rounded-full animate-spin" />
          <p className="text-soraku-secondary animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Featured Hero from Spotlight */}
      {featured && <FeaturedAnime anime={featured} />}

      <Container className="py-4">
        {/* Spotlight Carousel (Latest Released) */}
        {spotlight.length > 0 && (
          <section className="py-6">
            <SectionTitle title="✨ Spotlight - Latest Release" icon={<NewIcon />} />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2">
              {spotlight.slice(0, 12).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="shrink-0"
                >
                  <AnimeCard anime={mapAnimeToCard(item)} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        <DiscoverSection
          title="Trending Anime"
          icon={<TrendingIcon />}
          viewAllLink="/discover?sort=trending"
          anime={trending}
        />

        {/* New on Soraku */}
        <DiscoverSection
          title="New on Soraku"
          icon={<NewIcon />}
          viewAllLink="/discover?sort=new"
          anime={newAnime}
        />

        {/* Popular */}
        <DiscoverSection
          title="Popular Anime"
          icon={<PopularIcon />}
          viewAllLink="/discover?sort=popular"
          anime={popular}
        />

        {/* This Season */}
        <DiscoverSection
          title="This Season"
          icon={<SeasonIcon />}
          viewAllLink="/discover?sort=season"
          anime={thisSeason}
        />

        {/* Last Season */}
        <DiscoverSection
          title="Last Season"
          icon={<SeasonIcon />}
          viewAllLink="/discover?sort=lastSeason"
          anime={lastSeason}
        />

        {/* Genre Section */}
        <GenreSection genres={GENRES} />
      </Container>
    </div>
  );
}