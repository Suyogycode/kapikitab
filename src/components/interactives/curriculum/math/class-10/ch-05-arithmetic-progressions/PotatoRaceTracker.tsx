'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Target, Footprints, Layers, Calculator } from 'lucide-react';

export default function PotatoRaceTracker() {
  // Race Parameters
  const [a, setA] = useState<number>(5); // Distance to first potato
  const [d, setD] = useState<number>(3); // Gap between potatoes
  const [n, setN] = useState<number>(5); // Number of potatoes

  // Animation & Game State
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [runnerPos, setRunnerPos] = useState<number>(0);
  const [activePotato, setActivePotato] = useState<number | null>(null);
  const [threads, setThreads] = useState<number[]>([]);
  
  // Ref to handle safe unmounting/resetting during async loops
  const raceId = useRef<number>(0);

  // Math Calculations
  const potatoes = Array.from({ length: n }, (_, i) => a + i * d);
  const maxDistance = potatoes[potatoes.length - 1] + 2; // For track scaling
  const totalThreadDistance = threads.reduce((acc, val) => acc + val, 0);
  const finalCalculatedSum = (n / 2) * (2 * (2 * a) + (n - 1) * (2 * d));

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startRace = async () => {
    setStatus('running');
    setThreads([]);
    const currentRaceId = ++raceId.current;

    for (let i = 0; i < n; i++) {
      if (raceId.current !== currentRaceId) return; // Break if reset
      
      const targetDist = potatoes[i];
      setActivePotato(i);

      // Run Out
      setRunnerPos(targetDist);
      await sleep(600);
      if (raceId.current !== currentRaceId) return;

      // Run Back
      setRunnerPos(0);
      await sleep(600);
      if (raceId.current !== currentRaceId) return;

      // Drop the thread
      setThreads(prev => [...prev, targetDist * 2]);
      setActivePotato(null);
      await sleep(300);
    }

    if (raceId.current === currentRaceId) {
      setStatus('finished');
    }
  };

  const handleReset = () => {
    raceId.current++; // Interrupts any running loops
    setStatus('idle');
    setRunnerPos(0);
    setThreads([]);
    setActivePotato(null);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Footprints className="text-amber-500" /> The Potato Race Tracker
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Applied Progressions: Finding the sum ($S_n$) of a real-world scenario.
          </p>
        </div>
        {status !== 'idle' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Race
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE FIELD & THREADS) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 gap-8">
          
          {/* TOP HALF: THE RACE TRACK */}
          <div className="relative w-full h-40 bg-stone-900/50 rounded-xl border border-stone-800 flex items-center px-4 sm:px-8">
            
            {/* The Bucket (x = 0) */}
            <div className="absolute left-8 w-8 h-10 bg-stone-700 border-2 border-stone-500 rounded-b-md rounded-t-sm flex items-end justify-center pb-1 z-20 shadow-lg">
              <div className="w-6 h-1 bg-stone-900 rounded-full"></div>
            </div>

            {/* The Track Line */}
            <div className="absolute left-8 right-8 h-1 bg-stone-800 top-1/2 -translate-y-1/2 rounded-full"></div>

            {/* The Potatoes */}
            {potatoes.map((dist, i) => {
              const leftPercent = (dist / maxDistance) * 100;
              const isGathered = threads.length > i;
              
              return (
                <div 
                  key={`potato-${i}`}
                  style={{ left: `calc(2rem + ${leftPercent}% - 1rem)` }} // 2rem offset for bucket padding
                  className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                >
                  <AnimatePresence>
                    {!isGathered && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
                        className={`w-4 h-5 rounded-full shadow-md transition-all ${
                          activePotato === i ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-125' : 'bg-amber-700 border border-amber-600'
                        }`}
                      />
                    )}
                  </AnimatePresence>
                  <span className="text-[10px] text-stone-500 font-mono font-bold mt-4">{dist}m</span>
                </div>
              );
            })}

            {/* The Runner & Active Thread */}
            <motion.div 
              animate={{ left: `calc(2rem + ${(runnerPos / maxDistance) * 100}% - 0.5rem)` }}
              transition={{ ease: "linear", duration: 0.6 }}
              className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center"
            >
              <div className="w-4 h-4 bg-sky-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>
              
              {/* Dynamic Thread tailing the runner */}
              {status === 'running' && runnerPos > 0 && (
                <div className="absolute right-4 h-0.5 bg-sky-400/50" style={{ width: `calc(${(runnerPos / maxDistance) * 100}%)`, minWidth: '100px' }}></div>
              )}
            </motion.div>

          </div>

          {/* BOTTOM HALF: THE THREAD STACK (BAR CHART) */}
          <div className="flex-1 flex flex-col justify-end gap-2 bg-stone-900/30 rounded-xl p-4 border border-stone-800 overflow-hidden">
            <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-2">Distance Threads (Out + Back)</h3>
            
            <div className="w-full flex-1 flex flex-col gap-2 justify-start">
              <AnimatePresence>
                {threads.map((threadDist, i) => {
                  const widthPercent = (threadDist / (maxDistance * 2)) * 100;
                  return (
                    <motion.div 
                      key={`thread-${i}`}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${widthPercent}%`, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="h-8 bg-sky-500/20 border border-sky-400 rounded-r-md flex items-center justify-end px-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                    >
                      <span className="text-sky-300 font-mono font-bold text-xs">{threadDist}m</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Total Accumulator */}
            <div className="mt-4 pt-4 border-t border-stone-800 flex justify-between items-center">
              <span className="text-white font-bold tracking-widest uppercase text-sm">Total Distance:</span>
              <span className="text-2xl font-mono font-bold text-sky-400">{totalThreadDistance}m</span>
            </div>
          </div>

        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Race Configuration</span>
              <Target size={14} className="text-amber-500" />
            </div>
            
            <div className={`flex flex-col gap-5 transition-opacity ${status !== 'idle' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-amber-400 font-bold">First Potato (a)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{a}m</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={a} onChange={(e) => setA(parseInt(e.target.value))} className="w-full accent-amber-500" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-amber-400 font-bold">Gap Distance (d)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{d}m</span>
                </div>
                <input type="range" min="1" max="5" step="1" value={d} onChange={(e) => setD(parseInt(e.target.value))} className="w-full accent-amber-500" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-amber-400 font-bold">Total Potatoes (n)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{n}</span>
                </div>
                <input type="range" min="3" max="10" step="1" value={n} onChange={(e) => setN(parseInt(e.target.value))} className="w-full accent-amber-500" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.button key="start" onClick={startRace} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-center gap-2 mt-2">
                  <Play size={18} /> Start Race
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Layers className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Hidden Progression</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full">
              
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The potato distances form a simple AP:
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg font-mono text-amber-400 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                      {potatoes.join(', ')} ...
                    </div>
                    <p className="text-stone-400 text-xs mt-2">
                      Hit <strong>Start Race</strong> to track the <em>actual</em> distance the runner has to cover to retrieve each one.
                    </p>
                  </motion.div>
                )}

                {status === 'running' && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Watch the runner carefully. Every trip to a potato requires them to run back to the bucket!
                    </p>
                    <div className="bg-sky-950/20 border border-sky-900/50 p-4 rounded-lg">
                      <p className="text-sky-400 text-xs leading-relaxed font-bold uppercase tracking-widest mb-1">Out and Back:</p>
                      <p className="text-sky-100/80 text-xs leading-relaxed font-mono">
                        Distance = 2 × (a + (n-1)d)
                      </p>
                    </div>
                  </motion.div>
                )}

                {status === 'finished' && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h3 className="text-sky-400 font-bold text-lg uppercase tracking-widest mb-1">A New AP is Born!</h3>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The total threads created a completely new Arithmetic Progression. The "back and forth" mechanic doubled everything!
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between font-mono text-xs text-stone-400">
                        <span>New First Term (2a):</span>
                        <span className="text-white">{2 * a}</span>
                      </div>
                      <div className="flex justify-between font-mono text-xs text-stone-400">
                        <span>New Difference (2d):</span>
                        <span className="text-white">{2 * d}</span>
                      </div>
                      <div className="w-full h-px bg-stone-800 my-1"></div>
                      <div className="flex justify-between font-mono font-bold text-sm">
                        <span className="text-sky-400">Total Sum ($S_n$):</span>
                        <span className="text-sky-400">{finalCalculatedSum}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}