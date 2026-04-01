"use client";

import { useEffect, useState } from "react";

interface ViewTrackerProps {
  postId: string;
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/analytics/views/${postId}`,
          { method: "POST" },
        );
        if (response.ok) {
          const data = await response.json();
          setViewCount(data.views);
        }
      } catch (error) {
        console.debug("Failed to track view:", error);
      }
    };

    // Track view after a short delay to ensure page is interactive
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [postId]);

  if (viewCount === null) {
    return <span>Loading...</span>;
  }

  return <span>{viewCount.toLocaleString()} views</span>;
}
