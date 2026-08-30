'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Lightbulb, ArrowDown } from 'lucide-react';

export default function VedicCascader() {
  const [inputNum, setInputNum] = useState<number>(3874);
  const [step, setStep] = useState<number>(0);

  // ==================================================================
  // MATH ENGINE: Array alignments for the visual cascade
  // ==================================================================
  const { topRow, bottomRow, sums, carryOvers, finalResult } = useMemo(() => {
    const numStr = inputNum.toString();
    const digits = numStr.split('').map(Number);
    
    // Top row is input * 10 (shifted left, append 0)
    const top = [...digits, 0];
    
    // Bottom row is input * 1 (shifted right, prepend empty space)
    // We pad the arrays to be the same length for easy mapping.
    // If there's a final carry over, the array needs an extra slot at the front.
    const result = (inputNum * 11).toString().split('').map(Number);
    const maxLen = result.length;
    
    const paddedTop = Array(maxLen - top.length).fill(null).concat(top);
    const paddedBottom = Array(maxLen - digits.length).fill(null).concat(digits);
    
    // Calculate carries for the visualizer
    const c = Array(maxLen).fill(0);
    let carry = 0;
    for (let i = maxLen - 1; i >= 0; i--) {
      const t = paddedTop[i] || 0;
      const b = paddedBottom[i] || 0;
      const sum = t + b + carry;
      if (sum >= 10) {
        carry = 1;
        if (i - 1 >= 0) c[i - 1] = 1;
      } else {
        carry = 0;
      }
    }

    return { 
      topRow: paddedTop, 
      bottomRow: paddedBottom, 
      sums: result,
      carryOvers: c,
      finalResult: result.join('')
    };
  }, [inputNum]);

  // Auto-advance the animation steps
  useEffect(() => {
    if (step > 0 && step < 4) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="w-full h-full min-h-[700px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-8 z-10">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          The Vedic Cascader
        </h2>
        <p className="text-stone-400 text-sm mt-1">
          Khanda-Gunanam Fast Math: Multiplying by 11
        </p>
      </div>

      {/* INPUT PANEL */}
      <div className="absolute top-6 right-6 z-20 bg-stone-800/80 backdrop-blur-md p-3 rounded-2xl border border-stone-700 flex gap-2">
        <input 
          type="number" 
          value={inputNum} 
          onChange={(e) => {
            setInputNum(Math.max(1, Math.min(999999, parseInt(e.target.value) || 0)));
            setStep(0);
          }}
          disabled={step !== 0}
          className="w-32 bg-stone-900 text-emerald-400 font-mono text-xl p-2 rounded-xl border border-stone-600 focus:outline-none focus:border-emerald-500 text-center"
        />
        {step === 0 ? (
          <button onClick={() => setStep(1)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl flex items-center justify-center transition-colors">
            <Play size={18} />
          </button>
        ) : (
          <button onClick={() => setStep(0)} className="bg-stone-700 hover:bg-stone-600 text-white px-4 rounded-xl flex items-center justify-center transition-colors">
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* THE MAIN CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center p-6 z-10 overflow-hidden">
        
        {/* Step 1: The Equation Split */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center font-mono text-3xl sm:text-5xl text-stone-300"
            >
              <div className="mb-4">{inputNum} × 11</div>
              <ArrowDown className="text-emerald-500 mb-4 animate-bounce" size={32} />
              <div className="flex gap-4">
                <span className="text-white bg-stone-800 px-4 py-2 rounded-xl border border-stone-600">{inputNum} × (10 + 1)</span>
              </div>
            </motion.div>
          )}

          {/* Step 2, 3, 4: The Cascading Loom */}
          {step >= 2 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="w-full max-w-2xl mt-12 flex flex-col items-end justify-center font-mono"
            >
              {/* TOP ROW (× 10) */}
              <div className="flex gap-2 sm:gap-4 mb-4">
                <div className="flex items-center text-stone-500 text-lg sm:text-xl mr-4">(× 10)</div>
                {topRow.map((digit, i) => (
                  <motion.div 
                    key={`t-${i}`}
                    layout
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                    className={`w-12 h-16 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold border-2
                      ${digit === 0 && i === topRow.length - 1 ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : digit !== null ? 'bg-stone-800 border-stone-600 text-white' : 'border-transparent'}`}
                  >
                    {digit !== null ? digit : ''}
                  </motion.div>
                ))}
              </div>

              {/* BOTTOM ROW (× 1) */}
              <div className="flex gap-2 sm:gap-4 mb-4 border-b-4 border-stone-700 pb-8 relative">
                <div className="flex items-center text-stone-500 text-lg sm:text-xl mr-4">(× 1)</div>
                <div className="absolute left-10 bottom-10 text-stone-500 text-4xl">+</div>
                {bottomRow.map((digit, i) => (
                  <motion.div 
                    key={`b-${i}`}
                    layout
                    initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: (i * 0.1) + 0.5 }}
                    className={`w-12 h-16 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold border-2
                      ${digit !== null ? 'bg-stone-800 border-stone-600 text-white' : 'border-transparent'}`}
                  >
                    {digit !== null ? digit : ''}
                  </motion.div>
                ))}
              </div>

              {/* CARRY OVERS */}
              {step >= 3 && (
                <div className="flex gap-2 sm:gap-4 mb-2 -mt-4 pl-24 sm:pl-28">
                  {carryOvers.map((carry, i) => (
                    <div key={`c-${i}`} className="w-12 sm:w-16 flex justify-center">
                      {carry > 0 && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="text-emerald-400 font-bold text-sm bg-emerald-900/50 px-2 rounded-full border border-emerald-800"
                        >
                          +1
                        </motion.span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* THE RESULT ROW */}
              {step >= 4 && (
                <div className="flex gap-2 sm:gap-4 pl-24 sm:pl-28">
                  {sums.map((digit, i) => (
                    <motion.div 
                      key={`r-${i}`}
                      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
                      className="w-12 h-16 sm:w-16 sm:h-20 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      {digit}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AHA! MESSAGE BOX */}
      <div className="mt-6 z-10 shrink-0">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-start gap-4 shadow-xl">
          <Lightbulb size={24} className="text-emerald-400 shrink-0 mt-1" />
          <div>
            <p className="text-stone-300 text-sm leading-relaxed mb-2">
              <strong>The Architecture of the Trick:</strong> The famous "add the adjacent digits" rule for multiplying by 11 isn't magic. 
            </p>
            <p className="text-stone-400 text-xs">
              By expanding 11 into (10 + 1) using the <strong>Distributive Property</strong>, we create a staggered duplicate of the number. The glowing "0" shifts the top row over, perfectly aligning adjacent digits in vertical columns so they can be added together!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}