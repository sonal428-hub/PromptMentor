import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Target, GraduationCap, LineChart, Home, Puzzle } from 'lucide-react';
import { ButtonColorful } from '@/components/ui/button-colorful';

export default function Header({ onOpenFlashcards, onOpenExtension }) {
  const location = useLocation();

  const navItems = [
    { label: 'Prompt Improve', path: '/improve', icon: Target },
    { label: 'Learn Prompting', path: '/learn', icon: GraduationCap },
    { label: 'Track Progress', path: '/progress', icon: LineChart },
  ];

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xl shadow-slate-950/50">
      <Link to="/" className="flex items-center gap-3 group focus:outline-none">
        {/* Logo with ambient glow */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          <div className="absolute -inset-1 bg-gradient-to-tr from-violet-600 via-indigo-500 to-emerald-400 rounded-xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
          <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/20 group-hover:ring-violet-400/50 bg-slate-950 p-0.5 shadow-inner transition-all duration-300">
            <img
              src="/logo.png"
              alt="PromptMentor Logo"
              className="w-full h-full object-contain rounded-[10px]"
            />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-lg sm:text-xl font-black tracking-tight font-heading bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent group-hover:from-violet-200 group-hover:to-emerald-300 transition-all duration-300">
          PromptMentor
        </h1>
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

        {/* Chrome Extension Button beside Track Progress */}
        <ButtonColorful
          onClick={onOpenExtension}
          title="PromptMentor Chrome Extension Guide"
          className="h-9 px-3.5 border-violet-500/30 hover:border-violet-500/60"
        >
          <Puzzle className="w-4 h-4 text-violet-400" />
          <span className="text-gray-200 font-medium">Chrome Extension</span>
        </ButtonColorful>
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
      </div>
    </header>
  );
}
