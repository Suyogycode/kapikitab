'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDashed, Calculator, Lightbulb, RotateCcw, Crosshair } from 'lucide-react';

export default function DoubleAngleSweeper() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Center and Radius of our main circle
  const CX = 250;
  const CY = 250;
  const R = 150;

  // Angles in degrees
  const [angleA, setAngleA] = useState<number>(210);
  const [angleB, setAngleB] = useState<number>(330);
  const [angleD, setAngleD] = useState<number>(90);
  
  const [draggedPoint, setDraggedPoint] = useState<'A' | 'B' | 'D' | null>(null);

  // --- Math Helpers ---
  // Convert angle in degrees to SVG Cartesian coordinates
  const getCoords = (deg: number) => ({
    x: CX + R * Math.cos((deg * Math.PI) / 180),
    y: CY + R * Math.sin((deg * Math.PI) / 180),
  });

  // Calculate shortest central angle between A and B
  const calcCentralAngle = () => {
    let diff = Math.abs(angleB - angleA);
    if (diff > 180) diff = 360 - diff;
    return Math.round(diff);
  };

  const centralAngle = calcCentralAngle();
  const inscribedAngle = centralAngle / 2;
  const isSemicircle = centralAngle === 180;

  // --- SVG Path Helpers ---
  // Draw the thick neon arc between A and B
  const getMinorArcPath = () => {
    const aCoords = getCoords(angleA);
    const bCoords = getCoords(angleB);
    const largeArcFlag = centralAngle > 180 ? 1 : 0;
    // Determine sweep flag based on cross product to ensure we always draw the minor arc
    const sweepFlag = (angleB - angleA + 360) % 360 > 180 ? 0 : 1;
    return `M ${aCoords.x} ${aCoords.y} A ${R} ${R} 0 ${largeArcFlag} ${sweepFlag} ${bCoords.x} ${bCoords.y}`;
  };

  // --- Drag Handling ---
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedPoint || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CX;
    const y = e.clientY - rect.top - CY;
    
    let deg = Math.atan2(y, x) * (180 / Math.PI);
    if (deg < 0) deg += 360;

    // Apply constraints so points don't cross into each other's territories
    if (draggedPoint === 'A') {
      // Keep A roughly in the bottom left/top left
      if (deg > 90 && deg < 300) setAngleA(deg);
    } else if (draggedPoint === 'B') {
      // Keep B roughly in the bottom right/top right
      if (deg > 240 || deg < 90) setAngleB(deg);
    } else if (draggedPoint === 'D') {
      // D is the inscribed point, keep it on the major arc (top half generally)
      // We dynamically constrain D so it doesn't enter the minor arc AB
      const start = Math.min(angleA, angleB);
      const end = Math.max(angleA, angleB);
      const isInsideMinor = deg > start && deg < end;
      
      // If the minor arc crosses 0, the logic flips
      const crossesZero = Math.abs(angleA - angleB) > 180;
      
      const invalid = crossesZero ? !isInsideMinor : isInsideMinor;
      
      if (!invalid) {
        setAngleD(deg);
      }
    }
  };

  const handlePointerUp = () => setDraggedPoint(null);

  // Coordinates for rendering
  const posA = getCoords(angleA);
  const posB = getCoords(angleB);
  const posC = { x: CX, y: CY }; // Center
  const posD = getCoords(angleD);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <CircleDashed className="text-sky-500" /> The Double-Angle Sweeper
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing Theorem 9: Central angles vs. Inscribed angles.
          </p>
        </div>
        <button 
          onClick={() => { setAngleA(210); setAngleB(330); setAngleD(90); }}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset 
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center z-10">
        
        {/* INTERACTIVE SVG WORKSPACE */}
        <div className="relative w-full max-w-[500px] aspect-square bg-[#151414] border-2 border-stone-800 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center touch-none">
          
          <svg 
            ref={svgRef}
            viewBox="0 0 500 500" 
            className="w-full h-full"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Base Circle Track */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#292524" strokeWidth="4" />
            
            {/* The Minor Arc (Neon Emerald) */}
            <path 
              d={getMinorArcPath()} 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="6" 
              strokeLinecap="round"
              className="drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            />

            {/* Central Angle Lines (Amber) */}
            <line x1={CX} y1={CY} x2={posA.x} y2={posA.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" opacity={0.6} />
            <line x1={CX} y1={CY} x2={posB.x} y2={posB.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" opacity={0.6} />

            {/* Inscribed Angle Lines (Sky Blue) */}
            <line x1={posD.x} y1={posD.y} x2={posA.x} y2={posA.y} stroke="#0ea5e9" strokeWidth="3" />
            <line x1={posD.x} y1={posD.y} x2={posB.x} y2={posB.y} stroke="#0ea5e9" strokeWidth="3" />

            {/* Draggable Point A */}
            <g transform={`translate(${posA.x}, ${posA.y})`} onPointerDown={(e) => { e.stopPropagation(); setDraggedPoint('A'); }}>
              <circle r={16} fill="transparent" className="cursor-grab active:cursor-grabbing" />
              <circle r={6} fill="#10b981" />
              <text x="-15" y="20" fill="#d6d3d1" fontSize="14" fontWeight="bold" textAnchor="end">A</text>
            </g>

            {/* Draggable Point B */}
            <g transform={`translate(${posB.x}, ${posB.y})`} onPointerDown={(e) => { e.stopPropagation(); setDraggedPoint('B'); }}>
              <circle r={16} fill="transparent" className="cursor-grab active:cursor-grabbing" />
              <circle r={6} fill="#10b981" />
              <text x="15" y="20" fill="#d6d3d1" fontSize="14" fontWeight="bold" textAnchor="start">B</text>
            </g>

            {/* Draggable Point D (Inscribed) */}
            <g transform={`translate(${posD.x}, ${posD.y})`} onPointerDown={(e) => { e.stopPropagation(); setDraggedPoint('D'); }}>
              <circle r={24} fill="transparent" className="cursor-grab active:cursor-grabbing" />
              <circle r={8} fill="#0ea5e9" className="drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
              <text x="0" y="-15" fill="#0ea5e9" fontSize="16" fontWeight="bold" textAnchor="middle">D</text>
              
              {/* Floating Angle Label at D */}
              <rect x="-24" y="15" width="48" height="24" rx="4" fill="#0c4a6e" opacity={0.8} />
              <text x="0" y="32" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">{inscribedAngle}°</text>
            </g>

            {/* Fixed Center Point C */}
            <g transform={`translate(${CX}, ${CY})`}>
              <circle r={4} fill="#f59e0b" />
              <text x="0" y="-12" fill="#f59e0b" fontSize="16" fontWeight="bold" textAnchor="middle">C</text>
              
              {/* Floating Angle Label at Center */}
              <rect x="-24" y="15" width="48" height="24" rx="4" fill="#78350f" opacity={0.8} />
              <text x="0" y="32" fill="#fbbf24" fontSize="14" fontWeight="bold" textAnchor="middle">{centralAngle}°</text>
            </g>
          </svg>

        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex gap-4">
            <button 
              onClick={() => { setAngleA(180); setAngleB(360); setAngleD(90); }}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg border ${
                isSemicircle ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              <Crosshair size={16} /> Snap to Semicircle
            </button>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Theorem Proof</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl flex flex-col justify-center items-center">
                  <span className="text-amber-500 text-[10px] uppercase tracking-widest font-bold mb-1 text-center">Central Angle<br/>$\angle ACB$</span>
                  <span className="text-3xl text-white font-bold">{centralAngle}°</span>
                </div>
                
                <div className="bg-sky-950/30 border border-sky-900/50 p-4 rounded-xl flex flex-col justify-center items-center">
                  <span className="text-sky-500 text-[10px] uppercase tracking-widest font-bold mb-1 text-center">Inscribed Angle<br/>$\angle ADB$</span>
                  <span className="text-3xl text-white font-bold">{inscribedAngle}°</span>
                </div>
              </div>

              <div className="flex justify-center items-center bg-stone-950 p-3 rounded-lg border border-stone-800">
                <span className="text-amber-400 font-bold">{centralAngle}°</span>
                <span className="text-stone-500 mx-3">$=$</span>
                <span className="text-stone-400">2 $\times$</span>
                <span className="text-sky-400 font-bold ml-2">{inscribedAngle}°</span>
              </div>

              {/* The "Aha!" Moment Explanations */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {isSemicircle ? (
                    <motion.div 
                      key="semicircle"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3"
                    >
                      <Lightbulb className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Semicircle Corollary</h4>
                        <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                          Because the points $A$ and $B$ form a straight line directly across the center, the central angle is exactly 180°. <br/><br/>
                          Therefore, the inscribed angle is forced to be exactly 90°. <strong>An angle in a semicircle is always a perfect right angle!</strong>
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="standard"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3"
                    >
                      <Lightbulb className="text-sky-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-stone-400 text-xs leading-relaxed font-sans">
                        <strong>The Aha! Moment:</strong> Grab point <strong className="text-sky-400">D</strong> and drag it wildly around the top arc. <br/><br/>
                        Notice how the blue arms stretch and compress, but the numerical degree label <strong>{inscribedAngle}°</strong> remains completely frozen? Angles in the same arc segment are always equal!
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