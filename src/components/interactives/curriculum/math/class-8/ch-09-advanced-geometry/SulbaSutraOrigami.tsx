'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FoldHorizontal, Info } from 'lucide-react';

export default function SulbaSutraOrigami() {
  const [unfold, setUnfold] = useState<number>(0); // 0 to 100

  // ==================================================================
  // MATH ENGINE: Calculate the SVG Polygon Points
  // ==================================================================
  // The base square is 200x200, centered at (200, 200).
  // Corners: (100,100), (300,100), (300,300), (100,300)
  const progress = unfold / 100;
  
  // The center points of the triangles push outward based on progress.
  // 1 - 2 * progress maps 0->1 to 1->(-1).
  const offset = 100 * (1 - 2 * progress); 
  
  const vTop = 100 + offset;
  const vRight = 300 - offset;
  const vBottom = 300 - offset;
  const vLeft = 100 + offset;

  // Triangle Points
  const topTriangle = `100,100 300,100 200,${vTop}`;
  const rightTriangle = `300,100 300,300 ${vRight},200`;
  const bottomTriangle = `300,300 100,300 200,${vBottom}`;
  const leftTriangle = `100,300 100,100 ${vLeft},200`;

  const isComplete = unfold === 100;

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Śulba-Sūtra Origami
          </h2>
          <p className="text-stone-400 text-sm mt-1">Baudhāyana's elegant proof for doubling the square.</p>
        </div>
      </div>

      {/* THE MAIN CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 z-10 overflow-hidden">
        
        <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto overflow-visible drop-shadow-2xl">
          
          {/* Target Diagonal Square (Dotted Outline) */}
          <polygon 
            points="200,0 400,200 200,400 0,200" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2" 
            strokeDasharray="6 6" 
            className="opacity-30"
          />

          {/* Original Base Square (Ghosted background) */}
          <polygon 
            points="100,100 300,100 300,300 100,300" 
            fill="#292524" 
            stroke="#57534e" 
            strokeWidth="2" 
          />

          {/* The 4 Origami Triangles */}
          <motion.polygon 
            animate={{ points: topTriangle }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            fill="rgba(16, 185, 129, 0.4)"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <motion.polygon 
            animate={{ points: rightTriangle }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            fill="rgba(16, 185, 129, 0.4)"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <motion.polygon 
            animate={{ points: bottomTriangle }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            fill="rgba(16, 185, 129, 0.4)"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <motion.polygon 
            animate={{ points: leftTriangle }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            fill="rgba(16, 185, 129, 0.4)"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Original Diagonal Line Highlight */}
          <line x1="100" y1="300" x2="300" y2="100" stroke="#10b981" strokeWidth="3" className={`transition-opacity duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`} />

          {/* Labels */}
          {isComplete && (
            <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} x="200" y="200" textAnchor="middle" alignmentBaseline="middle" fill="#78716c" fontSize="14" fontWeight="bold" letterSpacing="2">
              ORIGINAL AREA
            </motion.text>
          )}
        </svg>

        {/* AHA! MESSAGE BOX */}
        <div className="absolute bottom-6 w-full max-w-xl px-4 z-50">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div key="complete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl shadow-2xl flex items-start gap-4">
                <Sparkles size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-50 text-sm leading-relaxed">
                  <strong>The Area is Doubled!</strong> This visual explicitly proves, without a single equation, that the new diagonal square is made of 4 identical triangles, while the original square area effectively contained 2. The area has undeniably been doubled.
                </p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/60 backdrop-blur-md border border-stone-700/50 p-4 rounded-xl shadow-lg flex items-start gap-3">
                <Info size={20} className="text-stone-400 shrink-0 mt-0.5" />
                <p className="text-stone-300 text-sm leading-relaxed">
                  The original square is fractured into four internal triangles. Drag the slider to fold them outward like the petals of a flower along the diagonal line.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-6 z-10 shrink-0">
        <div className="w-full bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <FoldHorizontal size={16} className="text-emerald-500" /> Unfold Geometry
            </label>
            <span className="text-sm font-mono font-bold text-white">{unfold}%</span>
          </div>
          <input 
            type="range" min="0" max="100" step="1" 
            value={unfold} 
            onChange={(e) => setUnfold(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-emerald-500"
          />
        </div>
      </div>

    </div>
  );
}