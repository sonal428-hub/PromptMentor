import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Key, BookOpen, Target, GraduationCap, Trophy, LineChart, Home } from 'lucide-react';

export default function Header({ apiKey, onOpenApiKeyModal, onOpenFlashcards }) {
  const location = useLocation();

  const navItems = [
    { label: 'Prompt Improve', path: '/improve', icon: Target },
    { label: 'Learn Prompting', path: '/learn', icon: GraduationCap },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Track Progress', path: '/progress', icon: LineChart },
  ];

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Brand & Home */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gradient tracking-tight font-heading">PromptMentor</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 hidden sm:inline-block">
                AI Coach
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Collaborative Prompt Engineering</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <Link
          to="/"
          className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
            location.pathname === '/'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 font-semibold'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Home</span>
        </Link>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/50 shadow-sm font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-400' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons: Flashcards & API Key */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenFlashcards}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:border-violet-500/50"
          title="Interactive Prompting Flashcards"
        >
          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden sm:inline">Flashcards</span>
        </button>

        <button
          onClick={onOpenApiKeyModal}
          className={`text-xs py-1.5 px-3 rounded-lg border flex items-center gap-1.5 transition-all ${
            apiKey || import.meta.env?.VITE_API_KEY
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {apiKey || import.meta.env?.VITE_API_KEY ? 'Gemini API Active' : 'Set Gemini Key'}
          </span>
          <span className={`w-2 h-2 rounded-full ${apiKey || import.meta.env?.VITE_API_KEY ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
        </button>
      </div>
    </header>
  );
}
