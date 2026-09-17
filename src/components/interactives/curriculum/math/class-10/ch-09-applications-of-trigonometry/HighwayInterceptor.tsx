'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Play, Pause, RotateCcw, Timer, Radar, Zap } from 'lucide-react';

export default function HighwayInterceptor() {
  // Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  
  // FIXED: Explicitly typing and initializing the refs to satisfy TypeScript strict mode
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | undefined>(undefined);

  // Mathematical Constants (based on textbook Exercise: 30° to 60° in 6s)
  const TOWER_HEIGHT = 200; 
  const MAX_TIME = 9; // It takes exactly 9 seconds to reach the base
  
  // Real-world math mapping
  const dist30 = TOWER_HEIGHT * Math.sqrt(3); // Distance at 30°
  const dist60 = TOWER_HEIGHT / Math.sqrt(3); // Distance at 60°
  const SPEED = (dist30 - dist60) / 6; // Constant uniform speed (units/sec)

  // SVG Mapping
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 500;
  const GROUND_Y = 400;
  const TOWER_X = 150;
  const TOWER_TOP_Y = GROUND_Y - TOWER_HEIGHT;

  // Animation Loop for perfectly smooth 60FPS math syncing
  const animate = (timestamp: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (timestamp - previousTimeRef.current) / 1000;
      setTime((prevTime) => {
        const nextTime = prevTime + deltaTime;
        if (nextTime >= MAX_TIME) {
          setIsPlaying(false);
          return MAX_TIME;
        }
        return nextTime;
      });
    }
    previousTimeRef.current = timestamp;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      previousTimeRef.current = undefined;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Derived Live Data
  const currentDistance = Math.max(0.01, dist30 - (SPEED * time)); // Avoid division by zero
  const currentX = TOWER_X + currentDistance;
  
  const angleRad = Math.atan(TOWER_HEIGHT / currentDistance);
  const angleDeg = (angleRad * 180) / Math.PI;

  // Angular Velocity Approximation (Degrees per second)
  const angularVelocity = ((SPEED * TOWER_HEIGHT) / (Math.pow(currentDistance, 2) + Math.pow(TOWER_HEIGHT, 2))) * (180 / Math.PI);

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
    previousTimeRef.current = undefined;
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Radar className="text-rose-500" /> The Highway Interceptor
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Visualizing the non-linear curve of the Tangent function.
          </p>
        </div>
        {time > 0 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Simulation
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE HIGHWAY SCENE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Sky / Background Grid */}
            <g className="opacity-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`grid-y-${i}`} x1="0" y1={i * 50} x2={VIEW_WIDTH} y2={i * 50} stroke="#94a3b8" strokeWidth="1" />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={`grid-x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2={VIEW_HEIGHT} stroke="#94a3b8" strokeWidth="1" />
              ))}
            </g>

            {/* The Highway */}
            <rect x="0" y={GROUND_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - GROUND_Y} fill="#1c1917" />
            <line x1="0" y1={GROUND_Y} x2={VIEW_WIDTH} y2={GROUND_Y} stroke="#44403c" strokeWidth="4" />
            
            {/* Road Dashes */}
            <g opacity="0.3">
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`dash-${i}`} x1={TOWER_X + i * 80 - (time * SPEED * 2) % 80} y1={GROUND_Y + 40} x2={TOWER_X + i * 80 + 40 - (time * SPEED * 2) % 80} y2={GROUND_Y + 40} stroke="#fbbf24" strokeWidth="4" />
              ))}
            </g>

            {/* The Tower */}
            <rect x={TOWER_X - 20} y={TOWER_TOP_Y} width="40" height={TOWER_HEIGHT} fill="#334155" stroke="#475569" strokeWidth="2" />
            <polygon points={`${TOWER_X - 30},${TOWER_TOP_Y} ${TOWER_X + 30},${TOWER_TOP_Y} ${TOWER_X},${TOWER_TOP_Y - 30}`} fill="#1e293b" stroke="#475569" strokeWidth="2" />
            
            {/* Observation Deck Window */}
            <rect x={TOWER_X - 10} y={TOWER_TOP_Y + 10} width="20" height="15" fill="#fde047" opacity="0.8" className="drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]" />

            {/* Horizontal Line of Sight */}
            <line x1={TOWER_X} y1={TOWER_TOP_Y + 15} x2={VIEW_WIDTH} y2={TOWER_TOP_Y + 15} stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />

            {/* The Laser Targeting System */}
            <line 
              x1={TOWER_X} y1={TOWER_TOP_Y + 15} 
              x2={currentX} y2={GROUND_Y - 15} 
              stroke="#f43f5e" strokeWidth="3" opacity="0.8"
            />

            {/* Angle of Depression Arc */}
            <path 
              d={`M ${TOWER_X + 60} ${TOWER_TOP_Y + 15} A 60 60 0 0 1 ${TOWER_X + 60 * Math.cos(angleRad)} ${TOWER_TOP_Y + 15 + 60 * Math.sin(angleRad)}`} 
              fill="none" stroke="#fbbf24" strokeWidth="4" 
            />
            <text 
              x={TOWER_X + 75} y={TOWER_TOP_Y + 45} 
              fill="#fbbf24" fontSize="18" fontWeight="bold" className="font-mono bg-stone-900 drop-shadow-md"
            >
              {angleDeg.toFixed(1)}°
            </text>

            {/* Alternate Interior Angle (Z-Pattern) */}
            <path 
              d={`M ${currentX - 40} ${GROUND_Y - 15} A 40 40 0 0 1 ${currentX - 40 * Math.cos(angleRad)} ${GROUND_Y - 15 - 40 * Math.sin(angleRad)}`} 
              fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.6"
            />

            {/* Distance Marker */}
            <line x1={TOWER_X} y1={GROUND_Y + 15} x2={currentX} y2={GROUND_Y + 15} stroke="#a8a29e" strokeWidth="2" />
            <line x1={TOWER_X} y1={GROUND_Y + 5} x2={TOWER_X} y2={GROUND_Y + 25} stroke="#a8a29e" strokeWidth="2" />
            <line x1={currentX} y1={GROUND_Y + 5} x2={currentX} y2={GROUND_Y + 25} stroke="#a8a29e" strokeWidth="2" />
            <text x={(TOWER_X + currentX) / 2} y={GROUND_Y + 35} fill="#d6d3d1" fontSize="14" fontWeight="bold" textAnchor="middle" className="font-mono">
              Distance: {currentDistance.toFixed(1)} units
            </text>

            {/* The Moving Car */}
            <g transform={`translate(${currentX}, ${GROUND_Y - 15})`}>
              <rect x="-25" y="-15" width="50" height="15" fill="#e11d48" rx="4" />
              <rect x="-15" y="-25" width="30" height="10" fill="#9f1239" rx="2" />
              <circle cx="-15" cy="0" r="6" fill="#1c1917" stroke="#57534e" strokeWidth="2" />
              <circle cx="15" cy="0" r="6" fill="#1c1917" stroke="#57534e" strokeWidth="2" />
              {/* Headlight */}
              <path d="M -25 -10 L -45 -5 L -45 -15 Z" fill="#fef08a" opacity="0.4" />
            </g>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Telemetry Dashboard */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Radar Telemetry</span>
              <Timer size={14} className="text-sky-500" />
            </div>
            
            <div className="flex flex-col gap-4">
              
              {/* Time Tracker */}
              <div className="flex items-center justify-between bg-stone-950 border border-stone-800 p-3 rounded-lg">
                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">Elapsed Time</span>
                <span className="text-sky-400 font-mono font-bold text-2xl">{time.toFixed(1)} s</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-sky-500" style={{ width: `${(time / MAX_TIME) * 100}%` }}></div>
                {/* 6-second marker (The critical 30->60 jump) */}
                <div className="absolute top-0 bottom-0 w-1 bg-rose-500" style={{ left: `${(6 / MAX_TIME) * 100}%` }}></div>
              </div>

              {/* Vehicle Speed vs Angular Speed */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex flex-col items-center bg-stone-950 border border-stone-800 p-3 rounded-lg gap-1">
                  <Car size={16} className="text-stone-500" />
                  <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Vehicle Speed</span>
                  <span className="text-white font-mono font-bold">Constant</span>
                </div>
                
                <div className="flex flex-col items-center bg-stone-950 border border-stone-800 p-3 rounded-lg gap-1">
                  <Radar size={16} className={angularVelocity > 15 ? "text-rose-500 animate-pulse" : "text-amber-500"} />
                  <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Angular Velocity</span>
                  <span className={`font-mono font-bold ${angularVelocity > 15 ? "text-rose-400" : "text-amber-400"}`}>
                    {angularVelocity.toFixed(1)}°/s
                  </span>
                </div>
              </div>

              {/* Play Controls */}
              <button 
                onClick={togglePlay}
                className={`w-full py-4 mt-2 font-bold text-lg uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? 'Pause Target' : time >= MAX_TIME ? 'Restart' : 'Track Target'}
              </button>

            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Zap className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">The Non-Linear Paradox</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {time < 6 ? (
                  <motion.div key="phase1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-sky-400 font-bold text-xs uppercase tracking-widest border-l-2 border-sky-500 pl-3">Phase 1: Approaching</h4>
                    <div className="grid grid-cols-2 gap-4 font-mono text-sm border-b border-stone-800 pb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-stone-500">Angle Sweep</span>
                        <span className="text-amber-400">30° → 60° (Δ30°)</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-stone-500">Time Taken</span>
                        <span className="text-sky-400 font-bold text-xl">{Math.min(time, 6).toFixed(1)}s / 6.0s</span>
                      </div>
                    </div>
                    <p className="text-stone-300 text-xs leading-relaxed">
                      The car is driving at a constant uniform speed. It takes exactly <strong className="text-white">6 seconds</strong> for the angle of depression to double from 30° to 60°.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="phase2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-rose-400 font-bold text-xs uppercase tracking-widest border-l-2 border-rose-500 pl-3">Phase 2: The Crash</h4>
                    <div className="grid grid-cols-2 gap-4 font-mono text-sm border-b border-stone-800 pb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-stone-500">Angle Sweep</span>
                        <span className="text-rose-400">60° → 90° (Δ30°)</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-stone-500">Time Taken</span>
                        <span className="text-rose-400 font-bold text-xl">{(time - 6).toFixed(1)}s / 3.0s</span>
                      </div>
                    </div>
                    <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl">
                      <p className="text-rose-200/90 text-xs leading-relaxed">
                        <strong className="text-rose-400 uppercase tracking-widest">The "Aha!" Moment</strong><br/><br/>
                        Notice the red line on the timeline? The exact same angular sweep (30°) now only takes <strong className="text-white">half the time (3 seconds)</strong>! <br/><br/>
                        Because the car's speed never changed, the radar has to spin drastically faster as the car approaches the base. The tangent curve accelerates exponentially!
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
  );
}