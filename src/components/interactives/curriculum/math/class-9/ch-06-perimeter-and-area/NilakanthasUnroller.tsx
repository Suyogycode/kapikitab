'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Scissors, Calculator, MoveRight } from 'lucide-react';

export default function NilakanthasUnroller() {
  const [isRearranged, setIsRearranged] = useState<boolean>(false);
  const [sliceIndex, setSliceIndex] = useState<number>(0);
  
  // Exponential slice counts to show the "Limit to Infinity"
  const sliceOptions = [8, 16, 32, 64, 128];
  const n = sliceOptions[sliceIndex];

  // SVG Configuration
  const CX = 400;
  const CY = 250;
  const R = 120;
  
  const PI_R = Math.PI * R; // The base of our final parallelogram

  // Pre-calculate the SVG path for a single slice
  const slicePath = useMemo(() => {
    const theta = (2 * Math.PI) / n;
    // Tip at (0,0), arc at the top (negative Y)
    const x1 = -R * Math.sin(theta / 2);
    const y1 = -R * Math.cos(theta / 2);
    const x2 = R * Math.sin(theta / 2);
    const y2 = -R * Math.cos(theta / 2);
    
    // Draw from tip, to top-left, sweep arc to top-right, close to tip
    return `M 0 0 L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
  }, [n, R]);

  // Generate data for all slices
  const slices = Array.from({ length: n }).map((_, i) => {
    const isOdd = i % 2 !== 0;
    
    // Position in the standard Circle
    const circleX = CX;
    const circleY = CY;
    // Rotate so the pieces fan out in a full 360
    const circleRotate = i * (360 / n);

    // Position in the rearranged Parallelogram
    // We line them up along the X axis. Total width is PI_R.
    const step = PI_R / n;
    const startX = CX - PI_R / 2;
    const rearrangedX = startX + (i + 0.5) * step;
    
    // Even slices point UP (arc at top), Odd slices point DOWN (arc at bottom)
    const rearrangedY = CY + (isOdd ? -R / 2 : R / 2);
    const rearrangedRotate = isOdd ? 180 : 0;

    return {
      id: i,
      color: isOdd ? '#f97316' : '#fbbf24', // Orange and Amber
      circle: { x: circleX, y: circleY, rotate: circleRotate },
      rearranged: { x: rearrangedX, y: rearrangedY, rotate: rearrangedRotate }
    };
  });

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Circle className="text-amber-500" /> Nilakantha's Unroller
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the Area of a Circle: Area = πr²
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE SVG WORKSPACE */}
        <div className="relative w-full lg:w-2/3 bg-[#151414] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center touch-none">
          
          <svg viewBox="0 0 800 500" className="w-full h-full">
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#292524" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#grid)" />

            {/* The Slices */}
            <AnimatePresence>
              {slices.map((slice) => (
                <motion.path
                  key={`slice-${n}-${slice.id}`} // Re-render instantly when n changes
                  d={slicePath}
                  fill={slice.color}
                  stroke={slice.color}
                  strokeWidth="0.5"
                  initial={isRearranged ? slice.rearranged : slice.circle}
                  animate={isRearranged ? slice.rearranged : slice.circle}
                  transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
                  className="drop-shadow-sm"
                />
              ))}
            </AnimatePresence>

            {/* Dimension Lines (Only show when rearranged) */}
            <AnimatePresence>
              {isRearranged && (
                <motion.g
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {/* Base Dimension (πr) */}
                  <line x1={CX - PI_R/2} y1={CY + R/2 + 20} x2={CX + PI_R/2} y2={CY + R/2 + 20} stroke="#10b981" strokeWidth="2" />
                  <line x1={CX - PI_R/2} y1={CY + R/2 + 10} x2={CX - PI_R/2} y2={CY + R/2 + 30} stroke="#10b981" strokeWidth="2" />
                  <line x1={CX + PI_R/2} y1={CY + R/2 + 10} x2={CX + PI_R/2} y2={CY + R/2 + 30} stroke="#10b981" strokeWidth="2" />
                  <text x={CX} y={CY + R/2 + 45} fill="#34d399" fontSize="18" fontWeight="bold" textAnchor="middle">Base = πr (Half Circumference)</text>

                  {/* Height Dimension (r) */}
                  <line x1={CX - PI_R/2 - 20} y1={CY - R/2} x2={CX - PI_R/2 - 20} y2={CY + R/2} stroke="#38bdf8" strokeWidth="2" />
                  <line x1={CX - PI_R/2 - 30} y1={CY - R/2} x2={CX - PI_R/2 - 10} y2={CY - R/2} stroke="#38bdf8" strokeWidth="2" />
                  <line x1={CX - PI_R/2 - 30} y1={CY + R/2} x2={CX - PI_R/2 - 10} y2={CY + R/2} stroke="#38bdf8" strokeWidth="2" />
                  <text x={CX - PI_R/2 - 40} y={CY} fill="#7dd3fc" fontSize="18" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, ${CX - PI_R/2 - 40}, ${CY})`}>Height = r</text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>

        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Action Controls */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <button 
              onClick={() => setIsRearranged(!isRearranged)}
              className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg border ${
                isRearranged 
                  ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' 
                  : 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500'
              }`}
            >
              <Scissors size={20} />
              {isRearranged ? 'Restore Circle' : 'Dissect & Rearrange'}
            </button>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                Limit to Infinity
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max={sliceOptions.length - 1} 
                  step="1" 
                  value={sliceIndex} 
                  onChange={(e) => setSliceIndex(parseInt(e.target.value))} 
                  className="w-full accent-emerald-500" 
                />
                <span className="text-xl font-mono text-emerald-400 bg-stone-950 px-4 py-2 rounded-lg border border-stone-800">
                  {n}
                </span>
              </div>
              <div className="flex justify-between px-1 mt-2 text-[10px] font-mono text-stone-600 font-bold">
                <span>Chunky</span>
                <span>Smooth</span>
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Area Transformation</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800 transition-colors">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Shape</span>
                  <span className={`font-bold ${isRearranged ? 'text-amber-400' : 'text-stone-300'}`}>
                    {isRearranged ? 'Parallelogram' : 'Circle'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800 transition-colors">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Base Width</span>
                  <span className={`font-bold ${isRearranged ? 'text-emerald-400' : 'text-stone-600'}`}>πr</span>
                </div>

                <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800 transition-colors">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Vertical Height</span>
                  <span className={`font-bold ${isRearranged ? 'text-sky-400' : 'text-stone-600'}`}>r</span>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {isRearranged ? (
                    <motion.div 
                      key="rearranged"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl"
                    >
                      <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3">The Aha! Moment</h4>
                      <p className="text-emerald-100/80 font-sans text-xs leading-relaxed mb-3">
                        As you push the slices toward infinity, the bumpy edges flatten into a perfectly straight line, revealing a pristine parallelogram.
                      </p>
                      <div className="bg-stone-950 p-3 rounded-lg border border-emerald-900/50 text-center font-bold text-sm tracking-wider text-white">
                        Area = Base × Height<br/>
                        Area = <span className="text-emerald-400">πr</span> × <span className="text-sky-400">r</span> = <span className="text-amber-400">πr²</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="circle"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                      <p className="text-stone-400 text-xs leading-relaxed font-sans">
                        We know the circumference (outer edge) of the circle is exactly <strong>2πr</strong>.<br/><br/>
                        Click <strong>Dissect & Rearrange</strong> to slice the circle open and unfurl that edge into a straight line to measure its area.
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