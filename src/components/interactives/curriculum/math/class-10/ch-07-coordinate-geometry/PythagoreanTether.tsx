'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Eye, EyeOff, RotateCcw, MapPin, Calculator } from 'lucide-react';

type Point = { x: number; y: number };

export default function PythagoreanTether() {
  // Coordinates for Points P and Q
  const [p, setP] = useState<Point>({ x: -4, y: -3 });
  const [q, setQ] = useState<Point>({ x: 4, y: 3 });
  
  // State Machine
  const [showArchitecture, setShowArchitecture] = useState<boolean>(false);
  const [activeNode, setActiveNode] = useState<'P' | 'Q' | null>(null);

  // SVG Mapping Constants
  const GRAPH_SIZE = 600;
  const MATH_RANGE = 10;
  const SCALE = GRAPH_SIZE / (MATH_RANGE * 2);

  const mapX = (x: number) => (x + MATH_RANGE) * SCALE;
  const mapY = (y: number) => GRAPH_SIZE - (y + MATH_RANGE) * SCALE;

  // Inverse mapping for dragging
  const unmapX = (px: number) => Math.round(px / SCALE) - MATH_RANGE;
  const unmapY = (py: number) => MATH_RANGE - Math.round(py / SCALE);

  // Math Calculations
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // The intersection point T forming the right angle
  const t = { x: q.x, y: p.y };

  // Dragging Logic
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeNode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Clamp coordinates to grid
    let mathX = Math.max(-MATH_RANGE, Math.min(MATH_RANGE, unmapX(px)));
    let mathY = Math.max(-MATH_RANGE, Math.min(MATH_RANGE, unmapY(py)));

    if (activeNode === 'P') {
      // Prevent P and Q from overlapping
      if (mathX === q.x && mathY === q.y) return;
      setP({ x: mathX, y: mathY });
    } else if (activeNode === 'Q') {
      if (mathX === p.x && mathY === p.y) return;
      setQ({ x: mathX, y: mathY });
    }
  }, [activeNode, p, q]);

  const handlePointerUp = () => setActiveNode(null);

  const handleReset = () => {
    setP({ x: -4, y: -3 });
    setQ({ x: 4, y: 3 });
    setShowArchitecture(false);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Ruler className="text-sky-500" /> The Pythagorean Tether
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Deriving the Distance Formula from right-angled triangles.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Grid
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (CARTESIAN GRID) */}
        <div 
          className="relative w-full max-w-[600px] aspect-square bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <svg ref={svgRef} viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full drop-shadow-lg">
            
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

            {/* Hidden Architecture (The Triangle) */}
            <AnimatePresence>
              {showArchitecture && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* Triangle Fill */}
                  <polygon 
                    points={`${mapX(p.x)},${mapY(p.y)} ${mapX(t.x)},${mapY(t.y)} ${mapX(q.x)},${mapY(q.y)}`}
                    fill="#38bdf8" fillOpacity="0.1"
                  />

                  {/* Horizontal Leg (Base a) */}
                  <line 
                    x1={mapX(p.x)} y1={mapY(p.y)} 
                    x2={mapX(t.x)} y2={mapY(t.y)} 
                    stroke="#fbbf24" strokeWidth="4" strokeDasharray="6 6"
                  />
                  {/* Vertical Leg (Height b) */}
                  <line 
                    x1={mapX(t.x)} y1={mapY(t.y)} 
                    x2={mapX(q.x)} y2={mapY(q.y)} 
                    stroke="#f43f5e" strokeWidth="4" strokeDasharray="6 6"
                  />

                  {/* Intersection Point T */}
                  <circle cx={mapX(t.x)} cy={mapY(t.y)} r="6" fill="#a8a29e" />
                  <text x={mapX(t.x) + (dx > 0 ? 15 : -15)} y={mapY(t.y) + (dy > 0 ? 20 : -10)} fill="#a8a29e" fontSize="16" fontWeight="bold" className="font-serif font-bold text-lg" textAnchor="middle">
                    T
                  </text>

                  {/* Leg Labels */}
                  <text x={mapX((p.x + t.x) / 2)} y={mapY(t.y) + (dy > 0 ? 25 : -15)} fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="middle" className="bg-stone-900 drop-shadow-md">
                    |x₂ - x₁| = {Math.abs(dx)}
                  </text>
                  <text x={mapX(t.x) + (dx > 0 ? 25 : -25)} y={mapY((t.y + q.y) / 2)} fill="#fb7185" fontSize="18" fontWeight="bold" textAnchor={dx > 0 ? "start" : "end"} className="bg-stone-900 drop-shadow-md">
                    |y₂ - y₁| = {Math.abs(dy)}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* The Solid Tether (Hypotenuse c) */}
            <line 
              x1={mapX(p.x)} y1={mapY(p.y)} 
              x2={mapX(q.x)} y2={mapY(q.y)} 
              stroke="#38bdf8" strokeWidth="4" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
            />
            {showArchitecture && (
              <text x={mapX((p.x + q.x) / 2) - 15} y={mapY((p.y + q.y) / 2) - 15} fill="#38bdf8" fontSize="20" fontWeight="bold" className="drop-shadow-md">
                d
              </text>
            )}

            {/* Draggable Point P */}
            <g 
              transform={`translate(${mapX(p.x)}, ${mapY(p.y)})`} 
              className="cursor-pointer"
              onPointerDown={(e) => { e.stopPropagation(); setActiveNode('P'); }}
            >
              <circle cx="0" cy="0" r="14" fill="#38bdf8" opacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#bae6fd" strokeWidth="2" />
              <text x="-15" y="-15" fill="#bae6fd" fontSize="18" fontWeight="bold" className="font-serif bg-stone-900 drop-shadow-md">P</text>
            </g>

            {/* Draggable Point Q */}
            <g 
              transform={`translate(${mapX(q.x)}, ${mapY(q.y)})`} 
              className="cursor-pointer"
              onPointerDown={(e) => { e.stopPropagation(); setActiveNode('Q'); }}
            >
              <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="10" fill="#059669" stroke="#a7f3d0" strokeWidth="2" />
              <text x="15" y="-15" fill="#a7f3d0" fontSize="18" fontWeight="bold" className="font-serif bg-stone-900 drop-shadow-md">Q</text>
            </g>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Action Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Coordinate Tracker</span>
              <MapPin size={14} className="text-emerald-500" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-sky-950/30 border border-sky-900/50 p-4 rounded-xl flex flex-col items-center">
                <span className="text-sky-400 font-bold uppercase tracking-widest text-[10px] mb-2">Point P</span>
                <span className="text-2xl font-mono font-bold text-white">({p.x}, {p.y})</span>
              </div>
              <div className="flex-1 bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex flex-col items-center">
                <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-2">Point Q</span>
                <span className="text-2xl font-mono font-bold text-white">({q.x}, {q.y})</span>
              </div>
            </div>

            <button 
              onClick={() => setShowArchitecture(!showArchitecture)}
              className={`w-full py-4 font-bold text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border-2 ${
                showArchitecture ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-stone-950 border-stone-700 text-stone-400 hover:text-white'
              }`}
            >
              {showArchitecture ? <EyeOff size={18} /> : <Eye size={18} />}
              {showArchitecture ? 'Hide Hidden Triangle' : 'Reveal Architecture'}
            </button>
          </div>

          {/* Mathematical Translation HUD */}
          <div className={`bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1 transition-opacity duration-500 ${!showArchitecture ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Formula Breakdown</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <div className="flex flex-col gap-4 font-mono text-sm border-b border-stone-800 pb-6">
                
                {/* Pythagoras Link */}
                <div className="flex justify-between items-center text-stone-500 mb-2">
                  <span>Pythagoras:</span>
                  <span className="text-white bg-stone-900 px-3 py-1 rounded border border-stone-700">c² = a² + b²</span>
                </div>

                {/* Base calculation */}
                <div className="flex justify-between items-center text-amber-400">
                  <span>Base (a) = |x₂ - x₁|</span>
                  <span>|{q.x} - {p.x}| = {Math.abs(dx)}</span>
                </div>

                {/* Height calculation */}
                <div className="flex justify-between items-center text-rose-400">
                  <span>Height (b) = |y₂ - y₁|</span>
                  <span>|{q.y} - {p.y}| = {Math.abs(dy)}</span>
                </div>

                {/* Distance squared */}
                <div className="flex justify-between items-center text-sky-400 pt-2 border-t border-stone-800/50 mt-2">
                  <span>Distance (d²) = a² + b²</span>
                  <span>{dx * dx} + {dy * dy} = {dx * dx + dy * dy}</span>
                </div>

              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-2">
                <AnimatePresence mode="wait">
                  {showArchitecture && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                      <div className="bg-sky-950/20 border border-sky-900/50 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-sky-400 font-bold uppercase tracking-widest text-xs">Final Distance (d)</span>
                        <span className="text-2xl font-bold font-mono text-white">{distance.toFixed(2)} units</span>
                      </div>
                      <p className="text-stone-300 font-sans text-xs leading-relaxed mt-2">
                        Drag the points! The base is ALWAYS the difference in $X$, and the height is ALWAYS the difference in $Y$. 
                      </p>
                {/*      <p className="text-stone-400 font-sans text-xs leading-relaxed">
                        The intimidating distance formula $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$ is literally just the Pythagoras Theorem wearing an algebraic mask.
                      </p>   */}
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