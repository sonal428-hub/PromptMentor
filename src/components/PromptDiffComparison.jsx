import React from 'react';
import { Sparkles, ArrowRight, Check, Copy, BookOpen, Layers, Info } from 'lucide-react';
import { PROMPT_PILLARS } from '../utils/promptAnalyzer';

export default function PromptDiffComparison({
  analysis,
  onApplySuggestedPrompt,
  onOpenFlashcards
}) {
  const diffs = analysis?.diffs || [];
  const suggestedPrompt = analysis?.suggestedPrompt || '';
  const addedKeywords = analysis?.addedKeywords || [];
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!suggestedPrompt) return;
    navigator.clipboard.writeText(suggestedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel-glow p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gradient">3. AI Suggested Refined Prompt</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!suggestedPrompt}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onApplySuggestedPrompt}
              disabled={!suggestedPrompt}
              className="btn-primary py-1.5 px-3 text-xs disabled:opacity-50"
            >
              <span>Apply to Editor</span>
            </button>
          </div>
        </div>

        {/* Inline Color-Coded Diff View */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-violet-500/30 mb-4 min-h-[160px] leading-relaxed text-sm font-sans">
          {diffs.length === 0 ? (
            <p className="text-gray-500 italic">Enter a prompt above to see AI suggested keyword additions and diffs...</p>
          ) : (
            <div>
              {diffs.map((chunk, idx) => {
                if (chunk.added) {
                  const pillarObj = PROMPT_PILLARS[chunk.pillar?.toUpperCase()] || {};
                  return (
                    <span
                      key={idx}
                      className="diff-added group relative cursor-pointer"
                      onClick={onOpenFlashcards}
                      title={`Click to learn why adding ${pillarObj.title || 'this'} improves LLM response.`}
                    >
                      <span>{chunk.text}</span>
                      <span className="text-[9px] uppercase tracking-wider ml-1 font-bold opacity-75">
                        [{chunk.label || '+ Addition'}]
                      </span>
                    </span>
                  );
                }
                return <span key={idx} className="text-gray-200">{chunk.text}</span>;
              })}
            </div>
          )}
        </div>

        {/* Added Keyword Explanations & Flashcard Badges */}
        {addedKeywords.length > 0 && (
          <div className="space-y-2 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Why These Keyword Additions Improve Your Output
              </span>
              <button
                onClick={onOpenFlashcards}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Educational Flashcards</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {addedKeywords.map((item, idx) => {
                const pillar = PROMPT_PILLARS[item.pillar?.toUpperCase()] || {};
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/70 border border-white/5 text-xs flex items-start gap-2"
                  >
                    <Info className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-violet-300">{pillar.title || 'Keyword'}: </span>
                      <span className="text-gray-300">{item.explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <span>Click any glowing highlighted text to open educational deep-dive cards.</span>
      </div>
    </div>
  );
}
