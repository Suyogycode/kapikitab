'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, Target, Layers, ArrowDown } from 'lucide-react';

// Utility to check if a number is prime
const isPrime = (num: number) => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

type Block = {
  id: string;
  value: number;
  isPrime: boolean;
};

const AVAILABLE_LASERS = [2, 3, 5, 7, 11, 13];

export default function PrimeFactorizationForge() {
  const [inputNumber, setInputNumber] = useState<number | ''>(32760);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isForging, setIsForging] = useState(false);
  const [activeLaser, setActiveLaser] = useState<number | null>(null);

  // Check if all blocks are prime (Trigger Aha! Moment)
  const isComplete = blocks.length > 0 && blocks.every(b => b.isPrime);

  const startForge = () => {
    if (!inputNumber || inputNumber <= 1) return;
    setBlocks([{
      id: `initial-${Date.now()}`,
      value: inputNumber,
      isPrime: isPrime(inputNumber)
    }]);
    setIsForging(true);
  };

  const resetForge = () => {
    setBlocks([]);
    setIsForging(false);
    setActiveLaser(null);
  };

  // The Splitting Mechanic
  const fireLaser = (primeLine: number) => {
    if (isComplete) return;

    setActiveLaser(primeLine);
    setTimeout(() => setActiveLaser(null), 300); // Visual laser flash

    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      // Find the first composite block divisible by the fired laser
      const targetIndex = newBlocks.findIndex(b => !b.isPrime && b.value % primeLine === 0);
      
      if (targetIndex === -1) return prevBlocks; // Miss! No block divisible by this prime.

      const targetBlock = newBlocks[targetIndex];
      const quotient = targetBlock.value / primeLine;

      // Shatter the block into the Prime (indestructible) and the Quotient (new block)
      newBlocks.splice(targetIndex, 1, 
        { id: `prime-${targetBlock.value}-${Date.now()}`, value: primeLine, isPrime: true },
        { id: `comp-${quotient}-${Date.now()}`, value: quotient, isPrime: isPrime(quotient) }
      );

      return newBlocks;
    });
  };

  // Auto-sort primes for the final equation display
  const sortedPrimes = useMemo(() => {
    if (!isComplete) return [];
    return [...blocks].map(b => b.value).sort((a, b) => a - b);
  }, [blocks, isComplete]);

  // Generate the formatted power string (e.g., 2³ × 3² × 5)
  const formattedEquation = useMemo(() => {
    if (!isComplete) return null;
    const counts: Record<number, number> = {};
    sortedPrimes.forEach(p => counts[p] = (counts[p] || 0) + 1);
    
    return Object.entries(counts).map(([prime, count], index, arr) => (
      <span key={prime} className="flex items-center gap-1">
        <span className="text-2xl text-emerald-400 font-bold">{prime}</span>
        {count > 1 && <sup className="text-emerald-300 font-bold -mt-3 text-lg">{count}</sup>}
        {index < arr.length - 1 && <span className="text-stone-500 mx-2">×</span>}
      </span>
    ));
  }, [sortedPrimes, isComplete]);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Layers className="text-amber-500" /> The Prime Factorization Forge
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Fundamental Theorem of Arithmetic: Every composite number has a unique prime DNA.
          </p>
        </div>
        {isForging && (
          <button 
            onClick={resetForge}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Forge New Block
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE FORGE) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6">
          
          {!isForging ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-stone-500 font-mono text-sm uppercase tracking-widest">Enter a composite number</div>
              <input 
                type="number" 
                value={inputNumber} 
                onChange={(e) => setInputNumber(parseInt(e.target.value) || '')}
                className="w-48 bg-stone-950 border-2 border-stone-700 text-white text-4xl text-center font-bold py-4 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
              />
              <button 
                onClick={startForge}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2"
              >
                <ArrowDown size={20} /> Drop Heavy Block
              </button>
            </div>
          ) : (
            <div className={`flex-1 flex p-8 transition-all duration-1000 ${isComplete ? 'flex-row flex-wrap items-end justify-center content-end gap-2' : 'flex-col items-center justify-start gap-4'}`}>
              
              <AnimatePresence>
                {blocks.map((block) => (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ scale: 0, y: -50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                    className={`flex items-center justify-center font-bold shadow-xl border-2 ${
                      block.isPrime 
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 w-16 h-16 rounded-full text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : 'bg-stone-800 border-stone-600 text-stone-200 w-40 h-24 rounded-lg text-3xl'
                    }`}
                  >
                    {block.value}
                  </motion.div>
                ))}
              </AnimatePresence>

            </div>
          )}

          {/* Laser Flash Overlay */}
          <AnimatePresence>
            {activeLaser !== null && (
              <motion.div 
                initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-rose-500/10 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Laser Controls */}
          <div className={`bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-4 transition-opacity ${!isForging || isComplete ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
              <span>Prime Lasers</span>
              <Target size={14} className="text-rose-500" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {AVAILABLE_LASERS.map(prime => (
                <button
                  key={prime}
                  onClick={() => fireLaser(prime)}
                  className={`py-4 rounded-xl text-lg font-bold font-mono transition-all border-2 active:scale-95 touch-none flex items-center justify-center gap-1 ${
                    activeLaser === prime 
                      ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)]' 
                      : 'bg-stone-950 border-stone-800 text-rose-400 hover:border-rose-500/50 hover:bg-rose-950/30'
                  }`}
                >
                  <Zap size={14} className={activeLaser === prime ? 'text-white' : 'text-rose-500/50'} />
                  {prime}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 text-center font-bold tracking-widest uppercase mt-2">
              Fire lasers to divide the composite stone
            </p>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Layers className={isComplete ? "text-emerald-500" : "text-amber-500"} size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Prime DNA (Unique Factorization)</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              {/* The "Aha!" Moment Display */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div 
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="text-white text-3xl font-bold border-b-2 border-stone-700 pb-4 px-8">
                        {inputNumber}
                      </div>
                      <div className="text-xl text-stone-400">=</div >
                      <div className="flex flex-wrap items-center justify-center gap-2 bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        {formattedEquation}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="incomplete"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-stone-600 text-center text-xs uppercase tracking-widest leading-relaxed"
                    >
                      Reduce the block to pure prime energy to reveal its unique mathematical DNA.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theory Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl"
                    >
                      <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">The Uniqueness Proof</h4>
                      <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                        No matter which order you fired the lasers, the blocks magnetically snapped into this exact, unique sequence. Every composite number is built from one—and only one—specific combination of primes!
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                      <p className="text-stone-400 font-sans text-xs leading-relaxed">
                        <strong>Theorem 1.1:</strong> Every composite number can be expressed as a product of primes, and this factorization is unique, apart from the order in which the prime factors occur.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}