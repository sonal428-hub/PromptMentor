import React, { useState, useEffect } from 'react';
import ResizablePanel from '../components/ResizablePanel';
import PromptCoachingLeftPanel from '../components/PromptCoachingLeftPanel';
import ScoreRightPanel from '../components/ScoreRightPanel';
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
  // State for debounced real AI Score card (right panel & left advice)
  const [aiScoreResult, setAiScoreResult] = useState(null);
  const [isAiScoreLoading, setIsAiScoreLoading] = useState(false);
  const [aiScoreError, setAiScoreError] = useState('');

  /**
   * [DEBOUNCED REAL AI SCORE TRIGGER]
   * Fires Gemini API evaluation call 2 seconds after the user stops typing.
   * Cancels timer & aborts stale in-flight requests if user continues typing.
   */
  useEffect(() => {
    if (!userPrompt || !userPrompt.trim()) {
      setAiScoreResult(null);
      setIsAiScoreLoading(false);
      return;
    }

    setIsAiScoreLoading(true);
    let isAborted = false;

    // 2000ms (2 seconds) debounce timer
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

  return (
    <div className="w-full h-[calc(100vh-60px)] overflow-hidden bg-slate-950">
      <ResizablePanel
        initialLeftWidth={52}
        leftChild={
          <PromptCoachingLeftPanel
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            coaxResult={coaxResult}
            isCoaxing={isCoaxing}
            coaxError={coaxError}
            onCoax={onCoax}
            onUseSuggestedPrompt={onUseSuggestedPrompt}
            onDismiss={onDismiss}
            apiKey={apiKey}
            aiScoreResult={aiScoreResult}
            isAiScoreLoading={isAiScoreLoading}
          />
        }
        rightChild={
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
        }
      />
    </div>
  );
}
