import React, { useState } from 'react';
import { Award, Zap, Copy, Check, Play, RefreshCw, Sparkles, FileText, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { PROMPT_PILLARS } from '../utils/promptAnalyzer';

export default function ScoreRightPanel({
  coaxResult,
  isCoaxing,
  comparisonResult,
  isComparing,
  compareError,
  onCompare
}) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedFinal, setCopiedFinal] = useState(false);

  const score = coaxResult?.score ?? 0;

  // Calculate stroke dashoffset for radial SVG gauge (r=36, circumference=226)
  const strokeDashoffset = 226 - (226 * Math.min(100, Math.max(0, score))) / 100;

  // Score color gradient based on value out of 100
  const getScoreColor = (val) => {
    if (val >= 85) return '#10b981'; // Emerald
    if (val >= 70) return '#8b5cf6'; // Violet
    if (val >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(score);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'original') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedFinal(true);
      setTimeout(() => setCopiedFinal(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 lg:p-6 space-y-5 bg-slate-950/20">

      {/* ─────────────────────────────────────────────────────────────────
          PROMINENT AI SCORE CARD (0–100) — NO GRADE CARD
         ───────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-5 space-y-4 border-violet-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-100 font-heading">AI Quality Score</h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
            {coaxResult ? 'Live Model Evaluated' : 'Awaiting Input'}
          </span>
        </div>

        {/* Big Radial Score Display */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-950/80 border border-white/5">
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-24 h-24 meter-svg" viewBox="0 0 80 80">
              <circle
                className="meter-circle-bg"
                cx="40"
                cy="40"
                r="36"
                strokeWidth="6"
                fill="none"
              />
              <circle
                className="meter-circle-val"
                cx="40"
                cy="40"
                r="36"
                strokeWidth="6"
                fill="none"
                stroke={scoreColor}
                strokeDasharray="226"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-heading text-white tracking-tight">
                {coaxResult ? score : '—'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">/ 100</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-gray-200">
              {coaxResult
                ? score >= 85
                  ? 'Master Level Prompt (85+)'
                  : score >= 70
                  ? 'Strong Prompt (70–84)'
                  : score >= 50
                  ? 'Developing Prompt (50–69)'
                  : 'Needs Optimization (<50)'
                : 'Evaluate Your Prompt'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {coaxResult
                ? `Evaluated by Gemini AI based on role specification, explicit constraints, context, and structural precision.`
                : `Submit a draft prompt using the console on the left to generate an AI score out of 100.`}
            </p>
          </div>
        </div>

        {/* 5-Pillar Score Breakdown */}
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Pillar Breakdown Estimate
          </h4>
          {Object.entries(PROMPT_PILLARS).map(([key, pillar]) => {
            // Estimate pillar coverage based on overall score or tags
            const tagMatch = coaxResult?.tags?.find(t => t.label.toLowerCase().includes(pillar.id));
            const pillarVal = coaxResult
              ? tagMatch?.status === 'pass'
                ? Math.min(100, Math.round(score * 1.1))
                : Math.round(score * 0.75)
              : 0;

            return (
              <div key={pillar.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    />
                    {pillar.title}
                  </span>
                  <span className="font-mono text-gray-400 font-semibold">{coaxResult ? `${pillarVal}%` : '—'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${coaxResult ? pillarVal : 0}%`,
                      backgroundColor: pillar.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────────
          ORIGINAL PROMPT VS FINAL PROMPT COMPARISON CARDS
         ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-violet-400" />
            Prompt Evolution Cards
          </h3>
          <span className="text-xs text-gray-400">Before & After</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Original Prompt Card */}
          <div className="glass-panel p-4 flex flex-col justify-between space-y-3 border-slate-800">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <span className="text-xs font-bold text-gray-300">Original Prompt</span>
                <button
                  onClick={() => handleCopy(coaxResult?.originalPrompt, 'original')}
                  disabled={!coaxResult?.originalPrompt}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy Original"
                >
                  {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans min-h-[90px] whitespace-pre-wrap">
                {coaxResult?.originalPrompt || 'Your draft prompt will appear here after clicking Coax.'}
              </p>
            </div>
            <div className="text-[10px] text-gray-500 font-mono">User Submission</div>
          </div>

          {/* Final Prompt Card (AI Auto-Gen) */}
          <div className="glass-panel-glow p-4 flex flex-col justify-between space-y-3 border-violet-500/30">
            <div>
              <div className="flex items-center justify-between border-b border-violet-500/20 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gradient font-heading">Final Refined Prompt</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                    Auto-Gen
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(coaxResult?.finalPrompt, 'final')}
                  disabled={!coaxResult?.finalPrompt}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy Final Prompt"
                >
                  {copiedFinal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-sans min-h-[90px] whitespace-pre-wrap">
                {coaxResult?.finalPrompt || 'Gemini will generate an optimized, high-precision prompt here.'}
              </p>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Role + Constraints Enhanced
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────────
          COMPARE ACTION & LIVE LLM OUTPUT COMPARISON
         ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Live LLM Output Workbench
          </h3>
        </div>

        {/* Trigger Compare Action */}
        <button
          onClick={onCompare}
          disabled={!coaxResult || isComparing}
          className="btn-primary text-xs py-3 px-4 w-full flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 via-indigo-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500"
        >
          {isComparing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Generating both outputs & analyzing quality differences...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Compare Live LLM Outputs (Original vs Final)</span>
            </>
          )}
        </button>

        {compareError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            ❌ {compareError}
          </div>
        )}

        {/* Dual LLM Outputs Display */}
        {comparisonResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Original Output */}
              <div className="glass-panel p-4 space-y-2 border-rose-500/30 bg-slate-950/80">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Original Prompt Output
                  </span>
                </div>
                <div className="text-xs text-gray-300 leading-relaxed font-sans max-h-60 overflow-y-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg">
                  {comparisonResult.originalOutput}
                </div>
              </div>

              {/* Final Output */}
              <div className="glass-panel-glow p-4 space-y-2 border-emerald-500/40 bg-slate-950/90">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Final Prompt Output ✨
                  </span>
                </div>
                <div className="text-xs text-gray-200 leading-relaxed font-sans max-h-60 overflow-y-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg">
                  {comparisonResult.finalOutput}
                </div>
              </div>
            </div>

            {/* AI COMPARISON EXPLANATION CARD (Requirement 5) */}
            {comparisonResult.comparisonExplanation && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/60 via-slate-900/90 to-indigo-950/60 border border-violet-500/40 space-y-2">
                <div className="flex items-center gap-2 border-b border-violet-500/20 pb-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h4 className="text-xs font-bold text-gradient font-heading uppercase tracking-wider">
                    AI Output Quality & Difference Analysis
                  </h4>
                </div>
                <div className="text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {comparisonResult.comparisonExplanation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
