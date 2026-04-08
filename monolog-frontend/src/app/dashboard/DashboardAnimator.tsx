"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function DashboardAnimator({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".animate-in", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
