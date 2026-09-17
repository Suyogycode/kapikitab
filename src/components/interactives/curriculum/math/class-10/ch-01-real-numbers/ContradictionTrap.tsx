'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Settings, AlertTriangle, ShieldCheck, ChevronRight, RotateCcw } from 'lucide-react';

export default function ContradictionTrap() {
  // Step State Machine:
  // 0: Hypothesis
  // 1: Squared (2b² = a²)
  // 2: a is even (a cracks)
  // 3: Substitution (b² = 2c²)
  // 4: b is even (b cracks)
  // 5: Contradiction!
  const [step, setStep] = useState<number>(0);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handleReset = () => setStep(0);

  // Derived states for visual elements
  const isACracked = step >= 2;
  const isBCracked = step >= 4;
  const isLockShattered = step >= 4;

  const Block = ({ label, isCracked }: { label: string, isCracked: boolean }) => (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
      <AnimatePresence>
        {!isCracked ? (
          <motion.div
            key="solid"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            className="absolute inset-0 bg-gradient-to-br from-stone-400 to-stone-600 border-2 border-stone-300 rounded-xl shadow-2xl flex items-center justify-center z-20"
          >
            <span className="text-4xl font-serif text-white font-bold drop-shadow-md">{label}</span>
          </motion.div>
        ) : (
          <motion.div
            key="cracked"
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className="absolute inset-0 bg-stone-900 border-2 border-dashed border-rose-500/50 rounded-xl shadow-inner flex flex-col items-center justify-center z-10 overflow-hidden"
          >
            <Settings className="text-rose-500 animate-[spin_4s_linear_infinite] absolute opacity-20" size={80} />
            <span className="text-rose-400 font-mono font-bold text-lg z-10 mb-1">Factor</span>
            <span className="text-3xl font-bold text-white z-10 bg-rose-600 px-3 py-1 rounded-lg">2</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className={step === 5 ? "text-rose-500 animate-pulse" : "text-amber-500"} /> 
            The Contradiction Trap
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Proving √2 is irrational by breaking the rules of mathematics.
          </p>
        </div>
        {step > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Restart Proof
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE */}
        <div className={`relative w-full lg:w-2/3 border-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 transition-colors duration-700 ${
          step === 5 ? 'bg-rose-950/20 border-rose-900/50' : 'bg-[#1c1917] border-stone-800'
        }`}>
          
          {/* Mathematical Visualizer */}
          <div className="flex items-center gap-8 sm:gap-12">
            
            {/* The Left Side of Equation */}
            <div className="text-5xl sm:text-7xl font-serif text-white font-bold w-32 text-center flex flex-col items-center gap-4">
              <AnimatePresence mode="wait">
                {step === 0 && <motion.span key="sqrt2" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>√2</motion.span>}
                {step === 1 && <motion.span key="2" initial={{opacity:0, scale:2}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-amber-400">2b²</motion.span>}
                {step === 2 && <motion.span key="2b2" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>2b²</motion.span>}
                {step === 3 && <motion.span key="4c2" initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="text-sky-400">4c²</motion.span>}
                {step >= 4 && <motion.span key="2c2" initial={{opacity:0, scale:2}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="text-amber-400">2c²</motion.span>}
              </AnimatePresence>
            </div>

            <div className="text-5xl text-stone-600 font-bold">=</div>

            {/* The Right Side (The Blocks) */}
            <div className="relative flex flex-col items-center gap-6">
              
              {/* Numerator */}
              <AnimatePresence mode="wait">
                {step < 3 ? (
                  <motion.div key="block-a" exit={{ opacity: 0, y: -50 }}>
                    <Block label={step === 0 ? "a" : "a²"} isCracked={isACracked} />
                  </motion.div>
                ) : (
                  <motion.div key="block-b-top" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
                     <Block label="b²" isCracked={isBCracked} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Coprime Lock (Divider line) */}
              <div className="relative w-32 sm:w-40 h-2 bg-stone-700 rounded-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {!isLockShattered ? (
                    <motion.div 
                      key="locked"
                      exit={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
                      className="absolute bg-emerald-500 border-4 border-[#1c1917] rounded-full p-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-30"
                    >
                      <Lock size={20} className="text-[#1c1917]" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="shattered"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute bg-rose-600 border-4 border-rose-950 rounded-full p-2 shadow-[0_0_30px_rgba(225,29,72,0.8)] z-30"
                    >
                      <Unlock size={20} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Denominator */}
              <AnimatePresence mode="wait">
                {step < 3 && (
                   <motion.div key="block-b" exit={{ opacity: 0, y: 50 }}>
                     <Block label={step === 0 ? "b" : "b²"} isCracked={false} />
                   </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Alarm Overlay */}
          <AnimatePresence>
            {step === 5 && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 bg-rose-600 text-white px-8 py-4 rounded-xl font-bold text-2xl tracking-widest uppercase shadow-[0_0_50px_rgba(225,29,72,0.6)] flex items-center gap-4"
              >
                <AlertTriangle size={32} />
                Contradiction!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LOGIC FLOW HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col flex-1 relative overflow-hidden">
            
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-800 pb-4">
              <span>Logical Deduction</span>
              <ShieldCheck size={16} className={isLockShattered ? "text-rose-500" : "text-emerald-500"} />
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Let's assume the opposite of what we want to prove. Assume <strong className="text-white">√2 is rational</strong>.
                    </p>
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg">
                      <p className="text-emerald-400 text-xs leading-relaxed">
                        This means it can be written as a fraction <strong>a/b</strong> where a and b are <strong>coprime</strong> (they share absolutely no common factors other than 1). The green lock secures this rule!
                      </p>
                    </div>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                      Square Both Sides <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Squaring removes the root: <strong className="text-white">2 = a² / b²</strong>. <br/>
                      Multiplying by b² gives us: <strong className="text-amber-400">2b² = a²</strong>.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg">
                      <p className="text-stone-400 text-xs leading-relaxed">
                        Look at the left side (2b²). Because it's multiplied by 2, it is an <strong>even number</strong>. If 2b² is even, then a² must also be even!
                      </p>
                    </div>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                      Deduce: 'a' must be Even <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Theorem 1.2 states: If 2 divides a², then 2 divides a.
                    </p>
                    <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-lg">
                      <p className="text-rose-400 text-xs leading-relaxed">
                        Block <strong>a</strong> just cracked open! It contains a hidden factor of 2. This means we can write <strong>a = 2c</strong> for some integer c.
                      </p>
                    </div>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                      Substitute a = 2c <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Substituting <strong>2c</strong> into our equation: <br/>
                      2b² = (2c)² <br/>
                      2b² = <strong className="text-sky-400">4c²</strong> <br/>
                      Dividing by 2 gives: <strong className="text-amber-400">b² = 2c²</strong>
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg">
                      <p className="text-stone-400 text-xs leading-relaxed">
                        Wait a minute. Now the right side (2c²) is an even number. That means b² must be even!
                      </p>
                    </div>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                      Deduce: 'b' must be Even <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      If b² is even, then <strong>b</strong> is also even. 
                    </p>
                    <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-lg">
                      <p className="text-rose-400 text-xs leading-relaxed">
                        Block <strong>b</strong> just cracked open! It ALSO contains a hidden factor of 2. Both blocks share a common factor!
                      </p>
                    </div>
                    <button onClick={handleNext} className="mt-auto w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                      Trigger the Trap <AlertTriangle size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h3 className="text-rose-400 font-bold text-lg">The Trap is Sprung!</h3>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      We assumed 'a' and 'b' were <strong>coprime</strong> (sharing no factors). But our math just proved they BOTH contain the factor 2!
                    </p>
                    <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-lg">
                      <p className="text-rose-200 text-xs leading-relaxed">
                        Because our perfect logic led to a broken rule, our very first assumption MUST be wrong. Therefore, √2 cannot be written as a fraction. <br/><br/>
                        <strong>√2 is Irrational.</strong>
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