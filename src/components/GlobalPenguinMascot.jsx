import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';
import PenguinMascot from './PenguinMascot';

/**
 * Global Penguin Mascot component that persists across all pages at fixed top-16 right-6 position.
 * Handles AI reactions and displays the "FAQs & Help" badge. Clicking opens the FAQ Modal!
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
      className="fixed top-14 right-4 sm:right-8 z-40 cursor-pointer group pointer-events-auto transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center"
      title="Click for FAQs & Help!"
    >
      {/* "FAQs & Help" Tag directly on top of smaller penguin */}
      <div className="mb-1 transition-all duration-300 group-hover:-translate-y-0.5">
        <div className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-bold shadow-xl border border-violet-500/50 flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md group-hover:border-violet-400 group-hover:bg-violet-600 transition-all duration-300">
          <HelpCircle className="w-3.5 h-3.5 text-violet-300 group-hover:text-white animate-bounce" />
          <span>FAQs & Help 🐧</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Mascot Circle */}
      <div
        id="penguin-container"
        className="relative bg-slate-900/70 backdrop-blur-md rounded-full p-2 border border-violet-500/30 shadow-xl shadow-violet-950/50 group-hover:border-violet-400 group-hover:shadow-violet-500/30 transition-all duration-300"
        style={{ width: 90, height: 95 }}
      >
        <PenguinMascot mode={penguinMode} />
      </div>
    </div>
  );
}
