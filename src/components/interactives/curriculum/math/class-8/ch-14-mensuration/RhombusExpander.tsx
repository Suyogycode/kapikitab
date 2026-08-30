'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, RotateCcw, Lightbulb, BoxSelect, CheckCircle2 } from 'lucide-react';

export default function RhombusExpander() {
  const [phase, setPhase] = useState<'idle' | 'scattered' | 'assembled'>('idle');
  
  // Placement states for the 4 triangular pieces
  const [placed, setPlaced] = useState({
    t1: false,
    t2: false,
    t3: false,
    t4: false,
  });

  // Check if all pieces are placed to trigger the Aha! moment
  useEffect(() => {
    if (placed.t1 && placed.t2 && placed.t3 && placed.t4) {
      setPhase('assembled');
    }
  }, [placed]);

  const handleUnpack = () => {
    setPhase('scattered');
    setPlaced({ t1: false, t2: false, t3: false, t4: false });
  };

  const handleReset = () => {
    setPhase('idle');
    setPlaced({ t1: false, t2: false, t3: false, t4: false });
  };

  // ==================================================================
  // GEOMETRY & ANIMATION DATA
  // ==================================================================
  // SVG ViewBox is 600x400. Center is 300, 200.
  // Rhombus: d1 (width) = 300, d2 (height) = 200.

  const pieces = [
    {
      id: 't1',
      name: 'Top-Left',
      path: "M 300,200 L 150,200 L 300,100 Z",
      color: "rgba(16, 185, 129, 0.9)", // Emerald 500
      scatterPos: { x: -60, y: -60 },
      targetPos: { x: 0, y: 0 }, // Stays in place for the rectangle
    },
    {
      id: 't2',
      name: 'Top-Right',
      path: "M 300,200 L 300,100 L 450,200 Z",
      color: "rgba(52, 211, 153, 0.9)", // Emerald 400
      scatterPos: { x: 60, y: -60 },
      targetPos: { x: 0, y: 0 }, // Stays in place for the rectangle
    },
    {
      id: 't3',
      name: 'Bottom-Left',
      path: "M 300,200 L 150,200 L 300,300 Z",
      color: "rgba(5, 150, 105, 0.9)", // Emerald 600
      scatterPos: { x: -60, y: 60 },
      targetPos: { x: 150, y: -100 }, // Moves to Top-Right to fill the gap
    },
    {
      id: 't4',
      name: 'Bottom-Right',
      path: "M 300,200 L 450,200 L 300,300 Z",
      color: "rgba(110, 231, 183, 0.9)", // Emerald 300
      scatterPos: { x: 60, y: 60 },
      targetPos: { x: -150, y: -100 }, // Moves to Top-Left to fill the gap
    }
  ];

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Rhombus Expander
          </h2>
          <p className="text-stone-400 text-sm mt-1">Transforming Diagonals into Area.</p>
        </div>
      </div>

      {/* THE MAIN INTERACTIVE CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 z-10 overflow-hidden">
        
        <div className="relative w-full max-w-3xl aspect-[3/2] border border-stone-700/50 rounded-xl bg-stone-900/40 shadow-2xl flex items-center justify-center overflow-hidden">
          
          <svg viewBox="0 0 600 400" className="w-full h-full overflow-visible">
            
            {/* Ghost Outline of the Target Rectangle */}
            <AnimatePresence>
              {phase !== 'idle' && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <rect 
                    x="150" y="100" width="300" height="100" 
                    fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 8" opacity="0.4"
                  />
                  {/* Rectangle Dimensions Labels */}
                  <text x="300" y="90" fill="#a8a29e" fontSize="14" fontWeight="bold" textAnchor="middle" letterSpacing="2">
                    WIDTH = d₁
                  </text>
                  <text x="465" y="155" fill="#a8a29e" fontSize="14" fontWeight="bold" alignmentBaseline="middle" letterSpacing="1">
                    HEIGHT = d₂ / 2
                  </text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Original Rhombus Diagonals (Visible only in Idle) */}
            <AnimatePresence>
              {phase === 'idle' && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Horizontal Diagonal d1 */}
                  <line x1="150" y1="200" x2="450" y2="200" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6" />
                  <text x="300" y="190" fill="#f59e0b" fontSize="14" fontWeight="bold" textAnchor="middle">d₁</text>
                  
                  {/* Vertical Diagonal d2 */}
                  <line x1="300" y1="100" x2="300" y2="300" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 6" />
                  <text x="310" y="250" fill="#3b82f6" fontSize="14" fontWeight="bold">d₂</text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* The 4 Draggable Triangular Pieces */}
            {pieces.map((piece) => {
              const isPlaced = placed[piece.id as keyof typeof placed];
              
              // Determine current animation target based on state
              let targetTransform = { x: 0, y: 0 };
              if (phase === 'scattered') {
                targetTransform = isPlaced ? piece.targetPos : piece.scatterPos;
              } else if (phase === 'assembled') {
                targetTransform = piece.targetPos;
              }

              return (
                <motion.g
                  key={piece.id}
                  animate={targetTransform}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  drag={phase === 'scattered' && !isPlaced}
                  dragSnapToOrigin={true}
                  onDragEnd={() => {
                    if (phase === 'scattered') {
                      // Magnetic Snap: Any release auto-locks the piece into the correct rectangle slot
                      setPlaced(prev => ({ ...prev, [piece.id]: true }));
                    }
                  }}
                  className={phase === 'scattered' && !isPlaced ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                  whileHover={phase === 'scattered' && !isPlaced ? { scale: 1.05, filter: "brightness(1.2)" } : {}}
                  whileDrag={{ scale: 1.1, filter: "brightness(1.4)", zIndex: 50 }}
                >
                  <path 
                    d={piece.path} 
                    fill={piece.color} 
                    stroke="#022c22" 
                    strokeWidth="2" 
                    strokeLinejoin="round"
                    className="drop-shadow-lg"
                  />
                </motion.g>
              );
            })}

          </svg>
        </div>

        {/* AHA! MESSAGE BOX */}
        <div className="absolute bottom-6 w-full max-w-3xl px-4 z-50">
          <AnimatePresence mode="wait">
            {phase === 'assembled' ? (
              <motion.div key="aha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl shadow-2xl flex items-start gap-4">
                <Lightbulb size={28} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-50 text-sm leading-relaxed mb-2">
                    <strong>The Perfect Fit:</strong> The two bottom triangles shift upward to fill the empty corners, transforming the rhombus into a solid rectangle! The area is identical, but the rectangle is much easier to measure.
                  </p>
                  <div className="bg-stone-950 border border-emerald-900 p-3 rounded-lg inline-block font-mono text-emerald-400">
                    Area = Width × Height <span className="text-stone-500 mx-2">→</span> Area = d₁ × (d₂ / 2)
                  </div>
                </div>
              </motion.div>
            ) : phase === 'scattered' ? (
              <motion.div key="scattered" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/60 backdrop-blur-md border border-stone-700/50 p-4 rounded-xl shadow-lg flex items-center justify-center gap-3">
                <BoxSelect size={20} className="text-emerald-500 shrink-0" />
                <p className="text-stone-300 text-sm">
                  Drag the scattered triangles toward the ghostly outline. They will magnetically snap into place.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex justify-center z-10 shrink-0 h-16">
        {phase === 'idle' && (
          <button 
            onClick={handleUnpack}
            className="px-10 h-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Maximize size={18} /> 1. Unpack Rhombus
          </button>
        )}
        
        {phase === 'scattered' && (
          <div className="px-10 h-full bg-stone-900 border border-stone-700 text-stone-400 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg">
            Assemble the Rectangle
          </div>
        )}

        {phase === 'assembled' && (
          <button 
            onClick={handleReset}
            className="px-10 h-full bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <RotateCcw size={18} /> Reset Puzzle
          </button>
        )}
      </div>

    </div>
  );
}