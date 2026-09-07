'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Scissors, PlusSquare, ArrowRight, RotateCcw } from 'lucide-react';

export default function GeometryOfSubtraction() {
  // Config
  const MULT = 25; // 1 unit = 25 pixels
  
  // State
  const [a, setA] = useState<number>(10);
  const [b, setB] = useState<number>(3);
  
  // Interactive Physics States
  const [rect1Removed, setRect1Removed] = useState(false);
  const [rect2Removed, setRect2Removed] = useState(false);
  const [b2Added, setB2Added] = useState(false);

  // Reset puzzle when sliders change
  useEffect(() => {
    setRect1Removed(false);
    setRect2Removed(false);
    setB2Added(false);
  }, [a, b]);

  // Trigger the final Aha! moment when both rectangles are removed
  useEffect(() => {
    if (rect1Removed && rect2Removed && !b2Added) {
      const timer = setTimeout(() => {
        setB2Added(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rect1Removed, rect2Removed]);

  const handleReset = () => {
    setRect1Removed(false);
    setRect2Removed(false);
    setB2Added(false);
  };

  const aSize = a * MULT;
  const bSize = b * MULT;
  const aMinusBSize = (a - b) * MULT;

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Square className="text-rose-500" /> The Geometry of Subtraction
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the identity: $(a - b)^2 = a^2 - 2ab + b^2$
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Board
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center z-10">
        
        {/* INTERACTIVE PUZZLE BOARD */}
        <div className="relative w-full lg:w-1/2 h-[500px] bg-[#151414] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center">
          
          <p className="absolute top-4 text-stone-500 text-xs uppercase tracking-widest font-bold">
            Drag the overlapping rectangles away
          </p>

          {/* The Physics Container */}
          <div className="relative" style={{ width: 300, height: 300 }}>
            
            {/* The Base Target (a - b)^2 */}
            <div 
              className="absolute top-0 left-0 bg-rose-600 border-2 border-rose-400 shadow-inner flex items-center justify-center transition-all duration-500"
              style={{ width: aMinusBSize, height: aMinusBSize }}
            >
              <span className="text-rose-200 font-bold font-mono">
                {rect1Removed && rect2Removed ? '(a-b)²' : ''}
              </span>
            </div>

            {/* Ghost Outline of full a^2 */}
            <div 
              className="absolute top-0 left-0 border-2 border-dashed border-stone-700 pointer-events-none transition-all duration-500"
              style={{ width: aSize, height: aSize }}
            />

            {/* Draggable Rect 1 (Vertical: b x a) */}
            <AnimatePresence>
              {!rect1Removed && (
                <motion.div
                  drag
                  dragSnapToOrigin
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 50 || info.offset.y > 50 || info.offset.x < -50 || info.offset.y < -50) {
                      setRect1Removed(true);
                    }
                  }}
                  whileDrag={{ scale: 1.05, opacity: 0.9, zIndex: 50, cursor: 'grabbing' }}
                  exit={{ opacity: 0, scale: 0.8, x: 200, rotate: 10 }}
                  className="absolute top-0 right-0 bg-sky-500/80 backdrop-blur-sm border-2 border-sky-300 flex items-center justify-center cursor-grab mix-blend-screen shadow-lg transition-all duration-500"
                  style={{ width: bSize, height: aSize }}
                >
                  <span className="text-sky-900 font-bold font-mono rotate-90 whitespace-nowrap">Area: ab</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Draggable Rect 2 (Horizontal: a x b) */}
            <AnimatePresence>
              {!rect2Removed && (
                <motion.div
                  drag
                  dragSnapToOrigin
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 50 || info.offset.y > 50 || info.offset.x < -50 || info.offset.y < -50) {
                      setRect2Removed(true);
                    }
                  }}
                  whileDrag={{ scale: 1.05, opacity: 0.9, zIndex: 50, cursor: 'grabbing' }}
                  exit={{ opacity: 0, scale: 0.8, y: 200, rotate: -10 }}
                  className="absolute bottom-0 left-0 bg-amber-500/80 backdrop-blur-sm border-2 border-amber-300 flex items-center justify-center cursor-grab mix-blend-screen shadow-lg transition-all duration-500"
                  style={{ width: aSize, height: bSize }}
                >
                  <span className="text-amber-900 font-bold font-mono">Area: ab</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The "Negative Void" (The double-subtracted corner) */}
            {rect1Removed && rect2Removed && (
              <div 
                className="absolute bottom-0 right-0 border-2 border-rose-500 border-dashed bg-rose-950/50 flex items-center justify-center transition-all duration-500"
                style={{ width: bSize, height: bSize }}
              >
                {!b2Added && (
                  <span className="text-rose-500 font-bold animate-pulse text-xs text-center">
                    Double<br/>Removed!
                  </span>
                )}
              </div>
            )}

            {/* The Restorative b^2 Block */}
            <AnimatePresence>
              {b2Added && (
                <motion.div
                  initial={{ y: -100, opacity: 0, scale: 1.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                  className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center z-20"
                  style={{ width: bSize, height: bSize }}
                >
                  <span className="text-emerald-950 font-bold font-mono">+ b²</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Sliders */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl space-y-6">
            <div>
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mb-2">
                <span className="uppercase tracking-widest font-bold text-rose-400">Total Size (a)</span> 
                <span className="font-bold text-white">{a} units</span>
              </div>
              <input type="range" min="8" max="12" step="1" value={a} onChange={(e) => setA(parseInt(e.target.value))} className="w-full accent-rose-500" />
            </div>
            
            <div>
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mb-2">
                <span className="uppercase tracking-widest font-bold text-sky-400">Cut Size (b)</span> 
                <span className="font-bold text-white">{b} units</span>
              </div>
              <input type="range" min="1" max={a - 2} step="1" value={b} onChange={(e) => setB(parseInt(e.target.value))} className="w-full accent-sky-500" />
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Scissors className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric Proof</h3>
            </div>
            
            <div className="p-6 space-y-4 font-mono text-sm">
              
              <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800">
                <span className="text-stone-400">1. Start with full area:</span>
                <span className="text-rose-400 font-bold text-lg">{`$a^2$`}</span>
              </div>

              <div className={`flex justify-between items-center bg-stone-950 p-3 rounded border ${rect1Removed ? 'border-sky-900' : 'border-stone-800'} transition-colors`}>
                <span className="text-stone-400">2. Subtract vertical rect:</span>
                <span className={`${rect1Removed ? 'text-sky-400' : 'text-stone-600'} font-bold text-lg`}>{`$- ab$`}</span>
              </div>

              <div className={`flex justify-between items-center bg-stone-950 p-3 rounded border ${rect2Removed ? 'border-amber-900' : 'border-stone-800'} transition-colors`}>
                <span className="text-stone-400">3. Subtract horizontal rect:</span>
                <span className={`${rect2Removed ? 'text-amber-400' : 'text-stone-600'} font-bold text-lg`}>{`$- ab$`}</span>
              </div>

              <div className={`flex justify-between items-center bg-stone-950 p-3 rounded border ${b2Added ? 'border-emerald-900 bg-emerald-950/30' : 'border-stone-800'} transition-colors`}>
                <span className="text-stone-400">4. Compensate corner:</span>
                <span className={`${b2Added ? 'text-emerald-400' : 'text-stone-600'} font-bold text-lg`}>{`$+ b^2$`}</span>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <AnimatePresence>
                {b2Added && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-6 border-t border-stone-800"
                  >
                    <p className="text-stone-400 text-xs leading-relaxed font-sans">
                      <strong>The Aha! Moment:</strong> Because the two $ab$ rectangles overlap at the bottom right corner, dragging them both away removes that $b^2$ area <strong>twice</strong>! <br/><br/>
                      To make the math accurate and perfectly isolate the $(a-b)^2$ square, we must add one $b^2$ block back onto the board.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}