'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Target, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Point = { id: string; x: number; y: number };

export default function GeometryDetective() {
  // Modes: 'collinear' (3 points) or 'quad' (4 points)
  const [mode, setMode] = useState<'collinear' | 'quad'>('quad');

  // Node States
  const [pts, setPts] = useState<Record<string, Point>>({
    A: { id: 'A', x: -2, y: 3 },
    B: { id: 'B', x: 3, y: 4 },
    C: { id: 'C', x: 4, y: -1 },
    D: { id: 'D', x: -1, y: -2 }
  });

  const [activeNode, setActiveNode] = useState<string | null>(null);

  // SVG Mapping Constants
  const GRAPH_SIZE = 600;
  const MATH_RANGE = 8;
  const SCALE = GRAPH_SIZE / (MATH_RANGE * 2);

  const mapX = (x: number) => (x + MATH_RANGE) * SCALE;
  const mapY = (y: number) => GRAPH_SIZE - (y + MATH_RANGE) * SCALE;
  const unmapX = (px: number) => Math.round(px / SCALE) - MATH_RANGE;
  const unmapY = (py: number) => MATH_RANGE - Math.round(py / SCALE);

  // Dragging Logic
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mathX = Math.max(-MATH_RANGE, Math.min(MATH_RANGE, unmapX(px)));
    const mathY = Math.max(-MATH_RANGE, Math.min(MATH_RANGE, unmapY(py)));

    // Prevent overlapping nodes
    const isOccupied = Object.values(pts).some(
      p => p.id !== activeNode && p.x === mathX && p.y === mathY
    );

    if (!isOccupied) {
      setPts(prev => ({
        ...prev,
        [activeNode]: { ...prev[activeNode], x: mathX, y: mathY }
      }));
    }
  }, [activeNode, pts]);

  const handlePointerUp = () => setActiveNode(null);

  const toggleMode = (newMode: 'collinear' | 'quad') => {
    setMode(newMode);
    if (newMode === 'collinear') {
      setPts({
        A: { id: 'A', x: -4, y: -2 },
        B: { id: 'B', x: 0, y: 0 },
        C: { id: 'C', x: 2, y: 5 },
        D: pts.D // Keep D in memory but ignore it
      });
    } else {
      setPts({
        A: { id: 'A', x: -2, y: 3 },
        B: { id: 'B', x: 3, y: 4 },
        C: { id: 'C', x: 4, y: -1 },
        D: { id: 'D', x: -1, y: -2 }
      });
    }
  };

  // Math Engine
  const distSq = (p1: Point, p2: Point) => Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
  
  // Format distance cleanly (e.g., √34 or 5)
  const formatDist = (sq: number) => {
    const root = Math.sqrt(sq);
    return Number.isInteger(root) ? root.toString() : `√${sq}`;
  };

  // Unified return object to satisfy TypeScript
  const engine = useMemo(() => {
    const { A, B, C, D } = pts;
    
    const result = {
      isLine: false, status: '', dAB: 0, dBC: 0, dAC: 0,
      sAB: 0, sBC: 0, sCD: 0, sDA: 0, diagAC: 0, diagBD: 0,
      classification: '', highlight: ''
    };

    if (mode === 'collinear') {
      const crossProduct = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
      result.isLine = crossProduct === 0;
      result.status = result.isLine ? 'Collinear' : 'Triangle';
      result.dAB = distSq(A, B);
      result.dBC = distSq(B, C);
      result.dAC = distSq(A, C);
    } 
    else {
      // Quadrilateral Checks
      result.sAB = distSq(A, B);
      result.sBC = distSq(B, C);
      result.sCD = distSq(C, D);
      result.sDA = distSq(D, A);
      result.diagAC = distSq(A, C);
      result.diagBD = distSq(B, D);

      const sidesEqual = result.sAB === result.sBC && result.sBC === result.sCD && result.sCD === result.sDA;
      const oppEqual = result.sAB === result.sCD && result.sBC === result.sDA;
      const diagsEqual = result.diagAC === result.diagBD;

      result.classification = 'Quadrilateral';
      result.highlight = 'text-stone-400';

      if (sidesEqual && diagsEqual) {
        result.classification = 'Square';
        result.highlight = 'text-emerald-400';
      } else if (sidesEqual && !diagsEqual) {
        result.classification = 'Rhombus';
        result.highlight = 'text-amber-400';
      } else if (oppEqual && diagsEqual) {
        result.classification = 'Rectangle';
        result.highlight = 'text-sky-400';
      } else if (oppEqual && !diagsEqual) {
        result.classification = 'Parallelogram';
        result.highlight = 'text-purple-400';
      }
    }

    return result;
  }, [pts, mode]);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Search className="text-amber-500" /> The Geometry Detective
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Using the Distance Formula to classify shapes and identify collinearity.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toggleMode('collinear')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${mode === 'collinear' ? 'bg-sky-950 border-sky-500 text-sky-400' : 'bg-stone-900 border-stone-700 text-stone-400'}`}>3 Points</button>
          <button onClick={() => toggleMode('quad')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${mode === 'quad' ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-stone-900 border-stone-700 text-stone-400'}`}>4 Points</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (PEGBOARD) */}
        <div 
          className="relative w-full max-w-[600px] aspect-square bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Classification Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-stone-900/90 border border-stone-700 px-8 py-3 rounded-full shadow-2xl backdrop-blur-md z-20 flex items-center gap-3">
            <Target size={18} className={mode === 'quad' ? engine.highlight : (engine.isLine ? 'text-emerald-400' : 'text-stone-400')} />
            <span className={`font-serif font-bold text-xl uppercase tracking-widest ${mode === 'quad' ? engine.highlight : (engine.isLine ? 'text-emerald-400' : 'text-stone-400')}`}>
              {mode === 'quad' ? engine.classification : engine.status}
            </span>
          </div>

          <svg ref={svgRef} viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full drop-shadow-lg">
            
            {/* Grid */}
            <g className="opacity-10">
              {Array.from({ length: MATH_RANGE * 2 + 1 }).map((_, i) => {
                const pos = i * SCALE;
                return (
                  <React.Fragment key={i}>
                    <line x1={pos} y1="0" x2={pos} y2={GRAPH_SIZE} stroke="#e7e5e4" strokeWidth="1" />
                    <line x1="0" y1={pos} x2={GRAPH_SIZE} y2={pos} stroke="#e7e5e4" strokeWidth="1" />
                  </React.Fragment>
                );
              })}
            </g>

            {/* Axes */}
            <line x1={GRAPH_SIZE / 2} y1="0" x2={GRAPH_SIZE / 2} y2={GRAPH_SIZE} stroke="#44403c" strokeWidth="2" />
            <line x1="0" y1={GRAPH_SIZE / 2} x2={GRAPH_SIZE} y2={GRAPH_SIZE / 2} stroke="#44403c" strokeWidth="2" />

            {/* Elastic Bands (Lines) */}
            <g className="transition-all duration-75">
              <line x1={mapX(pts.A.x)} y1={mapY(pts.A.y)} x2={mapX(pts.B.x)} y2={mapY(pts.B.y)} stroke="#38bdf8" strokeWidth="4" />
              <line x1={mapX(pts.B.x)} y1={mapY(pts.B.y)} x2={mapX(pts.C.x)} y2={mapY(pts.C.y)} stroke="#38bdf8" strokeWidth="4" />
              
              {mode === 'quad' && (
                <>
                  <line x1={mapX(pts.C.x)} y1={mapY(pts.C.y)} x2={mapX(pts.D.x)} y2={mapY(pts.D.y)} stroke="#38bdf8" strokeWidth="4" />
                  <line x1={mapX(pts.D.x)} y1={mapY(pts.D.y)} x2={mapX(pts.A.x)} y2={mapY(pts.A.y)} stroke="#38bdf8" strokeWidth="4" />
                  
                  {/* Diagonals */}
                  <line x1={mapX(pts.A.x)} y1={mapY(pts.A.y)} x2={mapX(pts.C.x)} y2={mapY(pts.C.y)} stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 6" />
                  <line x1={mapX(pts.B.x)} y1={mapY(pts.B.y)} x2={mapX(pts.D.x)} y2={mapY(pts.D.y)} stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 6" />
                </>
              )}
              {mode === 'collinear' && !engine.isLine && (
                <line x1={mapX(pts.C.x)} y1={mapY(pts.C.y)} x2={mapX(pts.A.x)} y2={mapY(pts.A.y)} stroke="#38bdf8" strokeWidth="4" />
              )}
            </g>

            {/* Glowing Nodes */}
            {['A', 'B', 'C', mode === 'quad' ? 'D' : null].filter(Boolean).map((nodeId) => {
              const p = pts[nodeId as string];
              return (
                <g 
                  key={p.id}
                  transform={`translate(${mapX(p.x)}, ${mapY(p.y)})`} 
                  className="cursor-pointer"
                  onPointerDown={(e) => { e.stopPropagation(); setActiveNode(p.id); }}
                >
                  <circle cx="0" cy="0" r="16" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                  <circle cx="0" cy="0" r="10" fill="#d97706" stroke="#fde68a" strokeWidth="2" />
                  <text x="-15" y="-15" fill="#fde68a" fontSize="18" fontWeight="bold" className="font-serif bg-stone-900 drop-shadow-md">{p.id}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Real-time Distance Tracker */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Distance Tracker</span>
              <MapPin size={14} className="text-sky-500" />
            </div>

            {mode === 'quad' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-stone-400 font-mono">AB</span>
                    <span className="text-sky-400 font-bold text-lg font-mono">{formatDist(engine.sAB)}</span>
                  </div>
                  <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-stone-400 font-mono">BC</span>
                    <span className="text-sky-400 font-bold text-lg font-mono">{formatDist(engine.sBC)}</span>
                  </div>
                  <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-stone-400 font-mono">CD</span>
                    <span className="text-sky-400 font-bold text-lg font-mono">{formatDist(engine.sCD)}</span>
                  </div>
                  <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-stone-400 font-mono">DA</span>
                    <span className="text-sky-400 font-bold text-lg font-mono">{formatDist(engine.sDA)}</span>
                  </div>
                </div>
                
                <div className="mt-2 border-t border-stone-800 pt-4 grid grid-cols-2 gap-3">
                  <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-rose-400 font-mono text-xs uppercase">Diag AC</span>
                    <span className="text-rose-300 font-bold text-lg font-mono">{formatDist(engine.diagAC)}</span>
                  </div>
                  <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-rose-400 font-mono text-xs uppercase">Diag BD</span>
                    <span className="text-rose-300 font-bold text-lg font-mono">{formatDist(engine.diagBD)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-stone-400 font-mono">AB</span>
                  <span className="text-sky-400 font-bold text-lg font-mono">{formatDist(engine.dAB)}</span>
                </div>
                <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-stone-400 font-mono">BC</span>
                  <span className="text-sky-400 font-bold text-lg font-mono">{formatDist(engine.dBC)}</span>
                </div>
                <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-stone-400 font-mono">AC</span>
                  <span className="text-sky-400 font-bold text-lg font-mono">{formatDist(engine.dAC)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <ShieldCheck className={mode === 'quad' ? "text-amber-500" : "text-sky-500"} size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Proof Engine</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {mode === 'quad' ? (
                  <motion.div key="quad-proof" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 h-full">
                    
                    {engine.classification === 'Square' && (
                      <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl flex flex-col gap-2">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Square Verified</h4>
                        <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                          All 4 outer sides are exactly equal, AND both inner diagonals are perfectly equal. The math verifies perfect 90° corners!
                        </p>
                      </div>
                    )}

                    {engine.classification === 'Rhombus' && (
                      <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl flex flex-col gap-2">
                        <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest">Rhombus Verified</h4>
                        <p className="text-amber-100/80 font-sans text-xs leading-relaxed">
                          All 4 outer sides are equal, but the diagonals are <strong>not</strong> equal. The shape is physically slanted! Adjust the corners to equalize the red dashed lines to form a square.
                        </p>
                      </div>
                    )}

                    {(engine.classification !== 'Square' && engine.classification !== 'Rhombus') && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-stone-300 font-bold text-xs uppercase tracking-widest">The Quadrilateral Challenge</h4>
                        <p className="text-stone-400 font-sans text-xs leading-relaxed">
                          Drag the four nodes to build a perfect <strong className="text-emerald-400">Square</strong>.
                        </p>
                        <p className="text-stone-500 font-sans text-xs leading-relaxed">
                          Watch out for the "Rhombus Trap"—if your outer sides match (e.g., √34) but your diagonals don't, it is not a square!
                        </p>
                      </div>
                    )}
                  </motion.div>

                ) : (

                  <motion.div key="line-proof" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 h-full">
                    {engine.isLine ? (
                      <div className="bg-emerald-950/30 border border-emerald-500 p-6 rounded-xl flex flex-col gap-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center gap-3 text-emerald-400">
                          <CheckCircle2 size={24} />
                          <h3 className="font-bold text-lg uppercase tracking-widest">Collinearity Proven</h3>
                        </div>
                        <p className="text-emerald-100/90 text-sm leading-relaxed">
                          The triangle has completely collapsed! When three points form a perfectly straight line, the sum of the two smaller segments exactly equals the largest segment.
                        </p>
                        <div className="bg-emerald-950 border border-emerald-900/50 p-3 rounded-lg text-center font-mono font-bold text-lg text-emerald-300">
                          AB + BC = AC
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-sky-500 shrink-0 mt-0.5" size={20} />
                        <p className="text-stone-300 font-sans text-xs leading-relaxed">
                          Currently, these three points form a triangle. <br/><br/>
                          <strong className="text-sky-400 uppercase tracking-widest">Your Challenge:</strong><br/>
                          Drag the points until they form a perfectly straight line. When they do, the engine will trigger the mathematical proof for Collinearity!
                        </p>
                      </div>
                    )}
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