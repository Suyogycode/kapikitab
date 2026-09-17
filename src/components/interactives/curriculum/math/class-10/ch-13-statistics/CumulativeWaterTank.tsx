'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Database, RotateCcw, Target, Layers, Calculator, Play } from 'lucide-react';

type Phase = 'idle' | 'pouring1' | 'pouring2' | 'pouring3' | 'analyzing';

export default function CumulativeWaterTank() {
  const [phase, setPhase] = useState<Phase>('idle');

  // Hardcoded Frequency Data
  const data = [
    { id: 1, l: 0, u: 10, f: 5, cf: 5 },
    { id: 2, l: 10, u: 20, f: 8, cf: 13 },
    { id: 3, l: 20, u: 30, f: 20, cf: 33 }, // Median Class
    { id: 4, l: 30, u: 40, f: 15, cf: 48 },
    { id: 5, l: 40, u: 50, f: 7, cf: 55 },
    { id: 6, l: 50, u: 60, f: 5, cf: 60 }
  ];

  const n = 60;
  const targetWater = n / 2; // 30
  
  // Median Class Variables
  const medianClass = data[2];
  const l = medianClass.l;
  const f = medianClass.f;
  const cfPrev = data[1].cf; // 13
  const h = medianClass.u - medianClass.l;
  
  const gap = targetWater - cfPrev; // 30 - 13 = 17
  const medianValue = l + (gap / f) * h; // 28.5

  // SVG Mapping Constants
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 500;
  const GROUND_Y = 420;
  const TANK_W = 90;
  const TANK_GAP = 15;
  const START_X = (VIEW_WIDTH - (data.length * TANK_W + (data.length - 1) * TANK_GAP)) / 2;
  const PX_PER_F = 8; // Pixels per unit of frequency (height)

  // Fluid Animation Sequence
  useEffect(() => {
    if (phase === 'pouring1') {
      setTimeout(() => setPhase('pouring2'), 800);
    } else if (phase === 'pouring2') {
      setTimeout(() => setPhase('pouring3'), 800);
    } else if (phase === 'pouring3') {
      setTimeout(() => setPhase('analyzing'), 1200);
    }
  }, [phase]);

  const handleStart = () => setPhase('pouring1');
  const handleReset = () => setPhase('idle');

  // Calculate current water level for a specific tank based on the phase
  const getWaterLevel = (tankIndex: number) => {
    if (phase === 'idle') return 0;
    
    if (tankIndex === 0) return data[0].f; // Fills entirely
    if (tankIndex === 1) return phase === 'pouring1' ? 0 : data[1].f; // Fills entirely in phase 2
    if (tankIndex === 2) {
      if (phase === 'pouring1' || phase === 'pouring2') return 0;
      return gap; // Partially fills to (n/2 - cf) in phase 3
    }
    return 0; // Tanks 4, 5, 6 stay empty
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#020617] rounded-2xl border border-slate-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Droplets className="text-sky-500" /> The Cumulative Water Tank
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Median of Grouped Data: Locating where the cumulative total crosses n/2.
          </p>
        </div>
        {phase !== 'idle' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Drain System
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG FLUID SIMULATION) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#0f172a] to-[#020617] border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Lab Table */}
            <rect x="0" y={GROUND_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - GROUND_Y} fill="#0f172a" />
            <line x1="0" y1={GROUND_Y} x2={VIEW_WIDTH} y2={GROUND_Y} stroke="#1e293b" strokeWidth="4" />

            {/* The Giant Vat (Total Observations 'n') */}
            <g transform={`translate(${VIEW_WIDTH / 2}, 30)`}>
              <rect x="-100" y="0" width="200" height="100" fill="#334155" rx="10" stroke="#475569" strokeWidth="3" />
              <text x="0" y="40" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest">Total Observations</text>
              <text x="0" y="75" fill="#f8fafc" fontSize="32" fontWeight="bold" textAnchor="middle" className="font-serif italic">n</text>
              
              {/* Spout */}
              <rect x="-15" y="100" width="30" height="20" fill="#475569" />
              
              {/* Valve Wheel */}
              <circle cx="25" cy="110" r="12" fill="none" stroke="#ef4444" strokeWidth="4" className={phase !== 'idle' && phase !== 'analyzing' ? 'animate-spin' : ''} style={{ transformOrigin: '25px 110px' }} />
            </g>

            {/* The Tanks and Water */}
            {data.map((d, i) => {
              const tankX = START_X + i * (TANK_W + TANK_GAP);
              const tankH = d.f * PX_PER_F;
              const tankY = GROUND_Y - tankH;
              
              const currentWater = getWaterLevel(i);
              const waterH = currentWater * PX_PER_F;
              const waterY = GROUND_Y - waterH;
              
              const isMedianTank = i === 2;
              const isHighlighted = phase === 'analyzing' && isMedianTank;

              return (
                <g key={`tank-${i}`}>
                  
                  {/* The Glowing Water */}
                  <motion.rect 
                    initial={{ y: GROUND_Y, height: 0 }}
                    animate={{ y: waterY, height: waterH }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    x={tankX + 2} width={TANK_W - 4} fill="#0ea5e9" opacity="0.8"
                    className="drop-shadow-[0_0_15px_rgba(14,165,233,0.6)]"
                  />

                  {/* Water Surface Line */}
                  <motion.line
                    initial={{ y1: GROUND_Y, y2: GROUND_Y, opacity: 0 }}
                    animate={{ y1: waterY, y2: waterY, opacity: waterH > 0 ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    x1={tankX + 2} x2={tankX + TANK_W - 2} stroke="#bae6fd" strokeWidth="2"
                  />

                  {/* The Glass Tank Outline */}
                  <rect 
                    x={tankX} y={tankY} width={TANK_W} height={tankH} 
                    fill="none" stroke={isHighlighted ? "#fde047" : "#475569"} strokeWidth={isHighlighted ? "4" : "2"} 
                    className={`transition-colors duration-500 ${isHighlighted ? 'drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]' : ''}`}
                  />

                  {/* X-Axis Class Labels */}
                  <text x={tankX + TANK_W / 2} y={GROUND_Y + 25} fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-mono">{d.l}-{d.u}</text>
                  
                  {/* Median Tank Highlight Texts */}
                  <AnimatePresence>
                    {isHighlighted && (
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        {/* Remaining Gap Label */}
                        <line x1={tankX + TANK_W / 2} y1={tankY} x2={tankX + TANK_W / 2} y2={waterY} stroke="#fde047" strokeWidth="2" />
                        <polygon points={`${tankX + TANK_W / 2 - 5},${tankY + 5} ${tankX + TANK_W / 2 + 5},${tankY + 5} ${tankX + TANK_W / 2},${tankY}`} fill="#fde047" />
                        <polygon points={`${tankX + TANK_W / 2 - 5},${waterY - 5} ${tankX + TANK_W / 2 + 5},${waterY - 5} ${tankX + TANK_W / 2},${waterY}`} fill="#fde047" />
                        
                        {/* Text background for readability */}
                        <rect x={tankX + TANK_W / 2 - 40} y={(tankY + waterY) / 2 - 15} width="80" height="30" fill="#0f172a" opacity="0.8" rx="4" />
                        <text x={tankX + TANK_W / 2} y={(tankY + waterY) / 2} fill="#fde047" fontSize="14" fontWeight="bold" textAnchor="middle" className="font-mono drop-shadow-md">n/2 - cf</text>
                        <text x={tankX + TANK_W / 2} y={(tankY + waterY) / 2 + 10} fill="#fde047" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest">(Remaining Gap)</text>

                        {/* Median Class Label */}
                        <text x={tankX + TANK_W / 2} y={GROUND_Y + 45} fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest drop-shadow-md">Median Class</text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              );
            })}

            {/* Falling Water Stream */}
            <AnimatePresence>
              {(phase === 'pouring1' || phase === 'pouring2' || phase === 'pouring3') && (
                <motion.line 
                  initial={{ y1: 150, y2: 150, opacity: 0 }}
                  animate={{ 
                    y1: 150, 
                    y2: GROUND_Y - 20, 
                    x1: VIEW_WIDTH / 2, 
                    x2: phase === 'pouring1' ? START_X + TANK_W / 2 : phase === 'pouring2' ? START_X + TANK_W + TANK_GAP + TANK_W / 2 : START_X + 2 * (TANK_W + TANK_GAP) + TANK_W / 2,
                    opacity: 1
                  }}
                  exit={{ opacity: 0 }}
                  stroke="#38bdf8" strokeWidth="8" strokeDasharray="10 10" className="animate-pulse drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]"
                />
              )}
            </AnimatePresence>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">
              <span>Cumulative Sequencer</span>
              <Database size={14} className="text-sky-500" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">
                <span className="col-span-2">Class Interval</span>
                <span className="text-center">f</span>
                <span className="text-center">cf</span>
              </div>
              
              {data.map((d, i) => {
                // Determine if this row is actively filled/filling
                const isFilled = 
                  (phase === 'pouring2' && i <= 0) || 
                  (phase === 'pouring3' && i <= 1) || 
                  (phase === 'analyzing' && i <= 2);
                
                const isMedian = phase === 'analyzing' && i === 2;

                return (
                  <div key={`row-${d.id}`} className={`grid grid-cols-4 font-mono text-sm py-1 transition-colors duration-500 ${isMedian ? 'text-amber-400 bg-amber-950/30 rounded px-1' : isFilled ? 'text-sky-300' : 'text-slate-600'}`}>
                    <span className="col-span-2">{d.l} - {d.u}</span>
                    <span className="text-center">{d.f}</span>
                    <span className="text-center font-bold">{d.cf}</span>
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.button key="start" onClick={handleStart} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center gap-2 mt-2">
                  <Play size={18} /> Find Median (Pour 50%)
                </motion.button>
              )}
              {(phase === 'pouring1' || phase === 'pouring2' || phase === 'pouring3') && (
                <motion.div key="pouring" className="flex items-center justify-center py-4 gap-3 text-sky-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                  <Droplets size={18} className="animate-bounce" /> Pouring n/2 ({targetWater} units)
                </motion.div>
              )}
              {phase === 'analyzing' && (
                <motion.div key="analyzing" className="flex items-center justify-center py-4 gap-3 text-amber-500 font-bold uppercase tracking-widest text-sm">
                  <Target size={18} /> Median Class Located
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center gap-3">
              <Calculator className="text-amber-500" size={18} />
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">Fraction Breakdown</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#020617]">
              
              <AnimatePresence mode="wait">
                {phase === 'idle' && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      To find the exact median value, we must find where the cumulative total first exceeds n/2.
                    </p>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mt-auto">
                      <p className="text-slate-400 text-xs leading-relaxed text-center">
                        Click <strong className="text-sky-400 uppercase tracking-widest">Find Median</strong> to open the valve and release exactly half the total observations into the sequential tanks.
                      </p>
                    </div>
                  </motion.div>
                )}

                {phase === 'analyzing' && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 h-full">
                    
                    {/* Live Formula Breakdown */}
                    <div className="flex flex-col gap-3 font-mono text-sm border-b border-slate-800 pb-4 text-slate-300">
                      
                      <div className="flex items-center justify-between text-amber-400">
                        <span>Total Target (n/2)</span>
                        <span className="font-bold">{targetWater}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sky-400">
                        <span>- Previous Water (cf)</span>
                        <span>- {cfPrev}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                        <span className="text-white">Remaining Gap (n/2 - cf)</span>
                        <span className="font-bold text-white text-lg">{gap}</span>
                      </div>
                    </div>

                    <div className="mt-auto bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl">
                      <p className="text-amber-200/90 text-[11px] leading-relaxed">
                        <strong className="text-amber-400 uppercase tracking-widest">The "Aha!" Moment</strong><br/><br/>
                        The dreaded median formula is just calculating a water level! We know the median lives inside the yellow tank. The fraction (n/2 - cf)/f physically calculates what percentage of that tank is filled with the remaining {gap} units of water. We multiply by width (h) and add it to the tank's starting wall (l) to get the exact location: <strong className="text-white">{medianValue.toFixed(1)}</strong>!
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