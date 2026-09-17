'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Package, Zap, AlertTriangle, ArrowDownCircle, CheckCircle2, RotateCcw, Layers } from 'lucide-react';

export default function SubstitutionScale() {
  // Mode: 'solvable' (x + 2y = 5, 2x + y = 7) OR 'parallel' (x + 2y = 4, 2x + 4y = 12)
  const [mode, setMode] = useState<'solvable' | 'parallel'>('solvable');
  
  // Step Machine
  // 0: Initial
  // 1: Isolate x in Eq 1 (Create Package)
  // 2: Substitute Package into Eq 2
  // 3: Simplify (Solve or Trap)
  const [step, setStep] = useState<number>(0);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleReset = () => setStep(0);
  
  const toggleMode = (newMode: 'solvable' | 'parallel') => {
    setMode(newMode);
    setStep(0);
  };

  // Visual Blocks
  const XCube = () => (
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 border-2 border-blue-400 rounded-md shadow-[0_0_15px_rgba(37,99,235,0.5)] flex items-center justify-center font-bold text-white font-serif">
      x
    </div>
  );

  const YSphere = ({ isNegative = false }: { isNegative?: boolean }) => (
    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-bold text-white font-serif shadow-lg ${
      isNegative ? 'bg-rose-600 border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'bg-yellow-500 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
    }`}>
      {isNegative ? '-y' : 'y'}
    </div>
  );

  const ConstBlock = ({ val }: { val: number }) => (
    <div className="px-3 py-2 sm:px-4 sm:py-2 bg-stone-700 border-2 border-stone-500 rounded-lg shadow-lg flex items-center justify-center font-bold text-white font-mono">
      {val}
    </div>
  );

  // The Isolated Package Component
  const SubstitutionPackage = () => (
    <motion.div 
      layoutId="sub-package"
      className="flex items-center gap-1 p-2 bg-emerald-950/40 border-2 border-dashed border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-sm"
    >
      <ConstBlock val={mode === 'solvable' ? 5 : 4} />
      <YSphere isNegative />
      <YSphere isNegative />
    </motion.div>
  );

  // Determine Scale 2 Imbalance
  let scale2Status: 'balanced' | 'unbalanced' = 'balanced';
  if (step === 3 && mode === 'parallel') scale2Status = 'unbalanced';

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Scale className="text-emerald-500" /> The Substitution Scale
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Using physical weights to substitute variables between equations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={handleReset} className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE SCALES) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 gap-8 justify-center">
          
          {/* SCALE 1 (Equation 1) */}
          <div className="w-full flex flex-col items-center">
            <div className="text-sky-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              Equation 1 <span className="text-stone-500 font-mono lowercase">({mode === 'solvable' ? 'x + 2y = 5' : 'x + 2y = 4'})</span>
            </div>
            
            <div className="w-full max-w-lg relative flex items-end justify-between px-8 pb-2 border-b-4 border-stone-600">
              {/* Pivot */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-6 h-6 rotate-45 bg-stone-500 rounded-sm"></div>

              {/* Left Pan */}
              <div className="flex items-end gap-2 min-h-[50px]">
                <XCube />
                <AnimatePresence>
                  {step === 0 && (
                    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, x: 100, y: -50 }} className="flex gap-2">
                      <YSphere />
                      <YSphere />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Pan */}
              <div className="flex items-end gap-2 min-h-[50px]">
                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    <motion.div key="const1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ConstBlock val={mode === 'solvable' ? 5 : 4} />
                    </motion.div>
                  ) : (
                    <motion.div key="package1" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                      <SubstitutionPackage />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Transfer Animation Path */}
          <div className="h-16 w-full flex items-center justify-center relative z-20">
            <AnimatePresence>
              {step === 2 && (
                <motion.div 
                  initial={{ y: -60, opacity: 0 }} 
                  animate={{ y: 60, opacity: 1 }} 
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.8, type: 'spring' }}
                  className="absolute"
                >
                  <ArrowDownCircle size={32} className="text-emerald-500 animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SCALE 2 (Equation 2) */}
          <div className="w-full flex flex-col items-center">
            <div className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              Equation 2 <span className="text-stone-500 font-mono lowercase">({mode === 'solvable' ? '2x + y = 7' : '2x + 4y = 12'})</span>
            </div>
            
            <motion.div 
              animate={{ rotate: scale2Status === 'unbalanced' ? -15 : 0 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              className="w-full max-w-lg relative flex items-end justify-between px-8 pb-2 border-b-4 border-stone-600 origin-bottom"
            >
              {/* Pivot */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-6 h-6 rotate-45 bg-stone-500 rounded-sm"></div>

              {/* Left Pan */}
              <div className="flex items-end gap-2 min-h-[50px] flex-wrap max-w-[200px]">
                <AnimatePresence mode="wait">
                  {step < 2 ? (
                    <motion.div key="x-cubes" exit={{ scale: 0, opacity: 0 }} className="flex gap-2">
                      <XCube /><XCube />
                      {mode === 'parallel' && <div className="flex gap-1 ml-2"><YSphere /><YSphere /><YSphere /><YSphere /></div>}
                      {mode === 'solvable' && <div className="ml-2"><YSphere /></div>}
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div key="packages" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                      <SubstitutionPackage />
                      <SubstitutionPackage />
                      <div className="flex gap-1 mt-1">
                        {mode === 'parallel' ? <><YSphere /><YSphere /><YSphere /><YSphere /></> : <YSphere />}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="simplified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 flex-wrap items-center">
                      {mode === 'solvable' ? (
                        <>
                          <ConstBlock val={10} />
                          <YSphere isNegative /><YSphere isNegative /><YSphere isNegative />
                        </>
                      ) : (
                        <div className="relative">
                          <ConstBlock val={8} />
                          {/* Annihilation Explosion */}
                          <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0 bg-rose-500 rounded-full blur-xl"></motion.div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Pan */}
              <div className="flex items-end gap-2 min-h-[50px]">
                 <ConstBlock val={mode === 'solvable' ? 7 : 12} />
              </div>
            </motion.div>
          </div>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Mode Selector */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-2 shadow-xl flex gap-2">
            <button 
              onClick={() => toggleMode('solvable')}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === 'solvable' ? 'bg-stone-800 text-white shadow-inner' : 'text-stone-500 hover:text-stone-300'}`}
            >
              Standard System
            </button>
            <button 
              onClick={() => toggleMode('parallel')}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'parallel' ? 'bg-rose-950/50 text-rose-400 border border-rose-900/50 shadow-inner' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <AlertTriangle size={14} /> The Trap
            </button>
          </div>

          {/* Interaction Console */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Layers className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Substitution Engine</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full">
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      We have two scales (equations) balancing two types of weights (<strong className="text-blue-400">x cubes</strong> and <strong className="text-yellow-400">y spheres</strong>). 
                    </p>
                    <p className="text-stone-400 text-xs">
                      To solve this, we must first "isolate" a variable on Scale 1.
                    </p>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg">
                      Isolate 'x' on Scale 1
                    </button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      By moving the yellow spheres to the right side, we've isolated <strong className="text-blue-400">x</strong>. 
                    </p>
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg">
                      <p className="text-emerald-400 text-xs leading-relaxed">
                        We now know exactly what <strong className="text-blue-400">x</strong> weighs! It is equal to the glowing package: <strong className="font-mono">{mode === 'solvable' ? '(5 - 2y)' : '(4 - 2y)'}</strong>.
                      </p>
                    </div>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      Drop Package into Eq 2 <ArrowDownCircle size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The two <strong className="text-blue-400">x cubes</strong> on Scale 2 have morphed into two copies of our glowing package.
                    </p>
                    <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-lg">
                      <p className="text-amber-400 text-xs leading-relaxed font-bold">
                        AHA! Look at Scale 2. The blue cubes are gone. We now only have ONE unknown weight type (yellow spheres).
                      </p>
                    </div>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                      <Zap size={18} /> Simplify Scale 2
                    </button>
                  </motion.div>
                )}

                {step === 3 && mode === 'solvable' && (
                  <motion.div key="s3-solvable" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 size={24} />
                      <h3 className="font-bold text-lg">Equation Simplified</h3>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The packages broke open. The constants merged into <strong className="text-white">10</strong>, and the negative spheres combined to <strong className="text-rose-400">-3y</strong>.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg font-mono text-center text-white text-lg">
                      10 - 3y = 7
                    </div>
                    <p className="text-stone-400 text-xs">
                      This is now a simple linear equation in one variable. You can easily solve for y!
                    </p>
                  </motion.div>
                )}

                {step === 3 && mode === 'parallel' && (
                  <motion.div key="s3-parallel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 text-rose-500">
                      <AlertTriangle size={24} className="animate-pulse" />
                      <h3 className="font-bold text-lg uppercase tracking-widest">System Crash</h3>
                    </div>
                    <p className="text-rose-200/90 text-sm leading-relaxed">
                      When the packages broke open, the four negative spheres ($-4y$) collided with the four positive spheres ($+4y$) and they <strong className="text-white">annihilated each other!</strong>
                    </p>
                    <div className="bg-rose-950/50 border border-rose-900/50 p-4 rounded-lg font-mono text-center text-white text-lg flex items-center justify-center gap-4">
                      <span>8</span> <span className="text-rose-500 font-bold">≠</span> <span>12</span>
                    </div>
                    <p className="text-rose-300/80 text-xs">
                      Because 8 does not equal 12, this is a <strong>False Statement</strong>. The scale violently breaks, physically proving that these two parallel lines have <strong>no common solution</strong>.
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