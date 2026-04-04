"use client";

import { api } from "@/lib/api";
import { Lock, User, ShieldCheck, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.from(formRef.current, {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.login({ username, password });
      api.setToken(data.token);
      localStorage.setItem("monolog_username", data.username || username);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(255,102,0,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,102,0,0.02),transparent_40%)]">
      <div ref={formRef} className="w-full max-w-[440px] space-y-10">
        {/* Abstract Brand Element */}
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/" className="group relative">
             <div className="absolute inset-0 bg-orange/40 blur-2xl rounded-full scale-50 group-hover:scale-75 transition-transform" />
             <div className="relative w-20 h-20 rounded-[2rem] glass-panel bg-surface-muted flex items-center justify-center border border-white/10 group-hover:border-orange/50 transition-all duration-500">
               <ShieldCheck size={36} className="text-orange" />
             </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-tp tracking-tighter uppercase">
              Admin <span className="text-orange">Portal</span>
            </h1>
            <p className="text-tm text-sm font-medium opacity-60">
              Secure access for content moderators.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="dash-card p-10 relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange" />
          
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td ml-1 flex items-center gap-2">
                  <User size={12} className="text-orange" /> Username
                </label>
                <input
                  type="text"
                  placeholder="Moderator Identifier"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all placeholder:text-td placeholder:text-xs"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td ml-1 flex items-center gap-2">
                  <Lock size={12} className="text-orange" /> Authentication Key
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all placeholder:text-td"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-orange shadow-orange py-4 px-8 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? "Verifying..." : (<><LogIn size={18} /> Enter Dashboard</>)}
              </span>
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-td hover:text-tp transition-all"
          >
            <ArrowLeft size={12} /> Return to front-end
          </Link>
        </div>
      </div>
    </div>
  );
}
