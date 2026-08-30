'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Grid3X3, Lightbulb } from 'lucide-react';

export default function FDPFluidCylinder() {
  const [fillLevel, setFillLevel] = useState<number>(50); // 0 to 100
  const [gridMode, setGridMode] = useState<boolean>(false);

  // ==================================================================
  // MATH ENGINE: FDP Trio Calculations
  // ==================================================================
  const { fraction, decimal, percentage } = useMemo(() => {
    // 1. Percentage
    const p = fillLevel;

    // 2. Decimal
    const d = (fillLevel / 100).toFixed(2);

    // 3. Fraction (Simplified)
    let f = `${fillLevel}/100`;
    if (fillLevel === 0) f = "0";
    else if (fillLevel === 100) f = "1";
    else {
      const getGCD = (a: number, b: number): number => (b === 0 ? a : getGCD(b, a % b));
      const gcd = getGCD(fillLevel, 100);
      f = `${fillLevel / gcd}/${100 / gcd}`;
    }

    return { fraction: f, decimal: d, percentage: p };
  }, [fillLevel]);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The FDP Fluid Cylinder
          </h2>
          <p className="text-stone-400 text-sm mt-1">Connecting Fractions, Decimals, and Percentages.</p>
        </div>
      </div>

      {/* THE MAIN CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col md:flex-row items-center justify-center p-6 gap-8 z-10 overflow-hidden">
        
        {/* LEFT: The Fluid Cylinder / Tank */}
        <div className="relative w-48 h-80 sm:w-64 sm:h-96 bg-stone-900/50 border-4 border-stone-700 rounded-xl overflow-hidden shadow-2xl flex items-end">
          
          {/* The Fluid Fill */}
          <motion.div 
            className="w-full bg-emerald-500/90 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            animate={{ height: `${fillLevel}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />

          {/* GRID MODE OVERLAY */}
          <AnimatePresence>
            {gridMode && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 grid grid-cols-10 grid-rows-10 z-20 pointer-events-none"
              >
                {Array.from({ length: 100 }).map((_, i) => {
                  // Invert index because grid renders top-to-bottom, but fluid fills bottom-to-top
                  const row = 9 - Math.floor(i / 10);
                  const col = i % 10;
                  const cellIndex = row * 10 + col;
                  const isFilled = cellIndex < fillLevel;

                  return (
                    <div 
                      key={i} 
                      className={`border-[0.5px] border-stone-950/50 transition-colors duration-300 ${isFilled ? 'bg-emerald-400/40' : 'bg-transparent'}`}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scale Markings */}
          <div className="absolute left-0 top-0 h-full w-full pointer-events-none flex flex-col justify-between py-1 border-r border-stone-800/50">
            {[100, 75, 50, 25, 0].map((mark) => (
              <div key={mark} className="flex items-center">
                <div className="w-3 h-[2px] bg-stone-500" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: The FDP Digital Displays */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {/* Fraction Display */}
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Fraction</span>
            <div className="text-3xl font-mono font-bold text-amber-400 flex flex-col items-center">
              {fraction.includes('/') ? (
                <>
                  <span>{fraction.split('/')[0]}</span>
                  <div className="w-full h-1 bg-amber-400/50 my-1 rounded-full" />
                  <span>{fraction.split('/')[1]}</span>
                </>
              ) : (
                <span>{fraction}</span>
              )}
            </div>
          </div>

          {/* Decimal Display */}
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Decimal</span>
            <span className="text-4xl font-mono font-bold text-blue-400">{decimal}</span>
          </div>

          {/* Percentage Display */}
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 shadow-lg flex items-center justify-between relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-900/30 z-0"
              animate={{ width: `${fillLevel}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500 relative z-10">Percentage</span>
            <span className="text-4xl font-mono font-bold text-emerald-400 relative z-10">{percentage}%</span>
          </div>
        </div>

      </div>

      {/* AHA! MESSAGE BOX */}
      <div className="mt-4 z-10">
        <AnimatePresence mode="wait">
          {gridMode ? (
            <motion.div key="grid-on" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-950/40 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3 shadow-lg">
              <Lightbulb size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                <strong>Cent = 100.</strong> By breaking the tank into exactly 100 squares, you can see that {fillLevel}% literally means "{fillLevel} squares out of every 100." The fraction <span className="font-mono text-emerald-400">{fillLevel}/100</span> is just the raw mathematical notation of the visual grid!
              </p>
            </motion.div>
          ) : (
            <motion.div key="grid-off" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-start gap-3 shadow-lg">
              <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-stone-400 text-sm leading-relaxed">
                Adjust the fluid level. Notice how the Fraction heavily simplifies at clean milestones (like 50% dropping to 1/2), but the Decimal strictly shifts the decimal point two places to the left.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 z-10 shrink-0">
        
        {/* Fluid Slider */}
        <div className="flex-1 w-full bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Droplets size={16} className="text-emerald-500" /> Fluid Volume
            </label>
            <span className="text-sm font-mono font-bold text-white">{fillLevel} Units</span>
          </div>
          <input 
            type="range" min="0" max="100" step="1" 
            value={fillLevel} 
            onChange={(e) => setFillLevel(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-emerald-500"
          />
        </div>

        {/* Grid Mode Toggle */}
        <button 
          onClick={() => setGridMode(!gridMode)}
          className={`shrink-0 h-full px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 border-2
            ${gridMode ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-stone-900 border-stone-700 text-stone-400 hover:bg-stone-800'}`}
        >
          <Grid3X3 size={18} />
          {gridMode ? 'Hide 100 Grid' : 'Show 100 Grid'}
        </button>

      </div>
    </div>
  );
}