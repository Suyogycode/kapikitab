'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Ruler, Triangle, Lightbulb, Search, RotateCcw } from 'lucide-react';

export default function ShadowTracker() {
  // Physical Constants (in meters)
  const LAMP_HEIGHT = 3.6;
  const GIRL_HEIGHT = 0.9;
  
  // Interactive State
  const [distance, setDistance] = useState<number>(4.8); // Distance of girl from lamp
  const [showTriangles, setShowTriangles] = useState<boolean>(false);

  // Derived Math
  // Big Triangle (Lamp) similar to Small Triangle (Girl)
  // LampHeight / (Distance + Shadow) = GirlHeight / Shadow
  // 3.6 / (d + s) = 0.9 / s  =>  4s = d + s  =>  3s = d  =>  s = d / 3
  const shadowLength = distance / 3;
  const totalBase = distance + shadowLength;

  // SVG Coordinate Mapping
  const VIEW_WIDTH = 800;
  const VIEW_HEIGHT = 400;
  const GROUND_Y = 320;
  const SCALE = 45; // pixels per meter
  const OFFSET_X = 60; // Left padding

  const lampX = OFFSET_X;
  const lampYTop = GROUND_Y - (LAMP_HEIGHT * SCALE);
  
  const girlX = OFFSET_X + (distance * SCALE);
  const girlYTop = GROUND_Y - (GIRL_HEIGHT * SCALE);

  const shadowTipX = OFFSET_X + (totalBase * SCALE);

  const handleReset = () => {
    setDistance(4.8);
    setShowTriangles(false);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Moon className="text-sky-400" /> The Shadow Tracker
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            AA Similarity & Indirect Measurement in the Real World.
          </p>
        </div>
        {distance !== 4.8 && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Scene
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE NIGHT SCENE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#171717] to-[#262626] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          {/* Ambient Street Glow */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full drop-shadow-2xl overflow-visible">
            
            {/* The Ground */}
            <rect x="0" y={GROUND_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - GROUND_Y} fill="#1c1917" />
            <line x1="0" y1={GROUND_Y} x2={VIEW_WIDTH} y2={GROUND_Y} stroke="#44403c" strokeWidth="2" />

            {/* Geometry Highlight: The Two Triangles */}
            <AnimatePresence>
              {showTriangles && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Big Triangle (Lamp Post) */}
                  <polygon 
                    points={`${lampX},${GROUND_Y} ${lampX},${lampYTop} ${shadowTipX},${GROUND_Y}`} 
                    fill="#0284c7" fillOpacity="0.15" 
                    stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" 
                  />
                  {/* Small Triangle (Girl) */}
                  <polygon 
                    points={`${girlX},${GROUND_Y} ${girlX},${girlYTop} ${shadowTipX},${GROUND_Y}`} 
                    fill="#10b981" fillOpacity="0.3" 
                    stroke="#34d399" strokeWidth="2" 
                  />
                  
                  {/* 90-degree Angle Markers */}
                  <path d={`M ${lampX} ${GROUND_Y - 15} L ${lampX + 15} ${GROUND_Y - 15} L ${lampX + 15} ${GROUND_Y}`} fill="none" stroke="#38bdf8" strokeWidth="2" />
                  <path d={`M ${girlX} ${GROUND_Y - 15} L ${girlX + 15} ${GROUND_Y - 15} L ${girlX + 15} ${GROUND_Y}`} fill="none" stroke="#34d399" strokeWidth="2" />
                  
                  {/* Shared Tip Angle Marker */}
                  <path d={`M ${shadowTipX - 30} ${GROUND_Y} A 30 30 0 0 1 ${shadowTipX - 25} ${GROUND_Y - 10}`} fill="none" stroke="#fbbf24" strokeWidth="3" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* The Lamp Post (AB) */}
            <line x1={lampX} y1={GROUND_Y} x2={lampX} y2={lampYTop} stroke="#78716c" strokeWidth="8" strokeLinecap="round" />
            <circle cx={lampX} cy={lampYTop} r="12" fill="#fef08a" className="drop-shadow-[0_0_20px_rgba(253,224,71,0.8)]" />
            
            {/* Distance Marker (Lamp to Girl) */}
            <line x1={lampX} y1={GROUND_Y + 25} x2={girlX} y2={GROUND_Y + 25} stroke="#a8a29e" strokeWidth="2" />
            <line x1={lampX} y1={GROUND_Y + 15} x2={lampX} y2={GROUND_Y + 35} stroke="#a8a29e" strokeWidth="2" />
            <line x1={girlX} y1={GROUND_Y + 15} x2={girlX} y2={GROUND_Y + 35} stroke="#a8a29e" strokeWidth="2" />
            <text x={(lampX + girlX) / 2} y={GROUND_Y + 45} fill="#d6d3d1" fontSize="14" textAnchor="middle" className="font-mono">{distance.toFixed(1)}m</text>

            {/* The Shadow */}
            <line x1={girlX} y1={GROUND_Y} x2={shadowTipX} y2={GROUND_Y} stroke="#000000" strokeWidth="8" strokeLinecap="round" opacity="0.6" className="transition-all duration-75" />
            
            {/* Shadow Length Marker */}
            <line x1={girlX} y1={GROUND_Y + 25} x2={shadowTipX} y2={GROUND_Y + 25} stroke="#a8a29e" strokeWidth="2" className="transition-all duration-75" />
            <line x1={shadowTipX} y1={GROUND_Y + 15} x2={shadowTipX} y2={GROUND_Y + 35} stroke="#a8a29e" strokeWidth="2" className="transition-all duration-75" />
            <text x={(girlX + shadowTipX) / 2} y={GROUND_Y + 45} fill="#fbbf24" fontSize="14" fontWeight="bold" textAnchor="middle" className="font-mono transition-all duration-75">{shadowLength.toFixed(2)}m</text>

            {/* The Girl (DE) */}
            <line x1={girlX} y1={GROUND_Y} x2={girlX} y2={girlYTop} stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" className="transition-all duration-75" />
            <circle cx={girlX} cy={girlYTop - 8} r="8" fill="#fda4af" className="transition-all duration-75" />

            {/* The Ray of Light */}
            <line 
              x1={lampX} y1={lampYTop} 
              x2={shadowTipX} y2={GROUND_Y} 
              stroke="#fef08a" 
              strokeWidth="2" 
              strokeDasharray="8 4" 
              opacity="0.4"
              className="transition-all duration-75"
            />

            {/* Vertex Labels (if Triangles shown) */}
            <AnimatePresence>
              {showTriangles && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-serif font-bold text-lg">
                  <text x={lampX - 20} y={lampYTop} fill="#38bdf8">A</text>
                  <text x={lampX - 20} y={GROUND_Y - 10} fill="#38bdf8">B</text>
                  <text x={girlX - 20} y={girlYTop - 10} fill="#34d399">D</text>
                  <text x={girlX - 20} y={GROUND_Y - 10} fill="#34d399">E</text>
                  <text x={shadowTipX + 15} y={GROUND_Y - 10} fill="#fbbf24">C</text>
                </motion.g>
              )}
            </AnimatePresence>

          </svg>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Environment Controls */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Scene Variables</span>
              <Ruler size={14} className="text-emerald-500" />
            </div>
            
            <div className="flex flex-col gap-5">
              {/* Distance Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-stone-300 font-bold">Girl's Distance (d)</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{distance.toFixed(1)} m</span>
                </div>
                <input 
                  type="range" min="1" max="12" step="0.2" value={distance} 
                  onChange={(e) => setDistance(parseFloat(e.target.value))} 
                  className="w-full accent-emerald-500" 
                />
              </div>

              {/* Reveal Toggle */}
              <button 
                onClick={() => setShowTriangles(!showTriangles)}
                className={`mt-2 py-4 font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border-2 ${
                  showTriangles ? 'bg-sky-950/40 border-sky-500 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'
                }`}
              >
                <Triangle size={18} />
                {showTriangles ? "Hide Geometry" : "Reveal Similar Triangles"}
              </button>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Search className="text-amber-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Indirect Measurement</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {!showTriangles ? (
                  <motion.div key="story" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      A girl of height <strong className="text-white">0.9m</strong> is walking away from the base of a lamp-post which is <strong className="text-white">3.6m</strong> tall.
                    </p>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg">
                      <p className="text-amber-400 text-xs leading-relaxed font-bold uppercase tracking-widest mb-1">The Objective:</p>
                      <p className="text-stone-400 text-xs leading-relaxed">
                        Find the exact length of her shadow when she is <strong className="font-mono text-emerald-400">{distance.toFixed(1)}m</strong> away from the post.
                      </p>
                    </div>
                    <p className="text-stone-500 text-xs mt-auto italic">
                      Hint: Click "Reveal Similar Triangles" to expose the hidden math.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="math" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    
                    {/* The AA Proof */}
                    <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex flex-col gap-2">
                      <h4 className="text-sky-400 text-[10px] uppercase tracking-widest font-bold">AA Similarity Criterion</h4>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                        <div className="flex items-center gap-2 text-stone-300">
                          <span className="text-stone-500">1.</span> ∠B = ∠E = 90°
                        </div>
                        <div className="flex items-center gap-2 text-stone-300">
                          <span className="text-stone-500">2.</span> ∠C is common
                        </div>
                      </div>
                      <div className="text-emerald-400 font-bold mt-1 font-mono text-sm">∴ ΔABC ~ ΔDEC</div>
                    </div>

                    {/* The Ratio Calculation */}
                    <div className="flex flex-col gap-2 font-mono text-sm">
                      <div className="flex items-center justify-between text-stone-400">
                        <span>AB / DE</span>
                        <span>=</span>
                        <span>BC / EC</span>
                      </div>
                      <div className="flex items-center justify-between text-white border-b border-stone-800 pb-2">
                        <span>3.6 / 0.9</span>
                        <span>=</span>
                        <span>(d + s) / s</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-300 pt-1">
                        <span>4s</span>
                        <span>=</span>
                        <span>{distance.toFixed(1)} + s</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-300">
                        <span>3s</span>
                        <span>=</span>
                        <span>{distance.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Final Answer */}
                    <div className="mt-auto bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Shadow Length (s)</span>
                      <span className="text-2xl font-bold font-mono text-white">{shadowLength.toFixed(2)}m</span>
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