'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Calculator, TrendingUp } from 'lucide-react';

export default function GeometricGrower() {
  const [stage, setStage] = useState<number>(1);
  const MAX_STAGE = 10;
  
  // Calculate the total tiles using the linear formula: y = 2n - 1
  const totalTiles = 2 * stage - 1;

  // Generate the L-shape coordinate map
  const tiles = useMemo(() => {
    const generated = [];
    // The anchor tile
    generated.push({ id: '0-0', x: 0, y: 0, stageAdded: 1 });
    
    // The growing arms
    for (let i = 1; i < MAX_STAGE; i++) {
      generated.push({ id: `x-${i}`, x: i, y: 0, stageAdded: i + 1 });
      generated.push({ id: `y-${i}`, x: 0, y: i, stageAdded: i + 1 });
    }
    return generated;
  }, []);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-emerald-500" /> The Geometric Grower
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the linear sequence y = 2n - 1
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-center justify-center z-10">
        
        {/* THE INTERACTIVE GRID WORKSPACE */}
        <div className="relative w-full lg:w-2/3 h-[500px] bg-[#151414] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-end justify-start p-12">
          
          {/* Faded Blueprint Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: 'center bottom' }} />

          {/* Dynamic Tiles Container */}
          <div className="relative w-full h-full">
            <AnimatePresence>
              {tiles.filter(t => t.stageAdded <= stage).map((tile) => {
                const isNew = tile.stageAdded === stage;
                const isAnchor = tile.stageAdded === 1;
                
                return (
                  <motion.div
                    key={tile.id}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                    className={`absolute w-9 h-9 rounded-lg border-2 shadow-lg flex items-center justify-center
                      ${isNew && !isAnchor ? 'bg-amber-500 border-amber-300 z-20' : 'bg-emerald-600 border-emerald-400 z-10'}
                    `}
                    style={{
                      left: `${tile.x * 40}px`,
                      bottom: `${tile.y * 40}px`,
                    }}
                  >
                    {/* Inner highlight for premium block feel */}
                    <div className="absolute inset-1 rounded bg-white/20" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* The Slider Control */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <TrendingUp size={16} /> Sequence Stage (n)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max={MAX_STAGE} 
                step="1" 
                value={stage} 
                onChange={(e) => setStage(parseInt(e.target.value))} 
                className="w-full accent-emerald-500" 
              />
              <span className="text-3xl font-mono text-white bg-stone-950 px-4 py-2 rounded-lg border border-stone-800">
                {stage}
              </span>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Linear Growth</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-stone-800 pb-4">
                <span className="text-stone-500">Base Tiles:</span>
                <span className="text-emerald-400 text-lg">{stage === 1 ? 0 : 2 * (stage - 1) - 1}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-stone-800 pb-4">
                <span className="text-stone-500 flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-sm"></span> New Tiles (+2):
                </span>
                <span className="text-amber-400 text-lg font-bold">
                  {stage === 1 ? '+ 1' : '+ 2'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-300 font-bold uppercase tracking-widest text-xs">Total Tiles (y):</span>
                <span className="text-white text-2xl font-bold bg-stone-800 px-3 py-1 rounded-lg">
                  {totalTiles}
                </span>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-4 pt-4 border-t border-stone-800">
                <p className="text-stone-400 text-xs leading-relaxed font-sans">
                  The formula is <strong>y = 2n - 1</strong>.<br/><br/>
                  Notice how every time you increase the stage (n), exactly <strong className="text-amber-400">2</strong> amber tiles are added. This constant growth is the <strong>slope (a)</strong> in a linear polynomial.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}