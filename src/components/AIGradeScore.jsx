import React from 'react';
import { Award, ShieldAlert, UserCheck, Layers, Target, Layout, HelpCircle } from 'lucide-react';
import { PROMPT_PILLARS } from '../utils/promptAnalyzer';

export default function AIGradeScore({ analysis }) {
  const score = analysis?.overallScore || 0;
  const tier = analysis?.tier || { label: 'Awaiting Input', color: '#9ca3af', badge: 'Empty' };
  const scores = analysis?.scores || { persona: 0, context: 0, specificity: 0, constraints: 0, format: 0 };

  // Calculate stroke circumference for radial meter (r=36)
  const strokeDashoffset = 226 - (226 * score) / 100;

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-100">2. AI Grade Score</h2>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold border"
            style={{
              backgroundColor: `${tier.color}15`,
              borderColor: `${tier.color}40`,
              color: tier.color
            }}
          >
            {tier.badge}
          </span>
        </div>

        <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-950/60 border border-white/5 mb-5">
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-24 h-24 meter-svg" viewBox="0 0 80 80">
              <circle
                className="meter-circle-bg"
                cx="40"
                cy="40"
                r="36"
                strokeWidth="6"
                fill="none"
              />
              <circle
                className="meter-circle-val"
                cx="40"
                cy="40"
                r="36"
                strokeWidth="6"
                fill="none"
                stroke={tier.color}
                strokeDasharray="226"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold font-heading text-white tracking-tight">
                {score}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">/ 100</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-200">{tier.label}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {score >= 85
                ? 'Excellent work! Your prompt contains clear boundaries, format rules, and role context.'
                : score >= 60
                ? 'Good foundation. Adding missing constraints and output structure will optimize results.'
                : 'Basic prompt detected. LLMs will rely heavily on assumptions without more detail.'}
            </p>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            5-Pillar Score Breakdown
          </h4>

          {Object.entries(PROMPT_PILLARS).map(([key, pillar]) => {
            const val = scores[pillar.id] || 0;
            return (
              <div key={pillar.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    ></span>
                    {pillar.title}
                  </span>
                  <span className="font-mono text-gray-400 font-semibold">{val}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${val}%`,
                      backgroundColor: pillar.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
          Scoring weighted for clarity & LLM execution accuracy
        </span>
      </div>
    </div>
  );
}
