import { NextResponse } from "next/server";
import { getRecentAnime } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getRecentAnime();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recent anime:", error);
    return NextResponse.json({ error: "Failed to fetch recent anime" }, { status: 500 });
  }
}
