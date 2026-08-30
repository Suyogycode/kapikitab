'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, MoveRight, CheckCircle2, DraftingCompass, Sparkles } from 'lucide-react';

export default function DissectionTable() {
  const [laserPos, setLaserPos] = useState<number>(0); // 0 to 100
  const [phase, setPhase] = useState<'idle' | 'ready' | 'dissected'>('idle');

  // SVG Coordinates for the Parallelogram
  // Base width = 200, Height = 100, Shift = 50
  // Top-Left (A), Top-Right (B), Bottom-Right (C), Bottom-Left (D), Cut-Point (X)
  // A=(100, 100), B=(300, 100), C=(250, 200), D=(50, 200), X=(100, 200)
  
  const mainBodyPoints = "100,100 300,100 250,200 100,200";
  const trianglePoints = "100,100 50,200 100,200";

  // Handle laser movement
  const handleLaserChange = (val: number) => {
    setLaserPos(val);
    if (val === 100) {
      setPhase('ready');
    } else {
      setPhase('idle');
    }
  };

  const handleDissect = () => {
    if (phase === 'ready') {
      setPhase('dissected');
    }
  };

  const handleReset = () => {
    setPhase('idle');
    setLaserPos(0);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Dissection Table
          </h2>
          <p className="text-stone-400 text-sm mt-1">Transforming a Parallelogram into a Rectangle.</p>
        </div>
      </div>

      {/* THE MAIN DRAFTING CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 z-10 overflow-hidden">
        
        {/* The Digital Drafting Board */}
        <div className="relative w-full max-w-2xl aspect-[2/1] border-2 border-stone-700/30 rounded-xl bg-stone-900/50 overflow-hidden flex items-center justify-center shadow-2xl">
          
          {/* Blueprint Grid Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />

          {/* The Geometry SVG */}
          <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            
            {/* Outline of the Target Rectangle (Visible during Dissection) */}
            <AnimatePresence>
              {phase === 'dissected' && (
                <motion.rect 
                  initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                  x="100" y="100" width="200" height="100" 
                  fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="8 8"
                />
              )}
            </AnimatePresence>

            {/* The Main Body (Trapezoid part of the Parallelogram) */}
            <polygon 
              points={mainBodyPoints}
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#34d399"
              strokeWidth="2"
              className="transition-colors duration-500"
              style={{ fill: phase === 'dissected' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)' }}
            />

            {/* The Detachable Triangle */}
            <motion.polygon 
              points={trianglePoints}
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#34d399"
              strokeWidth="2"
              animate={{ 
                x: phase === 'dissected' ? 200 : 0,
                fill: phase === 'dissected' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)'
              }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />

            {/* Laser Line Marker (Height) */}
            {phase !== 'dissected' && (
              <motion.line 
                x1={laserPos} y1="80" x2={laserPos} y2="220"
                stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"
                className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              />
            )}

            {/* Labels */}
            <text x="200" y="230" fill="#a8a29e" fontSize="12" fontWeight="bold" textAnchor="middle" letterSpacing="2">BASE</text>
            
            {phase === 'ready' && (
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} x="80" y="150" fill="#ef4444" fontSize="12" fontWeight="bold" transform="rotate(-90 80 150)" textAnchor="middle">
                HEIGHT
              </motion.text>
            )}
            {phase === 'dissected' && (
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} x="80" y="150" fill="#10b981" fontSize="12" fontWeight="bold" transform="rotate(-90 80 150)" textAnchor="middle">
                HEIGHT
              </motion.text>
            )}
          </svg>

        </div>

        {/* AHA! MESSAGE BOX */}
        <div className="absolute bottom-6 w-full max-w-2xl px-4 z-50">
          <AnimatePresence mode="wait">
            {phase === 'dissected' ? (
              <motion.div key="aha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl shadow-2xl flex items-start gap-4">
                <Sparkles size={28} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-50 text-sm leading-relaxed mb-2">
                    <strong>The Transformation:</strong> By slicing off the overhanging triangle and moving it to fill the empty space on the right, the parallelogram perfectly morphs into a rectangle!
                  </p>
                  <div className="bg-stone-950 border border-emerald-900 p-2 rounded-lg inline-block font-mono text-emerald-400">
                    Area = base × height
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/60 backdrop-blur-md border border-stone-700/50 p-4 rounded-xl shadow-lg flex items-center gap-3">
                <DraftingCompass size={20} className="text-stone-400 shrink-0" />
                <p className="text-stone-300 text-sm">
                  Slide the red laser to the left vertex (100) to isolate the altitude (height).
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 z-10 shrink-0">
        
        {/* Laser Slider */}
        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Scissors size={16} className={phase === 'ready' ? "text-rose-500" : "text-stone-500"} /> Laser Position
            </label>
            <span className="text-sm font-mono font-bold text-white">x: {laserPos}</span>
          </div>
          <input 
            type="range" min="0" max="100" step="1" 
            value={laserPos} 
            onChange={(e) => handleLaserChange(parseInt(e.target.value))}
            disabled={phase === 'dissected'}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-rose-500 disabled:opacity-50"
          />
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-48 flex items-stretch">
          {phase === 'idle' && (
            <button disabled className="w-full h-full bg-stone-800 text-stone-600 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              Align Laser
            </button>
          )}
          {phase === 'ready' && (
            <button 
              onClick={handleDissect}
              className="w-full h-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)]"
            >
              <MoveRight size={18} /> Dissect & Move
            </button>
          )}
          {phase === 'dissected' && (
            <button 
              onClick={handleReset}
              className="w-full h-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              <CheckCircle2 size={18} /> Reset Table
            </button>
          )}
        </div>

      </div>
    </div>
  );
}