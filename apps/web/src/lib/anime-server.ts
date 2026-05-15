import { META } from "@consumet/extensions";

const anilist = new META.Anilist();

export interface Anime {
  id: string;
  title: string;
  titleEnglish?: string;
  titleNative?: string;
  poster: string;
  cover?: string;
  banner?: string;
  description?: string;
  rating?: number;
  episodes?: number;
  totalEpisodes?: number;
  status: "ONGOING" | "COMPLETED" | "UPCOMING";
  releaseDate?: string;
  year?: number;
  duration?: string;
  genres?: string[];
  studios?: string[];
  type?: string;
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  isSubbed?: boolean;
  isDubbed?: boolean;
  releaseDate?: string;
}

export interface AnimeSearchResult {
  animes: Anime[];
  totalPages: number;
  currentPage: number;
  hasNextPage?: boolean;
}

export interface EpisodeSource {
  sources: Array<{ url: string; quality: string; isM3U8?: boolean }>;
  subtitles: Array<{ url: string; label: string; lang?: string }>;
  headers?: Record<string, string>;
}

export interface SearchOptions {
  genre?: string;
  year?: number;
  status?: string;
  type?: string;
}

const GENRES = [
  "Action", "Adventure", "Cars", "Comedy", "Drama", "Fantasy",
  "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery",
  "Psychological", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller",
];

function mapStatus(s?: string): "ONGOING" | "COMPLETED" | "UPCOMING" {
  switch (s?.toLowerCase()) {
    case "ongoing": case "releasing": return "ONGOING";
    case "completed": case "finished": return "COMPLETED";
    default: return "UPCOMING";
  }
}

function toAnime(item: any): Anime {
  const title = typeof item.title === "string" ? item.title
    : item.title?.english || item.title?.romaji || item.title?.native || "";
  return {
    id: item.id, title,
    titleEnglish: typeof item.title === "object" ? item.title?.english : undefined,
    titleNative: typeof item.title === "object" ? item.title?.native : undefined,
    poster: item.image || item.cover || item.poster || "",
    cover: item.cover || item.image || item.poster,
    banner: item.cover || item.banner,
    description: item.description,
    rating: item.rating || item.averageScore,
    episodes: item.totalEpisodes || item.episodeCount,
    totalEpisodes: item.totalEpisodes || item.episodeCount,
    status: mapStatus(item.status),
    genres: item.genres,
    type: item.type || item.format,
    year: item.year || item.seasonYear,
    studios: item.studios,
    releaseDate: item.releaseDate,
  };
}

function toEpisode(ep: any, animeId: string): Episode {
  return {
    id: ep.id,
    animeId,
    number: ep.number,
    title: ep.title || `Episode ${ep.number}`,
    image: ep.image,
    isSubbed: true,
    isDubbed: false,
  };
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  try {
    const info = await anilist.fetchAnimeInfo(id);
    return info ? toAnime(info) : null;
  } catch {
    return null;
  }
}

export async function getAnimeEpisodes(id: string): Promise<Episode[]> {
  try {
    const info = await anilist.fetchAnimeInfo(id);
    return (info?.episodes || []).map((ep: any) => toEpisode(ep, id));
  } catch {
    return [];
  }
}

export async function getTrendingAnime(page = 1): Promise<Anime[]> {
  try {
    const res = await anilist.fetchTrendingAnime(page, 20);
    return (res.results || []).map(toAnime);
  } catch {
    return [];
  }
}

export async function getPopularAnime(page = 1): Promise<Anime[]> {
  try {
    const res = await anilist.fetchPopularAnime(page, 20);
    return (res.results || []).map(toAnime);
  } catch {
    return [];
  }
}

export async function getTopRatedAnime(page = 1): Promise<Anime[]> {
  try {
    const res = await anilist.advancedSearch(undefined, undefined, page, 20, undefined, ["SCORE_DESC"]);
    return (res.results || []).map(toAnime);
  } catch {
    return [];
  }
}

export async function getAiringAnime(page = 1): Promise<Anime[]> {
  try {
    const res = await anilist.advancedSearch(undefined, undefined, page, 20, undefined, undefined, undefined, undefined, undefined, "RELEASING");
    return (res.results || []).map(toAnime);
  } catch {
    return [];
  }
}

export async function searchAnime(query: string, page = 1, options?: SearchOptions): Promise<AnimeSearchResult> {
  try {
    if (options && (options.genre || options.year || options.status || options.type)) {
      const res = await anilist.advancedSearch(
        query || undefined,
        undefined, page, 20,
        options.type?.toUpperCase() === "MOVIE" ? "MOVIE" : undefined,
        undefined,
        options.genre ? [options.genre] : undefined,
        undefined,
        options.year,
        options.status?.toUpperCase(),
      );
      return {
        animes: (res.results || []).map(toAnime),
        totalPages: res.totalPages || 1,
        currentPage: page,
        hasNextPage: res.hasNextPage,
      };
    }
    const res = await anilist.search(query, page, 20);
    return {
      animes: (res.results || []).map(toAnime),
      totalPages: res.totalPages || 1,
      currentPage: page,
      hasNextPage: res.hasNextPage,
    };
  } catch {
    return { animes: [], totalPages: 1, currentPage: page };
  }
}

export async function getGenres(): Promise<string[]> {
  return GENRES;
}

// Keep for backwards compatibility
export const getSeasonalAnime = getTrendingAnime;
export const getRecentAnime = getPopularAnime;
export const getTopAiring = getAiringAnime;
