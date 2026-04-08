"use client";

import { useEffect } from "react";

export function GsapAnimator() {
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
          const hero = document.querySelector(".hero-section");
          if (hero) {
            const badge = hero.querySelector(".hero-badge");
            const h1 = hero.querySelector("h1");
            const sub = hero.querySelector(".hero-sub");
            if (badge) gsap.fromTo(badge, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 });
            if (h1) gsap.fromTo(h1, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power3.out" });
            if (sub) gsap.fromTo(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: "power2.out" });
          }

          const featRef = document.querySelector(".featured-wrap");
          if (featRef) {
            gsap.fromTo(featRef,
              { opacity: 0, y: 38 },
              { opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
                scrollTrigger: { trigger: featRef, start: "top 83%" } }
            );
          }

          const laptopRef = document.querySelector(".laptop-mock");
          if (laptopRef) {
            gsap.to(laptopRef, { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
          }

          const gridHeaderRef = document.querySelector(".section-header");
          if (gridHeaderRef) {
            gsap.fromTo(gridHeaderRef,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.55, ease: "power2.out",
                scrollTrigger: { trigger: gridHeaderRef, start: "top 88%" } }
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

          const nlRef = document.querySelector(".newsletter");
          if (nlRef) {
            gsap.fromTo(nlRef,
              { opacity: 0 },
              { opacity: 1, duration: 0.7, ease: "power2.out",
                scrollTrigger: { trigger: nlRef, start: "top 80%" } }
            );
          }

          const faqLRef = document.querySelector(".faq-left");
          if (faqLRef) {
            gsap.fromTo(faqLRef,
              { opacity: 0, x: -28 },
              { opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
                scrollTrigger: { trigger: faqLRef, start: "top 82%" } }
            );
          }
          const faqRRef = document.querySelector(".faq-right");
          if (faqRRef) {
            gsap.fromTo(faqRRef,
              { opacity: 0, x: 28 },
              { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", delay: 0.12,
                scrollTrigger: { trigger: faqRRef, start: "top 82%" } }
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

  return null;
}
