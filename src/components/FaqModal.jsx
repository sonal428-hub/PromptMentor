import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, HelpCircle, Sparkles, Award, Zap, Shield, BookOpen, Layers } from 'lucide-react';

export default function FaqModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0); // First item expanded by default

  const faqs = [
    {
      question: "What is PromptMentor and how does it work?",
      answer: "PromptMentor is an interactive AI prompt coaching platform. It analyzes your raw text prompts in real-time across 5 core engineering pillars, calculates an AI Quality Score (0–100), and provides live AI coach guidance along with a refined version of your prompt.",
      icon: Sparkles,
      color: "text-violet-400"
    },
    {
      question: "How is the AI Quality Score (0–100) calculated?",
      answer: "Your score is evaluated based on 5 structural pillars: Persona & Role (assigning an expert perspective), Context & Background (setting scenario/audience), Specificity & Detail (using target action verbs), Constraints & Boundaries (setting limits/rules), and Output Format (specifying tables, JSON, or lists).",
      icon: Award,
      color: "text-emerald-400"
    },
    {
      question: "Why should I refine my prompts before sending them to AI?",
      answer: "Unrefined prompts often lead to vague, generic, or hallucinated AI answers. Adding persona framing, precise context, and strict output constraints ensures AI models like Gemini, ChatGPT, and Claude produce highly accurate, actionable responses on the first try.",
      icon: Zap,
      color: "text-amber-400"
    },
    {
      question: "What is the Dual LLM Output Comparison feature?",
      answer: "The Dual LLM Compare tool runs your original prompt and the AI-enhanced prompt simultaneously. It renders both responses side-by-side along with an automated AI Quality Diff, demonstrating the exact improvements in clarity, formatting, and depth.",
      icon: Layers,
      color: "text-indigo-400"
    },
    {
      question: "What's the difference between Realtime Score and Submit AI Score?",
      answer: "Realtime Score gives instant client-side feedback as you type to highlight missing structural elements. When you click Send/Submit, a deep Gemini AI model evaluation calculates your official 0–100 score and custom coach advice.",
      icon: BookOpen,
      color: "text-cyan-400"
    },
    {
      question: "Is PromptMentor free and is my prompt data private?",
      answer: "Yes! PromptMentor is 100% free to use. All evaluation requests are processed directly via secure client-side API endpoints or your personal Gemini API key. Your prompts are never saved or shared with third parties.",
      icon: Shield,
      color: "text-pink-400"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
            className="relative w-full max-w-2xl bg-slate-900/95 border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-950/50 backdrop-blur-xl z-10 space-y-6 max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-400/30 flex items-center justify-center shadow-lg">
                  <span className="text-2xl select-none">🐧</span>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading text-white flex items-center gap-2">
                    Ask Penguin Mentor
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-sans font-bold">
                      FAQs
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Everything you need to know about PromptMentor</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
              />
            </div>

            {/* FAQ List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm font-medium">No matching questions found</p>
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const Icon = faq.icon;
                  const isOpen = openIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/5 bg-slate-950/50 overflow-hidden transition-colors hover:border-white/10"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                        className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${faq.color} shrink-0`} />
                          <span className="text-sm font-bold text-slate-200 font-heading">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                            isOpen ? 'rotate-180 text-violet-400' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-slate-900/30">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                Have more questions? Try refining your prompt in <strong className="text-violet-300 font-semibold">Prompt Improve</strong>!
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/20"
              >
                Got It, Thanks!
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
