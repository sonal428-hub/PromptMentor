import React from 'react';
import { X, Copy, Check, Sparkles, Award, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PromptModal({ isOpen, onClose, type, data, userPrompt, onUseSuggestedPrompt }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (text) => {
    if (onUseSuggestedPrompt && text) {
      onUseSuggestedPrompt(text);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-950/50 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'suggested' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 font-heading">AI Refined Suggested Prompt</h3>
                <p className="text-xs text-gray-400">Optimized structure with explicit persona, context & format constraints</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/90 border border-violet-500/20 text-slate-200 text-sm font-mono leading-relaxed whitespace-pre-wrap selection:bg-violet-500/30 max-h-[40vh] overflow-y-auto">
              {data.finalPrompt || data.suggestedPrompt || 'No suggested prompt generated yet.'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleCopy(data.finalPrompt || data.suggestedPrompt)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold transition-all border border-white/10"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard' : 'Copy Text'}
              </button>
              <button
                onClick={() => handleApply(data.finalPrompt || data.suggestedPrompt)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/30"
              >
                <ArrowUpRight className="w-4 h-4" />
                Apply to Prompt Console
              </button>
            </div>
          </div>
        )}

        {type === 'evaluation' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 font-heading">Comprehensive Prompt Evaluation</h3>
                <p className="text-xs text-gray-400">Diagnostic tags, AI Quality Score & structural breakdown</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-white/10">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">AI Quality Score</span>
                <div className="text-3xl font-black font-heading text-emerald-400 mt-0.5">
                  {data.score ?? 70} / 100
                </div>
              </div>
              <div className="text-right max-w-xs">
                <span className="text-xs text-gray-400 font-medium">Coach Verdict</span>
                <p className="text-xs text-violet-300 font-semibold italic mt-0.5">{data.coachAdvice || data.explanation || 'Good draft with strong core structure.'}</p>
              </div>
            </div>

            {/* Diagnostic Tags */}
            {Array.isArray(data.tags) && data.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Diagnostic Tags</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {data.tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium ${
                        tag.status === 'pass'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {tag.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                      <span>{tag.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation Markdown */}
            {data.explanation && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Detailed Feedback</h4>
                <div className="prose prose-invert prose-xs text-slate-300 max-h-[30vh] overflow-y-auto">
                  <ReactMarkdown>{data.explanation}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {type === 'compare' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 font-heading">Live LLM Output Comparison</h3>
                <p className="text-xs text-gray-400">Side-by-side output evaluation: Original vs Refined Prompt</p>
              </div>
            </div>

            {data.isComparing ? (
              <div className="p-8 text-center space-y-3 bg-slate-950/80 rounded-2xl border border-violet-500/20">
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <p className="text-xs text-violet-300 font-semibold animate-pulse">Running live LLM inferences & generating comparative analysis...</p>
              </div>
            ) : data.comparisonResult ? (
              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                {/* Side-by-Side Outputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Output */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Original Prompt Output</span>
                    <div className="prose prose-invert prose-xs text-slate-300 leading-relaxed max-h-[220px] overflow-y-auto p-3 rounded-xl bg-slate-900/80 border border-white/5">
                      <ReactMarkdown>{data.comparisonResult.originalOutput || 'No output generated.'}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Refined Output */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-violet-500/30 space-y-2">
                    <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Refined Prompt Output</span>
                    <div className="prose prose-invert prose-xs text-slate-200 leading-relaxed max-h-[220px] overflow-y-auto p-3 rounded-xl bg-slate-900/80 border border-violet-500/20">
                      <ReactMarkdown>{data.comparisonResult.finalOutput || 'No output generated.'}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                {data.comparisonResult.comparisonExplanation && (
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/5 space-y-2">
                    <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Quality Difference Analysis</h4>
                    <div className="prose prose-invert prose-xs text-slate-300 leading-relaxed">
                      <ReactMarkdown>{data.comparisonResult.comparisonExplanation}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-3 bg-slate-950/80 rounded-2xl border border-white/10">
                {data.compareError ? (
                  <>
                    <p className="text-xs text-rose-300">{data.compareError}</p>
                    <button
                      onClick={data.onCompare}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/30"
                    >
                      Try Again
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400">Click "Run Comparison" to generate side-by-side outputs.</p>
                    <button
                      onClick={data.onCompare}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/30"
                    >
                      Run Comparison Now
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
