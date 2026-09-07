'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Trash2, Coins, Receipt, ArrowRight } from 'lucide-react';

export default function BrahmaguptasLedger() {
  // State to track the 4 debt bundles
  const [debts, setDebts] = useState([1, 2, 3, 4]);
  const removedCount = 4 - debts.length;
  
  // Wealth calculation: each removed debt (-3) adds +3 to wealth
  const deltaWealth = removedCount * 3;

  // Reset the simulation
  const handleReset = () => {
    setDebts([1, 2, 3, 4]);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Scale className="text-emerald-500" /> Brahmagupta's Ledger
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Proving why $(-3) \times (-4) = +12$ using Fortunes and Debts.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors"
        >
          Reset Ledger
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch justify-center z-10">
        
        {/* MERCHANT'S TABLE (Interactive Workspace) */}
        <div className="relative w-full lg:w-2/3 bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-stone-400 font-bold uppercase tracking-widest text-xs">The Merchant's Table</h3>
            <span className="bg-stone-900 px-3 py-1 rounded text-xs font-mono text-stone-500 border border-stone-800">
              Drag debts to the incinerator
            </span>
          </div>

          <div className="flex-1 flex items-center justify-between gap-8">
            
            {/* The Ledger Area (Where debts sit) */}
            <div className="flex-1 grid grid-cols-2 gap-4 place-items-center">
              <AnimatePresence>
                {debts.map((id) => (
                  <motion.div
                    key={id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, rotate: -15, filter: "brightness(0.5)" }}
                    drag
                    dragSnapToOrigin
                    onDragEnd={(event, info) => {
                      // Check if dragged far enough to the right (into the incinerator)
                      const isTrashed = info.offset.x > 150 || info.point.x > window.innerWidth / 2;
                      if (isTrashed) {
                        setDebts((prev) => prev.filter((debtId) => debtId !== id));
                      }
                    }}
                    whileDrag={{ scale: 1.1, zIndex: 50, cursor: "grabbing" }}
                    className="w-32 h-24 bg-rose-950 border-2 border-rose-800 rounded-xl shadow-lg flex flex-col items-center justify-center cursor-grab group hover:border-rose-500 transition-colors"
                  >
                    <Receipt className="text-rose-500 mb-1 opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
                    <span className="text-rose-300 font-mono font-bold text-lg">Debt: -3</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {debts.length === 0 && (
                <div className="col-span-2 text-center text-stone-600 font-mono text-sm border-2 border-dashed border-stone-800 rounded-xl p-8">
                  All debts cleared from the table.
                </div>
              )}
            </div>

            {/* The Incinerator (Drop Zone) */}
            <div className="w-40 h-full border-l-2 border-dashed border-stone-800 flex flex-col items-center justify-center pl-8">
              <div className="w-24 h-24 rounded-full border-4 border-stone-800 bg-stone-900 flex items-center justify-center relative overflow-hidden">
                <Trash2 size={32} className="text-stone-600" />
                {/* Visual fire/glow effect when a debt is removed */}
                <AnimatePresence>
                  {removedCount > 0 && (
                    <motion.div
                      key={removedCount}
                      initial={{ opacity: 0.8, scale: 0.8, y: 10 }}
                      animate={{ opacity: 0, scale: 1.5, y: -20 }}
                      transition={{ duration: 0.8 }}
                      className="absolute w-full h-full bg-orange-500 blur-xl mix-blend-screen"
                    />
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-4 text-center font-bold">
                Debt<br/>Incinerator
              </p>
            </div>

          </div>
        </div>

        {/* MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Coins className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Net Wealth Tracker</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm">
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-stone-500 text-xs uppercase tracking-wider">
                  <span>Action</span>
                  <span>Value</span>
                </div>
                <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800">
                  <span className="text-stone-400">Take away ($-$):</span>
                  <span className="text-white font-bold">{removedCount} bundles</span>
                </div>
                <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800">
                  <span className="text-stone-400">Of Debt ($-$):</span>
                  <span className="text-rose-400 font-bold">-3 per bundle</span>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="text-stone-600" />
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Active Equation</span>
                </div>
                <div className="text-lg text-white">
                  ${`(-${removedCount}) \\times (-3) = +${deltaWealth}`}
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <AnimatePresence>
                {removedCount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-stone-800"
                  >
                    <p className="text-stone-400 text-xs leading-relaxed font-sans">
                      By <strong>taking away</strong> (subtracting) a debt, your overall net worth physically increases. <br/><br/>
                      This is why multiplying a negative by a negative results in a <strong className="text-emerald-400">Positive Fortune</strong>.
                    </p>
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