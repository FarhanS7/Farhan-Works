"use client";

import { X, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CurriculumDrawer({ 
  series, 
  slug, 
  children,
  firstPostId 
}: { 
  series: any, 
  slug: string, 
  children: React.ReactNode,
  firstPostId?: string 
}) {
  const [showChapters, setShowChapters] = useState(false);

  const triggerScroll = () => {
    const contentEl = document.getElementById('main-content');
    contentEl?.scrollIntoView({ behavior: 'smooth' });
    setShowChapters(false);
  };

  return (
    <>
      <div onClick={(e) => {
        // If clicking start reading, scroll, otherwise show chapters
        if ((e.target as HTMLElement).innerText?.toLowerCase().includes("start")) {
          triggerScroll();
        } else {
          setShowChapters(true);
        }
      }}>
        {children}
      </div>

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
                 {series.posts?.map((post: any, idx: number) => (
                    <Link 
                      key={post.id} 
                      href={`/blog/${slug}/${post.slug}`}
                      className="group block p-6 rounded-[2rem] border border-border bg-surface hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-level-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 50}ms` }}
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
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-faint group-hover:text-primary/60 transition-colors">
                            {post.category || 'Module Content'}
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-faint group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </Link>
                 ))}
               </div>
            </div>

            <div className="p-8 bg-surface-muted border-t border-border shrink-0">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Progress Tracker</p>
                  <span className="text-xs font-black text-primary">0 / {series.posts?.length} Completed</span>
               </div>
               <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '0%' }} />
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
