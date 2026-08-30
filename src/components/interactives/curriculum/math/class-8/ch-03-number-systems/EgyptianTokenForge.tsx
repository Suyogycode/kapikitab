'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Magnet, AlertCircle, RotateCcw } from 'lucide-react';

// ==================================================================
// SYSTEM CONFIGURATION
// ==================================================================
type TokenType = 'staff' | 'heel' | 'rope' | 'lotus';

interface TokenData {
  id: string;
  type: TokenType;
}

const TOKEN_VALUES: Record<TokenType, number> = {
  staff: 1,
  heel: 10,
  rope: 100,
  lotus: 1000,
};

const TOKEN_COLORS: Record<TokenType, string> = {
  staff: 'bg-stone-300 text-stone-600',
  heel: 'bg-stone-600 text-stone-300',
  rope: 'bg-amber-700 text-amber-100',
  lotus: 'bg-emerald-700 text-emerald-100',
};

export default function EgyptianTokenForge() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isForging, setIsForging] = useState<boolean>(false);
  const [forgeTarget, setForgeTarget] = useState<TokenType | null>(null);

  // Calculate the total decimal value on the board
  const totalValue = useMemo(() => {
    return tokens.reduce((sum, token) => sum + TOKEN_VALUES[token.type], 0);
  }, [tokens]);

  // Count how many of each token type exist
  const counts = useMemo(() => {
    return tokens.reduce((acc, token) => {
      acc[token.type] = (acc[token.type] || 0) + 1;
      return acc;
    }, {} as Record<TokenType, number>);
  }, [tokens]);

  // ==================================================================
  // THE FORGE ENGINE (Pseudo-Physics Magnetic Pull)
  // ==================================================================
  const triggerForge = (typeToMerge: TokenType, upgradeTo: TokenType) => {
    if (isForging) return;
    setIsForging(true);
    setForgeTarget(typeToMerge);

    // Simulate the magnetic forge delay
    setTimeout(() => {
      setTokens(prev => {
        let merged = 0;
        const kept = prev.filter(t => {
          if (t.type === typeToMerge && merged < 10) {
            merged++;
            return false; // Remove this token
          }
          return true; // Keep everything else
        });

        // Add the upgraded token
        kept.push({
          id: `token-${Date.now()}`,
          type: upgradeTo,
        });

        return kept;
      });
      setIsForging(false);
      setForgeTarget(null);
    }, 800); // 800ms allows the CSS animation to look like it's sucking inward
  };

  const addToken = (type: TokenType) => {
    setTokens(prev => [...prev, { id: `token-${Date.now()}-${Math.random()}`, type }]);
  };

  const loadProblem = () => {
    // Loads 8 Heals + 14 Staffs = 94
    const newTokens: TokenData[] = [];
    for (let i = 0; i < 8; i++) newTokens.push({ id: `h-${i}`, type: 'heel' });
    for (let i = 0; i < 14; i++) newTokens.push({ id: `s-${i}`, type: 'staff' });
    setTokens(newTokens);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-4 flex items-start justify-between z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-2">
            The Egyptian Token Forge
          </h2>
          <p className="text-stone-400 text-sm mt-1">Visualizing arithmetic without Place Value.</p>
        </div>
        <div className="text-right bg-stone-900 border border-stone-800 px-4 py-2 rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">Decimal Total</p>
          <p className="text-2xl font-mono text-emerald-400 font-bold">{totalValue}</p>
        </div>
      </div>

      {/* THE SANDBOX CANVAS */}
      <div className="flex-1 w-full bg-stone-900/50 rounded-2xl border border-stone-800 shadow-inner relative overflow-hidden flex flex-col p-4 sm:p-8 z-10">
        
        {/* Token Area */}
        <div className="flex-1 flex flex-wrap content-start justify-center gap-3 relative">
          <AnimatePresence>
            {tokens.map((token) => {
              // If this token type is actively being forged, we shrink it to the center
              const isBeingForged = isForging && token.type === forgeTarget;
              
              return (
                <motion.div
                  layout
                  key={token.id}
                  initial={{ opacity: 0, scale: 0, y: -20, rotate: Math.random() * 20 - 10 }}
                  animate={{ 
                    opacity: isBeingForged ? 0 : 1, 
                    scale: isBeingForged ? 0 : 1, 
                    x: isBeingForged ? 0 : 0, // In a full 2D engine, we'd target a centroid. Here, scale 0 creates a clean vacuum effect.
                    rotate: isBeingForged ? 180 : 0
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`w-10 h-16 sm:w-12 sm:h-20 ${TOKEN_COLORS[token.type]} rounded-md border border-white/20 shadow-md flex items-center justify-center cursor-pointer hover:brightness-110`}
                >
                  {/* SVG PLACEHOLDER */}
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 -rotate-90 whitespace-nowrap">
                    {token.type}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {tokens.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
              <p className="text-stone-500 font-mono tracking-widest uppercase text-sm">Drop tokens to begin</p>
            </div>
          )}
        </div>

        {/* FORGE CONTROLS (The Aha! Moment Triggers) */}
        <div className="w-full flex flex-col sm:flex-row gap-4 mt-6 justify-center">
          <AnimatePresence>
            {(counts['staff'] >= 10) && (
              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => triggerForge('staff', 'heel')}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-colors"
              >
                <Magnet size={18} /> Forge 10 Staffs → 1 Heel
              </motion.button>
            )}
            {(counts['heel'] >= 10) && (
              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => triggerForge('heel', 'rope')}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-colors"
              >
                <Magnet size={18} /> Forge 10 Heels → 1 Rope
              </motion.button>
            )}
            {(counts['rope'] >= 10) && (
              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => triggerForge('rope', 'lotus')}
                className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(6,95,70,0.4)] transition-colors"
              >
                <Magnet size={18} /> Forge 10 Ropes → 1 Lotus
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* EDUCATIONAL INSIGHT CARD */}
      {tokens.length > 15 && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-stone-900 border border-stone-700 p-4 rounded-xl flex items-start gap-3">
           <AlertCircle className="text-amber-500 shrink-0" size={20} />
           <p className="text-stone-300 text-sm leading-relaxed">
             <strong>The Carry-Over Problem:</strong> In our modern system, we just shift a digit one place to the left. The Egyptians had to physically replace ten symbols with a brand new symbol. Notice how crowded the board gets before a forge!
           </p>
         </motion.div>
      )}

      {/* DISPENSER CONTROLS */}
      <div className="mt-6 flex flex-wrap gap-3 z-10 shrink-0 bg-stone-900 p-4 border border-stone-800 rounded-2xl">
        <button onClick={() => addToken('staff')} className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-3 rounded-xl transition-colors font-mono text-sm">
          <Plus size={16} /> Staff (1)
        </button>
        <button onClick={() => addToken('heel')} className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-3 rounded-xl transition-colors font-mono text-sm">
          <Plus size={16} /> Heel (10)
        </button>
        <button onClick={() => addToken('rope')} className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-3 rounded-xl transition-colors font-mono text-sm">
          <Plus size={16} /> Rope (100)
        </button>
        <button onClick={() => addToken('lotus')} className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-3 rounded-xl transition-colors font-mono text-sm">
          <Plus size={16} /> Lotus (1k)
        </button>
        
        <div className="w-full h-px bg-stone-800 my-1" />
        
        <button onClick={loadProblem} className="flex-1 flex items-center justify-center gap-2 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 px-4 py-3 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest">
          Load Problem (84 + 10)
        </button>
        <button onClick={() => setTokens([])} className="flex-1 flex items-center justify-center gap-2 bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-900 px-4 py-3 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest">
          <RotateCcw size={16} /> Clear
        </button>
      </div>

    </div>
  );
}