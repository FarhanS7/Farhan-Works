"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { PostCard } from "@/components/post-card";

/* ── FAQ Data ──────────────────────────────────────────────── */
const faqData = [
  { q: "What is Farhan.Dev?", a: "A personal technical publication focused on software architecture, systems engineering, and the craft of high-quality software." },
  { q: "What topics do you cover?", a: "Deep dives into Node.js, Next.js, Distributed Systems, and the occasional personal meditation on technical growth." },
  { q: "How often do you post?", a: "New long-form articles are released bi-weekly, with smaller insights and 'Today I Learned' snippets appearing more frequently." },
  { q: "Can I collaborate or guest post?", a: "While this is primarily a personal journal, I am always open to technical discussions and collaborative open-source ventures." },
  { q: "Where can I follow you?", a: "I am most active on LinkedIn and X. You can find links to all my social profiles in the footer below." },
];

interface HomeClientWrapperProps {
  initialPosts: any[];
  initialSeries: any[];
}

export function HomeClientWrapper({ initialPosts, initialSeries }: HomeClientWrapperProps) {
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

  /* ── GSAP animations ── */
  useEffect(() => {
    let ctx: any;
    let cancelled = false;

    (async () => {
      try {
        const g = await import("gsap");
        const s = await import("gsap/ScrollTrigger");
        if (cancelled) return;

        const gsap = g.gsap || g.default;
        const ScrollTrigger = s.ScrollTrigger || s.default;
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.getAll().forEach((t: any) => t.kill());

        ctx = gsap.context(() => {
          const badge = heroRef.current?.querySelector(".hero-badge");
          const h1 = heroRef.current?.querySelector("h1");
          const sub = heroRef.current?.querySelector(".hero-sub");
          if (badge) gsap.fromTo(badge, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 });
          if (h1) gsap.fromTo(h1, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power3.out" });
          if (sub) gsap.fromTo(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: "power2.out" });

          if (featRef.current) {
            gsap.fromTo(featRef.current,
              { opacity: 0, y: 38 },
              { opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
                scrollTrigger: { trigger: featRef.current, start: "top 83%" } }
            );
          }

          if (laptopRef.current) {
            gsap.to(laptopRef.current, { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
          }

          if (gridHeaderRef.current) {
            gsap.fromTo(gridHeaderRef.current,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.55, ease: "power2.out",
                scrollTrigger: { trigger: gridHeaderRef.current, start: "top 88%" } }
            );
          }

          const cards = document.querySelectorAll(".blog-card");
          cards.forEach((c, i) => {
            gsap.fromTo(c,
              { opacity: 0, y: 28 },
              { opacity: 1, y: 0, duration: 0.58, ease: "power3.out",
                delay: (i % 3) * 0.1,
                scrollTrigger: { trigger: c, start: "top 92%" } }
            );
          });

          if (nlRef.current) {
            gsap.fromTo(nlRef.current,
              { opacity: 0 },
              { opacity: 1, duration: 0.7, ease: "power2.out",
                scrollTrigger: { trigger: nlRef.current, start: "top 80%" } }
            );
          }

          if (faqLRef.current) {
            gsap.fromTo(faqLRef.current,
              { opacity: 0, x: -28 },
              { opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
                scrollTrigger: { trigger: faqLRef.current, start: "top 82%" } }
            );
          }
          if (faqRRef.current) {
            gsap.fromTo(faqRRef.current,
              { opacity: 0, x: 28 },
              { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", delay: 0.12,
                scrollTrigger: { trigger: faqRRef.current, start: "top 82%" } }
            );
          }

          const wm = document.querySelector(".footer-wordmark");
          if (wm) {
            gsap.fromTo(wm,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
                scrollTrigger: { trigger: wm, start: "top 90%" } }
            );
          }
        });
      } catch (err) {
        console.warn("GSAP not available:", err);
      }
    })();

    return () => {
      cancelled = true;
      ctx?.revert?.();
    };
  }, []);

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

  const featured = initialPosts[0];
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
        <p className="hero-sub">Deep dives into software engineering, architecture, and systems.</p>
      </section>

      {/* ═══ FEATURED ═══ */}
      <div className="container-px" ref={featRef} style={{ marginBottom: 60 }}>
        <div className="featured-card">
          <div className="featured-image">
            <div className="feat-img-bg">
              <div className="laptop-mock" ref={laptopRef}>
                <div className="laptop-screen">
                  <strong>
                    Farhan.Dev<br />Technical Deep Dives
                  </strong>
                  <p style={{ fontSize: 10, marginTop: 8, opacity: 0.7 }}>
                    Architecture · Systems · Code · Performance
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
              href={featured ? `/posts/${featured.slug || featured.id}` : "/posts"}
              className="btn-orange"
              style={{ width: "fit-content" }}
            >
              Discover Now <span className="arrow-c">↗</span>
            </Link>
            <div className="progress-bar" />
            <div className="featured-meta">
              <div className="meta-avatar">{featured?.author?.charAt(0) || "J"}</div>
              <div className="meta-info">
                <div className="name">{featured?.author || "Farhan Shahriar"}</div>
                <div className="date">{featuredDate}</div>
              </div>
              <div className="meta-time">⏱ {featuredReadTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FEATURED SERIES ═══ */}
      {initialSeries.length > 0 && (
        <div className="container-px mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-tp tracking-tight">Curated <span className="text-orange">Collections</span></h2>
              <p className="text-sm text-tm mt-1">Deep dives into specific topics, organized for learning.</p>
            </div>
            <Link href="/series" className="text-[10px] font-black uppercase tracking-widest text-td hover:text-orange transition-all flex items-center gap-2">
              View All Series <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {initialSeries.slice(0, 3).map((s, i) => (
              <Link 
                key={s.id} 
                href={`/series/${s.slug}`}
                className="group relative overflow-hidden rounded-[2rem] border border-card-border bg-card-bg hover:border-orange/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange/5"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                   {s.cover_image_url ? (
                     <img 
                      src={s.cover_image_url} 
                      alt={s.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                     />
                   ) : (
                     <div className={`w-full h-full bg-gradient-to-br ${i % 2 === 0 ? 'from-orange/20 to-purple/20' : 'from-blue/20 to-emerald/20'} flex items-center justify-center`}>
                        <Layers size={48} className="text-tp/10" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent opacity-60" />
                </div>
                
                <div className="p-4 sm:p-8 relative">
                  <div className="flex items-center gap-3 mb-2 sm:mb-4">
                     <span className="px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-[9px] sm:text-[10px] font-black text-orange uppercase tracking-widest">
                       {s.post_count || 0} Articles
                     </span>
                  </div>
                  <h3 className="text-sm sm:text-xl font-black text-tp group-hover:text-orange transition-colors mb-2 tracking-tight leading-tight line-clamp-2">
                    {s.title}
                  </h3>
                  <p className="hidden sm:block text-xs sm:text-sm text-tm line-clamp-2 mb-4 sm:mb-6">
                    {s.description || "Exploration of concepts and implementations in this specialized series."}
                  </p>
                  <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-td group-hover:text-tp transition-all">
                    Start Learning <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ GRID HEADER ═══ */}
      <div className="section-header" ref={gridHeaderRef}>
        <h2>All Blog Post</h2>
        <div className="sort-select">
          Short By :
          <div className="select-pill">Category One ▾</div>
        </div>
      </div>

      {/* ═══ BLOG GRID ═══ */}
      <div className="blog-grid">
        {initialPosts.slice(0, visibleCount).map((post, i) => (
          <PostCard
            key={post.id}
            id={post.id}
            slug={post.slug}
            title={post.title}
            excerpt={post.excerpt || "Discover how blogging can boost your business growth."}
            date={new Date(post.published_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            readTime={`${Math.max(1, Math.ceil((post.content || post.excerpt || "").split(" ").length / 200))} min read`}
            category={post.category || "Uncategorized"}
            coverImage={post.cover_image_url}
            author={post.author || "Farhan Shahriar"}
            imgClass={`card-img-${(i % 3) + 1}`}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="load-more-wrap">
        {initialPosts.length > visibleCount ? (
          <button className="btn-orange" onClick={() => setVisibleCount((c) => c + 6)}>
            Load More <span className="arrow-c">↗</span>
          </button>
        ) : initialPosts.length > 0 ? (
          <Link href="/posts" className="btn-orange">
            View All Posts <span className="arrow-c">↗</span>
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
            Subscribe to get my latest technical deep dives 
            <br />
            delivered straight to your inbox.
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
          <p>Common questions about my writing, topics, and development background.</p>
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
