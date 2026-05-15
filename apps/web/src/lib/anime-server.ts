const ANILIST_API = "https://graphql.anilist.co";

async function anilistQuery(query: string, variables: Record<string, any>): Promise<any> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

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
  return {
    id: String(item.id),
    title: item.title?.english || item.title?.romaji || item.title?.native || "",
    titleEnglish: item.title?.english,
    titleNative: item.title?.native,
    poster: item.coverImage?.large || item.coverImage?.medium || "",
    cover: item.coverImage?.extraLarge || item.coverImage?.large,
    banner: item.bannerImage || item.coverImage?.extraLarge,
    description: item.description,
    rating: item.averageScore ? item.averageScore / 10 : undefined,
    episodes: item.episodes,
    totalEpisodes: item.episodes,
    status: mapStatus(item.status),
    genres: item.genres,
    type: item.format,
    year: item.seasonYear,
    studios: item.studios?.nodes?.map((s: any) => s.name),
    duration: item.duration ? `${item.duration} min` : undefined,
    releaseDate: item.startDate?.year ? `${item.startDate.year}` : undefined,
  };
}

// ── Queries ──

const TRENDING_QUERY = `query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total hasNextPage currentPage lastPage }
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
      id title { romaji english native }
      coverImage { extraLarge large medium }
      bannerImage description
      averageScore episodes status genres format seasonYear
      startDate { year } duration
      studios { nodes { name } }
    }
  }
}`;

const POPULAR_QUERY = TRENDING_QUERY.replace("TRENDING_DESC", "POPULARITY_DESC");

const TOP_RATED_QUERY = TRENDING_QUERY.replace("TRENDING_DESC", "SCORE_DESC");

const AIRING_QUERY = TRENDING_QUERY.replace("TRENDING_DESC, isAdult: false", "POPULARITY_DESC, isAdult: false, status: RELEASING");

const SEARCH_QUERY = `query ($q: String, $page: Int, $perPage: Int, $genre: String, $year: Int, $status: MediaStatus, $format: MediaFormat) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total hasNextPage currentPage lastPage }
    media(search: $q, type: ANIME, isAdult: false, genre: $genre, seasonYear: $year, status: $status, format: $format, sort: POPULARITY_DESC) {
      id title { romaji english native }
      coverImage { extraLarge large medium }
      bannerImage description
      averageScore episodes status genres format seasonYear
      startDate { year } duration
      studios { nodes { name } }
    }
  }
}`;

const ANIME_INFO_QUERY = `query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { extraLarge large medium }
    bannerImage
    description
    averageScore
    episodes
    status
    genres
    format
    seasonYear
    startDate { year }
    duration
  }
}`;

const EPISODES_QUERY = `query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    streamingEpisodes { title thumbnail url site siteUrl }
    episodes
  }
}`;

// ── Public functions ──

export async function getTrendingAnime(page = 1): Promise<Anime[]> {
  try {
    const data = await anilistQuery(TRENDING_QUERY, { page, perPage: 20 });
    return (data?.Page?.media || []).map(toAnime);
  } catch { return []; }
}

export async function getPopularAnime(page = 1): Promise<Anime[]> {
  try {
    const data = await anilistQuery(POPULAR_QUERY, { page, perPage: 20 });
    return (data?.Page?.media || []).map(toAnime);
  } catch { return []; }
}

export async function getTopRatedAnime(page = 1): Promise<Anime[]> {
  try {
    const data = await anilistQuery(TOP_RATED_QUERY, { page, perPage: 20 });
    return (data?.Page?.media || []).map(toAnime);
  } catch { return []; }
}

export async function getAiringAnime(page = 1): Promise<Anime[]> {
  try {
    const data = await anilistQuery(AIRING_QUERY, { page, perPage: 20 });
    return (data?.Page?.media || []).map(toAnime);
  } catch { return []; }
}

export async function searchAnime(query: string, page = 1, options?: SearchOptions): Promise<AnimeSearchResult> {
  try {
    const vars: any = { q: query, page, perPage: 20 };
    if (options?.genre) vars.genre = options.genre;
    if (options?.year) vars.year = options.year;
    if (options?.status) vars.status = options.status.toUpperCase();
    if (options?.type) vars.format = options.type.toUpperCase() === "MOVIE" ? "MOVIE" : undefined;
    const data = await anilistQuery(SEARCH_QUERY, vars);
    return {
      animes: (data?.Page?.media || []).map(toAnime),
      totalPages: data?.Page?.pageInfo?.lastPage || 1,
      currentPage: page,
      hasNextPage: data?.Page?.pageInfo?.hasNextPage,
    };
  } catch { return { animes: [], totalPages: 1, currentPage: page }; }
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  try {
    const data = await anilistQuery(ANIME_INFO_QUERY, { id: parseInt(id) });
    return data?.Media ? toAnime(data.Media) : null;
  } catch { return null; }
}

export async function getAnimeEpisodes(id: string): Promise<Episode[]> {
  try {
    const data = await anilistQuery(EPISODES_QUERY, { id: parseInt(id) });
    const media = data?.Media;
    if (!media) return [];
    return (media.streamingEpisodes || []).map((ep: any, i: number) => ({
      id: `${id}-${i + 1}`,
      animeId: id,
      number: i + 1,
      title: ep.title || `Episode ${i + 1}`,
      image: ep.thumbnail,
      isSubbed: true,
      isDubbed: false,
    }));
  } catch { return []; }
}

export async function getGenres(): Promise<string[]> {
  return GENRES;
}

export const getSeasonalAnime = getTrendingAnime;
export const getRecentAnime = getPopularAnime;
export const getTopAiring = getAiringAnime;
