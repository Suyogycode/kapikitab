'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Scale, RotateCcw, PackageOpen, LayoutGrid, CheckCircle2 } from 'lucide-react';

export default function QuadrilateralWrapper() {
  // Tangent contact angles (in degrees)
  const [t1, setT1] = useState<number>(45);  // Top Right
  const [t2, setT2] = useState<number>(135); // Top Left
  const [t3, setT3] = useState<number>(225); // Bottom Left
  const [t4, setT4] = useState<number>(315); // Bottom Right

  // Step Machine
  // 0: Initial Quadrilateral
  // 1: Extract into Segments
  // 2: The Color Balance (Aha!)
  const [step, setStep] = useState<number>(0);

  const handleNext = () => setStep(s => Math.min(s + 1, 2));
  const handleReset = () => {
    setT1(45); setT2(135); setT3(225); setT4(315);
    setStep(0);
  };

  // SVG Geometry Engine
  const GRAPH_SIZE = 600;
  const CX = 300;
  const CY = 300;
  const R = 150;

  const geom = useMemo(() => {
    // Helper to get contact point coordinates
    const getT = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad), rad }; // -sin because SVG Y goes down
    };

    const T1 = getT(t1);
    const T2 = getT(t2);
    const T3 = getT(t3);
    const T4 = getT(t4);

    // Robust Tangent Intersection Formula
    const getIntersect = (p1: any, p2: any) => {
      const x1 = Math.cos(p1.rad), y1 = Math.sin(p1.rad);
      const x2 = Math.cos(p2.rad), y2 = Math.sin(p2.rad);
      const det = x1 * y2 - x2 * y1;
      
      const ix = R * (y2 - y1) / det;
      const iy = R * (x1 - x2) / det; // -iy effectively applied via SVG space logic
      return { x: CX + ix, y: CY - iy };
    };

    // The corners of the circumscribing quadrilateral
    const B = getIntersect(T1, T2);
    const C = getIntersect(T2, T3);
    const D = getIntersect(T3, T4);
    const A = getIntersect(T4, T1);

    // Distance Helper
    const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

    // Calculate colored segment lengths (pixels / 10 for clean numbers)
    const lenA = dist(A, T1) / 10; // Blue
    const lenB = dist(B, T1) / 10; // Yellow
    const lenC = dist(C, T2) / 10; // Green
    const lenD = dist(D, T3) / 10; // Red

    const AB = lenA + lenB;
    const BC = lenB + lenC;
    const CD = lenC + lenD;
    const DA = lenD + lenA;

    return { T1, T2, T3, T4, A, B, C, D, lenA, lenB, lenC, lenD, AB, BC, CD, DA };
  }, [t1, t2, t3, t4]);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Square className="text-purple-500" /> The Quadrilateral Wrapper
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Proving opposite side equilibrium ($AB + CD = AD + BC$).
          </p>
        </div>
        {step > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Wrapper
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG CANVAS) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          {/* Live HUD Values injected into SVG space */}
          <div className="absolute top-4 left-4 flex gap-4 pointer-events-none opacity-50 font-mono text-sm">
            <div className="flex flex-col text-stone-300">
              <span>AB = {geom.AB.toFixed(1)}</span>
              <span>CD = {geom.CD.toFixed(1)}</span>
              <span className="border-t border-stone-500 pt-1 mt-1 text-white font-bold text-lg">Sum: {(geom.AB + geom.CD).toFixed(1)}</span>
            </div>
            <div className="flex flex-col text-stone-300">
              <span>AD = {geom.DA.toFixed(1)}</span>
              <span>BC = {geom.BC.toFixed(1)}</span>
              <span className="border-t border-stone-500 pt-1 mt-1 text-white font-bold text-lg">Sum: {(geom.DA + geom.BC).toFixed(1)}</span>
            </div>
          </div>

          <svg viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full max-w-[500px] aspect-square drop-shadow-2xl overflow-visible mt-8">
            
            {/* The Central Circle */}
            <circle cx={CX} cy={CY} r={R} fill="#292524" stroke="#57534e" strokeWidth="4" />

            {/* Render Tangent Segments (Color Coded by Origin Corner) */}
            <g className="transition-all duration-75">
              {/* Corner A Segments (Blue) */}
              <line x1={geom.A.x} y1={geom.A.y} x2={geom.T1.x} y2={geom.T1.y} stroke="#38bdf8" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />
              <line x1={geom.A.x} y1={geom.A.y} x2={geom.T4.x} y2={geom.T4.y} stroke="#38bdf8" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />
              
              {/* Corner B Segments (Yellow) */}
              <line x1={geom.B.x} y1={geom.B.y} x2={geom.T1.x} y2={geom.T1.y} stroke="#fbbf24" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />
              <line x1={geom.B.x} y1={geom.B.y} x2={geom.T2.x} y2={geom.T2.y} stroke="#fbbf24" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />

              {/* Corner C Segments (Green) */}
              <line x1={geom.C.x} y1={geom.C.y} x2={geom.T2.x} y2={geom.T2.y} stroke="#10b981" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />
              <line x1={geom.C.x} y1={geom.C.y} x2={geom.T3.x} y2={geom.T3.y} stroke="#10b981" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />

              {/* Corner D Segments (Red) */}
              <line x1={geom.D.x} y1={geom.D.y} x2={geom.T3.x} y2={geom.T3.y} stroke="#f43f5e" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />
              <line x1={geom.D.x} y1={geom.D.y} x2={geom.T4.x} y2={geom.T4.y} stroke="#f43f5e" strokeWidth={step > 0 ? "8" : "4"} strokeLinecap="round" />
            </g>

            {/* Corner Nodes */}
            <circle cx={geom.A.x} cy={geom.A.y} r="6" fill="#38bdf8" />
            <text x={geom.A.x + 15} y={geom.A.y + 5} fill="#bae6fd" fontSize="24" fontWeight="bold" className="font-serif drop-shadow-md">A</text>
            
            <circle cx={geom.B.x} cy={geom.B.y} r="6" fill="#fbbf24" />
            <text x={geom.B.x - 20} y={geom.B.y - 10} fill="#fde68a" fontSize="24" fontWeight="bold" className="font-serif drop-shadow-md" textAnchor="end">B</text>

            <circle cx={geom.C.x} cy={geom.C.y} r="6" fill="#10b981" />
            <text x={geom.C.x - 20} y={geom.C.y + 20} fill="#a7f3d0" fontSize="24" fontWeight="bold" className="font-serif drop-shadow-md" textAnchor="end">C</text>

            <circle cx={geom.D.x} cy={geom.D.y} r="6" fill="#f43f5e" />
            <text x={geom.D.x + 15} y={geom.D.y + 20} fill="#fecdd3" fontSize="24" fontWeight="bold" className="font-serif drop-shadow-md">D</text>

            {/* Tangent Contact Points */}
            <g opacity="0.6">
              <circle cx={geom.T1.x} cy={geom.T1.y} r="4" fill="#ffffff" />
              <circle cx={geom.T2.x} cy={geom.T2.y} r="4" fill="#ffffff" />
              <circle cx={geom.T3.x} cy={geom.T3.y} r="4" fill="#ffffff" />
              <circle cx={geom.T4.x} cy={geom.T4.y} r="4" fill="#ffffff" />
            </g>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Distortion Controls */}
          <div className={`bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6 transition-all duration-300 ${step > 0 ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Distort Wrapper</span>
              <LayoutGrid size={14} className="text-purple-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div className="flex flex-col gap-2">
                <span className="text-stone-400 font-bold text-[10px] uppercase tracking-widest">Tangent 1</span>
                <input type="range" min="10" max="80" step="1" value={t1} onChange={(e) => setT1(parseInt(e.target.value))} className="w-full accent-stone-500" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-stone-400 font-bold text-[10px] uppercase tracking-widest">Tangent 2</span>
                <input type="range" min="100" max="170" step="1" value={t2} onChange={(e) => setT2(parseInt(e.target.value))} className="w-full accent-stone-500" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-stone-400 font-bold text-[10px] uppercase tracking-widest">Tangent 3</span>
                <input type="range" min="190" max="260" step="1" value={t3} onChange={(e) => setT3(parseInt(e.target.value))} className="w-full accent-stone-500" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-stone-400 font-bold text-[10px] uppercase tracking-widest">Tangent 4</span>
                <input type="range" min="280" max="350" step="1" value={t4} onChange={(e) => setT4(parseInt(e.target.value))} className="w-full accent-stone-500" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.button key="btn-extract" onClick={handleNext} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 mt-2">
                  <PackageOpen size={18} /> Extract Segments
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* The Balance Scale HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Scale className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Equilibrium Scale</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              {/* Top Explanation */}
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="text0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-stone-300 text-sm leading-relaxed mb-4">
                    Distort the quadrilateral using the sliders. Notice that no matter how irregular the shape becomes, the sum of the top/bottom sides (<strong className="text-white">AB + CD</strong>) always matches the left/right sides (<strong className="text-white">AD + BC</strong>). Click the button to prove why!
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="text1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-stone-300 text-sm leading-relaxed mb-4">
                    Theorem 10.2 states that tangents from the same external point are perfectly equal. Therefore, the corners act like hinges with two identical colored segments.
                    <button onClick={handleNext} className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                      <Scale size={16} /> Balance The Scales
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Physical Scales */}
              <div className="flex-1 flex flex-col justify-end gap-2 relative">
                
                {/* Visual Scale Balance Point */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-b-stone-700"></div>
                <div className="absolute bottom-5 left-8 right-8 h-2 bg-stone-700 rounded-full"></div>

                <div className="flex justify-between items-end px-8 pb-8 z-10 w-full relative">
                  
                  {/* Left Pan (AB + CD) */}
                  <div className="w-[120px] flex flex-col items-center gap-2">
                    <div className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">AB + CD</div>
                    
                    <AnimatePresence mode="wait">
                      {step === 0 ? (
                        <motion.div key="left-raw" exit={{ opacity: 0, scale: 0 }} className="w-full bg-stone-800 border-2 border-stone-600 rounded-lg p-3 text-center text-white font-mono font-bold shadow-lg">
                          {(geom.AB + geom.CD).toFixed(1)}
                        </motion.div>
                      ) : (
                        <motion.div key="left-split" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col w-full gap-1">
                          {/* AB */}
                          <div className="flex w-full h-8 rounded-md overflow-hidden shadow-md">
                            <motion.div layout style={{ flex: geom.lenA }} className="bg-sky-500 flex items-center justify-center text-sky-950 font-bold text-xs font-mono">A</motion.div>
                            <motion.div layout style={{ flex: geom.lenB }} className="bg-amber-400 flex items-center justify-center text-amber-950 font-bold text-xs font-mono">B</motion.div>
                          </div>
                          <div className="text-stone-500 font-bold text-lg text-center">+</div>
                          {/* CD */}
                          <div className="flex w-full h-8 rounded-md overflow-hidden shadow-md">
                            <motion.div layout style={{ flex: geom.lenC }} className="bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold text-xs font-mono">C</motion.div>
                            <motion.div layout style={{ flex: geom.lenD }} className="bg-rose-500 flex items-center justify-center text-rose-950 font-bold text-xs font-mono">D</motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Equality Operator */}
                  <AnimatePresence>
                    {step === 2 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold text-4xl mb-6">=</motion.div>
                    )}
                  </AnimatePresence>

                  {/* Right Pan (AD + BC) */}
                  <div className="w-[120px] flex flex-col items-center gap-2">
                    <div className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">AD + BC</div>
                    
                    <AnimatePresence mode="wait">
                      {step === 0 ? (
                        <motion.div key="right-raw" exit={{ opacity: 0, scale: 0 }} className="w-full bg-stone-800 border-2 border-stone-600 rounded-lg p-3 text-center text-white font-mono font-bold shadow-lg">
                          {(geom.DA + geom.BC).toFixed(1)}
                        </motion.div>
                      ) : (
                        <motion.div key="right-split" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col w-full gap-1">
                          {/* AD */}
                          <motion.div layout className={`flex w-full h-8 rounded-md overflow-hidden shadow-md transition-all duration-1000 ${step === 2 ? 'order-1' : ''}`}>
                            <motion.div layout style={{ flex: geom.lenA }} className="bg-sky-500 flex items-center justify-center text-sky-950 font-bold text-xs font-mono">A</motion.div>
                            <motion.div layout style={{ flex: geom.lenD }} className="bg-rose-500 flex items-center justify-center text-rose-950 font-bold text-xs font-mono">D</motion.div>
                          </motion.div>
                          <motion.div layout className="text-stone-500 font-bold text-lg text-center order-2">+</motion.div>
                          {/* BC */}
                          <motion.div layout className={`flex w-full h-8 rounded-md overflow-hidden shadow-md transition-all duration-1000 ${step === 2 ? 'order-3' : ''}`}>
                            <motion.div layout style={{ flex: geom.lenB }} className="bg-amber-400 flex items-center justify-center text-amber-950 font-bold text-xs font-mono">B</motion.div>
                            <motion.div layout style={{ flex: geom.lenC }} className="bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold text-xs font-mono">C</motion.div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>

              {/* The "Aha!" Message */}
              <AnimatePresence>
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-t border-stone-800 pt-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-emerald-100/90 font-sans text-xs leading-relaxed">
                        <strong className="text-emerald-400 uppercase tracking-widest">Perfect Equilibrium</strong><br/>
                        Look at the colors in the pans. The left pan has exactly 1 Blue, 1 Yellow, 1 Green, and 1 Red segment. The right pan has exactly the same! The math balances out perfectly regardless of how you distort the shape.
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