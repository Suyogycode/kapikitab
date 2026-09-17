'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, RotateCcw, ArrowDownCircle, Shuffle, CheckCircle2, Triangle } from 'lucide-react';

export default function PythagoreanConverter() {
  // Step Machine
  // 0: Initial Pythagoras (AB² + BC² = AC²)
  // 1: Divided by AC²
  // 2: Grouped Squares ((AB/AC)² + (BC/AC)² = 1)
  // 3: Identity Revealed (cos²A + sin²A = 1)
  const [step, setStep] = useState<number>(0);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleReset = () => setStep(0);

  // Reusable component for the squared terms to keep the code clean
  const SquaredTerm = ({ base, color }: { base: string, color: string }) => (
    <div className={`flex items-start font-mono font-bold text-2xl sm:text-4xl ${color}`}>
      <span>{base}</span>
      <span className="text-lg sm:text-xl -mt-1 ml-0.5">2</span>
    </div>
  );

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Layers className="text-purple-500" /> The Pythagorean Converter
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Unmasking trigonometric identities using pure geometry.
          </p>
        </div>
        {step > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Sandbox
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE EQUATION SANDBOX) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#171717] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
          
          {/* Reference Triangle (Top Left) */}
          <div className="absolute top-6 left-6 opacity-60 flex flex-col items-center">
            <svg viewBox="0 0 120 100" className="w-24 h-24 mb-2 drop-shadow-lg">
              <polygon points="10,90 110,90 10,10" fill="none" stroke="#78716c" strokeWidth="3" />
              <path d="M 10 75 L 25 75 L 25 90" fill="none" stroke="#78716c" strokeWidth="2" />
              <text x="25" y="30" fill="#a8a29e" fontSize="16" fontWeight="bold" className="font-serif">A</text>
              <text x="5" y="105" fill="#a8a29e" fontSize="16" fontWeight="bold" className="font-serif">B</text>
              <text x="115" y="105" fill="#a8a29e" fontSize="16" fontWeight="bold" className="font-serif">C</text>
              {/* Highlight Reference Angle A */}
              <path d="M 10 30 A 20 20 0 0 0 25 22" fill="none" stroke="#fbbf24" strokeWidth="2" />
            </svg>
            <div className="bg-stone-900 border border-stone-700 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Reference: Angle A
            </div>
          </div>

          {/* The Equation Engine */}
          <div className="w-full flex-1 flex items-center justify-center relative">
            <motion.div layout className="flex items-center justify-center gap-4 sm:gap-8">
              
              {/* Term 1: AB² / ... */}
              <motion.div layout className="flex flex-col items-center justify-center relative perspective-[1000px]">
                <AnimatePresence mode="wait">
                  {step < 2 ? (
                    <motion.div key="term1-frac" className="flex flex-col items-center gap-2">
                      <motion.div layoutId="ab2"><SquaredTerm base="AB" color="text-amber-400" /></motion.div>
                      {step === 1 && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="w-full h-1 bg-stone-600 rounded-full" />
                      )}
                      {step === 1 && (
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><SquaredTerm base="AC" color="text-sky-400" /></motion.div>
                      )}
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div key="term1-group" initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} exit={{ rotateX: -90 }} className="bg-stone-900 border-2 border-stone-700 px-6 py-4 rounded-2xl shadow-xl flex items-start text-3xl sm:text-5xl font-mono font-bold">
                      <span className="text-stone-300 mr-1">(</span>
                      <div className="flex flex-col items-center text-2xl sm:text-4xl">
                        <span className="text-amber-400 border-b-2 border-stone-600 pb-1">AB</span>
                        <span className="text-sky-400 pt-1">AC</span>
                      </div>
                      <span className="text-stone-300 ml-1">)</span>
                      <span className="text-xl sm:text-2xl text-stone-400 -mt-2 ml-1">2</span>
                    </motion.div>
                  ) : (
                    <motion.div key="term1-trig" initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} className="bg-purple-950/40 border-2 border-purple-500 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-start text-3xl sm:text-5xl font-mono font-bold text-purple-300">
                      <span>cos</span>
                      <span className="text-xl sm:text-2xl text-purple-400 -mt-2 ml-1 mr-2">2</span>
                      <span>A</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div layout className="text-3xl sm:text-5xl font-bold text-stone-600">+</motion.div>

              {/* Term 2: BC² / ... */}
              <motion.div layout className="flex flex-col items-center justify-center relative perspective-[1000px]">
                <AnimatePresence mode="wait">
                  {step < 2 ? (
                    <motion.div key="term2-frac" className="flex flex-col items-center gap-2">
                      <motion.div layoutId="bc2"><SquaredTerm base="BC" color="text-emerald-400" /></motion.div>
                      {step === 1 && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="w-full h-1 bg-stone-600 rounded-full" />
                      )}
                      {step === 1 && (
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><SquaredTerm base="AC" color="text-sky-400" /></motion.div>
                      )}
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div key="term2-group" initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} exit={{ rotateX: -90 }} className="bg-stone-900 border-2 border-stone-700 px-6 py-4 rounded-2xl shadow-xl flex items-start text-3xl sm:text-5xl font-mono font-bold">
                      <span className="text-stone-300 mr-1">(</span>
                      <div className="flex flex-col items-center text-2xl sm:text-4xl">
                        <span className="text-emerald-400 border-b-2 border-stone-600 pb-1">BC</span>
                        <span className="text-sky-400 pt-1">AC</span>
                      </div>
                      <span className="text-stone-300 ml-1">)</span>
                      <span className="text-xl sm:text-2xl text-stone-400 -mt-2 ml-1">2</span>
                    </motion.div>
                  ) : (
                    <motion.div key="term2-trig" initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} className="bg-rose-950/40 border-2 border-rose-500 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.4)] flex items-start text-3xl sm:text-5xl font-mono font-bold text-rose-300">
                      <span>sin</span>
                      <span className="text-xl sm:text-2xl text-rose-400 -mt-2 ml-1 mr-2">2</span>
                      <span>A</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div layout className="text-3xl sm:text-5xl font-bold text-stone-600">=</motion.div>

              {/* Term 3: AC² / ... (The Self-Destructing 1) */}
              <motion.div layout className="flex flex-col items-center justify-center relative perspective-[1000px] min-w-[80px]">
                <AnimatePresence mode="wait">
                  {step < 2 ? (
                    <motion.div key="term3-frac" className="flex flex-col items-center gap-2">
                      <motion.div layoutId="ac2"><SquaredTerm base="AC" color="text-sky-400" /></motion.div>
                      {step === 1 && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="w-full h-1 bg-stone-600 rounded-full" />
                      )}
                      {step === 1 && (
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><SquaredTerm base="AC" color="text-sky-400" /></motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="term3-one" initial={{ scale: 2, opacity: 0, rotate: 180 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.6 }} className="text-6xl sm:text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                      1
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

            </motion.div>
          </div>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Action Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Equation Manipulator</span>
              <ArrowDownCircle size={14} className="text-sky-500" />
            </div>
            
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.button key="btn-1" onClick={handleNext} className="w-full py-6 bg-sky-600 hover:bg-sky-500 text-white font-bold text-lg uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-center gap-3">
                  <ArrowDownCircle size={20} /> Divide by AC²
                </motion.button>
              )}
              {step === 1 && (
                <motion.button key="btn-2" onClick={handleNext} className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3">
                  <Layers size={20} /> Group the Squares
                </motion.button>
              )}
              {step === 2 && (
                <motion.button key="btn-3" onClick={handleNext} className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3">
                  <Shuffle size={20} /> Apply Trig Identities
                </motion.button>
              )}
              {step === 3 && (
                <motion.button key="btn-4" onClick={handleReset} className="w-full py-6 bg-stone-700 hover:bg-stone-600 text-white font-bold text-lg uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3">
                  <RotateCcw size={20} /> Restart Derivation
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Triangle className="text-purple-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Geometric Proof</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      We always start with the absolute truth of a right-angled triangle: <strong className="text-white">The Pythagoras Theorem</strong>.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg mt-2">
                      <p className="text-stone-400 text-xs leading-relaxed text-center">
                        Hit the button above to mathematically divide both sides of the equation by the hypotenuse squared ($AC^2$).
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Because we divided <em>every</em> term by the same amount, the equation remains perfectly balanced.
                    </p>
                    <div className="bg-sky-950/20 border border-sky-900/50 p-4 rounded-lg flex items-start gap-3 mt-2">
                      <ArrowDownCircle className="text-sky-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-sky-200/80 text-xs leading-relaxed">
                        Look at the right side of the equation. Any number divided by itself equals <strong className="text-white font-bold text-sm">1</strong>. In the next step, this fraction will self-destruct!
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h3 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-1">Ratios Revealed</h3>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      By pulling the squares out of the fraction, the geometric ratios are exposed. 
                    </p>
                    <ul className="text-stone-400 text-xs space-y-2 mt-2 border-l-2 border-stone-700 pl-4">
                      <li>$\frac&#123;AB&#125;&#123;AC&#125;$ is the <strong className="text-amber-400">Adjacent</strong> over the <strong className="text-sky-400">Hypotenuse</strong>.</li>
                      <li>$\frac&#123;BC&#125;&#123;AC&#125;$ is the <strong className="text-emerald-400">Opposite</strong> over the <strong className="text-sky-400">Hypotenuse</strong>.</li>
                    </ul>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 text-purple-400">
                      <CheckCircle2 size={24} />
                      <h3 className="font-bold text-lg uppercase tracking-widest">Identity Proven</h3>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The fractions perfectly morph into their trigonometric equivalents! 
                    </p>
                    <div className="bg-purple-950/20 border border-purple-900/50 p-4 rounded-xl mt-2">
                      <p className="text-purple-200/80 text-xs leading-relaxed">
                        This is why $\cos^2 A + \sin^2 A = 1$ is an absolute law of mathematics. It is not a new rule; it is simply the Pythagoras Theorem scaled down by the hypotenuse.
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