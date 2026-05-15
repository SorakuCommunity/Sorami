import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

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

async function get<T>(path: string): Promise<T | null> {
  try {
    const { data } = await axios.get(`${API}${path}`, { timeout: 15000 });
    if (data && typeof data === "object" && "success" in data) return data.data as T;
    return data as T;
  } catch { return null; }
}

export async function getTrendingAnime(page = 1): Promise<Anime[]> {
  const d = await get<any>(`/anime/trending?page=${page}`);
  return (d?.results || []).map(toAnime);
}

export async function getTopAiring(page = 1): Promise<Anime[]> {
  const d = await get<any>(`/anime/airing?page=${page}`);
  return (d?.results || []).map(toAnime);
}

export async function getPopularAnime(page = 1): Promise<Anime[]> {
  const d = await get<any>(`/anime/popular?page=${page}`);
  const all: any[] = [];
  if (d && typeof d === "object") Object.values(d).forEach((v: any) => { if (Array.isArray(v)) all.push(...v); });
  return all.map(toAnime);
}

export async function getSeasonalAnime(): Promise<Anime[]> {
  const d = await get<any>(`/anime/seasonal`);
  return (d?.results || []).map(toAnime);
}

export async function getRecentAnime(page = 1): Promise<Anime[]> {
  const d = await get<any>(`/anime/recent?page=${page}`);
  const all: any[] = [];
  if (d && typeof d === "object") Object.values(d).forEach((v: any) => { if (Array.isArray(v)) all.push(...v); });
  return all.map(toAnime);
}

export async function getTopRatedAnime(page = 1): Promise<Anime[]> {
  const d = await get<any>(`/anime/top-rated?page=${page}`);
  return (d?.results || []).map(toAnime);
}

export async function getAiringAnime(page = 1): Promise<Anime[]> {
  const d = await get<any>(`/anime/airing?page=${page}`);
  return (d?.results || []).map(toAnime);
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const d = await get<any>(`/anime/${id}`);
  return d ? toAnime(d) : null;
}

export async function getAnimeEpisodes(id: string): Promise<Episode[]> {
  const d = await get<any>(`/anime/${id}/episodes`);
  if (!d || !Array.isArray(d)) return [];
  return d.map((ep: any) => ({
    id: ep.id || String(ep.number),
    animeId: id, number: ep.number, title: ep.title,
    description: ep.description, image: ep.image, url: ep.url,
    isSubbed: ep.isSubbed, isDubbed: ep.isDubbed, releaseDate: ep.releaseDate,
  }));
}

export async function getEpisodeSources(episodeId: string, server?: string, subOrDub = "sub", useProxy = true): Promise<EpisodeSource | null> {
  const params = new URLSearchParams();
  if (server) params.set("server", server);
  if (useProxy) params.set("proxy", "true");
  const qs = params.toString();
  const d = await get<any>(`/stream/${encodeURIComponent(episodeId)}${qs ? `?${qs}` : ""}`);
  if (!d) return null;
  return {
    sources: (d.sources || []).map((s: any) => ({ url: s.url, quality: s.quality || "default", isM3U8: s.isM3U8 })),
    subtitles: (d.subtitles || []).map((s: any) => ({ url: s.url, label: s.label || s.lang, lang: s.lang })),
    headers: d.headers,
  };
}

export async function searchAnime(query: string, page = 1, filters?: {
  genre?: string; year?: number; status?: string; type?: string; sort?: string[];
}): Promise<AnimeSearchResult> {
  const params = new URLSearchParams({ q: query, page: String(page) });
  if (filters?.genre) params.set("genres", `["${filters.genre}"]`);
  if (filters?.year) params.set("year", String(filters.year));
  if (filters?.status) params.set("status", filters.status);
  if (filters?.type) params.set("type", filters.type);
  const d = await get<any>(`/anime/search?${params}`);
  return {
    animes: (d?.results || []).map(toAnime),
    totalPages: d?.totalPages || 1,
    currentPage: page,
    hasNextPage: d?.hasNextPage,
  };
}

export async function getGenres(): Promise<string[]> {
  return ["Action","Adventure","Cars","Comedy","Drama","Fantasy","Horror","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"];
}

export async function genreSearch(genre: string, page = 1): Promise<AnimeSearchResult> {
  const d = await get<any>(`/anime/search?genres=["${genre}"]&page=${page}`);
  return {
    animes: (d?.results || []).map(toAnime),
    totalPages: d?.totalPages || 1,
    currentPage: page,
    hasNextPage: d?.hasNextPage,
  };
}
