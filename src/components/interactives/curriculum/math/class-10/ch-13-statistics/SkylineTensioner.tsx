'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Activity, Zap, Play, Calculator, RotateCcw, Crosshair } from 'lucide-react';

type Phase = 'survey' | 'identified' | 'tension';

export default function SkylineTensioner() {
  const [phase, setPhase] = useState<Phase>('survey');

  // Hardcoded Grouped Data Set
  // Designed specifically so f0 (12) is much taller than f2 (4), creating a strong leftward "pull"
  const data = [
    { l: 0,  u: 10, f: 3 },
    { l: 10, u: 20, f: 6 },
    { l: 20, u: 30, f: 12 }, // f0
    { l: 30, u: 40, f: 14 }, // f1 (Modal Class)
    { l: 40, u: 50, f: 4 },  // f2
    { l: 50, u: 60, f: 7 }
  ];

  // Mathematical Extraction
  const modalIndex = 3; 
  const modalClass = data[modalIndex];
  
  const l = modalClass.l;
  const h = modalClass.u - modalClass.l;
  const f1 = modalClass.f;
  const f0 = data[modalIndex - 1].f;
  const f2 = data[modalIndex + 1].f;

  const d1 = f1 - f0; // Difference with preceding class
  const d2 = f1 - f2; // Difference with succeeding class
  
  const mode = l + (d1 / (d1 + d2)) * h;

  // SVG Mapping Constants
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 450;
  const GROUND_Y = 400;
  
  // Mapping logic
  const mapX = (val: number) => 100 + (val / 60) * 600;
  const mapY = (f: number) => GROUND_Y - (f / 16) * 300;
  const BAR_WIDTH = mapX(10) - mapX(0);

  // Animation Anchors
  const startOrbX = mapX(l + h / 2); // Orb starts in the exact middle of the roof
  const finalOrbX = mapX(mode); // Orb is pulled to the true mode
  
  const f0Anchor = { x: mapX(l), y: mapY(f0) };
  const f2Anchor = { x: mapX(modalClass.u), y: mapY(f2) };

  // Handlers
  const handleBarClick = (idx: number) => {
    if (phase === 'survey' && idx === modalIndex) {
      setPhase('identified');
    }
  };

  const handleReset = () => setPhase('survey');

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#020617] rounded-2xl border border-slate-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Building2 className="text-sky-500" /> The Skyline Tensioner
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Mode of Grouped Data: Calculating physical tension between neighboring frequencies.
          </p>
        </div>
        {phase !== 'survey' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Skyline
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG CITYSCAPE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#0f172a] to-[#020617] border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Ground */}
            <rect x="0" y={GROUND_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - GROUND_Y} fill="#020617" />
            <line x1="0" y1={GROUND_Y} x2={VIEW_WIDTH} y2={GROUND_Y} stroke="#1e293b" strokeWidth="4" />

            {/* X-Axis Ruler (Class Intervals) */}
            <line x1={mapX(0)} y1={GROUND_Y + 15} x2={mapX(60)} y2={GROUND_Y + 15} stroke="#334155" strokeWidth="2" />
            {[0, 10, 20, 30, 40, 50, 60].map(val => (
              <g key={`tick-${val}`}>
                <line x1={mapX(val)} y1={GROUND_Y + 10} x2={mapX(val)} y2={GROUND_Y + 20} stroke="#334155" strokeWidth="2" />
                <text x={mapX(val)} y={GROUND_Y + 35} fill="#64748b" fontSize="14" fontWeight="bold" textAnchor="middle" className="font-mono">{val}</text>
              </g>
            ))}

            {/* Skyscrapers (Histogram Bars) */}
            {data.map((d, i) => {
              const isModal = i === modalIndex;
              const isF0 = i === modalIndex - 1;
              const isF2 = i === modalIndex + 1;
              
              const hPx = GROUND_Y - mapY(d.f);
              
              let fillColor = "#1e293b"; // Default dark slate
              let strokeColor = "#334155";
              
              if (phase !== 'survey') {
                if (isModal) { fillColor = "#0284c7"; strokeColor = "#38bdf8"; } // Bright blue for f1
                else if (isF0) { fillColor = "#b45309"; strokeColor = "#fbbf24"; } // Amber for f0
                else if (isF2) { fillColor = "#b45309"; strokeColor = "#fbbf24"; } // Amber for f2
                else { fillColor = "#0f172a"; strokeColor = "#1e293b"; } // Dim the rest
              }

              return (
                <g 
                  key={`bar-${i}`}
                  onClick={() => handleBarClick(i)}
                  className={phase === 'survey' ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                >
                  <rect 
                    x={mapX(d.l)} 
                    y={mapY(d.f)} 
                    width={BAR_WIDTH} 
                    height={hPx} 
                    fill={fillColor} 
                    stroke={strokeColor} 
                    strokeWidth="3" 
                    className="transition-colors duration-700"
                  />
                  {/* Building Windows Pattern */}
                  <g opacity="0.2">
                    {Array.from({ length: Math.floor(hPx / 20) }).map((_, r) => (
                      <line key={`w-${i}-${r}`} x1={mapX(d.l) + 10} y1={mapY(d.f) + 15 + r*20} x2={mapX(d.l) + BAR_WIDTH - 10} y2={mapY(d.f) + 15 + r*20} stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 8" />
                    ))}
                  </g>
                  {/* Frequency Labels */}
                  <AnimatePresence>
                    {(phase !== 'survey' && (isModal || isF0 || isF2)) && (
                      <motion.text 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        x={mapX(d.l + 5)} y={mapY(d.f) - 15} 
                        fill={isModal ? "#7dd3fc" : "#fcd34d"} 
                        fontSize="20" fontWeight="bold" className="font-mono drop-shadow-md" textAnchor="middle"
                      >
                        {d.f}
                      </motion.text>
                    )}
                  </AnimatePresence>
                </g>
              );
            })}

            {/* The Modal Platform and Tension Engine */}
            <AnimatePresence>
              {phase !== 'survey' && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  
                  {/* Platform glowing line (Lower limit to Upper limit) */}
                  <line 
                    x1={mapX(l)} y1={mapY(f1)} 
                    x2={mapX(modalClass.u)} y2={mapY(f1)} 
                    stroke="#38bdf8" strokeWidth="6" 
                    className="drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" 
                  />

                  {/* Laser Cable 1 (From f0) */}
                  <motion.line 
                    initial={false}
                    animate={{ 
                      x1: f0Anchor.x, y1: f0Anchor.y, 
                      x2: phase === 'tension' ? finalOrbX : startOrbX, y2: mapY(f1) 
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 1 }}
                    stroke="#fbbf24" strokeWidth={phase === 'tension' ? "6" : "2"} 
                    strokeDasharray={phase === 'tension' ? "none" : "8 4"}
                    className={phase === 'tension' ? "drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" : ""}
                  />

                  {/* Laser Cable 2 (From f2) */}
                  <motion.line 
                    initial={false}
                    animate={{ 
                      x1: f2Anchor.x, y1: f2Anchor.y, 
                      x2: phase === 'tension' ? finalOrbX : startOrbX, y2: mapY(f1) 
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 1 }}
                    stroke="#fbbf24" strokeWidth={phase === 'tension' ? "4" : "2"} // Thinner because f2 is weaker (4 vs 12)
                    strokeDasharray={phase === 'tension' ? "none" : "8 4"}
                    className={phase === 'tension' ? "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" : ""}
                  />

                  {/* The Tension Orb */}
                  <motion.g 
                    initial={false}
                    animate={{ x: phase === 'tension' ? finalOrbX : startOrbX, y: mapY(f1) }}
                    transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                  >
                    <circle cx="0" cy="0" r="16" fill="#0ea5e9" opacity="0.3" className="animate-ping" />
                    <circle cx="0" cy="0" r="10" fill="#38bdf8" stroke="#bae6fd" strokeWidth="2" />
                    
                    {/* Downward projection line to the X-axis */}
                    {phase === 'tension' && (
                      <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} x1="0" y1="10" x2="0" y2={GROUND_Y - mapY(f1)} stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
                    )}
                  </motion.g>

                  {/* Final Mode Value Label */}
                  {phase === 'tension' && (
                    <motion.text 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                      x={finalOrbX} y={GROUND_Y + 55} 
                      fill="#38bdf8" fontSize="18" fontWeight="bold" textAnchor="middle" className="font-mono bg-slate-900 drop-shadow-md"
                    >
                      Mode = {mode.toFixed(1)}
                    </motion.text>
                  )}
                </motion.g>
              )}
            </AnimatePresence>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">
              <span>Data Target</span>
              <Crosshair size={14} className="text-sky-500" />
            </div>
            
            <AnimatePresence mode="wait">
              {phase === 'survey' && (
                <motion.div key="c0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2 text-center py-4">
                  <Activity className="text-sky-500 mx-auto animate-pulse mb-2" size={24} />
                  <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">Locate the Modal Class</p>
                  <p className="text-slate-500 text-xs">Click on the tallest skyscraper in the city to begin the extraction.</p>
                </motion.div>
              )}
              
              {phase === 'identified' && (
                <motion.button key="c1" onClick={() => setPhase('tension')} className="w-full py-5 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center gap-3">
                  <Zap size={20} /> Engage Tension Cables
                </motion.button>
              )}

              {phase === 'tension' && (
                <motion.div key="c2" className="flex items-center justify-center py-5 gap-3 text-sky-500 font-bold uppercase tracking-widest text-sm">
                  <Crosshair size={18} /> Exact Mode Locked
                </motion.div>
              )}
            </AnimatePresence>

            {/* Variable Tracker */}
            <div className={`grid grid-cols-2 gap-3 transition-opacity duration-500 ${phase === 'survey' ? 'opacity-0' : 'opacity-100'}`}>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-mono text-[10px] font-bold">Lower Limit (l)</span>
                <span className="text-white font-mono font-bold">{l}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-mono text-[10px] font-bold">Class Size (h)</span>
                <span className="text-white font-mono font-bold">{h}</span>
              </div>
              <div className="bg-amber-950/20 border border-amber-900/50 p-3 rounded-lg flex justify-between items-center col-span-2">
                <span className="text-amber-500 font-mono text-[10px] font-bold">Neighboring Frequencies</span>
                <span className="text-amber-400 font-mono font-bold">f₀ = {f0} | f₂ = {f2}</span>
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center gap-3">
              <Calculator className="text-amber-500" size={18} />
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">Fractional Resolution</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#020617]">
              
              <AnimatePresence mode="wait">
                {phase === 'survey' && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      For grouped data, the mode cannot be found just by looking[cite: 24]. First, we must identify the "Modal Class"—the group with the absolute highest frequency ($f_1$)[cite: 24].
                    </p>
                  </motion.div>
                )}

                {phase === 'identified' && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-sky-400 font-bold text-xs uppercase tracking-widest border-l-2 border-sky-500 pl-3">Platform Projected</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      The mode lives somewhere on the roof of the tallest building (between {l} and {modalClass.u})[cite: 24]. But where exactly? 
                    </p>
                    <p className="text-slate-400 text-xs">
                      Notice the laser cables connecting to the adjacent buildings ($f_0$ and $f_2$)[cite: 24]. Click <strong className="text-sky-400 uppercase tracking-widest">Engage Tension Cables</strong> to find out who pulls harder.
                    </p>
                  </motion.div>
                )}

                {phase === 'tension' && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 h-full">
                    
                    {/* Live Formula Breakdown */}
                    <div className="flex flex-col gap-2 font-mono text-sm border-b border-slate-800 pb-4 text-slate-300">
                      <div className="flex items-center gap-4 text-amber-400">
                        <span className="w-20">Pull Left:</span>
                        <span>f₁ - f₀ = {f1} - {f0} = <strong className="text-white text-lg">{d1}</strong></span>
                      </div>
                      <div className="flex items-center gap-4 text-amber-500/70">
                        <span className="w-20">Pull Right:</span>
                        <span>f₁ - f₂ = {f1} - {f2} = <strong className="text-white text-lg">{d2}</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-800">
                        <span className="w-20 text-sky-400">Tension Ratio:</span>
                        <div className="flex flex-col items-center">
                          <span className="border-b border-slate-600 pb-1 text-white">{d1}</span>
                          <span className="pt-1 text-slate-400">{d1} + {d2}</span>
                        </div>
                        <span className="text-xl font-bold text-sky-400">= {(d1 / (d1 + d2)).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-auto bg-sky-950/20 border border-sky-900/50 p-4 rounded-xl">
                      <p className="text-sky-200/90 text-[11px] leading-relaxed">
                        <strong className="text-sky-400 uppercase tracking-widest">The "Aha!" Moment</strong><br/><br/>
                        The left building ($f_0$) is much taller than the right ($f_2$). Because it exerts more "tension", it yanks the glowing orb heavily to the left side of the roof[cite: 24]! The massive fractional formula is literally just calculating the physical tug-of-war to pull the "most popular value" into its final, exact position[cite: 24].
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