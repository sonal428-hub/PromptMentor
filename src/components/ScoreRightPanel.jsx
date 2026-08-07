import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Award, Zap, Copy, Check, Play, RefreshCw, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PROMPT_PILLARS, extractOriginalHighlights } from '../utils/promptAnalyzer';
import PillarHighlightSpan from './PillarHighlightSpan';
import PenguinMascot from './PenguinMascot';

export default function ScoreRightPanel({
  userPrompt,
  coaxResult,
  isCoaxing,
  comparisonResult,
  isComparing,
  compareError,
  onCompare,
  aiScoreResult,
  isAiScoreLoading,
  aiScoreError,
  onOpenCompareModal
}) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedFinal, setCopiedFinal] = useState(false);
  const [penguinMode, setPenguinMode] = useState('idle');

  // Real AI score calculation: ONLY display AI score when explicitly submitted & evaluated
  const isPromptEmpty = !userPrompt || !userPrompt.trim();
  const isSubmitted = !!aiScoreResult;
  const displayScore = (isPromptEmpty || !isSubmitted) ? 0 : (aiScoreResult.score ?? 0);
  const strokeDashoffset = 226 - (226 * Math.min(100, Math.max(0, displayScore))) / 100;

  const prevScoreRef = useRef(undefined);
  const timersRef = useRef([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  }, []);

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

  useEffect(() => {
    startWaveCycle();
    return clearAllTimers;
  }, [startWaveCycle, clearAllTimers]);

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

  const handleCompareClick = () => {
    if (onOpenCompareModal) {
      onOpenCompareModal();
    }
    if (!comparisonResult && onCompare) {
      onCompare();
    }
  };

  return (
    <div className="relative flex flex-col justify-between h-full space-y-3 bg-transparent overflow-hidden">
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        
        {/* Card 1: AI Score Meter */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-100 font-heading">AI Quality Score</h2>
                <p className="text-[11px] text-gray-400">Gemini LLM evaluation</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
              {isAiScoreLoading && <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />}
              <span>{isAiScoreLoading ? 'Evaluating...' : 'Gemini AI'}</span>
            </span>
          </div>

          {/* Radial Score Display */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
              <svg className="w-20 h-20 meter-svg" viewBox="0 0 80 80">
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
                <span className="text-2xl font-black font-heading text-white tracking-tight">
                  {displayScore}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">/ 100</span>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="text-xs font-bold text-gray-200 font-heading">
                {displayScore >= 85
                  ? 'Master Level Prompt (85+)'
                  : displayScore >= 70
                  ? 'Strong Prompt (70–84)'
                  : displayScore >= 50
                  ? 'Developing Prompt (50–69)'
                  : 'Needs Optimization (<50)'}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-2">
                {isPromptEmpty || !isSubmitted ? (
                  'Click the submit arrow button below to calculate your AI Quality Score.'
                ) : isAiScoreLoading ? (
                  <span className="text-violet-300 animate-pulse">Evaluating prompt structure with Gemini AI...</span>
                ) : (
                  aiScoreResult?.explanation || 'Score evaluated.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Live LLM Output Workbench */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/20 space-y-3 shadow-lg flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-emerald-400" />
              Live LLM Output Workbench
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed min-h-[36px]">
              Generate side-by-side inference outputs comparing your original prompt against the AI-refined version.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5">
            <button
              onClick={handleCompareClick}
              disabled={isComparing}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Running Live Inferences...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Compare Live LLM Outputs (Popup Window)</span>
                </>
              )}
            </button>
          </div>

          {compareError && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              ❌ {compareError}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
