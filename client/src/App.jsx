import { useState } from "react";
import Header from "./components/layout/Header";
import IngestionWorkspace from "./components/ingestion/IngestionWorkspace";
import LoadingScreen from "./components/loading/LoadingScreen";
import ProjectsPanel from "./components/projects/ProjectsPanel";
import ReviewsPanel from "./components/reviews/ReviewsPanel";
import About from "./components/about/About";
import { api } from "./lib/api";

function App() {
  // "idle" -> "loading" -> "done", or "about" (reachable from anywhere)
  const [phase, setPhase] = useState("idle");
  const [previousPhase, setPreviousPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isRethinking, setIsRethinking] = useState(false);

  const handleReset = () => {
    setPhase("idle");
    setResult(null);
    setError(null);
  };

  const handleNavigateAbout = () => {
    setPreviousPhase(phase);
    setPhase("about");
  };

  const handleNavigateHome = () => {
    setPhase(previousPhase === "about" ? "idle" : previousPhase);
  };

  const handleRethinkProjects = async () => {
    if (!result) return;

    setIsRethinking(true);
    try {
      const avoidProjects = result.formattedProjects.map((p) => ({
        title: p.title,
        description: p.domainTagline,
      }));

      const response = await api.post("/api/rethink-projects", {
        techStack: result.techStack,
        domain: result.domain,
        seniority: result.seniority,
        companyName: result.companyName,
        avoidProjects,
      });

      setResult((prev) => ({
        ...prev,
        formattedProjects: response.data.formattedProjects,
      }));
    } catch (err) {
      const message =
        err.response?.data?.error || "Could not regenerate projects. Try again.";
      setError(message);
    } finally {
      setIsRethinking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onNavigateAbout={handleNavigateAbout}
        onNavigateHome={handleNavigateHome}
        isAboutOpen={phase === "about"}
      />
      <main className={`flex-1 w-full mx-auto px-6 py-12 ${phase === "done" || phase === "about" ? "max-w-7xl" : "max-w-5xl"}`}>
        {phase === "about" && <About onGetStarted={handleNavigateHome} />}

        {phase === "idle" && (
          <IngestionWorkspace
            onSubmitStart={() => {
              setError(null);
              setPhase("loading");
            }}
            onSubmitSuccess={(data) => {
              setResult(data);
              setPhase("done");
            }}
            onSubmitError={(err) => {
              setError(err);
              setPhase("idle");
            }}
          />
        )}

        {phase === "loading" && <LoadingScreen />}

        {phase === "done" && result && (
          <div className="space-y-6">
            <div className="glass-card px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber font-mono">
                  {result.domain}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-glass-border text-white/60 font-mono">
                  {result.seniority} level
                </span>
                {result.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-glass-border text-white/50 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <button onClick={handleReset} className="text-sm text-amber hover:underline shrink-0">
                Start over
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              <div className="min-w-0">
                <ProjectsPanel
                  projects={result.formattedProjects}
                  onRethink={handleRethinkProjects}
                  isRethinking={isRethinking}
                  domain={result.domain}
                />
              </div>
              <ReviewsPanel reviewSummary={result.reviewSummary} rawReviews={result.rawReviews} />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded-xl p-4">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;