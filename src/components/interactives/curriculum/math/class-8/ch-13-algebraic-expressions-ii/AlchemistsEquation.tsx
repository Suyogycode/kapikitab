'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RotateCcw, Sparkles, Plus, Divide, ShieldQuestion } from 'lucide-react';

export default function AlchemistsEquation() {
  const [step, setStep] = useState<number>(0);
  const [laserActive, setLaserActive] = useState<boolean>(false);

  // ==================================================================
  // MATH ENGINE: State Machine for the Trick
  // ==================================================================
  const advanceStep = () => {
    if (step === 3) {
      // Trigger the laser effect before advancing to step 4
      setLaserActive(true);
      setTimeout(() => {
        setLaserActive(false);
        setStep(4);
      }, 500);
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setLaserActive(false);
  };

  // Determine which items exist on the scale based on the current step
  const getItems = () => {
    const items = [];
    
    // The Original Mystery Box (x)
    if (step >= 1 && step < 5) {
      items.push({ id: 'orb-1', type: 'orb', exitType: 'shatter' });
    }
    // The Duplicated Box (2x)
    if (step >= 2 && step < 4) {
      items.push({ id: 'orb-2', type: 'orb', exitType: 'evaporate' });
    }
    // The Constants (+4)
    if (step >= 3) {
      items.push({ id: 'peb-1', type: 'pebble' });
      items.push({ id: 'peb-2', type: 'pebble' });
    }
    if (step >= 3 && step < 4) {
      items.push({ id: 'peb-3', type: 'pebble', exitType: 'evaporate' });
      items.push({ id: 'peb-4', type: 'pebble', exitType: 'evaporate' });
    }

    return items;
  };

  const currentItems = getItems();

  // Animation Maps
  const getExitAnim = (exitType: string) => {
    if (exitType === 'shatter') {
      return { opacity: 0, scale: 2.5, backgroundColor: '#ef4444', filter: 'blur(10px)', transition: { duration: 0.5 } };
    }
    return { opacity: 0, y: -100, scale: 0.5, transition: { duration: 0.5 } };
  };

  // UI Text Maps
  const stepTitles = [
    "Start the Magic",
    "Think of a Number",
    "Double It",
    "Add Four",
    "Divide by Two",
    "Subtract Original Number"
  ];

  const equations = ["?", "x", "2x", "2x + 4", "x + 2", "2"];

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Alchemist's Equation
          </h2>
          <p className="text-stone-400 text-sm mt-1">Decoding "Think of a Number" Tricks.</p>
        </div>
      </div>

      {/* THE MAIN CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-6 z-10 overflow-hidden">
        
        {/* The Equation Tracker */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-stone-700">
          {equations.map((eq, i) => (
            <React.Fragment key={i}>
              <span className={`font-mono text-lg font-bold transition-colors ${i === step ? 'text-emerald-400' : i < step ? 'text-stone-400' : 'text-stone-700'}`}>
                {eq}
              </span>
              {i < equations.length - 1 && <span className={`text-stone-700 ${i < step ? 'text-stone-500' : ''}`}>→</span>}
            </React.Fragment>
          ))}
        </div>

        {/* The Digital Scale Workspace */}
        <div className="relative w-full max-w-xl h-64 flex flex-col justify-end items-center pb-4 mt-12">
          
          {/* Laser Effect (Fired between step 3 and 4) */}
          <AnimatePresence>
            {laserActive && (
              <motion.div 
                initial={{ width: 0, opacity: 1 }} animate={{ width: '120%', opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 h-1 bg-rose-500 shadow-[0_0_20px_rgba(239,68,68,1)] z-50"
              />
            )}
          </AnimatePresence>

          {/* The Physical Objects */}
          <motion.div layout className="flex flex-wrap justify-center items-end gap-4 min-h-[80px] z-20 pb-4">
            <AnimatePresence>
              {currentItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ y: -50, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1, backgroundColor: item.type === 'orb' ? '#10b981' : '#e7e5e4' }}
                  exit={getExitAnim(item.exitType || 'evaporate')}
                  className={`flex items-center justify-center shadow-xl ${
                    item.type === 'orb' 
                      ? 'w-16 h-16 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border-2 border-emerald-400' 
                      : 'w-10 h-10 rounded-full border border-stone-300'
                  }`}
                >
                  {item.type === 'orb' ? (
                    <span className="text-white font-mono font-bold">x</span>
                  ) : (
                    <span className="text-stone-800 font-mono font-bold text-sm">1</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* The Scale Base */}
          <div className="w-[80%] h-4 bg-stone-800 rounded-full border-b-4 border-stone-900 shadow-2xl z-10" />
        </div>

        {/* AHA! MESSAGE BOX */}
        <div className="absolute bottom-6 w-full max-w-2xl px-4 z-50">
          <AnimatePresence mode="wait">
            {step === 5 ? (
              <motion.div key="aha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl shadow-2xl flex items-start gap-4">
                <Sparkles size={28} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-50 text-sm leading-relaxed">
                  <strong>The Trick Revealed:</strong> Did you see the final step? The glowing green box (<span className="font-mono">x</span>) shattered and canceled itself out! Because the algebraic variable is physically removed from the scale, the final answer will <em>always</em> be exactly 2 pebbles, regardless of what number the player originally hid inside the box!
                </p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/60 backdrop-blur-md border border-stone-700/50 p-4 rounded-xl shadow-lg flex items-center justify-center gap-3">
                <ShieldQuestion size={20} className="text-stone-400 shrink-0" />
                <p className="text-stone-300 text-sm">
                  Follow the magician's instructions to manipulate the algebraic objects.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex justify-center z-10 shrink-0 h-16">
        {step < 5 ? (
          <button 
            onClick={advanceStep}
            disabled={laserActive}
            className="w-full sm:w-auto px-10 h-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {step === 0 && <><Wand2 size={18} /> {stepTitles[step + 1]}</>}
            {step === 1 && <><Plus size={18} /> {stepTitles[step + 1]}</>}
            {step === 2 && <><Plus size={18} /> {stepTitles[step + 1]}</>}
            {step === 3 && <><Divide size={18} /> {stepTitles[step + 1]}</>}
            {step === 4 && <><RotateCcw size={18} /> {stepTitles[step + 1]}</>}
          </button>
        ) : (
          <button 
            onClick={handleReset}
            className="w-full sm:w-auto px-10 h-full bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <RotateCcw size={18} /> Reveal Another Trick
          </button>
        )}
      </div>

    </div>
  );
}