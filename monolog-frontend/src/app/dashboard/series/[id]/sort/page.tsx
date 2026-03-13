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
import { ArrowLeft, GripVertical, Save, Layers } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"

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
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-surface border rounded-2xl transition-all duration-200 ${
        isDragging ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border shadow-sm hover:border-primary/30"
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-2 text-text-faint hover:text-primary transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      
      <div className="w-10 h-10 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-xs font-black text-primary">
        {order}
      </div>
      
      <div className="flex-1 font-bold text-surface-on truncate">
        {title}
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

  if (loading) return <div className="p-10 text-center">Loading curriculum...</div>

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/dashboard/series" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-faint hover:text-primary transition-colors mb-4">
            <ArrowLeft size={14} /> Back to Series
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers size={20} />
             </div>
             <h1 className="text-3xl font-black text-surface-on tracking-tight leading-none uppercase">
               Sort Curriculum
             </h1>
          </div>
          <p className="text-text-muted font-medium mt-2">{series?.title}</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Configuration"}
        </button>
      </header>

      <div className="bg-surface-muted/50 border-2 border-dashed border-border rounded-[2.5rem] p-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={posts.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {posts.map((post, index) => (
                <SortableItem 
                  key={post.id} 
                  id={post.id} 
                  title={post.title} 
                  order={index + 1} 
                />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-12 text-text-faint font-medium italic">
                  No chapters found in this series.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/20 flex gap-4 text-sm text-secondary-on leading-relaxed">
        <div className="mt-1">💡</div>
        <div>
          <strong>Pro Tip:</strong> Reordering chapters updates the curriculum instantly for all readers. 
          The order you set here determines the navigation flow (Previous/Next) and the Table of Contents order on public pages.
        </div>
      </div>
    </div>
  )
}
