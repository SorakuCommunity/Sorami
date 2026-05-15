import { NextRequest, NextResponse } from "next/server";
import { META } from "@consumet/extensions";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const anilist = new META.Anilist();
    const info = await anilist.fetchAnimeInfo(id);
    const episodes = (info?.episodes || []).map((ep: any) => ({
      id: ep.id,
      animeId: id,
      number: ep.number,
      title: ep.title || `Episode ${ep.number}`,
      image: ep.image,
      isSubbed: true,
      isDubbed: false,
    }));

    return NextResponse.json(episodes);
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 });
  }
}
