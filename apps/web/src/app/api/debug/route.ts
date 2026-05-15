import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: `query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { total hasNextPage }
            media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
              id title { romaji english native }
            }
          }
        }`,
        variables: { page: 1, perPage: 3 },
      }),
    });
    results.anilistDirect = { status: res.status, ok: res.ok };
    if (res.ok) {
      const data = await res.json();
      results.anilistCount = data?.data?.Page?.media?.length || 0;
    } else {
      results.anilistBody = await res.text().catch(() => "");
    }
  } catch (e: any) {
    results.anilistError = e.message;
  }

  try {
    const { META } = await import("@consumet/extensions");
    const anilist = new META.Anilist();
    const trending = await anilist.fetchTrendingAnime(1, 3);
    results.consumetCount = trending.results?.length || 0;
  } catch (e: any) {
    results.consumetError = String(e.message || e);
  }

  return NextResponse.json(results);
}
