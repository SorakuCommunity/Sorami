"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface CommunityActivity {
  id: string;
  userName: string;
  animeTitle: string;
  action: "watching" | "completed" | "reviewed";
  timeAgo: string;
}

const mockActivities: CommunityActivity[] = [
  { id: "1", userName: "AnimeFan2024", animeTitle: "Demon Slayer", action: "watching", timeAgo: "2 min ago" },
  { id: "2", userName: "OtakuMaster", animeTitle: "Attack on Titan", action: "completed", timeAgo: "15 min ago" },
  { id: "3", userName: "SorakuUser", animeTitle: "Jujutsu Kaisen", action: "reviewed", timeAgo: "1 hour ago" },
  { id: "4", userName: "MangaLover", animeTitle: "One Piece", action: "watching", timeAgo: "3 hours ago" },
];

const actionText: Record<string, string> = {
  watching: "is watching",
  completed: "completed",
  reviewed: "reviewed",
};

export function CommunityFeed() {
  return (
    <section className="py-8 md:py-12 px-4 md:px-6 border-t border-soraku-surface-light">
      <div className="flex items-center gap-2 md:gap-3 mb-6">
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-soraku-primary" />
        <h2 className="text-xl md:text-2xl font-bold text-soraku-light">Community Activity</h2>
      </div>

      <div className="space-y-3">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-soraku-surface border border-soraku-surface-light rounded-lg p-3"
          >
            <p className="text-sm">
              <Link
                href={`/user/${activity.userName}`}
                className="font-semibold text-soraku-primary"
              >
                {activity.userName}
              </Link>{" "}
              <span className="text-soraku-secondary">
                {actionText[activity.action]}{" "}
              </span>
              <Link
                href={`/anime/1`}
                className="font-semibold text-soraku-light hover:text-soraku-primary transition-colors"
              >
                {activity.animeTitle}
              </Link>
            </p>
            <span className="text-soraku-secondary/60 text-xs">{activity.timeAgo}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
