'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, RotateCcw, Calculator, ArrowRight, Zap, Target } from 'lucide-react';

export default function SolarShadowCaster() {
  // Sun's Altitude Angle
  const [angle, setAngle] = useState<number>(60);

  // Constants for the textbook problem
  const TOWER_HEIGHT_M = 34.64; // 20 * sqrt(3)
  
  // Real-world math
  const angleRad = (angle * Math.PI) / 180;
  const shadowLengthM = TOWER_HEIGHT_M / Math.tan(angleRad);

  // SVG Mapping Constants
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 500;
  const PIXELS_PER_METER = 6;
  const GROUND_Y = 400;
  const TOWER_X = 150;

  // Pixel Coordinates
  const towerPxHeight = TOWER_HEIGHT_M * PIXELS_PER_METER;
  const shadowPxLength = shadowLengthM * PIXELS_PER_METER;
  
  const towerTopY = GROUND_Y - towerPxHeight;
  const shadowTipX = TOWER_X + shadowPxLength;

  // Sun Position (Tracing the line of sight backwards from the shadow tip through the tower)
  const SUN_DISTANCE = 180;
  const sunX = TOWER_X - SUN_DISTANCE * Math.cos(angleRad);
  const sunY = towerTopY - SUN_DISTANCE * Math.sin(angleRad);

  const handleReset = () => setAngle(60);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Sun className="text-amber-400" /> The Solar Shadow Caster
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing inverse trigonometric relationships.
          </p>
        </div>
        {angle !== 60 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Sun
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE 3D SCENE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Sun */}
            <g transform={`translate(${sunX}, ${sunY})`} className="transition-all duration-75">
              <circle cx="0" cy="0" r="40" fill="#fef08a" opacity="0.2" className="animate-pulse" />
              <circle cx="0" cy="0" r="25" fill="#fde047" className="drop-shadow-[0_0_40px_rgba(253,224,71,1)]" />
            </g>

            {/* Light Rays */}
            <line x1={sunX} y1={sunY} x2={shadowTipX} y2={GROUND_Y} stroke="#fef08a" strokeWidth="2" strokeDasharray="8 6" opacity="0.5" className="transition-all duration-75" />

            {/* The Ground */}
            <rect x="0" y={GROUND_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - GROUND_Y} fill="#292524" />
            <line x1="0" y1={GROUND_Y} x2={VIEW_WIDTH} y2={GROUND_Y} stroke="#57534e" strokeWidth="4" />

            {/* The Shadow */}
            <line 
              x1={TOWER_X} y1={GROUND_Y} 
              x2={shadowTipX} y2={GROUND_Y} 
              stroke="#000000" strokeWidth="12" strokeLinecap="round" opacity="0.7" 
              className="transition-all duration-75" 
            />
            
            {/* Shadow Measurement Marker */}
            <line x1={TOWER_X} y1={GROUND_Y + 25} x2={shadowTipX} y2={GROUND_Y + 25} stroke="#a8a29e" strokeWidth="2" className="transition-all duration-75" />
            <line x1={shadowTipX} y1={GROUND_Y + 15} x2={shadowTipX} y2={GROUND_Y + 35} stroke="#a8a29e" strokeWidth="2" className="transition-all duration-75" />
            <text x={(TOWER_X + shadowTipX) / 2} y={GROUND_Y + 45} fill="#fbbf24" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-mono transition-all duration-75">
              {shadowLengthM.toFixed(1)}m
            </text>

            {/* The Tower */}
            <rect x={TOWER_X - 15} y={towerTopY} width="30" height={towerPxHeight} fill="#44403c" stroke="#78716c" strokeWidth="2" />
            <line x1={TOWER_X - 35} y1={towerTopY} x2={TOWER_X - 35} y2={GROUND_Y} stroke="#a8a29e" strokeWidth="2" strokeDasharray="4 4" />
            <text x={TOWER_X - 45} y={(towerTopY + GROUND_Y) / 2} fill="#d6d3d1" fontSize="16" fontWeight="bold" textAnchor="end" className="font-mono">
              34.64m
            </text>
            <text x={TOWER_X - 45} y={(towerTopY + GROUND_Y) / 2 + 20} fill="#78716c" fontSize="12" textAnchor="end" className="font-mono">
              (20√3)
            </text>

            {/* Angle of Elevation Arc */}
            <path 
              d={`M ${shadowTipX - 40} ${GROUND_Y} A 40 40 0 0 1 ${shadowTipX - 40 * Math.cos(angleRad)} ${GROUND_Y - 40 * Math.sin(angleRad)}`} 
              fill="none" stroke="#38bdf8" strokeWidth="3" className="transition-all duration-75" 
            />
            <text 
              x={shadowTipX - 65} y={GROUND_Y - 15} 
              fill="#38bdf8" fontSize="20" fontWeight="bold" className="font-mono transition-all duration-75 drop-shadow-md"
            >
              {angle}°
            </text>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Environment Controls */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Solar Altitude Control</span>
              <Target size={14} className="text-sky-500" />
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-sky-400 font-bold">Sun Angle (θ)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{angle}°</span>
                </div>
                <input 
                  type="range" min="15" max="80" step="1" value={angle} 
                  onChange={(e) => setAngle(parseFloat(e.target.value))} 
                  className="w-full accent-sky-500" 
                />
              </div>

              <div className="flex justify-between gap-2 mt-2">
                <button onClick={() => setAngle(60)} className={`flex-1 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors border ${angle === 60 ? 'bg-sky-950 border-sky-500 text-sky-400 shadow-inner' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300'}`}>
                  Set 60°
                </button>
                <button onClick={() => setAngle(30)} className={`flex-1 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors border ${angle === 30 ? 'bg-sky-950 border-sky-500 text-sky-400 shadow-inner' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300'}`}>
                  Set 30°
                </button>
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Tangent Ratio Engine</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              {/* Dynamic Equation */}
              <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-2">
                  <span>tan(θ) = Opp / Adj</span>
                </div>
                
                <div className="flex items-center justify-between font-mono text-lg">
                  <span className="text-sky-400">tan({angle}°)</span>
                  <span className="text-stone-500">=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b border-stone-600 pb-1 text-white">34.64</span>
                    <span className="pt-1 text-amber-400">{shadowLengthM.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-auto pt-2">
                <AnimatePresence mode="wait">
                  {angle === 60 ? (
                    <motion.div key="60" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                      <div className="bg-sky-950/20 border border-sky-900/50 p-4 rounded-lg flex items-start gap-3">
                        <Zap className="text-sky-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-sky-200/90 text-xs leading-relaxed">
                          At <strong>60°</strong>, the sun is high in the sky. The tangent ratio (sqrt(3) ~= 1.73) is greater than 1, meaning the tower is taller than its shadow. The shadow length is <strong>20m</strong>.
                        </p>
                      </div>
                    </motion.div>
                  ) : angle === 30 ? (
                    <motion.div key="30" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                      <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-lg flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <Zap className="text-amber-400 shrink-0 mt-0.5" size={18} />
                          <p className="text-amber-200/90 text-xs leading-relaxed">
                            At <strong>30°</strong>, the sun drops lower. The tangent ratio (sqrt(3) / 3 ~= 0.57) drops below 1. To balance this smaller fraction, the denominator MUST increase!
                          </p>
                        </div>
                        <div className="border-t border-amber-900/50 pt-3 flex items-center justify-between">
                          <span className="text-amber-400/80 font-bold uppercase tracking-widest text-[10px]">Shadow Growth:</span>
                          <span className="font-mono text-white font-bold">60m - 20m = <span className="text-amber-400">40m</span></span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="scrub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                      <p className="text-stone-300 font-sans text-xs leading-relaxed mt-2">
                        Scrub the Sun slider. Because the tower's height (the numerator) is permanently locked at <strong className="text-white">34.64m</strong>, changing the angle forces the shadow (the denominator) to stretch and squash to satisfy the tangent fraction!
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