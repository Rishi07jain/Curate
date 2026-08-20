// Escapes LaTeX special characters so generated content never breaks compilation.
function escapeLatex(str) {
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}");
}

function formatProjectAsLatex(project) {
  const title = escapeLatex(project.title);
  const skills = escapeLatex(project.hardSkills.join(", "));
  const items = project.bullets
    .map((b) => `      \\resumeItem{${escapeLatex(b)}}`)
    .join("\n");

  return `\\resumeProjectHeading
    {\\textbf{${title}} $|$ \\emph{${skills}}}{}
    \\resumeItemListStart
${items}
    \\resumeItemListEnd`;
}

// This is a LangGraph node — same shape as an LLM-calling node — but it's
// just synchronous JS. LangGraph doesn't care whether a node calls an AI
// model or not; it's still just "(state) => partial state update".
export function latexFormatterAgent(state) {
  const { projects } = state;

  const formattedProjects = projects.map((project) => ({
    ...project,
    latex: formatProjectAsLatex(project),
  }));

  return {
    formattedProjects,
  };
}