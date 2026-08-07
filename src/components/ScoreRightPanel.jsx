import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Award, Zap, Copy, Check, Play, RefreshCw, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PROMPT_PILLARS, extractOriginalHighlights } from '../utils/promptAnalyzer';
import PillarHighlightSpan from './PillarHighlightSpan';
import PenguinMascot from './PenguinMascot';

export default function ScoreRightPanel({
  coaxResult,
  isCoaxing,
  comparisonResult,
  isComparing,
  compareError,
  onCompare,
  aiScoreResult,
  isAiScoreLoading,
  aiScoreError
}) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedFinal, setCopiedFinal] = useState(false);
  const [penguinMode, setPenguinMode] = useState('idle');

  // Real AI score from 2s debounced call (or coaxResult fallback)
  const displayScore = aiScoreResult?.score ?? coaxResult?.score ?? 0;
  const strokeDashoffset = 226 - (226 * Math.min(100, Math.max(0, displayScore))) / 100;

  const prevScoreRef = useRef(undefined);
  const timersRef = useRef([]);

  // ─── Timer helpers ───
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  }, []);

  // Idle → 4 s gap → Wave 2 s → repeat
  const startWaveCycle = useCallback(() => {
    clearAllTimers();
    const scheduleWave = () => {
      const idleTimer = setTimeout(() => {
        setPenguinMode('wave');
        const waveTimer = setTimeout(() => {
          setPenguinMode('idle');
          scheduleWave();
        }, 2000);
        timersRef.current.push(waveTimer);
      }, 4000);
      timersRef.current.push(idleTimer);
    };
    scheduleWave();
  }, [clearAllTimers]);

  // Start the idle + wave cycle on mount
  useEffect(() => {
    startWaveCycle();
    return clearAllTimers;
  }, [startWaveCycle, clearAllTimers]);

  // React to score changes: happy (≥60) or sad (<60) for 3 s, then resume wave cycle
  useEffect(() => {
    if (isCoaxing || isAiScoreLoading) {
      clearAllTimers();
      setPenguinMode('idle');
      startWaveCycle();
      return;
    }

    if (displayScore !== undefined && displayScore !== prevScoreRef.current) {
      clearAllTimers();
      setPenguinMode(displayScore >= 60 ? 'happy' : 'sad');

      const reactionTimer = setTimeout(() => {
        setPenguinMode('idle');
        startWaveCycle();
      }, 3000);
      timersRef.current.push(reactionTimer);

      prevScoreRef.current = displayScore;
    }
  }, [displayScore, isCoaxing, isAiScoreLoading, clearAllTimers, startWaveCycle]);

  const getScoreColor = (val) => {
    if (val >= 85) return '#10b981';
    if (val >= 70) return '#8b5cf6';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(displayScore);

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

  // Active AI rewritten prompt (from 2s debounced Gemini call or coaxResult)
  const activeRewrittenPrompt = aiScoreResult?.finalPrompt || coaxResult?.finalPrompt || '';

  return (
    <div className="relative flex flex-col h-full overflow-y-auto p-4 lg:p-6 space-y-5 bg-slate-950/20">
      <div className="glass-panel p-5 space-y-4 border-violet-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-100 font-heading">AI Score</h2>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold flex items-center gap-1.5">
            {isAiScoreLoading && <RefreshCw className="w-3 h-3 animate-spin text-violet-400" />}
            <span></span>
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
                {displayScore}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">/ 100</span>
            </div>
          </div>

          {/* Dynamic 1-Sentence AI Explanation generated by Gemini */}
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-gray-200 font-heading">
              {displayScore >= 85
                ? 'Master Level Prompt (85+)'
                : displayScore >= 70
                ? 'Strong Prompt (70–84)'
                : displayScore >= 50
                ? 'Developing Prompt (50–69)'
                : 'Needs Optimization (<50)'}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              {isAiScoreLoading ? (
                <span className="text-violet-300 animate-pulse">Evaluating prompt structure with Gemini AI...</span>
              ) : (
                aiScoreResult?.explanation || 'Score updates 2 seconds after typing stops to provide dynamic AI feedback.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Live LLM Output Workbench */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Live LLM Output Workbench
          </h3>
        </div>

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

        {comparisonResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {comparisonResult.comparisonExplanation && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/60 via-slate-900/90 to-indigo-950/60 border border-violet-500/40 space-y-2">
                <div className="flex items-center gap-2 border-b border-violet-500/20 pb-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h4 className="text-xs font-bold text-gradient font-heading uppercase tracking-wider">
                    AI Output Quality & Difference Analysis
                  </h4>
                </div>
                <div className="text-xs text-gray-200 leading-relaxed font-sans">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-sm font-bold text-violet-300 mt-2 mb-1" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xs font-bold text-violet-300 mt-2 mb-1" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-violet-300 mt-2 mb-1 font-heading" {...props} />,
                      h4: ({ node, ...props }) => <h4 className="text-xs font-bold text-violet-300 mt-2 mb-1 font-heading uppercase" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0 text-gray-200 leading-relaxed text-xs" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-violet-200" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-1.5 text-xs text-gray-200" {...props} />,
                      li: ({ node, ...props }) => <li className="text-xs text-gray-200 leading-relaxed" {...props} />,
                    }}
                  >
                    {comparisonResult.comparisonExplanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
