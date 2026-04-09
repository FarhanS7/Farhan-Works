import { Suspense } from "react";
import { api } from "@/lib/api";
import { PostsArchiveClient } from "@/components/posts-archive-client";

export const metadata = {
  title: "Articles | Farhan.Dev Archive",
  description: "Browse the full archive of technical deep dives, system analysis, and architecture insights on Farhan.Dev.",
};

async function PostsLoading() {
  return (
    <div className="container-px py-14">
      <div className="space-y-4 mb-10">
        <div className="h-4 w-24 skeleton rounded-full" />
        <div className="h-12 w-96 skeleton rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 skeleton rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function PostsArchiveFetcher() {
  const posts = await api.posts.getAll().catch(() => []);
  return <PostsArchiveClient initialPosts={Array.isArray(posts) ? posts : []} />;
}

export default function PostsPage() {
  return (
    <Suspense fallback={<PostsLoading />}>
      <PostsArchiveFetcher />
    </Suspense>
  );
}
