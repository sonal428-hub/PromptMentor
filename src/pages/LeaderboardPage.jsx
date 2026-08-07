import React from 'react';
import { Trophy, Award, Sparkles, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LeaderboardPage() {
  const sampleLeaderboard = [
    { rank: 1, title: 'Full-Stack Code Refactoring Master Prompt', score: 98, author: '@alex_dev', category: 'Software Engineering' },
    { rank: 2, title: 'Executive SaaS Product Strategy Brief', score: 96, author: '@sarah_pm', category: 'Product Management' },
    { rank: 3, title: 'B2B Sales Outreach & Persona Customizer', score: 94, author: '@marcus_marketing', category: 'Copywriting' },
    { rank: 4, title: 'Zero-Shot Data Extraction to JSON Schema', score: 92, author: '@data_guru', category: 'Data Science' },
    { rank: 5, title: 'Pedagogical Concept Explainer for Beginners', score: 90, author: '@ed_tech', category: 'Education' },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-gray-100 p-6 lg:p-12 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Community Showcase</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient font-heading">
          Prompt Leaderboard
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Top-rated community prompts sorted by AI Quality Score (0–100), domain accuracy, and structural completeness.
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel overflow-hidden border-amber-500/20">
        <div className="p-4 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-200 font-heading flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Top Ranked Prompts
          </h2>
          <span className="text-xs text-gray-400 font-mono">Updated Daily</span>
        </div>

        <div className="divide-y divide-white/5 overflow-x-auto">
          {sampleLeaderboard.map((item) => (
            <div key={item.rank} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors text-xs">
              <div className="flex items-center gap-3.5 min-w-[200px]">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold ${
                  item.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' :
                  item.rank === 2 ? 'bg-slate-300 text-slate-950' :
                  item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-gray-400'
                }`}>
                  #{item.rank}
                </div>
                <div>
                  <div className="font-bold text-gray-200">{item.title}</div>
                  <div className="text-[11px] text-gray-400">{item.author} • {item.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  {item.score} / 100
                </span>
                <Link to="/improve" className="text-violet-400 hover:text-violet-300 font-medium">
                  Try in Coach →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
