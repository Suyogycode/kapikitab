'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Crosshair, Zap, RotateCcw, AlertTriangle, Hammer } from 'lucide-react';

export default function EliminationForge() {
  // Base Equations
  const eq1 = { a: 9, b: -4, c: 2000 };
  const eq2 = { a: 7, b: -3, c: 2000 };

  // Multiplier Cannons
  const [m1, setM1] = useState<number>(3);
  const [m2, setM2] = useState<number>(4);

  // Forge State Machine
  // 0: Aiming (Adjusting multipliers)
  // 1: Charged (Multiplied, ready to smash)
  // 2: Smashed (Variables eliminated, solution revealed)
  // 3: Error (Attempted smash without matching coefficients)
  const [step, setStep] = useState<number>(0);

  // Derived Multiplied Values
  const A1 = eq1.a * m1; const B1 = eq1.b * m1; const C1 = eq1.c * m1;
  const A2 = eq2.a * m2; const B2 = eq2.b * m2; const C2 = eq2.c * m2;

  // Check if coefficients match for elimination (either X or Y)
  const isXMatch = A1 === A2 || A1 === -A2;
  const isYMatch = B1 === B2 || B1 === -B2;
  const isReadyToSmash = isXMatch || isYMatch;

  const handleFire = () => setStep(1);
  const handleSmash = () => {
    if (isReadyToSmash) {
      setStep(2);
    } else {
      setStep(3);
      setTimeout(() => setStep(1), 2000); // Revert error after 2 seconds
    }
  };
  const handleReset = () => {
    setStep(0);
    setM1(3);
    setM2(4);
  };

  // Helper for rendering terms with correct signs
  const formatTerm = (coef: number, variable: string, isFirst: boolean = false) => {
    if (isFirst) return `${coef}${variable}`;
    return coef < 0 ? `- ${Math.abs(coef)}${variable}` : `+ ${coef}${variable}`;
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Hammer className="text-amber-500" /> The Elimination Forge
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Multiply the beams. Match the coefficients. Smash them together.
          </p>
        </div>
        {step > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Forge
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE FORGE) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 gap-12">
          
          {/* EQUATION BEAM 1 */}
          <div className="flex items-center gap-4 w-full max-w-lg relative z-20">
            {/* Multiplier Cannon 1 */}
            <div className={`flex flex-col items-center gap-2 transition-opacity ${step > 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <button onClick={() => setM1(m => m + 1)} className="w-10 h-8 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-t-lg flex items-center justify-center font-bold">+</button>
              <div className="w-12 h-12 bg-amber-600 border-2 border-amber-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                {m1}
              </div>
              <button onClick={() => setM1(m => m - 1)} className="w-10 h-8 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-b-lg flex items-center justify-center font-bold">-</button>
            </div>
            
            <div className="text-amber-500 font-bold text-2xl">×</div>

            {/* The Beam */}
            <motion.div 
              animate={{ y: step === 2 ? 40 : 0 }}
              className="flex-1 bg-stone-900 border-y-4 border-stone-700 h-20 rounded-r-lg flex items-center justify-between px-6 shadow-xl"
            >
              <div className="flex items-center gap-4 font-mono text-2xl font-bold text-white w-full">
                <motion.span animate={{ color: step > 0 ? '#38bdf8' : '#ffffff' }} className="w-20 text-center">
                  {step === 0 ? formatTerm(eq1.a, 'x', true) : formatTerm(A1, 'x', true)}
                </motion.span>
                
                <AnimatePresence>
                  {!(step === 2 && isYMatch) && (
                    <motion.span 
                      exit={{ scale: 2, opacity: 0, color: '#f43f5e' }}
                      animate={{ color: step > 0 ? '#f43f5e' : '#ffffff' }} 
                      className="w-24 text-center"
                    >
                      {step === 0 ? formatTerm(eq1.b, 'y') : formatTerm(B1, 'y')}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                <span className="text-stone-500">=</span>
                
                <motion.span animate={{ color: step > 0 ? '#fbbf24' : '#ffffff' }} className="flex-1 text-right">
                  {step === 0 ? eq1.c : C1}
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* EQUATION BEAM 2 */}
          <div className="flex items-center gap-4 w-full max-w-lg relative z-10">
            {/* Multiplier Cannon 2 */}
            <div className={`flex flex-col items-center gap-2 transition-opacity ${step > 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <button onClick={() => setM2(m => m + 1)} className="w-10 h-8 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-t-lg flex items-center justify-center font-bold">+</button>
              <div className="w-12 h-12 bg-amber-600 border-2 border-amber-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                {m2}
              </div>
              <button onClick={() => setM2(m => m - 1)} className="w-10 h-8 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-b-lg flex items-center justify-center font-bold">-</button>
            </div>
            
            <div className="text-amber-500 font-bold text-2xl">×</div>

            {/* The Beam */}
            <motion.div 
              animate={{ y: step === 2 ? -40 : 0 }}
              className="flex-1 bg-stone-900 border-y-4 border-stone-700 h-20 rounded-r-lg flex items-center justify-between px-6 shadow-xl"
            >
              <div className="flex items-center gap-4 font-mono text-2xl font-bold text-white w-full">
                <motion.span animate={{ color: step > 0 ? '#38bdf8' : '#ffffff' }} className="w-20 text-center">
                  {step === 0 ? formatTerm(eq2.a, 'x', true) : formatTerm(A2, 'x', true)}
                </motion.span>
                
                <AnimatePresence>
                  {!(step === 2 && isYMatch) && (
                    <motion.span 
                      exit={{ scale: 2, opacity: 0, color: '#f43f5e' }}
                      animate={{ color: step > 0 ? '#f43f5e' : '#ffffff' }} 
                      className="w-24 text-center"
                    >
                      {step === 0 ? formatTerm(eq2.b, 'y') : formatTerm(B2, 'y')}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                <span className="text-stone-500">=</span>
                
                <motion.span animate={{ color: step > 0 ? '#fbbf24' : '#ffffff' }} className="flex-1 text-right">
                  {step === 0 ? eq2.c : C2}
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* Error Flash */}
          <AnimatePresence>
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4"
              >
                <AlertTriangle size={64} className="text-rose-500 animate-pulse" />
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Smash Failed!</h2>
                <p className="text-rose-200">The coefficients do not match. No variables were eliminated.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final Result Overlay */}
          <AnimatePresence>
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="absolute bottom-10 bg-emerald-950 border-2 border-emerald-500 px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] z-40"
              >
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1 text-center">Resulting Equation</div>
                <div className="text-4xl font-mono font-bold text-white">
                  {isYMatch ? `${A1 - A2}x = ${C1 - C2}` : `${B1 - B2}y = ${C1 - C2}`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Action Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-4">
            
            {step === 0 && (
              <button onClick={handleFire} className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] flex items-center justify-center gap-3">
                <Crosshair size={24} /> Fire Cannons
              </button>
            )}

            {(step === 1 || step === 3) && (
              <button onClick={handleSmash} className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(225,29,72,0.5)] flex items-center justify-center gap-3">
                <Flame size={24} /> Subtract & Smash
              </button>
            )}

            {step === 2 && (
              <button onClick={handleReset} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3">
                <RotateCcw size={24} /> Reset Forge
              </button>
            )}
            
          </div>

          {/* Logic Explanation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Zap className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Elimination Engine</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full">
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      We cannot solve an equation with two different variables. We must <strong className="text-white">eliminate</strong> one of them.
                    </p>
                    <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-lg">
                      <p className="text-amber-400 text-xs leading-relaxed font-bold uppercase tracking-widest mb-1">Your Objective:</p>
                      <p className="text-amber-100/80 text-xs leading-relaxed">
                        Adjust the multiplier cannons so that the <strong className="text-sky-400">x</strong> coefficients OR the <strong className="text-rose-400">y</strong> coefficients become perfectly identical.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The equations have been scaled up. Every term inside the beam was multiplied by your chosen constant.
                    </p>
                    <div className={`p-4 rounded-lg border ${isReadyToSmash ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-stone-950 border-stone-800'}`}>
                      {isReadyToSmash ? (
                        <p className="text-emerald-400 text-xs leading-relaxed font-bold">
                          Perfect! The {isYMatch ? 'y' : 'x'} coefficients match. Hit SUBTRACT to smash the equations together and eliminate the variable!
                        </p>
                      ) : (
                        <p className="text-stone-400 text-xs leading-relaxed">
                          Wait... neither the x nor y coefficients match yet. If you smash them now, nothing will be eliminated. Reset and adjust your multipliers!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 text-rose-500">
                      <Flame size={24} />
                      <h3 className="font-bold text-lg">Variable Eliminated!</h3>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      When the equations smashed together, we subtracted the bottom beam from the top beam.
                    </p>
                    <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-lg">
                      <p className="text-rose-200/90 text-xs leading-relaxed">
                        Because the <strong className="font-mono text-rose-400">{isYMatch ? '-12y' : 'x'}</strong> blocks were identical, they violently shattered each other into zero dust! We are left with a simple equation that only has one variable remaining.
                      </p>
                    </div>
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