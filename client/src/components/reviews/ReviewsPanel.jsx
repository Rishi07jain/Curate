import { AlertTriangle, MessageSquare, ExternalLink } from "lucide-react";

const SENTIMENT_STYLES = {
  "Highly Positive": "bg-teal/15 text-teal border-teal/30",
  "Positive": "bg-teal/10 text-teal border-teal/25",
  "Mixed / Proceed with Caution": "bg-amber/15 text-amber border-amber/30",
  "Work-Life Balance Alert": "bg-crimson/15 text-crimson border-crimson/30",
  "Negative": "bg-crimson/15 text-crimson border-crimson/30",
};

function SourceBadge({ source }) {
  const isReddit = source === "Reddit";
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
        isReddit ? "bg-orange-500/15 text-orange-400" : "bg-emerald-500/15 text-emerald-400"
      }`}
    >
      {source}
    </span>
  );
}

export default function ReviewsPanel({ reviewSummary, rawReviews }) {
  const sentimentStyle =
    SENTIMENT_STYLES[reviewSummary.overallSentiment] || SENTIMENT_STYLES["Mixed / Proceed with Caution"];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white/90">Company Intelligence</h2>

      {/* Overall sentiment badge */}
      <div className={`glass-card p-4 border ${sentimentStyle}`}>
        <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Overall Sentiment</p>
        <p className="font-bold">{reviewSummary.overallSentiment}</p>
      </div>

      {/* Culture / WLB summary */}
      <div className="glass-card p-4 space-y-2">
        <p className="text-xs uppercase tracking-wide text-white/40 flex items-center gap-1.5">
          <MessageSquare size={12} /> Culture & Work-Life Balance
        </p>
        <ul className="space-y-1.5">
          {reviewSummary.cultureWlbSummary.map((point, i) => (
            <li key={i} className="text-sm text-white/70 leading-snug pl-3 relative">
              <span className="absolute left-0 text-white/30">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Interview insights */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-white/40">Interview Difficulty</p>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`w-4 h-1.5 rounded-full ${
                  n <= Math.round(reviewSummary.interviewInsights.difficultyScore)
                    ? "bg-amber"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {reviewSummary.interviewInsights.typicalQuestions.length > 0 && (
          <ul className="space-y-1">
            {reviewSummary.interviewInsights.typicalQuestions.map((q, i) => (
              <li key={i} className="text-sm text-white/70 pl-3 relative">
                <span className="absolute left-0 text-white/30">•</span>
                {q}
              </li>
            ))}
          </ul>
        )}

        {reviewSummary.interviewInsights.redFlags.length > 0 && (
          <div className="pt-2 border-t border-glass-border space-y-1">
            <p className="text-xs text-crimson flex items-center gap-1">
              <AlertTriangle size={12} /> Red Flags
            </p>
            {reviewSummary.interviewInsights.redFlags.map((flag, i) => (
              <p key={i} className="text-xs text-white/60">
                {flag}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Raw source links */}
      <div className="glass-card p-4 space-y-2">
        <p className="text-xs uppercase tracking-wide text-white/40">Sources</p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {rawReviews.map((review, i) => (
            <a
              key={i}
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-lg bg-black/20 hover:bg-black/40 border border-glass-border transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <SourceBadge source={review.source} />
                  <p className="text-xs text-white/70 truncate group-hover:text-white/90">
                    {review.title}
                  </p>
                </div>
                <ExternalLink size={11} className="text-white/30 shrink-0 mt-0.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}