'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Settings2, Calculator, Lightbulb } from 'lucide-react';

export default function ArchimedeanTrap() {
  const [n, setN] = useState<number>(6);

  // SVG Config
  const CX = 250;
  const CY = 250;
  const R = 160;

  // --- Mathematical Engine ---
  const calcGeometry = useMemo(() => {
    // Archimedes calculated the half-perimeter to approximate Pi (since C = 2πr, half-C = πr. If r=1, half-C = π)
    const innerPi = n * Math.sin(Math.PI / n);
    const outerPi = n * Math.tan(Math.PI / n);

    const innerPoints: string[] = [];
    const outerPoints: string[] = [];

    // The outer polygon's radius must touch the circle at the midpoints of its sides
    const outerR = R / Math.cos(Math.PI / n);

    for (let i = 0; i < n; i++) {
      const angle = (i * 2 * Math.PI) / n;
      
      // Inner Polygon Vertices
      const ix = CX + R * Math.cos(angle);
      const iy = CY + R * Math.sin(angle);
      innerPoints.push(`${ix},${iy}`);

      // Outer Polygon Vertices (shifted by half an angle step so edges touch the circle perfectly)
      const outerAngle = angle + Math.PI / n;
      const ox = CX + outerR * Math.cos(outerAngle);
      const oy = CY + outerR * Math.sin(outerAngle);
      outerPoints.push(`${ox},${oy}`);
    }

    return {
      innerPi,
      outerPi,
      innerPath: innerPoints.join(' '),
      outerPath: outerPoints.join(' ')
    };
  }, [n]);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Circle className="text-amber-500" /> The Archimedean Trap
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Approximating π by trapping a circle between two polygons.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center z-10">
        
        {/* INTERACTIVE SVG WORKSPACE */}
        <div className="relative w-full max-w-[500px] aspect-square bg-[#151414] border-2 border-stone-800 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden flex items-center justify-center touch-none">
          
          <svg viewBox="0 0 500 500" className="w-full h-full">
            
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#292524" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="500" height="500" fill="url(#grid)" />

            {/* Circumscribed Polygon (Outer - Blue) */}
            <polygon 
              points={calcGeometry.outerPath} 
              fill="rgba(14, 165, 233, 0.1)" 
              stroke="#0ea5e9" 
              strokeWidth="3"
              strokeDasharray={n > 24 ? "none" : "6 6"}
            />

            {/* Inscribed Polygon (Inner - Red) */}
            <polygon 
              points={calcGeometry.innerPath} 
              fill="rgba(244, 63, 94, 0.15)" 
              stroke="#f43f5e" 
              strokeWidth="3" 
            />

            {/* Perfect Circle (r = 1) */}
            <circle 
              cx={CX} cy={CY} r={R} 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="4" 
              className="drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            />

            {/* Center Dot */}
            <circle cx={CX} cy={CY} r={4} fill="#f59e0b" />
          </svg>

          {/* Floating Legend */}
          <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-sm border border-stone-800 p-3 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-sky-500/20 border-2 border-sky-500" />
              <span className="text-xs text-stone-300 font-bold uppercase tracking-widest">Outer Bound</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-transparent border-2 border-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
              <span className="text-xs text-stone-300 font-bold uppercase tracking-widest">True Circle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-rose-500/20 border-2 border-rose-500" />
              <span className="text-xs text-stone-300 font-bold uppercase tracking-widest">Inner Bound</span>
            </div>
          </div>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Master Polygon Slider */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Settings2 size={16} /> Number of Sides (n)
            </label>
            <div className="flex items-center gap-6">
              <input 
                type="range" 
                min="3" 
                max="96" 
                step="1" 
                value={n} 
                onChange={(e) => setN(parseInt(e.target.value))} 
                className="w-full accent-amber-500" 
              />
              <div className="flex flex-col items-center justify-center bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 min-w-[80px]">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1">Sides</span>
                <span className="text-2xl font-mono text-white leading-none">
                  {n}
                </span>
              </div>
            </div>
            <div className="flex justify-between px-1 mt-2 text-[10px] font-mono text-stone-600 font-bold">
              <span>3 (Triangle)</span>
              <span>96 (Archimedes)</span>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Squeeze Theorem</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              <div className="grid grid-cols-3 gap-4 text-center items-end">
                <div className="flex flex-col gap-2">
                  <span className="text-rose-500 text-[10px] uppercase tracking-widest font-bold">Inner<br/>Perimeter</span>
                  <div className="bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg text-rose-400 font-bold text-lg">
                    {calcGeometry.innerPi.toFixed(5)}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-amber-500 text-[10px] uppercase tracking-widest font-bold">True<br/>π</span>
                  <div className="flex items-center justify-center h-full">
                    <span className="text-stone-500 font-bold mx-2">&lt;</span>
                    <span className="text-3xl text-white font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">π</span>
                    <span className="text-stone-500 font-bold mx-2">&lt;</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sky-500 text-[10px] uppercase tracking-widest font-bold">Outer<br/>Perimeter</span>
                  <div className="bg-sky-950/30 border border-sky-900/50 p-3 rounded-lg text-sky-400 font-bold text-lg">
                    {calcGeometry.outerPi.toFixed(5)}
                  </div>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {n === 96 ? (
                    <motion.div 
                      key="archimedes"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl flex items-start gap-3"
                    >
                      <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">Archimedes' Limit</h4>
                        <p className="text-amber-100/80 font-sans text-xs leading-relaxed">
                          At 96 sides, the red and blue polygons have virtually merged into the circle's curve. Without a modern calculator, Archimedes proved that π must be trapped between <strong>{calcGeometry.innerPi.toFixed(4)}</strong> and <strong>{calcGeometry.outerPi.toFixed(4)}</strong>.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="standard"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3"
                    >
                      <Lightbulb className="text-stone-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-stone-400 text-xs leading-relaxed font-sans">
                        <strong>The Aha! Moment:</strong> Slide the number of sides aggressively to the right. Watch as the jagged polygons smooth out and visually crush together, trapping the infinite value of π into an ever-tightening mathematical vice!
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