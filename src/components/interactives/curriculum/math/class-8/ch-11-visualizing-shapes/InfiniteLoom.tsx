'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, ZoomIn, Layers, Activity } from 'lucide-react';

// ==================================================================
// MATH ENGINE: Recursive Fractal Generator
// ==================================================================
interface Hole {
  id: string;
  x: number;
  y: number;
  size: number;
  stepCreated: number;
}

function generateCarpetHoles(x: number, y: number, size: number, currentStep: number, maxStep: number): Hole[] {
  if (currentStep > maxStep) return [];

  const third = size / 3;
  const holes: Hole[] = [];

  // The center hole for this specific square
  holes.push({
    id: `hole-${currentStep}-${x}-${y}`,
    x: x + third,
    y: y + third,
    size: third,
    stepCreated: currentStep,
  });

  // Recursively generate holes for the 8 surrounding sub-squares
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 1 && col === 1) continue; // Skip the center, we already punched it out
      holes.push(
        ...generateCarpetHoles(
          x + col * third, 
          y + row * third, 
          third, 
          currentStep + 1, 
          maxStep
        )
      );
    }
  }

  return holes;
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function InfiniteLoom() {
  const [step, setStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'carpet' | 'triangle' | 'koch'>('carpet');
  const [isZooming, setIsZooming] = useState<boolean>(false);

  // We cap the actual DOM rendering at Step 4 to prevent browser crashes (4096 holes).
  // Step 5+ will be simulated using the Deep Zoom mechanic.
  const visualStep = Math.min(step, 4); 

  // Pre-calculate all holes up to the current visual step
  const allHoles = useMemo(() => {
    return generateCarpetHoles(0, 0, 300, 1, visualStep);
  }, [visualStep]);

  // Mathematical tracking
  const remainingSquares = Math.pow(8, step);
  const areaRemaining = Math.pow(8 / 9, step) * 100; // Percentage of the original area

  // Deep Zoom Animation Logic
  useEffect(() => {
    if (isZooming) {
      const timer = setTimeout(() => {
        setIsZooming(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isZooming]);

  const handleDeepZoom = () => {
    if (isZooming) return;
    setIsZooming(true);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Infinite Loom
          </h2>
          <p className="text-stone-400 text-sm mt-1">Generating Complexity from Simple Rules.</p>
        </div>

        {/* Fractal Tabs */}
        <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 shadow-lg">
          <button 
            onClick={() => setActiveTab('carpet')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'carpet' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:text-stone-300'}`}
          >
            Sierpinski Carpet
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-stone-700 cursor-not-allowed`}
          >
            Triangle
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-stone-700 cursor-not-allowed`}
          >
            Koch Snowflake
          </button>
        </div>
      </div>

      {/* THE MAIN CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col md:flex-row items-center justify-center p-6 gap-8 z-10 overflow-hidden">
        
        {/* LEFT: The SVG Fractal Engine */}
        <div className="relative w-full max-w-[350px] aspect-square flex items-center justify-center">
          
          <motion.div
            className="w-full h-full relative"
            animate={isZooming ? { scale: 3, x: '100%', y: '100%' } : { scale: 1, x: 0, y: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              {/* The Base Solid Square */}
              <rect x="0" y="0" width="300" height="300" fill="#10b981" />

              {/* The Procedurally Generated Holes */}
              <AnimatePresence>
                {allHoles.map((hole) => (
                  <motion.rect
                    key={hole.id}
                    x={hole.x}
                    y={hole.y}
                    width={hole.size}
                    height={hole.size}
                    fill="#1c1917" // Matches background to look like a punched hole
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ originX: 'center', originY: 'center' }}
                  />
                ))}
              </AnimatePresence>
            </svg>
          </motion.div>

          {/* Deep Zoom Overlay Effect */}
          <AnimatePresence>
            {isZooming && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
                className="absolute inset-0 border-4 border-emerald-500 rounded-lg pointer-events-none flex items-center justify-center z-20"
              >
                <div className="bg-black/80 text-emerald-400 px-6 py-2 rounded-full font-mono text-sm uppercase tracking-widest font-bold border border-emerald-500/50 backdrop-blur-md">
                  Magnifying...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: The Mathematical HUD */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          
          <div className="bg-stone-900 border border-stone-700 p-5 rounded-2xl shadow-xl">
            <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Layers size={14} className="text-emerald-500" /> Remaining Solid Squares (Rₙ)
            </h3>
            <div className="text-3xl font-mono font-bold text-emerald-400 flex items-baseline gap-2">
              {remainingSquares.toLocaleString()}
              <span className="text-sm text-stone-500">squares</span>
            </div>
            <div className="mt-2 pt-2 border-t border-stone-800 text-xs font-mono text-stone-400">
              Formula: Rₙ = 8ⁿ
            </div>
          </div>

          <div className="bg-stone-900 border border-stone-700 p-5 rounded-2xl shadow-xl">
            <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Activity size={14} className="text-blue-500" /> Total Area Remaining
            </h3>
            <div className="text-3xl font-mono font-bold text-blue-400 flex items-baseline gap-2">
              {areaRemaining.toFixed(2)}%
            </div>
            <div className="mt-2 pt-2 border-t border-stone-800 text-xs font-mono text-stone-400">
              Formula: Aₙ = (8/9)ⁿ
            </div>
          </div>

          {/* AHA Moment Panel */}
          {step >= 4 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/40 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3 shadow-lg mt-2"
            >
              <Maximize size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                <strong>The Infinite Paradox:</strong> As $n$ approaches infinity, the number of holes becomes infinite, and the remaining area approaches exactly <strong>0%</strong>. Yet, the shape still has an infinite perimeter!
              </p>
            </motion.div>
          )}

        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 z-10 shrink-0">
        
        {/* Iteration Slider */}
        <div className="flex-1 w-full bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              Iteration Step (n)
            </label>
            <span className="text-sm font-mono font-bold text-white">Step {step}</span>
          </div>
          <input 
            type="range" min="0" max="6" step="1" 
            value={step} 
            onChange={(e) => setStep(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-emerald-500"
          />
          {step > 4 && (
            <div className="text-[10px] text-amber-500 uppercase tracking-widest mt-2 font-bold flex items-center justify-between">
              <span>Warning: Massive Calculation</span>
              <span>{remainingSquares.toLocaleString()} nodes</span>
            </div>
          )}
        </div>

        {/* Deep Zoom Button */}
        <button 
          onClick={handleDeepZoom}
          disabled={isZooming || step === 0}
          className="shrink-0 h-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2 shadow-lg"
        >
          <ZoomIn size={18} /> Deep Zoom
        </button>

      </div>
    </div>
  );
}