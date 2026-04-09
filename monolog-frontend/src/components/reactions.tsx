"use client";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { HandMetal, Heart, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

interface ReactionsProps {
  postId: string;
}

const TYPES = [
  {
    key: "like",
    Icon: ThumbsUp,
    label: "Like",
    active:
      "text-blue-600 bg-blue-500/10 border-blue-500/20",
  },
  {
    key: "heart",
    Icon: Heart,
    label: "Love",
    active:
      "text-error bg-error-container border-error/20",
  },
  {
    key: "clap",
    Icon: HandMetal,
    label: "Clap",
    active:
      "text-primary bg-primary-container border-primary/20",
  },
];

export function Reactions({ postId }: ReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({
    like: 0,
    heart: 0,
    clap: 0,
  });
  const [voted, setVoted] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reactions
      .getByPost(postId)
      .then((data: any) => {
        const reactions = Array.isArray(data.reactions) ? data.reactions : [];
        const mapped = reactions.reduce(
          (acc: any, cur: any) => {
            acc[cur.reaction_type] = parseInt(cur.count);
            return acc;
          },
          { like: 0, heart: 0, clap: 0 },
        );
        setCounts(mapped);
        setVoted(data.userReaction || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  const handleReact = async (type: string) => {
    if (voted === type) return;

    // Optimistic Update
    const prevCounts = { ...counts };
    const prevVoted = voted;

    setCounts((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
    setVoted(type);

    try {
      await api.reactions.submit(postId, type);
    } catch (e: any) {
      console.error("Reaction failed, reverting state:", e);
      setCounts(prevCounts);
      setVoted(prevVoted);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-20 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {TYPES.map(({ key, Icon, label, active }) => {
        const isVoted = voted === key;
        return (
          <button
            key={key}
            onClick={() => handleReact(key)}
            disabled={!!voted && !isVoted}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200",
              isVoted
                ? active
                : "border-border bg-surface-variant text-text-muted hover:border-primary/30 hover:text-primary hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            <Icon
              size={16}
              className={cn(isVoted && "fill-current opacity-80")}
            />
            <span>{counts[key] || 0}</span>
            <span className="hidden sm:inline text-xs opacity-70">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
