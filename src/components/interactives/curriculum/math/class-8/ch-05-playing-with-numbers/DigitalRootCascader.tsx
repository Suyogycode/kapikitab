'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, BookOpen, RotateCcw, ChevronDown } from 'lucide-react';

// Helper to calculate the digital root steps
const calculateCascade = (num: number) => {
  const steps: number[][] = [];
  let currentStr = num.toString();
  
  while (currentStr.length > 1) {
    const digits = currentStr.split('').map(Number);
    steps.push(digits);
    const sum = digits.reduce((a, b) => a + b, 0);
    currentStr = sum.toString();
  }
  
  steps.push([parseInt(currentStr)]); // The final single digit
  return steps;
};

export default function DigitalRootCascader() {
  const [inputNum, setInputNum] = useState<number>(320185);
  const [phase, setPhase] = useState<'idle' | 'cascading' | 'proof'>('idle');
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Pre-calculate all the steps for the animation sequence
  const cascadeSteps = useMemo(() => calculateCascade(inputNum), [inputNum]);
  const finalRoot = cascadeSteps[cascadeSteps.length - 1][0];
  const isDivisible = finalRoot === 9;

  // Run the sequence animation
  useEffect(() => {
    if (phase === 'cascading') {
      if (stepIndex < cascadeSteps.length - 1) {
        const timer = setTimeout(() => {
          setStepIndex(prev => prev + 1);
        }, 1500); // 1.5 seconds per funnel drop
        return () => clearTimeout(timer);
      }
    }
  }, [phase, stepIndex, cascadeSteps.length]);

  const handleStart = () => {
    setStepIndex(0);
    setPhase('cascading');
  };

  const handleReset = () => {
    setPhase('idle');
    setStepIndex(0);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-2">
            The Digital Root Cascader
          </h2>
          <p className="text-stone-400 text-sm mt-1">Divisibility by 9: The Anatomy of a Number</p>
        </div>
      </div>

      {/* INPUT PANEL */}
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        {phase === 'idle' && (
          <input 
            type="number" 
            value={inputNum} 
            onChange={(e) => setInputNum(Math.max(1, Math.min(99999999, parseInt(e.target.value) || 0)))}
            className="w-32 bg-stone-900 text-white font-mono text-xl p-2 rounded-xl border border-stone-700 focus:outline-none focus:border-emerald-500 text-center shadow-xl"
          />
        )}
      </div>

      {/* THE MAIN FUNNEL CANVAS */}
      {phase !== 'proof' && (
        <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center p-6 z-10 overflow-hidden">
          
          {/* Funnel SVG Graphic (Background) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 600" className="w-full h-full max-w-md">
              <path d="M 0 0 L 400 0 L 250 400 L 250 600 L 150 600 L 150 400 Z" fill="none" stroke="#10b981" strokeWidth="4" />
              {Array.from({length: 10}).map((_, i) => (
                <line key={i} x1="0" y1={i*60} x2="400" y2={i*60} stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" />
              ))}
            </svg>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start w-full max-w-xl relative mt-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`step-${stepIndex}`}
                initial={{ opacity: 0, y: -50, scale: 1.1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.5, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex flex-wrap justify-center gap-3 sm:gap-4"
              >
                {cascadeSteps[stepIndex].map((digit, i) => {
                  const isFinalStep = stepIndex === cascadeSteps.length - 1;
                  const isGlowing = isFinalStep && isDivisible;
                  
                  return (
                    <div 
                      key={`${stepIndex}-${i}`} 
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2 shadow-xl
                        ${isGlowing ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)]' : 'bg-stone-800 border-stone-600'}
                      `}
                    >
                      <span className={`text-3xl sm:text-4xl font-mono font-bold ${isGlowing ? 'text-white' : 'text-stone-300'}`}>
                        {digit}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Downward flow indicator */}
            {stepIndex < cascadeSteps.length - 1 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="absolute top-32 text-stone-600 animate-bounce"
              >
                <ChevronDown size={32} />
              </motion.div>
            )}

            {/* Result Badge */}
            {stepIndex === cascadeSteps.length - 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="mt-16 flex flex-col items-center"
              >
                <div className={`px-8 py-4 rounded-2xl border-2 ${isDivisible ? 'bg-emerald-950/80 border-emerald-900 text-emerald-400' : 'bg-stone-900 border-stone-800 text-stone-400'}`}>
                  <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    {isDivisible ? <Sparkles size={18} /> : null}
                    {isDivisible ? 'Divisible by 9!' : `Not Divisible (Remainder ${finalRoot})`}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* THE PROOF VIEW (Secondary View) */}
      {phase === 'proof' && (
        <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 sm:p-12 z-10 overflow-hidden">
          <div className="max-w-3xl w-full">
            <h3 className="text-xl font-serif text-stone-200 mb-8 border-b border-stone-800 pb-4">The Mathematical Engine</h3>
            
            {/* Example extraction of a 4-digit number for visual simplicity */}
            <div className="space-y-6 font-mono text-sm sm:text-lg text-stone-400">
              <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-800">
                <span className="text-white">Let's extract the thousands place:</span>
                <span className="text-blue-400 text-2xl font-bold bg-blue-950/50 px-4 py-2 rounded-lg">7000</span>
              </div>
              
              <div className="flex justify-between items-center pl-8">
                <span>Separate into multiples of 1000:</span>
                <span className="text-stone-200">7 × 1000</span>
              </div>
              
              <div className="flex justify-between items-center pl-8">
                <span>The Magic Split <span className="text-xs ml-2 bg-stone-800 px-2 py-1 rounded">(1000 = 999 + 1)</span>:</span>
                <span className="text-stone-200">7 × (999 + 1)</span>
              </div>
              
              <div className="flex justify-between items-center pl-8 bg-stone-900/50 p-4 rounded-xl">
                <span>Distribute the 7:</span>
                <span>
                  <span className="text-stone-600 line-through decoration-emerald-500 decoration-2">(7 × 999)</span>
                  <span className="mx-2">+</span>
                  <span className="text-emerald-400 font-bold text-xl drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">(7 × 1)</span>
                </span>
              </div>
            </div>

            <div className="mt-8 bg-emerald-950/30 border border-emerald-900 p-6 rounded-xl flex items-start gap-4 shadow-xl">
              <BookOpen size={24} className="text-emerald-500 shrink-0 mt-1" />
              <p className="text-stone-300 text-sm leading-relaxed">
                Because 999 is a multiple of 9, the entire <span className="font-mono bg-stone-900 px-1 rounded">(7 × 999)</span> chunk will <strong>always</strong> divide perfectly by 9. It dissolves into the background! The only piece left over that determines the remainder is the <span className="font-mono text-emerald-400 bg-stone-900 px-1 rounded">(7 × 1)</span>—the original digit itself. This happens to every place value.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS */}
      <div className="mt-6 flex gap-4 z-10 shrink-0">
        {phase === 'idle' && (
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Play size={18} /> Fracture Number
          </button>
        )}
        
        {phase !== 'idle' && (
          <button 
            onClick={handleReset}
            className="px-6 py-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} /> New Number
          </button>
        )}

        {(phase === 'cascading' && stepIndex === cascadeSteps.length - 1) && (
          <button 
            onClick={() => setPhase('proof')}
            className="px-6 py-4 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ml-auto flex items-center gap-2"
          >
            <BookOpen size={16} /> Why does this work?
          </button>
        )}
      </div>

    </div>
  );
}