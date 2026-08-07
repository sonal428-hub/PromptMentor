import React from 'react';
import ResizablePanel from '../components/ResizablePanel';
import PromptCoachingLeftPanel from '../components/PromptCoachingLeftPanel';
import ScoreRightPanel from '../components/ScoreRightPanel';

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
          />
        }
      />
    </div>
  );
}
