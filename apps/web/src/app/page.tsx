"use client";

import { SpotlightSlider } from "@/components/features/home/SpotlightSlider";
import { ContinueWatching } from "@/components/features/home/ContinueWatching";
import { TrendingCarousel } from "@/components/features/home/TrendingCarousel";
import { LatestEpisodes } from "@/components/features/home/LatestEpisodes";
import { TopRanked } from "@/components/features/home/TopRanked";
import { UpcomingSection } from "@/components/features/home/UpcomingSection";
import { GenreExplorer } from "@/components/features/home/GenreExplorer";
import { RecommendedSection } from "@/components/features/home/RecommendedSection";
import { NewlyAddedSection } from "@/components/features/home/NewlyAddedSection";
import { CommunityFeed } from "@/components/features/home/CommunityFeed";
import { useSpotlight } from "@/hooks/useSpotlight";

export default function HomePage() {
  const spotlight = useSpotlight();

  return (
    <div className="min-h-screen bg-soraku-dark">
      <SpotlightSlider anime={spotlight} />

      <div className="px-4 md:px-8 space-y-8 md:space-y-12 lg:space-y-16 pb-16 lg:pb-20">
        <ContinueWatching />
        <TrendingCarousel />
        <TopRanked />
        <RecommendedSection />
        <GenreExplorer />
      </div>
    </div>
  );
}
