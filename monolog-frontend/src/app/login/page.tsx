"use client"

import { api } from "@/lib/api"
import { BookOpen, Lock, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [loading,  setLoading]  = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await api.auth.login({ username, password })
      api.setToken(data.token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Invalid username or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-surface">

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg mx-auto group-hover:scale-105 transition-transform">
              <BookOpen size={24} className="text-white" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tighter">Admin Access</h1>
            <p className="text-[10px] font-bold text-text-faint uppercase tracking-widest mt-1">Sign in to manage MonoLog</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bento-card bg-surface p-8 space-y-6 shadow-xl"
        >
          {error && (
            <div className="px-4 py-3 rounded-xl bg-error text-surface text-sm text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black uppercase tracking-widest" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" size={16} />
              <input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black uppercase tracking-widest" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" size={16} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-stone-50/50 text-black text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-black text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Authenticating…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-text-faint mt-5">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to blog
          </Link>
        </p>
      </div>
    </div>
  )
}
