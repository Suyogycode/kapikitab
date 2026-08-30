'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ShieldAlert, Sparkles, Hash, Layers } from 'lucide-react';

export default function CryptexVault() {
  // Base: Characters per slot (e.g., 0-9 means 10 characters)
  const [base, setBase] = useState<number>(10);
  // Exponent: Number of slots on the lock
  const [exponent, setExponent] = useState<number>(2);

  const totalCombinations = Math.pow(base, exponent);

  // For performance, we only render a maximum of 400 physical DOM dots.
  // Beyond that, we rely on the visual scale of the grid and the counter.
  const visualDotCount = Math.min(totalCombinations, 400);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Cryptex Vault
            {totalCombinations >= 100000 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400">
                <ShieldAlert size={24} />
              </motion.span>
            )}
          </h2>
          <p className="text-stone-400 text-sm mt-1">Combinatorics & Powers: <span className="font-mono text-emerald-400">Base ^ Exponent</span></p>
        </div>
      </div>

      {/* THE 3D-STYLE CRYPTEX LOCK UI */}
      <div className="w-full flex items-center justify-center p-6 bg-stone-900/50 rounded-2xl border border-stone-800 shadow-2xl z-10 mb-6">
        <div className="flex items-center gap-2 sm:gap-4 p-4 bg-gradient-to-b from-stone-700 to-stone-900 rounded-xl border border-stone-600 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          
          <Lock className="text-stone-400 mr-2 sm:mr-4" size={32} />
          
          <AnimatePresence mode="popLayout">
            {Array.from({ length: exponent }).map((_, idx) => (
              <motion.div
                key={`slot-${idx}`}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="w-12 h-16 sm:w-16 sm:h-24 bg-stone-200 rounded-lg flex items-center justify-center border-y-4 border-stone-400 shadow-inner relative overflow-hidden"
              >
                {/* 
                  SVG PLACEHOLDER: 
                  You can drop a metallic texture SVG here later.
                  <img src="/assets/metal-dial.svg" className="absolute inset-0 opacity-30" />
                */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,transparent_20%,transparent_80%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
                
                <span className="text-2xl sm:text-4xl font-mono font-bold text-stone-800 z-10">
                  {base - 1}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
        </div>
      </div>

      {/* VISUALIZATION CANVAS */}
      <div className="flex-1 w-full bg-stone-900 rounded-2xl border border-stone-800 shadow-inner relative overflow-hidden flex flex-col items-center justify-center p-6 z-10">
        
        {totalCombinations > 400 ? (
          // MASSIVE SCALE (Particle Cloud Placeholder)
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center text-center"
          >
            {/* 
              SVG PLACEHOLDER: 
              This is where the massive glowing particle cloud SVG or WebGL canvas will go.
            */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-stone-900 to-stone-950" />
            
            <Sparkles size={48} className="text-emerald-500/50 mb-4" />
            <h3 className="text-4xl sm:text-6xl font-serif text-white mb-2 shadow-emerald-500/20 drop-shadow-2xl">
              {totalCombinations.toLocaleString()}
            </h3>
            <p className="text-stone-400 font-mono uppercase tracking-widest text-xs sm:text-sm">
              Total Possible Combinations
            </p>
            <p className="text-stone-500 text-xs mt-6 max-w-md">
              The number of possibilities has exceeded our visual grid! A human testing 1 combination every second would take 
              <span className="text-emerald-400 font-bold ml-1">
                {(totalCombinations / 3600).toFixed(1)} hours
              </span> to try them all.
            </p>
          </motion.div>
        ) : (
          // SMALL SCALE (Combinatorics Grid)
          <div className="w-full h-full flex flex-col items-center justify-center">
            <h3 className="text-2xl sm:text-4xl font-serif text-white mb-6">
              {totalCombinations.toLocaleString()} <span className="text-stone-500 text-lg">Combinations</span>
            </h3>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-3xl overflow-y-auto max-h-[300px] p-2">
              <AnimatePresence>
                {Array.from({ length: visualDotCount }).map((_, i) => (
                  <motion.div
                    key={`dot-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.002 }} // Super fast stagger
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* CONTROL PANEL */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 z-10 shrink-0">
        
        {/* Base Slider */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Hash size={16} className="text-emerald-500"/> Characters per Slot (Base)
            </label>
            <span className="text-lg font-mono font-bold text-white">{base}</span>
          </div>
          <input 
            type="range" min="2" max="26" value={base} 
            onChange={(e) => setBase(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[10px] text-stone-500 mt-2 text-right">e.g., 10 = digits 0-9</p>
        </div>

        {/* Exponent Slider */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={16} className="text-emerald-500"/> Number of Slots (Exponent)
            </label>
            <span className="text-lg font-mono font-bold text-white">{exponent}</span>
          </div>
          <input 
            type="range" min="1" max="8" value={exponent} 
            onChange={(e) => setExponent(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[10px] text-stone-500 mt-2 text-right">e.g., 5 = a 5-digit lock</p>
        </div>

      </div>

    </div>
  );
}