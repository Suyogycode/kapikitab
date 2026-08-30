'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, RotateCcw, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

// A helper component for the pieces that get sliced off and fall away
function FallingSlice({ height, label, delay = 0 }: { height: number, label: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: 150, rotate: Math.random() * 20 - 10 }}
      transition={{ duration: 1, delay: delay, ease: "easeIn" }}
      className="absolute top-0 w-full bg-stone-700 border-2 border-stone-500 rounded-t-xl flex items-center justify-center opacity-50 z-0"
      style={{ height: `${height}%`, originY: 1 }}
    >
      <span className="text-stone-400 font-mono text-sm line-through">₹{label}</span>
    </motion.div>
  );
}

export default function TheSlicer() {
  const START_PRICE = 200;

  // States for Left Side (Flat 50%)
  const [leftPhase, setLeftPhase] = useState<'idle' | 'slicing' | 'done'>('idle');
  const [leftPrice, setLeftPrice] = useState<number>(START_PRICE);

  // States for Right Side (Successive 30% + 20%)
  const [rightPhase, setRightPhase] = useState<'idle' | 'slice1' | 'pause' | 'slice2' | 'done'>('idle');
  const [rightPrice, setRightPrice] = useState<number>(START_PRICE);

  // ==================================================================
  // LEFT ENGINE: Flat Discount
  // ==================================================================
  const handleLeftSlice = () => {
    if (leftPhase !== 'idle') return;
    setLeftPhase('slicing');
    
    // Slight delay for the laser effect
    setTimeout(() => {
      setLeftPrice(START_PRICE * 0.5); // ₹100
      setLeftPhase('done');
    }, 400);
  };

  // ==================================================================
  // RIGHT ENGINE: Successive Discount State Machine
  // ==================================================================
  useEffect(() => {
    if (rightPhase === 'slice1') {
      const timer1 = setTimeout(() => {
        setRightPrice(START_PRICE * 0.7); // ₹140 (30% off 200 = 60)
        setRightPhase('pause');
      }, 400);
      return () => clearTimeout(timer1);
    }
    
    if (rightPhase === 'pause') {
      const timer2 = setTimeout(() => {
        setRightPhase('slice2');
      }, 1500); // Pause so the student sees the new smaller block
      return () => clearTimeout(timer2);
    }

    if (rightPhase === 'slice2') {
      const timer3 = setTimeout(() => {
        // 20% off the NEW price (140) = 28. 140 - 28 = 112.
        setRightPrice((START_PRICE * 0.7) * 0.8); 
        setRightPhase('done');
      }, 400);
      return () => clearTimeout(timer3);
    }
  }, [rightPhase]);

  const handleRightSlice = () => {
    if (rightPhase !== 'idle') return;
    setRightPhase('slice1');
  };

  const handleReset = () => {
    setLeftPhase('idle');
    setRightPhase('idle');
    setLeftPrice(START_PRICE);
    setRightPrice(START_PRICE);
  };

  // Height calculations (Percentage of the 300px container)
  const leftHeightPercent = (leftPrice / START_PRICE) * 100;
  const rightHeightPercent = (rightPrice / START_PRICE) * 100;

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Slicer
          </h2>
          <p className="text-stone-400 text-sm mt-1">Successive Discounts vs. Flat Discounts</p>
        </div>
        {(leftPhase === 'done' || rightPhase === 'done') && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2 border border-stone-600"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* THE MAIN SPLIT CANVAS */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 mb-6 z-10">
        
        {/* LEFT: Flat Discount (Cakify) */}
        <div className="flex-1 bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-end pb-12 pt-6 px-6">
          <div className="absolute top-4 left-4 text-stone-500 font-bold uppercase tracking-widest text-xs">
            Store A: Flat Discount
          </div>

          {/* The Price Tag Block */}
          <div className="relative w-32 sm:w-40 h-[300px] flex items-end justify-center mt-8">
            
            {/* The Cut Piece Animation */}
            {leftPhase !== 'idle' && (
              <FallingSlice height={50} label="100" delay={0.2} />
            )}

            {/* The Main Remaining Block */}
            <motion.div 
              className="w-full bg-stone-800 border-x-4 border-t-4 border-b-8 border-stone-600 rounded-t-md shadow-2xl flex flex-col items-center justify-start pt-4 relative z-10 overflow-hidden"
              animate={{ height: `${leftHeightPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Laser Line Effect */}
              <AnimatePresence>
                {leftPhase === 'slicing' && (
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.5 }}
                    className="absolute top-0 w-[150%] h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]"
                  />
                )}
              </AnimatePresence>
              
              <span className={`font-mono font-bold transition-colors ${leftPhase === 'done' ? 'text-3xl text-emerald-400' : 'text-2xl text-stone-300'}`}>
                ₹{leftPrice}
              </span>
            </motion.div>
          </div>

          <button 
            onClick={handleLeftSlice}
            disabled={leftPhase !== 'idle'}
            className="mt-8 w-full max-w-[200px] px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            {leftPhase === 'done' ? <><CheckCircle2 size={18} /> Flat 50% Off</> : <><Scissors size={18} /> Slice 50%</>}
          </button>
        </div>

        {/* RIGHT: Successive Discount (Cakely) */}
        <div className="flex-1 bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-end pb-12 pt-6 px-6">
          <div className="absolute top-4 left-4 text-stone-500 font-bold uppercase tracking-widest text-xs">
            Store B: Successive Discount
          </div>

          {/* The Price Tag Block */}
          <div className="relative w-32 sm:w-40 h-[300px] flex items-end justify-center mt-8">
            
            {/* Cut Piece 1 (30%) */}
            {rightPhase !== 'idle' && (
              <FallingSlice height={30} label="60" delay={0.2} />
            )}

            {/* Cut Piece 2 (20% of the remaining 70% = 14%) */}
            {(rightPhase === 'slice2' || rightPhase === 'done') && (
              <FallingSlice height={14} label="28" delay={0.2} />
            )}

            {/* The Main Remaining Block */}
            <motion.div 
              className="w-full bg-stone-800 border-x-4 border-t-4 border-b-8 border-stone-600 rounded-t-md shadow-2xl flex flex-col items-center justify-start pt-4 relative z-10 overflow-hidden"
              animate={{ height: `${rightHeightPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Laser Line Effect 1 */}
              <AnimatePresence>
                {rightPhase === 'slice1' && (
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.5 }}
                    className="absolute top-0 w-[150%] h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]"
                  />
                )}
              </AnimatePresence>

              {/* Laser Line Effect 2 */}
              <AnimatePresence>
                {rightPhase === 'slice2' && (
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.5 }}
                    className="absolute top-0 w-[150%] h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]"
                  />
                )}
              </AnimatePresence>

              <span className={`font-mono font-bold transition-colors ${rightPhase === 'done' ? 'text-3xl text-rose-400' : rightPhase === 'pause' ? 'text-2xl text-amber-400' : 'text-2xl text-stone-300'}`}>
                ₹{rightPrice}
              </span>
            </motion.div>
          </div>

          <button 
            onClick={handleRightSlice}
            disabled={rightPhase !== 'idle'}
            className="mt-8 w-full max-w-[200px] px-6 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            {rightPhase === 'done' ? <><CheckCircle2 size={18} /> 30% + 20% Off</> : <><Scissors size={18} /> Slice 30% + 20%</>}
          </button>
        </div>

      </div>

      {/* AHA! MESSAGE BOX */}
      <div className="z-10 shrink-0 min-h-[100px]">
        <AnimatePresence mode="wait">
          {rightPhase === 'pause' && (
            <motion.div key="pause" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-amber-950/40 border border-amber-900/50 p-4 rounded-xl flex items-start gap-3 shadow-lg">
              <Zap size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                <strong>Wait! Look closely.</strong> The first 30% slice removed ₹60. The remaining block is now smaller (₹140). The laser is recalculating for the next slice...
              </p>
            </motion.div>
          )}
          
          {(leftPhase === 'done' && rightPhase === 'done') && (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-stone-900 border border-stone-700 p-4 rounded-xl flex items-start gap-3 shadow-lg">
              <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                <strong>The Illusion Shattered:</strong> A successive 20% discount is applied to the <em>already reduced</em> ₹140 tag. 20% of ₹140 is only ₹28! Therefore, a <span className="text-amber-400 font-bold">30% + 20%</span> discount (Final Price ₹112) is inherently worse for the buyer than a flat <span className="text-emerald-400 font-bold">50%</span> discount (Final Price ₹100).
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}