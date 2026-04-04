import {
  ArrowRight,
  BookOpen,
  Code2,
  Flame,
  Github,
  Lightbulb,
  Rss,
  Twitter,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About – Farhan.Dev",
  description: "About the author and philosophy of Farhan.Dev.",
};

const topics = [
  {
    icon: Code2,
    label: "Technology",
    desc: "Software, systems, and the tools that shape how we build the future.",
    color: "bg-blue-500/15 text-blue-200 border-blue-400/40",
  },
  {
    icon: Lightbulb,
    label: "Ideas",
    desc: "Philosophy, mental models, and the mechanics of clear thinking.",
    color: "bg-violet-500/15 text-violet-200 border-violet-400/40",
  },
  {
    icon: Rss,
    label: "Deep Dives",
    desc: "Long-form explorations of topics worth understanding fully.",
    color: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28">
          <div className="rounded-3xl border border-border/75 bg-surface/80 p-8 shadow-level-2 backdrop-blur-xl md:p-10">
            <div className="space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-blue">
                <BookOpen size={28} className="text-white" />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary inline-flex items-center gap-2">
                  <Flame size={12} />
                  The author
                </p>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-surface-on md:text-6xl">
                  About Farhan.Dev
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
                  My personal publishing space for deep thoughts, technical
                  deep-dives, and meditations on the future of technology.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href="https://www.linkedin.com/in/farhan-shahriar1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-xl border border-border/80 bg-black/20 p-2.5 text-text-muted transition-all hover:border-primary/40 hover:text-surface-on"
                >
                  <div className="text-[14px] font-bold">in</div>
                </a>
                <a
                  href="https://x.com/FarhanShah29986"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="rounded-xl border border-border/80 bg-black/20 p-2.5 text-text-muted transition-all hover:border-primary/40 hover:text-surface-on"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://www.facebook.com/farhan.shahriar.5264"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-xl border border-border/80 bg-black/20 p-2.5 text-text-muted transition-all hover:border-primary/40 hover:text-surface-on"
                >
                  <div className="text-[14px] font-bold">f</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6">
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-surface-on">
            What I Write About
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topics.map(({ icon: Icon, label, desc, color }) => (
              <div
                key={label}
                className="space-y-3 rounded-2xl border border-border/75 bg-surface/75 p-5 transition-all hover:border-primary/35 hover:shadow-level-1"
              >
                <div
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-xl border " +
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

        <section className="space-y-5">
          <h2 className="font-display text-2xl font-semibold text-surface-on">
            The Philosophy
          </h2>
          <div className="space-y-4 text-text-muted leading-relaxed">
            <p>
              Most content today is optimised for speed — quick takes,
              listicles, and shallow overviews. Farhan.Dev is the opposite. Every
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

          <blockquote className="my-6 rounded-r-xl border-l-4 border-primary bg-black/20 py-3 pl-5">
            <p className="text-lg italic text-surface-on font-medium">
              &ldquo;Writing is thinking made visible.&rdquo;
            </p>
          </blockquote>
        </section>

        <section className="rounded-2xl border border-border/75 bg-surface/75 p-6">
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
