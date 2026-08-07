import React from 'react';
import { LineChart, Award, TrendingUp, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProgressPage({ coaxResult }) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-gray-100 p-6 lg:p-12 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <LineChart className="w-3.5 h-3.5 text-emerald-400" />
          <span>User Growth & Metrics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient font-heading">
          Track Your Prompting Progress
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Monitor your prompt quality score improvement over time, track pillar mastery, and review past coaching sessions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 space-y-2 border-emerald-500/20">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Latest Session Score</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-heading">
            {coaxResult ? `${coaxResult.score} / 100` : '78 / 100'}
          </div>
          <p className="text-[11px] text-gray-400">+14 pt delta over initial unrefined draft</p>
        </div>

        <div className="glass-panel p-5 space-y-2 border-violet-500/20">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Top Mastered Pillar</div>
          <div className="text-3xl font-extrabold text-violet-300 font-heading">
            Role & Constraints
          </div>
          <p className="text-[11px] text-gray-400">92% consistency across prompt tests</p>
        </div>

        <div className="glass-panel p-5 space-y-2 border-indigo-500/20">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Prompts Coached</div>
          <div className="text-3xl font-extrabold text-indigo-300 font-heading">
            12 Prompts
          </div>
          <p className="text-[11px] text-gray-400">All session drafts automatically archived</p>
        </div>
      </div>

      {/* Historical Radar & Glow-up Summary */}
      <div className="glass-panel-glow p-6 space-y-4 border-violet-500/30">
        <h2 className="text-base font-bold text-gray-200 font-heading flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          Session Glow-Up Summary Card
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          {coaxResult
            ? `Your current active session achieved an AI score of ${coaxResult.score}/100 with ${coaxResult.tags.filter(t => t.status === 'pass').length} out of ${coaxResult.tags.length} engineering pillars satisfied.`
            : `No active prompt coached yet in this browser session. Head over to Prompt Improve to run real-time AI evaluation and track live deltas.`}
        </p>

        <div className="pt-3 flex gap-3">
          <Link to="/improve" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2">
            <span>Coach New Prompt</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
