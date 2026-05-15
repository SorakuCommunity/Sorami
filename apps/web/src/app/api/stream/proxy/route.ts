import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/stream";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new Response("Missing url param", { status: 400 });
  }

  try {
    return await proxyFetch(url);
  } catch (error) {
    console.error("Proxy fetch failed:", error);
    return new Response("Proxy fetch failed", { status: 502 });
  }
}
