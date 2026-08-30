'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Shapes, ToggleLeft, ToggleRight, Info } from 'lucide-react';

export default function FluidVennMorpher() {
  // ==================================================================
  // STATE MACHINE: The geometric properties
  // ==================================================================
  const [isParallel, setIsParallel] = useState<boolean>(false);
  const [isRightAngled, setIsRightAngled] = useState<boolean>(false);
  const [isEqualSided, setIsEqualSided] = useState<boolean>(false);

  // Handle hierarchical logic: You can't have a rectangle/rhombus without parallel sides
  const toggleParallel = () => {
    const nextState = !isParallel;
    setIsParallel(nextState);
    if (!nextState) {
      setIsRightAngled(false);
      setIsEqualSided(false);
    }
  };

  // ==================================================================
  // MATH ENGINE: Determine Shape, SVG Coordinates, and Venn Position
  // ==================================================================
  const { shapeName, polygonPoints, dotPosition, message, themeColor } = useMemo(() => {
    let name = "Quadrilateral";
    let points = "30,160 80,40 190,30 140,150"; // Random irregular quad
    let dotX = 30;  // Outside the Venn circles
    let dotY = 30;
    let msg = "A generic 4-sided polygon with no special properties.";
    let color = "#a8a29e"; // stone-400

    if (isParallel) {
      if (isRightAngled && isEqualSided) {
        name = "Square";
        points = "50,150 50,50 150,50 150,150"; // Base 100, Height 100
        dotX = 150; // Intersection of Rectangle and Rhombus
        dotY = 120;
        msg = "Aha! By inheriting ALL properties, the shape falls dead center. A Square IS a Rectangle, a Rhombus, and a Parallelogram simultaneously!";
        color = "#10b981"; // emerald-500
      } else if (isRightAngled) {
        name = "Rectangle";
        points = "40,140 40,60 160,60 160,140"; // Base 120, Height 80
        dotX = 90; // Inside Rectangle circle only
        dotY = 120;
        msg = "Parallelogram + 90° Angles = Rectangle. Notice how the opposite sides are forced to remain equal.";
        color = "#3b82f6"; // blue-500
      } else if (isEqualSided) {
        name = "Rhombus";
        points = "40,140 100,60 200,60 140,140"; // Base 100, Slant dx 60/dy 80 (side = 100)
        dotX = 210; // Inside Rhombus circle only
        dotY = 120;
        msg = "Parallelogram + All Sides Equal = Rhombus. Notice the diagonals now cross at exactly 90°.";
        color = "#d97706"; // amber-600
      } else {
        name = "Parallelogram";
        points = "20,140 80,60 200,60 140,140"; // Base 120, Slanted
        dotX = 150; // Inside Parallelogram, above specific circles
        dotY = 55;
        msg = "Opposite sides are now parallel. This is the 'parent' shape for all specialized quadrilaterals.";
        color = "#8b5cf6"; // violet-500
      }
    }

    return { shapeName: name, polygonPoints: points, dotPosition: { x: dotX, y: dotY }, message: msg, themeColor: color };
  }, [isParallel, isRightAngled, isEqualSided]);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          The Fluid Venn-Morpher
        </h2>
        <p className="text-stone-400 text-sm mt-1">Understanding the hierarchy of quadrilaterals.</p>
      </div>

      {/* SPLIT SCREEN CANVAS */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 mb-6 z-10">
        
        {/* LEFT: Dynamic Polygon */}
        <div className="flex-1 bg-[#1c1917] rounded-2xl border border-stone-700 shadow-inner flex flex-col items-center justify-center p-6 relative">
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase transition-colors"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor, border: `1px solid ${themeColor}` }}
            >
              {shapeName}
            </span>
          </div>
          
          <svg viewBox="0 0 240 200" className="w-full max-w-[240px] h-auto drop-shadow-2xl">
            {/* Grid overlay for scale reference */}
            <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1">
               {Array.from({length: 12}).map((_, i) => <line key={`h-${i}`} x1="0" y1={i*20} x2="240" y2={i*20} />)}
               {Array.from({length: 12}).map((_, i) => <line key={`v-${i}`} x1={i*20} y1="0" x2={i*20} y2="200" />)}
            </g>

            <motion.polygon 
              animate={{ points: polygonPoints }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              fill={`${themeColor}40`}
              stroke={themeColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* RIGHT: Venn Diagram */}
        <div className="flex-1 bg-stone-950 rounded-2xl border border-stone-800 shadow-inner flex items-center justify-center p-6 relative">
          <svg viewBox="0 0 300 200" className="w-full max-w-[300px] h-auto">
            {/* Parallelograms Set (Outer) */}
            <ellipse cx="150" cy="100" rx="140" ry="90" fill="#8b5cf6" fillOpacity="0.1" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 4" />
            <text x="150" y="30" fill="#8b5cf6" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">PARALLELOGRAMS</text>
            
            {/* Rectangles Set (Left) */}
            <circle cx="105" cy="120" r="55" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="2" />
            <text x="80" y="105" fill="#3b82f6" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">RECTANGLES</text>

            {/* Rhombuses Set (Right) */}
            <circle cx="195" cy="120" r="55" fill="#d97706" fillOpacity="0.15" stroke="#d97706" strokeWidth="2" />
            <text x="220" y="105" fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">RHOMBUSES</text>

            {/* Squares Set (Intersection Label) */}
            <text x="150" y="145" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">SQUARES</text>

            {/* The Dynamic Point */}
            <motion.circle 
              animate={{ cx: dotPosition.x, cy: dotPosition.y }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              r="6" 
              fill={themeColor}
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          </svg>
        </div>

      </div>

      {/* AHA! MESSAGE BOX */}
      <div className="mb-6 w-full">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-3 shadow-xl">
          <Info size={20} style={{ color: themeColor }} className="shrink-0 mt-0.5 transition-colors duration-300" />
          <p className="text-stone-300 text-sm leading-relaxed transition-colors duration-300">
            {message}
          </p>
        </div>
      </div>

      {/* CONTROL SWITCHES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 z-10 shrink-0">
        
        {/* Switch 1: Parallel */}
        <button 
          onClick={toggleParallel}
          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isParallel ? 'bg-violet-900/40 border-violet-500/50' : 'bg-stone-900 border-stone-800'}`}
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1">Step 1</span>
            <span className={`text-sm font-bold ${isParallel ? 'text-violet-300' : 'text-stone-300'}`}>Opposite Sides Parallel</span>
          </div>
          {isParallel ? <ToggleRight size={32} className="text-violet-500" /> : <ToggleLeft size={32} className="text-stone-600" />}
        </button>

        {/* Switch 2: Right Angles */}
        <button 
          onClick={() => setIsRightAngled(!isRightAngled)}
          disabled={!isParallel}
          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${!isParallel ? 'opacity-50 cursor-not-allowed' : isRightAngled ? 'bg-blue-900/40 border-blue-500/50' : 'bg-stone-900 border-stone-800 hover:border-stone-600'}`}
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1">Step 2a</span>
            <span className={`text-sm font-bold ${isRightAngled ? 'text-blue-300' : 'text-stone-300'}`}>All Angles 90°</span>
          </div>
          {isRightAngled ? <ToggleRight size={32} className="text-blue-500" /> : <ToggleLeft size={32} className="text-stone-600" />}
        </button>

        {/* Switch 3: Equal Sides */}
        <button 
          onClick={() => setIsEqualSided(!isEqualSided)}
          disabled={!isParallel}
          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${!isParallel ? 'opacity-50 cursor-not-allowed' : isEqualSided ? 'bg-amber-900/40 border-amber-500/50' : 'bg-stone-900 border-stone-800 hover:border-stone-600'}`}
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1">Step 2b</span>
            <span className={`text-sm font-bold ${isEqualSided ? 'text-amber-300' : 'text-stone-300'}`}>All Sides Equal</span>
          </div>
          {isEqualSided ? <ToggleRight size={32} className="text-amber-500" /> : <ToggleLeft size={32} className="text-stone-600" />}
        </button>

      </div>
    </div>
  );
}