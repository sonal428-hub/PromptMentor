import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import PresetPrompts from './components/PresetPrompts';
import PromptEditor from './components/PromptEditor';
import AIGradeScore from './components/AIGradeScore';
import PromptDiffComparison from './components/PromptDiffComparison';
import OutputComparison from './components/OutputComparison';
import EducationalFlashcards from './components/EducationalFlashcards';
import ApiKeyModal from './components/ApiKeyModal';
import { analyzePrompt } from './utils/promptAnalyzer';
import { generateLLMResponse } from './utils/geminiApi';
import confetti from 'canvas-confetti';

export default function App() {
  const [userPrompt, setUserPrompt] = useState('help me fix my code error');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  const [activePreset, setActivePreset] = useState(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [enhancedOutput, setEnhancedOutput] = useState('');

  const analysis = useMemo(() => {
    return analyzePrompt(userPrompt);
  }, [userPrompt]);

  useEffect(() => {
    if (analysis.overallScore === 100) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [analysis.overallScore]);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset);
    setUserPrompt(preset.prompt);
    setRawOutput('');
    setEnhancedOutput('');
  };

  const handleApplySuggestedPrompt = () => {
    if (analysis.suggestedPrompt) {
      setUserPrompt(analysis.suggestedPrompt);
    }
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // Run Dual LLM Output Comparison
  const handleRunComparison = async () => {
    if (!userPrompt.trim()) return;
    setIsExecuting(true);

    const mockRaw = activePreset?.prompt === userPrompt ? activePreset.mockRawResponse : '';
    const mockEnhanced = activePreset?.prompt === userPrompt ? activePreset.mockEnhancedResponse : '';

    try {
      const [resRaw, resEnhanced] = await Promise.all([
        generateLLMResponse({
          prompt: userPrompt,
          apiKey,
          isEnhanced: false,
          mockFallback: mockRaw
        }),
        generateLLMResponse({
          prompt: analysis.suggestedPrompt || userPrompt,
          apiKey,
          isEnhanced: true,
          mockFallback: mockEnhanced
        })
      ]);

      setRawOutput(resRaw);
      setEnhancedOutput(resEnhanced);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-100 selection:bg-violet-500 selection:text-white">
      {/* Top Header */}
      <Header
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col justify-between">
        <div>
          {/* Quick Presets row */}
          <PresetPrompts onSelectPreset={handleSelectPreset} />

          {/* 3-Column Core Workbench (Modules 2, 3, 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
            {/* Module 2: Prompt Editor Space & Progressive Disclosure */}
            <div className="lg:col-span-1">
              <PromptEditor
                userPrompt={userPrompt}
                onChangePrompt={setUserPrompt}
                analysis={analysis}
                onRunComparison={handleRunComparison}
                isExecuting={isExecuting}
              />
            </div>

            {/* Module 3: AI Grade Score Gauge */}
            <div className="lg:col-span-1">
              <AIGradeScore analysis={analysis} />
            </div>

            {/* Module 4: Suggestion Comparison & Diff Badges */}
            <div className="lg:col-span-1">
              <PromptDiffComparison
                analysis={analysis}
                onApplySuggestedPrompt={handleApplySuggestedPrompt}
                onOpenFlashcards={() => setIsFlashcardsOpen(true)}
              />
            </div>
          </div>

          {/* Module 1: Prompt's Actual Output Dual Workbench */}
          <OutputComparison
            rawOutput={rawOutput}
            enhancedOutput={enhancedOutput}
            isExecuting={isExecuting}
            userPrompt={userPrompt}
            suggestedPrompt={analysis.suggestedPrompt}
            onRunComparison={handleRunComparison}
          />
        </div>

        {/* Footer */}
        <footer className="w-full mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-300">PromptMentor</span>
            <span>• PS05 Collaborative Prompting Hackathon Edition</span>
          </div>
          <p className="text-gray-400">Designed to educate users through real-time feedback & progressive disclosure.</p>
        </footer>
      </main>

      {/* Modals */}
      <EducationalFlashcards
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
