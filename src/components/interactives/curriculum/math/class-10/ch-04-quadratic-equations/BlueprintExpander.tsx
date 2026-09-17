'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Maximize, Lock, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export default function BlueprintExpander() {
  // Core State
  const [x, setX] = useState<number>(5); // Breadth
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Derived Values
  const length = 2 * x + 1;
  const area = x * length;
  const targetArea = 300;

  // Check for the "Aha!" moment
  useEffect(() => {
    if (area === targetArea && !isLocked) {
      setIsLocked(true);
    }
  }, [area, isLocked]);

  const handleReset = () => {
    setIsLocked(false);
    setX(5);
  };

  // Visual Scaling for the Blueprint
  const MAX_X = 20; // Allows going past the answer (12) to show the curve
  const MAX_LENGTH = 2 * MAX_X + 1;
  const CONTAINER_SIZE = 500;
  
  // Calculate pixel dimensions for the SVG rectangle
  const pxWidth = (length / MAX_LENGTH) * (CONTAINER_SIZE * 0.9);
  const pxHeight = (x / MAX_X) * (CONTAINER_SIZE * 0.5);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Maximize className="text-sky-500" /> The Blueprint Expander
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Real-Life Quadratic Modeling: Build a prayer hall of exactly 300 sq metres.
          </p>
        </div>
        {isLocked && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Blueprint
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE BLUEPRINT) */}
        <div className="relative w-full lg:w-2/3 bg-[#082f49] border-4 border-sky-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 bg-[linear-gradient(to_right,#0ea5e91a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e91a_1px,transparent_1px)] bg-[size:20px_20px]">
          
          {/* Target Area Indicator */}
          <div className="absolute top-6 right-6 bg-sky-950/80 border border-sky-800 px-4 py-2 rounded-xl backdrop-blur-sm flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={18} />
            <div className="flex flex-col">
              <span className="text-sky-400 text-[10px] uppercase tracking-widest font-bold">Target Area</span>
              <span className="text-white font-mono font-bold">{targetArea} m²</span>
            </div>
          </div>

          <div className="relative w-full max-w-[500px] h-[300px] flex items-center justify-center">
            
            {/* The Dynamic Rectangle */}
            <motion.div 
              animate={{ width: pxWidth, height: pxHeight }}
              transition={{ type: "spring", bounce: 0, duration: 0.1 }}
              className={`border-4 flex items-center justify-center relative shadow-[0_0_30px_rgba(14,165,233,0.3)] ${
                isLocked ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'bg-sky-500/20 border-sky-400'
              }`}
            >
              {/* Internal Area Display */}
              <div className={`font-mono font-bold text-2xl sm:text-4xl transition-colors ${
                isLocked ? 'text-emerald-300' : 'text-sky-200'
              }`}>
                {Math.round(area)} m²
              </div>

              {/* Length Label (Bottom) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sky-300 font-mono font-bold text-sm bg-[#082f49] px-2">
                2x + 1 <span className="text-sky-500/50">({length.toFixed(1)}m)</span>
              </div>

              {/* Breadth Label (Left) */}
              <div className="absolute top-1/2 -left-8 -translate-y-1/2 -rotate-90 whitespace-nowrap text-sky-300 font-mono font-bold text-sm bg-[#082f49] px-2">
                x <span className="text-sky-500/50">({x.toFixed(1)}m)</span>
              </div>
            </motion.div>

          </div>

          {/* The Mathematical Drop (Aha! Moment) */}
          <AnimatePresence>
            {isLocked && (
              <motion.div 
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                className="absolute bottom-8 bg-emerald-950/90 border-2 border-emerald-500 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.6)] backdrop-blur-md flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">
                  <CheckCircle2 size={16} /> Dimensions Locked
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-3">
                  <span>x(2x + 1)</span>
                  <span className="text-emerald-500">=</span>
                  <span>300</span>
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-300 mt-2">
                  2x² + x - 300 = 0
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Controls */}
          <div className={`bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6 transition-all duration-500 ${isLocked ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Adjust Breadth (x)</span>
              <Ruler size={14} className="text-sky-500" />
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between font-mono text-xl items-center">
                <span className="text-sky-400 font-bold">x =</span>
                <span className="text-white bg-stone-950 px-4 py-2 rounded-lg border border-stone-700">{x.toFixed(1)} m</span>
              </div>
              
              {/* Slider requires some fine motor control due to the quadratic scaling */}
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="0.5" 
                value={x} 
                onChange={(e) => setX(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer" 
              />
              
              <div className="flex justify-between text-[10px] text-stone-500 font-mono font-bold uppercase tracking-widest">
                <span>1m</span>
                <span>Scrub carefully...</span>
                <span>20m</span>
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Lock className={isLocked ? "text-emerald-500" : "text-amber-500"} size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Quadratic Growth Engine</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              {/* Live Calculations */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-stone-950 border border-stone-800 p-3 rounded-lg">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Length (2x + 1)</span>
                  <span className="text-sky-300 font-bold">{length.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between items-center bg-stone-950 border border-stone-800 p-3 rounded-lg">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Breadth (x)</span>
                  <span className="text-sky-300 font-bold">{x.toFixed(1)} m</span>
                </div>
              </div>

              {/* Progress Bar for Area */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between items-center font-bold text-xs uppercase tracking-widest">
                  <span className="text-stone-400">Current Area</span>
                  <span className={isLocked ? 'text-emerald-400' : 'text-amber-400'}>{area.toFixed(2)} / 300</span>
                </div>
                <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 relative">
                  <motion.div 
                    animate={{ width: `${Math.min((area / targetArea) * 100, 100)}%` }}
                    className={`h-full transition-colors ${isLocked ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  {/* Target Line marker */}
                  <div className="absolute top-0 bottom-0 w-1 bg-rose-500 right-0 z-10"></div>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {isLocked ? (
                    <motion.div key="locked" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">The Equation is Born</h4>
                      <p className="text-emerald-200/80 font-sans text-xs leading-relaxed">
                        You found the physical dimensions! But notice how fast the area grew? Because length depends on breadth, area grows <strong>quadratically</strong> ($x^2$), not linearly. <br/><br/>
                        Solving the quadratic equation <strong className="text-emerald-400 font-mono">2x² + x - 300 = 0</strong> is just the mathematical way of doing exactly what you just did with the slider.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="unlocked" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest">The Challenge</h4>
                      <p className="text-stone-400 font-sans text-xs leading-relaxed">
                        Drag the slider to find the exact breadth ($x$) that makes the total area equal <strong>300 m²</strong>. Watch out—because length is tied to breadth, the area will accelerate faster the higher you go!
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