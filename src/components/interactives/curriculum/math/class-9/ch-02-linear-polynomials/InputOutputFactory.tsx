'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, Cpu, ArrowRight } from 'lucide-react';

export default function InputOutputFactory() {
  const [a, setA] = useState<number>(2);
  const [b, setB] = useState<number>(3);
  const [inputX, setInputX] = useState<number>(4);
  
  // Animation States
  const [status, setStatus] = useState<'idle' | 'dropping' | 'churning' | 'ejecting'>('idle');
  const [activeX, setActiveX] = useState<number>(inputX);
  const [outputY, setOutputY] = useState<number | null>(null);

  // Trigger the machine sequence
  const runMachine = () => {
    if (status !== 'idle') return;
    
    setActiveX(inputX);
    setOutputY(null);
    setStatus('dropping');

    setTimeout(() => {
      setStatus('churning');
    }, 800);

    setTimeout(() => {
      setOutputY((a * inputX) + b);
      setStatus('ejecting');
    }, 2400);

    setTimeout(() => {
      setStatus('idle');
    }, 4500);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 z-10">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          <Cpu className="text-emerald-500" /> The Input-Output Factory
        </h2>
        <p className="text-stone-400 text-sm mt-1">
          Visualizing the linear polynomial y = ax + b as a mechanical process.
        </p>
      </div>

      {/* FACTORY DISPLAY AREA */}
      <div className="flex-1 w-full relative bg-[#151414] rounded-2xl border border-stone-800 overflow-hidden shadow-inner flex flex-col items-center justify-center p-8">
        
        {/* The Funnel */}
        <div className="relative w-48 h-24 flex justify-center z-20">
          <div className="absolute top-0 w-48 h-12 bg-stone-800 border-x-4 border-t-4 border-stone-700 rounded-t-xl" />
          <div className="absolute top-12 w-24 h-12 bg-stone-800 border-x-4 border-stone-700 clip-funnel" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)' }}/>
               
          {/* Input Block (Raw Material) */}
          <AnimatePresence>
            {(status === 'dropping' || status === 'churning') && (
              <motion.div 
                initial={{ y: -60, opacity: 0, scale: 0.8 }}
                animate={{ 
                  y: status === 'dropping' ? 40 : 120, 
                  opacity: status === 'churning' ? 0 : 1,
                  scale: status === 'churning' ? 0.5 : 1 
                }}
                transition={{ duration: 0.6, type: "spring" }}
                className="absolute z-10 w-12 h-12 bg-sky-500 rounded-lg shadow-lg flex items-center justify-center border-2 border-sky-300"
              >
                <span className="text-white font-bold font-mono text-lg">x={activeX}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The Machine Body */}
        <motion.div 
          animate={status === 'churning' ? { 
            x: [-2, 2, -2, 2, 0], 
            y: [1, -1, 1, -1, 0] 
          } : {}}
          transition={{ repeat: status === 'churning' ? Infinity : 0, duration: 0.2 }}
          className="relative w-72 h-64 bg-stone-800 border-4 border-stone-700 rounded-3xl shadow-2xl z-30 flex flex-col items-center justify-center p-6"
        >
          <div className="absolute top-4 left-4 flex gap-2">
            <div className={`w-3 h-3 rounded-full ${status === 'idle' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
            <div className={`w-3 h-3 rounded-full ${status === 'churning' ? 'bg-amber-500 animate-ping' : 'bg-stone-600'}`} />
          </div>

          <h3 className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-4">Processing Unit</h3>
          
          {/* LED Screen */}
          <div className="w-full h-24 bg-stone-950 border-2 border-stone-900 rounded-xl flex items-center justify-center shadow-inner overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] pointer-events-none" />
            
            {status === 'idle' && (
              <span className="text-emerald-400 font-mono text-2xl">y = {a}x {b >= 0 ? '+' : '-'} {Math.abs(b)}</span>
            )}
            {status === 'dropping' && (
              <span className="text-sky-400 font-mono text-2xl">Load: x = {activeX}</span>
            )}
            {status === 'churning' && (
              <span className="text-amber-400 font-mono text-xl animate-pulse">({a} × {activeX}) {b >= 0 ? '+' : '-'} {Math.abs(b)}</span>
            )}
            {status === 'ejecting' && (
              <span className="text-emerald-400 font-mono text-2xl">y = {outputY}</span>
            )}
          </div>
        </motion.div>

        {/* The Conveyor Belt Area */}
        <div className="relative w-96 h-20 mt-4 flex items-center justify-center z-10">
          <div className="absolute w-full h-4 bg-stone-700 rounded-full bottom-2 border-b-4 border-stone-900 overflow-hidden">
            <motion.div 
              animate={{ backgroundPositionX: status === 'ejecting' ? 100 : 0 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-full h-full opacity-30"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #000 10px, #000 20px)' }}
            />
          </div>

          {/* Output Block (Finished Product) */}
          <AnimatePresence>
            {status === 'ejecting' && (
              <motion.div 
                initial={{ x: -100, y: 0, opacity: 0, scale: 0.5 }}
                animate={{ x: 150, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute z-20 w-14 h-14 bg-emerald-500 rounded-lg shadow-lg flex items-center justify-center border-2 border-emerald-300 bottom-6"
              >
                <span className="text-white font-bold font-mono text-lg">y={outputY}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* CONTROLS HUD */}
      <div className="mt-6 bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-8 relative z-20">
        
        {/* Machine Programming */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Settings size={14} /> Program Machine (y = ax + b)
          </h3>
          
          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-stone-400 font-mono">
                <span>Multiplier (a)</span> <span className="font-bold text-white">{a}</span>
              </div>
              <input type="range" min="-5" max="5" step="1" value={a} disabled={status !== 'idle'} onChange={(e) => setA(parseInt(e.target.value))} className="w-full accent-emerald-500 disabled:opacity-50" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-stone-400 font-mono">
                <span>Constant (b)</span> <span className="font-bold text-white">{b}</span>
              </div>
              <input type="range" min="-10" max="10" step="1" value={b} disabled={status !== 'idle'} onChange={(e) => setB(parseInt(e.target.value))} className="w-full accent-emerald-500 disabled:opacity-50" />
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-16 bg-stone-800" />

        {/* Input Control & Run */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Raw Material (Input x)</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-stone-400 font-mono">
                <span>Value (x)</span> <span className="font-bold text-sky-400">{inputX}</span>
              </div>
              <input type="range" min="-10" max="10" step="1" value={inputX} disabled={status !== 'idle'} onChange={(e) => setInputX(parseInt(e.target.value))} className="w-full accent-sky-500 disabled:opacity-50" />
            </div>
            
            <button 
              onClick={runMachine}
              disabled={status !== 'idle'}
              className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg"
            >
              {status === 'idle' ? <Play size={18} fill="currentColor" /> : <Settings size={18} className="animate-spin" />}
              {status === 'idle' ? 'Run' : 'Busy'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}