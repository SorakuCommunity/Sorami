import { NextRequest, NextResponse } from "next/server";
import { getAnimeById } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const anime = await getAnimeById(id);
    if (!anime) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }
    return NextResponse.json(anime);
  } catch (error) {
    console.error("Error fetching anime:", error);
    return NextResponse.json({ error: "Failed to fetch anime" }, { status: 500 });
  }
}
