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

export interface AnimeSearchResult {
  animes: Anime[];
  totalPages: number;
  currentPage: number;
  hasNextPage?: boolean;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export async function getTrendingAnime(page = 1): Promise<Anime[]> {
  return fetchJson<Anime[]>(`/api/anime/trending?page=${page}`);
}

export async function getPopularAnime(page = 1): Promise<Anime[]> {
  return fetchJson<Anime[]>(`/api/anime/popular?page=${page}`);
}

export async function getTopRatedAnime(page = 1): Promise<Anime[]> {
  return fetchJson<Anime[]>(`/api/anime/top-rated?page=${page}`);
}

export async function getAiringAnime(page = 1): Promise<Anime[]> {
  return fetchJson<Anime[]>(`/api/anime/airing?page=${page}`);
}

export const getSeasonalAnime = getTrendingAnime;
export const getRecentAnime = getPopularAnime;

export async function getGenres(): Promise<string[]> {
  return [
    "Action", "Adventure", "Cars", "Comedy", "Drama", "Fantasy",
    "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery",
    "Psychological", "Romance", "Sci-Fi", "Slice of Life",
    "Sports", "Supernatural", "Thriller",
  ];
}
