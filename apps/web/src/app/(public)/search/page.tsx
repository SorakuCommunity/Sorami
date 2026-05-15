"use client";

import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { SearchComponent } from "@/components/features/Search";
import { Skeleton } from "@/components/ui/skeleton";

function SearchLoading() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[0.68] rounded-lg" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Container>
      <h1 className="mb-8 text-3xl font-bold">Search Anime</h1>
      <Suspense fallback={<SearchLoading />}>
        <SearchComponent />
      </Suspense>
    </Container>
  );
}
