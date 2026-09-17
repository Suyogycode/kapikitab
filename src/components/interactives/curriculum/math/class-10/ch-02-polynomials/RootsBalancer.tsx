'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, MoveHorizontal, Lightbulb, Calculator, RotateCcw } from 'lucide-react';

export default function RootsBalancer() {
  // We start with the zeroes (roots) instead of the coefficients
  const [alpha, setAlpha] = useState<number>(-3);
  const [beta, setBeta] = useState<number>(2);

  // Math Setup: Building the polynomial in reverse
  // If roots are α and β, equation is (x - α)(x - β) = 0
  // x² - (α + β)x + αβ = 0
  // Therefore: a = 1, b = -(α + β), c = αβ
  const a = 1;
  const b = -(alpha + beta);
  const c = alpha * beta;

  // Sum and Product values for the scales
  const sumOfRoots = alpha + beta;
  const productOfRoots = alpha * beta;

  // SVG Mapping
  const GRAPH_SIZE = 600;
  const MATH_RANGE = 10;
  const SCALE = GRAPH_SIZE / (MATH_RANGE * 2);

  const mapX = (x: number) => (x + MATH_RANGE) * SCALE;
  const mapY = (y: number) => GRAPH_SIZE - (y + MATH_RANGE) * SCALE;

  // Generate smooth SVG Path
  const parabolaPath = useMemo(() => {
    let path = '';
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
    setAlpha(-3);
    setBeta(2);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Scale className="text-emerald-500" /> The Roots Balancer
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Reverse-engineering polynomials from their zeroes.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Roots
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE */}
        <div className="relative w-full max-w-[600px] flex flex-col gap-6">
          
          {/* THE GRAPH */}
          <div className="relative w-full aspect-square bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
            
            {/* Auto-Generated Equation Overlay */}
            <div className="absolute top-4 bg-stone-900/80 backdrop-blur-sm border border-stone-700 px-6 py-3 rounded-xl shadow-xl z-20 flex items-center gap-3">
              <Calculator className="text-stone-400" size={16} />
              <div className="text-xl font-bold text-white font-mono flex items-center gap-2">
                <span>x²</span>
                <span className={b >= 0 ? "text-emerald-400" : "text-emerald-400"}>
                  {b === 0 ? '' : b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`}
                </span>
                <span className={c >= 0 ? "text-sky-400" : "text-sky-400"}>
                  {c === 0 ? '' : c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
                </span>
              </div>
            </div>

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

              {/* The Parabola Curve */}
              <path 
                d={parabolaPath} 
                fill="none" 
                stroke="#a8a29e" 
                strokeWidth="4" 
                strokeLinecap="round" 
                className="transition-all duration-300"
              />

              {/* Glowing Roots (Alpha & Beta) */}
              <circle cx={mapX(alpha)} cy={GRAPH_SIZE / 2} r="14" fill="#10b981" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-300" />
              <text x={mapX(alpha)} y={GRAPH_SIZE / 2 + 30} fill="#34d399" fontSize="20" fontWeight="bold" textAnchor="middle" className="font-serif transition-all duration-300">α</text>

              <circle cx={mapX(beta)} cy={GRAPH_SIZE / 2} r="14" fill="#0ea5e9" className="drop-shadow-[0_0_15px_rgba(14,165,233,0.8)] transition-all duration-300" />
              <text x={mapX(beta)} y={GRAPH_SIZE / 2 + 30} fill="#38bdf8" fontSize="20" fontWeight="bold" textAnchor="middle" className="font-serif transition-all duration-300">β</text>
            </svg>
          </div>

          {/* DRAGGABLE ROOT CONTROLS */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Position Roots on X-Axis</span>
              <MoveHorizontal size={14} />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-emerald-400 font-bold text-lg">Root α (Alpha)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700 font-bold">{alpha}</span>
                </div>
                <input type="range" min="-8" max="8" step="1" value={alpha} onChange={(e) => setAlpha(parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-sky-400 font-bold text-lg">Root β (Beta)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700 font-bold">{beta}</span>
                </div>
                <input type="range" min="-8" max="8" step="1" value={beta} onChange={(e) => setBeta(parseInt(e.target.value))} className="w-full accent-sky-500" />
              </div>
            </div>
          </div>

        </div>

        {/* MECHANICAL SCALES & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Scale className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Mechanical Scales</h3>
            </div>
            
            <div className="p-6 space-y-8 flex flex-col h-full bg-[#1c1917]">
              
              {/* SCALE 1: Sum of Roots */}
              <div className="flex flex-col gap-4">
                <div className="text-center font-bold text-emerald-400 uppercase tracking-widest text-xs mb-2">Sum Balance</div>
                <div className="flex items-center justify-between bg-stone-900 p-4 rounded-xl border-b-4 border-emerald-600 shadow-[0_4px_20px_rgba(5,150,105,0.2)]">
                  
                  {/* Left Pan (Alpha + Beta) */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="flex items-center gap-1 text-xl font-bold font-serif">
                      <span className="text-emerald-400">α</span>
                      <span className="text-stone-500">+</span>
                      <span className="text-sky-400">β</span>
                    </div>
                    <div className="bg-stone-950 border border-stone-800 px-3 py-1 rounded font-mono text-white text-sm">
                      {alpha} + {beta}
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">{sumOfRoots}</div>
                  </div>

                  {/* Pivot */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-1 h-12 bg-stone-700 rounded-full"></div>
                    <div className="w-4 h-4 rotate-45 bg-emerald-500 -mt-2"></div>
                  </div>

                  {/* Right Pan (-b/a) */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="flex flex-col items-center text-lg font-bold text-amber-400 font-mono">
                      <span className="border-b-2 border-amber-400/50 pb-1">-b</span>
                      <span className="pt-1">a</span>
                    </div>
                    <div className="flex flex-col items-center bg-stone-950 border border-stone-800 px-3 py-1 rounded font-mono text-white text-xs">
                      <span className="border-b border-stone-700 pb-0.5">-({b})</span>
                      <span className="pt-0.5">1</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">{-b / a}</div>
                  </div>

                </div>
              </div>

              {/* SCALE 2: Product of Roots */}
              <div className="flex flex-col gap-4">
                <div className="text-center font-bold text-sky-400 uppercase tracking-widest text-xs mb-2">Product Balance</div>
                <div className="flex items-center justify-between bg-stone-900 p-4 rounded-xl border-b-4 border-sky-600 shadow-[0_4px_20px_rgba(2,132,199,0.2)]">
                  
                  {/* Left Pan (Alpha * Beta) */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="flex items-center gap-1 text-xl font-bold font-serif">
                      <span className="text-emerald-400">α</span>
                      <span className="text-stone-500">×</span>
                      <span className="text-sky-400">β</span>
                    </div>
                    <div className="bg-stone-950 border border-stone-800 px-3 py-1 rounded font-mono text-white text-sm">
                      ({alpha})({beta})
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">{productOfRoots}</div>
                  </div>

                  {/* Pivot */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-1 h-12 bg-stone-700 rounded-full"></div>
                    <div className="w-4 h-4 rotate-45 bg-sky-500 -mt-2"></div>
                  </div>

                  {/* Right Pan (c/a) */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="flex flex-col items-center text-lg font-bold text-amber-400 font-mono">
                      <span className="border-b-2 border-amber-400/50 pb-1">c</span>
                      <span className="pt-1">a</span>
                    </div>
                    <div className="flex flex-col items-center bg-stone-950 border border-stone-800 px-3 py-1 rounded font-mono text-white text-xs">
                      <span className="border-b border-stone-700 pb-0.5">{c}</span>
                      <span className="pt-0.5">1</span>
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">{c / a}</div>
                  </div>

                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                    <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-stone-300 font-sans text-xs leading-relaxed">
                      Notice that no matter where you drag the roots, the mechanical scales <strong className="text-white">never tip</strong>! <br/><br/>
                      The coefficients of a polynomial (<strong className="text-emerald-400 font-mono">b</strong> and <strong className="text-sky-400 font-mono">c</strong>) are not just random numbers; they are mathematically locked to the sum and product of exactly where the curve crosses the x-axis.
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}