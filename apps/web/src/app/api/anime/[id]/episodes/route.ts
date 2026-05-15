import { NextRequest, NextResponse } from "next/server";
import { getAnimeEpisodes } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const episodes = await getAnimeEpisodes(id);
    return NextResponse.json(episodes);
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 });
  }
}
