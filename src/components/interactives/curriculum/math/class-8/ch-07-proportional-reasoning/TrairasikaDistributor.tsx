'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Coins, Calculator } from 'lucide-react';

interface Token {
  id: string;
}

export default function TrairasikaDistributor() {
  const [totalTokens, setTotalTokens] = useState<number>(42);
  const [ratioA, setRatioA] = useState<number>(4);
  const [ratioB, setRatioB] = useState<number>(3);
  
  const [phase, setPhase] = useState<'idle' | 'distributing' | 'done'>('idle');
  
  const [pool, setPool] = useState<Token[]>([]);
  const [trayA, setTrayA] = useState<Token[]>([]);
  const [trayB, setTrayB] = useState<Token[]>([]);

  // Initialize the pool when the total changes or reset is hit
  useEffect(() => {
    if (phase === 'idle') {
      const initialTokens = Array.from({ length: totalTokens }).map((_, i) => ({ id: `t-${i}` }));
      setPool(initialTokens);
      setTrayA([]);
      setTrayB([]);
    }
  }, [totalTokens, phase]);

  // ==================================================================
  // THE PHYSICS ENGINE: Chunked Distribution Loop
  // ==================================================================
  useEffect(() => {
    if (phase === 'distributing') {
      const totalParts = ratioA + ratioB;
      
      if (pool.length >= totalParts) {
        const timer = setTimeout(() => {
          // Extract the next chunk
          const chunkA = pool.slice(0, ratioA);
          const chunkB = pool.slice(ratioA, ratioA + ratioB);
          
          setPool(prev => prev.slice(totalParts));
          setTrayA(prev => [...prev, ...chunkA]);
          setTrayB(prev => [...prev, ...chunkB]);
        }, 600); // Speed of the dealing animation
        return () => clearTimeout(timer);
      } else {
        // If there's a remainder or the pool is empty, we are done
        setPhase('done');
      }
    }
  }, [phase, pool, ratioA, ratioB]);

  const handleStart = () => {
    if (totalTokens < (ratioA + ratioB)) return; // Prevent start if not enough tokens
    setPhase('distributing');
  };

  const totalParts = ratioA + ratioB;
  const multiplier = Math.floor(totalTokens / totalParts);
  const remainder = totalTokens % totalParts;

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Trairasika Distributor
          </h2>
          <p className="text-stone-400 text-sm mt-1">Unequal Sharing using the Rule of Three.</p>
        </div>

        {/* INPUT CONTROLS */}
        <div className="flex items-center gap-3 bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-stone-500 mb-1">Total</span>
            <input type="number" value={totalTokens} onChange={(e) => { setTotalTokens(Math.max(1, parseInt(e.target.value) || 1)); setPhase('idle'); }} disabled={phase !== 'idle'} className="w-16 bg-stone-800 text-amber-400 font-mono text-center rounded border border-stone-600 focus:outline-none" />
          </div>
          <div className="w-px h-8 bg-stone-700 mx-1" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Ratio A</span>
            <input type="number" value={ratioA} onChange={(e) => { setRatioA(Math.max(1, parseInt(e.target.value) || 1)); setPhase('idle'); }} disabled={phase !== 'idle'} className="w-12 bg-stone-800 text-emerald-400 font-mono text-center rounded border border-stone-600 focus:outline-none" />
          </div>
          <span className="text-stone-500 font-bold mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-blue-500 mb-1">Ratio B</span>
            <input type="number" value={ratioB} onChange={(e) => { setRatioB(Math.max(1, parseInt(e.target.value) || 1)); setPhase('idle'); }} disabled={phase !== 'idle'} className="w-12 bg-stone-800 text-blue-400 font-mono text-center rounded border border-stone-600 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* THE MAIN DISTRIBUTION CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col z-10 overflow-hidden p-6">
        
        {/* TOP: The Global Pool */}
        <div className="w-full flex flex-col items-center mb-8 min-h-[120px]">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Coins size={14} className="text-amber-500" /> Source Pool ({pool.length})
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-2xl">
            <AnimatePresence>
              {pool.map((token) => (
                <motion.div
                  layout
                  key={token.id}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full border border-amber-200 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                />
              ))}
            </AnimatePresence>
            {remainder > 0 && phase === 'done' && (
               <div className="w-full text-center mt-2 text-rose-400 text-xs font-mono">
                 Remainder: {remainder} tokens cannot be evenly distributed.
               </div>
            )}
          </div>
        </div>

        {/* BOTTOM: The Trays */}
        <div className="flex-1 flex gap-4 sm:gap-8 justify-center items-end pb-8">
          
          {/* Tray A */}
          <div className="flex-1 max-w-[300px] flex flex-col items-center">
            <div className="w-full flex flex-wrap justify-center content-end gap-1.5 mb-4 min-h-[150px]">
              <AnimatePresence>
                {trayA.map((token) => (
                  <motion.div
                    layout
                    key={token.id}
                    initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-300 to-emerald-600 rounded-full border border-emerald-200 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                ))}
              </AnimatePresence>
            </div>
            <div className="w-full bg-stone-900 border-x-4 border-b-4 border-emerald-900 h-8 rounded-b-2xl shadow-xl flex items-center justify-center">
              <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Tray A ({trayA.length})</span>
            </div>
          </div>

          {/* Tray B */}
          <div className="flex-1 max-w-[300px] flex flex-col items-center">
            <div className="w-full flex flex-wrap justify-center content-end gap-1.5 mb-4 min-h-[150px]">
              <AnimatePresence>
                {trayB.map((token) => (
                  <motion.div
                    layout
                    key={token.id}
                    initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full border border-blue-200 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                ))}
              </AnimatePresence>
            </div>
            <div className="w-full bg-stone-900 border-x-4 border-b-4 border-blue-900 h-8 rounded-b-2xl shadow-xl flex items-center justify-center">
              <span className="text-blue-500 font-bold text-xs uppercase tracking-widest">Tray B ({trayB.length})</span>
            </div>
          </div>

        </div>
      </div>

      {/* THE ALGEBRAIC PROOF (Aha! Moment) */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 z-10 shrink-0">
        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-center">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calculator size={14} /> Algebraic Formula
          </div>
          {phase === 'done' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl flex items-center justify-center font-mono text-lg sm:text-xl text-emerald-400">
                {ratioA} × ({totalTokens} / {totalParts}) = {trayA.length}
              </div>
              <div className="bg-blue-950/30 border border-blue-900/50 p-3 rounded-xl flex items-center justify-center font-mono text-lg sm:text-xl text-blue-400">
                {ratioB} × ({totalTokens} / {totalParts}) = {trayB.length}
              </div>
            </div>
          ) : (
            <div className="w-full h-[60px] flex items-center justify-center text-stone-600 font-mono text-sm border border-dashed border-stone-700 rounded-xl">
              Distribute tokens to calculate the formula...
            </div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <div className="flex items-center justify-center">
          {phase === 'idle' ? (
            <button 
              onClick={handleStart}
              disabled={totalTokens < totalParts}
              className="h-full px-8 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-3 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
            >
              <Play size={20} /> Distribute
            </button>
          ) : (
            <button 
              onClick={() => setPhase('idle')}
              className="h-full px-8 bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-3 shadow-lg"
            >
              <RotateCcw size={20} /> Reset
            </button>
          )}
        </div>
      </div>

    </div>
  );
}