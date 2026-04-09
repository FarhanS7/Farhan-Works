import { HomeClientWrapper } from "@/components/home-client-wrapper";
import { api } from "@/lib/api";

export const metadata = {
  title: "Farhan.Dev | Software Architecture & Deep Dives",
  description: "Exploring the intersection of code, systems, and craft. Deep dives into software engineering, architecture, and performance.",
};

export default async function HomePage() {
  const [posts, series] = await Promise.all([
    api.posts.getAll().catch(() => []),
    api.series.getAll().catch(() => [])
  ]);

  return (
    <HomeClientWrapper 
      initialPosts={Array.isArray(posts) ? posts : []} 
      initialSeries={Array.isArray(series) ? series : []} 
    />
  );
}
