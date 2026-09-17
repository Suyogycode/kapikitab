'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Triangle, Calculator, RotateCcw, Crosshair, Sparkles } from 'lucide-react';

type RatioTarget = 'sin60' | 'cos60' | 'tan60' | 'sin30' | 'cos30' | 'tan30' | null;

export default function EquilateralSlicer() {
  const [isSliced, setIsSliced] = useState<boolean>(false);
  const [activeRatio, setActiveRatio] = useState<RatioTarget>(null);

  // SVG Coordinates for a perfect Equilateral Triangle
  const A = { x: 300, y: 100 };
  const B = { x: 100, y: 446.4 }; // height = 200 * sqrt(3)
  const C = { x: 500, y: 446.4 };
  const D = { x: 300, y: 446.4 }; // The midpoint

  const handleReset = () => {
    setIsSliced(false);
    setActiveRatio(null);
  };

  const getRatioData = (ratio: RatioTarget) => {
    switch (ratio) {
      case 'sin60': return { title: 'sin(60°)', opp: 'a√3', adj: 'a', hyp: '2a', num: 'a√3', den: '2a', resNum: '√3', resDen: '2' };
      case 'cos60': return { title: 'cos(60°)', opp: 'a√3', adj: 'a', hyp: '2a', num: 'a', den: '2a', resNum: '1', resDen: '2' };
      case 'tan60': return { title: 'tan(60°)', opp: 'a√3', adj: 'a', hyp: '2a', num: 'a√3', den: 'a', resNum: '√3', resDen: '1' };
      case 'sin30': return { title: 'sin(30°)', opp: 'a', adj: 'a√3', hyp: '2a', num: 'a', den: '2a', resNum: '1', resDen: '2' };
      case 'cos30': return { title: 'cos(30°)', opp: 'a', adj: 'a√3', hyp: '2a', num: 'a√3', den: '2a', resNum: '√3', resDen: '2' };
      case 'tan30': return { title: 'tan(30°)', opp: 'a', adj: 'a√3', hyp: '2a', num: 'a', den: 'a√3', resNum: '1', resDen: '√3' };
      default: return null;
    }
  };

  const activeData = getRatioData(activeRatio);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Triangle className="text-amber-500" /> The Equilateral Slicer
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Deriving trigonometric ratios using pure geometry.
          </p>
        </div>
        {isSliced && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Triangle
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG DRAFTING BOARD) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#171717] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-6">
          
          <svg viewBox="0 0 600 600" className="w-full h-full max-w-[500px] aspect-square overflow-visible drop-shadow-xl">
            
            {/* The Main Triangle Fill */}
            <polygon 
              points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} 
              fill="#fbbf24" fillOpacity="0.05"
            />
            
            {/* Left Half Highlight (Active Right Triangle) */}
            <AnimatePresence>
              {isSliced && (
                <motion.polygon 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  points={`${A.x},${A.y} ${B.x},${B.y} ${D.x},${D.y}`} 
                  fill="#10b981" fillOpacity="0.15"
                />
              )}
            </AnimatePresence>

            {/* Base Line (BC) */}
            <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#a8a29e" strokeWidth="4" strokeLinecap="round" />
            
            {/* Sides AB & AC */}
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={isSliced ? "#34d399" : "#a8a29e"} strokeWidth="4" strokeLinecap="round" className="transition-colors duration-500" />
            <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#a8a29e" strokeWidth="4" strokeLinecap="round" />

            {/* The Slicer Laser (AD) */}
            <AnimatePresence>
              {isSliced && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.line 
                    initial={{ y2: A.y }} animate={{ y2: D.y }} transition={{ duration: 0.5, ease: "easeInOut" }}
                    x1={A.x} y1={A.y} x2={D.x} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8 4" 
                  />
                  {/* Right Angle Marker */}
                  <motion.path 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }}
                    d={`M ${D.x - 20} ${D.y} L ${D.x - 20} ${D.y - 20} L ${D.x} ${D.y - 20}`} 
                    fill="none" stroke="#f43f5e" strokeWidth="2" 
                  />
                  
                  {/* Height Label: a√3 */}
                  <motion.text 
                    initial={{ opacity: 0, x: D.x }} animate={{ opacity: 1, x: D.x + 15 }} transition={{ delay: 0.8 }}
                    y={(A.y + D.y) / 2} fill="#fb7185" fontSize="20" fontWeight="bold" className="font-mono bg-stone-900 drop-shadow-md"
                  >
                    a√3
                  </motion.text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Angles at Base */}
            <text x={B.x + 35} y={B.y - 15} fill="#fbbf24" fontSize="18" fontWeight="bold">60°</text>
            <text x={C.x - 35} y={C.y - 15} fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="end">60°</text>

            {/* Angle at Top (A) */}
            <AnimatePresence mode="wait">
              {!isSliced ? (
                <motion.text key="angle60" exit={{ opacity: 0, y: -10 }} x={A.x} y={A.y + 45} fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="middle">60°</motion.text>
              ) : (
                <motion.g key="angle30s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <text x={A.x - 20} y={A.y + 45} fill="#34d399" fontSize="16" fontWeight="bold" textAnchor="middle">30°</text>
                  <text x={A.x + 20} y={A.y + 45} fill="#a8a29e" fontSize="16" fontWeight="bold" textAnchor="middle">30°</text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Side Lengths */}
            <text x={(A.x + B.x) / 2 - 25} y={(A.y + B.y) / 2 - 10} fill={isSliced ? "#34d399" : "#a8a29e"} fontSize="22" fontWeight="bold" className="font-mono transition-colors duration-500">2a</text>
            <text x={(A.x + C.x) / 2 + 25} y={(A.y + C.y) / 2 - 10} fill="#a8a29e" fontSize="22" fontWeight="bold" className="font-mono">2a</text>
            
            <AnimatePresence mode="wait">
              {!isSliced ? (
                <motion.text key="base2a" exit={{ opacity: 0, y: 10 }} x={D.x} y={D.y + 35} fill="#a8a29e" fontSize="22" fontWeight="bold" textAnchor="middle" className="font-mono">2a</motion.text>
              ) : (
                <motion.g key="basea" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <text x={(B.x + D.x) / 2} y={D.y + 35} fill="#34d399" fontSize="22" fontWeight="bold" textAnchor="middle" className="font-mono">a</text>
                  <text x={(C.x + D.x) / 2} y={D.y + 35} fill="#a8a29e" fontSize="22" fontWeight="bold" textAnchor="middle" className="font-mono">a</text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Vertex Labels */}
            <text x={A.x} y={A.y - 15} fill="#e7e5e4" fontSize="24" fontWeight="bold" textAnchor="middle" className="font-serif">A</text>
            <text x={B.x - 20} y={B.y + 15} fill="#e7e5e4" fontSize="24" fontWeight="bold" textAnchor="middle" className="font-serif">B</text>
            <text x={C.x + 20} y={C.y + 15} fill="#e7e5e4" fontSize="24" fontWeight="bold" textAnchor="middle" className="font-serif">C</text>
            {isSliced && (
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} x={D.x} y={D.y + 20} fill="#f43f5e" fontSize="20" fontWeight="bold" textAnchor="middle" className="font-serif">D</motion.text>
            )}

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Action Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Trigonometry Extraction</span>
              <Scissors size={14} className="text-rose-500" />
            </div>
            
            <AnimatePresence mode="wait">
              {!isSliced ? (
                <motion.div key="pre-slice" exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4">
                  <p className="text-stone-300 text-sm leading-relaxed">
                    Start with a perfect equilateral triangle. All sides are <strong className="text-white font-mono">2a</strong>, all angles are <strong className="text-white">60°</strong>.
                  </p>
                  <button 
                    onClick={() => setIsSliced(true)}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center gap-2 mt-2"
                  >
                    <Crosshair size={18} /> Drop Perpendicular Bisector
                  </button>
                </motion.div>
              ) : (
                <motion.div key="post-slice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                  <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest text-center mb-2">Right Triangle ∆ABD Formed</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setActiveRatio('sin60')} className={`py-3 rounded-lg font-bold font-mono text-sm transition-colors border ${activeRatio === 'sin60' ? 'bg-sky-950 border-sky-500 text-sky-400' : 'bg-stone-950 border-stone-700 text-stone-400 hover:border-stone-500'}`}>sin(60°)</button>
                    <button onClick={() => setActiveRatio('cos60')} className={`py-3 rounded-lg font-bold font-mono text-sm transition-colors border ${activeRatio === 'cos60' ? 'bg-sky-950 border-sky-500 text-sky-400' : 'bg-stone-950 border-stone-700 text-stone-400 hover:border-stone-500'}`}>cos(60°)</button>
                    <button onClick={() => setActiveRatio('tan60')} className={`py-3 rounded-lg font-bold font-mono text-sm transition-colors border ${activeRatio === 'tan60' ? 'bg-sky-950 border-sky-500 text-sky-400' : 'bg-stone-950 border-stone-700 text-stone-400 hover:border-stone-500'}`}>tan(60°)</button>
                    
                    <button onClick={() => setActiveRatio('sin30')} className={`py-3 rounded-lg font-bold font-mono text-sm transition-colors border ${activeRatio === 'sin30' ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-stone-950 border-stone-700 text-stone-400 hover:border-stone-500'}`}>sin(30°)</button>
                    <button onClick={() => setActiveRatio('cos30')} className={`py-3 rounded-lg font-bold font-mono text-sm transition-colors border ${activeRatio === 'cos30' ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-stone-950 border-stone-700 text-stone-400 hover:border-stone-500'}`}>cos(30°)</button>
                    <button onClick={() => setActiveRatio('tan30')} className={`py-3 rounded-lg font-bold font-mono text-sm transition-colors border ${activeRatio === 'tan30' ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-stone-950 border-stone-700 text-stone-400 hover:border-stone-500'}`}>tan(30°)</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Proof Engine</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {!isSliced ? (
                  <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <p className="text-stone-400 text-sm leading-relaxed italic text-center mt-4">
                      Awaiting bisection...
                    </p>
                  </motion.div>
                ) : !activeData ? (
                  <motion.div key="pythagoras" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Step 1: Apply Pythagoras</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The laser created a right triangle. We know the hypotenuse ($2a$) and the base ($a$). Find the height ($AD$).
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg font-mono text-xs flex flex-col gap-2 text-stone-400">
                      <div className="flex justify-between"><span>AD² + BD²</span> <span>= AB²</span></div>
                      <div className="flex justify-between"><span>AD² + a²</span> <span>= (2a)²</span></div>
                      <div className="flex justify-between"><span>AD² + a²</span> <span>= 4a²</span></div>
                      <div className="flex justify-between"><span>AD²</span> <span>= 3a²</span></div>
                      <div className="flex justify-between font-bold text-rose-400 mt-2 border-t border-stone-800 pt-2"><span>AD</span> <span>= a√3</span></div>
                    </div>
                    <p className="text-stone-400 text-[11px] uppercase tracking-widest font-bold text-center mt-2">
                      Now click a ratio above to derive it!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="ratio" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 h-full">
                    
                    <div className="flex items-center gap-3 text-sky-400 border-b border-stone-800 pb-3">
                      <Sparkles size={20} />
                      <h3 className="font-bold text-xl font-mono">{activeData.title}</h3>
                    </div>

                    <div className="flex items-center justify-between text-stone-300 font-mono text-sm mt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-stone-500 text-[10px] uppercase tracking-widest mb-1">Ratio</span>
                        <div className="flex flex-col items-center">
                          <span className="border-b border-stone-600 pb-1 px-2">{activeData.num === activeData.opp ? 'Opposite' : activeData.num === activeData.adj ? 'Adjacent' : 'Opposite'}</span>
                          <span className="pt-1 px-2">{activeData.den === activeData.hyp ? 'Hypotenuse' : activeData.den === activeData.adj ? 'Adjacent' : 'Hypotenuse'}</span>
                        </div>
                      </div>

                      <div className="text-stone-600 font-bold">=</div>

                      <div className="flex flex-col items-center relative">
                        <span className="text-stone-500 text-[10px] uppercase tracking-widest mb-1">Substitute</span>
                        <div className="flex flex-col items-center text-lg font-bold">
                          {/* The 'a' Cancellation Animation */}
                          <div className="border-b-2 border-stone-600 pb-1 px-4 relative flex items-center justify-center">
                            <span className="text-white relative">
                              <motion.span initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.5, duration: 0.3 }} className="absolute h-0.5 bg-rose-500 top-1/2 -translate-y-1/2 left-0 z-10"></motion.span>
                              a
                            </span>
                            <span className="text-sky-400">{activeData.num.replace('a', '')}</span>
                          </div>
                          
                          <div className="pt-1 px-4 relative flex items-center justify-center">
                            <span className="text-sky-400">{activeData.den.startsWith('2') ? '2' : ''}</span>
                            <span className="text-white relative">
                              <motion.span initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.5, duration: 0.3 }} className="absolute h-0.5 bg-rose-500 top-1/2 -translate-y-1/2 left-0 z-10"></motion.span>
                              a
                            </span>
                            <span className="text-sky-400">{activeData.den.replace('2a', '').replace('a', '')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-stone-600 font-bold">=</div>

                      <div className="flex flex-col items-center">
                        <span className="text-emerald-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Final Value</span>
                        <div className="flex flex-col items-center text-2xl font-bold text-emerald-400">
                          <span className={activeData.resDen !== '1' ? "border-b-2 border-emerald-900 pb-1 px-2" : "px-2"}>{activeData.resNum}</span>
                          {activeData.resDen !== '1' && <span className="pt-1 px-2">{activeData.resDen}</span>}
                        </div>
                      </div>
                    </div>

                    <p className="text-stone-400 text-xs leading-relaxed mt-auto pt-4 border-t border-stone-800">
                      The variable <strong className="text-rose-400 font-mono">a</strong> perfectly cancels out of the numerator and denominator. This proves that for any given angle, the ratio of the sides is <strong className="text-white">always constant</strong>, regardless of how big or small the triangle actually is!
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