'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Snowflake, AlertTriangle, Target, Compass, RotateCcw } from 'lucide-react';

export default function BoundaryPoleParadox() {
  // Target Difference (d = AP - BP)
  const [targetD, setTargetD] = useState<number>(0);

  // Mathematical Constants based on the textbook problem
  // Diameter = 13m. Equation: x^2 + dx + (d^2 - 169)/2 = 0
  const a = 1;
  const b = targetD;
  const c = (Math.pow(targetD, 2) - 169) / 2;
  
  // Discriminant: 338 - d^2
  const discriminant = 338 - Math.pow(targetD, 2);
  const hasRealRoots = discriminant >= 0;

  // Calculate coordinates if real
  let bp = 0;
  let ap = 0;
  let theta = 0;

  if (hasRealRoots) {
    bp = (-targetD + Math.sqrt(discriminant)) / 2;
    ap = bp + targetD;
    // theta is the angle at Gate A. BP = 13 * sin(theta)
    theta = Math.asin(bp / 13);
  }

  // SVG Mapping
  const SVG_SIZE = 600;
  const CENTER_X = SVG_SIZE / 2;
  const CENTER_Y = SVG_SIZE / 2 - 50;
  const RADIUS = 180; // 180px represents 6.5m

  // Gate Coordinates
  const gateA = { x: CENTER_X - RADIUS, y: CENTER_Y };
  const gateB = { x: CENTER_X + RADIUS, y: CENTER_Y };

  // Pole Coordinates (Using double angle theorem for center coordinates)
  const pole = hasRealRoots 
    ? { 
        x: CENTER_X + RADIUS * Math.cos(2 * theta), 
        y: CENTER_Y - RADIUS * Math.sin(2 * theta) 
      }
    : { x: CENTER_X, y: CENTER_Y - RADIUS - 50 }; // Broken state position

  const setChallenge = (d: number) => setTargetD(d);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Compass className="text-amber-500" /> The Boundary Pole Paradox
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the Nature of Roots and the Discriminant ($b^2 - 4ac$).
          </p>
        </div>
        <button 
          onClick={() => setTargetD(0)}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Park
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE PARK) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6">
          
          {/* Park Diagram */}
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[500px] aspect-square drop-shadow-lg">
            
            {/* The Park Boundary */}
            <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="#064e3b" fillOpacity="0.2" stroke="#10b981" strokeWidth="4" strokeDasharray="8 4" />
            
            {/* Diameter Line */}
            <line x1={gateA.x} y1={gateA.y} x2={gateB.x} y2={gateB.y} stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" />
            <text x={CENTER_X} y={CENTER_Y + 20} fill="#71717a" fontSize="14" textAnchor="middle" className="font-mono font-bold">13m (Diameter)</text>

            {/* Gates */}
            <rect x={gateA.x - 10} y={gateA.y - 10} width="20" height="20" fill="#f59e0b" rx="4" />
            <text x={gateA.x - 25} y={gateA.y + 5} fill="#fbbf24" fontSize="16" fontWeight="bold">A</text>
            
            <rect x={gateB.x - 10} y={gateB.y - 10} width="20" height="20" fill="#f59e0b" rx="4" />
            <text x={gateB.x + 25} y={gateB.y + 5} fill="#fbbf24" fontSize="16" fontWeight="bold">B</text>

            <AnimatePresence>
              {hasRealRoots && targetD > 0 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Distance Lines */}
                  <line x1={gateA.x} y1={gateA.y} x2={pole.x} y2={pole.y} stroke="#38bdf8" strokeWidth="3" />
                  <text x={(gateA.x + pole.x)/2 - 15} y={(gateA.y + pole.y)/2 - 10} fill="#7dd3fc" fontSize="16" fontWeight="bold" className="font-mono bg-stone-900">{ap.toFixed(1)}m</text>

                  <line x1={gateB.x} y1={gateB.y} x2={pole.x} y2={pole.y} stroke="#f43f5e" strokeWidth="3" />
                  <text x={(gateB.x + pole.x)/2 + 15} y={(gateB.y + pole.y)/2 - 10} fill="#fb7185" fontSize="16" fontWeight="bold" className="font-mono bg-stone-900">{bp.toFixed(1)}m</text>
                  
                  {/* The Right Angle Square */}
                  <path d={`M ${pole.x} ${pole.y} L ${pole.x - 10*Math.sin(2*theta)} ${pole.y - 10*Math.cos(2*theta)} L ${pole.x - 10*Math.sin(2*theta) + 10*Math.cos(2*theta)} ${pole.y - 10*Math.cos(2*theta) - 10*Math.sin(2*theta)} L ${pole.x + 10*Math.cos(2*theta)} ${pole.y - 10*Math.sin(2*theta)} Z`} fill="none" stroke="#a8a29e" strokeWidth="2" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* The Pole */}
            <motion.circle 
              animate={{ cx: pole.x, cy: pole.y }}
              transition={{ type: "spring", bounce: 0.4 }}
              r="8" 
              fill={hasRealRoots ? "#ffffff" : "#ef4444"} 
              className={hasRealRoots ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : ""} 
            />
            <motion.text 
              animate={{ x: pole.x, y: pole.y - 15 }}
              fill={hasRealRoots ? "#ffffff" : "#ef4444"} 
              fontSize="16" 
              fontWeight="bold" 
              textAnchor="middle"
            >
              P
            </motion.text>
          </svg>

          {/* Impossible State Overlay */}
          <AnimatePresence>
            {!hasRealRoots && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-sky-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4"
              >
                <Snowflake size={64} className="text-sky-400 animate-[spin_10s_linear_infinite]" />
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Reality Broken</h2>
                <p className="text-sky-200 text-center max-w-md">
                  A difference of {targetD}m is physically impossible inside a 13m circle. The mathematical triangle collapses!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Slider Dashboard */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Target Difference (AP - BP)</span>
              <Target size={14} className="text-rose-500" />
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between font-mono text-xl items-center">
                <span className="text-white font-bold">d =</span>
                <span className={`px-4 py-2 rounded-lg border font-bold ${hasRealRoots ? 'bg-stone-950 border-stone-700 text-emerald-400' : 'bg-sky-950 border-sky-800 text-sky-400'}`}>
                  {targetD} m
                </span>
              </div>
              
              <input 
                type="range" min="0" max="19" step="1" value={targetD} 
                onChange={(e) => setTargetD(parseInt(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${hasRealRoots ? 'accent-emerald-500 bg-stone-800' : 'accent-sky-400 bg-sky-900/50'}`} 
              />
              
              <div className="flex justify-between gap-2 mt-2">
                <button onClick={() => setChallenge(7)} className="flex-1 py-2 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-900 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">
                  Challenge: 7m
                </button>
                <button onClick={() => setChallenge(19)} className="flex-1 py-2 bg-sky-950/30 hover:bg-sky-900/50 border border-sky-900 text-sky-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">
                  Challenge: 19m
                </button>
              </div>
            </div>
          </div>

          {/* The Discriminant Furnace HUD */}
          <div className={`backdrop-blur-md border rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1 transition-colors duration-500 ${
            targetD === 0 ? 'bg-stone-900/90 border-stone-800' : 
            hasRealRoots ? 'bg-orange-950/20 border-orange-900/50' : 'bg-sky-950/40 border-sky-900/50'
          }`}>
            <div className={`p-4 border-b flex items-center gap-3 transition-colors ${
              targetD === 0 ? 'bg-stone-950 border-stone-800' :
              hasRealRoots ? 'bg-orange-950 border-orange-900/50' : 'bg-sky-950 border-sky-900/50'
            }`}>
              {targetD === 0 ? <Flame className="text-stone-600" size={18} /> : hasRealRoots ? <Flame className="text-orange-500 animate-pulse" size={18} /> : <Snowflake className="text-sky-400" size={18} />}
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Discriminant Furnace</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              <div className="flex flex-col gap-2">
                <span className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Quadratic Equation Formed</span>
                <div className="text-lg text-white font-bold bg-stone-950/50 p-3 rounded-lg border border-stone-800/50 text-center flex flex-wrap justify-center gap-2">
                  <span>x²</span>
                  <span className="text-sky-400">+ {b}x</span>
                  <span className={c >= 0 ? "text-amber-400" : "text-rose-400"}>
                    {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
                  </span>
                  <span>= 0</span>
                </div>
              </div>

              {/* The Live Discriminant Calculation */}
              <div className="flex flex-col gap-2">
                <span className="text-stone-400 text-[10px] uppercase tracking-widest font-bold mb-1">Δ = b² - 4ac</span>
                <div className="flex justify-between items-center text-stone-300">
                  <span>({b})² - 4(1)({c})</span>
                  <span>=</span>
                </div>
                <div className="flex justify-between items-center text-stone-300">
                  <span>{Math.pow(b, 2)} - ({4 * 1 * c})</span>
                  <span>=</span>
                </div>
                <div className={`text-right text-4xl font-bold mt-2 ${
                  targetD === 0 ? 'text-stone-500' : hasRealRoots ? 'text-orange-400' : 'text-sky-400'
                }`}>
                  {discriminant}
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800/50">
                <AnimatePresence mode="wait">
                  {targetD === 7 ? (
                    <motion.div key="seven" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Flame className="text-orange-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-orange-200/80 font-sans text-xs leading-relaxed">
                        <strong className="text-orange-400 uppercase tracking-widest">Real Roots Exist!</strong><br/>
                        Because <strong>{discriminant} &gt; 0</strong>, the furnace burns hot. This proves the quadratic equation has real solutions, meaning there are actual, physical locations on the park boundary to place the pole[cite: 7].
                      </p>
                    </motion.div>
                  ) : targetD === 19 ? (
                    <motion.div key="nineteen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Snowflake className="text-sky-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-sky-200/80 font-sans text-xs leading-relaxed">
                        <strong className="text-sky-400 uppercase tracking-widest">No Real Roots!</strong><br/>
                        Because <strong>{discriminant} &lt; 0</strong>, the furnace freezes solid. The distance formula breaks down into imaginary numbers, physically proving that no such pole can exist[cite: 7].
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="default" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <AlertTriangle className="text-stone-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-stone-400 font-sans text-xs leading-relaxed">
                        <strong className="text-stone-300 uppercase tracking-widest">Test the Boundaries</strong><br/>
                        Use the challenge buttons above. Watch how the discriminant ($b^2 - 4ac$) acts as the ultimate reality check for whether a physical shape can actually exist.
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