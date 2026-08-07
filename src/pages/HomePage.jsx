import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, GraduationCap, Trophy, LineChart, ArrowRight, ShieldCheck, Zap, Layers, Award } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const navCards = [
    {
      id: 'improve',
      title: 'Prompt Improve',
      badge: 'Main Feature',
      path: '/improve',
      icon: Target,
      color: 'from-violet-600 via-indigo-600 to-emerald-500',
      description: 'Collaborative AI prompt coach with draggable split panels, live AI quality score (0–100), specificity meter, concept checklist, and dual LLM output comparison.',
      isPrimary: true,
      actionText: 'Launch Coaching Workbench'
    },
    {
      id: 'learn',
      title: 'Learn Prompting',
      badge: 'Interactive Modules',
      path: '/learn',
      icon: GraduationCap,
      color: 'from-indigo-600 to-blue-500',
      description: 'Master prompt engineering fundamentals through step-by-step interactive flashcards, progressive disclosure cards, and real-world prompt examples.',
      isPrimary: false,
      actionText: 'Start Learning'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      badge: 'Community',
      path: '/leaderboard',
      icon: Trophy,
      color: 'from-amber-500 to-orange-600',
      description: 'Explore high-scoring prompts crafted by the community, categorized by domain, quality score, and precision benchmarks.',
      isPrimary: false,
      actionText: 'View Leaderboard'
    },
    {
      id: 'progress',
      title: 'Track Progress',
      badge: 'Analytics',
      path: '/progress',
      icon: LineChart,
      color: 'from-emerald-500 to-teal-600',
      description: 'Review your personal prompt improvement radar, historical score deltas, specificity metrics, and shareable prompt glow-up cards.',
      isPrimary: false,
      actionText: 'View Analytics'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-gray-100 p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">

      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span>Real-Time Collaborative Prompt Engineering</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient font-heading leading-tight">
          Write Better Prompts with Live AI Coaching
        </h1>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          PromptMentor teaches specificity, context, constraints, and roles in real time — leaving you skilled at prompt engineering on your own over time, rather than hiding fixes behind the scenes.
        </p>
      </div>

      {/* 4 Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {navCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className={`group cursor-pointer rounded-2xl p-6 sm:p-8 transition-all duration-300 relative overflow-hidden flex flex-col justify-between space-y-6 ${
                card.isPrimary
                  ? 'glass-panel-glow border-violet-500/40 hover:border-violet-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]'
                  : 'glass-panel border-white/10 hover:border-white/20 hover:bg-slate-900/60'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    card.isPrimary
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}>
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-100 font-heading group-hover:text-violet-300 transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-violet-400 group-hover:text-violet-300">
                <span>{card.actionText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Highlights / Features Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
            <Award className="w-4 h-4" />
            AI Score (0–100)
          </div>
          <p className="text-xs text-gray-400">
            Real-time score judged by Gemini AI across persona, context, specificity, and constraints.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            Dual LLM Output Compare
          </div>
          <p className="text-xs text-gray-400">
            Run original vs refined prompts simultaneously and get an AI comparison of quality differences.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Layers className="w-4 h-4" />
            Resizable Split View
          </div>
          <p className="text-xs text-gray-400">
            Draggable divider handle between coach panel and score panel for custom workspace layout.
          </p>
        </div>
      </div>

    </div>
  );
}
