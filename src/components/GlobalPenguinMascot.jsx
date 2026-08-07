import React, { useState, useEffect, useRef, useCallback } from 'react';
import PenguinMascot from './PenguinMascot';

/**
 * Global Penguin Mascot component that persists across all pages at fixed top-20 right-8 position.
 * Uses z-30 so that modals (ApiKeyModal, EducationalFlashcards, etc. at z-50) render over it.
 */
export default function GlobalPenguinMascot({ coaxResult, isCoaxing }) {
  const [penguinMode, setPenguinMode] = useState('idle');

  const displayScore = coaxResult?.score ?? 0;
  const prevScoreRef = useRef(undefined);
  const timersRef = useRef([]);

  // ─── Timer helpers ───
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  }, []);

  // Idle → 4 s gap → Wave 2 s → repeat
  const startWaveCycle = useCallback(() => {
    clearAllTimers();
    const scheduleWave = () => {
      const idleTimer = setTimeout(() => {
        setPenguinMode('wave');
        const waveTimer = setTimeout(() => {
          setPenguinMode('idle');
          scheduleWave();
        }, 2000);
        timersRef.current.push(waveTimer);
      }, 4000);
      timersRef.current.push(idleTimer);
    };
    scheduleWave();
  }, [clearAllTimers]);

  // Start the idle + wave cycle on mount
  useEffect(() => {
    startWaveCycle();
    return clearAllTimers;
  }, [startWaveCycle, clearAllTimers]);

  // React to score changes: happy (≥60) or sad (<60) for 3 s, then resume wave cycle
  useEffect(() => {
    if (isCoaxing) {
      clearAllTimers();
      setPenguinMode('idle');
      startWaveCycle();
      return;
    }

    if (displayScore > 0 && displayScore !== prevScoreRef.current) {
      clearAllTimers();
      setPenguinMode(displayScore >= 60 ? 'happy' : 'sad');

      const reactionTimer = setTimeout(() => {
        setPenguinMode('idle');
        startWaveCycle();
      }, 3000);
      timersRef.current.push(reactionTimer);

      prevScoreRef.current = displayScore;
    }
  }, [displayScore, isCoaxing, clearAllTimers, startWaveCycle]);

  return (
    <div className="fixed top-20 right-8 z-30 pointer-events-auto transition-transform duration-300 hover:scale-115 hover:-translate-y-1">
      <div
        id="penguin-container"
        className="bg-transparent"
        style={{ width: 100, height: 110 }}
      >
        <PenguinMascot mode={penguinMode} />
      </div>
    </div>
  );
}
