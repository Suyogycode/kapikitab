'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Calculator, Paintbrush, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GeometricSplatterRoom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [totalDrops, setTotalDrops] = useState(0);
  const [insideDrops, setInsideDrops] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  
  // Dimensions and Scale (1 meter = 200 pixels)
  const SCALE = 200;
  const WIDTH_M = 3;
  const HEIGHT_M = 2;
  const CANVAS_W = WIDTH_M * SCALE; // 600px
  const CANVAS_H = HEIGHT_M * SCALE; // 400px
  
  // Circle Properties
  const CIRCLE_R_M = 0.5; // Diameter is 1m, so radius is 0.5m
  const CIRCLE_R_PX = CIRCLE_R_M * SCALE; // 100px
  const CX = CANVAS_W / 2;
  const CY = CANVAS_H / 2;

  // Theoretical Math
  const areaRect = WIDTH_M * HEIGHT_M; // 6
  const areaCircle = Math.PI * Math.pow(CIRCLE_R_M, 2); // 0.25π (~0.785)
  const theoreticalProb = areaCircle / areaRect; // ~13.09%

  // Live Experimental Math
  const experimentalProb = totalDrops === 0 ? 0 : insideDrops / totalDrops;

  // Draw the base blueprint (Outlines and Crosshairs)
  const drawBaseBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear board
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid Background
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    // Target Circle Outline
    ctx.beginPath();
    ctx.arc(CX, CY, CIRCLE_R_PX, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b'; // Amber
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Crosshair
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY); ctx.lineTo(CX + 10, CY);
    ctx.moveTo(CX, CY - 10); ctx.lineTo(CX, CY + 10);
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
  }, [CANVAS_W, CANVAS_H, CX, CY, CIRCLE_R_PX]);

  // Initial render
  useEffect(() => {
    drawBaseBoard();
  }, [drawBaseBoard]);

  // The High-Performance Splatter Engine
  const fireDrops = useCallback((count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let newInside = 0;

    for (let i = 0; i < count; i++) {
      // Random position on the 3x2 board
      const x = Math.random() * CANVAS_W;
      const y = Math.random() * CANVAS_H;

      // Distance formula to check if inside the circle
      const dist = Math.hypot(x - CX, y - CY);
      const isInside = dist <= CIRCLE_R_PX;
      
      if (isInside) newInside++;

      // Draw the splatter drop directly to the canvas
      ctx.fillStyle = isInside ? '#10b981' : '#0ea5e9'; // Emerald inside, Sky outside
      ctx.beginPath();
      // Slight randomness to drop size for organic feel
      const dropSize = Math.random() * 1.5 + 0.5;
      ctx.arc(x, y, dropSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Batch update React state
    setTotalDrops(prev => prev + count);
    setInsideDrops(prev => prev + newInside);
  }, [CANVAS_W, CANVAS_H, CX, CY, CIRCLE_R_PX]);

  // Continuous Firing Loop
  useEffect(() => {
    let animationFrameId: number;
    
    const loop = () => {
      if (isFiring) {
        fireDrops(150); // Fire 150 drops per frame (approx 9000/sec)
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    if (isFiring) {
      loop();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isFiring, fireDrops]);

  const handleReset = () => {
    setTotalDrops(0);
    setInsideDrops(0);
    setIsFiring(false);
    drawBaseBoard();
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Target className="text-sky-500" /> The Geometric Splatter Room
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Where Probability meets Area: 1m circle inside a 3m × 2m board.
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Clear Canvas
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center z-10">
        
        {/* INTERACTIVE CANVAS WORKSPACE */}
        <div className="relative w-full max-w-[600px] aspect-[3/2] bg-[#151414] border-[4px] border-stone-800 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center touch-none">
          <canvas 
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-full"
          />
          
          {/* Firing Overlay Prompt */}
          <AnimatePresence>
            {totalDrops === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-stone-950/80 backdrop-blur-sm border border-stone-800 px-6 py-3 rounded-full text-stone-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2 animate-pulse">
                  Hold "Fire Dye Drops" to begin
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Main Firing Control */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
              <span>Dye Dropper Control</span>
              {isFiring && <span className="text-rose-500 animate-pulse flex items-center gap-1"><Zap size={12}/> Firing</span>}
            </div>
            
            <button 
              onPointerDown={(e) => { e.preventDefault(); setIsFiring(true); }}
              onPointerUp={() => setIsFiring(false)}
              onPointerLeave={() => setIsFiring(false)}
              className={`w-full py-6 rounded-xl text-lg font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg border active:scale-95 touch-none ${
                isFiring 
                  ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.6)]' 
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              <Paintbrush size={24} />
              {isFiring ? 'Unleashing Storm...' : 'Fire Dye Drops'}
            </button>
            <p className="text-[10px] text-stone-500 text-center font-bold tracking-widest uppercase">
              Press and hold to fire ~9,000 drops per second
            </p>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric Probability</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              {/* Counters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sky-950/30 border border-sky-900/50 p-3 rounded-lg flex flex-col">
                  <span className="text-sky-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Drops</span>
                  <span className="text-xl text-white font-bold">{totalDrops.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg flex flex-col">
                  <span className="text-emerald-500 text-[10px] uppercase tracking-widest font-bold mb-1">Inside Circle</span>
                  <span className="text-xl text-emerald-400 font-bold">{insideDrops.toLocaleString()}</span>
                </div>
              </div>

              {/* The Live Ratio vs Theoretical */}
              <div className="space-y-4 pt-4 border-t border-stone-800">
                
                {/* Theoretical Area */}
                <div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1">
                    <span>Theoretical (Area Ratio)</span>
                    <span className="text-stone-300">{(theoreticalProb * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-stone-950 p-3 rounded-lg border border-stone-800 text-xs text-stone-300">
                    <div className="flex flex-col items-center">
                      <span className="border-b border-stone-600 pb-1">Area of Circle (πr²)</span>
                      <span className="pt-1">Area of Rect (l × w)</span>
                    </div>
                    <span>=</span>
                    <div className="flex flex-col items-center">
                      <span className="border-b border-stone-600 pb-1">0.25π</span>
                      <span className="pt-1">6</span>
                    </div>
                    <span>≈ {theoreticalProb.toFixed(4)}</span>
                  </div>
                </div>

                {/* Experimental Chaos */}
                <div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-sky-400 mb-1">
                    <span>Experimental (Physical Splatters)</span>
                    <span className="text-white">{(experimentalProb * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-sky-950/20 p-3 rounded-lg border border-sky-900/50 text-xs text-stone-300 transition-colors">
                    <div className="flex flex-col items-center">
                      <span className="border-b border-sky-900 pb-1 text-emerald-400">Drops Inside</span>
                      <span className="pt-1 text-sky-400">Total Drops</span>
                    </div>
                    <span>=</span>
                    <div className="flex flex-col items-center">
                      <span className="border-b border-sky-900 pb-1 text-emerald-400">{insideDrops}</span>
                      <span className="pt-1 text-sky-400">{totalDrops}</span>
                    </div>
                    <span>≈ {experimentalProb.toFixed(4)}</span>
                  </div>
                </div>

              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-stone-800">
                <AnimatePresence mode="wait">
                  {totalDrops > 1000 ? (
                    <motion.div 
                      key="aha"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-sky-950/30 border border-sky-900/50 p-4 rounded-xl flex items-start gap-3"
                    >
                      <Zap className="text-sky-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-sky-400 font-bold text-xs uppercase tracking-widest mb-1">Area is Likelihood</h4>
                        <p className="text-sky-100/80 font-sans text-xs leading-relaxed">
                          As the board fills with thousands of chaotic paint splatters, the physical, experimental ratio locks in perfectly with the geometric area ratio! <br/><br/>
                          You have just proven that in geometric probability, the size of a shape literally dictates the likelihood of an event occurring inside it.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="prompt"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                      <p className="text-stone-400 text-xs leading-relaxed font-sans">
                        Press and hold the red <strong>Fire Dye Drops</strong> button. Watch the experimental ratio dynamically update as the canvas fills up. Let's see if the chaos matches the theory!
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