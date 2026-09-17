'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, RotateCcw, Play, Calculator, Box, TestTubeDiagonal, Droplets, Droplet } from 'lucide-react';

type Phase = 'setup' | 'drilling' | 'drilled' | 'analyzing';

export default function SubtractiveDrill() {
  // Configurable Drill Parameters
  const [radius, setRadius] = useState<number>(0.5); // cm
  const [depth, setDepth] = useState<number>(1.4); // cm
  
  const [phase, setPhase] = useState<Phase>('setup');

  // Cuboid Constants (Standard NCERT Exercise dimensions for the pen stand)
  const L = 15;
  const W = 10;
  const H = 3.5;
  const cuboidVol = L * W * H;

  // Math Engine
  const coneVol = (1 / 3) * Math.PI * Math.pow(radius, 2) * depth;
  const totalRemoved = 4 * coneVol;
  const remainingVol = cuboidVol - totalRemoved;

  // SVG Mapping & Rendering Constants
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 450;
  const PIXELS_PER_CM = 40; // Scale factor for depth visibility
  
  const BLOCK_W = 600;
  const BLOCK_H = H * PIXELS_PER_CM;
  const BLOCK_X = (VIEW_WIDTH - BLOCK_W) / 2;
  const BLOCK_Y = 250;

  // 4 Drill positions evenly spaced
  const drillPositions = [
    BLOCK_X + BLOCK_W * 0.2,
    BLOCK_X + BLOCK_W * 0.4,
    BLOCK_X + BLOCK_W * 0.6,
    BLOCK_X + BLOCK_W * 0.8
  ];

  // Visual scaling for the drill bits
  const drillPxWidth = radius * PIXELS_PER_CM * 4; // Exaggerated width for better visual interaction
  const drillPxHeight = depth * PIXELS_PER_CM;

  // Sawdust Particles Effect
  const [particles, setParticles] = useState<{ id: number; cx: number; cy: number; vx: number; vy: number }[]>([]);

  useEffect(() => {
    if (phase === 'drilling') {
      // Generate sawdust
      const newParticles = [];
      for (let i = 0; i < 40; i++) {
        const dIdx = i % 4;
        newParticles.push({
          id: i,
          cx: drillPositions[dIdx],
          cy: BLOCK_Y + 10,
          vx: (Math.random() - 0.5) * 150,
          vy: -(Math.random() * 100 + 50)
        });
      }
      setParticles(newParticles);

      const timer1 = setTimeout(() => setParticles([]), 800); // Clear particles
      const timer2 = setTimeout(() => setPhase('drilled'), 1200);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [phase]);

  const handleReset = () => {
    setPhase('setup');
    setParticles([]);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Settings2 className="text-amber-500" /> The Subtractive Drill
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Hollowing out volumes: Understanding strict subtraction of matter.
          </p>
        </div>
        {phase !== 'setup' && phase !== 'drilling' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Workbench
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (DIGITAL WORKBENCH) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Wooden Cuboid Block (Cross-Section) */}
            <path 
              d={`M ${BLOCK_X} ${BLOCK_Y} L ${BLOCK_X + BLOCK_W} ${BLOCK_Y} L ${BLOCK_X + BLOCK_W} ${BLOCK_Y + BLOCK_H} L ${BLOCK_X} ${BLOCK_Y + BLOCK_H} Z`} 
              fill={phase === 'analyzing' ? '#d97706' : '#78350f'} // Amber glow vs Brown wood
              stroke={phase === 'analyzing' ? '#f59e0b' : '#92400e'} 
              strokeWidth="4" 
              className="transition-colors duration-1000"
            />
            
            {/* Wood Grain Texture (Visible before analyzing) */}
            {phase !== 'analyzing' && (
              <g opacity="0.3" stroke="#451a03" strokeWidth="2" fill="none">
                <path d={`M ${BLOCK_X + 50} ${BLOCK_Y + 20} Q ${BLOCK_X + 100} ${BLOCK_Y + 40} ${BLOCK_X + 200} ${BLOCK_Y + 10}`} />
                <path d={`M ${BLOCK_X + 150} ${BLOCK_Y + 60} Q ${BLOCK_X + 300} ${BLOCK_Y + 80} ${BLOCK_X + 450} ${BLOCK_Y + 40}`} />
                <path d={`M ${BLOCK_X + 300} ${BLOCK_Y + 100} Q ${BLOCK_X + 400} ${BLOCK_Y + 120} ${BLOCK_X + 550} ${BLOCK_Y + 80}`} />
              </g>
            )}

            {/* Subtracted Conical Holes (Masked/Overlaid) */}
            <AnimatePresence>
              {(phase === 'drilled' || phase === 'analyzing') && drillPositions.map((cx, i) => (
                <motion.polygon 
                  key={`hole-${i}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  points={`${cx - drillPxWidth/2},${BLOCK_Y} ${cx + drillPxWidth/2},${BLOCK_Y} ${cx},${BLOCK_Y + drillPxHeight}`}
                  fill={phase === 'analyzing' ? '#38bdf8' : '#1c1917'} // Glowing blue water vs Empty darkness
                  stroke={phase === 'analyzing' ? '#7dd3fc' : '#292524'}
                  strokeWidth="2"
                  className="transition-colors duration-1000"
                />
              ))}
            </AnimatePresence>

            {/* Sawdust Particles */}
            <AnimatePresence>
              {particles.map(p => (
                <motion.circle 
                  key={`p-${p.id}`}
                  initial={{ cx: p.cx, cy: p.cy, opacity: 1, r: Math.random() * 4 + 2 }}
                  animate={{ 
                    cx: p.cx + p.vx, 
                    cy: p.cy + p.vy + 100, // Gravity effect
                    opacity: 0,
                    rotate: 360
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  fill="#b45309" 
                />
              ))}
            </AnimatePresence>

            {/* The Robotic Drills */}
            {drillPositions.map((cx, i) => (
              <motion.g 
                key={`drill-${i}`}
                initial={{ y: 0 }}
                animate={{ 
                  y: phase === 'drilling' ? BLOCK_Y - 50 : 0, // Lower drill
                  opacity: (phase === 'drilled' || phase === 'analyzing') ? 0 : 1 // Hide when done
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              >
                {/* Drill Shaft */}
                <rect x={cx - 10} y={0} width="20" height="150" fill="#cbd5e1" />
                <rect x={cx - 15} y={130} width="30" height="20" fill="#475569" />
                
                {/* Drill Bit (Matches dimensions) */}
                <polygon 
                  points={`${cx - drillPxWidth/2},150 ${cx + drillPxWidth/2},150 ${cx},${150 + drillPxHeight}`}
                  fill="#94a3b8" stroke="#64748b" strokeWidth="2"
                />
                
                {/* Spin Lines (Visible when drilling) */}
                <AnimatePresence>
                  {phase === 'drilling' && (
                    <motion.path 
                      initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.2 }}
                      d={`M ${cx - 10} 160 L ${cx + 10} 180 M ${cx + 10} 160 L ${cx - 10} 180`} 
                      stroke="#f8fafc" strokeWidth="2" 
                    />
                  )}
                </AnimatePresence>
              </motion.g>
            ))}

            {/* Dimensions HUD */}
            <text x={BLOCK_X - 10} y={BLOCK_Y + BLOCK_H / 2 + 5} fill="#a8a29e" fontSize="16" fontWeight="bold" textAnchor="end" className="font-mono">{H} cm</text>
            <text x={BLOCK_X + BLOCK_W / 2} y={BLOCK_Y + BLOCK_H + 25} fill="#a8a29e" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-mono">{L} cm x {W} cm (Depth)</text>
          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Machining Calibration</span>
              <TestTubeDiagonal size={14} className="text-amber-500" />
            </div>
            
            <div className={`flex flex-col gap-5 transition-opacity duration-500 ${phase !== 'setup' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              
              {/* Radius Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-amber-400 font-bold">Drill Radius (r)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{radius.toFixed(1)} cm</span>
                </div>
                <input 
                  type="range" min="0.2" max="1.5" step="0.1" value={radius} 
                  onChange={(e) => setRadius(parseFloat(e.target.value))} 
                  className="w-full accent-amber-500 bg-stone-800 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

              {/* Depth Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-rose-400 font-bold">Drill Depth (h)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{depth.toFixed(1)} cm</span>
                </div>
                <input 
                  type="range" min="0.5" max="3.0" step="0.1" value={depth} 
                  onChange={(e) => setDepth(parseFloat(e.target.value))} 
                  className="w-full accent-rose-500 bg-stone-800 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

            </div>

            <AnimatePresence mode="wait">
              {phase === 'setup' && (
                <motion.button key="drill" onClick={() => setPhase('drilling')} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 mt-2">
                  <Play size={18} /> Execute Drill Pattern
                </motion.button>
              )}
              {phase === 'drilling' && (
                <motion.div key="drilling" className="flex items-center justify-center py-4 gap-3 text-amber-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                  <Settings2 size={18} className="animate-spin" /> Milling in progress...
                </motion.div>
              )}
              {phase === 'drilled' && (
                <motion.button key="analyze" onClick={() => setPhase('analyzing')} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2 mt-2">
                  <Droplets size={18} /> Analyze Volume
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Volumetric Extraction</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {(phase === 'setup' || phase === 'drilling') && (
                  <motion.div key="start" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      We start with a solid block of wood. To find the amount of wood remaining after making the pen stand, we must carve out the holes.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex justify-between items-center mt-2">
                      <div className="flex flex-col">
                        <span className="text-amber-500 font-bold text-[10px] uppercase tracking-widest">Base Cuboid Volume</span>
                        <span className="text-stone-400 font-mono text-xs mt-1">L × W × H</span>
                      </div>
                      <span className="text-2xl font-bold font-mono text-white">{cuboidVol.toFixed(1)} cm³</span>
                    </div>
                  </motion.div>
                )}

                {phase === 'drilled' && (
                  <motion.div key="drilled" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The drills have physically removed wood from the block, creating empty space (air). 
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl mt-auto">
                      <p className="text-stone-400 text-xs leading-relaxed text-center">
                        Click <strong className="text-sky-400 uppercase tracking-widest">Analyze Volume</strong> to isolate the empty space from the remaining solid wood.
                      </p>
                    </div>
                  </motion.div>
                )}

                {phase === 'analyzing' && (
                  <motion.div key="analyzing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-b border-stone-800 pb-2">Strict Mathematical Subtraction</h4>
                    
                    <div className="flex flex-col gap-2 font-mono text-sm border-b border-stone-800 pb-4 text-stone-300">
                      <div className="flex justify-between items-center text-amber-500">
                        <span>Solid Cuboid</span>
                        <span>{cuboidVol.toFixed(2)} cm³</span>
                      </div>
                      <div className="flex justify-between items-center text-sky-400">
                        <span>- (4 × Empty Cones)</span>
                        <span>- {totalRemoved.toFixed(2)} cm³</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400 font-bold text-lg mt-2 pt-2 border-t border-stone-800">
                        <span>Remaining Wood</span>
                        <span>{remainingVol.toFixed(2)} cm³</span>
                      </div>
                    </div>

                    <div className="mt-auto bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl">
                      <p className="text-emerald-200/90 text-xs leading-relaxed">
                        Unlike surface area where connected faces hide, volumes represent absolute matter. By watching the wood physically turn into sawdust and fly away, we prove that "hollowing out" an object strictly means <strong>subtracting</strong> its volume from the total!
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