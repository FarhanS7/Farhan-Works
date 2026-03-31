"use client";

import { api } from "@/lib/api";
import { BookOpen, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.login({ username, password });
      api.setToken(data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-surface-alt dark:bg-[#0B1120]">
      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-blue mx-auto">
              <BookOpen size={20} className="text-white" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-surface-on">
              Admin Access
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Sign in to manage MonoLog
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-[#0F172A] rounded-2xl border border-border shadow-level-2 p-6 space-y-5"
        >
          {error && (
            <div className="px-4 py-3 rounded-xl bg-error/8 border border-error/20 text-error text-sm text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-semibold text-surface-on"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint"
                size={16}
              />
              <input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-semibold text-surface-on"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint"
                size={16}
              />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
  );
}
