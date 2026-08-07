import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCw, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { PROMPT_PILLARS } from '../utils/promptAnalyzer';

const FLASHCARDS = [
  {
    pillar: PROMPT_PILLARS.PERSONA,
    frontTitle: 'Pillar 1: Persona & Role Framing',
    frontSubtitle: 'Why telling the AI "who it is" completely transforms its response depth.',
    badge: 'Core Principle',
    frontContent: 'When you ask an LLM a question, it chooses a default general tone. Assigning a role (e.g. "Act as a Senior React Architect") primes its internal weights to pull professional jargon, best practices, and edge-case awareness.',
    backTitle: 'How to Implement Persona',
    examplesBad: '❌ "Write code for a binary search tree."',
    examplesGood: '✅ "Act as a Computer Science Professor and Staff Software Engineer. Write a clean Python binary search tree implementation with asymptotic time complexity comments."',
    proTip: '💡 Pro Tip: Combine authority + target audience (e.g., "Act as an expert doctor explaining diabetes to an 8-year-old child").'
  },
  {
    pillar: PROMPT_PILLARS.CONTEXT,
    frontTitle: 'Pillar 2: Context & Grounding',
    frontSubtitle: 'Eliminate AI guesswork by providing the background story.',
    badge: 'Relevance Powerup',
    frontContent: 'LLMs have no awareness of your company, project, or personal goals unless you tell them. Without context, the model makes generic assumptions that waste time.',
    backTitle: 'How to Provide Context',
    examplesBad: '❌ "Write a workout plan."',
    examplesGood: '✅ "I am a 28-year-old beginner recovering from a mild knee strain, with access to a home dumbbell set. Design a low-impact 3-day workout plan focused on core strength."',
    proTip: '💡 Pro Tip: Use the 3 Ws: Who is it for? What is the goal? Where will it be used?'
  },
  {
    pillar: PROMPT_PILLARS.SPECIFICITY,
    frontTitle: 'Pillar 3: Specificity & Action Verbs',
    frontSubtitle: 'Replace vague commands with exact instructions.',
    badge: 'Precision Focus',
    frontContent: 'Vague prompts like "help me fix this" or "tell me about space" produce generic Wikipedia-style dumps. Specificity forces target accuracy.',
    backTitle: 'How to Be Specific',
    examplesBad: '❌ "Tell me about climate change."',
    examplesGood: '✅ "Analyze 3 major economic impacts of rising sea levels on coastal real estate over the next 20 years. Highlight key statistics in a summary table."',
    proTip: '💡 Pro Tip: Use action verbs like Analyze, Refactor, Compare, Benchmark, or Synthesize instead of "Make" or "Do".'
  },
  {
    pillar: PROMPT_PILLARS.CONSTRAINTS,
    frontTitle: 'Pillar 4: Constraints & Negative Bounds',
    frontSubtitle: 'Prevent long-winded fluff, jargon, and forbidden topics.',
    badge: 'Quality Filter',
    frontContent: 'Constraints tell the AI what NOT to do. This keeps responses concise, readable, and focused on high-signal content without filler.',
    backTitle: 'Setting Effective Boundaries',
    examplesBad: '❌ "Write an email asking for a raise."',
    examplesGood: '✅ "Write a salary review email under 150 words. Do not sound desperate or aggressive. Focus strictly on measurable Q3 metric achievements."',
    proTip: '💡 Pro Tip: Use words like "Limit to X words", "Do not include...", "Exclude external libraries", or "Strictly keep tone professional".'
  },
  {
    pillar: PROMPT_PILLARS.FORMAT,
    frontTitle: 'Pillar 5: Output Format & Layout',
    frontSubtitle: 'Structure answers into tables, executive summaries, or bullet points.',
    badge: 'Readability Key',
    frontContent: 'A wall of plain text is hard to digest. Specifying an exact output layout makes information instantly actionable and easy to scan.',
    backTitle: 'Mastering Output Formats',
    examplesBad: '❌ "Compare React vs Vue."',
    examplesGood: '✅ "Compare React vs Vue in a 3-column Markdown Table (Criteria, React, Vue), followed by a 2-paragraph Executive Summary and Final Recommendation."',
    proTip: '💡 Pro Tip: Ask for JSON, Markdown Tables, Numbered Step-by-step guides, or Executive Summaries.'
  }
];

export default function EducationalFlashcards({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const currentCard = FLASHCARDS[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % FLASHCARDS.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel p-6 relative flex flex-col justify-between min-h-[480px]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-gray-100">
              The 5 Pillars of Prompt Engineering (Flashcards)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
          <span>Card {currentIndex + 1} of {FLASHCARDS.length}</span>
          <div className="flex gap-1.5">
            {FLASHCARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIsFlipped(false); setCurrentIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-6 bg-violet-400' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-violet-300 font-semibold">{currentCard.badge}</span>
        </div>

        {/* Interactive Flip Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full flex-1 rounded-2xl p-6 border border-violet-500/30 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
            isFlipped
              ? 'bg-slate-900/90 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
              : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 shadow-xl shadow-violet-500/10 hover:border-violet-500/60'
          }`}
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ backgroundColor: `${currentCard.pillar.color}20`, color: currentCard.pillar.color }}
            >
              {currentCard.pillar.title}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-violet-400" />
              Click card to flip ({isFlipped ? 'Showing Back' : 'Showing Front'})
            </span>
          </div>

          {/* Card Content (Front / Back) */}
          {!isFlipped ? (
            <div className="space-y-3 my-auto">
              <h3 className="text-xl font-bold text-white font-heading">
                {currentCard.frontTitle}
              </h3>
              <p className="text-sm font-medium text-violet-300">
                {currentCard.frontSubtitle}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed pt-2 border-t border-white/5">
                {currentCard.frontContent}
              </p>
            </div>
          ) : (
            <div className="space-y-3 my-auto">
              <h3 className="text-lg font-bold text-emerald-400 font-heading">
                {currentCard.backTitle}
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300">
                  {currentCard.examplesBad}
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 leading-relaxed">
                  {currentCard.examplesGood}
                </div>
              </div>
              <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-medium">
                {currentCard.proTip}
              </p>
            </div>
          )}

          <div className="text-[11px] text-gray-400 text-center pt-2">
            💡 Flip card to see real-world prompt examples & pro tips
          </div>
        </div>

        {/* Card Navigation Controls */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handlePrev}
            className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn-secondary py-2 px-4 text-xs flex items-center gap-1 text-violet-300 border-violet-500/30"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Flip Card</span>
          </button>

          <button
            onClick={handleNext}
            className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <span>Next Pillar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
