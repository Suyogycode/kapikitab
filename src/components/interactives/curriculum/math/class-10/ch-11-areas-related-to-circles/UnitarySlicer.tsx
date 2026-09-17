'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, RotateCcw, Target, Sparkles, Calculator, Scissors } from 'lucide-react';

export default function UnitarySlicer() {
  // Central Angle (Theta)
  const [angle, setAngle] = useState<number>(60);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // SVG Configuration
  const GRAPH_SIZE = 600;
  const CX = 300;
  const CY = 300;
  const R = 180;
  const LIFT_DISTANCE = 15; // How far the slice pops out

  const svgRef = useRef<SVGSVGElement>(null);

  // Drag Interaction
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Calculate angle relative to center (SVG Y is inverted)
    const dx = px - CX;
    const dy = CY - py; 
    let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize to 0-360
    if (newAngle < 0) newAngle += 360;
    
    // Snap to 360 if very close to the end, else snap to integer
    if (newAngle > 355) newAngle = 360;
    else if (newAngle < 5) newAngle = 0;
    else newAngle = Math.round(newAngle);

    setAngle(newAngle);
  }, [isDragging]);

  const handlePointerUp = () => setIsDragging(false);

  // Mathematical Calculations
  const angleRad = (angle * Math.PI) / 180;
  const endX = CX + R * Math.cos(angleRad);
  const endY = CY - R * Math.sin(angleRad);

  // Fraction Simplification
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(angle, 360);
  const simNum = angle / divisor;
  const simDen = 360 / divisor;

  // Visual "Lift" Calculation (Translating along the bisector)
  const bisectRad = angleRad / 2;
  const liftX = angle > 0 && angle < 360 ? LIFT_DISTANCE * Math.cos(bisectRad) : 0;
  const liftY = angle > 0 && angle < 360 ? -LIFT_DISTANCE * Math.sin(bisectRad) : 0;

  // SVG Paths
  const largeArcFlag = angle > 180 ? 1 : 0;
  
  // The Sector Path
  const sectorPath = angle === 360 
    ? `M ${CX + R} ${CY} A ${R} ${R} 0 1 0 ${CX - R} ${CY} A ${R} ${R} 0 1 0 ${CX + R} ${CY}`
    : `M ${CX} ${CY} L ${CX + R} ${CY} A ${R} ${R} 0 ${largeArcFlag} 0 ${endX} ${endY} Z`;

  // The Remaining Circle Path
  const remainingPath = angle === 360 || angle === 0
    ? ""
    : `M ${CX} ${CY} L ${endX} ${endY} A ${R} ${R} 0 ${largeArcFlag === 1 ? 0 : 1} 0 ${CX + R} ${CY} Z`;

  const handleReset = () => setAngle(60);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <PieChart className="text-purple-500" /> The Unitary Slicer
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Understanding Sector Area and Arc Length as fractions of a whole.
          </p>
        </div>
        {angle !== 60 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Slicer
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG CANVAS) */}
        <div 
          className="relative w-full lg:w-2/3 bg-gradient-to-tr from-[#1c1917] to-[#0c0a09] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          
          {/* Target Angles Hints */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <button onClick={() => setAngle(90)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${angle === 90 ? 'bg-purple-950 border-purple-500 text-purple-400 shadow-inner' : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'}`}>Quarter (90°)</button>
            <button onClick={() => setAngle(180)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${angle === 180 ? 'bg-purple-950 border-purple-500 text-purple-400 shadow-inner' : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'}`}>Half (180°)</button>
            <button onClick={() => setAngle(360)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${angle === 360 ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-inner' : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'}`}>Full (360°)</button>
          </div>

          <svg ref={svgRef} viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full max-w-[500px] aspect-square drop-shadow-2xl overflow-visible">
            
            {/* The Remaining Circle (Major Sector) */}
            {angle > 0 && angle < 360 && (
              <path 
                d={remainingPath} 
                fill="#292524" 
                stroke="#57534e" 
                strokeWidth="2"
                className="transition-all duration-75"
              />
            )}

            {/* The Extracted Minor Sector (Lifts out of the circle) */}
            {angle > 0 && (
              <g transform={`translate(${liftX}, ${liftY})`} className="transition-all duration-75">
                <path 
                  d={sectorPath} 
                  fill={angle === 360 ? "#10b981" : "#a855f7"} 
                  fillOpacity={angle === 360 ? "0.2" : "0.3"} 
                  stroke={angle === 360 ? "#10b981" : "#c084fc"} 
                  strokeWidth="4"
                  strokeLinejoin="round"
                  className={angle === 360 ? "drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]" : "drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"}
                />
                
                {/* Arc Length Highlight */}
                {angle < 360 && (
                  <path 
                    d={`M ${CX + R} ${CY} A ${R} ${R} 0 ${largeArcFlag} 0 ${endX} ${endY}`} 
                    fill="none" 
                    stroke="#f43f5e" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                  />
                )}
                
                {/* Angle Arc Indicator */}
                {angle < 360 && angle > 5 && (
                  <path 
                    d={`M ${CX + 40} ${CY} A 40 40 0 ${largeArcFlag} 0 ${CX + 40 * Math.cos(angleRad)} ${CY - 40 * Math.sin(angleRad)}`} 
                    fill="none" 
                    stroke="#fbcfe8" 
                    strokeWidth="2" 
                  />
                )}
              </g>
            )}

            {/* Center Point O */}
            <circle cx={CX} cy={CY} r="6" fill="#e7e5e4" />
            <text x={CX - 20} y={CY + 5} fill="#e7e5e4" fontSize="18" fontWeight="bold" className="font-serif">O</text>

            {/* Draggable Radial Arm Handle */}
            <g 
              transform={`translate(${endX + liftX}, ${endY + liftY})`} 
              className="cursor-pointer"
              onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
            >
              <circle cx="0" cy="0" r="24" fill="#a855f7" opacity="0.1" className="animate-ping" />
              <circle cx="0" cy="0" r="12" fill="#9333ea" stroke="#d8b4fe" strokeWidth="3" />
            </g>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Unitary Tracker */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Unitary Fraction</span>
              <Scissors size={14} className="text-purple-500" />
            </div>
            
            <div className="flex flex-col items-center gap-4">
              
              <div className="flex justify-between items-center w-full font-mono">
                <span className="text-stone-400 font-bold">Angle (θ)</span>
                <span className={`px-4 py-2 rounded-lg border font-bold text-lg ${angle === 360 ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-stone-950 border-stone-700 text-white'}`}>
                  {angle}°
                </span>
              </div>

              {/* The Live Fraction Simplification */}
              <div className="bg-stone-950 border border-stone-800 w-full p-4 rounded-xl flex items-center justify-center gap-6">
                
                {/* Raw Fraction */}
                <div className="flex flex-col items-center text-xl font-mono font-bold text-stone-400">
                  <span className="border-b-2 border-stone-700 pb-1 px-3 text-purple-400">{angle}</span>
                  <span className="pt-1 px-3">360</span>
                </div>
                
                <div className="text-stone-600 font-bold text-2xl">=</div>

                {/* Simplified Fraction */}
                <div className="flex flex-col items-center text-2xl font-mono font-bold">
                  {simDen === 1 ? (
                    <span className="text-emerald-400 text-4xl">{simNum}</span>
                  ) : (
                    <>
                      <span className="border-b-2 border-emerald-900 pb-1 px-4 text-emerald-400">{simNum}</span>
                      <span className="pt-1 px-4 text-white">{simDen}</span>
                    </>
                  )}
                </div>

              </div>

              <input 
                type="range" min="0" max="360" step="1" value={angle} 
                onChange={(e) => setAngle(parseInt(e.target.value))} 
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer mt-2 ${angle === 360 ? 'accent-emerald-500 bg-stone-800' : 'accent-purple-500 bg-stone-800'}`} 
              />
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Sector Area & Arc Length</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <div className="flex flex-col gap-3 font-mono text-sm border-b border-stone-800 pb-4">
                {/* Area Breakdown */}
                <div className="flex items-center justify-between text-purple-300">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-purple-500 font-bold font-sans">Sector Area</span>
                    <span>(θ / 360) × πr²</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <span>{simDen === 1 ? simNum : `${simNum}/${simDen}`}</span>
                    <span className="text-stone-500">×</span>
                    <span>πr²</span>
                  </div>
                </div>

                {/* Arc Length Breakdown */}
                <div className="flex items-center justify-between text-rose-300 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-rose-500 font-bold font-sans">Arc Length</span>
                    <span>(θ / 360) × 2πr</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <span>{simDen === 1 ? simNum : `${simNum}/${simDen}`}</span>
                    <span className="text-stone-500">×</span>
                    <span>2πr</span>
                  </div>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-2">
                <AnimatePresence mode="wait">
                  {angle === 360 ? (
                    <motion.div key="full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-emerald-100/90 font-sans text-xs leading-relaxed">
                        <strong className="text-emerald-400 uppercase tracking-widest">The Full Circle</strong><br/>
                        When $\theta = 360^\circ$, the fraction simplifies perfectly to <strong>1</strong>. The sector area formula literally transforms into the standard circle area formula ($1 \times \pi r^2$)! A circle is just a sector of $360^\circ$.
                      </p>
                    </motion.div>
                  ) : angle === 90 ? (
                    <motion.div key="quadrant" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Target className="text-purple-400 shrink-0 mt-0.5" size={20} />
                      <p className="text-stone-300 font-sans text-xs leading-relaxed">
                        <strong className="text-purple-400 uppercase tracking-widest">The Quadrant</strong><br/>
                        At $90^\circ$, the fraction perfectly crunches down to <strong>1/4</strong>. You don't need a special formula for a quadrant; it is exactly one-quarter of the total circle's area and circumference!
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="custom" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <p className="text-stone-300 font-sans text-xs leading-relaxed">
                        The complex-looking formulas are just the Unitary Method in disguise. 
                      </p>
                      <p className="text-stone-400 font-sans text-[11px] leading-relaxed">
                        You first find what fraction of the full $360^\circ$ circle you have sliced, and simply multiply that exact fraction by the total Area ($\pi r^2$) or the total boundary ($2\pi r$).
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