"use client"

import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import {
  ArrowRight,
  BookOpen,
  Heart,
  MessageSquare,
  Ruler,
  Search,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
)

export default function HomePage() {
    const [posts, setPosts] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        const loadHomePageData = async () => {
             try {
                const [postsData, statsData] = await Promise.all([
                    api.posts.getAll(),
                    api.analytics.getPublicStats().catch(() => null)
                ])
                setPosts(postsData)
                setStats(statsData)
             } catch (e) {
                console.error(e)
             } finally {
                setLoading(false)
             }
        }
        loadHomePageData()
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (search.trim()) window.location.href = "/posts?q=" + encodeURIComponent(search)
    }

    // Chart Data - Using Real Weekly Views
    const lineChartData = {
        labels: stats?.weeklyViews?.map((v: any) => v.label) || ['-', '-', '-', '-', '-', '-', '-'],
        datasets: [{
            data: stats?.weeklyViews?.map((v: any) => v.value) || [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#0f172a',
            borderWidth: 1.5,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#0f172a',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 140);
                gradient.addColorStop(0, 'rgba(15, 23, 42, 0.08)');
                gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
                return gradient;
            },
        }]
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <span className="text-slate-400 font-medium animate-pulse">Initializing MonoLog...</span>
            </div>
        </div>
    )

    return (
        <main className="min-h-screen bg-slate-50 antialiased text-slate-800 selection:bg-rose-100 selection:text-rose-900 flex flex-col items-center">
            {/* Main Portal Container */}
            <div className="overflow-hidden grid grid-cols-12 lg:p-10 bg-slate-50 w-full max-w-screen-2xl relative gap-8 p-6">
                
                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-white/40 pointer-events-none opacity-40"></div>

                {/* Main Content Area */}
                <div className="col-span-12 flex flex-col gap-10 z-10 w-full">
                    
                    {/* Public Header */}
                    <header className="flex flex-wrap items-center justify-between gap-6 pb-2">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all duration-500">
                                <BookOpen size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl text-slate-900 font-black tracking-tight leading-none">MonoLog</span>
                                <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Reader Portal</span>
                            </div>
                        </Link>

                        {/* Profile & Session - Removed as auth system is not implemented */}
                    </header>

                    {/* Master Hero Display */}
                    <div className="min-h-[600px] flex flex-col overflow-hidden bg-slate-900 rounded-[3rem] p-10 relative justify-between shadow-2xl border border-white/5">
                        {/* High-End Motion Background */}
                        <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
                             <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/30 blur-[120px] rounded-full animate-pulse"></div>
                             <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full"></div>
                        </div>
                        
                        {/* Hero Narrative */}
                        <div className="z-10 relative max-w-xl">
                            <div className="flex items-center gap-2 mb-8">
                                <Sparkles size={16} className="text-rose-500" />
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Featured Publication</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl text-white font-black tracking-tight leading-[0.9] mb-6">
                                The code that <br/> <span className="text-slate-500 group-hover:text-white transition-colors">shapes the void.</span>
                            </h1>
                            <p className="text-slate-400 text-base font-medium leading-relaxed mb-10 max-w-md">
                                Deep dives into modern engineering, distributed systems, and the artistic layer of software development.
                            </p>
                            <Link href="/posts" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl group">
                                Explore Library
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Community Momentum stats */}
                        <div className="flex gap-16 z-10 relative border-t border-white/10 pt-10">
                            <div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Total Readers</div>
                                <div className="text-5xl text-white font-black tracking-tighter">
                                    {((stats?.totalViews || 0) / 1000).toFixed(1)}<span className="text-2xl text-slate-600 ml-1 font-bold">K</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Reader Synergy</div>
                                <div className="text-5xl text-white font-black tracking-tighter">
                                    {stats?.engagementRate || "0.0"}<span className="text-2xl text-slate-600 ml-1 font-bold">%</span>
                                </div>
                            </div>
                             <div className="hidden md:block">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Published Works</div>
                                <div className="text-5xl text-white font-black tracking-tighter">
                                    {stats?.totalPosts || posts.length}<span className="text-2xl text-slate-600 ml-1 font-bold">+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Discovery Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-8">
                            <div className="hidden sm:flex flex-col gap-0.5">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">CURRENT PHASE</span>
                                <span className="text-sm font-bold text-slate-900 tracking-tight">Active Learning</span>
                            </div>
                            
                            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                            
                            <form onSubmit={handleSearch} className="relative group min-w-[320px]">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-4 group-focus-within:text-slate-900 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search the archives..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-5 py-3.5 bg-white rounded-3xl text-sm font-semibold text-slate-700 placeholder-slate-300 shadow-sm border border-slate-100/50 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 outline-none transition-all"
                                />
                            </form>
                        </div>

                        <div className="flex bg-slate-100/50 p-1.5 rounded-full border border-slate-100">
                             {["All", "Philosophy", "Engineering", "Design"].map((cat, i) => (
                                <button key={cat} className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all",
                                    i === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}>
                                    {cat}
                                </button>
                             ))}
                        </div>
                    </div>

                    {/* We removed the Secondary Bento Grid containing analytics as per user request */}
                </div>
                    {/* Horizontal Blog Archives */}
                    <div className="col-span-12 w-full mt-4 z-10">
                        {/* Featured Item Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {posts.map((post, idx) => {
                            // Calculate read time based on word count (avg 200 words/min)
                            const wordCount = post.content ? post.content.split(/\s+/).length : 0;
                            const readTime = Math.max(1, Math.ceil(wordCount / 200));

                            return (
                                <Link key={post.id} href={`/posts/${post.id}`} className="group relative flex flex-col bg-slate-50 rounded-[2.5rem] p-4 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] mb-6 shadow-sm">
                                        <img 
                                            src={post.hero_image || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop"} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            alt={post.title}
                                        />
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-white/90 backdrop-blur-xl p-2.5 rounded-full shadow-md text-rose-500 hover:text-rose-600 hover:scale-110 transition-all cursor-pointer">
                                                <Heart size={18} className="fill-current" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                                                {post.category || "General"}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-rose-600 text-[11px] font-black uppercase tracking-[0.2em]">
                                                {new Date(post.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                {idx === 0 ? "Latest Arrival" : "Essential Read"}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-rose-600 mb-6 line-clamp-2 leading-tight tracking-tight group-hover:text-rose-700 transition-colors">
                                            {post.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-6 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare size={14} strokeWidth={2}/>
                                                <span className="text-xs font-bold">{post.comments || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Heart size={14} strokeWidth={2} />
                                                <span className="text-xs font-bold">{post.reactions || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-auto text-slate-500">
                                                <Ruler size={14} strokeWidth={2}/>
                                                <span className="text-[10px] font-black tracking-widest uppercase">{readTime}M READ</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
            
            {/* Minimal Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center opacity-30 select-none z-0">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">MonoLog Publication © 2026</span>
            </div>
        </main>
    )
}
