'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowRight, Lightbulb, Hash } from 'lucide-react';

export default function ParitySwitchboard() {
  const [startNum, setStartNum] = useState<number>(3);
  
  // State for the three operators between the four numbers (true = '+', false = '-')
  const [ops, setOps] = useState<[boolean, boolean, boolean]>([true, true, true]);
  
  // State to trigger the extracted difference animation
  const [extraction, setExtraction] = useState<{ id: number; val: number; xOffset: number } | null>(null);

  const numbers = [startNum, startNum + 1, startNum + 2, startNum + 3];

  const currentSum = useMemo(() => {
    return numbers[0] + 
           (ops[0] ? numbers[1] : -numbers[1]) + 
           (ops[1] ? numbers[2] : -numbers[2]) + 
           (ops[2] ? numbers[3] : -numbers[3]);
  }, [numbers, ops]);

  const handleToggle = (index: number) => {
    const newOps = [...ops] as [boolean, boolean, boolean];
    const wasPositive = newOps[index];
    newOps[index] = !wasPositive;
    
    // Calculate the exact mathematical shift (2b)
    const shift = wasPositive ? -(2 * numbers[index + 1]) : (2 * numbers[index + 1]);
    
    setExtraction({ id: Date.now(), val: shift, xOffset: index });
    setOps(newOps);
  };

  return (
    <div className="w-full h-full min-h-[700px] bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-8 z-10">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          The Parity Switchboard
        </h2>
        <p className="text-stone-400 text-sm mt-1">Why do four consecutive numbers always yield an EVEN result?</p>
      </div>

      {/* INPUT PANEL */}
      <div className="absolute top-6 right-6 z-20 bg-stone-800/80 backdrop-blur-md p-4 rounded-2xl border border-stone-700 shadow-xl flex items-center gap-3">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
          <Hash size={14} className="text-emerald-500" /> Start Number
        </label>
        <input 
          type="number" 
          value={startNum} 
          onChange={(e) => setStartNum(parseInt(e.target.value) || 0)}
          className="w-20 bg-stone-900 text-white font-mono text-xl p-2 rounded-xl border border-stone-600 focus:outline-none focus:border-emerald-500 text-center"
        />
      </div>

      {/* THE MAIN SWITCHBOARD CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-700 shadow-inner relative flex flex-col items-center justify-center p-6 z-10">
        
        <div className="flex items-center justify-center gap-2 sm:gap-4 relative">
          {/* Base Number (No switch) */}
          <div className="w-16 h-24 sm:w-24 sm:h-32 bg-stone-800 rounded-xl border-y-4 border-stone-600 shadow-lg flex items-center justify-center relative">
            <span className="text-3xl sm:text-5xl font-mono text-stone-200">{numbers[0]}</span>
          </div>

          {/* Toggle 1 & Number 2 */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => handleToggle(0)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-700 hover:bg-stone-600 border border-stone-500 shadow-md flex items-center justify-center transition-colors">
              {ops[0] ? <Plus className="text-emerald-400" /> : <Minus className="text-rose-400" />}
            </button>
            <div className="w-16 h-24 sm:w-24 sm:h-32 bg-stone-800 rounded-xl border-y-4 border-stone-600 shadow-lg flex items-center justify-center">
              <span className="text-3xl sm:text-5xl font-mono text-stone-200">{numbers[1]}</span>
            </div>
          </div>

          {/* Toggle 2 & Number 3 */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => handleToggle(1)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-700 hover:bg-stone-600 border border-stone-500 shadow-md flex items-center justify-center transition-colors">
              {ops[1] ? <Plus className="text-emerald-400" /> : <Minus className="text-rose-400" />}
            </button>
            <div className="w-16 h-24 sm:w-24 sm:h-32 bg-stone-800 rounded-xl border-y-4 border-stone-600 shadow-lg flex items-center justify-center">
              <span className="text-3xl sm:text-5xl font-mono text-stone-200">{numbers[2]}</span>
            </div>
          </div>

          {/* Toggle 3 & Number 4 */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => handleToggle(2)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-700 hover:bg-stone-600 border border-stone-500 shadow-md flex items-center justify-center transition-colors">
              {ops[2] ? <Plus className="text-emerald-400" /> : <Minus className="text-rose-400" />}
            </button>
            <div className="w-16 h-24 sm:w-24 sm:h-32 bg-stone-800 rounded-xl border-y-4 border-stone-600 shadow-lg flex items-center justify-center">
              <span className="text-3xl sm:text-5xl font-mono text-stone-200">{numbers[3]}</span>
            </div>
          </div>

          {/* EXTRACTION ANIMATION */}
          <AnimatePresence>
            {extraction && (
              <motion.div
                key={extraction.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: 100, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`absolute top-full mt-4 font-mono text-3xl font-bold z-50 drop-shadow-xl ${extraction.val > 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                style={{ left: `${30 + extraction.xOffset * 28}%` }}
              >
                {extraction.val > 0 ? '+' : ''}{extraction.val}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* EQUAL SIGN & RESULT */}
        <div className="mt-12 flex items-center gap-6">
          <div className="text-stone-500 text-4xl">=</div>
          <motion.div 
            layout
            className="px-8 py-4 bg-stone-950 border-2 border-emerald-900 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center"
          >
            <span className="text-5xl font-mono font-bold text-white drop-shadow-md">{currentSum}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mt-2 bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-800">
              ALWAYS EVEN
            </span>
          </motion.div>
        </div>
      </div>

      {/* AHA! MOMENT EXPLANATION */}
      <div className="mt-6 z-10 shrink-0">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-start gap-4 shadow-xl">
          <Lightbulb size={24} className="text-emerald-400 shrink-0 mt-1" />
          <div>
            <p className="text-stone-300 text-sm leading-relaxed mb-2">
              <strong>The 2b Extraction:</strong> Notice how flipping a sign doesn't just change the sum by $b$, it changes it by exactly $2b$. 
            </p>
            <p className="text-stone-400 text-xs font-mono bg-stone-900 p-2 rounded-lg inline-block border border-stone-800">
              $(a + b) - (a - b) = 2b$
            </p>
            <p className="text-stone-400 text-xs mt-2">
              Because $2b$ is always an even number, you are only ever adding or subtracting even amounts from the base total. The parity (evenness) is mathematically locked!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}