'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, AlertTriangle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function AspectCanvas() {
  // Base dimensions set a 3:2 aspect ratio
  const BASE_W = 300;
  const BASE_H = 200;
  const BASE_RATIO = BASE_W / BASE_H;

  const [width, setWidth] = useState<number>(BASE_W);
  const [height, setHeight] = useState<number>(BASE_H);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  // ==================================================================
  // MATH ENGINE: Ratio Simplification
  // ==================================================================
  const { simplifiedW, simplifiedH, isProportional } = useMemo(() => {
    // Check if the current ratio matches the base ratio (with a tiny float tolerance)
    const currentRatio = width / height;
    const proportional = Math.abs(currentRatio - BASE_RATIO) < 0.01;

    // Calculate Greatest Common Divisor (GCD) to simplify the ratio
    const getGCD = (a: number, b: number): number => {
      return b === 0 ? a : getGCD(b, a % b);
    };
    
    // We scale down by 10 to make the numbers cleaner for the UI (e.g., 300 -> 30)
    const wScaled = Math.round(width / 10);
    const hScaled = Math.round(height / 10);
    const gcd = getGCD(wScaled, hScaled);

    return {
      simplifiedW: wScaled / gcd,
      simplifiedH: hScaled / gcd,
      isProportional: proportional
    };
  }, [width, height]);

  // ==================================================================
  // HANDLERS: Enforce locking logic
  // ==================================================================
  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (isLocked) {
      setHeight(Math.round(newWidth / BASE_RATIO));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (isLocked) {
      setWidth(Math.round(newHeight * BASE_RATIO));
    }
  };

  const toggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    // If locking, instantly snap the height back into proportion with the current width
    if (nextLocked) {
      setHeight(Math.round(width / BASE_RATIO));
    }
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Aspect Canvas
          </h2>
          <p className="text-stone-400 text-sm mt-1">Visualizing similarity through proportional scaling.</p>
        </div>
      </div>

      {/* THE MAIN CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 z-10 overflow-hidden">
        
        {/* The Dynamic Image Frame */}
        <div className="relative flex items-center justify-center w-full h-[400px]">
          <motion.div
            layout
            className={`relative flex items-center justify-center overflow-hidden transition-colors duration-300 ${isProportional ? 'ring-4 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'ring-4 ring-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.2)]'}`}
            style={{ 
              width: width, 
              height: height,
              backgroundColor: isProportional ? '#064e3b' : '#4c0519',
              borderRadius: '8px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* 
              SVG PLACEHOLDER: 
              Replace this inner div with your designer's Tiger image:
              <img src="/assets/tiger-photo.jpg" className="w-full h-full object-fill" />
              Note: 'object-fill' is crucial here so the image actually stretches and squishes!
            */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
              <ImageIcon size={48} className={isProportional ? 'text-emerald-400' : 'text-rose-400'} />
              <span className={`font-bold tracking-widest mt-2 uppercase text-xs ${isProportional ? 'text-emerald-400' : 'text-rose-400'}`}>
                [ Tiger Image ]
              </span>
            </div>

            {/* Grid Overlay to highlight distortion */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/50" />
              ))}
            </div>
          </motion.div>
        </div>

        {/* STATUS BADGE */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <motion.div 
            layout
            className={`px-6 py-2 rounded-full border shadow-2xl font-bold tracking-widest uppercase text-xs flex items-center gap-2 backdrop-blur-md transition-colors duration-300
              ${isProportional ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' : 'bg-rose-950/80 border-rose-500 text-rose-400'}`}
          >
            {isProportional ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {isProportional ? 'Proportional (Similar)' : 'Distorted (Not Similar)'}
          </motion.div>
        </div>

        {/* LIVE MATH HUD */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md border border-stone-700 px-8 py-4 rounded-2xl shadow-xl flex flex-col items-center min-w-[250px]">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Width : Height Ratio</span>
          
          <div className="flex items-center gap-4 text-3xl font-mono">
            <span className="text-stone-300">{Math.round(width / 10)}</span>
            <span className="text-stone-600">:</span>
            <span className="text-stone-300">{Math.round(height / 10)}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-stone-800 w-full justify-center">
            <span className="text-xs text-stone-500 font-mono">Simplifies to</span>
            <span className={`text-xl font-mono font-bold ${isProportional ? 'text-emerald-400' : 'text-rose-400'}`}>
              {simplifiedW} : {simplifiedH}
            </span>
          </div>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 z-10 shrink-0">
        
        {/* Width Slider */}
        <div className="flex-1 w-full bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Image Width</label>
            <span className="text-sm font-mono font-bold text-white">{width}px</span>
          </div>
          <input 
            type="range" min="150" max="450" step="10" 
            value={width} 
            onChange={(e) => handleWidthChange(parseInt(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors ${isProportional ? 'bg-emerald-900/50 accent-emerald-500' : 'bg-rose-900/50 accent-rose-500'}`}
          />
        </div>

        {/* The Padlock Toggle */}
        <button 
          onClick={toggleLock}
          className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-all duration-300
            ${isLocked ? 'bg-stone-800 border-stone-600' : 'bg-stone-950 border-stone-800'}`}
        >
          {isLocked ? (
            <div className="flex flex-col items-center text-stone-300">
              <Lock size={24} />
              <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Locked</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-stone-600">
              <Unlock size={24} />
              <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Unlocked</span>
            </div>
          )}
        </button>

        {/* Height Slider */}
        <div className="flex-1 w-full bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Image Height</label>
            <span className="text-sm font-mono font-bold text-white">{height}px</span>
          </div>
          <input 
            type="range" min="100" max="300" step="10" 
            value={height} 
            onChange={(e) => handleHeightChange(parseInt(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors ${isProportional ? 'bg-emerald-900/50 accent-emerald-500' : 'bg-rose-900/50 accent-rose-500'}`}
          />
        </div>

      </div>
    </div>
  );
}