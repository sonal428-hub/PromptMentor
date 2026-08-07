import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProgressPage from './pages/ProgressPage';
import EducationalFlashcards from './components/EducationalFlashcards';
import ApiKeyModal from './components/ApiKeyModal';

// Workbench components
import PresetPrompts from './components/PresetPrompts';
import PromptEditor from './components/PromptEditor';
import AIGradeScore from './components/AIGradeScore';
import PromptDiffComparison from './components/PromptDiffComparison';
import OutputComparison from './components/OutputComparison';

import { analyzePrompt } from './utils/promptAnalyzer';
import { coaxAnalyze, comparePromptOutputs, generateLLMResponse } from './utils/geminiApi';

export default function App() {
  const [userPrompt, setUserPrompt] = useState('help me fix my code error');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  const [activePreset, setActivePreset] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [enhancedOutput, setEnhancedOutput] = useState('');

  // API Call 1 state
  const [coaxResult, setCoaxResult] = useState(null);
  const [isCoaxing, setIsCoaxing] = useState(false);
  const [coaxError, setCoaxError] = useState('');

  // API Call 2 state
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  const analysis = React.useMemo(() => {
    return analyzePrompt(userPrompt);
  }, [userPrompt]);

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

  // Coax button handler (API Call 1)
  const handleCoax = async () => {
    if (!userPrompt.trim()) return;
    setIsCoaxing(true);
    setCoaxError('');

    try {
      const res = await coaxAnalyze(userPrompt, apiKey);
      setCoaxResult(res);
    } catch (err) {
      setCoaxError(err.message);
    } finally {
      setIsCoaxing(false);
    }
  };

  // Dual LLM comparison handler (API Call 2)
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

  const handleCompare = async () => {
    if (!coaxResult?.finalPrompt) return;
    setIsComparing(true);
    setCompareError('');

    try {
      const res = await comparePromptOutputs(coaxResult.originalPrompt, coaxResult.finalPrompt, apiKey);
      setComparisonResult(res);
    } catch (err) {
      setCompareError(err.message);
    } finally {
      setIsComparing(false);
    }
  };

  // Workbench view component
  const WorkbenchView = (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col justify-between">
      <div>
        <PresetPrompts onSelectPreset={handleSelectPreset} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
          <div className="lg:col-span-1">
            <PromptEditor
              userPrompt={userPrompt}
              onChangePrompt={setUserPrompt}
              analysis={analysis}
              onRunComparison={handleRunComparison}
              isExecuting={isExecuting}
            />
          </div>

          <div className="lg:col-span-1">
            <AIGradeScore analysis={analysis} />
          </div>

          <div className="lg:col-span-1">
            <PromptDiffComparison
              analysis={analysis}
              onApplySuggestedPrompt={handleApplySuggestedPrompt}
              onOpenFlashcards={() => setIsFlashcardsOpen(true)}
            />
          </div>
        </div>

        <OutputComparison
          rawOutput={rawOutput}
          enhancedOutput={enhancedOutput}
          isExecuting={isExecuting}
          userPrompt={userPrompt}
          suggestedPrompt={analysis.suggestedPrompt}
          onRunComparison={handleRunComparison}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-100 selection:bg-violet-500 selection:text-white">
      {/* Top Header */}
      <Header
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
      />

      {/* Page Routes */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/improve" element={WorkbenchView} />
          <Route path="/learn" element={<LearnPage onOpenFlashcards={() => setIsFlashcardsOpen(true)} />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/progress" element={<ProgressPage coaxResult={coaxResult} />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-300">PromptMentor</span>
          <span>• PS05 Collaborative Prompting</span>
        </div>
        <p className="text-gray-400">Designed to educate users through real-time feedback & progressive disclosure.</p>
      </footer>

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
