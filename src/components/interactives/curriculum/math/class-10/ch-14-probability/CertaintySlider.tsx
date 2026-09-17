'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, ShieldAlert, Sparkles, RotateCcw, Calculator, Lock, CheckCircle2, Flame, Ban } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  description: string;
  pE: number;
  labelE: string;
  labelNotE: string;
}

const PRESETS: Scenario[] = [
  {
    id: 'sure',
    title: 'Roll < 7 on a Die',
    description: 'Every outcome on a 6-sided die {1, 2, 3, 4, 5, 6} satisfies this condition.',
    pE: 1.0,
    labelE: 'Roll < 7',
    labelNotE: 'Roll ≥ 7',
  },
  {
    id: 'coin',
    title: 'Flip Heads on a Fair Coin',
    description: 'A classic binary symmetric system where both outcomes have equal likelihood.',
    pE: 0.5,
    labelE: 'Heads',
    labelNotE: 'Tails',
  },
  {
    id: 'face-card',
    title: 'Draw a Face Card',
    description: '12 face cards (J, Q, K) out of 52 total cards in a standard deck (12/52 ≈ 0.231).',
    pE: 12 / 52,
    labelE: 'Face Card',
    labelNotE: 'Number Card / Ace',
  },
  {
    id: 'impossible',
    title: 'Roll an 8 on a Standard Die',
    description: 'A single six-sided die has no face with 8 dots. Zero favorable outcomes.',
    pE: 0.0,
    labelE: 'Roll an 8',
    labelNotE: 'Roll 1 to 6',
  },
];

