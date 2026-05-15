import { NextResponse } from "next/server";
import axios from "axios";

const CONSUMET_API = process.env.CONSUMET_API_URL || "https://api.consumet.org";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await axios.get(
      `${CONSUMET_API}/anime/hianime/spotlight`,
      { timeout: 15000 }
    );

    if (response.data?.results) {
      const anime = response.data.results.slice(0, 12).map((item: any) => ({
        id: item.id,
        title: typeof item.title === "string" ? item.title : item.title?.english || item.title?.romaji || "",
        titleEnglish: typeof item.title === "object" ? item.title?.english : undefined,
        poster: item.image || item.cover || "",
        banner: item.cover || item.image,
        description: item.description,
        rating: item.rating,
        episodes: item.totalEpisodes,
        totalEpisodes: item.totalEpisodes,
        status: mapMediaStatus(item.status),
        year: item.startDate?.year,
        type: item.type,
        genres: item.genres,
      }));
      return NextResponse.json(anime);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching spotlight:", error);
    return NextResponse.json({ error: "Failed to fetch spotlight" }, { status: 500 });
  }
}

function mapMediaStatus(status?: string): "ONGOING" | "COMPLETED" | "UPCOMING" {
  switch (status?.toLowerCase()) {
    case "ongoing":
    case "releasing":
      return "ONGOING";
    case "completed":
    case "finished":
      return "COMPLETED";
    default:
      return "UPCOMING";
  }
}