'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, RotateCcw, Calculator, ArrowRight, Zap, Target, MoveHorizontal } from 'lucide-react';

type Phase = 'guessing' | 'tilted' | 'resolved';

export default function AssumedMeanSeeSaw() {
  // Hardcoded Data Set for the simulation
  // Class Marks (x_i) and Frequencies (f_i)
  const data = [
    { x: 10, f: 4 },
    { x: 30, f: 7 },
    { x: 50, f: 10 },
    { x: 70, f: 3 },
    { x: 90, f: 1 }
  ];

  // State
  const [assumedMean, setAssumedMean] = useState<number>(50); // The user's guess (a)
  const [phase, setPhase] = useState<Phase>('guessing');

  // Math Engine
  const totalF = data.reduce((sum, d) => sum + d.f, 0); // Σf_i = 25
  const sumFX = data.reduce((sum, d) => sum + d.f * d.x, 0); // Σf_i * x_i = 1050
  const actualMean = sumFX / totalF; // 42

  const sumFD = useMemo(() => {
    return data.reduce((sum, d) => sum + d.f * (d.x - assumedMean), 0);
  }, [assumedMean]); // Σf_i * d_i

  const correction = sumFD / totalF;

  // Visual/SVG Constants
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 450;
  const GROUND_Y = 380;
  const BOARD_Y = 320;
  
  // Mapping math domain [0, 100] to SVG X coordinates [100, 700]
  const mapX = (val: number) => 100 + (val / 100) * 600;
  const pivotX = mapX(phase === 'resolved' ? actualMean : assumedMean);

  // Calculate tilt angle based on torque (sumFD). Cap it so it doesn't spin out of control.
  const maxTilt = 25;
  let rawTilt = (sumFD / totalF) * 1.2; 
  if (rawTilt > maxTilt) rawTilt = maxTilt;
  if (rawTilt < -maxTilt) rawTilt = -maxTilt;
  
  const tiltAngle = phase === 'tilted' ? rawTilt : 0;

  const handleTest = () => setPhase('tilted');
  const handleResolve = () => setPhase('resolved');
  const handleReset = () => {
    setAssumedMean(50);
    setPhase('guessing');
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Scale className="text-emerald-500" /> The Assumed Mean See-Saw
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Understanding mean as the center of mass using deviations.
          </p>
        </div>
        {phase !== 'guessing' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Balance
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG PHYSICS ENGINE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Ground */}
            <rect x="0" y={GROUND_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - GROUND_Y} fill="#1c1917" />
            <line x1="0" y1={GROUND_Y} x2={VIEW_WIDTH} y2={GROUND_Y} stroke="#44403c" strokeWidth="4" />

            {/* X-Axis Ruler */}
            <line x1={mapX(0)} y1={GROUND_Y + 20} x2={mapX(100)} y2={GROUND_Y + 20} stroke="#57534e" strokeWidth="2" />
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
              <g key={`tick-${val}`}>
                <line x1={mapX(val)} y1={GROUND_Y + 15} x2={mapX(val)} y2={GROUND_Y + 25} stroke="#57534e" strokeWidth="2" />
                <text x={mapX(val)} y={GROUND_Y + 45} fill="#a8a29e" fontSize="14" fontWeight="bold" textAnchor="middle" className="font-mono">{val}</text>
              </g>
            ))}

            {/* The Pivot Triangle (Assumed Mean 'a') */}
            <motion.g
              animate={{ x: pivotX }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
            >
              <polygon points={`-20,${GROUND_Y} 20,${GROUND_Y} 0,${BOARD_Y}`} fill="#10b981" />
              <line x1="0" y1={GROUND_Y} x2="0" y2={BOARD_Y} stroke="#059669" strokeWidth="2" />
              <text x="0" y={GROUND_Y - 15} fill="#34d399" fontSize="18" fontWeight="bold" textAnchor="middle" className="font-serif">a</text>
            </motion.g>

            {/* The Rotating See-Saw System */}
            <motion.g
              animate={{ rotate: tiltAngle, x: pivotX, y: BOARD_Y }}
              transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            >
              {/* Translate back so everything revolves around the origin (which is mapped to the pivot) */}
              <g transform={`translate(${-pivotX}, ${-BOARD_Y})`}>
                
                {/* The Board */}
                <line x1={mapX(0)} y1={BOARD_Y} x2={mapX(100)} y2={BOARD_Y} stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" />
                
                {/* The Data Blocks (Frequencies stacked at Class Marks) */}
                {data.map((d, i) => {
                  const blockW = 40;
                  const blockH = 15; // px per frequency unit
                  const xPos = mapX(d.x);
                  const totalH = d.f * blockH;

                  return (
                    <g key={`stack-${i}`}>
                      <rect 
                        x={xPos - blockW/2} 
                        y={BOARD_Y - totalH - 6} 
                        width={blockW} 
                        height={totalH} 
                        fill="#38bdf8" 
                        stroke="#0284c7" 
                        strokeWidth="2"
                        rx="4"
                      />
                      <text x={xPos} y={BOARD_Y - totalH - 15} fill="#bae6fd" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-mono drop-shadow-md">
                        f={d.f}
                      </text>
                      
                      {/* Sub-blocks lines for visual frequency counting */}
                      {Array.from({ length: d.f - 1 }).map((_, j) => (
                        <line 
                          key={`line-${i}-${j}`} 
                          x1={xPos - blockW/2} y1={BOARD_Y - 6 - (j+1)*blockH} 
                          x2={xPos + blockW/2} y2={BOARD_Y - 6 - (j+1)*blockH} 
                          stroke="#0284c7" strokeWidth="1" 
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
            </motion.g>

            {/* Target Mean Highlight (Only visible when resolved) */}
            <AnimatePresence>
              {phase === 'resolved' && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <line x1={mapX(actualMean)} y1={GROUND_Y} x2={mapX(actualMean)} y2={GROUND_Y - 200} stroke="#34d399" strokeWidth="2" strokeDasharray="6 6" />
                  <circle cx={mapX(actualMean)} cy={BOARD_Y} r="8" fill="#10b981" className="animate-ping" opacity="0.5" />
                  <circle cx={mapX(actualMean)} cy={BOARD_Y} r="6" fill="#10b981" />
                </motion.g>
              )}
            </AnimatePresence>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Pivot Control</span>
              <MoveHorizontal size={14} className="text-emerald-500" />
            </div>
            
            <div className={`flex flex-col gap-5 transition-opacity duration-500 ${phase !== 'guessing' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              
              {/* Assumed Mean Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-emerald-400 font-bold">Assumed Mean (a)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{assumedMean}</span>
                </div>
                <input 
                  type="range" min="10" max="90" step="1" value={assumedMean} 
                  onChange={(e) => setAssumedMean(parseInt(e.target.value))} 
                  className="w-full accent-emerald-500 bg-stone-800 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

            </div>

            <AnimatePresence mode="wait">
              {phase === 'guessing' && (
                <motion.button key="test" onClick={handleTest} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 mt-2">
                  <Target size={18} /> Test Balance Point
                </motion.button>
              )}
              {phase === 'tilted' && (
                <motion.button key="resolve" onClick={handleResolve} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2 mt-2">
                  <Calculator size={18} /> Apply Math Correction
                </motion.button>
              )}
              {phase === 'resolved' && (
                <motion.div key="resolved" className="flex items-center justify-center py-4 gap-3 text-emerald-500 font-bold uppercase tracking-widest text-sm">
                  <Scale size={18} /> Perfect Equilibrium Achieved
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Torque & Deviations</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {phase === 'guessing' && (
                  <motion.div key="text0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Slide the green pivot (<strong className="text-emerald-400 font-mono">a</strong>) underneath the board to where you <em>guess</em> the center of mass lies.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl mt-auto">
                      <p className="text-stone-400 text-xs leading-relaxed text-center">
                        Once you lock in your guess, hit <strong className="text-emerald-400 uppercase tracking-widest">Test Balance</strong> to see if the board stays level!
                      </p>
                    </div>
                  </motion.div>
                )}

                {phase === 'tilted' && (
                  <motion.div key="text1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-rose-400 font-bold text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2">Imbalance Detected</h4>
                    
                    <div className="flex flex-col gap-2 font-mono text-xs border-b border-stone-800 pb-4 text-stone-300">
                      <div className="flex justify-between items-center text-amber-500">
                        <span>Total Torque (Σfᵢdᵢ)</span>
                        <span>{sumFD > 0 ? '+' : ''}{sumFD.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sky-400">
                        <span>Total Mass (Σfᵢ)</span>
                        <span>{totalF}</span>
                      </div>
                      <div className="flex justify-between items-center text-rose-400 font-bold text-sm mt-2 pt-2 border-t border-stone-800">
                        <span>Required Correction</span>
                        <span>{correction > 0 ? '+' : ''}{correction.toFixed(2)}</span>
                      </div>
                    </div>

                    <p className="text-stone-300 text-xs leading-relaxed mt-auto">
                      Your guess was off by exactly <strong className="text-rose-400 font-mono">{Math.abs(correction).toFixed(2)}</strong> units. Click <strong className="text-sky-400 uppercase tracking-widest">Apply Math Correction</strong> to shift the pivot and fix it.
                    </p>
                  </motion.div>
                )}

                {phase === 'resolved' && (
                  <motion.div key="text2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2">The Final Formula</h4>
                    
                    <div className="flex flex-col gap-3 font-mono text-sm border-b border-stone-800 pb-4 text-stone-300">
                      <div className="flex justify-between items-center text-white">
                        <span>True Mean ($\bar&#123;x&#125;$) =</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400 pl-4">
                        <span>Assumed Mean (a)</span>
                        <span>{assumedMean}</span>
                      </div>
                      <div className="flex justify-between items-center text-rose-400 pl-4">
                        <span>+ Correction ($\frac&#123;\Sigma f_i d_i&#125;&#123;\Sigma f_i&#125;$)</span>
                        <span>{correction > 0 ? '+' : ''}{correction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sky-400 font-bold text-xl mt-2 pt-3 border-t border-stone-700">
                        <span>Final Value</span>
                        <span>{actualMean.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-auto bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl">
                      <p className="text-emerald-200/90 text-[11px] leading-relaxed">
                        <strong className="text-emerald-400 uppercase tracking-widest">The "Aha!" Moment</strong><br/><br/>
                        The intimidating formula is just a self-correcting see-saw! You pick an anchor point ($a$), calculate how badly the board tilts ($\Sigma f_i d_i$), and divide that imbalance by the total weight ($\Sigma f_i$) to slide the pivot to perfect equilibrium.
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