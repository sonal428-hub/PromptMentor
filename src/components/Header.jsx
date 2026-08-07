import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Key, BookOpen, Target, GraduationCap, Trophy, LineChart, Home, Sparkles } from 'lucide-react';
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
    <header className="w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xl shadow-slate-950/50">
      <Link to="/" className="flex items-center gap-3 group focus:outline-none">
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-violet-500/25 group-hover:scale-105 group-hover:shadow-violet-500/40 transition-all duration-300">
          <img
            src="/logo.png"
            alt="PromptMentor Logo"
            className="w-full h-full object-cover rounded-[14px] bg-slate-950"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-black tracking-tight font-heading bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-emerald-300 transition-all">
            PromptMentor
          </h1>
          <Sparkles className="w-4 h-4 text-violet-400 group-hover:rotate-12 transition-transform" />
        </div>
      </Link>

      <nav className="hidden md:flex items-center gap-2">
        <Link to="/">
          <ButtonColorful
            active={location.pathname === '/'}
            className="h-9 px-3.5"
          >
            <Home className={`w-4 h-4 ${location.pathname === '/' ? 'text-violet-300' : 'text-gray-400'}`} />
            <span className={location.pathname === '/' ? 'text-white font-semibold' : 'text-gray-300'}>
              Home
            </span>
          </ButtonColorful>
        </Link>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <ButtonColorful
                active={isActive}
                className="h-9 px-3.5"
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-300' : 'text-gray-400'}`} />
                <span className={isActive ? 'text-white font-semibold' : 'text-gray-300'}>
                  {item.label}
                </span>
              </ButtonColorful>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5">
        <ButtonColorful
          onClick={onOpenFlashcards}
          title="Interactive Prompting Flashcards"
          className="border-violet-500/30 hover:border-violet-500/60"
        >
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span className="hidden sm:inline text-gray-200 font-medium">Flashcards</span>
        </ButtonColorful>

        <ButtonColorful
          onClick={onOpenApiKeyModal}
          className={`h-9 px-3.5 ${
            hasKey
              ? 'border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-500/5'
              : 'border-amber-500/40 hover:border-amber-500/70 bg-amber-500/5'
          }`}
        >
          <Key className={`w-4 h-4 ${hasKey ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="hidden sm:inline text-gray-200 font-medium">
            {hasKey ? 'Gemini Active' : 'Set API Key'}
          </span>
          <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
        </ButtonColorful>
      </div>
    </header>
  );
}
