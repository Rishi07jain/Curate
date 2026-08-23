import { Sparkles, Wand2, FileCode, Search, MessageSquareQuote, RefreshCw, Building2 } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";

const caseFiles = [
  {
    icon: Search,
    title: "The Extraction Agent",
    tag: "Case File #1",
    blurb:
      "Reads your job description like a detective reads a ransom note — pulls out the tech stack, the domain, and how senior they actually expect you to be. No more guessing if \"3+ years\" means junior or \"basically a staff engineer, good luck.\"",
  },
  {
    icon: Sparkles,
    title: "The Project Architect",
    tag: "Case File #2",
    blurb:
      "Invents 3 projects that actually make sense for the role — not another to-do list app. If the JD screams fintech, you're getting reconciliation engines, not weather widgets.",
  },
  {
    icon: FileCode,
    title: "The LaTeX Formatter",
    tag: "Case File #3",
    blurb:
      "Turns those ideas into Jake's-Resume-format LaTeX instantly. Copy, paste, compile, cry (happy tears) — no manually wrestling with \\resumeItem syntax at 2am.",
  },
  {
    icon: RefreshCw,
    title: "The Rethink Button",
    tag: "Case File #4",
    blurb:
      "First batch of ideas feel a little \"meh\"? Hit Rethink. It remembers what it already showed you and refuses to just rename the same idea — genuinely different concepts, not a reskin.",
  },
  {
    icon: Wand2,
    title: "\"Explain This Project\"",
    tag: "Case File #5",
    blurb:
      "This one's for the honest ones 🫡 — if you're actually going to build it (not just decorate your resume with vibes), one click gets you the real goal and a rough implementation plan. No interview-panel gotchas.",
  },
  {
    icon: MessageSquareQuote,
    title: "Review Intelligence",
    tag: "Case File #6",
    blurb:
      "Quietly reads the actual Reddit threads and Glassdoor reviews about the company so you don't walk into an interview thinking everything's sunshine when three ex-employees are typing in all caps about the on-call rotation.",
  }
  
];

function RevealCard({ children, className = "", delayMs = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default function About({ onGetStarted }) {
  return (
    <div className="relative space-y-28 pb-24 overflow-hidden">
      {/* Ambient floating background icons — purely decorative, low opacity */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="absolute top-10 left-[8%] text-3xl opacity-10 animate-float-slow">📄</span>
        <span className="absolute top-40 right-[10%] text-2xl opacity-10 animate-float-drift">🔍</span>
        <span className="absolute top-[420px] left-[15%] text-2xl opacity-10 animate-float-drift">✨</span>
        <span className="absolute top-[700px] right-[6%] text-3xl opacity-10 animate-float-slow">📌</span>
        <span className="absolute top-[950px] left-[4%] text-2xl opacity-10 animate-float-drift">🧠</span>
      </div>

      {/* Hero */}
      <div className="text-center space-y-6 pt-8 max-w-3xl mx-auto">
        <span className="text-5xl inline-block animate-float-slow">🔎</span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          The Case of the <span className="text-amber">Missing Project</span>
        </h1>
        <p className="text-white/60 max-w-2xl mx-auto text-base sm:text-lg font-body leading-relaxed">
          Every job posting wants "relevant experience." Nobody tells you what that
          actually means until you're staring at a blank resume at midnight, three
          tabs deep into "cool project ideas reddit." We got tired of that. So Curate
          reads the job description <em>for</em> you, tells you exactly what to build,
          hands you the LaTeX, and even tells you what people who work there
          <em> actually</em> think of it. ✨
        </p>
        <p className="text-white/40 text-sm font-body">
          Basically: less guessing, more building, zero fake-it-till-you-make-it energy.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-2 inline-flex items-center gap-2 bg-amber/10 border border-amber/40
                     text-amber font-semibold rounded-xl px-6 py-3 transition-all duration-300
                     hover:bg-amber/20 hover:shadow-glow-amber"
        >
          <Sparkles size={16} />
          Okay, let's build something
        </button>
      </div>

      {/* Case files grid */}
      <div className="space-y-12">
        <h2 className="text-center text-sm uppercase tracking-widest text-white/40 font-mono">
          The Investigation Board 📌
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {caseFiles.map((file, i) => {
            const Icon = file.icon;
            return (
              <RevealCard key={file.title} delayMs={(i % 3) * 120}>
                <div className="glass-card p-7 space-y-4 h-full hover:border-amber/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center">
                      <Icon size={17} className="text-amber" />
                    </div>
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wide">
                      {file.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-white/90 text-lg">{file.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{file.blurb}</p>
                </div>
              </RevealCard>
            );
          })}
        </div>
      </div>

      {/* Closing */}
      <RevealCard className="text-center space-y-4 max-w-xl mx-auto">
        <p className="text-white/50 text-sm font-body leading-relaxed">
          No fluff, no "AI-powered synergy." Just a tool built by someone who was also
          once staring at a blank resume at midnight. 🫠
        </p>
        <button onClick={onGetStarted} className="text-amber text-sm hover:underline font-medium">
          Take me back to the app →
        </button>
      </RevealCard>
    </div>
  );
}