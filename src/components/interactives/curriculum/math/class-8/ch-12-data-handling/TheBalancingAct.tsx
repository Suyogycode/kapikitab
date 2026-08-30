'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, RotateCcw, Target, Lightbulb, Activity } from 'lucide-react';

export default function TheBalancingAct() {
  // We represent the number line from 0 to 10.
  // We start with two points to create an initial balance.
  const [points, setPoints] = useState<number[]>([2, 8]); 
  const [mode, setMode] = useState<'mean' | 'median'>('mean');
  const [tilt, setTilt] = useState<number>(0);
  const prevMeanRef = useRef<number>(5);

  // ==================================================================
  // MATH ENGINE: Mean, Median, and Distances
  // ==================================================================
  const { mean, median, lhsDistance, rhsDistance } = useMemo(() => {
    if (points.length === 0) return { mean: 5, median: 5, lhsDistance: 0, rhsDistance: 0 };

    // Calculate Mean
    const sum = points.reduce((acc, val) => acc + val, 0);
    const calculatedMean = sum / points.length;

    // Calculate Median
    const sorted = [...points].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const calculatedMedian = sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;

    // Calculate Distances (Only relevant for Mean)
    let lhs = 0;
    let rhs = 0;
    points.forEach(p => {
      if (p < calculatedMean) lhs += (calculatedMean - p);
      if (p > calculatedMean) rhs += (p - calculatedMean);
    });

    return { 
      mean: calculatedMean, 
      median: calculatedMedian, 
      lhsDistance: lhs, 
      rhsDistance: rhs 
    };
  }, [points]);

  // ==================================================================
  // PHYSICS ENGINE: See-Saw Tipping Effect
  // ==================================================================
  useEffect(() => {
    if (mode === 'mean' && points.length > 0) {
      // If the mean shifted right, the board briefly tips right (positive rotation) before the fulcrum catches up.
      const shift = mean - prevMeanRef.current;
      if (Math.abs(shift) > 0.1) {
        setTilt(shift * 5); // Tipping magnitude
        
        // The fulcrum slides over, re-balancing the board to 0
        const timer = setTimeout(() => {
          setTilt(0);
        }, 300);
        
        prevMeanRef.current = mean;
        return () => clearTimeout(timer);
      }
    } else {
      setTilt(0);
    }
  }, [mean, mode, points.length]);

  const handleAddPoint = (val: number) => {
    if (points.length >= 15) return; // Cap at 15 points to prevent clutter
    setPoints([...points, val]);
  };

  const handleReset = () => {
    setPoints([2, 8]);
    prevMeanRef.current = 5;
  };

  const activeCenter = mode === 'mean' ? mean : median;

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Balancing Act
          </h2>
          <p className="text-stone-400 text-sm mt-1">Mean vs. Median: Finding the Center.</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 shadow-lg shrink-0">
          <button 
            onClick={() => setMode('mean')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${mode === 'mean' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:text-stone-300'}`}
          >
            <Scale size={14} /> Mean (Balance)
          </button>
          <button 
            onClick={() => setMode('median')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${mode === 'median' ? 'bg-blue-600 text-white' : 'text-stone-500 hover:text-stone-300'}`}
          >
            <Target size={14} /> Median (Middle)
          </button>
        </div>
      </div>

      {/* THE MAIN INTERACTIVE CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 sm:p-12 z-10 overflow-hidden">
        
        {/* Interactive Number Line Area */}
        <div className="w-full max-w-4xl relative h-64 flex flex-col justify-end pb-8">
          
          {/* Distance Arcs (Only visible in Mean mode) */}
          <AnimatePresence>
            {mode === 'mean' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 w-full h-32 pointer-events-none">
                {points.map((p, i) => {
                  const isLHS = p < mean;
                  const isRHS = p > mean;
                  if (!isLHS && !isRHS) return null; // Right on the mean
                  
                  const startX = `${p * 10}%`;
                  const endX = `${mean * 10}%`;
                  
                  return (
                    <svg key={`arc-${i}`} className="absolute top-0 left-0 w-full h-full overflow-visible">
                      <motion.path 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        d={`M ${p * 10} 100 Q ${(p * 10 + mean * 10) / 2} 0 ${mean * 10} 100`}
                        fill="none"
                        stroke={isLHS ? '#3b82f6' : '#f59e0b'}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        style={{ transformOrigin: "center" }}
                      />
                    </svg>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The See-Saw Board */}
          <motion.div 
            className="w-full relative h-16 flex items-center"
            animate={{ rotate: tilt }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {/* The Main Beam */}
            <div className="absolute w-full h-4 bg-stone-700 rounded-full border-b-2 border-stone-900 shadow-xl" />
            
            {/* Tick Marks (Clickable to add points) */}
            <div className="absolute w-full h-full flex justify-between items-center px-[2%]">
              {[0,1,2,3,4,5,6,7,8,9,10].map((num) => (
                <div 
                  key={num} 
                  onClick={() => handleAddPoint(num)}
                  className="h-10 w-8 flex flex-col items-center justify-center cursor-pointer group z-10"
                >
                  <div className="w-0.5 h-3 bg-stone-500 group-hover:bg-emerald-400 transition-colors" />
                  <span className="text-[10px] font-mono text-stone-500 mt-1 group-hover:text-emerald-400">{num}</span>
                </div>
              ))}
            </div>

            {/* The Data Point Orbs */}
            <AnimatePresence>
              {points.map((p, i) => (
                <motion.div
                  key={`point-${i}`}
                  initial={{ y: -50, opacity: 0, scale: 0.5 }}
                  animate={{ y: -16, opacity: 1, scale: 1, left: `${p * 10}%` }}
                  className="absolute w-8 h-8 -ml-4 bg-gradient-to-br from-stone-100 to-stone-400 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)] border-2 border-white/50 flex items-center justify-center z-20"
                >
                  <span className="text-stone-800 font-bold text-xs">{p}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* The Fulcrum (Pivot) */}
          <motion.div 
            className="absolute bottom-0 w-8 h-8 -ml-4 flex items-end justify-center z-0"
            animate={{ left: `${activeCenter * 10}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className={`w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] drop-shadow-2xl transition-colors duration-500
              ${mode === 'mean' ? 'border-b-emerald-500' : 'border-b-blue-500'}`} 
            />
          </motion.div>

        </div>

      </div>

      {/* MATHEMATICAL HUD & AHA! MOMENT */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 z-10 shrink-0">
        
        {/* Dynamic Distance Equation */}
        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-center">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={16} className={mode === 'mean' ? "text-emerald-500" : "text-blue-500"} /> 
            {mode === 'mean' ? 'Distance Balance Equation' : 'Positional Middle'}
          </div>
          
          {mode === 'mean' ? (
            <div className="flex items-center justify-center gap-4 font-mono">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">LHS Distance</span>
                <span className="text-2xl font-bold text-white bg-blue-950/50 px-4 py-2 rounded-lg border border-blue-900/50">{lhsDistance.toFixed(1)}</span>
              </div>
              <span className="text-stone-500 font-bold text-2xl">=</span>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-amber-500 uppercase tracking-widest mb-1">RHS Distance</span>
                <span className="text-2xl font-bold text-white bg-amber-950/50 px-4 py-2 rounded-lg border border-amber-900/50">{rhsDistance.toFixed(1)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center font-mono h-[72px]">
               <span className="text-stone-400 text-sm">Sorted Array:</span>
               <span className="text-lg text-white mt-1">[{[...points].sort((a, b) => a - b).join(', ')}]</span>
            </div>
          )}
        </div>

        {/* AHA Panel */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {mode === 'mean' ? (
              <motion.div key="mean-aha" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full bg-emerald-950/40 border border-emerald-900/50 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
                <Lightbulb size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-stone-300 text-sm leading-relaxed">
                  <strong>The Physical Pivot:</strong> When you drop an orb, the board tips! To stop it from falling, the emerald pivot <em>must</em> slide to the exact mathematical Mean. At this point, the total pulling distance on the left perfectly matches the total pulling distance on the right.
                </p>
              </motion.div>
            ) : (
              <motion.div key="median-aha" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full bg-blue-950/40 border border-blue-900/50 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
                <Lightbulb size={24} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-stone-300 text-sm leading-relaxed">
                  <strong>The Positional Anchor:</strong> Unlike the Mean, the Median doesn't care about "weight" or "distance." It simply sorts the orbs in a row and snaps to the exact middle one. Try adding an outlier at '10' and see how the Mean shifts wildly, but the Median barely moves!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Button */}
        <button 
          onClick={handleReset}
          className="shrink-0 h-full px-6 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl font-bold uppercase tracking-widest text-xs transition-colors flex flex-col items-center justify-center gap-2"
        >
          <RotateCcw size={20} /> Reset
        </button>
      </div>

    </div>
  );
}