import { NextResponse } from "next/server";
import { getTopRatedAnime } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTopRatedAnime();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top rated anime:", error);
    return NextResponse.json({ error: "Failed to fetch top rated anime" }, { status: 500 });
  }
}
