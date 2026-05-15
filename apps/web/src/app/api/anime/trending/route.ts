import { NextResponse } from "next/server";
import { getTrendingAnime } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const anime = await getTrendingAnime();
    return NextResponse.json(anime);
  } catch (error) {
    console.error("Error fetching trending:", error);
    return NextResponse.json({ error: "Failed to fetch trending anime" }, { status: 500 });
  }
}