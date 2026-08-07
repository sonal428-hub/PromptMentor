import React from 'react';
import { Sparkles, Key, BookOpen, ShieldCheck, Cpu } from 'lucide-react';

export default function Header({ apiKey, onOpenApiKeyModal, onOpenFlashcards }) {
  return (
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-violet-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gradient tracking-tight">PromptMentor</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              PS05 AI Co-Pilot
            </span>
          </div>
          <p className="text-xs text-gray-400">Collaborative Prompt Engineering & Quality Analyzer</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenFlashcards}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 hover:border-violet-500/50"
        >
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span>Prompt Flashcards</span>
        </button>

        <button
          onClick={onOpenApiKeyModal}
          className={`text-xs py-2 px-3 rounded-lg border flex items-center gap-1.5 transition-all ${
            apiKey
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{apiKey ? 'Gemini API Active' : 'Set Gemini Key (Optional)'}</span>
          <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
        </button>
      </div>
    </header>
  );
}
