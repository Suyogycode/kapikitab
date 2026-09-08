'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Copy, Calculator, Lightbulb, RotateCcw } from 'lucide-react';

export default function StaircaseCombiner() {
  const [n, setN] = useState<number>(5);
  const [isCombined, setIsCombined] = useState<boolean>(false);

  // Math Logic
  const sum = (n * (n + 1)) / 2;
  const rectangleArea = n * (n + 1);

  // Grid Configuration
  const BLOCK_SIZE = 36; // Size of each stone token in pixels
  const GAP = 2; // Gap between tokens
  const TOTAL_SIZE = BLOCK_SIZE + GAP;
  
  // Center the grid dynamically based on n
  const gridWidth = (n + 1) * TOTAL_SIZE;
  const gridHeight = n * TOTAL_SIZE;

  // Generate coordinates for the original staircase
  const originalBlocks = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= r; c++) {
      originalBlocks.push({ id: `orig-${r}-${c}`, r, c });
    }
  }

  // Generate coordinates for the inverted cloned staircase
  const clonedBlocks = [];
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c <= n; c++) {
      clonedBlocks.push({ id: `clone-${r}-${c}`, r, c });
    }
  }

  const handleReset = () => {
    setN(5);
    setIsCombined(false);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Layers className="text-emerald-500" /> The Staircase Combiner
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the sum of the first n natural numbers.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-8">
          
          <div 
            className="relative transition-all duration-500" 
            style={{ width: gridWidth, height: gridHeight }}
          >
            {/* Dimension Lines (Show when combined) */}
            <AnimatePresence>
              {isCombined && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Top Width Dimension (n + 1) */}
                  <div className="absolute -top-10 left-0 right-0 h-6 border-x-2 border-t-2 border-emerald-500/50 flex items-start justify-center">
                    <span className="text-emerald-400 font-mono font-bold text-sm -mt-3 bg-[#1c1917] px-2">
                      Width = n + 1 ({n + 1})
                    </span>
                  </div>
                  
                  {/* Right Height Dimension (n) */}
                  <div className="absolute top-0 -right-12 bottom-0 w-8 border-y-2 border-r-2 border-sky-500/50 flex items-center justify-end">
                    <span className="text-sky-400 font-mono font-bold text-sm -mr-2 bg-[#1c1917] py-2 whitespace-nowrap translate-x-full">
                      Height = n ({n})
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Original Staircase (Earthy Stone) */}
            <AnimatePresence>
              {originalBlocks.map(block => (
                <motion.div
                  key={block.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                  className="absolute bg-stone-500 border-2 border-stone-400 rounded-md shadow-md flex items-center justify-center"
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    left: block.c * TOTAL_SIZE,
                    top: block.r * TOTAL_SIZE,
                  }}
                >
                  {/* Optional: Show numbers on the bottom row to emphasize the 1, 2, 3... sequence */}
                  {block.r === n - 1 && (
                    <span className="text-stone-800 font-bold text-xs">{block.c + 1}</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cloned & Inverted Staircase (Emerald Green) */}
            <AnimatePresence>
              {isCombined && clonedBlocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ 
                    x: (block.c - 1) * TOTAL_SIZE, // Start near the original stairs
                    y: -50, 
                    opacity: 0,
                    rotate: 180 
                  }}
                  animate={{ 
                    x: block.c * TOTAL_SIZE, 
                    y: block.r * TOTAL_SIZE, 
                    opacity: 1,
                    rotate: 0 
                  }}
                  exit={{ 
                    y: -50, 
                    opacity: 0,
                    scale: 0.8 
                  }}
                  transition={{ 
                    type: "spring", 
                    bounce: 0.4, 
                    delay: index * 0.02 // Stagger the falling animation slightly
                  }}
                  className="absolute bg-emerald-500 border-2 border-emerald-400 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center z-10"
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                  }}
                />
              ))}
            </AnimatePresence>

          </div>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Controls */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                <span>Number of Steps (n)</span>
                <span className="text-stone-200">{n}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1" 
                value={n} 
                onChange={(e) => {
                  setN(parseInt(e.target.value));
                  setIsCombined(false); // Auto-reset when changing size
                }}
                className="w-full accent-stone-500" 
              />
            </div>
            
            <button 
              onClick={() => setIsCombined(!isCombined)}
              className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg border ${
                isCombined 
                  ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' 
                  : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
              }`}
            >
              <Copy size={20} />
              {isCombined ? 'Remove Clone' : 'Clone & Invert'}
            </button>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Summation Engine</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              {/* Sequence Display */}
              <div className="space-y-2">
                <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold">Sum of 1 to {n}</span>
                <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-stone-300 break-all text-xs">
                  S = {Array.from({length: n}, (_, i) => i + 1).join(' + ')}
                </div>
              </div>

              {/* Dynamic Math Box */}
              <div className={`p-4 rounded-lg border transition-colors ${isCombined ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-stone-950 border-stone-800'}`}>
                {isCombined ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>2S (Rectangle Area)</span>
                      <span>= n × (n + 1)</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-300 pl-4">
                      <span>2S</span>
                      <span>= {n} × {n+1} = {rectangleArea}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-white border-t border-emerald-900/50 pt-2 mt-2">
                      <span>S (Staircase Area)</span>
                      <span>= {sum}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[88px] text-stone-500 text-xs text-center px-4">
                    Click "Clone & Invert" to discover the formula visually.
                  </div>
                )}
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {isCombined ? (
                    <motion.div 
                      key="combined"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3"
                    >
                      <Lightbulb className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">The Flawless Rectangle</h4>
                        <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                          By duplicating the staircase and flipping it upside down, the two jagged shapes lock together into a perfect rectangle. <br/><br/>
                          The area of this rectangle is <strong>n(n+1)</strong>. Since it is made of two identical staircases (2S), a single staircase must be exactly half of that area: <strong>S = n(n+1) / 2</strong>.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="staircase"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3"
                    >
                      <Lightbulb className="text-stone-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-stone-400 text-xs leading-relaxed font-sans">
                        Counting these stone tokens one by one is slow. How can we easily find the total amount of blocks in this jagged shape? Let's use a geometric trick.
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