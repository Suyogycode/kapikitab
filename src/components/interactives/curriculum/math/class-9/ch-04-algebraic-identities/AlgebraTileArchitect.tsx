'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutTemplate, Calculator, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AlgebraTileArchitect() {
  // Config
  const X_SIZE = 160;
  const UNIT_SIZE = 36;
  const TOTAL_X = 7;
  const TOTAL_UNITS = 12;

  // State: How many x-tiles are placed on the right (the rest go on the bottom)
  const [rightX, setRightX] = useState<number>(7);
  const bottomX = TOTAL_X - rightX;

  // Math Logic
  const cornerCapacity = rightX * bottomX;
  const isPerfect = cornerCapacity === TOTAL_UNITS;

  // Generate arrays for mapping
  const rightXTiles = Array.from({ length: rightX }, (_, i) => `rx-${i}`);
  const bottomXTiles = Array.from({ length: bottomX }, (_, i) => `bx-${i}`);
  const unitTiles = Array.from({ length: TOTAL_UNITS }, (_, i) => `u-${i}`);

  return (
    <div className="w-full h-full min-h-[800px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <LayoutTemplate className="text-emerald-500" /> The Algebra Tile Architect
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Factoring the quadratic $x^2 + 7x + 12$ by building a perfect rectangle.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE DRAFTING BOARD */}
        <div className="relative w-full lg:w-2/3 bg-[#151414] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 lg:p-12">
          
          {/* Faded Blueprint Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)', backgroundSize: '36px 36px', backgroundPosition: 'center center' }} />

          {/* The Physics Container */}
          <div className="relative" style={{ width: X_SIZE + (7 * UNIT_SIZE), height: X_SIZE + (7 * UNIT_SIZE) }}>
            
            {/* DIMENSION LINES (Only show when perfect) */}
            <AnimatePresence>
              {isPerfect && (
                <>
                  {/* Top Dimension */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute -top-8 border-t-2 border-x-2 border-emerald-500/50 flex items-start justify-center pt-1"
                    style={{ left: 0, width: X_SIZE + rightX * UNIT_SIZE, height: 16 }}
                  >
                    <span className="text-emerald-400 font-mono font-bold text-sm -mt-6 bg-[#151414] px-2">
                      (x + {rightX})
                    </span>
                  </motion.div>
                  
                  {/* Left Dimension */}
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="absolute -left-8 border-l-2 border-y-2 border-emerald-500/50 flex items-center justify-start pl-1"
                    style={{ top: 0, width: 16, height: X_SIZE + bottomX * UNIT_SIZE }}
                  >
                    <span className="text-emerald-400 font-mono font-bold text-sm -ml-8 bg-[#151414] py-2 -rotate-90 origin-center whitespace-nowrap">
                      (x + {bottomX})
                    </span>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* 1. The Core x^2 Block */}
            <div 
              className={`absolute top-0 left-0 bg-emerald-900/80 backdrop-blur-sm border-2 ${isPerfect ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-emerald-700'} flex items-center justify-center transition-all duration-500 z-20`}
              style={{ width: X_SIZE, height: X_SIZE }}
            >
              <span className="text-emerald-200 font-bold font-mono text-2xl">x²</span>
            </div>

            {/* 2. The Right x-Tiles */}
            <AnimatePresence>
              {rightXTiles.map((id, index) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                  className={`absolute top-0 bg-sky-900/80 backdrop-blur-sm border-2 ${isPerfect ? 'border-sky-400' : 'border-sky-700'} flex items-center justify-center z-10`}
                  style={{ left: X_SIZE + (index * UNIT_SIZE), width: UNIT_SIZE, height: X_SIZE }}
                >
                  <span className="text-sky-200 font-bold font-mono rotate-90">x</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 3. The Bottom x-Tiles */}
            <AnimatePresence>
              {bottomXTiles.map((id, index) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                  className={`absolute left-0 bg-sky-900/80 backdrop-blur-sm border-2 ${isPerfect ? 'border-sky-400' : 'border-sky-700'} flex items-center justify-center z-10`}
                  style={{ top: X_SIZE + (index * UNIT_SIZE), width: X_SIZE, height: UNIT_SIZE }}
                >
                  <span className="text-sky-200 font-bold font-mono">x</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 4. The Corner Snap Grid (Ghost outline) */}
            <div 
              className="absolute border-2 border-dashed border-stone-700/50 transition-all duration-500 z-0"
              style={{ left: X_SIZE, top: X_SIZE, width: rightX * UNIT_SIZE, height: bottomX * UNIT_SIZE }}
            />

            {/* 5. The Unit Tiles (1x1) */}
            {unitTiles.map((id, index) => {
              // Physics Logic: Where does this tile go?
              let targetX, targetY;
              
              if (index < cornerCapacity) {
                // It fits in the grid! Calculate row and column
                const col = index % rightX;
                const row = Math.floor(index / rightX);
                targetX = X_SIZE + (col * UNIT_SIZE);
                targetY = X_SIZE + (row * UNIT_SIZE);
              } else {
                // It overflows! Toss it into a messy pile at the bottom right
                const overflowIndex = index - cornerCapacity;
                const pileCol = overflowIndex % 4;
                const pileRow = Math.floor(overflowIndex / 4);
                targetX = X_SIZE + (pileCol * UNIT_SIZE) + 20;
                targetY = X_SIZE + (bottomX * UNIT_SIZE) + 40 + (pileRow * UNIT_SIZE);
              }

              return (
                <motion.div
                  key={id}
                  layout
                  initial={false}
                  animate={{ x: targetX, y: targetY }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                  className={`absolute top-0 left-0 bg-amber-600/90 border border-amber-400 flex items-center justify-center z-30 ${isPerfect ? 'shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'shadow-md'}`}
                  style={{ width: UNIT_SIZE, height: UNIT_SIZE }}
                >
                  <span className="text-amber-100 font-bold font-mono text-xs">1</span>
                </motion.div>
              );
            })}

          </div>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Tile Allocation Slider */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              Split the 7x Middle Term
            </label>
            
            <div className="flex justify-between items-end mb-2 font-mono text-sm">
              <span className="text-sky-400 font-bold">{rightX}x Right</span>
              <span className="text-sky-400 font-bold">{bottomX}x Bottom</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="7" 
              step="1" 
              value={rightX} 
              onChange={(e) => setRightX(parseInt(e.target.value))} 
              className="w-full accent-sky-500" 
            />
            
            <div className="mt-6 p-4 bg-stone-950 border border-stone-800 rounded-lg flex justify-between items-center">
              <span className="text-stone-400 text-xs uppercase tracking-widest font-bold">Corner Grid Size:</span>
              <span className={`font-mono font-bold text-lg ${isPerfect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {rightX} × {bottomX} = {cornerCapacity}
              </span>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Factoring Engine</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex-col flex h-full">
              
              <div className="space-y-2">
                <p className="text-stone-500 text-xs uppercase tracking-widest">Original Quadratic</p>
                <div className="text-xl text-white font-bold bg-stone-950 p-3 rounded-lg border border-stone-800">
                  {`x^2 + 7x + 12`}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="text-stone-700 rotate-90" />
              </div>

              <div className="space-y-2">
                <p className="text-stone-500 text-xs uppercase tracking-widest">Your Arrangement</p>
                <div className={`text-xl font-bold bg-stone-950 p-3 rounded-lg border transition-colors ${isPerfect ? 'border-emerald-500/50 text-emerald-400' : 'border-stone-800 text-stone-400'}`}>
                  {`x^2 + ${rightX}x + ${bottomX}x + 12`}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {isPerfect ? (
                    <motion.div 
                      key="perfect"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3"
                    >
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Perfect Rectangle</h4>
                        <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                          By splitting $7x$ into $3x$ and $4x$, you created a perfect $3 \times 4$ corner for the 12 unit tiles. The dimensions of this solid rectangle reveal the factors:<br/><br/>
                          <strong className="text-white text-sm font-mono border-b border-emerald-500 pb-1">{`(x + 3)(x + 4)`}</strong>
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="imperfect"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                      <p className="text-stone-400 text-xs leading-relaxed font-sans">
                        The 12 unit tiles must snap perfectly into the corner grid to form a solid rectangle. <br/><br/>
                        Right now, your corner has space for <strong>{cornerCapacity}</strong> tiles. Adjust the slider to split the $7x$ differently until the 12 units fit perfectly.
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