'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Move, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CarpentersWorkbench() {
  // ==================================================================
  // STATE: The physical properties of our "wooden strips" (diagonals)
  // ==================================================================
  const [pinA, setPinA] = useState<number>(0.5); // 0 to 1 (0.5 is exactly bisected)
  const [pinB, setPinB] = useState<number>(0.5); // 0 to 1 (0.5 is exactly bisected)
  const [angle, setAngle] = useState<number>(60); // 0 to 180 degrees
  const [isEqualLength, setIsEqualLength] = useState<boolean>(true);

  // ==================================================================
  // MATH ENGINE: Calculate the endpoints to draw the perimeter
  // ==================================================================
  const { points, shapeName, glowColor, message } = useMemo(() => {
    const cx = 200;
    const cy = 200;
    const lenA = 240; 
    const lenB = isEqualLength ? 240 : 160;

    // Strip A (Horizontal base strip)
    const ax1 = cx - lenA * pinA;
    const ay1 = cy;
    const ax2 = cx + lenA * (1 - pinA);
    const ay2 = cy;

    // Strip B (Rotated strip)
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    const bx1 = cx - lenB * pinB * dx;
    const by1 = cy - lenB * pinB * dy;
    const bx2 = cx + lenB * (1 - pinB) * dx;
    const by2 = cy + lenB * (1 - pinB) * dy;

    // Shape Identification Logic
    const isBisected = pinA === 0.5 && pinB === 0.5;
    const isPerpendicular = angle === 90;

    let name = "Quadrilateral";
    let color = "#a8a29e"; // stone-400
    let msg = "Adjust the pin placements and angle to discover specific shapes.";

    if (isBisected) {
      if (isEqualLength && isPerpendicular) {
        name = "Square";
        color = "#10b981"; // emerald-500
        msg = "Aha! Equal, bisecting, AND perpendicular diagonals mathematically guarantee a Square.";
      } else if (isEqualLength && !isPerpendicular) {
        name = "Rectangle";
        color = "#3b82f6"; // blue-500
        msg = "Equal and bisecting diagonals force the corners to 90°, creating a Rectangle.";
      } else if (!isEqualLength && isPerpendicular) {
        name = "Rhombus";
        color = "#d97706"; // amber-600
        msg = "Bisecting and perpendicular diagonals force all four outer sides to be equal, forming a Rhombus.";
      } else {
        name = "Parallelogram";
        color = "#8b5cf6"; // blue-400
        msg = "Simply bisecting the diagonals guarantees the opposite sides will be parallel.";
      }
    } else if (pinA === 0.5 || pinB === 0.5) {
      if (isPerpendicular && !isEqualLength) {
         name = "Kite";
         color = "#ec4899"; // rose-500
         msg = "When only ONE diagonal is bisected at 90°, it creates a Kite.";
      }
    }

    return { 
      points: { ax1, ay1, ax2, ay2, bx1, by1, bx2, by2 }, 
      shapeName: name, 
      glowColor: color,
      message: msg
    };
  }, [pinA, pinB, angle, isEqualLength]);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-4 z-10">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          The Carpenter's Workbench
        </h2>
        <p className="text-stone-400 text-sm mt-1">How diagonals secretly dictate the shape.</p>
      </div>

      {/* SHAPE BADGE */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end">
        <motion.div 
          layout
          className="px-6 py-2 rounded-full border shadow-[0_0_20px_rgba(0,0,0,0.5)] font-bold tracking-widest uppercase text-sm sm:text-base flex items-center gap-2"
          style={{ backgroundColor: `${glowColor}20`, borderColor: glowColor, color: glowColor }}
        >
          {shapeName === 'Square' && <Sparkles size={18} />}
          {shapeName}
        </motion.div>
      </div>

      {/* THE WORKBENCH CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-700 shadow-inner relative overflow-hidden flex flex-col items-center justify-center p-4 z-10">
        
        {/* SVG Mathematical Rendering */}
        <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto overflow-visible drop-shadow-2xl">
          
          {/* 1. The Glowing Perimeter Thread */}
          <motion.polygon 
            points={`${points.ax1},${points.ay1} ${points.bx1},${points.by1} ${points.ax2},${points.ay2} ${points.bx2},${points.by2}`}
            fill={`${glowColor}10`}
            stroke={glowColor}
            strokeWidth="3"
            strokeDasharray="8 4"
            className="transition-all duration-300"
          />

          {/* 2. Wooden Strip A */}
          <line x1={points.ax1} y1={points.ay1} x2={points.ax2} y2={points.ay2} stroke="#78716c" strokeWidth="12" strokeLinecap="round" />
          <line x1={points.ax1} y1={points.ay1} x2={points.ax2} y2={points.ay2} stroke="#a8a29e" strokeWidth="8" strokeLinecap="round" />
          
          {/* 3. Wooden Strip B */}
          <line x1={points.bx1} y1={points.by1} x2={points.bx2} y2={points.by2} stroke="#78716c" strokeWidth="12" strokeLinecap="round" />
          <line x1={points.bx1} y1={points.by1} x2={points.bx2} y2={points.by2} stroke="#d6d3d1" strokeWidth="8" strokeLinecap="round" />

          {/* 4. The Center Pin */}
          <circle cx="200" cy="200" r="6" fill="#facc15" stroke="#92400e" strokeWidth="2" />

          {/* Endpoints dots for clarity */}
          {[
            {x: points.ax1, y: points.ay1}, {x: points.ax2, y: points.ay2},
            {x: points.bx1, y: points.by1}, {x: points.bx2, y: points.by2}
          ].map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="4" fill={glowColor} className="transition-all duration-300" />
          ))}
        </svg>

        {/* AHA! MESSAGE BOX */}
        <div className="absolute bottom-6 w-full max-w-lg px-4">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-3 shadow-xl">
            <CheckCircle2 size={20} style={{ color: glowColor }} className="shrink-0 mt-0.5 transition-colors duration-300" />
            <p className="text-stone-300 text-sm leading-relaxed transition-colors duration-300">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 shrink-0">
        
        {/* Toggle Lengths */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-center gap-2 cursor-pointer hover:bg-stone-800/80 transition-colors" onClick={() => setIsEqualLength(!isEqualLength)}>
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1 cursor-pointer">
            <Ruler size={14} className="text-emerald-500" /> Strip Lengths
          </label>
          <div className="text-sm font-bold text-stone-200 flex items-center justify-between">
            {isEqualLength ? "Equal Lengths" : "Unequal Lengths"}
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isEqualLength ? 'bg-emerald-600' : 'bg-stone-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isEqualLength ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        {/* Pin A Slider */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center justify-between mb-2">
            <span className="flex items-center gap-1"><Move size={14} className="text-blue-400" /> Pin on Strip A</span>
            <span className="font-mono text-stone-300">{(pinA * 100).toFixed(0)}%</span>
          </label>
          <input type="range" min="0.2" max="0.8" step="0.05" value={pinA} onChange={(e) => setPinA(parseFloat(e.target.value))} className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-blue-400" />
        </div>

        {/* Pin B Slider */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center justify-between mb-2">
            <span className="flex items-center gap-1"><Move size={14} className="text-rose-400" /> Pin on Strip B</span>
            <span className="font-mono text-stone-300">{(pinB * 100).toFixed(0)}%</span>
          </label>
          <input type="range" min="0.2" max="0.8" step="0.05" value={pinB} onChange={(e) => setPinB(parseFloat(e.target.value))} className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-rose-400" />
        </div>

        {/* Angle Slider */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center justify-between mb-2">
            <span className="flex items-center gap-1"><RotateCw size={14} className="text-amber-400" /> Intersection Angle</span>
            <span className="font-mono text-stone-300">{angle}°</span>
          </label>
          <input type="range" min="30" max="150" step="5" value={angle} onChange={(e) => setAngle(parseFloat(e.target.value))} className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400" />
        </div>

      </div>
    </div>
  );
}