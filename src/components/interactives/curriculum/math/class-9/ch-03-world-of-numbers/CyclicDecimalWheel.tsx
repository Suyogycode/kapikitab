'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Calculator, Search, RotateCw } from 'lucide-react';

export default function CyclicDecimalWheel() {
  const [multiplier, setMultiplier] = useState<number>(1);

  // The cyclic sequence of 1/7
  const sequence = [1, 4, 2, 8, 5, 7];

  // Map the multiplier to the correct starting index on the wheel
  // 1/7 = .142857 (Starts at 1, index 0)
  // 2/7 = .285714 (Starts at 2, index 2)
  // 3/7 = .428571 (Starts at 4, index 1)
  // 4/7 = .571428 (Starts at 5, index 4)
  // 5/7 = .714285 (Starts at 7, index 5)
  // 6/7 = .857142 (Starts at 8, index 3)
  const multiplierToIndex: Record<number, number> = {
    1: 0, 2: 2, 3: 1, 4: 4, 5: 5, 6: 3
  };

  const targetIndex = multiplierToIndex[multiplier];
  
  // Each digit is 60 degrees apart (360 / 6)
  const targetRotation = -targetIndex * 60;

  // Calculate the current active sequence string for the HUD
  const getActiveSequence = () => {
    let res = [];
    for (let i = 0; i < 6; i++) {
      res.push(sequence[(targetIndex + i) % 6]);
    }
    return res.join('');
  };

  const activeSequenceString = getActiveSequence();
  const baseNumber = 142857;
  const product = baseNumber * multiplier;

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <RotateCw className="text-emerald-500" /> The Cyclic Decimal Wheel
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Unlocking the magic of the repeating decimal $1/7 = 0.\overline{142857}$
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center z-10">
        
        {/* THE MECHANICAL VAULT (Interactive Workspace) */}
        <div className="relative w-full lg:w-1/2 h-[500px] bg-[#151414] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-8">
          
          {/* Subtle background rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[450px] h-[450px] rounded-full border border-stone-700 border-dashed animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[350px] h-[350px] rounded-full border border-stone-700 border-dotted animate-[spin_40s_linear_infinite_reverse]" />
          </div>

          {/* The Vault Outer Casing */}
          <div className="relative w-80 h-80 rounded-full bg-stone-900 border-[8px] border-stone-800 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
            
            {/* The Spinning Dial */}
            <motion.div 
              className="absolute w-64 h-64 rounded-full bg-stone-800 border-4 border-stone-700 shadow-2xl flex items-center justify-center"
              animate={{ rotate: targetRotation }}
              transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
            >
              {/* Inner mechanical details */}
              <div className="absolute w-24 h-24 rounded-full bg-stone-900 border-2 border-stone-700 flex items-center justify-center shadow-inner">
                <div className="w-8 h-8 rounded-full bg-stone-950 border border-stone-800" />
              </div>
              <div className="absolute w-full h-1 bg-stone-700/30" />
              <div className="absolute h-full w-1 bg-stone-700/30" />

              {/* The Engraved Digits */}
              {sequence.map((digit, i) => {
                const angle = (i * 60) - 90; // -90 puts index 0 at the top
                const rad = (angle * Math.PI) / 180;
                const radius = 100; // Distance from center
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;

                return (
                  <motion.div
                    key={i}
                    className="absolute w-12 h-12 flex items-center justify-center"
                    style={{ left: `calc(50% + ${x}px - 24px)`, top: `calc(50% + ${y}px - 24px)` }}
                    // Counter-rotate the digits so they always stay perfectly upright
                    animate={{ rotate: -targetRotation }}
                    transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
                  >
                    <span className="text-3xl font-serif font-bold text-stone-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {digit}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* The Fixed Magnifying Lens (At the top position) */}
            <div className="absolute -top-6 w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3),inset_0_0_15px_rgba(16,185,129,0.4)] backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
              <div className="absolute -top-2 bg-emerald-950 border border-emerald-500/50 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold tracking-widest uppercase shadow-lg">
                Start
              </div>
              <Search className="text-emerald-400/50 absolute bottom-2" size={14} />
            </div>

          </div>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* The Multiplier Control */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Settings2 size={16} /> Multiplier Engine
            </label>
            <div className="flex items-center gap-6">
              <input 
                type="range" 
                min="1" 
                max="6" 
                step="1" 
                value={multiplier} 
                onChange={(e) => setMultiplier(parseInt(e.target.value))} 
                className="w-full accent-emerald-500" 
              />
              <div className="flex flex-col items-center justify-center bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 min-w-[80px]">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1">Multiply</span>
                <span className="text-2xl font-mono text-white leading-none">
                  $\times {multiplier}$
                </span>
              </div>
            </div>
            <div className="flex justify-between px-1 mt-2 text-[10px] font-mono text-stone-600 font-bold">
              <span>x1</span>
              <span>x2</span>
              <span>x3</span>
              <span>x4</span>
              <span>x5</span>
              <span>x6</span>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Cyclic Calculation</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm">
              
              {/* Equation 1: Whole Numbers */}
              <div>
                <p className="text-stone-500 text-xs mb-2 uppercase tracking-widest">Integer Multiplication</p>
                <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-lg border border-stone-800 text-lg">
                  <span className="text-stone-400">142857</span>
                  <span className="text-stone-500">$\times$</span>
                  <span className="text-sky-400 font-bold">{multiplier}</span>
                  <span className="text-stone-500">$=$</span>
                  <span className="text-emerald-400 font-bold tracking-widest">{product}</span>
                </div>
              </div>

              {/* Equation 2: Fractions & Decimals */}
              <div>
                <p className="text-stone-500 text-xs mb-2 uppercase tracking-widest">Fractional Equivalent</p>
                <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-lg border border-stone-800 text-lg">
                  <span className="text-sky-400 font-bold">{multiplier}</span>
                  <span className="text-stone-500">/ 7</span>
                  <span className="text-stone-500">$=$</span>
                    <span className="text-emerald-400 font-bold tracking-widest">
                    {`0.$\\overline{${activeSequenceString}}$`}
                    </span>               
                     </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-4 pt-6 border-t border-stone-800">
                <p className="text-stone-400 text-xs leading-relaxed font-sans">
                  <strong>The Aha! Moment:</strong> Notice how the digits <strong className="text-white">1, 4, 2, 8, 5, 7</strong> never change their order. 
                  When you multiply by {multiplier}, the wheel simply rotates to a new starting position under the magnifying glass. 
                  A messy six-digit decimal is actually a perfect, predictable, mechanical loop!
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}