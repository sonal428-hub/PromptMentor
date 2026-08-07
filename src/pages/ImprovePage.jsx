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
    if (modalType === 'compare') {
      return {
        comparisonResult,
        isComparing,
        onCompare
      };
    }
    return null;
  };

  return (
    <div className="h-[calc(100vh-65px)] bg-slate-950 p-3 sm:p-4 lg:p-5 flex flex-col justify-between overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-between">
        
        {/* Main Glass Dashboard Box - Scaled Up */}
        <div className="h-full flex-1 glass-panel p-4 sm:p-6 border-violet-500/20 shadow-2xl rounded-3xl bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between gap-5 overflow-hidden">
          
          {/* Top Grid: Left (Realtime Score) & Right (AI Score) - Completely Symmetrical */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0 overflow-hidden">
            
            {/* SECTION 1: Realtime Score (Left Side) */}
            <div className="space-y-3 flex flex-col justify-between h-full overflow-hidden">
              
              {/* Card 1: Realtime Score Meter */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-100 font-heading">Realtime Score</h2>
                      <p className="text-[11px] text-gray-400">Live client-side prompt analysis</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-violet-300 bg-violet-500/10 px-2.5 py-0.5 rounded-lg border border-violet-500/20">
                    {(heuristic.overallScore / 10).toFixed(1)} / 10
                  </span>
                </div>

                {/* Horizontal Score Progress Meter */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex justify-between text-xs text-gray-300 font-medium">
                    <span className="font-semibold text-slate-200">Score Progress</span>
                    <span className="font-mono font-bold text-violet-400">{heuristic.overallScore}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-950 border border-white/10 overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 shadow-md"
                      style={{ width: `${heuristic.overallScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Live Coach Advice with 2 Popup Buttons */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-violet-500/20 space-y-3 shadow-lg flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                    Live Coach Advice
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed min-h-[36px] line-clamp-2">
                    {dynamicCoachAdvice}
                  </p>
                </div>

                {/* Two Action Popup Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-white/5">
                  <button
                    onClick={() => openModal('suggested')}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Suggested Prompt
                  </button>
                  <button
                    onClick={() => openModal('evaluation')}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-gray-200 text-xs font-bold transition-all active:scale-95"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Prompt Evaluation
                  </button>
                </div>
              </div>

            </div>

            {/* SECTION 2: AI Score Section (Right Side) */}
            <div className="border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-5 pt-4 lg:pt-0 h-full overflow-hidden">
              <ScoreRightPanel
                userPrompt={userPrompt}
                coaxResult={coaxResult}
                isCoaxing={isCoaxing}
                comparisonResult={comparisonResult}
                isComparing={isComparing}
                compareError={compareError}
                onCompare={onCompare}
                aiScoreResult={aiScoreResult}
                isAiScoreLoading={isAiScoreLoading}
                aiScoreError={aiScoreError}
                onOpenCompareModal={() => openModal('compare')}
              />
            </div>

          </div>

          {/* Full-Width Textbox Section: Spanning Symmetrically Across BOTH Left & Right Sections */}
          <div className="w-full pt-3 border-t border-white/10 space-y-2.5">
            <PresetPrompts onSelectPreset={(text) => setUserPrompt(text)} />
            <PromptInputBox
              value={userPrompt}
              onValueChange={setUserPrompt}
              onSend={() => {
                if (onCoax) onCoax();
              }}
              isLoading={isCoaxing}
              placeholder="Type or paste your prompt here to coach & optimize..."
              className="w-full max-w-none shadow-xl shadow-violet-950/40"
            />
          </div>

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
