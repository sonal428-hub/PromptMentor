import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Sparkles, Target, ShieldAlert, Minus, ArrowUpRight, BookOpen, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ============================================================================
 * PERSONAL GROWTH ANALYTICS — STRICTLY SELF-REFERENTIAL
 *
 * Compares the user's recent prompt coaching scores against their earlier
 * scores. NEVER references other users, averages, or any external benchmark.
 *
 * Edge Cases Handled:
 *   Case 1: No scores at all → status 'EMPTY'
 *   Case 2: Only 1 score → status 'INSUFFICIENT'
 *   Case 3: 2–4 scores (below threshold of 5) → status 'INSUFFICIENT'
 *   Case 4: All scores identical (diff === 0) → status 'STEADY'
 *   Case 5: Scores went down (diff < 0) → status 'DIPPED'
 *   Case 6: Corrupted/malformed localStorage → try/catch falls to 'EMPTY'
 *   Case 7: localStorage blocked/unavailable → status 'BLOCKED'
 * ==========================================================================*/

const MIN_SCORES_THRESHOLD = 5;

function analyzePersonalGrowth() {
  let rawData = null;

  // ── Case 7: localStorage blocked or unavailable ──
  try {
    rawData = localStorage.getItem('promptmentor_scores');
  } catch {
    return {
      status: 'BLOCKED',
      message: "Personal progress tracking isn't available in this browser session.",
      scores: [], recentAvg: 0, earlierAvg: 0, pointDiff: 0, percentDiff: 0
    };
  }

  // ── Case 1: No data stored yet ──
  if (!rawData) {
    return {
      status: 'EMPTY',
      message: 'Submit a few prompts on the Improve page to start tracking your growth over time.',
      scores: [], recentAvg: 0, earlierAvg: 0, pointDiff: 0, percentDiff: 0
    };
  }

  // ── Case 6: Corrupted / malformed JSON or non-array data ──
  let validScores = [];
  try {
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      validScores = parsed.filter(
        item =>
          item &&
          typeof item === 'object' &&
          typeof item.score === 'number' &&
          !isNaN(item.score) &&
          item.score >= 0 &&
          item.score <= 100 &&
          typeof item.timestamp === 'number'
      );
    }
  } catch {
    // Malformed JSON — treat as empty
    return {
      status: 'EMPTY',
      message: 'Submit a few prompts on the Improve page to start tracking your growth over time.',
      scores: [], recentAvg: 0, earlierAvg: 0, pointDiff: 0, percentDiff: 0
    };
  }

  // ── Case 1 (variant): Array parsed but every entry was invalid ──
  if (validScores.length === 0) {
    return {
      status: 'EMPTY',
      message: 'Submit a few prompts on the Improve page to start tracking your growth over time.',
      scores: [], recentAvg: 0, earlierAvg: 0, pointDiff: 0, percentDiff: 0
    };
  }

  // Sort ascending by timestamp (earliest → latest)
  validScores.sort((a, b) => a.timestamp - b.timestamp);
  const totalCount = validScores.length;

  // ── Case 2 & Case 3: Under the minimum threshold of 5 ──
  if (totalCount < MIN_SCORES_THRESHOLD) {
    return {
      status: 'INSUFFICIENT',
      message: "Keep practicing — you'll see your personal growth trend after a few more prompts.",
      scores: validScores, totalCount, recentAvg: validScores[totalCount - 1].score,
      earlierAvg: 0, pointDiff: 0, percentDiff: 0
    };
  }

  // ── Split into earlier half and recent window ──
  const windowSize = Math.min(5, Math.floor(totalCount / 2));
  const recentSlice = validScores.slice(totalCount - windowSize);
  const earlierSlice = validScores.slice(0, totalCount - windowSize);

  const recentAvg = Math.round(recentSlice.reduce((s, i) => s + i.score, 0) / recentSlice.length);
  const earlierAvg = Math.round(earlierSlice.reduce((s, i) => s + i.score, 0) / earlierSlice.length);
  const pointDiff = recentAvg - earlierAvg;
  const percentDiff = earlierAvg > 0 ? Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100) : 0;

  // ── Case 4: No change at all ──
  if (pointDiff === 0) {
    return {
      status: 'STEADY',
      message: `Your prompt scores are holding steady around ${recentAvg} pts — consistency is key to mastering prompt engineering!`,
      scores: validScores, totalCount, recentAvg, earlierAvg, pointDiff: 0, percentDiff: 0
    };
  }

  // ── Case 5: Scores went down ──
  if (pointDiff < 0) {
    return {
      status: 'DIPPED',
      message: `Your recent average dipped slightly (${pointDiff} pts) — that's completely normal when tackling harder topics, keep pushing!`,
      scores: validScores, totalCount, recentAvg, earlierAvg, pointDiff, percentDiff
    };
  }

  // ── Positive growth ──
  return {
    status: 'GROWTH',
    message: percentDiff > 0
      ? `Your prompts are ${percentDiff}% more precise (+${pointDiff} pts) compared to your earlier sessions — great improvement!`
      : `Your scores improved by +${pointDiff} points compared to your earlier sessions!`,
    scores: validScores, totalCount, recentAvg, earlierAvg, pointDiff, percentDiff
  };
}

