import React from 'react';
import { GraduationCap, BookOpen, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LearnPage({ onOpenFlashcards }) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-gray-100 p-6 lg:p-12 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Educational Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient font-heading">
          Learn Prompt Engineering
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Master progressive prompt design principles: Roles, Contextual Grounding, Specificity, Behavioral Constraints, and Structured Output Formats.
        </p>
      </div>

      {/* Interactive Trigger Card */}
      <div className="glass-panel-glow p-8 space-y-6 border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-100 font-heading">
              Interactive Prompt Engineering Flashcards
            </h2>
            <p className="text-xs text-gray-300">
              Flip through 5 core pillar cards to explore real-world prompt transformations, before/after examples, and LLM behavior tips.
            </p>
          </div>
          <button
            onClick={onOpenFlashcards}
            className="btn-primary text-xs py-3 px-5 flex items-center gap-2 font-bold shadow-lg shadow-indigo-500/30"
          >
            <BookOpen className="w-4 h-4 text-violet-300" />
            <span>Open Flashcard Deck</span>
          </button>
        </div>
      </div>

      {/* Placeholder Pillars Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { title: '1. Role & Persona', text: 'Guides tone, depth, and domain authority. E.g. "Act as a Senior React Architect".' },
          { title: '2. Context & Background', text: 'Eliminates AI guesswork by providing target audience, goal, and scenario bounds.' },
          { title: '3. Specificity & Detail', text: 'Replaces vague verbs with exact targets, counts, and explicit instructions.' },
          { title: '4. Negative Constraints', text: 'Sets explicit rules on what to avoid, max length, and forbidden assumptions.' },
          { title: '5. Output Structure', text: 'Specifies desired output format (Markdown table, JSON schema, step-by-step).' },
          { title: '6. Few-Shot Examples', text: 'Demonstrates input/output patterns to guide edge-case formatting.' }
        ].map((pillar, idx) => (
          <div key={idx} className="glass-panel p-5 space-y-2 border-white/5">
            <h3 className="text-sm font-bold text-indigo-300 font-heading">{pillar.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{pillar.text}</p>
          </div>
        ))}
      </div>

      {/* Call to action to try workbench */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Ready to put your knowledge to practice?</h3>
          <p className="text-xs text-gray-400">Test draft prompts in the real-time AI Coaching Workbench.</p>
        </div>
        <Link to="/improve" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 whitespace-nowrap">
          <span>Go to Prompt Improve</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
