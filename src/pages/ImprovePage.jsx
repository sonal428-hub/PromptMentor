import React, { useState, useEffect } from 'react';
import { Award, Sparkles, CheckCircle2, XCircle, FileText, ArrowRight, Zap } from 'lucide-react';
import ScoreRightPanel from '../components/ScoreRightPanel';
import PromptModal from '../components/PromptModal';
import PresetPrompts from '../components/PresetPrompts';
import { PromptInputBox } from '../components/ui/ai-prompt-box';
import { analyzePrompt, PROMPT_PILLARS } from '../utils/promptAnalyzer';
import { evaluateAiScore } from '../utils/geminiApi';

export default function ImprovePage({
  userPrompt,
  setUserPrompt,
  coaxResult,
  isCoaxing,
  coaxError,
  onCoax,
  onUseSuggestedPrompt,
  onDismiss,
  comparisonResult,
  isComparing,
  compareError,
  onCompare,
  apiKey
}) {
  // State for debounced real AI Score card
  const [aiScoreResult, setAiScoreResult] = useState(null);
  const [isAiScoreLoading, setIsAiScoreLoading] = useState(false);
  const [aiScoreError, setAiScoreError] = useState('');

  // Modal dialog states: 'suggested' | 'evaluation' | null
  const [modalType, setModalType] = useState(null);

  // Real-time client-side heuristic evaluation on every keystroke
  const heuristic = analyzePrompt(userPrompt);

  // Active AI rewritten prompt from Gemini API or coaxResult
  const activeSuggestedPrompt = aiScoreResult?.finalPrompt || coaxResult?.finalPrompt || '';

  // Checklist items (3 per line in 3-column grid)
  const checklistItems = [
    { label: 'Role/Persona', pass: heuristic.statusFlags.hasPersona },
    { label: 'Good Context', pass: heuristic.statusFlags.hasContext },
    { label: 'Specific Details', pass: heuristic.statusFlags.hasSpecificity },
    { label: 'Has Constraints', pass: heuristic.statusFlags.hasConstraints },
    { label: 'Output Format', pass: heuristic.statusFlags.hasFormat },
    { label: 'Clear Intent', pass: heuristic.wordCount >= 3 }
  ];

  // Dynamic coach advice
  const dynamicCoachAdvice = aiScoreResult?.explanation || (() => {
    const missing = Object.values(PROMPT_PILLARS).filter(
      p => !heuristic.statusFlags[`has${p.id.charAt(0).toUpperCase() + p.id.slice(1)}`]
    );
    if (missing.length === 0) {
      return "Excellent prompt! You've included clear role framing, context, constraints, and output structure.";
    }
    return `To improve quality, consider specifying ${missing.map(p => p.title).join(' and ')}.`;
  })();

  // Debounced real AI score calculation
  useEffect(() => {
    if (!userPrompt || !userPrompt.trim()) {
      setAiScoreResult(null);
      setIsAiScoreLoading(false);
      return;
    }

    setIsAiScoreLoading(true);
    let isAborted = false;

    const timer = setTimeout(async () => {
      try {
        const res = await evaluateAiScore(userPrompt, apiKey);
        if (!isAborted) {
          setAiScoreResult(res);
          setAiScoreError('');
        }
      } catch (err) {
        if (!isAborted) {
          setAiScoreError(err.message || 'AI Score calculation failed');
        }
      } finally {
        if (!isAborted) {
          setIsAiScoreLoading(false);
        }
      }
    }, 2000);

    return () => {
      isAborted = true;
      clearTimeout(timer);
    };
  }, [userPrompt, apiKey]);

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const getModalData = () => {
    if (modalType === 'suggested') {
      return {
        finalPrompt: activeSuggestedPrompt || (userPrompt ? `Act as an expert specialist. ${userPrompt}. Format response with 1) Executive Summary, 2) Core Action Items, and 3) Next Steps.` : '')
      };
    }
    if (modalType === 'evaluation') {
      return {
        score: aiScoreResult?.score ?? (heuristic.overallScore),
        coachAdvice: dynamicCoachAdvice,
        tags: aiScoreResult?.tags || checklistItems.map(i => ({ label: i.label, status: i.pass ? 'pass' : 'fail' })),
        explanation: aiScoreResult?.explanation || dynamicCoachAdvice
      };
    }
    return null;
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Top Centered Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-md">
            Prompt Improvement
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-sans opacity-90">
            Realtime score analysis, 6-pillar engineering checklist, live AI coach advice & dual LLM evaluation
          </p>
        </div>

        {/* Big Main Box Divided into 2 Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 glass-panel p-6 border-violet-500/20 shadow-2xl rounded-3xl bg-slate-900/50 backdrop-blur-xl">
          
          {/* SECTION 1: Realtime Score (Heuristic Score) */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-100 font-heading">Realtime Score</h2>
                    <p className="text-xs text-gray-400">Live client-side prompt analysis</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-violet-300 bg-violet-500/10 px-3 py-1 rounded-xl border border-violet-500/20">
                  {(heuristic.overallScore / 10).toFixed(1)} / 10
                </span>
              </div>

              {/* Horizontal Score Meter */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-white/5 shadow-inner">
                <div className="flex justify-between text-xs text-gray-300 font-medium">
                  <span className="font-semibold text-slate-200">Score Progress Bar</span>
                  <span className="font-mono font-bold text-violet-400">{heuristic.overallScore}%</span>
                </div>
                <div className="w-full h-4 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 shadow-md"
                    style={{ width: `${heuristic.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Concept & Engineering Checklist (Horizontal, 3 points per line) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-heading">
                    Concept & Engineering Checklist
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    {checklistItems.filter(i => i.pass).length} / 6 Met
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        item.pass
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {item.pass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Coach's Advice with 2 Popup Buttons at Bottom */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-violet-500/20 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                  Live Coach Advice
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed min-h-[40px]">
                  {dynamicCoachAdvice}
                </p>

                {/* Two Action Buttons near the ending */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-white/5">
                  <button
                    onClick={() => openModal('suggested')}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Suggested Prompt
                  </button>
                  <button
                    onClick={() => openModal('evaluation')}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-gray-200 text-xs font-bold transition-all active:scale-95"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Prompt Evaluation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: AI Score Section */}
          <div className="space-y-5 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 pt-6 lg:pt-0">
            <ScoreRightPanel
              coaxResult={coaxResult}
              isCoaxing={isCoaxing}
              comparisonResult={comparisonResult}
              isComparing={isComparing}
              compareError={compareError}
              onCompare={onCompare}
              aiScoreResult={aiScoreResult}
              isAiScoreLoading={isAiScoreLoading}
              aiScoreError={aiScoreError}
            />
          </div>

        </div>

        {/* Preset Prompts Selector */}
        <div className="max-w-4xl mx-auto">
          <PresetPrompts onSelectPreset={(text) => setUserPrompt(text)} />
        </div>

        {/* Bottom AI Prompt Input Search Box */}
        <div className="max-w-4xl mx-auto w-full pt-2">
          <PromptInputBox
            value={userPrompt}
            onValueChange={setUserPrompt}
            onSend={() => {
              if (onCoax) onCoax();
            }}
            isLoading={isCoaxing}
            placeholder="Type or paste your prompt here to coach & optimize..."
          />
        </div>

      </div>

      {/* Popup Dialog Window */}
      <PromptModal
        isOpen={!!modalType}
        onClose={closeModal}
        type={modalType}
        data={getModalData()}
        userPrompt={userPrompt}
        onUseSuggestedPrompt={onUseSuggestedPrompt}
      />
    </div>
  );
}
