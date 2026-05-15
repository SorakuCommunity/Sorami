import { NextResponse } from "next/server";
import { getSeasonalAnime } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const anime = await getSeasonalAnime();
    return NextResponse.json(anime);
  } catch (error) {
    console.error("Error fetching seasonal:", error);
    return NextResponse.json({ error: "Failed to fetch seasonal anime" }, { status: 500 });
  }
}