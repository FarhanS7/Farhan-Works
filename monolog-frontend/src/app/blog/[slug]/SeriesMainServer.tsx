import { api } from "@/lib/api";
import { SeriesAnimator } from "./SeriesAnimator";
import DOMPurify from "isomorphic-dompurify";
import { notFound } from "next/navigation";

export default async function SeriesMainServer({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let series = null;
  let firstPost = null;

  try {
    series = await api.series.getOne(slug);
    
    // If there are posts, fetch the first one's content immediately
    if (series.posts && series.posts.length > 0) {
      const postData = await api.posts.getOne(series.posts[0].slug);
      
      // Sanitize HTML on the server
      const sanitized = DOMPurify.sanitize(postData.content ?? '', {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      });
      
      firstPost = { ...postData, content: sanitized };
    }
  } catch (err) {
    console.error("Error loading series for RSC:", err);
    notFound();
  }

  if (!series) notFound();

  const wordCount = (firstPost?.content || "").replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <SeriesAnimator 
      series={series} 
      firstPost={firstPost} 
      readMinutes={readMinutes}
    >
      <article 
        className="article-content max-w-none"
        dangerouslySetInnerHTML={{ __html: firstPost?.content || "" }}
      />
    </SeriesAnimator>
  );
}
