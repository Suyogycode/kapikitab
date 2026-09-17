'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cylinder, Droplet, Layers, RotateCcw, Paintbrush, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

type Phase = 'separated' | 'joined' | 'painting' | 'painted' | 'revealed';

export default function PaintVat() {
  const [phase, setPhase] = useState<Phase>('separated');
  const [hasPaint, setHasPaint] = useState<boolean>(false);

  // Geometry Constants
  const CX = 300;
  const HEMI_Y = 420;
  const CONE_BASE_Y = 220; // Starts 200px above the hemisphere
  const R = 100;
  const RY = 30; // 3D Perspective Ellipse Y-Radius
  const CONE_H = 150;

  // The paint sequence
  useEffect(() => {
    if (phase === 'painting') {
      const runPaintSequence = async () => {
        // Wait for vat to rise
        await new Promise(r => setTimeout(r, 1200));
        // Apply paint while submerged
        setHasPaint(true);
        // Wait for vat to fall
        await new Promise(r => setTimeout(r, 1200));
        setPhase('painted');
      };
      runPaintSequence();
    }
  }, [phase]);

  const handleReset = () => {
    setPhase('separated');
    setHasPaint(false);
  };

  // Colors
  const unpaintedOuter = "#d6d3d1"; // stone-300
  const unpaintedInner = "#a8a29e"; // stone-400 (The hidden bases)
  const paintedOuter = "#d946ef";   // fuchsia-500 (Neon Paint)
  const paintLiquid = "#f0abfc";    // fuchsia-300 (Vat Liquid)

  // Drag logic for the cone
  const handleDragEnd = (event: any, info: any) => {
    if (phase === 'separated' && info.offset.y > 50) {
      setPhase('joined');
    }
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Droplet className="text-fuchsia-500" /> The Paint Vat
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing hidden surfaces in combined solids.
          </p>
        </div>
        {phase !== 'separated' && phase !== 'painting' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Facility
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (3D VAT SCENE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-end p-0">
          
          {/* Background Grid for Scale */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#44403c 1px, transparent 1px), linear-gradient(90deg, #44403c 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          <svg viewBox="0 0 600 600" className="w-full max-w-[500px] aspect-square overflow-visible drop-shadow-2xl">
            
            {/* HEMISPHERE (Bottom Object) */}
            <g>
              {/* Back edge of Hemisphere flat top (only visible when separated/revealed) */}
              <ellipse 
                cx={CX} cy={HEMI_Y} rx={R} ry={RY} 
                fill={unpaintedInner} stroke="#78716c" strokeWidth="2" 
              />
              
              {/* Hemisphere Curved Body */}
              <path 
                d={`M ${CX - R} ${HEMI_Y} A ${R} ${R} 0 0 0 ${CX + R} ${HEMI_Y} Z`} 
                fill={hasPaint ? paintedOuter : unpaintedOuter} 
                stroke={hasPaint ? "#a21caf" : "#78716c"} 
                strokeWidth="2" 
                className="transition-colors duration-300"
              />
              
              {/* Front edge of Hemisphere flat top */}
              <path 
                d={`M ${CX - R} ${HEMI_Y} A ${R} ${RY} 0 0 0 ${CX + R} ${HEMI_Y}`} 
                fill="none" 
                stroke={hasPaint && (phase === 'joined' || phase === 'painted') ? "#a21caf" : "#78716c"} 
                strokeWidth="2" 
                className="transition-colors duration-300"
              />
            </g>

            {/* CONE (Top Object - Draggable) */}
            <motion.g
              drag={phase === 'separated' ? "y" : false}
              dragConstraints={{ top: 0, bottom: 200 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              animate={{ 
                y: (phase === 'joined' || phase === 'painting' || phase === 'painted') ? 200 : 0 
              }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className={phase === 'separated' ? "cursor-grab active:cursor-grabbing" : ""}
            >
              {/* Cone Flat Base (Inside) */}
              <ellipse 
                cx={CX} cy={CONE_BASE_Y} rx={R} ry={RY} 
                fill={unpaintedInner} stroke="#78716c" strokeWidth="2" 
              />
              
              {/* Cone Curved Body */}
              <path 
                d={`M ${CX} ${CONE_BASE_Y - CONE_H} L ${CX - R} ${CONE_BASE_Y} A ${R} ${RY} 0 0 0 ${CX + R} ${CONE_BASE_Y} Z`} 
                fill={hasPaint ? paintedOuter : unpaintedOuter} 
                stroke={hasPaint ? "#a21caf" : "#78716c"} 
                strokeWidth="2" 
                className="transition-colors duration-300"
              />

              {/* Drag Hint (Only in Phase 0) */}
              <AnimatePresence>
                {phase === 'separated' && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <path d={`M ${CX + R + 20} ${CONE_BASE_Y - 50} L ${CX + R + 20} ${CONE_BASE_Y + 120}`} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 6" />
                    <polygon points={`${CX + R + 15},${CONE_BASE_Y + 110} ${CX + R + 25},${CONE_BASE_Y + 110} ${CX + R + 20},${CONE_BASE_Y + 120}`} fill="#fbbf24" />
                    <text x={CX + R + 35} y={CONE_BASE_Y + 30} fill="#fbbf24" fontSize="14" fontWeight="bold" className="uppercase tracking-widest font-mono">Drag to Snap</text>
                  </motion.g>
                )}
              </AnimatePresence>
            </motion.g>

            {/* THE PAINT VAT (Rises from bottom) */}
            <motion.rect
              x="0" width="600"
              initial={{ y: 600, height: 0 }}
              animate={{ 
                y: phase === 'painting' ? 50 : 600, 
                height: phase === 'painting' ? 550 : 0 
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              fill={paintLiquid} fillOpacity="0.8"
              className="pointer-events-none drop-shadow-[0_-20px_30px_rgba(217,70,239,0.5)]"
            />

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Assembly Controls</span>
              <Layers size={14} className="text-fuchsia-500" />
            </div>
            
            <AnimatePresence mode="wait">
              {phase === 'separated' && (
                <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 text-center">
                  <ArrowDownToLine className="text-amber-500 mx-auto animate-bounce mb-2" size={24} />
                  <p className="text-stone-300 text-sm font-bold uppercase tracking-widest">Magnetically dock the cone.</p>
                  <p className="text-stone-500 text-xs">Grab the top object and pull it down to the base.</p>
                </motion.div>
              )}
              
              {phase === 'joined' && (
                <motion.button key="p1" onClick={() => setPhase('painting')} className="w-full py-5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] flex items-center justify-center gap-3">
                  <Droplet size={20} /> Submerge in Paint
                </motion.button>
              )}

              {phase === 'painting' && (
                <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-4 gap-4">
                  <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm animate-pulse">Coating Surfaces...</p>
                </motion.div>
              )}

              {phase === 'painted' && (
                <motion.button key="p3" onClick={() => setPhase('revealed')} className="w-full py-5 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center gap-3">
                  <Cylinder size={20} /> Separate & Inspect
                </motion.button>
              )}

              {phase === 'revealed' && (
                <motion.div key="p4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-4 gap-2">
                  <CheckCircle2 className="text-emerald-500 mb-2" size={32} />
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Inspection Complete</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Paintbrush className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Surface Area Breakdown</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {phase === 'separated' && (
                  <motion.div key="hud0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Right now, we have two independent solids. To find their total paintable surface area, we simply add their individual formulas.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl font-mono text-sm space-y-3">
                      <div className="flex flex-col text-sky-300">
                        <span className="text-[10px] uppercase tracking-widest text-sky-500">Cone (TSA)</span>
                        <span>CSA ($\pi rl$) + Base ($\pi r^2$)</span>
                      </div>
                      <div className="w-full h-px bg-stone-800"></div>
                      <div className="flex flex-col text-amber-300">
                        <span className="text-[10px] uppercase tracking-widest text-amber-500">Hemisphere (TSA)</span>
                        <span>CSA ($2\pi r^2$) + Base ($\pi r^2$)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {(phase === 'joined' || phase === 'painting') && (
                  <motion.div key="hud1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The two bases have physically touched and merged. They are now trapped inside the core of the new toy!
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl mt-auto">
                      <p className="text-stone-400 text-xs leading-relaxed text-center">
                        Hit <strong className="text-fuchsia-400 uppercase tracking-widest">Submerge in Paint</strong> to see which surfaces actually get coated by the neon paint.
                      </p>
                    </div>
                  </motion.div>
                )}

                {(phase === 'painted' || phase === 'revealed') && (
                  <motion.div key="hud2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-b border-stone-800 pb-2">The "Aha!" Moment</h4>
                    
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Look at the flat bases. Because they were locked inside, the paint couldn't reach them. They are completely bare!
                    </p>
                    
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl font-mono text-sm space-y-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-stone-500">Toy (TSA) Calculation</span>
                        <div className="flex flex-col gap-1 mt-2 text-stone-400">
                          <span className="text-sky-400">Cone CSA ($\pi rl$)</span>
                          <span className="line-through decoration-rose-500 decoration-2">Cone Base ($\pi r^2$)</span>
                          <span className="text-fuchsia-400">Hemisphere CSA ($2\pi r^2$)</span>
                          <span className="line-through decoration-rose-500 decoration-2">Hemisphere Base ($\pi r^2$)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto bg-fuchsia-950/20 border border-fuchsia-900/50 p-4 rounded-xl">
                      <p className="text-fuchsia-200/90 text-xs leading-relaxed">
                        Therefore, <strong className="text-white">TSA of Combined Solid = CSA of Cone + CSA of Hemisphere</strong>. You never add the full TSAs together because the inner connected bases cease to be "surfaces"!
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