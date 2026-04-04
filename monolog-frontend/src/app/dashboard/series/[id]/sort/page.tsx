"use client"

import { api } from "@/lib/api"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronLeft, GripVertical, Save, Layers, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

/* ── Sortable Item Component ──────────────────────────────── */
function SortableItem({ id, title, order }: { id: string, title: string, order: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        comment-card dash-card flex items-center gap-6 p-6 transition-all duration-300
        ${isDragging ? "border-orange shadow-orange-lg scale-[1.02] opacity-80" : "hover:border-orange/30"}
      `}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-2 text-td hover:text-orange transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={24} />
      </button>
      
      <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-sm font-black text-orange border border-orange/20 shrink-0">
        {order}
      </div>
      
      <div className="flex-1 font-black text-tp truncate text-lg tracking-tight">
        {title}
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange/5 border border-orange/10 text-[10px] font-black text-orange uppercase tracking-widest">
         <BookOpen size={12} /> Chapter
      </div>
    </div>
  )
}

export default function SortSeriesPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [series, setSeries] = useState<any>(null)
  const [posts, setPosts]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    async function load() {
      try {
        const data = await api.series.getOne(id)
        setSeries(data)
        setPosts(data.posts || [])
      } catch (err: any) {
        alert("Failed to load series: " + err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".comment-card", {
          x: -20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "back.out(1.7)",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPosts((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const token = api.getToken()
      if (!token) throw new Error("Not logged in")
      
      const orders = posts.map((p, idx) => ({
        id: p.id,
        series_order: idx + 1
      }))
      
      await api.posts.reorder(orders, token)
      router.push("/dashboard/series")
    } catch (err: any) {
      alert("Error saving order: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="h-20 skeleton rounded-[2rem]" />
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => <div key={i} className="h-24 skeleton rounded-[2rem]" />)}
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/dashboard/series" 
            className="inline-flex items-center gap-2 p-3 rounded-2xl glass-panel text-tm hover:text-tp transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="dash-title">Sort <span className="text-orange">Curriculum</span></h1>
            <p className="text-tm font-black uppercase tracking-widest text-[10px] mt-2 opacity-60">
              Series: {series?.title}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-orange shadow-orange py-4 px-8"
        >
          <Save size={18} /> {saving ? "Updating..." : "Save Configuration"}
        </button>
      </header>

      {/* Interactive List */}
      <div className="space-y-6">
        <div className="glass-panel rounded-[3rem] p-10 bg-bg/50 border-2 border-dashed border-dash-border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={posts.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <SortableItem 
                    key={post.id} 
                    id={post.id} 
                    title={post.title} 
                    order={index + 1} 
                  />
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-20 rounded-[2rem] border border-dash-border">
                     <Layers size={40} className="mx-auto text-td mb-4" />
                     <p className="text-td font-black uppercase tracking-widest text-xs">
                       No chapters found.
                     </p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="dash-card p-8 bg-orange/5 border-orange/10 flex gap-6 items-start">
           <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shrink-0 text-orange">
              <BookOpen size={24} />
           </div>
           <div>
             <h4 className="font-black text-tp text-sm uppercase tracking-widest mb-1">Moderator Tip</h4>
             <p className="text-tm text-sm leading-relaxed">
               Drag and drop chapters to rearrange the curriculum. This flow determines the "Next Chapter" navigation and 
               the Reading Order across the platform. Don't forget to save your changes below.
             </p>
           </div>
        </div>
      </div>
    </div>
  )
}
