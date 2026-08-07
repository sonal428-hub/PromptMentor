import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Key, BookOpen, Target, GraduationCap, Trophy, LineChart, Home } from 'lucide-react';
import { ButtonColorful } from '@/components/ui/button-colorful';

export default function Header({ apiKey, onOpenApiKeyModal, onOpenFlashcards }) {
  const location = useLocation();

  const navItems = [
    { label: 'Prompt Improve', path: '/improve', icon: Target },
    { label: 'Learn Prompting', path: '/learn', icon: GraduationCap },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Track Progress', path: '/progress', icon: LineChart },
  ];

  const hasKey = apiKey || import.meta.env?.VITE_API_KEY;

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Brand & Penguin Logo */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="PromptMentor Logo" className="w-full h-full object-cover rounded-[10px]" />
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

      {/* Navigation Links with Theme-Harmonized ButtonColorful */}
      <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <Link to="/">
          <ButtonColorful active={location.pathname === '/'}>
            <Home className={`w-3.5 h-3.5 ${location.pathname === '/' ? 'text-violet-300' : 'text-gray-400'}`} />
            <span className={`hidden md:inline ${location.pathname === '/' ? 'text-white font-semibold' : 'text-gray-300'}`}>Home</span>
          </ButtonColorful>
        </Link>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <ButtonColorful active={isActive}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-300' : 'text-gray-400'}`} />
                <span className={isActive ? 'text-white font-semibold' : 'text-gray-300'}>{item.label}</span>
              </ButtonColorful>
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons with Theme-Harmonized ButtonColorful */}
      <div className="flex items-center gap-2">
        <ButtonColorful
          onClick={onOpenFlashcards}
          title="Interactive Prompting Flashcards"
          className="border-violet-500/30 hover:border-violet-500/60"
        >
          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden sm:inline text-gray-200">Flashcards</span>
        </ButtonColorful>

        <ButtonColorful
          onClick={onOpenApiKeyModal}
          className={hasKey ? 'border-emerald-500/40 hover:border-emerald-500/70' : 'border-amber-500/40 hover:border-amber-500/70'}
        >
          <Key className="w-3.5 h-3.5 text-gray-300" />
          <span className="hidden sm:inline text-gray-200">
            {hasKey ? 'Gemini API Active' : 'Set Gemini Key'}
          </span>
          <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
        </ButtonColorful>
      </div>
    </header>
  );
}
