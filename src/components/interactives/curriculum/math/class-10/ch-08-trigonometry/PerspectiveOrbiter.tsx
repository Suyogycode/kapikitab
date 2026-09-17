'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Target, RotateCcw, BoxSelect, ScanEye } from 'lucide-react';

export default function PerspectiveOrbiter() {
  // State: Which vertex is the current Reference Eye?
  const [refAngle, setRefAngle] = useState<'A' | 'C'>('A');

  // Triangle SVG Coordinates (3-4-5 Triangle scaled by 100)
  const A = { x: 150, y: 100, label: 'A' };
  const B = { x: 150, y: 400, label: 'B' };
  const C = { x: 550, y: 400, label: 'C' };

  // Triangle Lengths (Clean integer math for the HUD)
  const lenAB = 3;
  const lenBC = 4;
  const lenAC = 5;

  // Derived Trigonometric Values based on active perspective
  const opposite = refAngle === 'A' ? lenBC : lenAB;
  const adjacent = refAngle === 'A' ? lenAB : lenBC;
  
  const oppositeLine = refAngle === 'A' ? 'BC' : 'AB';
  const adjacentLine = refAngle === 'A' ? 'AB' : 'BC';

  const handleReset = () => {
    setRefAngle('A');
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#09090b] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <ScanEye className="text-emerald-500" /> The Perspective Orbiter
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Defining Trigonometric Ratios: Everything depends on your point of view.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Orbiter
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (3D NEON TRIANGLE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-tr from-[#171717] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6">
          
          <svg viewBox="0 0 700 500" className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#262626" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Hypotenuse AC (Solid Metallic Bar) */}
            <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#d6d3d1" strokeWidth="8" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(214,211,209,0.5)]" />
            
            {/* Leg AB */}
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#404040" strokeWidth="6" strokeLinecap="round" />
            
            {/* Leg BC */}
            <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#404040" strokeWidth="6" strokeLinecap="round" />

            {/* Right Angle Indicator at B */}
            <path d={`M ${B.x} ${B.y - 30} L ${B.x + 30} ${B.y - 30} L ${B.x + 30} ${B.y}`} fill="none" stroke="#737373" strokeWidth="3" />
            
            {/* Hypotenuse Label */}
            <g transform={`translate(${(A.x + C.x)/2 + 20}, ${(A.y + C.y)/2 - 30}) rotate(37)`}>
              <text fill="#fafafa" fontSize="18" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest drop-shadow-lg">Hypotenuse</text>
            </g>

            {/* Vertex Hitboxes for Snapping the Orb */}
            <circle cx={A.x} cy={A.y} r="40" fill="transparent" className="cursor-pointer" onClick={() => setRefAngle('A')} />
            <circle cx={C.x} cy={C.y} r="40" fill="transparent" className="cursor-pointer" onClick={() => setRefAngle('C')} />

            {/* Glowing Orbs at Vertices */}
            <circle cx={A.x} cy={A.y} r="6" fill="#737373" />
            <circle cx={C.x} cy={C.y} r="6" fill="#737373" />
            <circle cx={B.x} cy={B.y} r="6" fill="#737373" />

            <text x={A.x - 25} y={A.y + 5} fill="#a3a3a3" fontSize="24" fontWeight="bold" className="font-serif">A</text>
            <text x={B.x - 25} y={B.y + 25} fill="#a3a3a3" fontSize="24" fontWeight="bold" className="font-serif">B</text>
            <text x={C.x + 20} y={C.y + 25} fill="#a3a3a3" fontSize="24" fontWeight="bold" className="font-serif">C</text>

          </svg>

          {/* HTML Overlay for Framer Motion Layout Animations (The flying labels) */}
          <div className="absolute inset-0 pointer-events-none">
            
            {/* The Reference Eye Orb */}
            <motion.div 
              layout
              initial={false}
              animate={{ 
                left: refAngle === 'A' ? `${(A.x / 700) * 100}%` : `${(C.x / 700) * 100}%`,
                top: refAngle === 'A' ? `${(A.y / 500) * 100}%` : `${(C.y / 500) * 100}%`,
              }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              className="absolute w-16 h-16 -ml-8 -mt-8 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.8)] pointer-events-auto cursor-grab active:cursor-grabbing backdrop-blur-sm"
              drag
              dragSnapToOrigin
              onDragEnd={(e, info) => {
                // Determine snap based on horizontal drag distance relative to center
                if (info.point.x > window.innerWidth / 2) {
                  setRefAngle('C');
                } else {
                  setRefAngle('A');
                }
              }}
            >
              <Eye className="text-emerald-300" size={24} />
            </motion.div>

            {/* Flying "Opposite" Label */}
            <motion.div
              layout
              initial={false}
              animate={{
                left: oppositeLine === 'BC' ? `${((B.x + C.x) / 2 / 700) * 100}%` : `${(A.x / 700) * 100}%`,
                top: oppositeLine === 'BC' ? `${(B.y / 500) * 100}%` : `${((A.y + B.y) / 2 / 500) * 100}%`,
                x: oppositeLine === 'BC' ? '-50%' : '-120%',
                y: oppositeLine === 'BC' ? '50%' : '-50%'
              }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="absolute bg-sky-950/80 border-2 border-sky-500 px-4 py-2 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(14,165,233,0.5)] flex items-center gap-2"
            >
              <Target size={16} className="text-sky-400" />
              <span className="text-sky-100 font-bold uppercase tracking-widest text-xs">Opposite</span>
            </motion.div>

            {/* Flying "Adjacent" Label */}
            <motion.div
              layout
              initial={false}
              animate={{
                left: adjacentLine === 'AB' ? `${(A.x / 700) * 100}%` : `${((B.x + C.x) / 2 / 700) * 100}%`,
                top: adjacentLine === 'AB' ? `${((A.y + B.y) / 2 / 500) * 100}%` : `${(B.y / 500) * 100}%`,
                x: adjacentLine === 'AB' ? '-120%' : '-50%',
                y: adjacentLine === 'AB' ? '-50%' : '50%'
              }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="absolute bg-amber-950/80 border-2 border-amber-500 px-4 py-2 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2"
            >
              <BoxSelect size={16} className="text-amber-400" />
              <span className="text-amber-100 font-bold uppercase tracking-widest text-xs">Adjacent</span>
            </motion.div>

          </div>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Reference Angle Controller */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Observer Position</span>
              <Eye size={14} className="text-emerald-500" />
            </div>
            
            <p className="text-stone-400 text-xs">Drag the Glowing Orb on the board, or click below to swap your perspective.</p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setRefAngle('A')}
                className={`flex-1 py-3 rounded-lg font-bold text-lg font-serif transition-colors border-2 ${refAngle === 'A' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'}`}
              >
                Angle A
              </button>
              <button 
                onClick={() => setRefAngle('C')}
                className={`flex-1 py-3 rounded-lg font-bold text-lg font-serif transition-colors border-2 ${refAngle === 'C' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'}`}
              >
                Angle C
              </button>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <ScanEye className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Live Trigonometric Ratios</h3>
            </div>
            
            <div className="p-6 space-y-6 flex flex-col h-full bg-[#1c1917]">
              
              {/* Sine Ratio */}
              <div className="flex items-center justify-between bg-stone-950 border border-stone-800 p-4 rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-serif font-bold text-xl">sin({refAngle})</span>
                  <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Opposite / Hypotenuse</span>
                </div>
                <div className="flex flex-col items-center font-mono font-bold text-lg">
                  <span className="text-sky-400 border-b-2 border-stone-700 pb-1 px-4">{oppositeLine} ({opposite})</span>
                  <span className="text-stone-300 pt-1 px-4">AC ({lenAC})</span>
                </div>
              </div>

              {/* Cosine Ratio */}
              <div className="flex items-center justify-between bg-stone-950 border border-stone-800 p-4 rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-serif font-bold text-xl">cos({refAngle})</span>
                  <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Adjacent / Hypotenuse</span>
                </div>
                <div className="flex flex-col items-center font-mono font-bold text-lg">
                  <span className="text-amber-400 border-b-2 border-stone-700 pb-1 px-4">{adjacentLine} ({adjacent})</span>
                  <span className="text-stone-300 pt-1 px-4">AC ({lenAC})</span>
                </div>
              </div>

              {/* Tangent Ratio */}
              <div className="flex items-center justify-between bg-stone-950 border border-stone-800 p-4 rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-serif font-bold text-xl">tan({refAngle})</span>
                  <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Opposite / Adjacent</span>
                </div>
                <div className="flex flex-col items-center font-mono font-bold text-lg">
                  <span className="text-sky-400 border-b-2 border-stone-700 pb-1 px-4">{oppositeLine} ({opposite})</span>
                  <span className="text-amber-400 pt-1 px-4">{adjacentLine} ({adjacent})</span>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  <motion.div key={refAngle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                    <Target className="text-sky-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-stone-300 font-sans text-xs leading-relaxed">
                      You are currently looking from <strong className="text-emerald-400">Angle {refAngle}</strong>. <br/><br/>
                      The <strong className="text-stone-100">Hypotenuse</strong> (the metallic bar) never moves. But notice how the <strong className="text-sky-400">Opposite</strong> and <strong className="text-amber-400">Adjacent</strong> sides flip completely when you walk across the room to the other angle!
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