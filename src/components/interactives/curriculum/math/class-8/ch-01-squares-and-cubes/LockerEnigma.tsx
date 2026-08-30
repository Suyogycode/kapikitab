'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, X, Sparkles, User, HelpCircle } from 'lucide-react';

export default function LockerEnigma() {
  const [person, setPerson] = useState<number>(0);
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);

  // ==================================================================
  // MATH ENGINE: Calculate locker states up to the current person
  // ==================================================================
  const lockerStates = useMemo(() => {
    // Array of 101 booleans (ignoring index 0 for 1-based indexing)
    const states = new Array(101).fill(false); 
    
    // Toggling logic: Person P toggles every P-th locker
    for (let p = 1; p <= person; p++) {
      for (let l = p; l <= 100; l += p) {
        states[l] = !states[l];
      }
    }
    return states;
  }, [person]);

  // ==================================================================
  // MATH ENGINE: Calculate factor pairs for the "Aha!" Inspector
  // ==================================================================
  const getFactorPairs = (n: number) => {
    const pairs: [number, number][] = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        pairs.push([i, n / i]);
      }
    }
    return pairs;
  };

  const isPerfectSquare = (n: number) => Number.isInteger(Math.sqrt(n));

  return (
    <div className="w-full h-full min-h-[750px] bg-[#FDFCF8] rounded-2xl border border-stone-200 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight flex items-center gap-2">
            The Locker Enigma
            {person === 100 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                <Sparkles size={24} />
              </motion.span>
            )}
          </h2>
          <p className="text-stone-500 text-sm mt-1">Queen Ratnamanjuri's Puzzle of Squares</p>
        </div>
        <button 
          onClick={() => setPerson(100)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Skip to End
        </button>
      </div>

      {/* 100 LOCKERS GRID */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center p-2 sm:p-4 bg-stone-100/50 rounded-2xl border border-stone-200 shadow-inner overflow-y-auto">
        <div className="grid grid-cols-10 gap-1.5 sm:gap-3 w-full">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((lockerNum) => {
            const isOpen = lockerStates[lockerNum];
            const isSquare = isPerfectSquare(lockerNum);
            
            return (
              <motion.button
                key={lockerNum}
                onClick={() => setSelectedLocker(lockerNum)}
                layout
                initial={false}
                animate={{
                  backgroundColor: isOpen ? '#10b981' : '#e7e5e4', // emerald-500 or stone-200
                  color: isOpen ? '#ffffff' : '#78716c',
                  scale: isOpen ? 1 : 0.95,
                  borderColor: isOpen ? '#059669' : '#d6d3d1'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`
                  aspect-square rounded-md sm:rounded-xl border-b-4 flex flex-col items-center justify-center relative group
                  hover:brightness-110 transition-all cursor-pointer
                  ${person === 100 && isSquare && !isOpen ? 'ring-2 ring-red-500 ring-offset-2' : ''}
                  ${person === 100 && isOpen ? 'shadow-[0_0_15px_rgba(16,185,129,0.4)]' : ''}
                `}
              >
                <span className="text-[10px] sm:text-xs font-bold font-mono opacity-80 mb-0.5">
                  {lockerNum}
                </span>
                <span className="hidden sm:block">
                  {isOpen ? <Unlock size={16} strokeWidth={2.5} /> : <Lock size={16} strokeWidth={2.5} />}
                </span>
                
                {/* Mobile tiny icon indicator */}
                <span className="block sm:hidden mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-white' : 'bg-stone-400'}`} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CONTROL PANEL */}
      <div className="mt-6 p-5 sm:p-6 bg-white border border-stone-200 rounded-2xl shadow-sm relative z-10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <User size={16} /> Person {person} is walking...
          </p>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            {lockerStates.filter(Boolean).length} Lockers Open
          </span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={person} 
          onChange={(e) => setPerson(parseInt(e.target.value))}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        
        <div className="mt-4 text-center">
          <p className="text-sm text-stone-500">
            {person === 0 && "Slide to begin the experiment."}
            {person > 0 && person < 100 && `Person ${person} is toggling every ${person}${person === 1 ? 'st' : person === 2 ? 'nd' : person === 3 ? 'rd' : 'th'} locker.`}
            {person === 100 && <span className="text-emerald-700 font-medium">Experiment complete! Notice anything special about the open lockers? Click one to inspect.</span>}
          </p>
        </div>
      </div>

      {/* FACTOR INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedLocker !== null && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setSelectedLocker(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-200"
            >
              {/* Modal Header */}
              <div className={`p-6 text-white flex items-start justify-between ${isPerfectSquare(selectedLocker) ? 'bg-emerald-600' : 'bg-stone-600'}`}>
                <div>
                  <h3 className="text-2xl font-serif">Locker #{selectedLocker}</h3>
                  <p className="text-sm opacity-80 font-mono mt-1">
                    Status: {lockerStates[selectedLocker] ? 'OPEN' : 'CLOSED'}
                  </p>
                </div>
                <button onClick={() => setSelectedLocker(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Factor Logic */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-stone-800 font-semibold text-sm uppercase tracking-wider">
                  <HelpCircle size={16} className="text-stone-400" />
                  Who touched this locker?
                </div>
                
                <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                  A locker is toggled by a person if the person's number is a <strong>factor</strong> of the locker number.
                </p>

                <div className="space-y-2 mb-6">
                  {getFactorPairs(selectedLocker).map(([f1, f2], idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 font-mono text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm">P{f1}</span>
                        <span className="text-stone-400">×</span>
                        <span className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm">P{f2}</span>
                      </div>
                      <span className="text-stone-500 font-semibold">= {selectedLocker}</span>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-xl text-sm leading-relaxed ${isPerfectSquare(selectedLocker) ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-stone-50 text-stone-600 border border-stone-200'}`}>
                  {isPerfectSquare(selectedLocker) ? (
                    <p><strong>Aha!</strong> {selectedLocker} is a perfect square. The factor pair ({Math.sqrt(selectedLocker)} × {Math.sqrt(selectedLocker)}) uses the same person. This results in an <strong>odd</strong> number of total factors, leaving the door OPEN!</p>
                  ) : (
                    <p>{selectedLocker} has an <strong>even</strong> number of factors because every factor has a distinct partner. Even toggles mean the door ends up CLOSED.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}