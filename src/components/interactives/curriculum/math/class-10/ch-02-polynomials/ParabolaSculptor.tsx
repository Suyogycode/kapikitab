'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Crosshair, Sparkles, RotateCcw } from 'lucide-react';

export default function ParabolaSculptor() {
  // Coefficients
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(0);
  const [c, setC] = useState<number>(-4);

  // SVG Coordinate Mapping
  const GRAPH_SIZE = 600;
  const MATH_RANGE = 10; // -10 to 10 on both axes
  const SCALE = GRAPH_SIZE / (MATH_RANGE * 2);

  const mapX = (x: number) => (x + MATH_RANGE) * SCALE;
  const mapY = (y: number) => GRAPH_SIZE - (y + MATH_RANGE) * SCALE;

  // Mathematical Calculations
  const discriminant = b * b - 4 * a * c;
  
  const zeroes = useMemo(() => {
    if (a === 0) return []; // Fallback to avoid division by zero, though UI prevents a=0
    if (discriminant > 0) {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      return [x1, x2].sort((a, b) => a - b);
    }
    if (discriminant === 0) {
      return [-b / (2 * a)];
    }
    return []; // discriminant < 0
  }, [a, b, c, discriminant]);

  // Generate SVG Path for Parabola
  const parabolaPath = useMemo(() => {
    let path = '';
    // Step size for drawing the curve smoothly
    const step = 0.5;
    for (let x = -MATH_RANGE; x <= MATH_RANGE; x += step) {
      const y = a * x * x + b * x + c;
      const px = mapX(x);
      const py = mapY(y);
      if (x === -MATH_RANGE) {
        path += `M ${px} ${py} `;
      } else {
        path += `L ${px} ${py} `;
      }
    }
    return path;
  }, [a, b, c]);

  const handleReset = () => {
    setA(1);
    setB(0);
    setC(-4);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Activity className="text-rose-500" /> The Parabola Sculptor
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the geometrical meaning of quadratic zeroes.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Curve
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (SVG GRAPH) */}
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

            {/* Y-Axis */}
            <line x1={GRAPH_SIZE / 2} y1="0" x2={GRAPH_SIZE / 2} y2={GRAPH_SIZE} stroke="#57534e" strokeWidth="2" />
            
            {/* The X-Axis Laser Tripwire */}
            <line 
              x1="0" y1={GRAPH_SIZE / 2} 
              x2={GRAPH_SIZE} y2={GRAPH_SIZE / 2} 
              stroke={zeroes.length > 0 ? "#f43f5e" : "#57534e"} 
              strokeWidth={zeroes.length > 0 ? "4" : "2"}
              className="transition-all duration-300"
            />
            {zeroes.length > 0 && (
               <line 
                x1="0" y1={GRAPH_SIZE / 2} 
                x2={GRAPH_SIZE} y2={GRAPH_SIZE / 2} 
                stroke="#f43f5e" 
                strokeWidth="12"
                opacity="0.2"
              />
            )}

            {/* The Parabola Curve */}
            <path 
              d={parabolaPath} 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="4" 
              strokeLinecap="round" 
              className="transition-all duration-75"
            />

            {/* The Zeroes (Glowing Orbs) */}
            <AnimatePresence>
              {zeroes.map((z, index) => (
                <motion.g 
                  key={`${z}-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <circle cx={mapX(z)} cy={GRAPH_SIZE / 2} r="12" fill="#f43f5e" className="drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                  <circle cx={mapX(z)} cy={GRAPH_SIZE / 2} r="6" fill="#ffffff" />
                  <text 
                    x={mapX(z)} 
                    y={GRAPH_SIZE / 2 - 20} 
                    fill="#fda4af" 
                    fontSize="16" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {z.toFixed(1)}
                  </text>
                </motion.g>
              ))}
            </AnimatePresence>
            
          </svg>

        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Sliders Control Panel */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Coefficients</span>
              <span className="text-sky-400 font-mono tracking-normal">y = ax² + bx + c</span>
            </div>
            
            {/* Slider a */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-sky-400 font-bold">a (Shape/Invert)</span>
                <span className="text-white bg-stone-950 px-2 rounded border border-stone-700">{a.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-5" max="5" step="0.1" value={a} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setA(val === 0 ? 0.1 : val); // Prevent absolute zero to maintain quadratic shape
                }}
                className="w-full accent-sky-500" 
              />
            </div>

            {/* Slider b */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-emerald-400 font-bold">b (Horizontal Shift)</span>
                <span className="text-white bg-stone-950 px-2 rounded border border-stone-700">{b.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-10" max="10" step="0.5" value={b} 
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full accent-emerald-500" 
              />
            </div>

            {/* Slider c */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-amber-400 font-bold">c (Vertical Shift)</span>
                <span className="text-white bg-stone-950 px-2 rounded border border-stone-700">{c.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-10" max="10" step="0.5" value={c} 
                onChange={(e) => setC(parseFloat(e.target.value))}
                className="w-full accent-amber-500" 
              />
            </div>
          </div>

          {/* Mathematical HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Crosshair className="text-rose-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Zeroes Engine</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              {/* Dynamic Equation */}
              <div className="flex flex-col gap-2">
                <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Current Polynomial</span>
                <div className="text-lg text-white font-bold bg-stone-950 p-3 rounded-lg border border-stone-800 text-center">
                  y = <span className="text-sky-400">{a}</span>x² 
                  {b >= 0 ? ' + ' : ' - '}<span className="text-emerald-400">{Math.abs(b)}</span>x 
                  {c >= 0 ? ' + ' : ' - '}<span className="text-amber-400">{Math.abs(c)}</span>
                </div>
              </div>

              {/* Zeroes Counter */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-500 ${
                zeroes.length === 2 ? 'bg-rose-950/30 border-rose-900/50' :
                zeroes.length === 1 ? 'bg-amber-950/30 border-amber-900/50' :
                'bg-stone-950 border-stone-800'
              }`}>
                <div className="flex flex-col gap-1">
                  <span className="text-stone-400 text-xs font-sans uppercase tracking-widest font-bold">Number of Zeroes</span>
                  <span className="text-2xl font-bold text-white">{zeroes.length}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-stone-500 text-xs font-sans uppercase tracking-widest font-bold">Discriminant (Δ)</span>
                  <span className={`font-bold ${discriminant > 0 ? 'text-rose-400' : discriminant === 0 ? 'text-amber-400' : 'text-stone-500'}`}>
                    {discriminant > 0 ? '> 0' : discriminant === 0 ? '= 0' : '< 0'}
                  </span>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {zeroes.length === 2 ? (
                    <motion.div key="two" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Sparkles className="text-rose-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-rose-200/80 font-sans text-xs leading-relaxed">
                        <strong className="text-rose-400 uppercase tracking-widest">Two Distinct Zeroes</strong><br/>
                        The parabola cuts through the x-axis tripwire in two places. Notice how dragging the <strong>c</strong> slider down moves the curve deeper, spreading the zeroes apart!
                      </p>
                    </motion.div>
                  ) : zeroes.length === 1 ? (
                    <motion.div key="one" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-amber-200/80 font-sans text-xs leading-relaxed">
                        <strong className="text-amber-400 uppercase tracking-widest">One Coincident Zero</strong><br/>
                        The two roots have merged perfectly together! The vertex of the parabola is kissing the x-axis. 
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="zero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Sparkles className="text-stone-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-stone-400 font-sans text-xs leading-relaxed">
                        <strong className="text-stone-300 uppercase tracking-widest">No Real Zeroes</strong><br/>
                        The parabola is floating entirely above or below the x-axis. The mathematical roots still exist, but they are "imaginary" numbers outside the real 2D plane.
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