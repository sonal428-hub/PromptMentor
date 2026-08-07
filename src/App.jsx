import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ApiKeyModal from './components/ApiKeyModal';
import EducationalFlashcards from './components/EducationalFlashcards';

import HomePage from './pages/HomePage';
import ImprovePage from './pages/ImprovePage';
import LearnPage from './pages/LearnPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProgressPage from './pages/ProgressPage';

import { coaxAnalyze, comparePromptOutputs, getEffectiveApiKey } from './utils/geminiApi';

export default function App() {
  // ── Global State ──
  const [userPrompt, setUserPrompt] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  // ── Modals State ──
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  // ── API Call 1: Coax Analysis ──
  const [coaxResult, setCoaxResult] = useState(null);
  const [isCoaxing, setIsCoaxing] = useState(false);
  const [coaxError, setCoaxError] = useState('');

  // ── API Call 2: Comparison ──
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  // Save API key
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Coax Handler (API Call 1)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleCoax = async () => {
    if (!userPrompt.trim()) return;

    setIsCoaxing(true);
    setCoaxError('');
    setCoaxResult(null);
    setComparisonResult(null);

    try {
      const result = await coaxAnalyze(userPrompt, apiKey);
      setCoaxResult(result);
    } catch (err) {
      setCoaxError(err.message || 'Analysis failed. Please check your API key.');
      console.error('Coax API call failed:', err);
    } finally {
      setIsCoaxing(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Compare Handler (API Call 2)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleCompare = async () => {
    if (!coaxResult?.finalPrompt) return;

    setIsComparing(true);
    setCompareError('');

    try {
      const result = await comparePromptOutputs(
        coaxResult.originalPrompt,
        coaxResult.finalPrompt,
        apiKey
      );
      setComparisonResult(result);
    } catch (err) {
      setCompareError(err.message || 'Comparison failed.');
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
    <Router>
      <div className="min-h-screen bg-slate-950 text-gray-100 font-sans flex flex-col selection:bg-violet-500 selection:text-white">
        {/* Navigation Header */}
        <Header
          apiKey={apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        />

        {/* Page Content Routes */}
        <main className="flex-1">
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
            <Route
              path="/learn"
              element={<LearnPage onOpenFlashcards={() => setIsFlashcardsOpen(true)} />}
            />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/progress" element={<ProgressPage coaxResult={coaxResult} />} />
          </Routes>
        </main>

        {/* Global Modals */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
        />

        <EducationalFlashcards
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
        />
      </div>
    </Router>
  );
}
