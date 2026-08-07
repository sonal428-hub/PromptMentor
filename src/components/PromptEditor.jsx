import React from 'react';
import { Edit3, Sparkles, AlertCircle, CheckCircle2, RotateCcw, Play } from 'lucide-react';
import { PROMPT_PILLARS } from '../utils/promptAnalyzer';

export default function PromptEditor({
  userPrompt,
  onChangePrompt,
  analysis,
  onRunComparison,
  isExecuting
}) {
  const missingPillars = analysis?.missingPillars || [];
  const flags = analysis?.statusFlags || {};

  return (
    <div className="glass-panel p-5 relative flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-100">1. Original Prompt Space</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-mono">
              {analysis?.wordCount || 0} words
            </span>
            {userPrompt && (
              <button
                onClick={() => onChangePrompt('')}
                className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors"
                title="Clear input"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Text Area Input */}
        <div className="relative mb-4">
          <textarea
            value={userPrompt}
            onChange={(e) => onChangePrompt(e.target.value)}
            placeholder="Type your prompt here... (e.g. 'write an email to my boss' or 'make a workout plan'). Observe real-time feedback & suggested enhancements!"
            className="w-full h-44 bg-slate-950/70 border border-white/10 rounded-xl p-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 resize-none font-sans leading-relaxed transition-all"
          />
          {!userPrompt && (
            <div className="absolute bottom-3 right-3 text-xs text-violet-400/80 flex items-center gap-1 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Real-Time Co-Pilot Active</span>
            </div>
          )}
        </div>

        {/* Progressive Disclosure Nudges */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Progressive Nudges (Missing Keywords)
            </span>
            <span className="text-[11px] text-gray-400">
              {5 - missingPillars.length} / 5 Criteria Met
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.values(PROMPT_PILLARS).map((pillar) => {
              const isPresent = !missingPillars.some(m => m.id === pillar.id);
              return (
                <div
                  key={pillar.id}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                    isPresent
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/60 border-white/10 text-gray-400 opacity-80'
                  }`}
                >
                  {isPresent ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                  )}
                  <span className="font-medium">{pillar.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400 italic">
          {missingPillars.length > 0
            ? `Tip: Adding ${missingPillars[0]?.title.toLowerCase()} will significantly boost response quality.`
            : '✨ Outstanding! Your prompt hits all 5 key engineering pillars.'}
        </p>

        <button
          onClick={onRunComparison}
          disabled={!userPrompt.trim() || isExecuting}
          className="btn-primary py-2.5 px-4 text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isExecuting ? 'Running Dual Outputs...' : 'Compare Live Outputs'}</span>
        </button>
      </div>
    </div>
  );
}
