'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Filter, Sparkles, RotateCcw, Calculator, LayoutGrid } from 'lucide-react';

type Condition = 'all' | 'sum5' | 'sum8' | 'doubles' | 'blueEven';

export default function UniverseMatrix() {
  const [activeCondition, setActiveCondition] = useState<Condition>('all');

  // Generate the 36 Universes
  const universes = useMemo(() => {
    const grid = [];
    for (let grey = 1; grey <= 6; grey++) {
      for (let blue = 1; blue <= 6; blue++) {
        grid.push({
          id: `g${grey}-b${blue}`,
          grey,
          blue,
          sum: grey + blue,
          isDouble: grey === blue,
        });
      }
    }
    return grid;
  }, []);

  // Condition Checker
  const satisfiesCondition = (u: { grey: number; blue: number; sum: number; isDouble: boolean }) => {
    switch (activeCondition) {
      case 'sum5': return u.sum === 5;
      case 'sum8': return u.sum === 8;
      case 'doubles': return u.isDouble;
      case 'blueEven': return u.blue % 2 === 0;
      default: return true;
    }
  };

  const matchingCount = universes.filter(satisfiesCondition).length;

  // Simple SVG Die Component
  const Die = ({ value, color }: { value: number, color: 'blue' | 'grey' }) => {
    const fill = color === 'blue' ? '#38bdf8' : '#94a3b8'; // sky-400 or slate-400
    const dot = color === 'blue' ? '#082f49' : '#0f172a'; // sky-950 or slate-950

    // Dot positioning logic
    const dots = [];
    if (value === 1 || value === 3 || value === 5) dots.push({ cx: 12, cy: 12 });
    if (value !== 1) {
      dots.push({ cx: 6, cy: 6 });
      dots.push({ cx: 18, cy: 18 });
    }
    if (value === 4 || value === 5 || value === 6) {
      dots.push({ cx: 6, cy: 18 });
      dots.push({ cx: 18, cy: 6 });
    }
    if (value === 6) {
      dots.push({ cx: 6, cy: 12 });
      dots.push({ cx: 18, cy: 12 });
    }

    return (
      <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-md">
        <rect width="24" height="24" rx="4" fill={fill} />
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="2.5" fill={dot} />
        ))}
      </svg>
    );
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#020617] rounded-2xl border border-slate-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-indigo-400" /> The 36-Universe Matrix
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualizing complex sample spaces in two-dice probability.
          </p>
        </div>
        {activeCondition !== 'all' && (
          <button 
            onClick={() => setActiveCondition('all')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Matrix
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE 3D MATRIX) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#0f172a] to-[#020617] border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 perspective-[1000px]">
          
          {/* Axis Labels */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sky-400 font-bold uppercase tracking-widest text-xs">Blue Die (1-6)</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-slate-400 font-bold uppercase tracking-widest text-xs">Grey Die (1-6)</div>

          {/* The Isometric Grid Container */}
          <motion.div 
            className="grid grid-cols-6 gap-3 sm:gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-xl"
            animate={{ rotateX: 15, rotateZ: -5 }} // Subtle 2.5D tilt
            transition={{ type: "spring", bounce: 0.2 }}
          >
            {universes.map((u) => {
              const isActive = satisfiesCondition(u);
              
              return (
                <motion.div 
                  key={u.id}
                  layout
                  initial={false}
                  animate={{ 
                    opacity: isActive ? 1 : 0.15,
                    scale: isActive ? 1.05 : 0.95,
                    y: isActive ? -5 : 0
                  }}
                  transition={{ duration: 0.4 }}
                  className={`flex flex-col gap-1 p-2 rounded-lg border-2 transition-colors ${isActive ? 'bg-slate-800 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-950 border-slate-800'}`}
                >
                  <div className="flex gap-1">
                    <Die value={u.blue} color="blue" />
                    <Die value={u.grey} color="grey" />
                  </div>
                  <div className="text-center font-mono text-[10px] text-slate-400 font-bold mt-1">
                    ({u.blue}, {u.grey})
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Filter Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">
              <span>Condition Filters</span>
              <Filter size={14} className="text-indigo-400" />
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setActiveCondition('sum8')}
                className={`py-3 px-4 rounded-lg font-bold text-sm text-left transition-all border-l-4 ${activeCondition === 'sum8' ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                Sum of the two numbers is 8
              </button>
              
              <button 
                onClick={() => setActiveCondition('sum5')}
                className={`py-3 px-4 rounded-lg font-bold text-sm text-left transition-all border-l-4 ${activeCondition === 'sum5' ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                Sum of the two numbers is 5
              </button>

              <button 
                onClick={() => setActiveCondition('doubles')}
                className={`py-3 px-4 rounded-lg font-bold text-sm text-left transition-all border-l-4 ${activeCondition === 'doubles' ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                Rolling a Double (Same number)
              </button>

              <button 
                onClick={() => setActiveCondition('blueEven')}
                className={`py-3 px-4 rounded-lg font-bold text-sm text-left transition-all border-l-4 ${activeCondition === 'blueEven' ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                Blue Die shows an Even number
              </button>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center gap-3">
              <Calculator className="text-amber-500" size={18} />
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">Probability Calculator</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#020617]">
              
              {/* Dynamic Fraction Display */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">P(E) =</span>
                  <span className="text-slate-300 font-bold">Favorable Outcomes</span>
                  <span className="text-slate-500 border-t border-slate-700 pt-1">Total Sample Space</span>
                </div>
                
                <div className="flex flex-col items-center text-3xl font-mono font-bold">
                  <motion.span 
                    key={matchingCount}
                    initial={{ scale: 1.5, color: '#818cf8' }}
                    animate={{ scale: 1, color: '#f8fafc' }}
                    className="border-b-2 border-slate-700 pb-1 px-4"
                  >
                    {matchingCount}
                  </motion.span>
                  <span className="pt-1 px-4 text-slate-500">36</span>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-4">
                <AnimatePresence mode="wait">
                  {activeCondition === 'all' && (
                    <motion.div key="all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <p className="text-slate-400 text-xs leading-relaxed text-center italic">
                        Select a condition from the master control panel to illuminate specific universes.
                      </p>
                    </motion.div>
                  )}
                  
                  {activeCondition === 'sum8' && (
                    <motion.div key="sum8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Sparkles className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-indigo-100/90 text-xs leading-relaxed">
                        Notice how the favorable outcomes form a perfect diagonal line? There are exactly 5 universes where the sum is 8: <strong className="font-mono text-white">(2,6), (3,5), (4,4), (5,3), and (6,2)</strong>.
                      </p>
                    </motion.div>
                  )}

                  {activeCondition === 'sum5' && (
                    <motion.div key="sum5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Dices className="text-amber-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-amber-100/90 text-xs leading-relaxed">
                        <strong className="text-amber-400 uppercase tracking-widest">The "Aha!" Moment</strong><br/>
                        Look closely at the grid. <strong className="text-sky-300 font-mono">(1, 4)</strong> and <strong className="text-slate-300 font-mono">(4, 1)</strong> are not the same thing! They are completely different physical blocks in space. This proves why order matters when calculating sample spaces.
                      </p>
                    </motion.div>
                  )}

                  {activeCondition === 'doubles' && (
                    <motion.div key="doubles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Sparkles className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-indigo-100/90 text-xs leading-relaxed">
                        The "Doubles" cut a perfect primary diagonal straight through the center of the matrix. Because there are 6 distinct numbers on a die, there are exactly 6 universes where both dice match.
                      </p>
                    </motion.div>
                  )}

                  {activeCondition === 'blueEven' && (
                    <motion.div key="blueEven" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Sparkles className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-indigo-100/90 text-xs leading-relaxed">
                        By isolating just the Blue die, exactly half the columns light up (2, 4, and 6), capturing 18 total universes. The grey die's outcome becomes completely irrelevant to this specific condition!
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