import React from 'react';
import { PRESET_PROMPTS } from '../utils/presetData';
import { Code, Dumbbell, Mail, Brain, Zap } from 'lucide-react';

const ICON_MAP = {
  Code,
  Dumbbell,
  Mail,
  Brain
};

export default function PresetPrompts({ onSelectPreset }) {
  return (
    <div className="w-full mb-6">
      {/* <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Quick Test Weak Prompts (Click to Refine & Compare)
          </h2>
        </div>
        <span className="text-xs text-gray-400 font-mono">Select any preset to run collaborative analysis</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRESET_PROMPTS.map((preset) => {
          const IconComp = ICON_MAP[preset.icon] || Zap;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="glass-panel p-3 text-left transition-all hover:scale-[1.02] hover:border-violet-500/40 group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 font-medium">
                  {preset.badge}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-200 group-hover:text-violet-300 transition-colors">
                  {preset.title}
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-mono">
                  "{preset.prompt}"
                </p>
              </div>
            </button>
          );
        })}
      </div> */}
    </div>
  );
}
