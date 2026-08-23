import { useState } from "react";
import { GitBranch, Loader2, Star, ExternalLink, CheckSquare, Square, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import RepoScoreDisclaimer from "./RepoScoreDisclaimer";

const MAX_SELECTABLE = 5;

export default function GithubPanel({ techStack, domain, seniority }) {
  const [stage, setStage] = useState("collapsed");
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState(null);

  const toggleRepo = (repo) => {
    setSelected((prev) => {
      const exists = prev.find((r) => r.fullName === repo.fullName);
      if (exists) return prev.filter((r) => r.fullName !== repo.fullName);
      if (prev.length >= MAX_SELECTABLE) return prev;
      return [...prev, repo];
    });
  };

  const handleFetchRepos = async () => {
    if (!username.trim()) return;
    setIsFetching(true);
    setError(null);
    try {
      const response = await api.get("/api/github/repos", { params: { username: username.trim() } });
      setRepos(response.data.repos);
      setSelected([]);
      setStage("repoList");
    } catch (err) {
      setError(err.response?.data?.error || "Could not fetch repos for that username.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleScore = async () => {
    if (!selected.length) return;
    setIsScoring(true);
    setError(null);
    try {
      const response = await api.post("/api/github/score-repos", {
        username: username.trim(),
        repos: selected,
        techStack,
        domain,
        seniority,
      });
      const sorted = [...response.data.results].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      setResults(sorted);
      setStage("results");
    } catch (err) {
      setError(err.response?.data?.error || "Could not score repos right now.");
    } finally {
      setIsScoring(false);
    }
  };

  const scoreColor = (score) => {
    if (score === null || score === undefined) return "text-white/40 border-glass-border";
    if (score >= 70) return "text-teal border-teal/30";
    if (score >= 40) return "text-amber border-amber/30";
    return "text-crimson border-crimson/30";
  };

  if (stage === "collapsed") {
    return (
      <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center">
            <GitBranch size={16} className="text-amber" />
          </div>
          <div>
            <h3 className="font-bold text-white/90">Already have projects on GitHub?</h3>
            <p className="text-sm text-white/50">
              Score how relevant your real repos are for this role — out of 100.
            </p>
          </div>
        </div>
        <button
          onClick={() => setStage("disclaimer")}
          className="text-sm bg-amber/10 border border-amber/40 text-amber font-semibold rounded-xl px-5 py-2.5 hover:bg-amber/20 hover:shadow-glow-amber transition-all shrink-0"
        >
          Connect GitHub
        </button>
      </div>
    );
  }

  if (stage === "disclaimer") {
    return (
      <RepoScoreDisclaimer
        onAcknowledge={() => setStage("input")}
        onCancel={() => setStage("collapsed")}
      />
    );
  }

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center">
          <GitBranch size={16} className="text-amber" />
        </div>
        <h3 className="font-bold text-white/90">GitHub Project Scoring</h3>
      </div>

      {(stage === "input" || stage === "repoList") && (
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your GitHub username"
            className="flex-1 min-w-[200px] bg-black/30 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-amber/50 font-body"
          />
          <button
            onClick={handleFetchRepos}
            disabled={isFetching || !username.trim()}
            className="flex items-center gap-2 text-sm bg-white/5 border border-glass-border text-white/70 rounded-xl px-5 py-2.5 hover:border-amber/40 hover:text-amber transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isFetching && <Loader2 size={14} className="animate-spin" />}
            {isFetching ? "Fetching..." : "Fetch repos"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded-xl p-3">{error}</p>
      )}

      {stage === "repoList" && (
        <div className="space-y-3">
          <p className="text-xs text-white/40">
            Select up to {MAX_SELECTABLE} repos to score ({selected.length}/{MAX_SELECTABLE} selected)
          </p>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {repos.map((repo) => {
              const isSelected = selected.some((r) => r.fullName === repo.fullName);
              return (
                <button
                  key={repo.fullName}
                  onClick={() => toggleRepo(repo)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 ${isSelected ? "border-amber/40 bg-amber/5" : "border-glass-border hover:border-white/25"}`}
                >
                  {isSelected ? (
                    <CheckSquare size={16} className="text-amber mt-0.5 shrink-0" />
                  ) : (
                    <Square size={16} className="text-white/30 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white/85">{repo.name}</span>
                      {repo.language !== "Unknown" && (
                        <span className="text-[10px] font-mono text-white/40">{repo.language}</span>
                      )}
                      {repo.stars > 0 && (
                        <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                          <Star size={10} /> {repo.stars}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-white/45 mt-0.5 truncate">{repo.description}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleScore}
            disabled={isScoring || !selected.length}
            className="w-full flex items-center justify-center gap-2 bg-amber/10 border border-amber/40 text-amber font-semibold rounded-xl py-3 hover:bg-amber/20 hover:shadow-glow-amber transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isScoring && <Loader2 size={16} className="animate-spin" />}
            {isScoring ? "Scoring..." : `Score ${selected.length || ""} selected repo${selected.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {stage === "results" && (
        <div className="space-y-4">
          {results.map((repo) => (
            <div key={repo.fullName} className="border border-glass-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/90 hover:text-amber transition-colors inline-flex items-center gap-1">
                    {repo.name} <ExternalLink size={12} />
                  </a>
                  {repo.description && <p className="text-xs text-white/45 mt-0.5">{repo.description}</p>}
                </div>
                <div className={`shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-lg ${scoreColor(repo.score)}`}>
                  {repo.score ?? "—"}
                </div>
              </div>

              <p className="text-sm text-white/65 leading-relaxed">{repo.reasoning}</p>

              {repo.matchedSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {repo.matchedSkills.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-teal/10 border border-teal/25 text-teal font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {repo.gaps?.length > 0 && (
                <p className="text-xs text-white/40">
                  <span className="text-white/55 font-medium">Gaps:</span> {repo.gaps.join(", ")}
                </p>
              )}
            </div>
          ))}

          <button
            onClick={() => setStage("repoList")}
            className="w-full flex items-center justify-center gap-2 text-sm text-white/50 hover:text-amber transition-colors py-2"
          >
            <RefreshCw size={13} /> Score different repos
          </button>
        </div>
      )}
    </div>
  );
}
