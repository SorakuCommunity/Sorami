export interface ScrapedAnime {
  title: string;
  slug: string;
  synopsis?: string;
  posterUrl?: string;
  genres: string[];
  status: string;
  season?: string;
  studio?: string;
  score?: number;
  episodes: ScrapedEpisode[];
}

export interface ScrapedEpisode {
  number: number;
  title?: string;
  duration?: number;
  episodePageUrl?: string;
  videoUrls: {
    hls320?: string;
    hls480?: string;
    hls720?: string;
    hls1080?: string;
  };
}
