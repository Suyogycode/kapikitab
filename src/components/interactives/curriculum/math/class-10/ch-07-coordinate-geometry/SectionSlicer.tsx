'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Eye, EyeOff, RotateCcw, Calculator, Layers } from 'lucide-react';

export default function SectionSlicer() {
  // Fixed Points for the line segment
  const A = { x: -6, y: -4 };
  const B = { x: 8, y: 6 };

  // Ratio Dials
  const [m1, setM1] = useState<number>(2);
  const [m2, setM2] = useState<number>(3);
  const [showShadows, setShowShadows] = useState<boolean>(false);

  // Section Formula Math
  const Px = (m1 * B.x + m2 * A.x) / (m1 + m2);
  const Py = (m1 * B.y + m2 * A.y) / (m1 + m2);

  // Similar Triangle Vertices
  const Q = { x: Px, y: A.y };
  const C = { x: B.x, y: Py };

  // SVG Mapping Constants
  const GRAPH_SIZE = 600;
  const MATH_RANGE = 10;
  const SCALE = GRAPH_SIZE / (MATH_RANGE * 2);

  const mapX = (x: number) => (x + MATH_RANGE) * SCALE;
  const mapY = (y: number) => GRAPH_SIZE - (y + MATH_RANGE) * SCALE;

  const handleReset = () => {
    setM1(2);
    setM2(3);
    setShowShadows(false);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Crosshair className="text-rose-500" /> The Section Slicer
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Demystifying the Section Formula through 1D shadows.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Laser
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG GRID) */}
        <div className="relative w-full max-w-[600px] aspect-square bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
          
          <svg viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full drop-shadow-lg">
            
            {/* Grid Lines */}
            <g className="opacity-20">
              {Array.from({ length: MATH_RANGE * 2 + 1 }).map((_, i) => {
                const pos = i * SCALE;
                return (
                  <React.Fragment key={i}>
                    <line x1={pos} y1="0" x2={pos} y2={GRAPH_SIZE} stroke="#a8a29e" strokeWidth="1" />
                    <line x1="0" y1={pos} x2={GRAPH_SIZE} y2={pos} stroke="#a8a29e" strokeWidth="1" />
                  </React.Fragment>
                );
              })}
            </g>

            {/* Axes */}
            <line x1={GRAPH_SIZE / 2} y1="0" x2={GRAPH_SIZE / 2} y2={GRAPH_SIZE} stroke="#57534e" strokeWidth="3" />
            <line x1="0" y1={GRAPH_SIZE / 2} x2={GRAPH_SIZE} y2={GRAPH_SIZE / 2} stroke="#57534e" strokeWidth="3" />

            {/* Similar Triangles & Shadows */}
            <AnimatePresence>
              {showShadows && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* Triangle PAQ */}
                  <polygon points={`${mapX(A.x)},${mapY(A.y)} ${mapX(Q.x)},${mapY(Q.y)} ${mapX(Px)},${mapY(Py)}`} fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
                  
                  {/* Triangle BPC */}
                  <polygon points={`${mapX(Px)},${mapY(Py)} ${mapX(C.x)},${mapY(C.y)} ${mapX(B.x)},${mapY(B.y)}`} fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />

                  {/* X-Axis Projections */}
                  <line x1={mapX(A.x)} y1={mapY(A.y)} x2={mapX(A.x)} y2={mapY(0)} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={mapX(Px)} y1={mapY(Py)} x2={mapX(Px)} y2={mapY(0)} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={mapX(B.x)} y1={mapY(B.y)} x2={mapX(B.x)} y2={mapY(0)} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4 4" />

                  {/* X-Axis Shadow Bars */}
                  <line x1={mapX(A.x)} y1={mapY(0)} x2={mapX(Px)} y2={mapY(0)} stroke="#38bdf8" strokeWidth="6" />
                  <line x1={mapX(Px)} y1={mapY(0)} x2={mapX(B.x)} y2={mapY(0)} stroke="#10b981" strokeWidth="6" />

                  {/* Y-Axis Projections */}
                  <line x1={mapX(A.x)} y1={mapY(A.y)} x2={mapX(0)} y2={mapY(A.y)} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={mapX(Px)} y1={mapY(Py)} x2={mapX(0)} y2={mapY(Py)} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={mapX(B.x)} y1={mapY(B.y)} x2={mapX(0)} y2={mapY(B.y)} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Y-Axis Shadow Bars */}
                  <line x1={mapX(0)} y1={mapY(A.y)} x2={mapX(0)} y2={mapY(Py)} stroke="#38bdf8" strokeWidth="6" />
                  <line x1={mapX(0)} y1={mapY(Py)} x2={mapX(0)} y2={mapY(B.y)} stroke="#10b981" strokeWidth="6" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* The Main Line Segment AB */}
            <line x1={mapX(A.x)} y1={mapY(A.y)} x2={mapX(B.x)} y2={mapY(B.y)} stroke="#e7e5e4" strokeWidth="4" />

            {/* Segment m1 (A to P) */}
            <line x1={mapX(A.x)} y1={mapY(A.y)} x2={mapX(Px)} y2={mapY(Py)} stroke="#38bdf8" strokeWidth="6" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all duration-300" />
            
            {/* Segment m2 (P to B) */}
            <line x1={mapX(Px)} y1={mapY(Py)} x2={mapX(B.x)} y2={mapY(B.y)} stroke="#10b981" strokeWidth="6" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-300" />

            {/* Point A */}
            <circle cx={mapX(A.x)} cy={mapY(A.y)} r="8" fill="#38bdf8" />
            <text x={mapX(A.x) - 15} y={mapY(A.y) - 15} fill="#bae6fd" fontSize="16" fontWeight="bold" className="font-mono bg-stone-900 drop-shadow-md text-center">A({A.x}, {A.y})</text>

            {/* Point B */}
            <circle cx={mapX(B.x)} cy={mapY(B.y)} r="8" fill="#10b981" />
            <text x={mapX(B.x) + 15} y={mapY(B.y) - 15} fill="#a7f3d0" fontSize="16" fontWeight="bold" className="font-mono bg-stone-900 drop-shadow-md text-center" textAnchor="end">B({B.x}, {B.y})</text>

            {/* Slicing Laser Point P */}
            <g transform={`translate(${mapX(Px)}, ${mapY(Py)})`} className="transition-all duration-300">
              <circle cx="0" cy="0" r="14" fill="#f43f5e" opacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="10" fill="#e11d48" stroke="#fecdd3" strokeWidth="2" />
              <text x="-15" y="-20" fill="#fecdd3" fontSize="18" fontWeight="bold" className="font-mono bg-stone-900 drop-shadow-md text-center">P</text>
            </g>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Ratio Dials */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Ratio Dials (m₁ : m₂)</span>
              <Layers size={14} className="text-rose-500" />
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-sky-400 font-bold">m₁</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{m1}</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={m1} onChange={(e) => setM1(parseInt(e.target.value))} className="w-full accent-sky-500" />
              </div>
              
              <span className="text-stone-500 font-bold text-xl mt-6">:</span>

              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-emerald-400 font-bold">m₂</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{m2}</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={m2} onChange={(e) => setM2(parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>
            </div>

            <button 
              onClick={() => setShowShadows(!showShadows)}
              className={`w-full py-4 font-bold text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border-2 ${
                showShadows ? 'bg-rose-950/40 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.3)]' : 'bg-stone-950 border-stone-700 text-stone-400 hover:text-white'
              }`}
            >
              {showShadows ? <EyeOff size={18} /> : <Eye size={18} />}
              {showShadows ? 'Hide Projections' : 'Reveal Shadows'}
            </button>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Formula Breakdown</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              {/* X Coordinate Calculation */}
              <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-2">
                  <span>Solving for X</span>
                  <span className="font-mono text-white text-[10px]">(m₁x₂ + m₂x₁) / (m₁ + m₂)</span>
                </div>
                <div className="font-mono text-sm flex flex-col gap-1 text-stone-300">
                  <div className="flex justify-between">
                    <span>Numerator:</span>
                    <span>({m1})({B.x}) + ({m2})({A.x}) = {m1 * B.x + m2 * A.x}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Denominator:</span>
                    <span>{m1} + {m2} = {m1 + m2}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white mt-2 border-t border-stone-800 pt-2">
                    <span className="text-rose-400">Pₓ =</span>
                    <span>{Px.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Y Coordinate Calculation */}
              <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-2">
                  <span>Solving for Y</span>
                  <span className="font-mono text-white text-[10px]">(m₁y₂ + m₂y₁) / (m₁ + m₂)</span>
                </div>
                <div className="font-mono text-sm flex flex-col gap-1 text-stone-300">
                  <div className="flex justify-between">
                    <span>Numerator:</span>
                    <span>({m1})({B.y}) + ({m2})({A.y}) = {m1 * B.y + m2 * A.y}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Denominator:</span>
                    <span>{m1} + {m2} = {m1 + m2}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white mt-2 border-t border-stone-800 pt-2">
                    <span className="text-rose-400">P_y =</span>
                    <span>{Py.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* The "Aha!" Moment */}
              <div className="mt-auto pt-4">
                <AnimatePresence mode="wait">
                  {showShadows ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <p className="text-stone-300 font-sans text-xs leading-relaxed">
                        Look at the shadows on the axes! The <strong className="text-sky-400">blue</strong> and <strong className="text-emerald-400">green</strong> bars form the exact same ratio ($m_1 : m_2$).
                      </p>
                      <p className="text-stone-400 font-sans text-[11px] leading-relaxed">
                        Because of the similar triangles $\Delta PAQ \sim \Delta BPC$, finding Point P in 2D space is literally just finding the weighted average on the X-axis and doing it again on the Y-axis.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <p className="text-stone-400 font-sans text-xs leading-relaxed text-center italic mt-4">
                        Click "Reveal Shadows" to see how the geometry simplifies the algebra.
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