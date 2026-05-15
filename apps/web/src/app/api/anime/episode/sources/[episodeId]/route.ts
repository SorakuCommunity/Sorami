import { NextRequest, NextResponse } from "next/server";
import { resolveEpisodeSources } from "@/lib/stream";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const { searchParams } = new URL(request.url);
  const server = searchParams.get("server") || undefined;

  try {
    const result = await resolveEpisodeSources(episodeId, server);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching episode sources:", error);
    return NextResponse.json({ sources: [], subtitles: [] });
  }
}
