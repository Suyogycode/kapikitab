'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Grid, Square, RotateCcw, Info } from 'lucide-react';

export default function DynamicAreaMap() {
  const [mode, setMode] = useState<'add' | 'sub'>('add');
  const [bRatio, setBRatio] = useState<number>(0.3); // Represents 'b' as a percentage of the total side (0.2 to 0.5)
  const [proofStep, setProofStep] = useState<number>(0);

  // aRatio is the remaining percentage
  const aRatio = 1 - bRatio;

  const handleModeSwitch = (newMode: 'add' | 'sub') => {
    setMode(newMode);
    setProofStep(0);
  };

  const nextProofStep = () => {
    setProofStep((prev) => (prev + 1) % 5);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Dynamic Area Map
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing <span className="font-mono text-emerald-400">(a + b)²</span> and <span className="font-mono text-rose-400">(a - b)²</span>
          </p>
        </div>
      </div>

      {/* THE MAIN CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 z-10 overflow-hidden">
        
        {/* The Interactive Square Container */}
        <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-square bg-stone-900 border-2 border-stone-700 rounded-lg shadow-2xl">
          
          {/* Top-Left Quadrant: a^2 (or (a-b)^2 in sub mode) */}
          <motion.div
            layout
            className={`absolute top-0 left-0 border-r-2 border-b-2 border-stone-900 flex items-center justify-center overflow-hidden
              ${mode === 'add' ? 'bg-emerald-900/80' : 'bg-emerald-900/80'}`}
            style={{ width: `${aRatio * 100}%`, height: `${aRatio * 100}%` }}
          >
            <span className="text-xl sm:text-2xl font-mono font-bold text-white opacity-80">
              {mode === 'add' ? 'a²' : '(a - b)²'}
            </span>
          </motion.div>

          {/* Top-Right Quadrant: ab (or b(a-b) in sub mode) */}
          <motion.div
            layout
            className={`absolute top-0 right-0 border-l-2 border-b-2 border-stone-900 flex items-center justify-center overflow-hidden
              ${mode === 'add' ? 'bg-indigo-900/80' : 'bg-stone-800/80'}`}
            style={{ width: `${bRatio * 100}%`, height: `${aRatio * 100}%` }}
          >
            <span className="text-lg font-mono font-bold text-white opacity-60">
              {mode === 'add' ? 'ab' : 'b(a-b)'}
            </span>
          </motion.div>

          {/* Bottom-Left Quadrant: ab (or b(a-b) in sub mode) */}
          <motion.div
            layout
            className={`absolute bottom-0 left-0 border-r-2 border-t-2 border-stone-900 flex items-center justify-center overflow-hidden
              ${mode === 'add' ? 'bg-indigo-900/80' : 'bg-stone-800/80'}`}
            style={{ width: `${aRatio * 100}%`, height: `${bRatio * 100}%` }}
          >
            <span className="text-lg font-mono font-bold text-white opacity-60">
              {mode === 'add' ? 'ab' : 'b(a-b)'}
            </span>
          </motion.div>

          {/* Bottom-Right Quadrant: b^2 */}
          <motion.div
            layout
            className={`absolute bottom-0 right-0 border-l-2 border-t-2 border-stone-900 flex items-center justify-center overflow-hidden
              ${mode === 'add' ? 'bg-amber-700/80' : 'bg-rose-900/80'}`}
            style={{ width: `${bRatio * 100}%`, height: `${bRatio * 100}%` }}
          >
            <span className="text-lg font-mono font-bold text-white opacity-80">b²</span>
          </motion.div>

          {/* PROOF ANIMATION OVERLAYS (Only active in Subtraction Mode) */}
          <AnimatePresence>
            {mode === 'sub' && proofStep > 0 && (
              <>
                {/* Step 1: The Whole Square a^2 */}
                {(proofStep === 1) && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-stone-700/50 border-4 border-stone-400 flex items-center justify-center backdrop-blur-sm z-20"
                  >
                    <span className="text-4xl font-mono font-bold text-white drop-shadow-lg">a²</span>
                  </motion.div>
                )}

                {/* Step 2: Subtract Right Strip (ab) */}
                {(proofStep >= 2 && proofStep <= 3) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-0 right-0 h-full bg-red-600/60 border-2 border-red-400 flex items-center justify-center z-30 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                    style={{ width: `${bRatio * 100}%` }}
                  >
                    <span className="text-xl font-mono font-bold text-white rotate-90">- ab</span>
                  </motion.div>
                )}

                {/* Step 3: Subtract Bottom Strip (ab) */}
                {(proofStep === 3) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 w-full bg-red-600/60 border-2 border-red-400 flex items-center justify-center z-40 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                    style={{ height: `${bRatio * 100}%` }}
                  >
                    <span className="text-xl font-mono font-bold text-white">- ab</span>
                  </motion.div>
                )}

                {/* Step 4: Add back the overlap (b^2) */}
                {(proofStep === 4) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute bottom-0 right-0 bg-emerald-500/80 border-4 border-emerald-300 flex items-center justify-center z-50 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
                    style={{ width: `${bRatio * 100}%`, height: `${bRatio * 100}%` }}
                  >
                    <span className="text-xl font-mono font-bold text-white">+ b²</span>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Outer Labels */}
          <div className="absolute -top-6 left-0 w-full flex justify-between px-2 text-stone-500 font-mono text-xs font-bold">
            <span style={{ width: `${aRatio * 100}%` }} className="text-center">{mode === 'add' ? 'a' : 'a - b'}</span>
            <span style={{ width: `${bRatio * 100}%` }} className="text-center">b</span>
          </div>
          <div className="absolute top-0 -left-8 h-full flex flex-col justify-between py-2 text-stone-500 font-mono text-xs font-bold">
            <span style={{ height: `${aRatio * 100}%` }} className="flex items-center justify-center -rotate-90">{mode === 'add' ? 'a' : 'a - b'}</span>
            <span style={{ height: `${bRatio * 100}%` }} className="flex items-center justify-center -rotate-90">b</span>
          </div>
        </div>

        {/* AHA! MESSAGE BOX */}
        <div className="absolute bottom-6 w-full max-w-xl px-4 z-50">
          <AnimatePresence mode="wait">
            {mode === 'add' ? (
              <motion.div key="add-msg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl flex items-start gap-3">
                <Info size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-stone-300 text-sm leading-relaxed">
                  The area of the entire square is <span className="font-mono text-emerald-300">(a + b)²</span>. As you slide the crosshairs, you can see it is always equal to the sum of its four pieces: <span className="font-mono text-white">a² + ab + ab + b²</span>.
                </p>
              </motion.div>
            ) : (
              <motion.div key={`sub-msg-${proofStep}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/80 backdrop-blur-md border border-red-900/50 p-4 rounded-xl shadow-2xl flex items-start gap-3">
                <Info size={20} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-stone-300 text-sm leading-relaxed">
                  {proofStep === 0 && "We want to find the area of the green square: (a - b)². Click 'Play Proof' to see how the formula works."}
                  {proofStep === 1 && "Start with the entire big square, which has an area of a²."}
                  {proofStep === 2 && "Subtract a vertical rectangle of area ab from the right side (-ab)."}
                  {proofStep === 3 && "Subtract a horizontal rectangle of area ab from the bottom (-ab). But wait... look at the bottom-right corner!"}
                  {proofStep === 4 && "The corner piece (b²) was subtracted TWICE where the red strips overlapped. We have to add one back (+b²) to fix the equation!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 z-10 shrink-0">
        
        {/* Mode Toggle */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-2 flex bg-stone-950/50 relative">
          <div className="absolute inset-0 flex" aria-hidden="true">
            <motion.div 
              className="w-1/2 h-full bg-stone-800 rounded-lg border border-stone-600 shadow-sm"
              animate={{ x: mode === 'add' ? 0 : '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>
          <button 
            onClick={() => handleModeSwitch('add')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg relative z-10 font-bold uppercase tracking-widest text-xs transition-colors ${mode === 'add' ? 'text-emerald-400' : 'text-stone-500'}`}
          >
            <Grid size={16} /> (a + b)²
          </button>
          <button 
            onClick={() => handleModeSwitch('sub')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg relative z-10 font-bold uppercase tracking-widest text-xs transition-colors ${mode === 'sub' ? 'text-rose-400' : 'text-stone-500'}`}
          >
            <Square size={16} /> (a - b)²
          </button>
        </div>

        {/* Crosshair Slider */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-center">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center justify-between mb-3">
            <span>Adjust Split Ratio (b)</span>
          </label>
          <input 
            type="range" 
            min="0.15" max="0.5" step="0.01" 
            value={bRatio} 
            onChange={(e) => { setBRatio(parseFloat(e.target.value)); setProofStep(0); }}
            disabled={mode === 'sub' && proofStep > 0}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
          />
        </div>

        {/* Proof Controls (Only in Sub mode) */}
        {mode === 'sub' ? (
           <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4 flex flex-col justify-center">
             <button 
                onClick={proofStep === 4 ? () => setProofStep(0) : nextProofStep}
                className="w-full bg-rose-900 hover:bg-rose-800 text-rose-100 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
             >
                {proofStep === 0 ? <><Play size={16} /> Play Proof</> : proofStep === 4 ? <><RotateCcw size={16} /> Reset</> : <><Play size={16} /> Next Step</>}
             </button>
             {proofStep > 0 && (
                <div className="flex gap-1 mt-3 px-2">
                  {[1,2,3,4].map(step => (
                    <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= proofStep ? 'bg-rose-500' : 'bg-stone-800'}`} />
                  ))}
                </div>
             )}
           </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-50">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Live Algebraic Equation
            </span>
            <span className="text-emerald-400 font-mono mt-1">
              (a+b)² = a² + 2ab + b²
            </span>
          </div>
        )}

      </div>
    </div>
  );
}