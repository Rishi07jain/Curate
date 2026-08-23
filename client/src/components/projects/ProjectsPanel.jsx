import { RefreshCw } from "lucide-react";
import ProjectCard from "./ProjectCard";

export default function ProjectsPanel({ projects, onRethink, isRethinking, domain }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white/90">Suggested Projects</h2>
        <button
          onClick={onRethink}
          disabled={isRethinking}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-amber transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={13} className={isRethinking ? "animate-spin" : ""} />
          {isRethinking ? "Rethinking..." : "Rethink"}
        </button>
      </div>
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} domain={domain} />
        ))}
      </div>
    </div>
  );
}