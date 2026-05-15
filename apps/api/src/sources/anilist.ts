import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AnimeEntry, SearchResult, Provider } from './types';

const API = 'https://graphql.anilist.co';

const SEARCH = `
  query ($q: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(search: $q, type: ANIME) { id title { romaji english native } coverImage { large } description genres averageScore status season seasonYear format episodes studios { nodes { name } } }
    }
  }`;

const INFO = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id title { romaji english native } coverImage { large } bannerImage description genres averageScore status season seasonYear format episodes studios { nodes { name } } nextAiringEpisode { episode timeUntilAiring }
    }
  }`;

const TRENDING = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(sort: TRENDING_DESC, type: ANIME) {
        id title { romaji english native } bannerImage coverImage { large } genres format episodes averageScore season seasonYear status description studios { nodes { name } } nextAiringEpisode { episode timeUntilAiring }
      }
    }
  }`;

const POPULAR = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(sort: POPULARITY_DESC, type: ANIME) { id title { romaji english native } coverImage { large } description genres averageScore status season seasonYear format episodes }
    }
  }`;

const TOP_RATED = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(sort: SCORE_DESC, type: ANIME) { id title { romaji english native } bannerImage coverImage { large } genres format episodes averageScore season seasonYear status description studios { nodes { name } } }
    }
  }`;

const AIRING = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(status: RELEASING, sort: POPULARITY_DESC, type: ANIME) { id title { romaji english native } bannerImage coverImage { large } genres format episodes averageScore season seasonYear status description studios { nodes { name } } nextAiringEpisode { episode timeUntilAiring } }
    }
  }`;

const SEASONAL = `
  query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, type: ANIME) { id title { romaji english native } bannerImage coverImage { large } genres format episodes averageScore season seasonYear status description studios { nodes { name } } }
    }
  }`;

interface Media {
  id: number;
  title: { romaji?: string; english?: string; native?: string };
  bannerImage?: string;
  coverImage?: { large?: string };
  description?: string;
  genres?: string[];
  format?: string;
  averageScore?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  episodes?: number;
  studios?: { nodes: { name: string }[] };
  nextAiringEpisode?: { episode: number; timeUntilAiring: number };
}

function toEntry(m: Media): AnimeEntry {
  return {
    id: String(m.id),
    title: m.title?.english || m.title?.romaji || '',
    englishTitle: m.title?.english,
    nativeTitle: m.title?.native,
    image: m.coverImage?.large,
    cover: m.bannerImage,
    description: m.description?.replace(/<[^>]*>/g, '').trim(),
    genres: m.genres,
    rating: m.averageScore ? m.averageScore / 10 : undefined,
    status: m.status,
    type: m.format,
    totalEpisodes: typeof m.episodes === 'number' ? m.episodes : undefined,
    year: m.seasonYear,
    season: m.season,
    studios: m.studios?.nodes?.map((n) => n.name),
    nextAiringEpisode: m.nextAiringEpisode,
  };
}

@Injectable()
export class AniList implements Provider {
  readonly name = 'AniList';
  readonly type = 'metadata' as const;

  async search(query: string, page = 1): Promise<SearchResult> {
    const { data } = await axios.post(API, { query: SEARCH, variables: { q: query, page, perPage: 20 } });
    const pageData = data.data?.Page;
    return { results: (pageData?.media ?? []).map(toEntry), totalPages: pageData?.pageInfo?.lastPage, hasNextPage: pageData?.pageInfo?.hasNextPage };
  }

  async info(id: string): Promise<AnimeEntry | null> {
    const nid = parseInt(id, 10);
    if (isNaN(nid)) return null;
    try {
      const { data } = await axios.post(API, { query: INFO, variables: { id: nid } });
      const media: Media = data.data?.Media;
      return media ? toEntry(media) : null;
    } catch { return null; }
  }

  async trending(page = 1, perPage = 20): Promise<SearchResult> {
    const { data } = await axios.post(API, { query: TRENDING, variables: { page, perPage } });
    const pageData = data.data?.Page;
    return { results: (pageData?.media ?? []).map(toEntry), totalPages: pageData?.pageInfo?.lastPage, hasNextPage: pageData?.pageInfo?.hasNextPage };
  }

  async popular(page = 1, perPage = 20): Promise<SearchResult> {
    const { data } = await axios.post(API, { query: POPULAR, variables: { page, perPage } });
    const pageData = data.data?.Page;
    return { results: (pageData?.media ?? []).map(toEntry), totalPages: pageData?.pageInfo?.lastPage, hasNextPage: pageData?.pageInfo?.hasNextPage };
  }

  async topRated(page = 1, perPage = 20): Promise<SearchResult> {
    const { data } = await axios.post(API, { query: TOP_RATED, variables: { page, perPage } });
    const pageData = data.data?.Page;
    return { results: (pageData?.media ?? []).map(toEntry), totalPages: pageData?.pageInfo?.lastPage, hasNextPage: pageData?.pageInfo?.hasNextPage };
  }

  async airing(page = 1, perPage = 20): Promise<SearchResult> {
    const { data } = await axios.post(API, { query: AIRING, variables: { page, perPage } });
    const pageData = data.data?.Page;
    return { results: (pageData?.media ?? []).map(toEntry), totalPages: pageData?.pageInfo?.lastPage, hasNextPage: pageData?.pageInfo?.hasNextPage };
  }

  async seasonal(page = 1, perPage = 20, season?: string, seasonYear?: number): Promise<SearchResult> {
    const now = new Date();
    const s = season || ['WINTER', 'SPRING', 'SUMMER', 'FALL'][Math.floor(now.getMonth() / 3)];
    const y = seasonYear || now.getFullYear();
    const { data } = await axios.post(API, { query: SEASONAL, variables: { page, perPage, season: s, seasonYear: y } });
    const pageData = data.data?.Page;
    return { results: (pageData?.media ?? []).map(toEntry), totalPages: pageData?.pageInfo?.lastPage, hasNextPage: pageData?.pageInfo?.hasNextPage };
  }

  async health(): Promise<boolean> {
    try {
      await axios.post(API, { query: 'query { Page(perPage: 1) { media(type: ANIME) { id } } }' }, { timeout: 5000 });
      return true;
    } catch { return false; }
  }
}
