import { NextRequest, NextResponse } from "next/server";
import { META } from "@consumet/extensions";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const anilist = new META.Anilist();
    const info = await anilist.fetchAnimeInfo(id);
    if (!info) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }

    const title = typeof info.title === "string" ? info.title : info.title?.english || info.title?.romaji || "";
    const anime = {
      id: info.id,
      title,
      titleEnglish: typeof info.title === "object" ? info.title?.english : undefined,
      titleNative: typeof info.title === "object" ? info.title?.native : undefined,
      poster: info.image || "",
      cover: info.cover || info.image,
      description: info.description?.replace(/<[^>]*>/g, "").trim(),
      rating: info.rating ? info.rating / 10 : undefined,
      totalEpisodes: info.totalEpisodes,
      status: String(info.status) === "RELEASING" ? "ONGOING" : String(info.status) === "FINISHED" ? "COMPLETED" : "UPCOMING",
      genres: info.genres || [],
      releaseDate: info.releaseDate,
      duration: info.duration,
      studios: info.studios,
      type: info.type || info.format,
    };

    return NextResponse.json(anime);
  } catch (error) {
    console.error("Error fetching anime:", error);
    return NextResponse.json({ error: "Failed to fetch anime" }, { status: 500 });
  }
}
