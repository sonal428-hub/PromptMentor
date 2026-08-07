import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ImprovePage from './pages/ImprovePage';
import LearnPage from './pages/LearnPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProgressPage from './pages/ProgressPage';
import EducationalFlashcards from './components/EducationalFlashcards';
import ApiKeyModal from './components/ApiKeyModal';

import { coaxAnalyze, comparePromptOutputs } from './utils/geminiApi';

export default function App() {
  const [userPrompt, setUserPrompt] = useState('Write a concise email requesting project feedback from my team.');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  // API Call 1 state (Coaxing)
  const [coaxResult, setCoaxResult] = useState(null);
  const [isCoaxing, setIsCoaxing] = useState(false);
  const [coaxError, setCoaxError] = useState('');

  // API Call 2 state (Comparison)
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // Coax button handler (API Call 1)
  const handleCoax = async () => {
    if (!userPrompt.trim()) return;
    setIsCoaxing(true);
    setCoaxError('');
    setCoaxResult(null);
    setComparisonResult(null);

    try {
      const res = await coaxAnalyze(userPrompt, apiKey);
      setCoaxResult(res);
    } catch (err) {
      setCoaxError(err.message || 'Analysis failed. Please check your Gemini API key.');
      console.error('Coax API call failed:', err);
    } finally {
      setIsCoaxing(false);
    }
  };

  // Dual LLM comparison handler (API Call 2)
  const handleCompare = async () => {
    if (!coaxResult?.finalPrompt) return;
    setIsComparing(true);
    setCompareError('');

    try {
      const res = await comparePromptOutputs(coaxResult.originalPrompt, coaxResult.finalPrompt, apiKey);
      setComparisonResult(res);
    } catch (err) {
      setCompareError(err.message || 'Output comparison failed.');
      console.error('Compare API call failed:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const handleUseSuggestedPrompt = () => {
    if (coaxResult?.finalPrompt) {
      setUserPrompt(coaxResult.finalPrompt);
    }
  };

  const handleDismiss = () => {
    setCoaxResult(null);
    setComparisonResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-100 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Top Header */}
      <Header
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
      />

      {/* Main Page Routes */}
      <main className="flex-1 w-full overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/improve"
            element={
              <ImprovePage
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                coaxResult={coaxResult}
                isCoaxing={isCoaxing}
                coaxError={coaxError}
                onCoax={handleCoax}
                onUseSuggestedPrompt={handleUseSuggestedPrompt}
                onDismiss={handleDismiss}
                comparisonResult={comparisonResult}
                isComparing={isComparing}
                compareError={compareError}
                onCompare={handleCompare}
                apiKey={apiKey}
              />
            }
          />
          <Route path="/learn" element={<LearnPage onOpenFlashcards={() => setIsFlashcardsOpen(true)} />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/progress" element={<ProgressPage coaxResult={coaxResult} />} />
          <Route
            path="*"
            element={
              <ImprovePage
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                coaxResult={coaxResult}
                isCoaxing={isCoaxing}
                coaxError={coaxError}
                onCoax={handleCoax}
                onUseSuggestedPrompt={handleUseSuggestedPrompt}
                onDismiss={handleDismiss}
                comparisonResult={comparisonResult}
                isComparing={isComparing}
                compareError={compareError}
                onCompare={handleCompare}
                apiKey={apiKey}
              />
            }
          />
        </Routes>
      </main>

      {/* Global Modals */}
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
