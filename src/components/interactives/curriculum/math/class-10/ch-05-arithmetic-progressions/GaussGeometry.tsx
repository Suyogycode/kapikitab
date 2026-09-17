'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RotateCcw, BoxSelect, Calculator, Layers } from 'lucide-react';

export default function GaussGeometry() {
  // Sequence Constants
  const [a, setA] = useState<number>(2); // First term
  const [d, setD] = useState<number>(3); // Common difference
  const [n, setN] = useState<number>(5); // Number of terms

  // Step Machine
  // 0: Original Sequence (Jagged Bars)
  // 1: Summon Gauss (Duplicate & Reverse hovering)
  // 2: The Lock (Dropped into a perfect rectangle)
  const [step, setStep] = useState<number>(0);

  // Math Calculations
  const sequence = Array.from({ length: n }, (_, i) => a + i * d);
  const reversedSequence = [...sequence].reverse();
  
  const lastTerm = sequence[n - 1]; // l
  const pairSum = a + lastTerm; // a + l
  const totalArea = n * pairSum; // 2S
  const trueSum = totalArea / 2; // S

  const handleNext = () => setStep(s => Math.min(s + 1, 2));
  const handleReset = () => setStep(0);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Wand2 className="text-emerald-500" /> Gauss's Geometry
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the sum of an Arithmetic Progression: $S = \frac{n}{2}(a + l)$
          </p>
        </div>
        {step > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Sequence
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE CHART) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-end p-6 pt-20">
          
          {/* Dimension Lines (Aha! Moment) */}
          <AnimatePresence>
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="absolute inset-x-12 top-10 bottom-12 pointer-events-none"
              >
                {/* Top Width Label (n) */}
                <div className="absolute -top-8 left-0 right-0 flex items-center justify-center border-t-2 border-dashed border-stone-500 pt-2">
                  <div className="bg-[#1c1917] px-4 font-mono font-bold text-white tracking-widest">
                    Width = n = {n} terms
                  </div>
                </div>
                
                {/* Right Height Label (a + l) */}
                <div className="absolute top-0 bottom-0 -right-8 flex items-center justify-center border-r-2 border-dashed border-stone-500 pr-2">
                  <div className="bg-[#1c1917] py-4 px-1 font-mono font-bold text-white tracking-widest rotate-90 whitespace-nowrap">
                    Height = (a + l) = {pairSum}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 w-full h-[400px] sm:h-[500px] border-b-4 border-stone-700 pb-2 relative z-10">
            {sequence.map((val, index) => {
              const heightPercent = (val / pairSum) * 100;
              const gaussHeightPercent = (reversedSequence[index] / pairSum) * 100;

              return (
                <div key={index} className="flex flex-col justify-end w-12 sm:w-16 h-full relative">
                  
                  {/* Gauss's Duplicate Bar (Neon Green) */}
                  <AnimatePresence>
                    {step > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -100, rotate: 180 }}
                        animate={{ 
                          opacity: 1, 
                          y: step === 1 ? -20 : 0, 
                          rotate: 180 
                        }}
                        transition={{ type: "spring", bounce: step === 2 ? 0.6 : 0.2 }}
                        style={{ height: `${gaussHeightPercent}%` }}
                        className={`w-full bg-emerald-500 border-x-2 border-b-2 border-emerald-400 rounded-b-md flex items-end justify-center pb-2 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20 absolute top-0 ${step === 2 ? 'relative top-auto' : ''}`}
                      >
                        <span className="text-emerald-950 font-bold font-mono rotate-180 text-sm sm:text-base">{reversedSequence[index]}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Original Bar (Blue) */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-blue-600 border-x-2 border-t-2 border-blue-400 rounded-t-md flex items-start justify-center pt-2 shadow-lg relative z-10"
                  >
                    <span className="text-white font-bold font-mono text-sm sm:text-base">{val}</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* AP Builder */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Sequence Builder</span>
              <Layers size={14} className="text-blue-500" />
            </div>
            
            <div className={`flex flex-col gap-5 transition-opacity ${step > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-blue-400 font-bold">First Term (a)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{a}</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={a} onChange={(e) => setA(parseInt(e.target.value))} className="w-full accent-blue-500" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-blue-400 font-bold">Difference (d)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{d}</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={d} onChange={(e) => setD(parseInt(e.target.value))} className="w-full accent-blue-500" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-blue-400 font-bold">Terms (n)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{n}</span>
                </div>
                <input type="range" min="3" max="12" step="1" value={n} onChange={(e) => setN(parseInt(e.target.value))} className="w-full accent-blue-500" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.button key="btn-0" onClick={handleNext} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 mt-2">
                  <Wand2 size={18} /> Summon Gauss
                </motion.button>
              ) : step === 1 ? (
                <motion.button key="btn-1" onClick={handleNext} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 mt-2">
                  <BoxSelect size={18} /> Lock Rectangle
                </motion.button>
              ) : (
                <motion.button key="btn-2" onClick={handleReset} className="w-full py-4 bg-stone-700 hover:bg-stone-600 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                  <RotateCcw size={18} /> Restart
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Gauss's Logic</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full">
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      We have an uneven, jagged progression. Adding these numbers up manually is slow and tedious.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg">
                      <p className="text-stone-400 text-xs leading-relaxed font-mono">
                        S = {sequence.join(' + ')}
                      </p>
                    </div>
                    <p className="text-stone-400 text-xs">
                      What if we duplicate the entire sequence, reverse it, and add it to itself?
                    </p>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The neon green blocks are the exact same sequence, just flipped upside down and backwards!
                    </p>
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg">
                      <p className="text-emerald-400 text-xs leading-relaxed font-bold uppercase tracking-widest mb-1">Notice the alignment:</p>
                      <p className="text-emerald-100/80 text-xs leading-relaxed">
                        The smallest blue bar (<strong className="text-blue-400">{a}</strong>) is perfectly paired with the largest green bar (<strong className="text-emerald-500">{lastTerm}</strong>). Click "Lock Rectangle" to drop them in.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h3 className="text-amber-400 font-bold text-lg uppercase tracking-widest mb-1">The Flawless Rectangle</h3>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Every single peak filled a valley. The chaotic sequence is now a perfect rectangle!
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between font-mono text-sm">
                        <span className="text-stone-400">Total Area (2S) =</span>
                        <span className="text-white">{n} × {pairSum} = {totalArea}</span>
                      </div>
                      <div className="w-full h-px bg-stone-800"></div>
                      <div className="flex justify-between font-mono font-bold text-base">
                        <span className="text-emerald-400">Single Sum (S) =</span>
                        <span className="text-emerald-400">{totalArea} / 2 = {trueSum}</span>
                      </div>
                    </div>
                    <p className="text-stone-400 text-xs">
                      Because the rectangle contains <em>two</em> identical sequences, we just divide the area by 2. This visually proves the formula $S = \frac{n}{2}(a + l)$.
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