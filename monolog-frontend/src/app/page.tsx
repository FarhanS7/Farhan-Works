"use client";

import { PostCard } from "@/components/post-card";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── FAQ Data ──────────────────────────────────────────────── */
const faqData = [
  { q: "What is no-code?", a: "No-code is a development method that allows people to build apps or websites without coding, using visual tools and drag-and-drop interfaces." },
  { q: "What are the benefits?", a: "No-code platforms dramatically reduce development time and cost, allowing non-technical teams to build and iterate on products independently." },
  { q: "What services do you offer?", a: "We offer full-stack no-code development, automation workflows, integrations, and ongoing maintenance for businesses of all sizes." },
  { q: "How can I get started?", a: "Simply reach out via our contact form and we'll schedule a discovery call to understand your needs and recommend the best solution." },
  { q: "Can I integrate with existing systems?", a: "Yes, most no-code platforms support hundreds of integrations via APIs and tools like Zapier, Make, and native connectors." },
];

/* ── Skeleton Card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 175 }} className="skeleton" />
      <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
        <div className="skeleton" style={{ height: 14, width: "85%" }} />
        <div className="skeleton" style={{ height: 14, width: "65%" }} />
        <div className="skeleton" style={{ height: 12, width: "100%" }} />
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const gridHeaderRef = useRef<HTMLDivElement>(null);
  const nlRef = useRef<HTMLDivElement>(null);
  const faqLRef = useRef<HTMLDivElement>(null);
  const faqRRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);

  /* ── Fetch posts ── */
  useEffect(() => {
    api.posts
      .getAll()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  /* ── GSAP animations ── */
  useEffect(() => {
    let gsapMod: any;
    let ScrollTriggerMod: any;
    let ctx: any;

    (async () => {
      try {
        const g = await import("gsap");
        const s = await import("gsap/ScrollTrigger");
        gsapMod = g.gsap || g.default;
        ScrollTriggerMod = s.ScrollTrigger || s.default;
        gsapMod.registerPlugin(ScrollTriggerMod);

        ctx = gsapMod.context(() => {
          // Hero badge + title + subtitle
          const badge = heroRef.current?.querySelector(".hero-badge");
          const h1 = heroRef.current?.querySelector("h1");
          const sub = heroRef.current?.querySelector(".hero-sub");
          if (badge) gsapMod.from(badge, { opacity: 0, y: -10, duration: 0.5, delay: 0.2 });
          if (h1) gsapMod.from(h1, { opacity: 0, y: 28, duration: 0.6, delay: 0.3, ease: "power3.out" });
          if (sub) gsapMod.from(sub, { opacity: 0, y: 18, duration: 0.5, delay: 0.45, ease: "power2.out" });

          // Featured wrap
          if (featRef.current) {
            gsapMod.from(featRef.current, {
              opacity: 0, y: 38, duration: 0.85, ease: "power3.out",
              scrollTrigger: { trigger: featRef.current, start: "top 83%" },
            });
          }

          // Laptop float
          if (laptopRef.current) {
            gsapMod.to(laptopRef.current, { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
          }

          // Grid header
          if (gridHeaderRef.current) {
            gsapMod.from(gridHeaderRef.current, {
              opacity: 0, y: 18, duration: 0.55, ease: "power2.out",
              scrollTrigger: { trigger: gridHeaderRef.current, start: "top 88%" },
            });
          }

          // Blog cards stagger
          const cards = document.querySelectorAll(".blog-card");
          cards.forEach((c, i) => {
            gsapMod.from(c, {
              opacity: 0, y: 28, duration: 0.58, ease: "power3.out",
              delay: (i % 3) * 0.1,
              scrollTrigger: { trigger: c, start: "top 92%" },
            });
          });

          // Newsletter
          if (nlRef.current) {
            gsapMod.from(nlRef.current, {
              opacity: 0, duration: 0.7, ease: "power2.out",
              scrollTrigger: { trigger: nlRef.current, start: "top 80%" },
            });
          }

          // FAQ columns
          if (faqLRef.current) {
            gsapMod.from(faqLRef.current, {
              opacity: 0, x: -28, duration: 0.7, ease: "power3.out",
              scrollTrigger: { trigger: faqLRef.current, start: "top 82%" },
            });
          }
          if (faqRRef.current) {
            gsapMod.from(faqRRef.current, {
              opacity: 0, x: 28, duration: 0.7, ease: "power3.out", delay: 0.12,
              scrollTrigger: { trigger: faqRRef.current, start: "top 82%" },
            });
          }

          // Footer wordmark
          const wm = document.querySelector(".footer-wordmark");
          if (wm) {
            gsapMod.from(wm, {
              opacity: 0, y: 30, duration: 0.9, ease: "power2.out",
              scrollTrigger: { trigger: wm, start: "top 90%" },
            });
          }
        });
      } catch (err) {
        console.warn("GSAP not available:", err);
      }
    })();

    return () => { ctx?.revert?.(); };
  }, [loading]);

  /* ── Cursor glow ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Scroll-to-top ── */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Derived data ── */
  const featured = posts[0];
  const featuredDate = featured?.published_at
    ? new Date(featured.published_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "11 Jan 2022";
  const featuredReadTime = featured
    ? `${Math.max(1, Math.ceil((featured.content || featured.excerpt || "").split(" ").length / 200))} min read`
    : "5 min read";

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? -1 : i);

  return (
    <>
      {/* Cursor glow (dark only) */}
      <div ref={cursorRef} className="cursor-glow" />

      {/* Scroll-to-top */}
      <button
        className={`scroll-top ${showScrollTop ? "show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>

      {/* ═══ HERO ═══ */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-badge">✨ Latest</div>
        <h1>Discover our Insights</h1>
        <p className="hero-sub">Stay up-to-date with our latest blog posts.</p>
      </section>

      {/* ═══ FEATURED ═══ */}
      <div className="featured-wrap" ref={featRef}>
        <div className="featured-card">
          <div className="featured-image">
            <div className="feat-img-bg">
              <div className="laptop-mock" ref={laptopRef}>
                <div className="laptop-screen">
                  <strong>
                    Empower Your Team with<br />Seamless Collaboration
                  </strong>
                  <p style={{ fontSize: 10, marginTop: 8, opacity: 0.7 }}>
                    Dashboard · Tasks · Members · Hours
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="featured-content">
            <span className="tag-pill">All</span>
            <h2>{featured?.title || "10 Tips for Successful Blogging"}</h2>
            <p>{featured?.excerpt || "Learn how to create engaging blog content that drives traffic."}</p>
            <Link
              href={featured ? `/posts/${featured.id}` : "/posts"}
              className="btn-orange"
              style={{ width: "fit-content" }}
            >
              Discover Now <span className="arrow-c">↗</span>
            </Link>
            <div className="progress-bar" />
            <div className="featured-meta">
              <div className="meta-avatar">{featured?.author?.charAt(0) || "J"}</div>
              <div className="meta-info">
                <div className="name">{featured?.author || "John Doe"}</div>
                <div className="date">{featuredDate}</div>
              </div>
              <div className="meta-time">⏱ {featuredReadTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ GRID HEADER ═══ */}
      <div className="section-header" ref={gridHeaderRef}>
        <h2>All Blog Post</h2>
        <div className="sort-select">
          Short By :
          <div className="select-pill">Category One ▾</div>
        </div>
      </div>

      {/* ═══ BLOG GRID ═══ */}
      {loading ? (
        <div className="blog-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div style={{ padding: "0 60px", marginBottom: 46 }}>
          <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 16, padding: "32px", textAlign: "center" }}>
            <p style={{ fontWeight: 600, color: "#ef4444" }}>Could not load posts.</p>
            <p style={{ marginTop: 4, fontSize: 13, color: "var(--tm)" }}>{error}</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: "0 60px", marginBottom: 46 }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "48px", textAlign: "center", color: "var(--tm)" }}>
            No posts yet. Check back soon.
          </div>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.slice(0, visibleCount).map((post, i) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt || "Discover how blogging can boost your business growth."}
              date={new Date(post.published_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
              readTime={`${Math.max(1, Math.ceil((post.content || post.excerpt || "").split(" ").length / 200))} min read`}
              category={post.category || "Uncategorized"}
              coverImage={post.cover_image_url}
              author={post.author || "John Doe"}
              imgClass={`card-img-${(i % 3) + 1}`}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      <div className="load-more-wrap">
        {!loading && posts.length > visibleCount ? (
          <button className="btn-orange" onClick={() => setVisibleCount((c) => c + 6)}>
            Load More <span className="arrow-c">↗</span>
          </button>
        ) : !loading && posts.length > 0 ? (
          <Link href="/posts" className="btn-orange">
            Load More <span className="arrow-c">↗</span>
          </Link>
        ) : null}
      </div>

      {/* ═══ NEWSLETTER ═══ */}
      <div className="newsletter-wrap">
        <div className="newsletter" ref={nlRef}>
          <div className="nl-orb1" />
          <div className="nl-orb2" />
          <h2>Stay Updated With Our Newslatter</h2>
          <p>
            Subscribe to our newsletter for the latest updates and insights
            <br />
            on no-code/low-code development.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input className="newsletter-input" type="email" placeholder="Enter Your Email" />
            <button type="submit" className="btn-orange">Join Now</button>
          </form>
          <p className="newsletter-legal">
            By joining, you agree to our <a href="#">Terms and Conditions.</a>
          </p>
        </div>
      </div>

      {/* ═══ FAQ ═══ */}
      <div className="faq-section" id="contact">
        <div className="faq-left" ref={faqLRef}>
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our no-code/low-code development services.</p>
          <div className="faq-contact-label">Still have questions?</div>
          <div className="faq-contact-sub">Contact us for further assistance.</div>
          <a href="#contact" className="btn-orange" style={{ width: "fit-content", marginTop: 4 }}>
            Contact <span className="arrow-c">↗</span>
          </a>
        </div>
        <div className="faq-right" ref={faqRRef}>
          {faqData.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${openFaq === i ? "open" : ""}`}
              onClick={() => toggleFaq(i)}
            >
              <div className="faq-question">
                {item.q}
                <div className="faq-icon">+</div>
              </div>
              <div className="faq-answer">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
