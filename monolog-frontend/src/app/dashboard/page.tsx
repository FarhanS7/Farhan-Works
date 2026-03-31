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
    Tooltip
} from "chart.js"
import {
    AlertCircle,
    BookOpen,
    ChevronDown,
    FileText,
    Gem,
    Layers,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    MoreHorizontal,
    Search,
    User
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Doughnut, Line } from "react-chartjs-2"

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

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [recentComments, setRecentComments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const token = api.getToken()
        if (!token) {
            router.push("/login")
            return
        }

        async function loadDashboardData() {
            try {
                const [statsData, commentsData] = await Promise.all([
                    api.analytics.getStats(token!),
                    api.comments.getAdminList(token!)
                ])
                setStats(statsData)
                setRecentComments(commentsData.slice(0, 3))
            } catch (err: any) {
                if (err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('unauthorized')) {
                    api.setToken(null)
                    router.push("/login")
                    return
                }
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadDashboardData()
    }, [router])

    if (loading) return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Syncing your insight board...</p>
            </div>
        </div>
    )

    // Chart Data
    const weeklyLabels = stats?.weeklyViews?.map((v: any) => v.label) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyValues = stats?.weeklyViews?.map((v: any) => v.value) || [0, 0, 0, 0, 0, 0, 0];
    
    const lineChartData = {
        labels: weeklyLabels,
        datasets: [{
            data: weeklyValues,
            borderColor: '#0f172a',
            borderWidth: 2,
            backgroundColor: 'rgba(15, 23, 42, 0.05)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
        }]
    }

    const engagementVal = parseFloat(stats?.engagementRate || 0);
    const doughnutData = {
        labels: ['Engaged', 'Browsing'],
        datasets: [{
            data: [engagementVal, Math.max(0, 100 - engagementVal)],
            backgroundColor: ['#0ea5e9', '#e0f2fe'],
            borderWidth: 0,
        }]
    }

    const peakIndex = weeklyValues.indexOf(Math.max(...weeklyValues));

    return (
        <div className="min-h-screen bg-slate-400 p-4 lg:p-8 flex items-center justify-center font-sans antialiased text-slate-800">
            {/* Dashboard Container */}
            <div className="overflow-hidden grid grid-cols-12 bg-slate-50 w-full max-w-screen-2xl rounded-[2.5rem] p-6 lg:p-8 relative shadow-2xl gap-8">

                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-white/40 pointer-events-none"></div>

                {/* Main Content Area */}
                <div className="col-span-12 flex flex-col gap-8 z-10">

                    {/* Header */}
                    <header className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg">
                                    <BookOpen size={20} className="text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tighter text-slate-900 group-hover:text-rose-600 transition-colors uppercase">
                                    MonoLog
                                </span>
                            </Link>

                            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                            {/* Site Links */}
                            <nav className="hidden lg:flex items-center gap-1">
                                {[
                                    { label: "Home",  href: "/" },
                                    { label: "Posts", href: "/posts" },
                                    { label: "About", href: "/about" },
                                ].map(({ label, href }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="px-4 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all uppercase tracking-widest"
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Nav Pills (Dashboard Internal) */}
                        <nav className="hidden md:flex items-center bg-white shadow-sm border border-slate-100 rounded-full p-1.5 gap-1">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-full transition-colors group">
                                <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold">Overview</span>
                            </button>
                            <Link href="/dashboard/posts" className="flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors group">
                                <FileText size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Articles</span>
                            </Link>
                            <Link href="/dashboard/comments" className="flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors group">
                                <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Moderation</span>
                            </Link>
                        </nav>

                        {/* Profile & Site Actions */}
                        <div className="flex items-center gap-2">
                             <div className="flex items-center bg-white border border-slate-100 rounded-full p-1 shadow-sm mr-2">
                                <button
                                    onClick={() => {
                                        const q = window.prompt("Search articles:")
                                        if (q) window.location.href = "/dashboard/posts?q=" + encodeURIComponent(q)
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition"
                                >
                                    <Search size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        api.setToken(null)
                                        router.push("/")
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                >
                                    <LogOut size={18} />
                                </button>
                             </div>

                            <div className="flex gap-3 items-center cursor-pointer group bg-white border border-slate-100 rounded-full pl-1 pr-4 py-1 shadow-sm hover:shadow-md transition-all">
                                <div className="w-9 h-9 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm shadow-rose-200">
                                    M
                                </div>
                                <div className="hidden xl:block leading-tight">
                                    <div className="text-xs font-bold text-slate-900">Admin Editor</div>
                                </div>
                                <ChevronDown size={14} className="text-slate-400 hidden xl:block" />
                            </div>
                        </div>
                    </header>

                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="text-slate-400 text-sm font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>

                            <div className="relative group">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="pl-11 pr-4 py-3 bg-white rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm border-none focus:ring-2 focus:ring-rose-500/20 outline-none w-64 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex bg-white p-1.5 rounded-full shadow-sm">
                            <Link href="/dashboard/new" className="px-6 py-2 bg-rose-600 text-white text-sm font-bold rounded-full shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all">
                                + New Article
                            </Link>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="min-h-[420px] flex flex-col overflow-hidden group bg-gradient-to-br from-slate-500 via-slate-400 to-slate-100 rounded-[3rem] p-10 relative justify-between shadow-inner">
                        {/* Stats Top Left */}
                        <div className="z-10 flex gap-12 mt-4 relative">
                            <div>
                                <div className="text-sm font-bold text-white/70 mb-1 uppercase tracking-widest leading-none">Total Views</div>
                                <div className="text-6xl text-white font-black tracking-tighter">
                                    {stats?.totalViews?.toLocaleString() || "0"}
                                    <span className="text-2xl text-white/50 ml-1 font-medium">reads</span>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-sm font-bold text-white/70 mb-1 uppercase tracking-widest leading-none">Engagement</div>
                                <div className="text-6xl text-white font-black tracking-tighter">
                                    {stats?.engagementRate || "0.0"}<span className="text-2xl text-white/50 ml-1 font-medium">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards Bottom Left */}
                        <div className="flex flex-wrap max-w-2xl z-10 mt-auto relative gap-6">
                            {/* Posts Card */}
                            <div className="bg-white/90 backdrop-blur-xl w-64 rounded-[2rem] p-6 shadow-2xl border border-white/50" style={{ position: "relative" }}>
                                <div className="flex items-center gap-2 mb-6 text-rose-600">
                                    <FileText size={20} />
                                    <span className="text-xs font-black uppercase tracking-widest">Articles Published</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-4xl text-slate-900 font-black tracking-tighter">{stats?.totalPosts || 0}</div>
                                    <div className="text-rose-500 text-sm font-bold mb-1">Live</div>
                                </div>
                                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full w-[85%]"></div>
                                </div>
                            </div>

                            {/* Comments Card */}
                            <div className="bg-white/90 backdrop-blur-xl w-64 rounded-[2rem] p-6 shadow-2xl border border-white/50" style={{ position: "relative" }}>
                                <div className="flex items-center gap-2 mb-6 text-sky-600">
                                    <MessageSquare size={20} />
                                    <span className="text-xs font-black uppercase tracking-widest">Pending Review</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-4xl text-slate-900 font-black tracking-tighter">{stats?.pendingComments || 0}</div>
                                    <div className="bg-sky-100 px-2.5 py-1 rounded-lg text-sky-700 text-[10px] font-black mb-1">
                                        ACTIONABLE
                                    </div>
                                </div>
                                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500 rounded-full w-[15%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Promo Card */}
                        <div className="md:col-span-3 bg-white rounded-[2.5rem] p-7 flex flex-col justify-between shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="flex items-center gap-2 mb-4 z-10">
                                <Gem size={16} className="text-slate-900" />
                                <span className="font-bold text-slate-900 text-xs uppercase tracking-widest">Insights</span>
                            </div>

                            <div className="flex items-end justify-between gap-1.5 h-24 mt-2 z-10">
                                {weeklyValues.map((v: number, i: number) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-full rounded-t-xl transition-all duration-500",
                                            i === peakIndex ? "bg-slate-900 shadow-lg -translate-y-2 flex items-start justify-center pt-2" : "bg-slate-50 group-hover:bg-rose-50"
                                        )}
                                        style={{ height: `${Math.max(15, (v / (Math.max(...weeklyValues) || 1)) * 100)}%` }}
                                    >
                                        {i === peakIndex && <span className="text-[10px] text-white font-bold tracking-tighter">Peak</span>}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 z-10">
                                 <h3 className="font-bold text-slate-900 leading-tight">Analytics Pro</h3>
                                 <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider leading-relaxed">Deeper insights for premium publishers.</p>
                            </div>
                        </div>

                        {/* Analytic Highlight Chart */}
                        <div className="md:col-span-5 flex flex-col bg-white border-slate-100 border rounded-[2.5rem] p-8 shadow-sm justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Weekly Performance</h3>
                            </div>

                            <div className="flex items-center gap-8 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm">
                                        <Layers size={22} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Avg. Reads</div>
                                        <div className="text-2xl font-black text-slate-900 tracking-tighter">{stats?.avgReads || "0.0"}</div>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-slate-100"></div>
                                <div className="bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100">
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2">Live Audience</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-slate-900">{stats?.liveAudience || 0}</span>
                                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200"></span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 flex-1 min-h-[160px]">
                                <div className="flex-1 flex flex-col min-w-0">
                                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Views Trend</div>
                                     <div className="flex-1 w-full relative">
                                        <Line
                                          data={lineChartData}
                                          options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { x: { display: false }, y: { display: false } }
                                          }}
                                        />
                                     </div>
                                </div>
                                <div className="bg-sky-50 rounded-3xl p-5 w-32 flex flex-col justify-between relative overflow-hidden shrink-0">
                                    <div className="flex justify-between items-start z-10">
                                        <span className="text-[10px] text-sky-700 font-black uppercase tracking-widest">Rate</span>
                                        <AlertCircle size={14} className="text-sky-300" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-2xl font-black text-sky-900 tracking-tighter leading-none mb-1">{stats?.monthlyGrowth || 0}%</div>
                                        <div className="text-[9px] text-sky-600/80 font-bold uppercase tracking-widest">Monthly Growth</div>
                                    </div>
                                     <div className="absolute -bottom-8 -right-8 w-24 h-24 opacity-60">
                                        <Doughnut
                                          data={doughnutData}
                                          options={{
                                            cutout: '75%',
                                            plugins: { legend: { display: false }, tooltip: { enabled: false } }
                                          }}
                                        />
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Comments Card */}
                        <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Feedback</h3>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition text-slate-400">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {recentComments.length > 0 ? recentComments.map(comment => (
                                    <div key={comment.id} className="flex items-start gap-4 group cursor-pointer">
                                        <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm ring-2 ring-transparent group-hover:ring-rose-100 transition-all shadow-sm">
                                            {comment.author_name?.[0] || <User size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <div className="text-sm font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors uppercase tracking-tight">{comment.author_name}</div>
                                                {!comment.is_approved && <div className="w-2 h-2 bg-rose-500 rounded-full shadow-sm shadow-rose-200"></div>}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate font-medium">&ldquo;{comment.content}&rdquo;</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-slate-300 font-bold italic uppercase tracking-widest text-xs">No recent comments</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-10 left-10 p-5 bg-rose-600 text-white rounded-3xl shadow-2xl flex items-center gap-4 animate-fade-up z-50">
                    <AlertCircle size={24} />
                    <p className="font-bold tracking-tight">System Error: {error}</p>
                </div>
            )}
        </div>
    )
}