import { GitBranch, FileText, Lock, Sparkles } from "lucide-react";

export default function RepoScoreDisclaimer({ onAcknowledge, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card max-w-md w-full p-7 space-y-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center shrink-0">
            <GitBranch size={18} className="text-amber" />
          </div>
          <h3 className="font-bold text-lg text-white/90">Quick heads-up before scoring 👋</h3>
        </div>

        <p className="text-sm text-white/60 leading-relaxed">
          I score your projects by reading what's actually written in each repo's README —
          not just the code itself. So a couple of things matter here:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Lock size={15} className="text-teal mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              Your repo needs to be <span className="text-white/90 font-medium">public</span> —
              I can only read what GitHub's public API can see, no login required on your end.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <FileText size={15} className="text-teal mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              A <span className="text-white/90 font-medium">detailed README</span> gives a much
              better, fairer score. A repo with no README or just "# my-project" won't have much
              to go on — the score will reflect that.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles size={15} className="text-teal mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              Scores are honest, not encouraging — a low score just means this repo isn't a
              great match for this specific role, not that the project is bad.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 text-sm text-white/50 hover:text-white/80 border border-glass-border rounded-xl py-2.5 transition-colors"
          >
            Maybe later
          </button>
          <button
            onClick={onAcknowledge}
            className="flex-1 text-sm bg-amber/10 border border-amber/40 text-amber font-semibold rounded-xl py-2.5 hover:bg-amber/20 hover:shadow-glow-amber transition-all"
          >
            Got it, let's go
          </button>
        </div>
      </div>
    </div>
  );
}