import { ANIME } from "@consumet/extensions";
import axios from "axios";

const ANILIST_EP_REGEX = /^anilist-ep-(\d+)-(\d+)$/;

const SERVER_PROVIDER_MAP: Record<string, string> = {
  Sorami: "Samehadaku",
  Hikari: "Oploverz",
  Sora: "Otakudesu",
  Bun: "Anoboy",
  Yun: "Kuramanime",
  Kaze: "AnimeKai",
  Hana: "HiAnime",
};

interface Source {
  url: string;
  quality: string;
  isM3U8?: boolean;
}

interface Subtitle {
  url: string;
  lang: string;
}

interface StreamResult {
  sources: Source[];
  subtitles: Subtitle[];
}

function getProvider(name: string) {
  switch (name) {
    case "HiAnime": return new ANIME.Hianime();
    case "AnimePahe": return new ANIME.AnimePahe();
    case "AnimeKai": return new ANIME.AnimeKai();
    case "AnimeSaturn": return new ANIME.AnimeSaturn();
    case "AnimeUnity": return new ANIME.AnimeUnity();
    default: return null;
  }
}

async function tryProvider(providerName: string, episodeId: string): Promise<StreamResult | null> {
  const provider = getProvider(providerName);
  if (!provider) return null;
  try {
    const source = await provider.fetchEpisodeSources(episodeId);
    if (source?.sources?.length) {
      return {
        sources: source.sources.map((s: any) => ({
          url: s.url,
          quality: s.quality || "default",
          isM3U8: s.isM3U8 || s.url?.includes(".m3u8"),
        })),
        subtitles: (source.subtitles || []).map((s: any) => ({
          url: s.url,
          lang: s.lang || "en",
        })),
      };
    }
  } catch {}
  return null;
}

export async function resolveEpisodeSources(
  episodeId: string,
  server?: string
): Promise<StreamResult> {
  let provider: string | undefined;

  if (server && SERVER_PROVIDER_MAP[server]) {
    provider = SERVER_PROVIDER_MAP[server];
  }

  const match = episodeId.match(ANILIST_EP_REGEX);

  if (provider && match) {
    const slug = await getAnimeSlug(match[1]);
    if (slug) {
      const epSlug = `${slug}?ep=${match[2]}`;
      const result = await tryProvider(provider, epSlug);
      if (result) return result;
    }
  }

  if (match) {
    const slug = await getAnimeSlug(match[1]);
    if (slug) {
      const providers = ["HiAnime", "AnimePahe", "AnimeKai"];
      for (const name of providers) {
        const epSlug = name === "HiAnime" ? `${slug}?ep=${match[2]}` : `${slug}-${match[2]}`;
        const result = await tryProvider(name, epSlug);
        if (result) return result;
      }
    }
  }

  const fallbackProviders = ["HiAnime", "AnimePahe", "AnimeKai"];
  for (const name of fallbackProviders) {
    const result = await tryProvider(name, episodeId);
    if (result) return result;
  }

  return { sources: [], subtitles: [] };
}

async function getAnimeSlug(animeId: string): Promise<string | null> {
  try {
    const { data } = await axios.post("https://graphql.anilist.co", {
      query: `query ($id: Int) { Media (id: $id, type: ANIME) { title { english romaji } } }`,
      variables: { id: parseInt(animeId) },
    }, { timeout: 5000 });
    const title = data?.data?.Media?.title?.english || data?.data?.Media?.title?.romaji || "";
    if (!title) return null;
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  } catch {
    return null;
  }
}

export async function proxyFetch(url: string): Promise<Response> {
  const response = await axios.get(url, {
    responseType: "stream",
    timeout: 30000,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      Referer: "https://hianime.to/",
    },
  });

  const contentType = String(response.headers["content-type"] || "application/octet-stream");

  if (contentType.includes("m3u8") || url.endsWith(".m3u8")) {
    let manifest = "";
    for await (const chunk of response.data) {
      manifest += chunk.toString();
    }

    const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
    const rewritten = manifest.split("\n").map((line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      if (trimmed.startsWith("http")) return trimmed;
      return `${baseUrl}${trimmed}`;
    }).join("\n");

    return new Response(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response(response.data as any, {
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
