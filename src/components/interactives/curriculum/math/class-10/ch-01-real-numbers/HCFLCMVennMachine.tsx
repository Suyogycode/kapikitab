'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, RotateCcw, Play, CheckCircle2, Scale } from 'lucide-react';

// Utility to get prime factors
const getPrimeFactors = (num: number) => {
  const factors: number[] = [];
  let divisor = 2;
  let n = num;
  while (n >= 2) {
    if (n % divisor === 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  return factors;
};

type Orb = { id: string; val: number; source: 'A' | 'B' };

export default function HCFLCMVennMachine() {
  const [numA, setNumA] = useState<number | ''>(96);
  const [numB, setNumB] = useState<number | ''>(404);
  const [isStarted, setIsStarted] = useState(false);

  // Unsorted Pools
  const [poolA, setPoolA] = useState<Orb[]>([]);
  const [poolB, setPoolB] = useState<Orb[]>([]);

  // Venn Diagram Zones
  const [vennLeft, setVennLeft] = useState<Orb[]>([]);
  const [vennCenter, setVennCenter] = useState<Orb[]>([]);
  const [vennRight, setVennRight] = useState<Orb[]>([]);

  // Highlight Modes
  const [highlightMode, setHighlightMode] = useState<'none' | 'hcf' | 'lcm'>('none');

  const handleStart = () => {
    if (!numA || !numB || numA <= 1 || numB <= 1) return;
    
    const factorsA = getPrimeFactors(numA);
    const factorsB = getPrimeFactors(numB);

    setPoolA(factorsA.map((f, i) => ({ id: `A-${f}-${i}`, val: f, source: 'A' })));
    setPoolB(factorsB.map((f, i) => ({ id: `B-${f}-${i}`, val: f, source: 'B' })));
    
    setVennLeft([]);
    setVennCenter([]);
    setVennRight([]);
    setHighlightMode('none');
    setIsStarted(true);
  };

  const handleReset = () => {
    setIsStarted(false);
    setHighlightMode('none');
  };

  // The Magnetic Sorting Mechanic
  const sortOrb = (orb: Orb) => {
    if (orb.source === 'A') {
      // Check if B has the same prime waiting
      const matchIndexB = poolB.findIndex(b => b.val === orb.val);
      if (matchIndexB !== -1) {
        // Shared Prime! Move both to center.
        const matchB = poolB[matchIndexB];
        setPoolA(prev => prev.filter(a => a.id !== orb.id));
        setPoolB(prev => prev.filter(b => b.id !== matchB.id));
        // We represent the shared prime as a single merged orb in the center
        setVennCenter(prev => [...prev, { id: `merged-${orb.val}-${Date.now()}`, val: orb.val, source: 'A' }]);
      } else {
        // Unique to A
        setPoolA(prev => prev.filter(a => a.id !== orb.id));
        setVennLeft(prev => [...prev, orb]);
      }
    } else {
      // Check if A has the same prime waiting
      const matchIndexA = poolA.findIndex(a => a.val === orb.val);
      if (matchIndexA !== -1) {
        // Shared Prime! Move both to center.
        const matchA = poolA[matchIndexA];
        setPoolB(prev => prev.filter(b => b.id !== orb.id));
        setPoolA(prev => prev.filter(a => a.id !== matchA.id));
        setVennCenter(prev => [...prev, { id: `merged-${orb.val}-${Date.now()}`, val: orb.val, source: 'B' }]);
      } else {
        // Unique to B
        setPoolB(prev => prev.filter(b => b.id !== orb.id));
        setVennRight(prev => [...prev, orb]);
      }
    }
  };

  const isSortingComplete = isStarted && poolA.length === 0 && poolB.length === 0;

  // Math Calculations
  const hcfValue = vennCenter.reduce((acc, curr) => acc * curr.val, 1) || 1;
  const lcmValue = [...vennLeft, ...vennCenter, ...vennRight].reduce((acc, curr) => acc * curr.val, 1) || 1;
  const productValue = (Number(numA) || 0) * (Number(numB) || 0);

  // Orb Component for animation
  const PrimeOrb = ({ orb, onClick, merged }: { orb: Orb, onClick?: () => void, merged?: boolean }) => (
    <motion.button
      layoutId={orb.id}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.1 } : {}}
      whileTap={onClick ? { scale: 0.9 } : {}}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg border-2 transition-colors ${
        merged 
          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]' 
          : orb.source === 'A' 
            ? 'bg-sky-500/20 border-sky-400 text-sky-300' 
            : 'bg-rose-500/20 border-rose-400 text-rose-300'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {orb.val}
    </motion.button>
  );

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <GitMerge className="text-purple-500" /> The HCF & LCM Venn Machine
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Discover why HCF is the overlap, and LCM is the entire picture.
          </p>
        </div>
        {isStarted && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Machine
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6">
          
          {!isStarted ? (
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sky-400 font-bold tracking-widest uppercase text-xs">Number A</span>
                  <input type="number" value={numA} onChange={e => setNumA(parseInt(e.target.value) || '')} className="w-32 bg-stone-950 border-2 border-sky-900/50 text-sky-400 text-3xl text-center font-bold py-3 rounded-xl focus:border-sky-500 focus:outline-none" />
                </div>
                <div className="text-stone-600 text-2xl font-bold">&</div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-rose-400 font-bold tracking-widest uppercase text-xs">Number B</span>
                  <input type="number" value={numB} onChange={e => setNumB(parseInt(e.target.value) || '')} className="w-32 bg-stone-950 border-2 border-rose-900/50 text-rose-400 text-3xl text-center font-bold py-3 rounded-xl focus:border-rose-500 focus:outline-none" />
                </div>
              </div>
              <button onClick={handleStart} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center gap-2">
                <Play size={20} /> Extract Prime Orbs
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col gap-6">
              
              {/* Unsorted Pools */}
              <AnimatePresence>
                {!isSortingComplete && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex justify-between items-start bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                    <div className="flex-1 flex flex-col items-center gap-3 border-r border-stone-800">
                      <span className="text-sky-400 text-[10px] uppercase tracking-widest font-bold">Primes of {numA}</span>
                      <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
                        {poolA.map(orb => <PrimeOrb key={orb.id} orb={orb} onClick={() => sortOrb(orb)} />)}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-3">
                      <span className="text-rose-400 text-[10px] uppercase tracking-widest font-bold">Primes of {numB}</span>
                      <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
                        {poolB.map(orb => <PrimeOrb key={orb.id} orb={orb} onClick={() => sortOrb(orb)} />)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Venn Diagram */}
              <div className="flex-1 relative flex items-center justify-center mt-4">
                
                {/* Left Circle (A) */}
                <div className={`absolute left-[5%] sm:left-[15%] w-64 h-64 rounded-full border-4 transition-all duration-500 flex items-center justify-start p-8 ${
                  highlightMode === 'lcm' ? 'bg-sky-900/30 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.2)]' : 'bg-transparent border-sky-900/50'
                }`}>
                  <div className="flex flex-wrap gap-2 w-24">
                    {vennLeft.map(orb => <PrimeOrb key={orb.id} orb={orb} />)}
                  </div>
                </div>

                {/* Right Circle (B) */}
                <div className={`absolute right-[5%] sm:right-[15%] w-64 h-64 rounded-full border-4 transition-all duration-500 flex items-center justify-end p-8 ${
                  highlightMode === 'lcm' ? 'bg-rose-900/30 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'bg-transparent border-rose-900/50'
                }`}>
                  <div className="flex flex-wrap justify-end gap-2 w-24">
                    {vennRight.map(orb => <PrimeOrb key={orb.id} orb={orb} />)}
                  </div>
                </div>

                {/* Center Intersection */}
                <div className={`absolute w-40 h-52 rounded-[100%] transition-all duration-500 z-10 flex items-center justify-center flex-wrap gap-2 content-center ${
                  highlightMode !== 'none' ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] backdrop-blur-sm' : 'bg-transparent border-2 border-dashed border-stone-700'
                }`}>
                  {vennCenter.map(orb => <PrimeOrb key={orb.id} orb={orb} merged />)}
                </div>

                {/* Status Indicator */}
                {!isSortingComplete && (
                  <div className="absolute bottom-0 bg-stone-900 text-stone-400 text-xs px-4 py-2 rounded-full border border-stone-800 animate-pulse uppercase tracking-widest font-bold">
                    Tap orbs to analyze overlap
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Action Toggles */}
          <div className={`bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-4 transition-all duration-500 ${!isSortingComplete ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
              <span>Diagram Filters</span>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            
            <button 
              onClick={() => setHighlightMode(highlightMode === 'hcf' ? 'none' : 'hcf')}
              className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border-2 flex items-center justify-between px-6 ${
                highlightMode === 'hcf' ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-amber-900/50 hover:text-amber-600'
              }`}
            >
              <span>Highlight HCF</span>
              {highlightMode === 'hcf' && <span>{hcfValue}</span>}
            </button>

            <button 
              onClick={() => setHighlightMode(highlightMode === 'lcm' ? 'none' : 'lcm')}
              className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border-2 flex items-center justify-between px-6 ${
                highlightMode === 'lcm' ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-purple-900/50 hover:text-purple-600'
              }`}
            >
              <span>Highlight LCM</span>
              {highlightMode === 'lcm' && <span>{lcmValue}</span>}
            </button>
          </div>

          {/* Mathematical Translation HUD */}
          <div className={`bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1 transition-all duration-500 ${!isSortingComplete ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Scale className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Golden Rule</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              {/* Formula Scale */}
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-emerald-500">
                  <span>Product of HCF & LCM</span>
                  <span>Product of A & B</span>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold text-white px-2">
                  <span>{hcfValue} × {lcmValue}</span>
                  <span className="text-emerald-500">=</span>
                  <span>{numA} × {numB}</span>
                </div>

                <div className="w-full h-px bg-emerald-900/50 relative">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rotate-45 bg-emerald-500 border border-emerald-400"></div>
                </div>

                <div className="text-center text-2xl font-bold text-emerald-400 mt-2">
                  {productValue.toLocaleString()}
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {highlightMode === 'hcf' ? (
                    <motion.div key="hcf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-amber-200/80 font-sans text-xs leading-relaxed">
                      <strong className="text-amber-400 uppercase tracking-widest">The Intersection:</strong><br/>
                      The Highest Common Factor is literally just the shared prime DNA. Multiplying the primes trapped in the intersection gives exactly {hcfValue}.
                    </motion.div>
                  ) : highlightMode === 'lcm' ? (
                    <motion.div key="lcm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-purple-200/80 font-sans text-xs leading-relaxed">
                      <strong className="text-purple-400 uppercase tracking-widest">The Entire Diagram:</strong><br/>
                      The Least Common Multiple requires all the distinct prime data across both numbers. By taking the intersection once, plus the unique leftovers, we build the LCM: {lcmValue}.
                    </motion.div>
                  ) : (
                    <motion.div key="neutral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-stone-400 font-sans text-xs leading-relaxed">
                      Click the highlight filters above to visualize how the prime overlap perfectly constructs the HCF and LCM formulas.
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