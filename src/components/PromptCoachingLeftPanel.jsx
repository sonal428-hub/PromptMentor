import React from 'react';
import { ArrowUp, Sparkles, CheckCircle2, XCircle, ArrowRight, RefreshCw, Layers, Edit3, HelpCircle } from 'lucide-react';
import PresetPrompts from './PresetPrompts';

export default function PromptCoachingLeftPanel({
  userPrompt,
  setUserPrompt,
  coaxResult,
  isCoaxing,
  coaxError,
  onCoax,
  onUseSuggestedPrompt,
  onDismiss,
  apiKey
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950/40 border-r border-white/5 relative">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-100 font-heading">Prompt Coaching & Workbench</h2>
              <p className="text-xs text-gray-400">Live AI feedback on specificity, role, context & constraints</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 text-gray-400 border border-white/5">
            {userPrompt.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Quick Starter Examples
            </span>
            <span className="text-[11px] text-gray-400">Click chip to load draft</span>
          </div>
          <PresetPrompts onSelectPreset={(text) => setUserPrompt(text)} />
        </div>

        <div className="glass-panel p-4 space-y-3 border-violet-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Concept & Engineering Checklist
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              {coaxResult ? `${coaxResult.tags.filter(t => t.status === 'pass').length} / ${coaxResult.tags.length} Met` : 'Awaiting Input'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {coaxResult ? (
              coaxResult.tags.map((tag, idx) => {
                const isPass = tag.status === 'pass';
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      isPass
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {isPass ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="font-medium truncate">{tag.label}</span>
                  </div>
                );
              })
            ) : (
              [
                'Clear Intent',
                'Good Context',
                'Specific Details',
                'Has Constraints',
                'Output Format',
                'Role/Persona'
              ].map((label, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg border border-white/5 bg-slate-900/50 text-gray-500 text-xs flex items-center gap-2 opacity-70"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                  <span className="truncate">{label}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel-glow p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h3 className="text-sm font-bold text-gradient uppercase tracking-wider font-heading">
                Live Coach Advice
              </h3>
            </div>
            {coaxResult && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real-Time Feedback
              </span>
            )}
          </div>

          <div className="text-xs text-gray-200 leading-relaxed font-sans min-h-[70px] flex items-center">
            {isCoaxing ? (
              <div className="flex items-center gap-3 text-violet-300 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
                <span>Gemini Coach is evaluating your prompt structure...</span>
              </div>
            ) : coaxError ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 w-full text-xs">
                ❌ {coaxError}
              </div>
            ) : coaxResult ? (
              <p className="italic text-gray-200 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 w-full">
                "{coaxResult.coachAdvice}"
              </p>
            ) : (
              <p className="text-gray-400 italic">
                Enter your draft prompt in the input bar below and click the upward arrow to receive live AI advice and targeted prompt improvements.
              </p>
            )}
          </div>

          {coaxResult && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <button
                onClick={onUseSuggestedPrompt}
                disabled={!coaxResult?.finalPrompt}
                className="btn-primary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/30"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Use Suggested Prompt</span>
              </button>
              <button
                onClick={onDismiss}
                className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1 hover:border-gray-500 text-gray-400"
              >
                <span>Dismiss</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-gray-300">
            <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
            Prompt Engineering Principle
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">
            High quality prompts combine <strong>Role</strong> + <strong>Context</strong> + <strong>Specificity</strong> + <strong>Constraints</strong> + <strong>Output Structure</strong>.
          </p>
        </div>

      </div>

      <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-xl border-t border-violet-500/30 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] z-20">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span className="font-semibold text-violet-300 flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-violet-400" />
              Prompt Console
            </span>
            <span>Press Enter to submit</span>
          </div>

          <div className="flex items-end gap-2 bg-slate-900/90 border border-white/15 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30 rounded-2xl p-2.5 transition-all">
            <textarea
              rows={2}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onCoax();
                }
              }}
              placeholder="Enter your prompt draft here (e.g. 'Write a marketing email for my SaaS product')..."
              className="flex-1 bg-transparent text-xs text-gray-100 placeholder-gray-500 focus:outline-none resize-none font-sans leading-relaxed border-none p-1"
            />
            <button
              onClick={onCoax}
              disabled={isCoaxing || !userPrompt.trim()}
              aria-label="Submit Prompt"
              title="Submit Prompt"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                isCoaxing || !userPrompt.trim()
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-white text-slate-950 hover:bg-white/90 shadow-md shadow-violet-500/30 active:scale-95'
              }`}
            >
              {isCoaxing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
