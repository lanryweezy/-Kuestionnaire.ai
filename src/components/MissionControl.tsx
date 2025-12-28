import React, { useState } from 'react';
import { ICONS } from '../constants';
import { useStore } from '../store/useStore';

interface MissionControlProps {
  onGenerate: (prompt: string) => Promise<void>;
  onManualCreate: () => void;
}

const MissionControl: React.FC<MissionControlProps> = ({ onGenerate, onManualCreate }) => {
  const [prompt, setPrompt] = useState('');
  const isLoading = useStore(state => state.isLoading);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="relative w-full max-w-2xl mx-auto group z-20">
        {/* Glowing gradient background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-500 blur-sm"></div>
        {/* Thin gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-60 group-hover:opacity-80 transition duration-500"></div>
        {/* Black inner area */}
        <div className="relative flex flex-col sm:flex-row items-center bg-black rounded-2xl p-2 m-0.5 gap-2">
          <ICONS.Sparkles className="w-5 h-5 text-purple-400 ml-2 sm:ml-3 animate-pulse flex-shrink-0" />
          <div className="flex-1 relative w-full">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Feedback form for a sci-fi convention..."
              className="w-full bg-transparent border-none text-white placeholder-slate-300 focus:ring-0 text-base md:text-lg px-3 md:px-4 py-2 md:py-3 pr-8"
              disabled={isLoading}
              maxLength={200}
            />
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                title="Clear"
              >
                <ICONS.X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all duration-300 w-full sm:w-auto ${
              isLoading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
              </div>
            ) : (
              'Generate'
            )}
          </button>
        </div>
        {/* Character counter */}
        <div className="absolute -bottom-6 right-0 text-xs text-slate-500">
          {prompt.length}/200
        </div>
      </form>

      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onManualCreate();
        }}
        type="button"
        className="group px-4 md:px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/30 text-slate-400 hover:text-white transition-all text-sm md:text-sm font-medium flex items-center gap-2 mx-auto relative overflow-hidden z-30"
      >
        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <ICONS.Plus className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Initialize Blank Schema</span>
      </button>
    </div>
  );
};

export default MissionControl;
