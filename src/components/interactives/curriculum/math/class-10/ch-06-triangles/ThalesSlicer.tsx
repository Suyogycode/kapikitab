'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Triangle, RotateCcw, Target, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function ThalesSlicer() {
  // Slider Controls
  const [height, setHeight] = useState<number>(300); // Distance from top vertex
  const [angle, setAngle] = useState<number>(15); // Rotation of the laser (-30 to 30)

  // Fixed Triangle Coordinates (A, B, C)
  const A = { x: 300, y: 100 };
  const B = { x: 100, y: 500 };
  const C = { x: 500, y: 500 };
  const PIXEL_SCALE = 50; // To convert raw pixels into realistic "textbook" units

  // Core Math: Calculate Intersections D and E
  const { D, E, AD, DB, AE, EC, ratio1, ratio2, isParallel } = useMemo(() => {
    // Laser line equation: y - height = m(x - 300)
    const m = Math.tan((angle * Math.PI) / 180);
    
    // Line AB: slope = (500-100)/(100-300) = -2 -> y = -2x + 700
    const xD = (700 + 300 * m - height) / (m + 2);
    const yD = -2 * xD + 700;

    // Line AC: slope = (500-100)/(500-300) = 2 -> y = 2x - 500
    const xE = (500 - 300 * m + height) / (2 - m);
    const yE = 2 * xE - 500;

    // Distance Formula & Scaling
    const calcDist = (p1: {x: number, y: number}, p2: {x: number, y: number}) => 
      Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) / PIXEL_SCALE;

    const distAD = calcDist(A, { x: xD, y: yD });
    const distDB = calcDist({ x: xD, y: yD }, B);
    const distAE = calcDist(A, { x: xE, y: yE });
    const distEC = calcDist({ x: xE, y: yE }, C);

    return {
      D: { x: xD, y: yD },
      E: { x: xE, y: yE },
      AD: distAD,
      DB: distDB,
      AE: distAE,
      EC: distEC,
      ratio1: distAD / distDB,
      ratio2: distAE / distEC,
      isParallel: angle === 0, // Trigger for the "Aha!" moment
    };
  }, [height, angle]);

  const handleReset = () => {
    setHeight(300);
    setAngle(15);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Triangle className="text-emerald-500" /> The Thales Slicer
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Basic Proportionality Theorem: Exploring the ratios of $\triangle ABC$.
          </p>
        </div>
        {angle === 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Laser
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE DRAFTING BOARD) */}
        <div className={`relative w-full lg:w-2/3 border-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
          isParallel ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-[#1c1917] border-stone-800'
        }`}>
          
          <svg viewBox="0 0 600 600" className="w-full max-w-[500px] aspect-square drop-shadow-lg overflow-visible">
            
            {/* The Main Triangle (ABC) */}
            <polygon 
              points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} 
              fill="#292524" 
              stroke="#57534e" 
              strokeWidth="4" 
              strokeLinejoin="round"
            />
            
            {/* Base Highlight (BC) */}
            <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={isParallel ? "#10b981" : "#a8a29e"} strokeWidth="6" strokeLinecap="round" className="transition-colors duration-500" />

            {/* The Laser Slicer Line */}
            <g className="transition-all duration-75">
              {/* Extended glowing laser line */}
              <line 
                x1={D.x - (E.x - D.x) * 0.5} y1={D.y - (E.y - D.y) * 0.5} 
                x2={E.x + (E.x - D.x) * 0.5} y2={E.y + (E.y - D.y) * 0.5} 
                stroke={isParallel ? "#10b981" : "#f43f5e"} 
                strokeWidth={isParallel ? "4" : "2"} 
                strokeDasharray={isParallel ? "none" : "8 4"}
              />
              
              {/* Highlighted Segments (AD, DB, AE, EC) */}
              <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <line x1={D.x} y1={D.y} x2={B.x} y2={B.y} stroke="#818cf8" strokeWidth="6" strokeLinecap="round" />
              
              <line x1={A.x} y1={A.y} x2={E.x} y2={E.y} stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
              <line x1={E.x} y1={E.y} x2={C.x} y2={C.y} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />

              {/* Intersection Dots (D, E) */}
              <circle cx={D.x} cy={D.y} r="8" fill={isParallel ? "#10b981" : "#f43f5e"} className="drop-shadow-md" />
              <circle cx={E.x} cy={E.y} r="8" fill={isParallel ? "#10b981" : "#f43f5e"} className="drop-shadow-md" />
            </g>

            {/* Vertex Labels */}
            <text x={A.x} y={A.y - 15} fill="#e7e5e4" fontSize="24" fontWeight="bold" textAnchor="middle" className="font-serif">A</text>
            <text x={B.x - 20} y={B.y + 15} fill="#e7e5e4" fontSize="24" fontWeight="bold" textAnchor="middle" className="font-serif">B</text>
            <text x={C.x + 20} y={C.y + 15} fill="#e7e5e4" fontSize="24" fontWeight="bold" textAnchor="middle" className="font-serif">C</text>
            
            {/* Intersection Labels */}
            <text x={D.x - 25} y={D.y + 5} fill={isParallel ? "#34d399" : "#fda4af"} fontSize="20" fontWeight="bold" textAnchor="middle" className="font-serif transition-colors">D</text>
            <text x={E.x + 25} y={E.y + 5} fill={isParallel ? "#34d399" : "#fda4af"} fontSize="20" fontWeight="bold" textAnchor="middle" className="font-serif transition-colors">E</text>
            
          </svg>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Laser Controls</span>
              <Scissors size={14} className="text-rose-500" />
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Tilt / Angle Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-rose-400 font-bold">Laser Tilt (Angle)</span>
                  <span className={`px-3 py-1 rounded border font-bold ${isParallel ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-stone-950 border-stone-700 text-white'}`}>
                    {angle}° {isParallel && ' (Parallel)'}
                  </span>
                </div>
                <input 
                  type="range" min="-30" max="30" step="1" value={angle} 
                  onChange={(e) => setAngle(parseInt(e.target.value))} 
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isParallel ? 'accent-emerald-500 bg-emerald-950' : 'accent-rose-500 bg-stone-800'}`} 
                />
              </div>

              {/* Height / Y-Intercept Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-stone-300 font-bold">Cut Height</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700 font-bold">
                    {(400 - height).toFixed(0)} units
                  </span>
                </div>
                <input 
                  type="range" min="150" max="450" step="1" value={height} 
                  onChange={(e) => setHeight(parseInt(e.target.value))} 
                  className="w-full accent-stone-400" 
                />
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Target className={isParallel ? "text-emerald-500" : "text-amber-500"} size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Live Ratios</h3>
            </div>
            
            <div className="p-6 space-y-6 flex flex-col h-full bg-[#1c1917]">
              
              {/* Live Fraction Comparison */}
              <div className="flex items-center justify-between gap-2 px-2">
                
                {/* Ratio 1 (AD / DB) */}
                <div className={`flex-1 border-2 rounded-xl p-3 flex flex-col items-center gap-3 transition-colors duration-500 ${isParallel ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-stone-950 border-stone-800'}`}>
                  <div className="flex flex-col items-center font-mono font-bold text-lg">
                    <span className="text-sky-400 border-b-2 border-stone-700 pb-1 px-4">AD ({AD.toFixed(1)})</span>
                    <span className="text-indigo-400 pt-1 px-4">DB ({DB.toFixed(1)})</span>
                  </div>
                  <div className={`text-2xl font-bold px-4 py-1 rounded-lg ${isParallel ? 'bg-emerald-900/50 text-emerald-400' : 'bg-stone-900 text-white'}`}>
                    {ratio1.toFixed(3)}
                  </div>
                </div>

                {/* The Equality Indicator */}
                <div className="flex flex-col items-center justify-center w-12">
                  <AnimatePresence mode="wait">
                    {isParallel ? (
                      <motion.div key="equal" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500 font-bold text-5xl">=</motion.div>
                    ) : (
                      <motion.div key="unequal" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-stone-600 font-bold text-3xl">≠</motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Ratio 2 (AE / EC) */}
                <div className={`flex-1 border-2 rounded-xl p-3 flex flex-col items-center gap-3 transition-colors duration-500 ${isParallel ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-stone-950 border-stone-800'}`}>
                  <div className="flex flex-col items-center font-mono font-bold text-lg">
                    <span className="text-amber-400 border-b-2 border-stone-700 pb-1 px-4">AE ({AE.toFixed(1)})</span>
                    <span className="text-orange-400 pt-1 px-4">EC ({EC.toFixed(1)})</span>
                  </div>
                  <div className={`text-2xl font-bold px-4 py-1 rounded-lg ${isParallel ? 'bg-emerald-900/50 text-emerald-400' : 'bg-stone-900 text-white'}`}>
                    {ratio2.toFixed(3)}
                  </div>
                </div>

              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {isParallel ? (
                    <motion.div key="aha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-emerald-100/90 font-sans text-xs leading-relaxed">
                        <strong className="text-emerald-400 uppercase tracking-widest">Thales' Theorem Unlocked!</strong><br/>
                        You perfectly aligned the laser parallel to the base ($BC$). Notice how the fractions snapped together? <br/><br/>
                        When $DE \parallel BC$, the laser slices the sides in the exact same proportion: <strong className="text-emerald-400 font-mono text-sm pl-1">AD/DB = AE/EC</strong>. Drag the height slider up and down—the ratios will change, but they will always remain equal to each other!
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-stone-300 font-sans text-xs leading-relaxed">
                        The fractions are chaotic and mismatched. <br/><br/>
                        <strong className="text-amber-400 uppercase tracking-widest">Your Challenge:</strong><br/>
                        Adjust the <strong className="text-rose-400">Laser Tilt</strong> slider to make the two floating fractions perfectly equal. Watch what happens to the physical line when you do!
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