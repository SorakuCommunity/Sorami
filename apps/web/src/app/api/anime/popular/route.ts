import { NextResponse } from "next/server";
import { getPopularAnime } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const anime = await getPopularAnime();
    return NextResponse.json(anime);
  } catch (error) {
    console.error("Error fetching popular:", error);
    return NextResponse.json({ error: "Failed to fetch popular anime" }, { status: 500 });
  }
}