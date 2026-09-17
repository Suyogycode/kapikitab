'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowUpRight, ArrowDownRight, RotateCcw, Scan, Wind, Sprout } from 'lucide-react';

export default function ObserversEye() {
  // Y-coordinate of the target the girl is looking at (100 = Balloon, 300 = Horizontal, 500 = Pot)
  const [viewY, setViewY] = useState<number>(300);

  // SVG Coordinates
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 600;
  
  const EYE_X = 200;
  const EYE_Y = 300;
  const TARGET_X = 600;

  const BALLOON_Y = 100;
  const POT_Y = 500;

  // Math Calculations
  const dx = TARGET_X - EYE_X;
  const dy = EYE_Y - viewY; // Inverted Y-axis for math
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;
  const absAngle = Math.abs(angleDeg);

  const isElevation = viewY < EYE_Y;
  const isDepression = viewY > EYE_Y;
  const isLockedOnPot = viewY === POT_Y;
  const isLockedOnBalloon = viewY === BALLOON_Y;

  // SVG Arc Calculation Helper
  const arcRadius = 80;
  const arcX = EYE_X + arcRadius * Math.cos(angleRad);
  const arcY = EYE_Y - arcRadius * Math.sin(angleRad);
  
  // Sweep flag determines which way the arc curves
  const sweepFlag = isElevation ? 0 : 1;
  const arcPath = `M ${EYE_X + arcRadius} ${EYE_Y} A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${arcX} ${arcY}`;

  // Alternate Interior Arc (Z-pattern) for the Pot
  const altArcX = TARGET_X - arcRadius * Math.cos(angleRad);
  const altArcY = POT_Y + arcRadius * Math.sin(angleRad); // + because angleRad is negative here
  const altArcPath = `M ${TARGET_X - arcRadius} ${POT_Y} A ${arcRadius} ${arcRadius} 0 0 1 ${altArcX} ${altArcY}`;

  const handleReset = () => setViewY(300);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Eye className="text-sky-400" /> The Observer's Eye
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Understanding Line of Sight, Elevation, and Depression.
          </p>
        </div>
        {viewY !== 300 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset View
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE 3D SCENE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#0f172a] to-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Building / Balcony */}
            <rect x="0" y={EYE_Y + 50} width={EYE_X + 50} height={VIEW_HEIGHT} fill="#292524" />
            <rect x={EYE_X} y={EYE_Y + 10} width="50" height="40" fill="#44403c" />
            <line x1="0" y1={EYE_Y + 50} x2={EYE_X + 50} y2={EYE_Y + 50} stroke="#57534e" strokeWidth="6" />

            {/* The Ground */}
            <rect x={EYE_X + 50} y={POT_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - POT_Y} fill="#1c1917" />
            <line x1={EYE_X + 50} y1={POT_Y} x2={VIEW_WIDTH} y2={POT_Y} stroke="#44403c" strokeWidth="4" />

            {/* The Girl (Observer) */}
            <circle cx={EYE_X} cy={EYE_Y} r="12" fill="#fda4af" />
            <line x1={EYE_X} y1={EYE_Y + 12} x2={EYE_X} y2={EYE_Y + 50} stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
            
            {/* The Hot Air Balloon */}
            <g transform={`translate(${TARGET_X}, ${BALLOON_Y})`}>
              <circle cx="0" cy="-20" r="30" fill="#fca5a5" />
              <rect x="-10" y="20" width="20" height="15" fill="#78716c" rx="2" />
              <line x1="-15" y1="5" x2="-10" y2="20" stroke="#a8a29e" strokeWidth="2" />
              <line x1="15" y1="5" x2="10" y2="20" stroke="#a8a29e" strokeWidth="2" />
              <circle cx="0" cy="0" r="40" fill="transparent" className="cursor-pointer" onClick={() => setViewY(BALLOON_Y)} />
            </g>

            {/* The Flower Pot */}
            <g transform={`translate(${TARGET_X}, ${POT_Y})`}>
              <path d="M -15 0 L 15 0 L 10 -25 L -10 -25 Z" fill="#d97706" />
              <rect x="-18" y="-30" width="36" height="5" fill="#b45309" rx="2" />
              <circle cx="0" cy="-45" r="15" fill="#10b981" />
              <circle cx="0" cy="-25" r="40" fill="transparent" className="cursor-pointer" onClick={() => setViewY(POT_Y)} />
            </g>

            {/* Main Horizontal Level (Eye Level) */}
            <line x1={EYE_X} y1={EYE_Y} x2={VIEW_WIDTH - 50} y2={EYE_Y} stroke="#a8a29e" strokeWidth="3" strokeDasharray="8 8" />
            <text x={VIEW_WIDTH - 40} y={EYE_Y - 10} fill="#a8a29e" fontSize="14" fontWeight="bold" textAnchor="end" className="uppercase tracking-widest font-mono">Horizontal Level</text>

            {/* Line of Sight */}
            <line 
              x1={EYE_X} y1={EYE_Y} 
              x2={TARGET_X} y2={viewY} 
              stroke={isElevation ? "#38bdf8" : isDepression ? "#fbbf24" : "#e7e5e4"} 
              strokeWidth="4" 
              className="drop-shadow-md transition-all duration-75" 
            />

            {/* Target Crosshair */}
            <circle cx={TARGET_X} cy={viewY} r="8" fill="none" stroke={isElevation ? "#38bdf8" : isDepression ? "#fbbf24" : "#e7e5e4"} strokeWidth="3" className="transition-all duration-75" />

            {/* Observer Angle Arc */}
            <AnimatePresence>
              {absAngle > 2 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <path d={arcPath} fill="none" stroke={isElevation ? "#38bdf8" : "#fbbf24"} strokeWidth="3" />
                  <text 
                    x={EYE_X + 100} 
                    y={isElevation ? EYE_Y - 20 : EYE_Y + 30} 
                    fill={isElevation ? "#38bdf8" : "#fbbf24"} 
                    fontSize="22" 
                    fontWeight="bold" 
                    className="font-mono bg-stone-900 drop-shadow-md"
                  >
                    {absAngle.toFixed(1)}°
                  </text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Z-Pattern Reveal (Aha! Moment) */}
            <AnimatePresence>
              {isLockedOnPot && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  {/* Ground Horizontal Line */}
                  <line x1={EYE_X} y1={POT_Y} x2={VIEW_WIDTH - 50} y2={POT_Y} stroke="#10b981" strokeWidth="3" strokeDasharray="8 8" />
                  <text x={VIEW_WIDTH - 40} y={POT_Y - 10} fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="end" className="uppercase tracking-widest font-mono">Ground Level</text>
                  
                  {/* Alternate Interior Angle Arc */}
                  <path d={altArcPath} fill="none" stroke="#10b981" strokeWidth="3" />
                  <text 
                    x={TARGET_X - 110} 
                    y={POT_Y - 20} 
                    fill="#10b981" 
                    fontSize="22" 
                    fontWeight="bold" 
                    className="font-mono bg-stone-900 drop-shadow-md"
                  >
                    {absAngle.toFixed(1)}°
                  </text>
                  
                  {/* The "Z" Highlight */}
                  <path d={`M ${VIEW_WIDTH - 150} ${EYE_Y} L ${EYE_X} ${EYE_Y} L ${TARGET_X} ${POT_Y} L ${VIEW_WIDTH - 150} ${POT_Y}`} fill="none" stroke="#10b981" strokeWidth="8" opacity="0.15" />
                </motion.g>
              )}
            </AnimatePresence>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* View Controller */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Neck Control (Line of Sight)</span>
              <Scan size={14} className="text-sky-500" />
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between font-mono text-xl items-center">
                <span className="text-white font-bold text-sm">Angle (θ)</span>
                <span className={`px-4 py-2 rounded-lg border font-bold ${isElevation ? 'bg-sky-950 border-sky-800 text-sky-400' : isDepression ? 'bg-amber-950 border-amber-800 text-amber-400' : 'bg-stone-950 border-stone-700 text-stone-300'}`}>
                  {absAngle.toFixed(1)}°
                </span>
              </div>
              
              <input 
                type="range" min={BALLOON_Y} max={POT_Y} step="1" value={viewY} 
                onChange={(e) => setViewY(parseInt(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isElevation ? 'accent-sky-500 bg-stone-800' : isDepression ? 'accent-amber-500 bg-stone-800' : 'accent-stone-400 bg-stone-800'}`} 
              />
              
              <div className="flex justify-between gap-2 mt-2">
                <button onClick={() => setViewY(BALLOON_Y)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border ${isLockedOnBalloon ? 'bg-sky-950 border-sky-500 text-sky-400 shadow-inner' : 'bg-stone-950 hover:bg-stone-800 border-stone-800 text-stone-500'}`}>
                  <Wind size={14} /> Look Up
                </button>
                <button onClick={() => setViewY(POT_Y)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border ${isLockedOnPot ? 'bg-amber-950 border-amber-500 text-amber-400 shadow-inner' : 'bg-stone-950 hover:bg-stone-800 border-stone-800 text-stone-500'}`}>
                  <Sprout size={14} /> Look Down
                </button>
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              {isElevation ? <ArrowUpRight className="text-sky-500" size={18} /> : isDepression ? <ArrowDownRight className="text-amber-500" size={18} /> : <Scan className="text-stone-500" size={18} />}
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric Classification</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {isElevation && !isLockedOnBalloon ? (
                  <motion.div key="elevation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-sky-400 font-bold text-lg uppercase tracking-widest">Angle of Elevation</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The line of sight is <strong className="text-white">above</strong> the horizontal level. 
                    </p>
                    <p className="text-stone-400 text-xs">
                      Lock onto the Hot Air Balloon to view a practical application.
                    </p>
                  </motion.div>
                ) : isLockedOnBalloon ? (
                  <motion.div key="balloon" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-sky-400 font-bold text-lg uppercase tracking-widest">Target Acquired</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      By knowing the horizontal distance to the balloon and measuring this angle of elevation (<strong className="text-sky-400 font-mono">{absAngle.toFixed(1)}°</strong>), we can use $\tan(\theta)$ to calculate exactly how high the balloon is flying without ever leaving the balcony!
                    </p>
                  </motion.div>
                ) : isDepression && !isLockedOnPot ? (
                  <motion.div key="depression" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-amber-400 font-bold text-lg uppercase tracking-widest">Angle of Depression</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      The line of sight is <strong className="text-white">below</strong> the horizontal level. 
                    </p>
                    <p className="text-stone-400 text-xs">
                      Lock onto the Flower Pot to reveal a powerful geometric shortcut.
                    </p>
                  </motion.div>
                ) : isLockedOnPot ? (
                  <motion.div key="pot" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-emerald-400 font-bold text-lg uppercase tracking-widest">The Z-Pattern Exposed!</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      Notice the faint green "Z" drawn on the screen? Because the eye-level horizontal line is strictly parallel to the ground line, they form <strong className="text-emerald-400">Alternate Interior Angles</strong>.
                    </p>
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl mt-2">
                      <p className="text-emerald-200/90 text-xs leading-relaxed">
                        This proves that your angle of depression looking DOWN at the pot is mathematically identical to the pot's angle of elevation looking UP at you (<strong className="text-emerald-400 font-mono">{absAngle.toFixed(1)}°</strong>). This completely flips how we solve the triangle!
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="horizontal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full items-center justify-center">
                    <p className="text-stone-500 font-bold uppercase tracking-widest text-center">Looking Straight Ahead</p>
                    <p className="text-stone-600 text-xs text-center">Angle = 0°</p>
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