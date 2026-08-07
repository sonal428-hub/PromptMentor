import React, { useState } from 'react';
import { coaxAnalyze, comparePromptOutputs } from './utils/geminiApi';

/**
 * App.jsx — State management & API call wiring ONLY.
 * UI team: replace the JSX below with your actual components.
 * 
 * STATE SHAPE (all populated by API calls):
 * 
 *   coaxResult: {                    ← from API Call 1 (coaxAnalyze)
 *     score: 7.2,                    ← Heuristic Quality Score (0-10)
 *     grade: "B+",                   ← Overall Grade 
 *     tags: [                        ← Diagnostic tags
 *       { label: "Clear Intent", status: "pass" },
 *       { label: "Missing Constraints", status: "fail" }
 *     ],
 *     coachAdvice: "...",            ← Live Coach Advise text
 *     finalPrompt: "...",           ← Auto-generated improved prompt
 *     originalPrompt: "..."         ← User's original prompt (echoed)
 *   }
 * 
 *   comparisonResult: {              ← from API Call 3 (comparePromptOutputs)
 *     originalOutput: "...",         ← Gemini's response to original prompt
 *     finalOutput: "..."            ← Gemini's response to final/improved prompt
 *   }
 */
export default function App() {
  // ── User input ──
  const [userPrompt, setUserPrompt] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  // ── API Call 1+2 result (Coax button) ──
  const [coaxResult, setCoaxResult] = useState(null);
  const [isCoaxing, setIsCoaxing] = useState(false);
  const [coaxError, setCoaxError] = useState('');

  // ── API Call 3 result (Comparison) ──
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  // ── Save API key to localStorage ──
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // API CALL 1+2: "Coax" button handler
  // Sends user prompt → Gemini returns score, grade, tags, coach advice, final prompt
  // ═══════════════════════════════════════════════════════════════════════════
  const handleCoax = async () => {
    if (!userPrompt.trim()) return;

    setIsCoaxing(true);
    setCoaxError('');
    setCoaxResult(null);
    setComparisonResult(null); // Reset comparison when re-coaxing

    try {
      const result = await coaxAnalyze(userPrompt, apiKey);
      setCoaxResult(result);
      // result contains: { score, grade, tags, coachAdvice, finalPrompt, originalPrompt }
    } catch (err) {
      setCoaxError(err.message);
      console.error('Coax API call failed:', err);
    } finally {
      setIsCoaxing(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // API CALL 3: Compare Original vs Final prompt outputs
  // Runs both prompts through Gemini and returns side-by-side LLM outputs
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
      // result contains: { originalOutput, finalOutput }
    } catch (err) {
      setCompareError(err.message);
      console.error('Compare API call failed:', err);
    } finally {
      setIsComparing(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // "Use Suggested Prompt" button — replaces user's input with the AI final prompt
  // ═══════════════════════════════════════════════════════════════════════════
  const handleUseSuggestedPrompt = () => {
    if (coaxResult?.finalPrompt) {
      setUserPrompt(coaxResult.finalPrompt);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // "Dismiss This Prompt" button — clears the coaching result
  // ═══════════════════════════════════════════════════════════════════════════
  const handleDismiss = () => {
    setCoaxResult(null);
    setComparisonResult(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MINIMAL WIRING UI (your UI team replaces this with the actual design)
  // Kept minimal so API logic is clear. Every piece of data is exposed below.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0a0f1e', color: '#e5e7eb', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>

      {/* ── API Key Setup ── */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => handleSaveApiKey(e.target.value)}
          placeholder="Paste your Gemini API key here..."
          style={{ flex: 1, maxWidth: 400, padding: '10px 14px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6', fontSize: 13 }}
        />
        <span style={{ fontSize: 12, color: apiKey ? '#34d399' : '#fbbf24' }}>
          {apiKey ? '● Key set' : '○ No key'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 1200 }}>

        {/* ════════════════════════════════════════════════════════════════════
            LEFT PANEL: Heuristic Quality Score + Tags + Analysis Area
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid #1e3a5f', borderRadius: 16, padding: 24 }}>

          {/* Heuristic Quality Score */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Heuristic Quality Score</div>
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8 }}>Evaluated against 12 custom LLM design constraints</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: '#f3f4f6' }}>
                {coaxResult ? coaxResult.score.toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>/ 10</span>
            </div>

            {/* Score Bar */}
            <div style={{ height: 8, borderRadius: 4, background: '#1f2937', marginTop: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: coaxResult ? `${coaxResult.score * 10}%` : '0%',
                background: 'linear-gradient(90deg, #ef4444, #f59e0b, #8b5cf6, #3b82f6)',
                borderRadius: 4,
                transition: 'width 0.6s ease'
              }} />
            </div>
          </div>

          {/* Diagnostic Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {coaxResult?.tags?.map((tag, i) => (
              <span key={i} style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${tag.status === 'pass' ? '#34d39960' : '#f87171'}`,
                color: tag.status === 'pass' ? '#6ee7b7' : '#fca5a5',
                background: tag.status === 'pass' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
              }}>
                {tag.status === 'pass' ? '✓' : '✗'} {tag.label}
              </span>
            ))}
            {!coaxResult && <span style={{ fontSize: 12, color: '#6b7280' }}>Tags appear after you click Coax</span>}
          </div>

          {/* Analysis Area (populated after Coax) */}
          <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
            {isCoaxing ? (
              <div>⏳ Analyzing your prompt with Gemini...</div>
            ) : coaxError ? (
              <div style={{ color: '#f87171' }}>❌ {coaxError}</div>
            ) : coaxResult ? (
              <div style={{ textAlign: 'left', color: '#d1d5db', width: '100%' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Prompt Analysis Complete</div>
                <p style={{ fontSize: 13 }}>Coach says: <em>{coaxResult.coachAdvice}</em></p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>☑️</div>
                <div>Your prompt analysis will appear here... Submit a draft using the console below to evaluate logical structure, persona integration, and output bounds.</div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              API CALL POINT 1: "Enter your prompt" + Coax Button
              ════════════════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, borderTop: '1px solid #1e293b', paddingTop: 16 }}>
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCoax()}
              placeholder="Enter your prompt here to get coaching feedback..."
              style={{ flex: 1, padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f3f4f6', fontSize: 13 }}
            />
            <button
              onClick={handleCoax}
              disabled={isCoaxing || !userPrompt.trim() || !apiKey}
              style={{
                padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isCoaxing ? '#4b5563' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                opacity: (!userPrompt.trim() || !apiKey) ? 0.5 : 1
              }}
            >
              {isCoaxing ? 'Analyzing...' : 'Coax ✓'}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT PANEL: Overall Grade + Live Coach Advise + Prompt Comparison
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Overall Grade (from API Call 1+2, same coaxAnalyze response) ── */}
          <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid #1e3a5f', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Overall Grade</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: coaxResult ? '#c084fc' : '#4b5563' }}>
                {coaxResult?.grade || '—'}
              </span>
              {coaxResult && (
                <span style={{
                  fontSize: 10, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6,
                  background: coaxResult.score >= 8 ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)',
                  color: coaxResult.score >= 8 ? '#6ee7b7' : '#fde68a',
                  border: `1px solid ${coaxResult.score >= 8 ? '#34d39950' : '#fbbf2450'}`,
                  fontWeight: 700
                }}>
                  {coaxResult.score >= 8 ? 'Excellent' : 'Optimization Req'}
                </span>
              )}
            </div>
          </div>

          {/* ── Live Coach Advise (from same API Call 1+2) ── */}
          <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid #1e3a5f', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Live Coach Advise</span>
            </div>
            <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6, marginBottom: 16 }}>
              {isCoaxing
                ? 'Waiting for Gemini analysis...'
                : coaxResult?.coachAdvice
                  || 'Waiting for user to enter prompt completely... Adding explicit behavioral negative constraints will push this score into the A range.'}
            </p>

            {/* Use Suggested / Dismiss buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleUseSuggestedPrompt}
                disabled={!coaxResult?.finalPrompt}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: coaxResult ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#374151',
                  color: 'white', fontWeight: 700, fontSize: 12,
                  opacity: coaxResult ? 1 : 0.5
                }}
              >
                Use Suggested Prompt
              </button>
              <button
                onClick={handleDismiss}
                disabled={!coaxResult}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', border: '1px solid #4b5563',
                  color: '#d1d5db', fontWeight: 600, fontSize: 12,
                  opacity: coaxResult ? 1 : 0.5
                }}
              >
                Dismiss This Prompt
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              API CALL POINT 3: Prompt Comparison (Original vs Final)
              ════════════════════════════════════════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>

            {/* Original Prompt */}
            <div style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e293b', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Original Prompt</div>
              <div style={{ flex: 1, fontSize: 12, color: '#9ca3af', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {coaxResult?.originalPrompt || 'Your original prompt will be shown here.'}
              </div>
            </div>

            {/* Final Prompt (Auto-Generated by API Call 1) */}
            <div style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #1e293b', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Final Prompt</span>
                {coaxResult && (
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: '#8b5cf620', color: '#c4b5fd', border: '1px solid #8b5cf640', fontWeight: 700, textTransform: 'uppercase' }}>
                    Auto-Gen
                  </span>
                )}
              </div>
              <div style={{ flex: 1, fontSize: 12, color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {coaxResult?.finalPrompt || 'The improved prompt will appear here.'}
              </div>
            </div>
          </div>

          {/* Compare Outputs Button (triggers API Call 3) */}
          {coaxResult && (
            <button
              onClick={handleCompare}
              disabled={isComparing}
              style={{
                padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isComparing ? '#4b5563' : 'linear-gradient(135deg, #10b981, #3b82f6)',
                color: 'white', fontWeight: 700, fontSize: 13, width: '100%'
              }}
            >
              {isComparing ? '⏳ Running both prompts through Gemini...' : '▶ Compare Live LLM Outputs (Original vs Final)'}
            </button>
          )}

          {/* Comparison Output (from API Call 3) */}
          {(comparisonResult || compareError) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #ef444440', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', marginBottom: 8 }}>Original Prompt Output</div>
                <div style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 300, overflowY: 'auto' }}>
                  {compareError ? `❌ ${compareError}` : comparisonResult?.originalOutput}
                </div>
              </div>
              <div style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid #34d39940', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7', marginBottom: 8 }}>Final Prompt Output ✨</div>
                <div style={{ fontSize: 12, color: '#d1d5db', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 300, overflowY: 'auto' }}>
                  {compareError ? `❌ ${compareError}` : comparisonResult?.finalOutput}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
