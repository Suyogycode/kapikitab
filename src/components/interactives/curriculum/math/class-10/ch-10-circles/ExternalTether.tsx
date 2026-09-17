'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDot, Anchor, RotateCcw, ShieldCheck, Layers, GitMerge } from 'lucide-react';

export default function ExternalTether() {
  // SVG Canvas & Circle Constants
  const GRAPH_SIZE = 600;
  const CX = 300;
  const CY = 300;
  const R = 100;
  const MIN_DIST = R + 20; // Prevent P from entering the circle
  
  // External Point P State
  const [P, setP] = useState({ x: 100, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFolded, setIsFolded] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !svgRef.current) return;
    
    // If user drags while folded, break the fold to show live updating again
    if (isFolded) setIsFolded(false);

    const rect = svgRef.current.getBoundingClientRect();
    let px = e.clientX - rect.left;
    let py = e.clientY - rect.top;

    const dx = px - CX;
    const dy = py - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Enforce the boundary so P stays external
    if (dist < MIN_DIST) {
      px = CX + (dx / dist) * MIN_DIST;
      py = CY + (dy / dist) * MIN_DIST;
    }

    setP({ x: px, y: py });
  }, [isDragging, isFolded]);

  const handlePointerUp = () => setIsDragging(false);

  // Geometric Math Engine
  const geom = useMemo(() => {
    const dx = P.x - CX;
    const dy = P.y - CY;
    const distOP = Math.sqrt(dx * dx + dy * dy);
    
    // Length of the tangents using Pythagoras: OP^2 = OQ^2 + PQ^2
    const tangentLen = Math.sqrt(distOP * distOP - R * R);
    
    // Angles to calculate the exact contact points Q and R
    const alpha = Math.atan2(dy, dx);
    const theta = Math.acos(R / distOP);

    const Q = {
      x: CX + R * Math.cos(alpha - theta),
      y: CY + R * Math.sin(alpha - theta)
    };
    
    const R_pt = {
      x: CX + R * Math.cos(alpha + theta),
      y: CY + R * Math.sin(alpha + theta)
    };

    // Calculate Right Angle Square Markers
    const uQ = { x: (Q.x - CX) / R, y: (Q.y - CY) / R };
    const vQ = { x: (P.x - Q.x) / tangentLen, y: (P.y - Q.y) / tangentLen };
    const qSquare = `M ${Q.x - 15 * uQ.x} ${Q.y - 15 * uQ.y} L ${Q.x - 15 * uQ.x + 15 * vQ.x} ${Q.y - 15 * uQ.y + 15 * vQ.y} L ${Q.x + 15 * vQ.x} ${Q.y + 15 * vQ.y}`;

    const uR = { x: (R_pt.x - CX) / R, y: (R_pt.y - CY) / R };
    const vR = { x: (P.x - R_pt.x) / tangentLen, y: (P.y - R_pt.y) / tangentLen };
    const rSquare = `M ${R_pt.x - 15 * uR.x} ${R_pt.y - 15 * uR.y} L ${R_pt.x - 15 * uR.x + 15 * vR.x} ${R_pt.y - 15 * uR.y + 15 * vR.y} L ${R_pt.x + 15 * vR.x} ${R_pt.y + 15 * vR.y}`;

    return { distOP, tangentLen, Q, R: R_pt, qSquare, rSquare };
  }, [P]);

  const handleReset = () => {
    setP({ x: 100, y: 150 });
    setIsFolded(false);
  };

  // SVG Polygon Points for the fold animation
  const triangleOPQ = `${CX},${CY} ${P.x},${P.y} ${geom.Q.x},${geom.Q.y}`;
  const triangleOPR = `${CX},${CY} ${P.x},${P.y} ${geom.R.x},${geom.R.y}`;

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#09090b] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <CircleDot className="text-sky-400" /> The External Tether
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Theorem 10.2: Tangents drawn from an external point to a circle are equal.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Tether
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG CANVAS) */}
        <div 
          className="relative w-full lg:w-2/3 bg-gradient-to-tr from-[#1c1917] to-[#0c0a09] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          
          {/* Fold Status Overlay */}
          <AnimatePresence>
            {isFolded && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-950/80 border border-emerald-500 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] backdrop-blur-md z-20 flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-sm">
                <GitMerge size={16} /> Triangles Congruent
              </motion.div>
            )}
          </AnimatePresence>

          <svg ref={svgRef} viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* Base Triangle OPR (Bottom) */}
            <polygon points={triangleOPR} fill="#38bdf8" fillOpacity="0.1" />

            {/* Base Triangle OPQ (Top) - Normally visible, but morphs into OPR when folded */}
            <motion.polygon 
              animate={{ points: isFolded ? triangleOPR : triangleOPQ }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
              fill="#fbbf24" fillOpacity="0.15" stroke="#fbbf24" strokeWidth={isFolded ? "4" : "0"} 
              className={isFolded ? "drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" : ""}
            />

            {/* The Main Circle */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#a8a29e" strokeWidth="4" />
            
            {/* Center Point O */}
            <circle cx={CX} cy={CY} r="6" fill="#d6d3d1" />
            <text x={CX - 20} y={CY + 5} fill="#d6d3d1" fontSize="18" fontWeight="bold" className="font-serif">O</text>

            {/* Radii (OQ and OR) */}
            <line x1={CX} y1={CY} x2={geom.Q.x} y2={geom.Q.y} stroke="#a8a29e" strokeWidth="2" strokeDasharray="6 6" />
            <line x1={CX} y1={CY} x2={geom.R.x} y2={geom.R.y} stroke="#a8a29e" strokeWidth="2" strokeDasharray="6 6" />

            {/* Common Hypotenuse OP */}
            <line x1={CX} y1={CY} x2={P.x} y2={P.y} stroke="#e7e5e4" strokeWidth="3" strokeDasharray="8 4" />

            {/* Tangent PQ */}
            <motion.line 
              animate={{ opacity: isFolded ? 0 : 1 }}
              x1={P.x} y1={P.y} x2={geom.Q.x} y2={geom.Q.y} 
              stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" 
            />
            {/* Tangent PR */}
            <line x1={P.x} y1={P.y} x2={geom.R.x} y2={geom.R.y} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]" />

            {/* Right Angle Squares */}
            <motion.path animate={{ opacity: isFolded ? 0 : 1 }} d={geom.qSquare} fill="none" stroke="#fbbf24" strokeWidth="2" />
            <path d={geom.rSquare} fill="none" stroke="#38bdf8" strokeWidth="2" />

            {/* Contact Points Q and R */}
            <motion.circle animate={{ opacity: isFolded ? 0 : 1 }} cx={geom.Q.x} cy={geom.Q.y} r="8" fill="#f59e0b" />
            <motion.text animate={{ opacity: isFolded ? 0 : 1 }} x={geom.Q.x + 10} y={geom.Q.y - 15} fill="#fcd34d" fontSize="20" fontWeight="bold" className="font-serif drop-shadow-md">Q</motion.text>
            
            <circle cx={geom.R.x} cy={geom.R.y} r="8" fill="#0284c7" />
            <text x={geom.R.x + 10} y={geom.R.y + 25} fill="#bae6fd" fontSize="20" fontWeight="bold" className="font-serif drop-shadow-md">R</text>

            {/* Draggable External Point P */}
            <g 
              transform={`translate(${P.x}, ${P.y})`} 
              className="cursor-pointer"
              onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
            >
              <circle cx="0" cy="0" r="18" fill="#f43f5e" opacity="0.2" className="animate-ping" />
              <circle cx="0" cy="0" r="12" fill="#e11d48" stroke="#fecdd3" strokeWidth="3" />
              <text x="-25" y="-15" fill="#fecdd3" fontSize="22" fontWeight="bold" className="font-serif drop-shadow-md">P</text>
            </g>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Live Data Dashboard */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Tangent Telemetry</span>
              <Anchor size={14} className="text-sky-500" />
            </div>
            
            <div className="flex flex-col gap-4">
              <p className="text-stone-400 text-xs">Drag the red node <strong className="text-rose-400">P</strong> to stretch the tangents around the circle.</p>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                {/* Tangent PQ */}
                <div className={`border p-4 rounded-xl flex flex-col items-center gap-1 transition-colors duration-500 ${isFolded ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-amber-950/20 border-amber-900/50'}`}>
                  <span className="text-amber-500 text-[10px] uppercase tracking-widest font-bold">Tangent PQ</span>
                  <span className={`font-mono font-bold text-2xl ${isFolded ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(geom.tangentLen / 10).toFixed(2)}
                  </span>
                </div>
                
                {/* Tangent PR */}
                <div className={`border p-4 rounded-xl flex flex-col items-center gap-1 transition-colors duration-500 ${isFolded ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-sky-950/20 border-sky-900/50'}`}>
                  <span className="text-sky-500 text-[10px] uppercase tracking-widest font-bold">Tangent PR</span>
                  <span className={`font-mono font-bold text-2xl ${isFolded ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {(geom.tangentLen / 10).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsFolded(!isFolded)}
              className={`w-full py-4 mt-2 font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg border-2 ${
                isFolded ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-stone-950 hover:bg-stone-800 border-stone-700 text-stone-300'
              }`}
            >
              {isFolded ? <RotateCcw size={18} /> : <Layers size={18} />}
              {isFolded ? 'Unfold Triangles' : 'Verify Congruence'}
            </button>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <ShieldCheck className={isFolded ? "text-emerald-500" : "text-amber-500"} size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric Proof</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {!isFolded ? (
                  <motion.div key="live" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Notice the digital lengths above. No matter where you drag Point P, the lengths of <strong className="text-amber-400 font-mono">PQ</strong> and <strong className="text-sky-400 font-mono">PR</strong> remain exactly identical.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl mt-auto">
                      <p className="text-stone-400 text-xs leading-relaxed">
                        To prove <em>why</em> they are equal without relying on a ruler, we must prove that the top triangle ($\Delta OPQ$) is an exact clone of the bottom triangle ($\Delta OPR$). <br/><br/>
                        Click <strong className="text-white">Verify Congruence</strong> to execute the proof.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="proof" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest border-b border-stone-800 pb-2">RHS Congruence Verified</h4>
                    
                    <ul className="text-stone-300 text-sm space-y-3 font-mono">
                      <li className="flex items-start gap-3">
                        <span className="text-rose-400 font-bold w-4">R</span>
                        <span className="flex-1">∠OQP = ∠ORP = 90° (Theorem 10.1)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-sky-400 font-bold w-4">H</span>
                        <span className="flex-1">OP = OP (Common Hypotenuse)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-amber-400 font-bold w-4">S</span>
                        <span className="flex-1">OQ = OR (Radii of same circle)</span>
                      </li>
                    </ul>

                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl mt-auto">
                      <p className="text-emerald-200/90 text-xs leading-relaxed">
                        Because $\Delta OPQ \cong \Delta OPR$, the triangles fold perfectly over each other. Therefore, <strong className="text-emerald-400 font-mono text-sm">PQ = PR</strong> via CPCTC (Corresponding Parts of Congruent Triangles are Congruent). The theorem is undeniable!
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