export default function CertaintySlider() {
  const [pE, setPE] = useState<number>(0.65);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const pNotE = Math.max(0, Math.min(1, 1 - pE));

  const selectPreset = (preset: Scenario) => {
    setActivePreset(preset.id);
    setPE(preset.pE);
  };

  const handleSliderChange = (newVal: number) => {
    setActivePreset(null);
    setPE(newVal);
  };

  const handleReset = () => {
    setActivePreset(null);
    setPE(0.5);
  };

  // Qualitative classification helper
  const getStatusLabel = (val: number) => {
    if (val === 0) return { text: 'Impossible Event', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800' };
    if (val < 0.35) return { text: 'Unlikely Event', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800' };
    if (val === 0.5) return { text: 'Equally Likely (50-50)', color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800' };
    if (val < 1.0) return { text: 'Likely Event', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800' };
    return { text: 'Sure / Certain Event', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800' };
  };

  const currentStatus = getStatusLabel(pE);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Sliders className="text-sky-400" /> The Certainty Slider
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Complementary Events: Proving that $P(E) + P(\overline&#123;E&#125;) \equiv 1$.
          </p>
        </div>
        {(pE !== 0.5 || activePreset !== null) && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Center Slider
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE CERTAINTY RAIL) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 sm:p-10">
          
          {/* Top Classification Badge */}
          <div className="w-full flex items-center justify-between mb-8 max-w-xl">
            <div className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 ${currentStatus.bg} ${currentStatus.color}`}>
              {currentStatus.text}
            </div>
            <div className="flex items-center gap-2 text-stone-400 font-mono text-xs">
              <Lock size={12} className="text-stone-500" /> Total Certainty = 1.0 (100%)
            </div>
          </div>

          {/* THE PHYSICAL CERTAINTY RAIL CONTAINER */}
          <div className="relative w-full max-w-xl h-28 bg-stone-950 rounded-2xl border-2 border-stone-700 p-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex items-stretch overflow-hidden">
            
            {/* Block P(E) */}
            <motion.div
              layout
              style={{ width: `${pE * 100}%` }}
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-l-xl relative overflow-hidden flex flex-col justify-center px-4 transition-all duration-150"
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
              {pE > 0.12 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex flex-col">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-sky-950/80">Event E</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">{(pE * 100).toFixed(1)}%</span>
                  <span className="font-mono text-[11px] text-sky-100/90 font-bold">P(E) = {pE.toFixed(3)}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Interlocking Puzzle Seam Indicator */}
            <div className="relative z-20 w-1 bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <div className="absolute -top-3 w-6 h-6 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg text-[10px] font-bold font-mono">
                +
              </div>
            </div>

            {/* Block P(not E) */}
            <motion.div
              layout
              style={{ width: `${pNotE * 100}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-r-xl relative overflow-hidden flex flex-col justify-center items-end px-4 transition-all duration-150 text-right"
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
              {pNotE > 0.12 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex flex-col items-end">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-950/80">Complement (Ē)</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">{(pNotE * 100).toFixed(1)}%</span>
                  <span className="font-mono text-[11px] text-amber-100/90 font-bold">P(Ē) = {pNotE.toFixed(3)}</span>
                </motion.div>
              )}
            </motion.div>

          </div>

          {/* Interactive Scrub Track */}
          <div className="w-full max-w-xl mt-6 flex flex-col gap-2">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.005" 
              value={pE} 
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full h-3 bg-stone-900 rounded-lg appearance-none cursor-ew-resize accent-sky-400 border border-stone-800"
            />
            
            {/* Axis Ruler */}
            <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 font-bold uppercase tracking-widest px-1">
              <span className="flex items-center gap-1"><Ban size={10} className="text-rose-400" /> 0.0 (Impossible)</span>
              <span>0.25</span>
              <span className="text-stone-300">0.50 (Fair)</span>
              <span>0.75</span>
              <span className="flex items-center gap-1">1.0 (Certain) <CheckCircle2 size={10} className="text-purple-400" /></span>
            </div>
          </div>

          {/* Live Locking Visualizer */}
          <div className="w-full max-w-xl mt-8 bg-stone-900/60 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              <span className="text-xs font-mono text-stone-300">P(E): <strong className="text-white">{pE.toFixed(3)}</strong></span>
            </div>
            <span className="text-stone-600 font-mono font-bold">+</span>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-xs font-mono text-stone-300">P(Ē): <strong className="text-white">{pNotE.toFixed(3)}</strong></span>
            </div>
            <span className="text-stone-600 font-mono font-bold">=</span>
            <div className="flex items-center gap-2 bg-stone-950 px-3 py-1 rounded-md border border-stone-700">
              <Sparkles size={12} className="text-emerald-400" />
              <span className="text-sm font-mono font-bold text-emerald-400">1.000</span>
            </div>
          </div>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Preset Scenario Picker */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Curriculum Scenarios</span>
              <Sparkles size={14} className="text-sky-400" />
            </div>

            <div className="flex flex-col gap-2">
              {PRESETS.map((scenario) => {
                const isSelected = activePreset === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => selectPreset(scenario)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col gap-1 ${
                      isSelected 
                        ? 'bg-sky-950/40 border-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs uppercase tracking-wide text-stone-200">{scenario.title}</span>
                      <span className="font-mono text-xs font-bold text-sky-400">{scenario.pE.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-tight">{scenario.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-amber-400" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Axiomatic Formulation</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              {/* Formula Card */}
              <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col gap-3 font-mono">
                <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold border-b border-stone-800 pb-2">
                  Fundamental Law
                </div>
                <div className="text-lg font-bold text-white flex items-center justify-between">
                  <span>P(E) + P(Ē) = 1</span>
                </div>
                <div className="text-xs text-stone-400 pt-1 border-t border-stone-800/80 flex flex-col gap-1.5">
                  <span className="text-amber-400 font-bold">Algebraic Rearrangement:</span>
                  <span className="text-stone-200">P(Ē) = 1 - P(E)</span>
                  <span className="text-stone-500">P(Ē) = 1 - {pE.toFixed(3)} = <strong className="text-amber-400">{pNotE.toFixed(3)}</strong></span>
                </div>
              </div>

              {/* Dynamic Contextual Explanation */}
              <div className="mt-auto pt-2">
                <AnimatePresence mode="wait">
                  {pE === 1.0 ? (
                    <motion.div key="sure" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 bg-purple-950/20 border border-purple-900/50 p-4 rounded-xl">
                      <Sparkles className="text-purple-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-purple-200/90 text-xs leading-relaxed">
                        <strong className="text-purple-300 uppercase tracking-wider">The Sure Event</strong><br/>
                        When an event is guaranteed to happen, $P(E) = 1$. The complementary block $P(\overline&#123;E&#125;)$ collapses to exactly <strong>0</strong>. There is zero possibility of anything else occurring.
                      </p>
                    </motion.div>
                  ) : pE === 0.0 ? (
                    <motion.div key="impossible" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl">
                      <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-rose-200/90 text-xs leading-relaxed">
                        <strong className="text-rose-300 uppercase tracking-wider">The Impossible Event</strong><br/>
                        When an event cannot happen, $P(E) = 0$. In contrast, its complement $P(\overline&#123;E&#125)$ swells to <strong>1</strong>. It is 100% certain that the event will <em>not</em> occur.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="general" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                      <div className="flex items-start gap-2 text-stone-300 text-xs leading-relaxed">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          No matter where you drag the slider, the two blocks remain physically fused. 
                        </span>
                      </div>
                      <p className="text-stone-400 text-[11px] leading-relaxed pl-6">
                        Probability is a closed universe normalized to 1. To calculate the probability of something <em>not</em> happening, you never need to count the entire universe from scratch—simply subtract the event from 1!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}