import AnimeDetailPage from "@/components/anime/anime-detail-page";

interface Props {
  params: Promise<{ id: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function Page({ params, searchParams }: Props) {
  const { id, slug } = await params;
  const { page } = await searchParams;
  return <AnimeDetailPage id={id} slug={slug} page={page} basePath="info" />;
}
