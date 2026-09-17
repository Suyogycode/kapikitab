'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Maximize, Ruler, DraftingCompass as AngleIcon, ScanLine, RotateCcw } from 'lucide-react';

// Base coordinates for the original cardboard shape (ABCD)
const BASE_SHAPE = [
  { id: 'A', x: -40, y: -30, angle: '75°' },
  { id: 'B', x: 50, y: -20, angle: '105°' },
  { id: 'C', x: 30, y: 40, angle: '85°' },
  { id: 'D', x: -30, y: 30, angle: '95°' }
];

// Pre-calculated base side lengths (for UI realism)
const BASE_SIDES = [
  { label: 'AB', val: 92.2 },
  { label: 'BC', val: 63.2 },
  { label: 'CD', val: 60.8 },
  { label: 'DA', val: 60.8 }
];

export default function ProjectionDesk() {
  // Height of the cardboard from the lightbulb (100 = close to bulb, 300 = close to desk)
  const [cardHeight, setCardHeight] = useState<number>(200);
  const deskHeight = 400;

  // The projection scale factor
  const scale = deskHeight / cardHeight;

  // Helper to generate SVG polygon paths
  const getPath = (points: {x: number, y: number}[], scaleFactor: number) => {
    return points.map(p => `${p.x * scaleFactor},${p.y * scaleFactor}`).join(' ');
  };

  const handleReset = () => {
    setCardHeight(200);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <ScanLine className="text-amber-400" /> The Projection Desk
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Defining Similarity: Angles preserve identity, ratios dictate scale.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Desk
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE 3D ROOM) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0c0a09] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 perspective-[1000px]">
          
          <svg viewBox="-250 0 500 500" className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Lightbulb (Origin 0,0) */}
            <g transform="translate(0, 20)">
              <circle cx="0" cy="0" r="15" fill="#fef08a" className="drop-shadow-[0_0_30px_rgba(253,224,71,0.8)]" />
              <path d="M-5,-15 L-5,-30 L5,-30 L5,-15 Z" fill="#78716c" />
            </g>

            {/* Projection Rays (Light to Shadow) */}
            <g opacity="0.15">
              {BASE_SHAPE.map((pt, i) => (
                <line 
                  key={`ray-${i}`}
                  x1="0" y1="20" 
                  x2={pt.x * scale} y2={20 + deskHeight} 
                  stroke="#fef08a" 
                  strokeWidth="2" 
                  strokeDasharray="5 5" 
                />
              ))}
            </g>

            {/* The Desk Surface */}
            <ellipse cx="0" cy={20 + deskHeight} rx="220" ry="60" fill="#292524" className="drop-shadow-2xl" />

            {/* The Projected Shadow (A'B'C'D') */}
            <g transform={`translate(0, ${20 + deskHeight})`}>
              <polygon 
                points={getPath(BASE_SHAPE, scale)} 
                fill="#000000" 
                opacity="0.4"
                stroke="#a8a29e"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="transition-all duration-75"
              />
              {/* Shadow Labels */}
              {BASE_SHAPE.map((pt) => (
                <text 
                  key={`shadow-lbl-${pt.id}`}
                  x={pt.x * scale * 1.15} 
                  y={pt.y * scale * 1.15} 
                  fill="#a8a29e" 
                  fontSize="14" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  className="font-serif transition-all duration-75"
                >
                  {pt.id}'
                </text>
              ))}
            </g>

            {/* The Cardboard Shape (ABCD) */}
            <g transform={`translate(0, ${20 + cardHeight})`} className="transition-all duration-75">
              <polygon 
                points={getPath(BASE_SHAPE, 1)} 
                fill="#c2410c" 
                stroke="#fdba74" 
                strokeWidth="3"
                className="drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]"
              />
              {/* Cardboard Labels */}
              {BASE_SHAPE.map((pt) => (
                <text 
                  key={`card-lbl-${pt.id}`}
                  x={pt.x * 1.3} 
                  y={pt.y * 1.3 + 5} 
                  fill="#fdba74" 
                  fontSize="14" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  className="font-serif"
                >
                  {pt.id}
                </text>
              ))}
            </g>

          </svg>

          {/* Elevation Slider Overlay */}
          <div className="absolute left-6 top-1/4 bottom-1/4 w-12 bg-stone-900/80 border border-stone-800 rounded-full backdrop-blur-sm flex flex-col items-center py-4 gap-4 shadow-xl z-20">
            <span className="text-amber-500 font-bold text-[10px] uppercase tracking-widest -rotate-90 mt-4">Card</span>
            <input 
              type="range" 
              min="80" 
              max="350" 
              step="5"
              value={cardHeight}
              onChange={(e) => setCardHeight(Number(e.target.value))}
              className="flex-1 w-2 appearance-none bg-stone-700 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            />
            <span className="text-stone-500 font-bold text-[10px] uppercase tracking-widest -rotate-90 mb-4">Desk</span>
          </div>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Geometrics Monitor */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Ruler className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric DNA</h3>
            </div>
            
            <div className="p-6 space-y-6 flex flex-col h-full bg-[#1c1917]">
              
              {/* Angles Panel */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-stone-500 uppercase tracking-widest text-[10px] font-bold">
                  <AngleIcon size={14} /> Angles (Rigid & Locked)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BASE_SHAPE.map((pt) => (
                    <div key={`angle-${pt.id}`} className="bg-stone-900 border border-stone-800 p-2 rounded-lg flex justify-between items-center font-mono">
                      <span className="text-stone-400 text-sm">∠{pt.id} = ∠{pt.id}'</span>
                      <span className="text-white font-bold">{pt.angle}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sides & Scale Panel */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-stone-500 uppercase tracking-widest text-[10px] font-bold">
                  <Maximize size={14} /> Corresponding Sides Ratio
                </div>
                
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center font-mono font-bold text-lg">
                    <span className="text-sky-400">Scale Factor (k)</span>
                    <span className="text-white bg-sky-950 px-3 py-1 rounded-lg border border-sky-900">
                      {scale.toFixed(2)}x
                    </span>
                  </div>

                  <div className="w-full h-px bg-stone-800"></div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-sm">
                    {BASE_SIDES.map((side) => {
                      const scaledVal = (side.val * scale).toFixed(1);
                      return (
                        <div key={`ratio-${side.label}`} className="flex flex-col items-center gap-1 bg-stone-950 p-2 rounded-lg border border-stone-800">
                          <div className="flex flex-col items-center text-stone-300">
                            <span className="border-b border-stone-700 pb-1 text-emerald-400">{side.label}' ({scaledVal})</span>
                            <span className="pt-1">{side.label} ({side.val})</span>
                          </div>
                          <div className="text-xs font-bold text-sky-400 mt-1">= {scale.toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                    <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-stone-300 font-sans text-xs leading-relaxed">
                      Move the cardboard up and down! The shadow shrinks and grows, but its <strong className="text-white">angles never change</strong>. <br/><br/>
                      Furthermore, every single side scales up by the <strong className="text-sky-400">exact same ratio (k)</strong>. This guarantees the shape never distorts. <strong className="text-emerald-400">This is the definition of Similarity.</strong>
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}