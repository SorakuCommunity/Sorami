import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/anime-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const genre = searchParams.get("genre") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const status = searchParams.get("status") || undefined;
  const type = searchParams.get("type") || undefined;

  try {
    const results = await searchAnime(query, page, { genre, year, status, type });
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search anime" }, { status: 500 });
  }
}