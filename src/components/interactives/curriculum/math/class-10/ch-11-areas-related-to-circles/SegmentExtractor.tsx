'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Scissors, Flame, RotateCcw, Calculator, ArrowRight, Minus } from 'lucide-react';

export default function SegmentExtractor() {
  // Angle of the sector (30 to 180 to keep it a minor segment/semicircle)
  const [angle, setAngle] = useState<number>(120);
  
  // Step Machine
  // 0: Sector Only
  // 1: Chord Drawn (Sector sliced into Triangle + Segment)
  // 2: Triangle Extracted (Incinerated)
  const [step, setStep] = useState<number>(0);

  // SVG Geometry Constants
  const GRAPH_SIZE = 600;
  const CX = 300;
  const CY = 300;
  const R = 200;

  // Math Setup: Centering the sector so it points UP, making the triangle fall DOWN naturally
  const startAngle = 90 - angle / 2;
  const endAngle = 90 + angle / 2;
  
  const rad = (deg: number) => (deg * Math.PI) / 180;
  
  const A = { 
    x: CX + R * Math.cos(rad(startAngle)), 
    y: CY - R * Math.sin(rad(startAngle)) 
  };
  
  const B = { 
    x: CX + R * Math.cos(rad(endAngle)), 
    y: CY - R * Math.sin(rad(endAngle)) 
  };

  // SVG Paths
  // Sweep flag is 0 for counter-clockwise drawing (top minor arc from A to B)
  const segmentPath = `M ${A.x} ${A.y} A ${R} ${R} 0 0 0 ${B.x} ${B.y} L ${A.x} ${A.y} Z`;
  const trianglePath = `M ${CX} ${CY} L ${A.x} ${A.y} L ${B.x} ${B.y} Z`;
  const sectorPath = `M ${CX} ${CY} L ${A.x} ${A.y} A ${R} ${R} 0 0 0 ${B.x} ${B.y} Z`;

  const handleNext = () => setStep(s => Math.min(s + 1, 2));
  const handleReset = () => setStep(0);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <PieChart className="text-emerald-500" /> The Segment Extractor
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the physical subtraction of the central triangle.
          </p>
        </div>
        {step > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Extractor
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG CANVAS) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Main Circle Guide */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#292524" strokeWidth="4" strokeDasharray="8 8" />

            {/* The Segment (Always visible, changes color in step 1) */}
            <motion.path 
              d={segmentPath} 
              animate={{
                fill: step === 0 ? "#8b5cf6" : "#10b981", // Purple to Emerald
                fillOpacity: step === 0 ? 0.3 : 0.6,
                stroke: step === 0 ? "#c084fc" : "#34d399",
                strokeWidth: 4
              }}
              transition={{ duration: 0.4 }}
              className={step > 0 ? "drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"}
            />

            {/* The Triangle (Falls away in step 2) */}
            <motion.path 
              d={trianglePath} 
              initial={false}
              animate={{ 
                fill: step === 0 ? "#8b5cf6" : "#f43f5e", // Purple to Rose
                fillOpacity: step === 2 ? 0 : (step === 0 ? 0.3 : 0.6),
                stroke: step === 0 ? "#c084fc" : "#fb7185",
                strokeWidth: step === 2 ? 0 : 4,
                y: step === 2 ? 250 : 0, // Hardware accelerated translation
                scale: step === 2 ? 0.5 : 1
              }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Step 0: The Unified Sector Border Overlay */}
            <AnimatePresence>
              {step === 0 && (
                <motion.path 
                  exit={{ opacity: 0 }}
                  d={sectorPath} 
                  fill="none" 
                  stroke="#c084fc" 
                  strokeWidth="4" 
                />
              )}
            </AnimatePresence>

            {/* The Chord AB (Appears in Step 1) */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.line 
                  initial={{ pathLength: 0, opacity: 0 }} 
                  animate={{ pathLength: 1, opacity: 1 }} 
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y} 
                  stroke="#e7e5e4" strokeWidth="4" strokeDasharray="6 6"
                />
              )}
            </AnimatePresence>

            {/* Labels and Points */}
            <circle cx={CX} cy={CY} r="6" fill="#d6d3d1" />
            <text x={CX - 20} y={CY + 20} fill="#d6d3d1" fontSize="18" fontWeight="bold" className="font-serif">O</text>

            <circle cx={A.x} cy={A.y} r="6" fill="#d6d3d1" />
            <text x={A.x + 15} y={A.y - 10} fill="#d6d3d1" fontSize="18" fontWeight="bold" className="font-serif">A</text>

            <circle cx={B.x} cy={B.y} r="6" fill="#d6d3d1" />
            <text x={B.x - 25} y={B.y - 10} fill="#d6d3d1" fontSize="18" fontWeight="bold" className="font-serif">B</text>

            <text x={CX} y={CY - R - 15} fill="#34d399" fontSize="18" fontWeight="bold" className="font-serif" textAnchor="middle">P</text>

          </svg>

          {/* The Digital Incinerator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <AnimatePresence>
              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  transition={{ delay: 0.4 }}
                  className="bg-rose-950/80 border border-rose-500 w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)] backdrop-blur-md"
                >
                  <Flame className="text-rose-500 animate-pulse" size={40} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Sector Geometry</span>
              <PieChart size={14} className="text-emerald-500" />
            </div>
            
            <div className={`flex flex-col gap-4 transition-opacity duration-300 ${step > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex justify-between font-mono text-sm items-center">
                <span className="text-purple-400 font-bold">Central Angle (θ)</span>
                <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{angle}°</span>
              </div>
              <input 
                type="range" min="30" max="180" step="1" value={angle} 
                onChange={(e) => setAngle(parseInt(e.target.value))} 
                className="w-full accent-purple-500 bg-stone-800 h-2 rounded-lg appearance-none cursor-pointer" 
              />
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.button key="btn-1" onClick={handleNext} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2">
                  <Scissors size={18} /> Draw Chord AB
                </motion.button>
              )}
              {step === 1 && (
                <motion.button key="btn-2" onClick={handleNext} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2">
                  <Flame size={18} /> Calculate Segment (Extract)
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Equation Tracker</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              {/* Dynamic Equation Blocks */}
              <div className="flex flex-col gap-3 font-mono font-bold text-sm">
                
                {/* Block 1: Sector */}
                <div className={`border p-3 rounded-xl flex items-center justify-between transition-colors duration-500 ${step === 0 ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-stone-950 border-stone-800 text-stone-500'}`}>
                  <span>Area of Sector OAPB</span>
                </div>

                <AnimatePresence>
                  {step >= 1 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex justify-center text-stone-600">
                      =
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Block 2: Triangle + Segment Split */}
                <AnimatePresence>
                  {step >= 1 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-2">
                      <div className={`border p-3 rounded-xl flex items-center justify-between transition-colors duration-500 ${step === 1 ? 'bg-rose-950/40 border-rose-500 text-rose-300' : 'bg-stone-950 border-stone-800 text-stone-600 line-through decoration-rose-500 decoration-2'}`}>
                        <span>Area of ΔOAB</span>
                        {step === 2 && <Minus size={16} className="text-rose-500" />}
                      </div>
                      
                      <div className="flex justify-center text-stone-500">+</div>
                      
                      <div className={`border p-3 rounded-xl flex items-center justify-between transition-colors duration-500 ${step === 2 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-emerald-950/10 border-emerald-900/50 text-emerald-500/50'}`}>
                        <span>Area of Segment APB</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-4 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="text0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-stone-400 text-xs leading-relaxed">
                      We know how to calculate the area of the entire purple sector using the formula from the previous simulation. <br/><br/>
                      Click <strong className="text-purple-400 uppercase tracking-widest">Draw Chord</strong> to begin slicing it apart.
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div key="text1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-stone-300 text-xs leading-relaxed">
                      The straight chord $AB$ physically slices the sector into two distinct geometric shapes: a <strong className="text-rose-400">Triangle</strong> and a <strong className="text-emerald-400">Segment</strong>. <br/><br/>
                      Click <strong className="text-rose-400 uppercase tracking-widest">Calculate Segment</strong> to isolate it!
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="text2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest">Visual Subtraction</h4>
                      <p className="text-emerald-100/80 text-xs leading-relaxed">
                        To find the area of the segment, you literally take the Area of the Sector, and <strong className="text-rose-400">subtract (incinerate)</strong> the Area of the Triangle. <br/><br/>
                        You don't need a new, complicated formula. It is simply one shape removed from another!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}