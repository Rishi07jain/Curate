export default function Header() {
  return (
    <header className="w-full border-b border-glass-border">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Curate<span className="text-amber">.</span>
          </h1>
          <p className="text-xs text-white/40 font-body">
            Context-Aware Resume Architect
          </p>
        </div>
      </div>
    </header>
  );
}