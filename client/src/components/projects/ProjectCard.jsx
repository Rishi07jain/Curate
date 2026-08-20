import { useState } from "react";
import { Copy, Check, FileCode, List } from "lucide-react";

export default function ProjectCard({ project }) {
  const [view, setView] = useState("bullets"); // "bullets" | "latex"
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = view === "latex" ? project.latex : project.bullets.join("\n");
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg">{project.title}</h3>
          <p className="text-sm text-white/40">{project.domainTagline}</p>
        </div>

        {/* View toggle */}
        <div className="flex bg-black/30 border border-glass-border rounded-lg p-0.5 text-xs shrink-0">
          <button
            onClick={() => setView("bullets")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors ${
              view === "bullets" ? "bg-amber/15 text-amber" : "text-white/40 hover:text-white/70"
            }`}
          >
            <List size={13} /> Text
          </button>
          <button
            onClick={() => setView("latex")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors ${
              view === "latex" ? "bg-amber/15 text-amber" : "text-white/40 hover:text-white/70"
            }`}
          >
            <FileCode size={13} /> LaTeX
          </button>
        </div>
      </div>

      {/* Tech stack pills */}
      <div className="flex flex-wrap gap-1.5">
        {project.hardSkills.map((skill) => (
          <span
            key={skill}
            className="text-[11px] px-2 py-0.5 rounded-full bg-teal/10 border border-teal/25 text-teal font-mono"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Content — either plain bullets or LaTeX code */}
      {view === "bullets" ? (
        <ul className="space-y-2">
          {project.bullets.map((bullet, i) => (
            <li key={i} className="text-sm text-white/80 leading-relaxed pl-4 relative">
              <span className="absolute left-0 text-amber">▸</span>
              {bullet}
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative">
          <pre className="text-xs text-white/70 bg-black/40 border border-glass-border rounded-xl p-4 pr-10 overflow-x-auto font-mono leading-relaxed max-w-full">
            {project.latex}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-black/40 border border-glass-border text-white/50 hover:text-amber transition-colors"
            title="Copy LaTeX"
          >
            {copied ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
          </button>
        </div>
      )}

      {view === "bullets" && (
        <p className="text-xs text-white/40 italic border-t border-glass-border pt-3">
          {project.domainInsight}
        </p>
      )}

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-white/50 hover:text-amber transition-colors"
      >
        {copied ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
        {copied ? "Copied" : `Copy ${view === "latex" ? "LaTeX" : "bullets"}`}
      </button>
    </div>
  );
}