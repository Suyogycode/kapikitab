'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, RotateCcw, Calculator, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

type Card = { id: string; suit: string; value: string; color: string; isFace: boolean; isAce: boolean };
type ColorFilter = 'all' | 'red' | 'black';
type SuitFilter = 'all' | 'hearts' | 'diamonds' | 'clubs' | 'spades';
type TypeFilter = 'all' | 'face' | 'number' | 'ace';

export default function DeckCascader() {
  // Query State
  const [colorFilter, setColorFilter] = useState<ColorFilter>('all');
  const [suitFilter, setSuitFilter] = useState<SuitFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Deck Generator
  const deck = useMemo(() => {
    const suits = [
      { name: 'hearts', color: 'red', symbol: '♥' },
      { name: 'diamonds', color: 'red', symbol: '♦' },
      { name: 'clubs', color: 'black', symbol: '♣' },
      { name: 'spades', color: 'black', symbol: '♠' }
    ];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const cards: Card[] = [];
    suits.forEach(suit => {
      values.forEach(val => {
        cards.push({
          id: `${val}-${suit.name}`,
          suit: suit.name,
          value: val,
          color: suit.color,
          isFace: ['J', 'Q', 'K'].includes(val),
          isAce: val === 'A'
        });
      });
    });
    return cards;
  }, []);

  // Evaluation Engine
  const isMatch = (card: Card) => {
    if (colorFilter !== 'all' && card.color !== colorFilter) return false;
    if (suitFilter !== 'all' && card.suit !== suitFilter) return false;
    if (typeFilter === 'face' && !card.isFace) return false;
    if (typeFilter === 'ace' && !card.isAce) return false;
    if (typeFilter === 'number' && (card.isFace || card.isAce)) return false;
    return true;
  };

  const matchingCardsCount = deck.filter(isMatch).length;

  const handleReset = () => {
    setColorFilter('all');
    setSuitFilter('all');
    setTypeFilter('all');
    setIsCalculated(false);
  };

  // Helper to render the physical playing card
  const getSuitSymbol = (suit: string) => {
    switch(suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Layers className="text-rose-500" /> The Deck Cascader
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Isolating Favorable Outcomes vs. Total Outcomes in Theoretical Probability.
          </p>
        </div>
        {isCalculated && (
          <button 
            onClick={() => setIsCalculated(false)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reassemble Deck
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE CARD GRID) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 perspective-[1000px]">
          
          {/* The Grid Container */}
          <div className="relative w-full max-w-[650px] aspect-[4/3] grid grid-cols-13 gap-1 sm:gap-2">
            
            {/* The Ghost Slots (Always visible in the background) */}
            {deck.map((card) => (
              <div 
                key={`ghost-${card.id}`} 
                className="w-full aspect-[2.5/3.5] rounded border border-stone-800 bg-stone-900/30 flex items-center justify-center"
              >
              </div>
            ))}

            {/* The Physical Cards (Float above the ghost slots) */}
            <div className="absolute inset-0 grid grid-cols-13 gap-1 sm:gap-2">
              {deck.map((card, index) => {
                const match = isMatch(card);
                
                return (
                  <motion.div
                    key={`card-${card.id}`}
                    initial={false}
                    animate={
                      isCalculated 
                        ? (match 
                            ? { y: -10, scale: 1.1, opacity: 1, rotateY: 0 } // Survivors float up
                            : { y: 600, scale: 0.5, opacity: 0, rotateZ: Math.random() * 90 - 45 }) // Losers shatter down
                        : { y: 0, scale: 1, opacity: 1, rotateY: 0, rotateZ: 0 } // Default grid
                    }
                    transition={{ 
                      duration: isCalculated ? 0.6 : 0.4, 
                      delay: isCalculated && !match ? index * 0.01 : 0, // Cascade effect for dropping
                      type: "spring", bounce: 0.3 
                    }}
                    className={`w-full aspect-[2.5/3.5] rounded bg-stone-100 flex flex-col items-center justify-center shadow-md border border-stone-300 ${card.color === 'red' ? 'text-rose-600' : 'text-slate-900'}`}
                  >
                    <span className="text-[10px] sm:text-xs font-bold leading-none">{card.value}</span>
                    <span className="text-xs sm:text-base leading-none">{getSuitSymbol(card.suit)}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Query Builder Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Event Query Builder</span>
              <Filter size={14} className="text-sky-500" />
            </div>
            
            <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isCalculated ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              
              {/* Color Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Card Color</span>
                <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800">
                  {['all', 'red', 'black'].map(opt => (
                    <button key={opt} onClick={() => setColorFilter(opt as ColorFilter)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded ${colorFilter === opt ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500'}`}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* Suit Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Card Suit</span>
                <div className="grid grid-cols-3 gap-1">
                  {['all', 'hearts', 'diamonds', 'clubs', 'spades'].map(opt => (
                    <button key={opt} onClick={() => setSuitFilter(opt as SuitFilter)} className={`py-1.5 text-xs font-bold uppercase rounded border ${suitFilter === opt ? 'bg-stone-800 border-stone-600 text-white' : 'bg-stone-950 border-stone-800 text-stone-500'} ${opt === 'all' ? 'col-span-3' : ''}`}>
                      {opt === 'all' ? 'All Suits' : getSuitSymbol(opt)} {opt !== 'all' ? opt : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Card Type</span>
                <div className="grid grid-cols-2 gap-1">
                  {['all', 'face', 'number', 'ace'].map(opt => (
                    <button key={opt} onClick={() => setTypeFilter(opt as TypeFilter)} className={`py-1.5 text-xs font-bold uppercase rounded border ${typeFilter === opt ? 'bg-stone-800 border-stone-600 text-white' : 'bg-stone-950 border-stone-800 text-stone-500'}`}>
                      {opt === 'all' ? 'All Types' : opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button 
              onClick={() => {
                if (isCalculated) handleReset();
                else setIsCalculated(true);
              }}
              className={`w-full py-4 font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 border-2 ${
                isCalculated ? 'bg-stone-800 border-stone-700 text-stone-300' : 'bg-sky-600 hover:bg-sky-500 border-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]'
              }`}
            >
              {isCalculated ? <RotateCcw size={18} /> : <Calculator size={18} />}
              {isCalculated ? 'Reset Constraints' : 'Calculate P(E)'}
            </button>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Sparkles className="text-rose-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Probability Formulation</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              {/* Dynamic Fraction Display */}
              <div className="bg-stone-950 border border-stone-800 p-5 rounded-xl flex items-center justify-between shadow-inner">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sky-400 text-[10px] uppercase tracking-widest font-bold">P(E) =</span>
                  <span className="text-stone-300 font-bold text-sm">Favorable Outcomes</span>
                  <span className="text-stone-500 border-t border-stone-700 pt-1.5 text-sm">Total Outcomes</span>
                </div>
                
                <div className="flex flex-col items-center text-4xl font-mono font-bold">
                  <motion.span 
                    key={isCalculated ? matchingCardsCount : 'num'}
                    initial={isCalculated ? { scale: 1.5, color: '#0ea5e9' } : {}}
                    animate={{ scale: 1, color: isCalculated ? '#f8fafc' : '#78716c' }}
                    className="border-b-2 border-stone-700 pb-2 px-6"
                  >
                    {isCalculated ? matchingCardsCount : '?'}
                  </motion.span>
                  <span className="pt-2 px-6 text-stone-500">52</span>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-4 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {!isCalculated ? (
                    <motion.div key="build" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-stone-400 text-xs leading-relaxed text-center italic">
                      Use the toggle switches to define an Event, such as finding a <strong className="text-rose-400 not-italic">Red Face Card</strong>. Then click Calculate to extract the favorable outcomes!
                    </motion.div>
                  ) : (
                    <motion.div key="aha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <CheckCircle2 className="text-sky-500 shrink-0 mt-0.5" size={20} />
                      <div className="flex flex-col gap-2">
                        <p className="text-sky-100/90 font-sans text-xs leading-relaxed">
                          <strong className="text-sky-400 uppercase tracking-widest">The "Aha!" Moment</strong><br/>
                          Every card that did not match your conditions was shattered and dropped from the equation.
                        </p>
                        <p className="text-stone-300 font-sans text-[11px] leading-relaxed">
                          However, notice the <strong className="text-stone-500">52 hollow ghost outlines</strong> remaining in the background. Even though only {matchingCardsCount} cards survived, the total mathematical space never changed. Probability is simply comparing the survivors to the total available slots!
                        </p>
                      </div>
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