'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, MoveVertical, RotateCcw, Crosshair, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export default function SecantTangentEvolver() {
  // Distance of the line from the center (0 to 200)
  const [offset, setOffset] = useState<number>(80);

  // Circle Constants
  const GRAPH_SIZE = 600;
  const CX = 300;
  const CY = 350; // Shifted down slightly to leave room for the tangent
  const R = 200;

  // Math Calculations
  const isTangent = offset >= R;
  const currentOffset = Math.min(offset, R); // Cap at Radius
  
  // Calculate X-distance from center to intersection using Pythagoras (x^2 + y^2 = r^2)
  const dx = Math.sqrt(Math.max(0, R * R - currentOffset * currentOffset));
  
  const A = { x: CX - dx, y: CY - currentOffset };
  const B = { x: CX + dx, y: CY - currentOffset };
  const P = { x: CX, y: CY - R }; // Point of Contact when tangent

  const handleReset = () => setOffset(80);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Circle className="text-sky-400" /> The Secant-Tangent Evolver
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Defining the Point of Contact and Theorem 10.1.
          </p>
        </div>
        {isTangent && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Line
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG CANVAS) */}
        <div className={`relative w-full lg:w-2/3 border-2 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-0 transition-colors duration-500 ${
          isTangent ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-gradient-to-b from-[#1c1917] to-[#0c0a09] border-stone-800'
        }`}>
          
          <svg viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Main Circle */}
            <circle cx={CX} cy={CY} r={R} fill="#292524" fillOpacity="0.4" stroke="#57534e" strokeWidth="4" />
            
            {/* Center Point O */}
            <circle cx={CX} cy={CY} r="6" fill="#a8a29e" />
            <text x={CX - 15} y={CY + 20} fill="#d6d3d1" fontSize="18" fontWeight="bold" className="font-serif">O</text>

            <AnimatePresence>
              {!isTangent && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* The Inner Triangle (Center to A and B) */}
                  <polygon 
                    points={`${CX},${CY} ${A.x},${A.y} ${B.x},${B.y}`} 
                    fill="#38bdf8" fillOpacity="0.1" 
                    stroke="#0284c7" strokeWidth="2" strokeDasharray="6 4"
                  />
                  
                  {/* Highlighted Chord AB */}
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  
                  {/* Points A and B */}
                  <circle cx={A.x} cy={A.y} r="8" fill="#f43f5e" />
                  <text x={A.x - 20} y={A.y - 15} fill="#fda4af" fontSize="18" fontWeight="bold" className="font-serif">A</text>
                  
                  <circle cx={B.x} cy={B.y} r="8" fill="#f43f5e" />
                  <text x={B.x + 10} y={B.y - 15} fill="#fda4af" fontSize="18" fontWeight="bold" className="font-serif">B</text>

                  {/* Radii labels */}
                  <text x={(CX + A.x) / 2 - 15} y={(CY + A.y) / 2 + 20} fill="#7dd3fc" fontSize="14" className="font-mono">Radius</text>
                  <text x={(CX + B.x) / 2 + 15} y={(CY + B.y) / 2 + 20} fill="#7dd3fc" fontSize="14" className="font-mono" textAnchor="end">Radius</text>

                </motion.g>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isTangent && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  
                  {/* The Rigid Radius Line */}
                  <line x1={CX} y1={CY} x2={P.x} y2={P.y} stroke="#fbbf24" strokeWidth="4" strokeDasharray="6 4" />
                  <text x={CX + 15} y={(CY + P.y) / 2} fill="#fbbf24" fontSize="16" fontWeight="bold" className="font-mono bg-stone-900">Radius</text>

                  {/* 90-Degree Square Icon */}
                  <path d={`M ${P.x} ${P.y + 20} L ${P.x + 20} ${P.y + 20} L ${P.x + 20} ${P.y}`} fill="none" stroke="#10b981" strokeWidth="3" />
                  
                  {/* The Merged Point of Contact P */}
                  <circle cx={P.x} cy={P.y} r="12" fill="#10b981" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                  <text x={P.x - 25} y={P.y - 15} fill="#6ee7b7" fontSize="22" fontWeight="bold" className="font-serif drop-shadow-md">P</text>
                  
                </motion.g>
              )}
            </AnimatePresence>

            {/* The Main Secant/Tangent Line */}
            <line 
              x1="0" y1={CY - currentOffset} 
              x2={GRAPH_SIZE} y2={CY - currentOffset} 
              stroke={isTangent ? "#10b981" : "#e7e5e4"} 
              strokeWidth="4" 
              className="transition-colors duration-300"
            />

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Line Position Control</span>
              <MoveVertical size={14} className={isTangent ? "text-emerald-500" : "text-sky-500"} />
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between font-mono text-sm items-center">
                <span className="text-stone-300 font-bold">Distance from Center</span>
                <span className={`px-3 py-1 rounded border font-bold ${isTangent ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-stone-950 border-stone-700 text-white'}`}>
                  {currentOffset.toFixed(0)} units
                </span>
              </div>
              
              <input 
                type="range" min="0" max="220" step="1" value={offset} 
                onChange={(e) => setOffset(parseInt(e.target.value))} 
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isTangent ? 'accent-emerald-500 bg-emerald-950' : 'accent-sky-500 bg-stone-800'}`} 
              />
              <div className="flex justify-between text-[10px] font-mono text-stone-500 font-bold uppercase tracking-widest mt-1">
                <span>Center (0)</span>
                <span>Radius ({R})</span>
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Crosshair className={isTangent ? "text-emerald-500" : "text-amber-500"} size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric State</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              {/* Live Variables Dashboard */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className={`border p-3 rounded-lg flex flex-col items-center gap-1 transition-colors duration-300 ${isTangent ? 'bg-stone-950 border-stone-800' : 'bg-sky-950/20 border-sky-900/50'}`}>
                  <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Chord Length (AB)</span>
                  <span className={`font-mono font-bold text-xl ${isTangent ? 'text-stone-600' : 'text-sky-400'}`}>
                    {(dx * 2).toFixed(1)}
                  </span>
                </div>
                <div className={`border p-3 rounded-lg flex flex-col items-center gap-1 transition-colors duration-300 ${isTangent ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-stone-950 border-stone-800'}`}>
                  <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Intersections</span>
                  <span className={`font-mono font-bold text-xl ${isTangent ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isTangent ? '1 (Point P)' : '2 (A & B)'}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isTangent ? (
                  <motion.div key="secant" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 text-sky-400">
                      <Lightbulb size={20} />
                      <h3 className="font-bold text-lg uppercase tracking-widest">Secant Line</h3>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The line currently intersects the circle at two distinct points (<strong className="text-rose-400 font-serif">A</strong> and <strong className="text-rose-400 font-serif">B</strong>), creating a chord inside the circle.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl mt-auto">
                      <p className="text-stone-400 text-xs leading-relaxed">
                        <strong className="text-amber-400 uppercase tracking-widest">Challenge:</strong><br/>
                        Drag the slider to move the line further from the center. Watch what happens to points A and B as you approach the radius limit ({R} units).
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="tangent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 size={24} />
                      <h3 className="font-bold text-lg uppercase tracking-widest">Tangent Evolved!</h3>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      As the line hit the edge, points A and B violently merged into a single <strong className="text-emerald-400">Point of Contact (P)</strong>. The chord length shrunk to exactly zero.
                    </p>
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl mt-auto">
                      <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2 border-b border-emerald-900/50 pb-2">Theorem 10.1 Locked</h4>
                      <p className="text-emerald-100/80 text-xs leading-relaxed">
                        Because the triangle collapsed, the line is now perfectly perpendicular to the radius at point P. The 90° angle physically verifies the core theorem of circle tangents!
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