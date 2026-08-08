import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';
import PenguinMascot from './PenguinMascot';

/**
 * Global Penguin Mascot component that persists across all pages at fixed top-20 right-6 position.
 * Clicking opens the Penguin Mentor FAQ Modal!
 */
export default function GlobalPenguinMascot({ coaxResult, isCoaxing, onOpenFaq }) {
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
    <div
      onClick={onOpenFaq}
      className="fixed top-16 right-4 sm:right-8 z-40 cursor-pointer group pointer-events-auto transition-all duration-300 hover:scale-110 active:scale-95"
      title="Click to view FAQs!"
    >
      {/* Floating Speech Bubble Tooltip */}
      <div className="absolute -top-7 right-0 opacity-90 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none">
        <div className="relative px-2.5 py-1 rounded-full bg-violet-600/90 text-white text-[11px] font-bold shadow-lg border border-violet-400/40 flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
          <HelpCircle className="w-3 h-3 text-violet-200 animate-bounce" />
          <span>Ask FAQs</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Mascot Circle */}
      <div
        id="penguin-container"
        className="relative bg-slate-900/60 backdrop-blur-md rounded-full p-2 border border-violet-500/30 shadow-xl shadow-violet-950/40 group-hover:border-violet-400 group-hover:shadow-violet-500/30 transition-all duration-300"
        style={{ width: 90, height: 95 }}
      >
        <PenguinMascot mode={penguinMode} />
      </div>
    </div>
  );
}
