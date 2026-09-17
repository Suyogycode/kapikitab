'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, RadioTower, Calculator, RotateCcw, Map, AlertTriangle } from 'lucide-react';

export default function VolumetricLighthouse() {
  // Lighthouse Parameters
  const [distance, setDistance] = useState<number>(16.5); // km
  const [angle, setAngle] = useState<number>(80); // degrees
  
  // Animation State
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);

  // SVG and Math Constants
  const PIXELS_PER_KM = 12;
  const pixelRadius = distance * PIXELS_PER_KM;
  
  // Calculate the Area
  const area = (angle / 360) * Math.PI * Math.pow(distance, 2);

  // Helper to generate the SVG Sector Path
  const getSectorPath = (r: number, theta: number) => {
    const startAngle = -theta / 2;
    const endAngle = theta / 2;
    const radStart = (startAngle * Math.PI) / 180;
    const radEnd = (endAngle * Math.PI) / 180;
    
    // Y is negative because SVG coordinates go down, and we want it pointing "up" (away from camera)
    const x1 = r * Math.sin(radStart);
    const y1 = -r * Math.cos(radStart);
    const x2 = r * Math.sin(radEnd);
    const y2 = -r * Math.cos(radEnd);
    
    const largeArc = theta > 180 ? 1 : 0;
    
    return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const handleReset = () => {
    setDistance(16.5);
    setAngle(80);
    setIsAnalyzed(false);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#020617] rounded-2xl border border-slate-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Compass className="text-rose-500" /> The Volumetric Lighthouse
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Transforming 3D real-world warnings into 2D geometric sectors.
          </p>
        </div>
        {(isAnalyzed || distance !== 16.5 || angle !== 80) && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Scenario
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (3D OCEAN SCENE) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#020617] to-[#0f172a] border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-0 perspective-[1200px]">
          
          {/* Base Ocean Plane */}
          <motion.div 
            animate={{ 
              rotateX: 65, 
              opacity: isAnalyzed ? 0.2 : 1,
              scale: isAnalyzed ? 0.8 : 1
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute w-[800px] h-[800px] border border-blue-900/30 rounded-full flex items-center justify-center pointer-events-none"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #1e3a8a 1px, transparent 1px), radial-gradient(circle, #1e3a8a 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px'
            }}
          >
            {/* Ambient Water Glow */}
            <div className="absolute w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full"></div>
            
            {/* Hidden Rocks (Only visible within the red beam's area) */}
            <div className="absolute top-[250px] left-[350px] w-6 h-4 bg-slate-800 rounded-full opacity-50"></div>
            <div className="absolute top-[200px] left-[420px] w-8 h-6 bg-slate-800 rounded-full opacity-50"></div>
            <div className="absolute top-[180px] left-[280px] w-5 h-5 bg-slate-800 rounded-full opacity-50"></div>
          </motion.div>

          {/* Central Lighthouse Rock & Tower */}
          <motion.div 
            animate={{ opacity: isAnalyzed ? 0 : 1, y: isAnalyzed ? 50 : 0 }}
            transition={{ duration: 0.8 }}
            className="absolute flex flex-col items-center justify-center z-10 pointer-events-none"
          >
            <RadioTower className="text-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-[-10px]" size={40} />
            <div className="w-16 h-8 bg-slate-800 rounded-[50%] border-t-2 border-slate-600"></div>
          </motion.div>

          {/* The Volumetric Light Beam (Animates from 3D to 2D) */}
          <motion.div
            initial={false}
            animate={{
              rotateX: isAnalyzed ? 0 : 65,
              y: isAnalyzed ? -30 : 0,
              z: isAnalyzed ? 150 : 0,
              scale: isAnalyzed ? 1.1 : 1
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 1.2 }}
            className="absolute w-[600px] h-[600px] flex items-center justify-center pointer-events-none"
          >
            <svg viewBox="-300 -300 600 600" className="w-full h-full overflow-visible drop-shadow-[0_0_30px_rgba(225,29,72,0.6)]">
              
              {/* Sector Area */}
              <motion.path 
                d={getSectorPath(pixelRadius, angle)}
                fill="#f43f5e" 
                fillOpacity={isAnalyzed ? 0.3 : 0.4} 
                stroke="#fda4af" 
                strokeWidth={isAnalyzed ? "3" : "0"}
                className="transition-all duration-300"
              />

              {/* Angle Arc & Text (Only visible in 2D mode) */}
              <AnimatePresence>
                {isAnalyzed && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} exit={{ opacity: 0 }}>
                    <path 
                      d={getSectorPath(40, angle)} 
                      fill="none" stroke="#fecdd3" strokeWidth="2" strokeDasharray="4 4" 
                    />
                    <text x="0" y="-60" fill="#fecdd3" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-mono bg-slate-900 px-2">
                      θ = {angle}°
                    </text>

                    {/* Radius Label */}
                    <text 
                      x={-(pixelRadius / 2) * Math.sin((angle/2 * Math.PI)/180) - 20} 
                      y={-(pixelRadius / 2) * Math.cos((angle/2 * Math.PI)/180)} 
                      fill="#fda4af" fontSize="14" fontWeight="bold" textAnchor="end" className="font-mono bg-slate-900"
                    >
                      r = {distance.toFixed(1)} km
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>

            </svg>
          </motion.div>

        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">
              <span>Lighthouse Controls</span>
              <Map size={14} className="text-rose-500" />
            </div>
            
            <div className={`flex flex-col gap-5 transition-opacity duration-500 ${isAnalyzed ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              
              {/* Distance Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-rose-400 font-bold">Projection Distance</span>
                  <span className="text-white bg-slate-950 px-3 py-1 rounded border border-slate-700">{distance.toFixed(1)} km</span>
                </div>
                <input 
                  type="range" min="5" max="22" step="0.5" value={distance} 
                  onChange={(e) => setDistance(parseFloat(e.target.value))} 
                  className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

              {/* Angle Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-amber-400 font-bold">Sweep Angle</span>
                  <span className="text-white bg-slate-950 px-3 py-1 rounded border border-slate-700">{angle}°</span>
                </div>
                <input 
                  type="range" min="30" max="180" step="1" value={angle} 
                  onChange={(e) => setAngle(parseInt(e.target.value))} 
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

            </div>

            <AnimatePresence mode="wait">
              {!isAnalyzed ? (
                <motion.button key="analyze" onClick={() => setIsAnalyzed(true)} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center gap-2 mt-2">
                  <AlertTriangle size={18} /> Analyze Area
                </motion.button>
              ) : (
                <motion.button key="return" onClick={() => setIsAnalyzed(false)} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                  <RotateCcw size={18} /> Return to 3D View
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">Sector Conversion</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#020617]">
              
              <AnimatePresence mode="wait">
                {!isAnalyzed ? (
                  <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      The lighthouse is casting a warning beam over a massive physical area to prevent ships from hitting underwater rocks.
                    </p>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mt-auto">
                      <p className="text-slate-400 text-xs leading-relaxed text-center">
                        Set your parameters to <strong className="text-rose-400 font-mono">16.5 km</strong> and <strong className="text-amber-400 font-mono">80°</strong>, then click <strong className="text-white uppercase tracking-widest">Analyze Area</strong> to extract the math.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="math" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    
                    <h4 className="text-sky-400 font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2">2D Geometric Abstraction</h4>
                    
                    <div className="flex flex-col gap-3 font-mono text-sm text-slate-300">
                      <div className="flex justify-between items-center">
                        <span>Area Formula:</span>
                        <span className="text-white bg-slate-900 px-2 py-1 rounded border border-slate-700">(θ / 360) × πr²</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Substitution:</span>
                        <div className="flex items-center gap-2">
                          <span>({angle} / 360)</span>
                          <span>× 3.14 ×</span>
                          <span>({distance})²</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl flex flex-col gap-2 shadow-inner">
                      <span className="text-rose-400 font-bold uppercase tracking-widest text-[10px]">Total Warned Sea Area</span>
                      <span className="text-3xl font-bold font-mono text-white tracking-tighter">
                        {area.toFixed(2)} <span className="text-lg text-rose-300">km²</span>
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed mt-2">
                      The 3D physical world was perfectly mapped into a 2D geometric sector. This is exactly how marine navigators convert real-world limits into mathematical data!
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