import { useState } from "react";
import { X, Sparkles, Trophy, Medal, AlertTriangle, Star, ChevronDown, ChevronUp, Zap, Check } from "lucide-react";

/* Renders a single score bar row */
const ScoreBar = ({ label, score, max = 10 }) => {
  const pct = (score / max) * 100;
  const color = score >= 8 ? "#10b981" : score >= 6 ? "#6366f1" : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-slate-500 w-32 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-black w-8 text-right" style={{ color }}>{score}/10</span>
    </div>
  );
};

/* Renders a candidate card (topPick or runnerUp) */
const CandidateCard = ({ data, rank, onHighlight, bids }) => {
  const [expanded, setExpanded] = useState(true);
  if (!data) return null;

  const isTop = rank === 1;
  const scores = data.scores || {};
  const scoreLabels = {
    skillAlignment: "Skill Alignment",
    proposalQuality: "Proposal Quality",
    trackRecord: "Track Record",
    profileCredibility: "Profile Credibility",
    budgetOrRoleFit: "Budget / Role Fit",
    motivationSignal: "Motivation Signal"
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isTop
          ? "border-amber-300 shadow-lg shadow-amber-100"
          : "border-indigo-200 shadow-md"
      }`}
    >
      {/* Header */}
      <div
        className={`px-5 py-4 flex items-center justify-between ${
          isTop
            ? "bg-gradient-to-r from-amber-50 to-orange-50"
            : "bg-gradient-to-r from-indigo-50 to-blue-50"
        }`}
      >
        <div className="flex items-center gap-3">
          {isTop ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Trophy className="w-4.5 h-4.5 text-white" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Medal className="w-4.5 h-4.5 text-white" />
            </div>
          )}
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isTop ? "text-amber-600" : "text-indigo-600"}`}>
              {isTop ? "🥇 Top Pick" : "🥈 Runner-up"}
            </p>
            <h3 className="font-extrabold text-slate-800 text-base leading-tight">{data.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">AI Score</p>
            <p className={`text-2xl font-black ${isTop ? "text-amber-500" : "text-indigo-600"}`}>
              {data.totalScore}<span className="text-sm font-bold text-slate-400">/60</span>
            </p>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
          >
            {expanded
              ? <ChevronUp className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />
            }
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 bg-white space-y-5">
          {/* Headline reason */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">
              "{data.headlineReason}"
            </p>
          </div>

          {/* Score bars */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Evaluation Scores</p>
            {Object.entries(scoreLabels).map(([key, label]) => (
              <ScoreBar key={key} label={label} score={scores[key] || 0} />
            ))}
          </div>

          {/* Strengths */}
          {data.strengths?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">✅ Key Strengths</p>
              <ul className="space-y-1.5">
                {data.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {data.concerns?.length > 0 && data.concerns[0] !== "None identified" && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">⚠️ Watch Out For</p>
              <ul className="space-y-1.5">
                {data.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700 font-medium bg-amber-50/60 px-3 py-2 rounded-lg border border-amber-100">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Why better / why consider */}
          {(data.whyBetter || data.whyConsider) && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed font-medium ${
              isTop
                ? "bg-amber-50/40 border-amber-100 text-amber-800"
                : "bg-indigo-50/40 border-indigo-100 text-indigo-800"
            }`}>
              <p className="font-black text-[10px] uppercase tracking-wider mb-1.5 opacity-70">
                {isTop ? "Why they stand out" : "Why consider them"}
              </p>
              {data.whyBetter || data.whyConsider}
            </div>
          )}

          {/* Hiring advice (top pick only) */}
          {isTop && data.hiringAdvice && (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1.5">💡 Hiring Advice</p>
              <p className="text-xs text-emerald-800 font-semibold leading-relaxed">{data.hiringAdvice}</p>
            </div>
          )}

          {/* Highlight button */}
          <button
            onClick={() => onHighlight(data.bidId)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isTop
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:opacity-90 shadow-sm"
                : "border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            {isTop ? "Hire This Candidate" : "Consider This Candidate"}
          </button>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
   MAIN MODAL
-------------------------------------------------------------------------- */
const AIRecommendModal = ({ gigId, gigTitle, bids, onClose, onHire }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [highlightedBidId, setHighlightedBidId] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Use fetch directly so we can easily handle streaming later
      const res = await fetch(`/api/ai/recommend/${gigId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "AI analysis failed");
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHighlight = (bidId) => {
    setHighlightedBidId(bidId);
    onHire(bidId);
    // Smooth scroll to the bid card on the main page
    setTimeout(() => {
      const el = document.getElementById(`bid-${bidId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-amber-400", "ring-offset-2");
        setTimeout(() => el.classList.remove("ring-2", "ring-amber-400", "ring-offset-2"), 3000);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base tracking-tight">AI Candidate Shortlist</h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Powered by Gemini · {bids.length} applicant{bids.length !== 1 ? "s" : ""} analyzed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* Initial state — before analysis runs */}
          {!loading && !result && !error && (
            <div className="text-center py-10">
              <div
                className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-3">Find Your Best Candidate</h3>
              <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-2">
                Our AI will analyze all <strong className="text-slate-700">{bids.length} applicants</strong> for{" "}
                <em>"{gigTitle}"</em> and rank them on 6 dimensions:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8 mt-4">
                {["Skill Match", "Proposal Quality", "Track Record", "Profile Credibility", "Budget Fit", "Motivation"].map(d => (
                  <span key={d} className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {d}
                  </span>
                ))}
              </div>
              <button
                onClick={runAnalysis}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:opacity-95 transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Sparkles className="w-4 h-4" />
                Run AI Analysis
              </button>
              <p className="text-[10px] text-slate-400 font-semibold mt-4">Takes ~5-10 seconds · Uses Gemini 1.5 Flash</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-16">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute -inset-1 rounded-3xl border-2 border-indigo-300 border-dashed animate-spin opacity-50" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">Analyzing Candidates...</h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                AI is reading each proposal, checking skill match, and scoring all {bids.length} applicants
              </p>
              <div className="mt-6 space-y-2 max-w-xs mx-auto text-left">
                {["Reading cover letters & proposals", "Scoring skill alignment", "Evaluating track records", "Generating detailed recommendation"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 mb-2">Analysis Failed</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mb-6 leading-relaxed">{error}</p>
              {error.includes("GEMINI_API_KEY") || error.includes("API key") || error.includes("not configured") ? (
                <div className="text-left max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                  <p className="font-bold text-slate-800 mb-2">Setup Required:</p>
                  <p>1. Get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google AI Studio</a></p>
                  <p className="mt-1">2. Add to <code className="bg-slate-200 px-1 rounded">.env</code>: <code className="bg-slate-200 px-1 rounded">GEMINI_API_KEY=your_key</code></p>
                  <p className="mt-1">3. Restart the backend server</p>
                </div>
              ) : (
                <button
                  onClick={runAnalysis}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-5">
              {/* Pool summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <p className="text-xs font-extrabold text-slate-700">AI Pool Assessment</p>
                  <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    result.analysis?.overallPoolRating?.startsWith("Excellent")
                      ? "bg-emerald-100 text-emerald-700"
                      : result.analysis?.overallPoolRating?.startsWith("Good")
                        ? "bg-blue-100 text-blue-700"
                        : result.analysis?.overallPoolRating?.startsWith("Weak")
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                  }`}>
                    {result.analysis?.overallPoolRating?.split(" —")[0] || "Analyzed"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{result.analysis?.summary}</p>
              </div>

              {/* Top 2 candidate cards */}
              <CandidateCard
                data={result.analysis?.topPick}
                rank={1}
                bids={bids}
                onHighlight={handleHighlight}
              />
              <CandidateCard
                data={result.analysis?.runnerUp}
                rank={2}
                bids={bids}
                onHighlight={handleHighlight}
              />

              {/* Red flags */}
              {result.analysis?.redFlags?.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Red Flags Detected
                  </p>
                  <ul className="space-y-1.5">
                    {result.analysis.redFlags.map((f, i) => (
                      <li key={i} className="text-xs text-rose-700 font-medium flex items-start gap-2">
                        <span className="text-rose-400 shrink-0">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-run */}
              <div className="pt-2 text-center">
                <button
                  onClick={runAnalysis}
                  className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer"
                >
                  Re-run Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendModal;
