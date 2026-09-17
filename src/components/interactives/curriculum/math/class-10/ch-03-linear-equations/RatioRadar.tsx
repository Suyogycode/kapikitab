'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RotateCcw, Crosshair, AlertCircle, Layers } from 'lucide-react';

export default function RatioRadar() {
  // Equation 1: a1*x + b1*y + c1 = 0 (Blue Line)
  const [a1, setA1] = useState<number>(1);
  const [b1, setB1] = useState<number>(-2);
  const [c1, setC1] = useState<number>(0);

  // Equation 2: a2*x + b2*y + c2 = 0 (Red Line)
  const [a2, setA2] = useState<number>(3);
  const [b2, setB2] = useState<number>(4);
  const [c2, setC2] = useState<number>(-20);

  // SVG Coordinate Mapping
  const GRAPH_SIZE = 600;
  const MATH_RANGE = 10;
  const SCALE = GRAPH_SIZE / (MATH_RANGE * 2);

  const mapX = (x: number) => (x + MATH_RANGE) * SCALE;
  const mapY = (y: number) => GRAPH_SIZE - (y + MATH_RANGE) * SCALE;

  // Helper to generate line coordinates across the entire graph
  const getLinePoints = (a: number, b: number, c: number) => {
    // If it's a vertical line (b = 0)
    if (b === 0) {
      const x = a === 0 ? 0 : -c / a;
      return { x1: x, y1: -MATH_RANGE, x2: x, y2: MATH_RANGE };
    }
    // Standard sloped line
    const y1 = (-a * -MATH_RANGE - c) / b;
    const y2 = (-a * MATH_RANGE - c) / b;
    return { x1: -MATH_RANGE, y1, x2: MATH_RANGE, y2 };
  };

  const line1 = getLinePoints(a1, b1, c1);
  const line2 = getLinePoints(a2, b2, c2);

  // Cross-multiplication checks to avoid Division by Zero errors
  const isA1B1Equal = Math.abs(a1 * b2 - a2 * b1) < 0.001;
  const isB1C1Equal = Math.abs(b1 * c2 - b2 * c1) < 0.001;
  const isA1C1Equal = Math.abs(a1 * c2 - a2 * c1) < 0.001;

  // Determine State
  let systemState: 'intersecting' | 'parallel' | 'coincident' = 'intersecting';
  if (isA1B1Equal) {
    if (isB1C1Equal && isA1C1Equal) {
      systemState = 'coincident';
    } else {
      systemState = 'parallel';
    }
  }

  // Calculate Intersection Point (Cramer's Rule)
  const intersectionPoint = useMemo(() => {
    if (systemState !== 'intersecting') return null;
    const determinant = a1 * b2 - a2 * b1;
    const x = (b1 * c2 - b2 * c1) / determinant;
    const y = (c1 * a2 - c2 * a1) / determinant;
    return { x, y };
  }, [a1, b1, c1, a2, b2, c2, systemState]);

  // Format ratio display safely
  const formatRatio = (num: number, den: number) => {
    if (den === 0) return '∞';
    return (num / den).toFixed(2);
  };

  const handleReset = () => {
    setA1(1); setB1(-2); setC1(0);
    setA2(3); setB2(4); setC2(-20);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Radar className="text-purple-500" /> The Ratio Radar
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Graphical Method & Consistency in Linear Equations.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Radar
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG GRAPH) */}
        <div className={`relative w-full max-w-[600px] aspect-square border-2 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center transition-colors duration-500 ${
          systemState === 'coincident' ? 'bg-purple-950/20 border-purple-900/50' :
          systemState === 'parallel' ? 'bg-amber-950/20 border-amber-900/50' :
          'bg-[#1c1917] border-stone-800'
        }`}>
          
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
            <line x1={GRAPH_SIZE / 2} y1="0" x2={GRAPH_SIZE / 2} y2={GRAPH_SIZE} stroke="#57534e" strokeWidth="2" />
            <line x1="0" y1={GRAPH_SIZE / 2} x2={GRAPH_SIZE} y2={GRAPH_SIZE / 2} stroke="#57534e" strokeWidth="2" />

            {/* Line 1 (Blue) */}
            <line 
              x1={mapX(line1.x1)} y1={mapY(line1.y1)} 
              x2={mapX(line1.x2)} y2={mapY(line1.y2)} 
              stroke="#38bdf8" 
              strokeWidth={systemState === 'coincident' ? "8" : "3"} 
              strokeLinecap="round"
              className="transition-all duration-300"
              opacity={systemState === 'coincident' ? 0.3 : 1}
            />

            {/* Line 2 (Red) */}
            <line 
              x1={mapX(line2.x1)} y1={mapY(line2.y1)} 
              x2={mapX(line2.x2)} y2={mapY(line2.y2)} 
              stroke="#f43f5e" 
              strokeWidth={systemState === 'coincident' ? "4" : "3"} 
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Intersection Point */}
            <AnimatePresence>
              {systemState === 'intersecting' && intersectionPoint && (
                <motion.g 
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                >
                  <circle cx={mapX(intersectionPoint.x)} cy={mapY(intersectionPoint.y)} r="12" fill="#10b981" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  <circle cx={mapX(intersectionPoint.x)} cy={mapY(intersectionPoint.y)} r="5" fill="#ffffff" />
                  <text 
                    x={mapX(intersectionPoint.x)} 
                    y={mapY(intersectionPoint.y) - 20} 
                    fill="#34d399" 
                    fontSize="16" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className="font-mono bg-stone-900"
                  >
                    ({intersectionPoint.x.toFixed(1)}, {intersectionPoint.y.toFixed(1)})
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Slider Dashboard */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            
            {/* Equation 1 Controls */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/50 pb-2">
                <span>Equation 1</span>
                <span className="font-mono">{a1}x + {b1}y + {c1} = 0</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-stone-500 font-mono text-xs">a₁</span>
                  <input type="range" min="-10" max="10" step="1" value={a1} onChange={(e) => setA1(parseFloat(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-stone-500 font-mono text-xs">b₁</span>
                  <input type="range" min="-10" max="10" step="1" value={b1} onChange={(e) => setB1(parseFloat(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-stone-500 font-mono text-xs">c₁</span>
                  <input type="range" min="-20" max="20" step="1" value={c1} onChange={(e) => setC1(parseFloat(e.target.value))} className="w-full accent-sky-500" />
                </div>
              </div>
            </div>

            {/* Equation 2 Controls */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-rose-900/50 pb-2">
                <span>Equation 2</span>
                <span className="font-mono">{a2}x + {b2}y + {c2} = 0</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-stone-500 font-mono text-xs">a₂</span>
                  <input type="range" min="-10" max="10" step="1" value={a2} onChange={(e) => setA2(parseFloat(e.target.value))} className="w-full accent-rose-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-stone-500 font-mono text-xs">b₂</span>
                  <input type="range" min="-10" max="10" step="1" value={b2} onChange={(e) => setB2(parseFloat(e.target.value))} className="w-full accent-rose-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-stone-500 font-mono text-xs">c₂</span>
                  <input type="range" min="-20" max="20" step="1" value={c2} onChange={(e) => setC2(parseFloat(e.target.value))} className="w-full accent-rose-500" />
                </div>
              </div>
            </div>

          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Crosshair className="text-purple-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Ratio Radar</h3>
            </div>
            
            <div className="p-6 space-y-6 flex flex-col h-full">
              
              {/* Ratio Gauges */}
              <div className="flex items-center justify-between gap-2">
                
                {/* a1/a2 */}
                <div className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-3 flex flex-col items-center gap-2">
                  <div className="flex flex-col items-center text-sm font-bold text-stone-300 font-mono">
                    <span className="border-b border-stone-600 pb-1">{a1}</span>
                    <span className="pt-1">{a2}</span>
                  </div>
                  <div className="text-xs text-stone-500">a₁/a₂</div>
                  <div className="text-lg font-bold text-white">{formatRatio(a1, a2)}</div>
                </div>

                <div className="font-bold text-stone-500">{isA1B1Equal ? '=' : '≠'}</div>

                {/* b1/b2 */}
                <div className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-3 flex flex-col items-center gap-2">
                  <div className="flex flex-col items-center text-sm font-bold text-stone-300 font-mono">
                    <span className="border-b border-stone-600 pb-1">{b1}</span>
                    <span className="pt-1">{b2}</span>
                  </div>
                  <div className="text-xs text-stone-500">b₁/b₂</div>
                  <div className="text-lg font-bold text-white">{formatRatio(b1, b2)}</div>
                </div>

                <div className="font-bold text-stone-500">{isB1C1Equal ? '=' : '≠'}</div>

                {/* c1/c2 */}
                <div className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-3 flex flex-col items-center gap-2">
                  <div className="flex flex-col items-center text-sm font-bold text-stone-300 font-mono">
                    <span className="border-b border-stone-600 pb-1">{c1}</span>
                    <span className="pt-1">{c2}</span>
                  </div>
                  <div className="text-xs text-stone-500">c₁/c₂</div>
                  <div className="text-lg font-bold text-white">{formatRatio(c1, c2)}</div>
                </div>

              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {systemState === 'intersecting' && (
                    <motion.div key="intersect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3">
                      <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Unique Solution (Consistent)</h4>
                        <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                          Because <strong>a₁/a₂ ≠ b₁/b₂</strong>, the two lines intersect at exactly one point. There is only one specific (x, y) pair that satisfies both equations simultaneously.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {systemState === 'parallel' && (
                    <motion.div key="parallel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl flex items-start gap-3">
                      <Layers className="text-amber-500 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">No Solution (Inconsistent)</h4>
                        <p className="text-amber-100/80 font-sans text-xs leading-relaxed">
                          Because <strong>a₁/a₂ = b₁/b₂</strong> but they do not equal <strong>c₁/c₂</strong>, the lines have the exact same slope but different intercepts. They run perfectly parallel and will <em>never</em> intersect.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {systemState === 'coincident' && (
                    <motion.div key="coincident" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-purple-950/30 border border-purple-900/50 p-4 rounded-xl flex items-start gap-3">
                      <Radar className="text-purple-500 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-1">Infinitely Many (Coincident)</h4>
                        <p className="text-purple-100/80 font-sans text-xs leading-relaxed">
                          Because <strong>a₁/a₂ = b₁/b₂ = c₁/c₂</strong>, the equations are practically identical (just scaled). The red line completely swallows the blue line. Every point on the line is a valid solution!
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
    </div>
  );
}