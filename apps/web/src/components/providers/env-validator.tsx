"use client";

import { useEffect, useState } from "react";

export function EnvValidator({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure process.env is populated
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soraku-dark">
        <div className="w-12 h-12 border-4 border-soraku-primary/30 border-t-soraku-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}