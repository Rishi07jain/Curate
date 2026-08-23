export default function Header({ onNavigateAbout, onNavigateHome, isAboutOpen }) {
  return (
    <header className="w-full border-b border-glass-border sticky top-0 z-20 bg-obsidian/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group"
        >
          {/* Logo mark: a resume being inspected — folded doc + magnifying glass */}
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="shrink-0">
            <rect x="4" y="3" width="18" height="24" rx="2.5" className="fill-white/5 stroke-amber/60" strokeWidth="1.5" />
            <line x1="8" y1="9" x2="17" y2="9" className="stroke-white/25" strokeWidth="1.2" />
            <line x1="8" y1="13" x2="17" y2="13" className="stroke-white/25" strokeWidth="1.2" />
            <line x1="8" y1="17" x2="13" y2="17" className="stroke-white/25" strokeWidth="1.2" />
            <circle cx="22" cy="22" r="7" className="fill-obsidian stroke-amber" strokeWidth="2" />
            <line x1="27" y1="27" x2="31.5" y2="31.5" className="stroke-crimson" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div className="text-left">
            <h1 className="text-xl font-bold tracking-tight group-hover:text-amber transition-colors">
              Curate<span className="text-amber">.</span>
            </h1>
            <p className="text-xs text-white/40 font-body">
              Context-Aware Resume Architect
            </p>
          </div>
        </button>

        <button
          onClick={isAboutOpen ? onNavigateHome : onNavigateAbout}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-glass-border
                     text-white/70 hover:text-amber hover:border-amber/40 hover:shadow-glow-amber
                     transition-all duration-300"
        >
          {isAboutOpen ? "← Back to app" : "About"}
        </button>
      </div>
    </header>
  );
}