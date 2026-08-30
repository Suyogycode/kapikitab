'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Telescope, Microscope, Info } from 'lucide-react';

// ==================================================================
// THE DATA DICTIONARY
// Mapping exponents to real-world textbook examples
// ==================================================================
type ScaleMilestone = {
  exponent: number;
  base: number;
  title: string;
  unit: string;
  description: string;
  theme: string;
};

const scaleMilestones: ScaleMilestone[] = [
  { exponent: -6, base: 1.2, title: "A Human Cell", unit: "meters", description: "Microscopic structures measured in micrometers.", theme: "from-rose-900 to-stone-950" },
  { exponent: -3, base: 2.0, title: "A Grain of Sand", unit: "meters", description: "Measured in millimeters, visible to the naked eye.", theme: "from-amber-900 to-stone-950" },
  { exponent: 0,  base: 1.0, title: "A Standard Desk", unit: "meters", description: "The baseline human scale (10⁰ = 1).", theme: "from-stone-800 to-stone-950" },
  { exponent: 2,  base: 2.5, title: "Remaining Kakapo Birds", unit: "birds", description: "A critically endangered species population.", theme: "from-emerald-900 to-stone-950" },
  { exponent: 6,  base: 2.1, title: "City Population", unit: "people", description: "Millions of individuals living in a metropolis.", theme: "from-indigo-900 to-stone-950" },
  { exponent: 9,  base: 8.2, title: "Global Human Population", unit: "people", description: "Billions of humans currently on Earth.", theme: "from-sky-900 to-stone-950" },
  { exponent: 11, base: 1.496, title: "Distance to the Sun", unit: "meters", description: "149.6 billion meters away.", theme: "from-orange-900 to-stone-950" },
  { exponent: 12, base: 1.4335, title: "Distance to Saturn", unit: "meters", description: "Over 1.4 trillion meters into the solar system.", theme: "from-slate-900 to-black" }
];

export default function CosmicScaleEngine() {
  const [currentIndex, setCurrentIndex] = useState<number>(2); // Start at 10^0 (Desk)
  
  const currentScale = scaleMilestones[currentIndex];
  
  // Format standard number for comparison
  const formatStandard = (base: number, exp: number) => {
    if (exp >= 0 && exp <= 6) return (base * Math.pow(10, exp)).toLocaleString();
    if (exp > 6) return `${base} Trillion/Billion...`; // Fallback for massive numbers
    return (base * Math.pow(10, exp)).toFixed(Math.abs(exp) + 1);
  };

  return (
    <div className={`w-full h-full min-h-[700px] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans bg-gradient-to-br ${currentScale.theme} transition-colors duration-1000`}>
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Cosmic Scale Engine
          </h2>
          <p className="text-stone-400 text-sm mt-1">Scientific Notation: <span className="font-mono text-emerald-400">x × 10ⁿ</span></p>
        </div>
      </div>

      {/* THE VISUALIZATION CANVAS */}
      <div className="flex-1 w-full relative flex items-center justify-center z-10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentScale.exponent}
            initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 2, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center text-center"
          >
            {/* 
              SVG IMAGE PLACEHOLDER
              Replace this block with your designer's assets: <img src={`/assets/scale-${currentScale.exponent}.svg`} /> 
            */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 mb-8 relative flex items-center justify-center border border-white/10 bg-white/5 rounded-full backdrop-blur-sm shadow-2xl">
               <span className="text-white/30 text-xs font-bold uppercase tracking-widest text-center px-4">
                 [ SVG: {currentScale.title} ]
               </span>
            </div>

            <h3 className="text-4xl sm:text-6xl font-serif text-white mb-4 drop-shadow-lg">
              {currentScale.title}
            </h3>
            
            {/* MATHEMATICAL EQUATION */}
            <div className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
              <div className="flex items-baseline gap-3 font-mono text-4xl sm:text-5xl text-emerald-400 mb-2">
                <span>{currentScale.base}</span>
                <span className="text-stone-500 text-2xl sm:text-3xl">×</span>
                <span>10<sup className="text-2xl sm:text-3xl">{currentScale.exponent}</sup></span>
              </div>
              <p className="text-stone-400 font-mono text-sm tracking-widest uppercase">
                {currentScale.unit}
              </p>
            </div>
            
          </motion.div>
        </AnimatePresence>
      </div>

      {/* INFO CARD */}
      <div className="absolute top-24 right-6 sm:top-6 z-20 max-w-xs hidden sm:block">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-sm text-stone-300 shadow-xl">
          <Info size={16} className="text-emerald-400 mb-2" />
          {currentScale.description}
          <div className="mt-3 pt-3 border-t border-white/10 font-mono text-xs text-stone-500">
            Standard: {formatStandard(currentScale.base, currentScale.exponent)}
          </div>
        </div>
      </div>

      {/* CONTROL PANEL: The Exponent Slider */}
      <div className="mt-6 p-5 sm:p-6 bg-stone-950/80 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl z-20 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Telescope size={16} className="text-emerald-500"/> Macro
          </p>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            Micro <Microscope size={16} className="text-emerald-500"/>
          </p>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max={scaleMilestones.length - 1} 
          step="1"
          value={currentIndex} 
          onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
          className="w-full h-3 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        
        <div className="flex justify-between mt-4 px-1">
          {scaleMilestones.map((milestone, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-1 h-3 rounded-full mb-1 ${idx === currentIndex ? 'bg-emerald-500' : 'bg-stone-700'}`} />
              <span className={`font-mono text-[10px] ${idx === currentIndex ? 'text-emerald-400 font-bold' : 'text-stone-600'}`}>
                10<sup>{milestone.exponent}</sup>
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}