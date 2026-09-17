'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Scale, ArrowRight, RotateCcw, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function MiddleTermSlicer() {
  // Equation Constants: 2x² - 5x + 3 = 0
  const a = 2;
  const b = -5;
  const c = 3;
  const targetProduct = a * c; // 6

  // Slicer State
  const [split1, setSplit1] = useState<number>(0);
  const split2 = b - split1; // Ensure they always sum to b (-5)
  const currentProduct = split1 * split2;

  // Step Machine
  // 0: Slicing Mode
  // 1: Sliced (4 terms)
  // 2: Grouped (Common factors extracted)
  // 3: Final Brackets
  // 4: Roots Extracted
  const [step, setStep] = useState<number>(0);

  const isCorrectSplit = currentProduct === targetProduct && (split1 === -2 || split1 === -3);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handleReset = () => {
    setStep(0);
    setSplit1(0);
  };

  const formatTerm = (val: number, suffix: string = '', isFirst: boolean = false) => {
    if (val === 0) return `0${suffix}`;
    if (isFirst) return `${val === 1 && suffix !== '' ? '' : val === -1 && suffix !== '' ? '-' : val}${suffix}`;
    
    const absVal = Math.abs(val);
    const numStr = absVal === 1 && suffix !== '' ? '' : absVal;
    return val > 0 ? `+ ${numStr}${suffix}` : `- ${numStr}${suffix}`;
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Scissors className="text-amber-500" /> The Middle-Term Slicer
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Solving quadratics by factoring: $ax^2 + bx + c = 0$.
          </p>
        </div>
        {step > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Equation
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-start pt-20 p-6">
          
          {/* Digital Scale Check */}
          <AnimatePresence>
            {step === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className={`absolute top-6 flex items-center gap-6 px-6 py-3 rounded-xl border-2 transition-colors ${
                  isCorrectSplit ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-stone-900 border-stone-700'
                }`}
              >
                <Scale className={isCorrectSplit ? "text-emerald-400" : "text-stone-400"} size={20} />
                <div className="flex items-center gap-3 font-mono font-bold text-lg">
                  <span className="text-stone-400">Target a×c:</span>
                  <span className="text-sky-400">{targetProduct}</span>
                </div>
                <div className="w-px h-6 bg-stone-700"></div>
                <div className="flex items-center gap-3 font-mono font-bold text-lg">
                  <span className="text-stone-400">Your Split:</span>
                  <span className={isCorrectSplit ? "text-emerald-400" : "text-amber-400"}>
                    {split1} × {split2} = {currentProduct}
                  </span>
                </div>
                {isCorrectSplit && <CheckCircle2 className="text-emerald-400 ml-2" />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Equation Display Zone */}
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <motion.div layout className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-5xl font-mono font-bold text-white">
              
              {step === 0 && (
                <>
                  <motion.div layout className="bg-stone-900 border-2 border-stone-700 px-4 py-2 rounded-xl">2x²</motion.div>
                  <motion.div 
                    layout 
                    className={`border-4 px-6 py-2 rounded-xl relative overflow-hidden transition-colors ${
                      isCorrectSplit ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'bg-stone-900 border-stone-700'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-amber-400">-5x</span>
                      {/* Split Preview */}
                      <span className="text-sm text-stone-400 mt-1 flex gap-2">
                        <span>{formatTerm(split1, 'x', true)}</span>
                        <span>{formatTerm(split2, 'x', false)}</span>
                      </span>
                    </div>
                  </motion.div>
                  <motion.div layout className="bg-stone-900 border-2 border-stone-700 px-4 py-2 rounded-xl">+ 3</motion.div>
                  <motion.div layout className="text-stone-600">= 0</motion.div>
                </>
              )}

              {step === 1 && (
                <>
                  <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-sky-950/40 border-2 border-sky-900 text-sky-200 px-4 py-2 rounded-xl">2x²</motion.div>
                  <motion.div layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-sky-950/40 border-2 border-sky-900 text-sky-200 px-4 py-2 rounded-xl">{formatTerm(split1, 'x', false)}</motion.div>
                  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-950/40 border-2 border-emerald-900 text-emerald-200 px-4 py-2 rounded-xl">{formatTerm(split2, 'x', false)}</motion.div>
                  <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-950/40 border-2 border-emerald-900 text-emerald-200 px-4 py-2 rounded-xl">+ 3</motion.div>
                  <motion.div layout className="text-stone-600">= 0</motion.div>
                </>
              )}

              {step === 2 && (
                <>
                  <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-sky-950/60 border-2 border-sky-500 text-sky-100 px-6 py-4 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    <span className="text-sky-400">2x</span>
                    <span className="text-white">(x - 1)</span>
                  </motion.div>
                  <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-950/60 border-2 border-emerald-500 text-emerald-100 px-6 py-4 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <span className="text-emerald-400">- 3</span>
                    <span className="text-white">(x - 1)</span>
                  </motion.div>
                  <motion.div layout className="text-stone-600">= 0</motion.div>
                </>
              )}

              {step === 3 && (
                <>
                  <motion.div layout initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="bg-purple-950/60 border-2 border-purple-500 text-white px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                    (2x - 3)
                  </motion.div>
                  <motion.div layout initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-purple-950/60 border-2 border-purple-500 text-white px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                    (x - 1)
                  </motion.div>
                  <motion.div layout className="text-stone-600">= 0</motion.div>
                </>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-6 w-full items-center">
                  <div className="flex items-center gap-8">
                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="bg-stone-900 border-2 border-stone-700 px-6 py-3 rounded-xl flex items-center gap-4">
                      <span className="text-stone-400">2x - 3 = 0</span>
                      <ArrowRight className="text-stone-600" />
                      <span className="text-rose-400 font-bold text-4xl">x = 3/2</span>
                    </motion.div>
                    
                    <span className="text-stone-600 text-xl uppercase tracking-widest">or</span>

                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.1 }} className="bg-stone-900 border-2 border-stone-700 px-6 py-3 rounded-xl flex items-center gap-4">
                      <span className="text-stone-400">x - 1 = 0</span>
                      <ArrowRight className="text-stone-600" />
                      <span className="text-rose-400 font-bold text-4xl">x = 1</span>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Action Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Slicer Controls</span>
              <Scissors size={14} className="text-amber-500" />
            </div>

            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div key="controls-0" exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-stone-400 font-bold">Split Part 1</span>
                      <span className="text-white bg-stone-950 px-2 rounded border border-stone-700">{split1}</span>
                    </div>
                    <input type="range" min="-10" max="10" step="1" value={split1} onChange={(e) => setSplit1(parseInt(e.target.value))} className="w-full accent-amber-500" />
                  </div>

                  <div className="flex flex-col gap-2 opacity-50 pointer-events-none">
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-stone-400 font-bold">Split Part 2 (Auto)</span>
                      <span className="text-white bg-stone-950 px-2 rounded border border-stone-700">{split2}</span>
                    </div>
                    <input type="range" min="-10" max="10" step="1" value={split2} readOnly className="w-full accent-amber-500" />
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={!isCorrectSplit}
                    className={`py-4 font-bold text-lg uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isCorrectSplit ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-stone-950 text-stone-600 border border-stone-800'
                    }`}
                  >
                    <Scissors size={20} /> Slice Middle Term
                  </button>
                </motion.div>
              ) : (
                <motion.div key="controls-next" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                  {step === 1 && <button onClick={handleNext} className="py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg">Group Factors</button>}
                  {step === 2 && <button onClick={handleNext} className="py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg">Merge Brackets</button>}
                  {step === 3 && <button onClick={handleNext} className="py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg">Extract Roots</button>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Layers className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Factorization Logic</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      To split the middle term (<strong className="text-amber-400 font-mono">-5x</strong>), we need two numbers that:
                    </p>
                    <ul className="text-stone-400 text-xs space-y-2 list-disc pl-4">
                      <li>Sum to equal <strong className="text-white">b (-5)</strong>.</li>
                      <li>Multiply to equal <strong className="text-white">a × c (2 × 3 = 6)</strong>.</li>
                    </ul>
                    {!isCorrectSplit ? (
                       <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg flex items-start gap-3 mt-2">
                         <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                         <span className="text-stone-400 text-xs leading-relaxed">Adjust the dial. The slicer will only activate when the scale balances.</span>
                       </div>
                    ) : (
                      <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg flex items-start gap-3 mt-2">
                         <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                         <span className="text-emerald-400 text-xs leading-relaxed font-bold">Perfect! -2 and -3 multiply to 6 and sum to -5. Slice it!</span>
                       </div>
                    )}
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The middle block shattered into <strong className="text-sky-400 font-mono">-2x</strong> and <strong className="text-emerald-400 font-mono">-3x</strong>. We now have four terms instead of three.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg mt-2">
                      <p className="text-stone-400 text-xs leading-relaxed">
                        Next, we group them into pairs to pull out common factors.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Look closely at the blocks. The magic of splitting the middle term correctly means a common binomial factor has appeared: <strong className="text-white font-mono">(x - 1)</strong>.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg mt-2">
                      <p className="text-stone-400 text-xs leading-relaxed">
                        Because both remaining terms share <strong className="text-white">(x - 1)</strong>, we can extract it entirely.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The equation is now perfectly factored! 
                    </p>
                    <div className="bg-purple-950/20 border border-purple-900/50 p-4 rounded-lg mt-2">
                      <p className="text-purple-200/80 text-xs leading-relaxed">
                        Zero Product Property: If two blocks multiply to equal 0, then at least one of those blocks MUST be 0.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-rose-500">
                      <CheckCircle2 size={24} />
                      <h3 className="font-bold text-lg uppercase tracking-widest">Roots Found</h3>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      By setting each bracket to 0 individually, we easily extract the roots of the original quadratic polynomial!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}