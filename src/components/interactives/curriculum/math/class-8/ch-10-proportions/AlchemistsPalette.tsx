'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, Play, RotateCcw, Droplet, AlertTriangle, Sparkles } from 'lucide-react';

export default function AlchemistsPalette() {
  const [targetVolume, setTargetVolume] = useState<number>(50);
  const [phase, setPhase] = useState<'idle' | 'mixing' | 'mixed' | 'ruined'>('idle');
  
  // Base Ratios
  const ratioR = 2;
  const ratioB = 3;
  const ratioW = 5;
  const totalParts = ratioR + ratioB + ratioW;

  // Calculated Volumes
  const volR = (targetVolume * ratioR) / totalParts;
  const volB = (targetVolume * ratioB) / totalParts;
  const volW = (targetVolume * ratioW) / totalParts;

  // State for the "ruined" manual override
  const [extraBlue, setExtraBlue] = useState<number>(0);

  const handleMix = () => {
    if (phase !== 'idle') return;
    setPhase('mixing');
    setTimeout(() => setPhase('mixed'), 2500); // 2.5s mixing animation
  };

  const handleRuin = () => {
    setExtraBlue(10);
    setPhase('ruined');
  };

  const handleReset = () => {
    setPhase('idle');
    setExtraBlue(0);
  };

  // Determine Orb Color
  const getOrbColor = () => {
    if (phase === 'idle' || phase === 'mixing') return 'transparent';
    if (phase === 'mixed') return '#8b5cf6'; // Perfect Purple (Violet 500)
    return '#57534e'; // Muddy Bruised Indigo (Stone 600)
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Alchemist's Palette
          </h2>
          <p className="text-stone-400 text-sm mt-1">Multi-Term Ratios: <span className="font-mono text-purple-400">2 : 3 : 5</span></p>
        </div>
        
        {/* INPUT: Target Volume */}
        <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-lg flex items-center gap-3">
          <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">
            Target Volume
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={targetVolume} 
              onChange={(e) => {
                setTargetVolume(Math.max(10, Math.min(500, parseInt(e.target.value) || 0)));
                handleReset();
              }}
              disabled={phase !== 'idle'}
              className="w-16 bg-stone-800 text-white font-mono text-center rounded-lg border border-stone-600 focus:outline-none p-1"
            />
            <span className="text-stone-400 font-mono text-sm">ml</span>
          </div>
        </div>
      </div>

      {/* THE MAIN FLUID CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col z-10 overflow-hidden p-6">
        
        {/* TOP: The 3 Source Cylinders */}
        <div className="w-full flex justify-center gap-8 sm:gap-16 mb-12 min-h-[150px] relative z-20">
          
          {/* Red Cylinder */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Red (2 Parts)</div>
            <div className="w-12 h-32 bg-white/5 border-2 border-white/10 rounded-b-xl rounded-t-sm relative overflow-hidden shadow-lg">
              <motion.div 
                className="absolute bottom-0 w-full bg-rose-500"
                initial={{ height: '100%' }}
                animate={{ height: phase !== 'idle' ? '0%' : '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
            {phase !== 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 font-mono text-sm font-bold mt-1">
                {volR} ml
              </motion.div>
            )}
          </div>

          {/* Blue Cylinder */}
          <div className="flex flex-col items-center gap-2 relative">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Blue (3 Parts)</div>
            <div className="w-12 h-32 bg-white/5 border-2 border-white/10 rounded-b-xl rounded-t-sm relative overflow-hidden shadow-lg">
              <motion.div 
                className="absolute bottom-0 w-full bg-blue-500"
                initial={{ height: '100%' }}
                animate={{ height: phase !== 'idle' ? (phase === 'ruined' ? '40%' : '0%') : '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
            {phase !== 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-400 font-mono text-sm font-bold mt-1">
                {volB + extraBlue} ml
              </motion.div>
            )}
            
            {/* The Manual Override Interaction */}
            {phase === 'mixed' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                onClick={handleRuin}
                className="absolute -right-8 top-16 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.6)] hover:bg-blue-500 z-30 group"
              >
                <Droplet size={14} />
                <span className="absolute left-10 text-[10px] uppercase font-bold whitespace-nowrap bg-blue-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Pour Extra
                </span>
              </motion.button>
            )}
          </div>

          {/* White Cylinder */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">White (5 Parts)</div>
            <div className="w-12 h-32 bg-white/5 border-2 border-white/10 rounded-b-xl rounded-t-sm relative overflow-hidden shadow-lg">
              <motion.div 
                className="absolute bottom-0 w-full bg-stone-200"
                initial={{ height: '100%' }}
                animate={{ height: phase !== 'idle' ? '0%' : '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
            {phase !== 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-stone-300 font-mono text-sm font-bold mt-1">
                {volW} ml
              </motion.div>
            )}
          </div>

        </div>

        {/* BOTTOM: Central Mixing Orb */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            {/* Glass Shell */}
            <div className="absolute inset-0 rounded-full border-4 border-white/10 bg-white/5 backdrop-blur-sm z-10 shadow-2xl overflow-hidden">
               {/* The Fluid Fill inside Orb */}
               <motion.div 
                  className="absolute bottom-0 w-full"
                  initial={{ height: '0%', backgroundColor: 'transparent' }}
                  animate={{ 
                    height: phase === 'idle' ? '0%' : '100%', 
                    backgroundColor: getOrbColor() 
                  }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
               />
               {/* Shine Effect */}
               <div className="absolute top-4 left-6 w-8 h-16 bg-white/20 rounded-full blur-md rotate-[-45deg] z-20" />
            </div>

            {/* Glowing Backdrop */}
            <motion.div 
              className="absolute inset-0 rounded-full blur-2xl z-0"
              animate={{ backgroundColor: getOrbColor(), opacity: phase === 'mixed' ? 0.4 : 0.2 }}
              transition={{ duration: 2 }}
            />
          </div>

          <div className="mt-6 h-8 text-center z-20">
            {phase === 'mixed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest">
                <Sparkles size={18} /> Perfect Purple ({targetVolume} ml)
              </motion.div>
            )}
            {phase === 'ruined' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-widest">
                <AlertTriangle size={18} className="text-stone-500" /> Bruised Indigo ({targetVolume + extraBlue} ml)
              </motion.div>
            )}
          </div>
        </div>

      </div>

      {/* THE MATHEMATICAL HUD */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 z-10 shrink-0 h-32">
        <div className={`flex-1 border rounded-2xl p-4 shadow-xl flex items-center justify-center transition-colors duration-500 ${phase === 'ruined' ? 'bg-red-950/20 border-red-900/50' : 'bg-stone-900 border-stone-800'}`}>
          {phase === 'idle' || phase === 'mixing' ? (
            <div className="text-stone-600 font-mono text-sm border border-dashed border-stone-700 px-6 py-3 rounded-xl">
              Mix paint to construct ratio formulas...
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-6 font-mono text-sm sm:text-base">
              
              <div className="flex flex-col items-center">
                <span className="text-rose-400 mb-2">Red</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-300">{targetVolume} ×</span>
                  <div className="flex flex-col items-center">
                    <span className="text-rose-400 border-b border-stone-600 w-full text-center px-2">{ratioR}</span>
                    <span className="text-stone-500 text-xs">({ratioR}+{ratioB}+{ratioW})</span>
                  </div>
                  <span className="text-stone-400">=</span>
                  <span className="text-rose-400 font-bold">{volR}</span>
                </div>
              </div>

              <div className="w-px h-16 bg-stone-700/50" />

              <div className="flex flex-col items-center">
                <span className="text-blue-400 mb-2">Blue</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-300">{targetVolume} ×</span>
                  <div className="flex flex-col items-center">
                    <span className={`border-b border-stone-600 w-full text-center px-2 ${phase === 'ruined' ? 'text-red-500 line-through' : 'text-blue-400'}`}>{ratioB}</span>
                    <span className="text-stone-500 text-xs">({ratioR}+{ratioB}+{ratioW})</span>
                  </div>
                  <span className="text-stone-400">=</span>
                  <span className={`font-bold ${phase === 'ruined' ? 'text-red-500' : 'text-blue-400'}`}>{volB + extraBlue}</span>
                </div>
              </div>

              <div className="w-px h-16 bg-stone-700/50 hidden lg:block" />

              <div className="flex-col items-center hidden lg:flex">
                <span className="text-stone-300 mb-2">White</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-300">{targetVolume} ×</span>
                  <div className="flex flex-col items-center">
                    <span className="text-stone-300 border-b border-stone-600 w-full text-center px-2">{ratioW}</span>
                    <span className="text-stone-500 text-xs">({ratioR}+{ratioB}+{ratioW})</span>
                  </div>
                  <span className="text-stone-400">=</span>
                  <span className="text-stone-300 font-bold">{volW}</span>
                </div>
              </div>

            </motion.div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <div className="w-full sm:w-48 flex items-stretch">
          {phase === 'idle' ? (
            <button 
              onClick={handleMix}
              className="w-full h-full bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
            >
              <Beaker size={20} /> Mix Paint
            </button>
          ) : (
            <button 
              onClick={handleReset}
              className="w-full h-full bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3 shadow-lg"
            >
              <RotateCcw size={20} /> Clean Orb
            </button>
          )}
        </div>
      </div>

    </div>
  );
}