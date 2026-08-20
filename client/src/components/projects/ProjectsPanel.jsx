import ProjectCard from "./ProjectCard";

export default function ProjectsPanel({ projects }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white/90">Suggested Projects</h2>
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}