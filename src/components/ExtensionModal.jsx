import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Puzzle, Download, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function ExtensionModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
            className="relative w-full max-w-2xl bg-slate-900/95 border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-950/50 backdrop-blur-xl z-10 space-y-6 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-400/40 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Puzzle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
                      Chrome Extension
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Use PromptMentor directly inside ChatGPT, Claude, and Gemini</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-violet-400" />
                    One-Click Refine
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hover the floating 💡 lightbulb icon to instantly rewrite and overwrite your prompt.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Domain-Specific AI
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automatically detects code, writing, business, or health prompts for tailored rewrites.
                  </p>
                </div>
              </div>

              {/* Step-by-Step Installation Guide */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-violet-500/20">
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Download className="w-4 h-4 text-violet-400" />
                  How to Install in Google Chrome
                </h3>

                <ol className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Locate Extension Folder:</strong> The extension is located inside the <code className="px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-mono">chrome-extension/</code> folder of this repository.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Open Chrome Extensions:</strong> Navigate to <code className="px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-mono">chrome://extensions</code> in your Google Chrome browser address bar.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Enable Developer Mode:</strong> Toggle the <strong className="text-violet-300">Developer mode</strong> switch in the top right corner of the Extensions page.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <strong className="text-white">Load Unpacked:</strong> Click <strong className="text-violet-300">"Load unpacked"</strong> and select the <code className="px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-mono">chrome-extension</code> folder.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-emerald-300">Ready to Go!</strong> Open ChatGPT, Claude, or Gemini — the floating 💡 PromptMentor icon will automatically attach to your prompt box!
                    </div>
                  </li>
                </ol>
              </div>

              {/* Supported Platforms */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Supported AI Platforms:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-white/10">ChatGPT</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-white/10">Claude</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-white/10">Gemini</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Private — Client-side & Gemini API powered</span>
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/25 active:scale-95"
              >
                Got It!
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
