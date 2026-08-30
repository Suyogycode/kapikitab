'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';

export default function OddStaircase() {
  const [n, setN] = useState<number>(1);
  const maxN = 10; // Limit to 10x10 for visual clarity

  // Generate the grid cells. Each cell knows its (x, y) coordinate.
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      // The "layer" this cell belongs to is the maximum of its x or y coordinate
      // e.g., the cell at (2, 0) was added in layer 3 (index 2).
      const layer = Math.max(x, y);
      cells.push({ id: `${x}-${y}`, x, y, layer });
    }
  }

  // Generate the equation string: "1 + 3 + 5 = 9 = 3²"
  const oddNumbers = Array.from({ length: n }, (_, i) => 2 * i + 1);
  const equationLHS = oddNumbers.join(' + ');
  const totalArea = n * n;

  return (
    <div className="w-full h-full min-h-[600px] bg-[#FDFCF8] rounded-2xl border border-stone-200 p-6 flex flex-col items-center">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-stone-900">The Odd Staircase</h2>
        <p className="text-stone-500 mt-2">Every square is the sum of consecutive odd numbers.</p>
      </div>

      {/* THE GRID CANVAS */}
      <div className="flex-1 flex items-center justify-center w-full max-w-lg mb-8 relative">
        <div 
          className="grid gap-1 sm:gap-2 transition-all duration-500"
          style={{ 
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            width: `${Math.min(100, n * 10)}%` 
          }}
        >
          <AnimatePresence>
            {cells.map((cell) => {
              // Alternate colors for visual distinction of the 'L' shapes
              const isEvenLayer = cell.layer % 2 === 0;
              
              return (
                <motion.div
                  key={cell.id}
                  initial={{ opacity: 0, scale: 0, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20, 
                    delay: (cell.x + cell.y) * 0.05 // Stagger entrance
                  }}
                  className={`
                    aspect-square rounded-md sm:rounded-xl flex items-center justify-center overflow-hidden
                    ${isEvenLayer ? 'bg-emerald-500' : 'bg-stone-400'}
                  `}
                >
                  {/* 
                    SVG IMAGE PLACEHOLDER:
                    Uncomment the img tag below and replace the src with your actual asset path 
                    when your designer finishes the stone/pebble illustrations.
                    The CSS background above acts as your smooth box fallback.
                  */}
                  {/* <img src="/assets/emerald-stone.svg" alt="stone" className="w-full h-full object-cover" /> */}
                  
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* THE LIVE EQUATION */}
      <div className="h-16 flex items-center justify-center text-xl sm:text-2xl font-mono text-stone-700 font-medium mb-8">
        {equationLHS} <span className="mx-3 text-stone-300">=</span> 
        <span className="text-emerald-600 font-bold">{totalArea}</span> 
        <span className="mx-3 text-stone-300">=</span> 
        {n}²
      </div>

      {/* CONTROLS */}
      <div className="flex gap-4">
        <button
          onClick={() => setN(1)}
          className="p-3 sm:px-6 sm:py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <RotateCcw size={18} /> <span className="hidden sm:inline">Reset</span>
        </button>
        <button
          onClick={() => setN(prev => Math.min(prev + 1, maxN))}
          disabled={n >= maxN}
          className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-full font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} /> Add Next Odd Number ({2 * n + 1})
        </button>
      </div>
    </div>
  );
}