/* ============================================================================
 * READ EXAM SCORE — from promptmentor_exam_score (0–100 percentage)
 * Written by LearnPage.jsx on each correctly solved quiz question.
 * Returns null if not yet available or blocked.
 * ==========================================================================*/

function readExamScore() {
  try {
    const raw = localStorage.getItem('promptmentor_exam_score');
    if (raw === null) return null;
    const val = JSON.parse(raw);
    if (typeof val === 'number' && !isNaN(val) && val >= 0 && val <= 100) return val;
    return null;
  } catch {
    return null;
  }
}

/* ============================================================================
 * MINI SCORE RING — lightweight circular score indicator
 * ==========================================================================*/

function ScoreRing({ value, size = 72, stroke = 5, color = '#8b5cf6' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="block -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
    </svg>
  );
}

/* ============================================================================
 * PROGRESS PAGE COMPONENT
 * ==========================================================================*/

export default function ProgressPage({ coaxResult }) {
  const growth = useMemo(() => analyzePersonalGrowth(), []);
  const examScore = useMemo(() => readExamScore(), []);

  const promptAvg = useMemo(() => {
    if (!growth.scores || growth.scores.length === 0) return null;
    return Math.round(growth.scores.reduce((s, i) => s + i.score, 0) / growth.scores.length);
  }, [growth]);

  const hasBothSources = promptAvg !== null && examScore !== null;
  const weightedScore = hasBothSources
    ? Math.round(promptAvg * 0.10 + examScore * 0.90)
    : null;

  const latestScore = coaxResult
    ? coaxResult.score
    : growth.scores.length > 0
      ? growth.scores[growth.scores.length - 1].score
      : null;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 space-y-6 sm:space-y-8">

        {/* ── Header ── */}
        <header className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
            Your Progress
          </h1>
          <p className="text-sm text-gray-500 max-w-lg">
            All data shown is from your browser only — nothing leaves this device.
          </p>
        </header>

        {/* ── Top Score Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Latest session */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 flex items-center gap-4">
            <div className="relative shrink-0">
              <ScoreRing value={latestScore ?? 0} size={56} stroke={4} color="#34d399" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-400 font-mono rotate-0">
                {latestScore ?? '–'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Last Session</p>
              <p className="text-lg font-bold text-white font-heading truncate">
                {latestScore !== null ? `${latestScore} / 100` : 'No session yet'}
              </p>
            </div>
          </div>

          {/* Exam/Quiz */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 flex items-center gap-4">
            <div className="relative shrink-0">
              <ScoreRing value={examScore ?? 0} size={56} stroke={4} color="#a78bfa" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-violet-400 font-mono">
                {examScore ?? '–'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Quiz Progress</p>
              <p className="text-lg font-bold text-white font-heading truncate">
                {examScore !== null ? `${examScore}%` : 'Not started'}
              </p>
            </div>
          </div>

          {/* Prompts coached */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 flex items-center gap-4">
            <div className="shrink-0 w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <span className="text-lg font-bold text-indigo-400 font-mono">{growth.scores.length}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Prompts Coached</p>
              <p className="text-lg font-bold text-white font-heading truncate">
                {growth.scores.length === 0 ? 'None yet' : `${growth.scores.length} total`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Weighted Final Score ── */}
        <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-slate-900/80 to-slate-950/80 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-white/[0.05] flex items-center gap-2.5">
            <Target className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-gray-200 font-heading">Overall Score</h2>
          </div>

          <div className="px-5 sm:px-6 py-5 sm:py-6">
            {hasBothSources ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                {/* Big number */}
                <div className="relative shrink-0 self-center sm:self-auto">
                  <ScoreRing value={weightedScore} size={100} stroke={6} color="url(#scoreGrad)" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-white font-heading">
                    {weightedScore}
                  </span>
                  {/* SVG gradient definition */}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Breakdown */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    {/* Prompt avg bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Coaching Avg <span className="text-gray-600">× 10%</span></span>
                        <span className="text-emerald-400 font-mono font-medium">{promptAvg}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${promptAvg}%`, transition: 'width 0.6s ease-out' }} />
                      </div>
                    </div>
                    {/* Exam bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Quiz Score <span className="text-gray-600">× 90%</span></span>
                        <span className="text-violet-400 font-mono font-medium">{examScore}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500/70" style={{ width: `${examScore}%`, transition: 'width 0.6s ease-out' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.03] border border-dashed border-white/10">
                  <Target className="w-6 h-6 text-gray-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-300 font-medium">
                    {promptAvg === null && examScore === null
                      ? 'Complete some coaching sessions and quizzes to unlock your score.'
                      : promptAvg === null
                        ? 'Coach at least one prompt to calculate your overall score.'
                        : 'Finish a quiz on the Learn page to see your overall score.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  {promptAvg === null && (
                    <Link to="/improve" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors group">
                      <Zap className="w-3.5 h-3.5" />
                      Coach a Prompt
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  )}
                  {promptAvg === null && examScore === null && (
                    <span className="text-gray-700 text-xs">·</span>
                  )}
                  {examScore === null && (
                    <Link to="/learn" className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors group">
                      <BookOpen className="w-3.5 h-3.5" />
                      Take a Quiz
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Growth Trend ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Growth Trend
          </h2>

          {/* Case 7: localStorage blocked */}
          {growth.status === 'BLOCKED' && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5">
              <div className="flex items-center gap-2.5 text-sm text-rose-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{growth.message}</span>
              </div>
            </div>
          )}

          {/* Case 1 & 6: Empty */}
          {growth.status === 'EMPTY' && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-6 text-center space-y-3">
              <Sparkles className="w-5 h-5 text-gray-600 mx-auto" />
              <p className="text-sm text-gray-400">{growth.message}</p>
              <Link to="/improve" className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
                Start coaching <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Case 2 & 3: Insufficient (<5 scores) */}
          {growth.status === 'INSUFFICIENT' && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-300">{growth.message}</p>
                <span className="text-xs font-mono text-gray-500 whitespace-nowrap shrink-0">
                  {growth.totalCount}/{MIN_SCORES_THRESHOLD}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500/60 transition-all duration-500"
                  style={{ width: `${(growth.totalCount / MIN_SCORES_THRESHOLD) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Case 4: Steady (no change) */}
          {growth.status === 'STEADY' && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Minus className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-relaxed">{growth.message}</p>
                </div>
                <span className="text-xs font-mono text-violet-400 shrink-0">~{growth.recentAvg} pts</span>
              </div>
            </div>
          )}

          {/* Case 5: Dipped */}
          {growth.status === 'DIPPED' && (
            <div className="rounded-2xl border border-amber-500/15 bg-amber-950/10 p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-relaxed">{growth.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono pl-12">
                <span>Before: {growth.earlierAvg}</span>
                <span>Now: {growth.recentAvg}</span>
                <span className="text-amber-500">{growth.pointDiff} pts</span>
              </div>
            </div>
          )}

          {/* Positive Growth */}
          {growth.status === 'GROWTH' && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-emerald-200 leading-relaxed font-medium">{growth.message}</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  +{growth.pointDiff}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pl-12">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Recent</p>
                  <p className="text-base font-bold text-emerald-400 font-mono">{growth.recentAvg}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Earlier</p>
                  <p className="text-base font-bold text-gray-400 font-mono">{growth.earlierAvg}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Sessions</p>
                  <p className="text-base font-bold text-gray-300 font-mono">{growth.totalCount}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Current Session ── */}
        {coaxResult && (
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.05] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-gray-200 font-heading">Current Session</h2>
            </div>
            <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-400">
                Scored <strong className="text-white">{coaxResult.score}/100</strong> with{' '}
                {coaxResult.tags.filter(t => t.status === 'pass').length}/{coaxResult.tags.length} pillars met
              </p>
              <Link to="/improve" className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap">
                Continue coaching <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </section>
        )}

        {/* ── Empty state CTA (when no session active) ── */}
        {!coaxResult && (
          <div className="text-center pt-2 pb-4">
            <Link to="/improve"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-violet-400 transition-colors group"
            >
              <Zap className="w-4 h-4" />
              Start a new coaching session
              <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
