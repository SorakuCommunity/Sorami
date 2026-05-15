import { NextResponse } from "next/server";
import { getTopAiring } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const anime = await getTopAiring();
    return NextResponse.json(anime);
  } catch (error) {
    console.error("Error fetching top airing:", error);
    return NextResponse.json({ error: "Failed to fetch top airing anime" }, { status: 500 });
  }
}
