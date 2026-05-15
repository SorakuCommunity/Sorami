import { NextRequest, NextResponse } from "next/server";
import { getAnimeById } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const fetchRes = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query: `query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage description averageScore episodes status genres format seasonYear startDate { year } duration
        }
      }`,
      variables: { id: parseInt(id) },
    }),
  });
  if (!fetchRes.ok) {
    return NextResponse.json({ error: "Anilist API error", status: fetchRes.status }, { status: 502 });
  }
  const json = await fetchRes.json();
  if (!json?.data?.Media) {
    return NextResponse.json({ error: "Anime not found" }, { status: 404 });
  }

  const media = json.data.Media;
  return NextResponse.json({
    id: String(media.id),
    title: media.title?.english || media.title?.romaji || "",
    titleEnglish: media.title?.english,
    titleNative: media.title?.native,
    poster: media.coverImage?.large || "",
    cover: media.coverImage?.extraLarge,
    banner: media.bannerImage,
    description: media.description,
    rating: media.averageScore ? media.averageScore / 10 : undefined,
    episodes: media.episodes,
    totalEpisodes: media.episodes,
    status: media.status === "RELEASING" ? "ONGOING" : media.status === "FINISHED" ? "COMPLETED" : "UPCOMING",
    genres: media.genres,
    type: media.format,
    year: media.seasonYear,
    duration: media.duration ? `${media.duration} min` : undefined,
    releaseDate: media.startDate?.year ? String(media.startDate.year) : undefined,
  });
}
