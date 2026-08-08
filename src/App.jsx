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
import ScrollToTop from './components/ScrollToTop';
import GlobalPenguinMascot from './components/GlobalPenguinMascot';
import FaqModal from './components/FaqModal';
import ExtensionModal from './components/ExtensionModal';
import { coaxAnalyze, comparePromptOutputs } from './utils/geminiApi';

export default function App() {
  const [userPrompt, setUserPrompt] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);

  const [coaxResult, setCoaxResult] = useState(null);
  const [isCoaxing, setIsCoaxing] = useState(false);
  const [coaxError, setCoaxError] = useState('');

  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

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

  const handleUseSuggestedPrompt = (suggestedText) => {
    const textToUse = typeof suggestedText === 'string' ? suggestedText : coaxResult?.finalPrompt;
    if (textToUse) {
      setUserPrompt(textToUse);
    }
  };

  const handleDismiss = () => {
    setCoaxResult(null);
    setComparisonResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-100 selection:bg-violet-500 selection:text-white font-sans">
      <ScrollToTop />
      <GlobalPenguinMascot
        coaxResult={coaxResult}
        isCoaxing={isCoaxing}
        onOpenFaq={() => setIsFaqOpen(true)}
      />
      <Header
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenExtension={() => setIsExtensionOpen(true)}
      />

      <main className="flex-1 w-full overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage onOpenFaq={() => setIsFaqOpen(true)} />} />
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

      <footer className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-300">PromptMentor</span>
        </div>
        <p className="text-gray-400">Designed to educate users through real-time feedback & progressive disclosure.</p>
      </footer>

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

      <FaqModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
      />

      <ExtensionModal
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
      />
    </div>
  );
}
