'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, ArrowRight } from 'lucide-react';

const ERAS = ['Hindu-Arabic', 'Roman', 'Egyptian', 'Mayan'];

export default function ChronoDial() {
  const [number, setNumber] = useState<number>(2367);
  const [activeEra, setActiveEra] = useState<number>(0); // Index of ERAS

  // ==================================================================
  // TRANSLATION ENGINES
  // ==================================================================
  
  // 1. ROMAN (Non-positional, subtractive)
  const toRoman = (num: number) => {
    const lookup: [string, number][] = [
      ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
      ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
      ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
    ];
    let result = '';
    let current = num;
    for (const [roman, val] of lookup) {
      while (current >= val) {
        result += roman;
        current -= val;
      }
    }
    return result;
  };

  // 2. EGYPTIAN (Non-positional, strictly additive base-10)
  const toEgyptian = (num: number) => {
    const lotus = Math.floor(num / 1000);
    const rope = Math.floor((num % 1000) / 100);
    const heel = Math.floor((num % 100) / 10);
    const staff = num % 10;
    return { lotus, rope, heel, staff };
  };

  // 3. MAYAN (Positional, Base-20, Vertical)
  const toMayan = (num: number) => {
    // For 2367: 5 * 400 (20^2) + 18 * 20 (20^1) + 7 * 1 (20^0)
    const tiers = [];
    let current = num;
    // Calculate powers of 20 needed
    let power = 0;
    while (Math.pow(20, power + 1) <= current) power++;
    
    for (let p = power; p >= 0; p--) {
      const placeValue = Math.pow(20, p);
      const digit = Math.floor(current / placeValue);
      tiers.push({ place: placeValue, value: digit });
      current -= digit * placeValue;
    }
    return tiers;
  };

  // ==================================================================
  // RENDER HELPERS
  // ==================================================================
  const renderEgyptianTokens = (count: number, name: string, color: string) => {
    return Array.from({ length: count }).map((_, i) => (
      <motion.div 
        key={`${name}-${i}`}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
        className={`w-6 h-10 sm:w-8 sm:h-12 ${color} rounded-md border border-white/20 shadow-sm flex items-center justify-center`}
      >
        {/* SVG PLACEHOLDER: <img src={`/assets/egyptian-${name}.svg`} /> */}
        <span className="text-[8px] text-white/50 uppercase writing-vertical">{name}</span>
      </motion.div>
    ));
  };

  const renderMayanDigit = (value: number) => {
    if (value === 0) {
      return (
        <div className="w-16 h-8 bg-stone-700 rounded-full border border-stone-500 flex items-center justify-center">
          {/* SVG PLACEHOLDER: <img src="/assets/mayan-shell.svg" /> */}
          <span className="text-[10px] text-stone-400">SHELL</span>
        </div>
      );
    }
    
    const bars = Math.floor(value / 5);
    const dots = value % 5;
    
    return (
      <div className="flex flex-col items-center gap-1.5 p-2">
        <div className="flex gap-1.5 h-3">
          {Array.from({ length: dots }).map((_, i) => (
            <div key={`dot-${i}`} className="w-3 h-3 rounded-full bg-stone-200" />
            // SVG PLACEHOLDER: <img src="/assets/mayan-dot.svg" />
          ))}
        </div>
        {Array.from({ length: bars }).map((_, i) => (
          <div key={`bar-${i}`} className="w-16 h-2.5 rounded-sm bg-stone-200" />
          // SVG PLACEHOLDER: <img src="/assets/mayan-bar.svg" />
        ))}
      </div>
    );
  };

  // Rotate the dial visually based on the active index
  const dialRotation = -(activeEra * (360 / ERAS.length));

  return (
    <div className="w-full h-full min-h-[700px] bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col items-center overflow-hidden font-sans relative">
      
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-2xl font-serif text-white flex items-center gap-2">
          <Globe2 className="text-emerald-500" /> The Chrono-Dial
        </h2>
        <p className="text-stone-400 text-sm mt-1">Translating mathematical elegance across eras.</p>
      </div>

      {/* INPUT PANEL */}
      <div className="absolute top-6 right-6 z-10 bg-stone-800/80 backdrop-blur-md p-4 rounded-2xl border border-stone-700">
        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">Modern Input</label>
        <input 
          type="number" 
          value={number} 
          min="1" max="9999"
          onChange={(e) => setNumber(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))}
          className="w-32 bg-stone-900 text-emerald-400 font-mono text-2xl p-2 rounded-xl border border-stone-600 focus:outline-none focus:border-emerald-500 text-center"
        />
      </div>

      {/* THE DIAL & TRANSLATION CANVAS */}
      <div className="flex-1 w-full flex flex-col items-center justify-center mt-20 relative z-0">
        
        {/* The Outer Stone Dial */}
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-[16px] border-stone-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center bg-stone-950">
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{ rotate: dialRotation }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          >
            {ERAS.map((era, i) => {
              const angle = i * (360 / ERAS.length);
              return (
                <div 
                  key={era} 
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-[50%_192px] sm:origin-[50%_224px] h-[384px] sm:h-[448px] w-8 flex flex-col items-center justify-start"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className={`mt-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${i === activeEra ? 'text-emerald-400' : 'text-stone-600'}`}>
                    {era}
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1 ${i === activeEra ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-stone-700'}`} />
                </div>
              );
            })}
          </motion.div>

          {/* THE CENTER DISPLAY STAGE */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-stone-900 border border-stone-700 shadow-inner flex items-center justify-center p-4 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEra}
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                
                {/* 1. HINDU-ARABIC */}
                {ERAS[activeEra] === 'Hindu-Arabic' && (
                  <div className="text-5xl sm:text-6xl font-mono text-emerald-400 font-bold tracking-widest drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {number}
                  </div>
                )}

                {/* 2. ROMAN */}
                {ERAS[activeEra] === 'Roman' && (
                  <div className="text-3xl sm:text-4xl font-serif text-amber-100 text-center tracking-widest leading-relaxed break-all px-4">
                    {toRoman(number)}
                  </div>
                )}

                {/* 3. EGYPTIAN */}
                {ERAS[activeEra] === 'Egyptian' && (() => {
                  const eg = toEgyptian(number);
                  return (
                    <div className="flex flex-wrap justify-center gap-1.5 content-center h-full overflow-y-auto pr-2 custom-scrollbar">
                      {renderEgyptianTokens(eg.lotus, 'lotus', 'bg-emerald-800')}
                      {renderEgyptianTokens(eg.rope, 'rope', 'bg-amber-700')}
                      {renderEgyptianTokens(eg.heel, 'heel', 'bg-stone-600')}
                      {renderEgyptianTokens(eg.staff, 'staff', 'bg-stone-400')}
                    </div>
                  );
                })()}

                {/* 4. MAYAN */}
                {ERAS[activeEra] === 'Mayan' && (
                  <div className="flex flex-col items-center gap-4 h-full justify-center overflow-y-auto">
                    {toMayan(number).map((tier, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-[10px] text-stone-500 font-mono w-8 text-right block">{tier.place}s</span>
                        <div className="bg-stone-800 p-2 rounded-lg border border-stone-700 min-w-[80px] flex justify-center">
                          {renderMayanDigit(tier.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="mt-8 flex gap-4 z-10">
        <button 
          onClick={() => setActiveEra((prev) => (prev - 1 + ERAS.length) % ERAS.length)}
          className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full font-bold uppercase tracking-widest text-xs transition-colors"
        >
          Previous Era
        </button>
        <button 
          onClick={() => setActiveEra((prev) => (prev + 1) % ERAS.length)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/50"
        >
          Next Era <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}