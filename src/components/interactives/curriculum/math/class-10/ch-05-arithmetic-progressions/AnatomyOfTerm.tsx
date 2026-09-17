'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListOrdered, Search, RotateCcw, ArrowRightCircle, Layers } from 'lucide-react';

export default function AnatomyOfTerm() {
  // AP Constants
  const [a, setA] = useState<number>(3); // First Term
  const [d, setD] = useState<number>(2); // Common Difference
  const [targetN, setTargetN] = useState<number>(5); // The n-th term to find

  // Maximum number of visible steps in the progression
  const MAX_STEPS = 8; 
  
  // Create the sequence array
  const sequence = Array.from({ length: MAX_STEPS }, (_, i) => ({
    n: i + 1,
    value: a + i * d,
    bricks: i, // Number of 'd' bricks needed
  }));

  const targetTerm = sequence[targetN - 1];

  const handleReset = () => {
    setA(3);
    setD(2);
    setTargetN(5);
  };

  // 3D-Styled Block Components
  const BaseBlock = ({ val }: { val: number }) => (
    <div className="w-12 sm:w-16 h-10 sm:h-12 bg-blue-600 border-b-4 border-r-4 border-blue-800 rounded-sm flex items-center justify-center font-bold text-white shadow-lg relative z-10">
      {val}
    </div>
  );

  const DifferenceBrick = ({ val }: { val: number }) => (
    <div className="w-12 sm:w-16 h-8 sm:h-10 bg-orange-500 border-b-4 border-r-4 border-orange-700 rounded-sm flex items-center justify-center font-bold text-white shadow-md relative -mb-2 z-0">
      +{val}
    </div>
  );

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <ListOrdered className="text-blue-500" /> The Anatomy of a Term
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the nth term formula: $a_n = a + (n - 1)d$
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Progression
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE STAIRCASE) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-end p-6 pt-20">
          
          {/* Jump Counter Overlay */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-stone-900/80 border border-stone-700 px-6 py-3 rounded-xl backdrop-blur-sm flex items-center gap-4 shadow-xl z-20">
            <div className="flex flex-col items-center">
              <span className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Target Term</span>
              <span className="text-white font-mono font-bold text-xl">n = {targetN}</span>
            </div>
            <div className="w-px h-8 bg-stone-700"></div>
            <div className="flex flex-col items-center">
              <span className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Total Jumps Needed</span>
              <span className="text-orange-400 font-mono font-bold text-xl">{targetN - 1} Jumps</span>
            </div>
          </div>

          {/* The Staircase Container */}
          <div className="flex items-end gap-2 sm:gap-6 relative w-full overflow-x-auto pb-8 pt-32 px-4 scrollbar-hide">
            
            {/* Draw Jump Arcs */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ minWidth: '600px' }}>
              {sequence.slice(0, targetN - 1).map((_, i) => {
                const startX = 40 + (i * 88); // Approximate spacing, adjusts based on screen
                const startY = 200 - (i * 32); 
                return (
                  <motion.path
                    key={`jump-${i}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: i * 0.15, duration: 0.3 }}
                    d={`M ${startX} ${startY} Q ${startX + 44} ${startY - 40} ${startX + 88} ${startY - 32}`}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
                </marker>
              </defs>
            </svg>

            <AnimatePresence>
              {sequence.map((step) => {
                const isTarget = step.n === targetN;
                const isPast = step.n > targetN;

                return (
                  <motion.div 
                    key={`step-${step.n}`}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: isPast ? 0.2 : 1, 
                      y: 0,
                      scale: isTarget ? 1.1 : 1,
                      filter: isPast ? 'grayscale(100%)' : 'none'
                    }}
                    className={`flex flex-col items-center transition-all duration-500 min-w-[3rem] sm:min-w-[4rem] ${isTarget ? 'z-30 mx-2' : 'z-10'}`}
                  >
                    {/* The Stack */}
                    <div className="flex flex-col-reverse items-center justify-start">
                      <BaseBlock val={a} />
                      {Array.from({ length: step.bricks }).map((_, i) => (
                        <motion.div 
                          key={`brick-${step.n}-${i}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <DifferenceBrick val={d} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Step Label */}
                    <div className={`mt-4 flex flex-col items-center ${isTarget ? 'text-white' : 'text-stone-500'}`}>
                      <span className="font-mono text-sm font-bold border-b border-stone-700 pb-1 w-full text-center">a_{step.n}</span>
                      <span className={`text-xl font-bold mt-1 ${isTarget ? 'text-blue-400' : ''}`}>{step.value}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Sequence Parameters</span>
              <Layers size={14} className="text-blue-500" />
            </div>
            
            <div className="flex flex-col gap-5">
              {/* Slider for First Term (a) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-blue-400 font-bold">Base Term (a)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{a}</span>
                </div>
                <input type="range" min="-5" max="10" step="1" value={a} onChange={(e) => setA(parseInt(e.target.value))} className="w-full accent-blue-500" />
              </div>

              {/* Slider for Common Difference (d) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-orange-400 font-bold">Difference (d)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{d}</span>
                </div>
                <input type="range" min="-5" max="10" step="1" value={d} onChange={(e) => setD(parseInt(e.target.value))} className="w-full accent-orange-500" />
              </div>

              {/* Target Search Box */}
              <div className="mt-2 bg-stone-950 border border-stone-700 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search size={16} className="text-stone-500" />
                  <span className="text-stone-300 font-bold text-sm uppercase tracking-widest">Find Term:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTargetN(Math.max(1, targetN - 1))} className="w-8 h-8 bg-stone-800 hover:bg-stone-700 rounded flex items-center justify-center font-bold text-white">-</button>
                  <span className="w-10 text-center font-mono font-bold text-lg text-white">a_{targetN}</span>
                  <button onClick={() => setTargetN(Math.min(MAX_STEPS, targetN + 1))} className="w-8 h-8 bg-stone-800 hover:bg-stone-700 rounded flex items-center justify-center font-bold text-white">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <ArrowRightCircle className="text-orange-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Jump Logic</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full">
              
              {/* Formula Deconstruction */}
              <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col gap-4">
                <div className="text-center font-mono text-2xl font-bold text-white">
                  a_{targetN} = <span className="text-blue-400">{a}</span> + (<span className="text-orange-400">{targetN} - 1</span>)(<span className="text-orange-400">{d}</span>)
                </div>
                
                <div className="w-full h-px bg-stone-800"></div>
                
                <div className="flex justify-between items-center font-mono font-bold">
                  <span className="text-stone-400">Total Value:</span>
                  <span className="text-2xl text-white">{targetTerm.value}</span>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  <motion.div key={targetN} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                    <h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest">Why (n - 1)?</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Look at step <strong className="text-white">a_{targetN}</strong>. It consists of exactly 1 blue base block and <strong className="text-orange-400">{targetN - 1}</strong> orange bricks. 
                    </p>
                    <div className="bg-orange-950/20 border border-orange-900/50 p-4 rounded-lg mt-1">
                      <p className="text-orange-200/90 text-xs leading-relaxed">
                        Because we <em>start</em> our journey on step 1 (the blue block), we don't need to jump to get there. To reach step {targetN}, we only need to make exactly <strong>{targetN - 1} jumps</strong>.
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}