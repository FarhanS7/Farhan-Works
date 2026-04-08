"use client";

import { 
  X, 
  Layers, 
  Play, 
  List, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  BookOpen, 
  Clock 
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Series, BlogPost } from "@/types";

export function SeriesAnimator({ 
  series, 
  firstPost, 
  readMinutes,
  children 
}: { 
  series: Series; 
  firstPost: BlogPost | null;
  readMinutes: number;
  children: React.ReactNode;
}) {
  const [showChapters, setShowChapters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".animate-reveal", {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, []);

  return (
    <div ref={containerRef} className="bg-surface min-h-screen relative">
      {/* Background Aesthetic */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="relative">
        <header className="relative pt-32 pb-16 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="w-full md:w-1/3 aspect-[4/5] relative group shrink-0 animate-reveal">
                <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] rotate-3 group-hover:rotate-6 transition-transform duration-500" />
                <div className="absolute inset-0 bg-surface border-2 border-border rounded-[2.5rem] -rotate-3 group-hover:-rotate-1 transition-transform duration-500 overflow-hidden shadow-level-3">
                  {series.cover_image_url ? (
                    <img 
                      src={series.cover_image_url} 
                      alt={series.title}
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-muted flex items-center justify-center">
                      <Layers className="w-20 h-20 text-text-faint" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
                </div>
              </div>

              <div className="flex-1 space-y-8 py-4 animate-reveal">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-faint">
                  <Link href="/posts" className="hover:text-primary transition-colors">Digital Garden</Link>
                  <ChevronRight size={10} />
                  <span className="text-primary">Curated Series</span>
                </nav>

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 backdrop-blur-sm">
                    <BookOpen size={14} /> Comprehensive Learning Path
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-surface-on tracking-tighter leading-[0.9] drop-shadow-sm">
                    {series.title}
                  </h1>
                  <p className="text-xl text-text-muted max-w-2xl font-medium leading-relaxed">
                    {series.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => {
                       const contentEl = document.getElementById('main-content');
                       contentEl?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black hover:shadow-xl hover:shadow-primary/30 transition-all group active:scale-95"
                  >
                    <Play size={18} fill="currentColor" />
                    Start Reading
                  </button>
                  <button 
                    onClick={() => setShowChapters(true)}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-surface-muted border border-border text-surface-on font-black hover:bg-surface hover:border-primary/40 transition-all group active:scale-95"
                  >
                    <List size={18} />
                    View Curriculum
                  </button>
                </div>

                <div className="pt-6 flex items-center gap-8 text-xs font-black uppercase tracking-widest text-text-faint border-t border-border">
                  <span className="flex items-center gap-2"><Layers size={14}/> {series.posts?.length || 0} Modules</span>
                  <span className="flex items-center gap-2"><Clock size={14}/> ~{(series.posts?.length || 0) * 10}m Read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="main-content" className="max-w-4xl mx-auto px-6 pb-32 animate-reveal">
          {firstPost ? (
            <div className="space-y-16">
               <div className="flex items-center justify-between border-b border-border pb-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Chapter 01</span>
                    <h2 className="text-3xl font-black text-surface-on tracking-tight">{firstPost.title}</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-text-muted text-sm font-medium">
                     <span className="flex items-center gap-2"><Clock size={14} /> {readMinutes} min read</span>
                     <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors border border-border">
                          <Bookmark size={16} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors border border-border">
                          <Share2 size={16} />
                        </button>
                     </div>
                  </div>
               </div>

               {children}

               <div className="pt-16 border-t border-border flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-1 bg-primary/20 rounded-full" />
                  <div>
                    <h4 className="text-xl font-black text-surface-on mb-2">Enjoyed the first module?</h4>
                    <p className="text-text-muted">Master the rest of the craft by diving into the full curriculum.</p>
                  </div>
                  <button 
                    onClick={() => setShowChapters(true)}
                    className="flex items-center gap-3 px-10 py-5 rounded-3xl bg-surface-on text-surface font-black hover:scale-105 transition-all shadow-xl active:scale-95"
                  >
                    Launch Full Curriculum
                  </button>
               </div>
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-[3rem]">
               <Layers size={48} className="mx-auto text-text-faint mb-4" />
               <p className="font-bold text-text-muted">This series is currently being drafted.</p>
            </div>
          )}
        </section>
      </div>

      {/* Curriculum Drawer Overlay */}
      {showChapters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-surface/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowChapters(false)}
          />
          <div className="relative w-full max-w-xl bg-surface border-l border-border h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
            <div className="p-8 border-b border-border flex items-center justify-between shrink-0">
               <div>
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">Learning Path</h3>
                 <p className="text-xl font-black text-surface-on tracking-tight">Full Curriculum</p>
               </div>
               <button 
                onClick={() => setShowChapters(false)}
                className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted hover:bg-primary/10 hover:text-primary transition-all border border-border group"
               >
                 <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               <div className="space-y-4">
                 {series.posts?.map((post: BlogPost, idx: number) => (
                    <Link 
                      key={post.id} 
                      href={`/blog/${series.slug}/${post.slug}`}
                      className="group block p-6 rounded-[2rem] border border-border bg-surface hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-level-2 transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-surface-muted border border-border flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Ch.</span>
                          <span className="text-xl font-black leading-none">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-surface-on group-hover:text-primary transition-colors truncate">
                            {post.title}
                          </h4>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-faint group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </Link>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
