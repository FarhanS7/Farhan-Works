import {
  ArrowRight,
  BookOpen,
  Code2,
  Github,
  Lightbulb,
  Rss,
  Twitter,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About – MonoLog",
  description: "About the author and philosophy of MonoLog.",
};

const topics = [
  {
    icon: Code2,
    label: "Technology",
    desc: "Software, systems, and the tools that shape how we build the future.",
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Lightbulb,
    label: "Ideas",
    desc: "Philosophy, mental models, and the mechanics of clear thinking.",
    color:
      "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  },
  {
    icon: Rss,
    label: "Deep Dives",
    desc: "Long-form explorations of topics worth understanding fully.",
    color:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-[#0B1120] min-h-screen">
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="space-y-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-blue">
              <BookOpen size={28} className="text-white" />
            </div>

            <div className="space-y-3">
              <p className="text-primary text-sm font-semibold">The author</p>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-surface-on">
                About MonoLog
              </h1>
              <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl">
                A personal publishing space for deep thoughts, technical
                deep-dives, and meditations on the future of technology.
              </p>
            </div>

            {/* Social links */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                aria-label="GitHub"
                className="p-2.5 rounded-xl border border-border bg-white dark:bg-surface-muted text-text-muted hover:text-surface-on hover:border-primary/40 transition-all"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="p-2.5 rounded-xl border border-border bg-white dark:bg-surface-muted text-text-muted hover:text-surface-on hover:border-primary/40 transition-all"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Topics */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-surface-on">
            What I Write About
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topics.map(({ icon: Icon, label, desc, color }) => (
              <div
                key={label}
                className="p-5 rounded-2xl border border-border bg-white dark:bg-[#0F172A] hover:border-primary/30 hover:shadow-level-1 transition-all space-y-3"
              >
                <div
                  className={
                    "w-10 h-10 rounded-xl flex items-center justify-center " +
                    color
                  }
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-surface-on">{label}</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Philosophy */}
        <section className="space-y-5">
          <h2 className="text-2xl font-extrabold text-surface-on">
            The Philosophy
          </h2>
          <div className="space-y-4 text-text-muted leading-relaxed">
            <p>
              Most content today is optimised for speed — quick takes,
              listicles, and shallow overviews. MonoLog is the opposite. Every
              post is written to be re-read.
            </p>
            <p>
              The goal is to think carefully in public: to work through hard
              questions, share what I&apos;ve actually learned (not just what
              sounds good), and leave a record of ideas worth returning to.
            </p>
            <p>
              If something here makes you think differently about a problem,
              that&apos;s success.
            </p>
          </div>

          {/* Pullquote */}
          <blockquote className="border-l-4 border-primary pl-5 py-1 my-6">
            <p className="text-lg italic text-surface-on font-medium">
              &ldquo;Writing is thinking made visible.&rdquo;
            </p>
          </blockquote>
        </section>

        {/* Stats */}
        <section className="rounded-2xl border border-border bg-surface-alt dark:bg-[#0F172A] p-6">
          <div className="grid grid-cols-3 divide-x divide-border text-center">
            {[
              { label: "Articles", value: "—" },
              { label: "Topics", value: "3" },
              { label: "Ads", value: "0" },
            ].map(({ label, value }) => (
              <div key={label} className="px-4">
                <p className="text-2xl font-extrabold text-primary">{value}</p>
                <p className="text-xs text-text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex gap-3">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all"
          >
            <BookOpen size={16} /> Browse All Posts <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  );
}
