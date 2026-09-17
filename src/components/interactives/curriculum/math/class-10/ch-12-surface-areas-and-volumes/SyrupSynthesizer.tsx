'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Cookie, RotateCcw, Combine, Beaker, Zap, Calculator } from 'lucide-react';

type Phase = 'assembly' | 'single' | 'multiplying' | 'extracting' | 'extracted';

export default function SyrupSynthesizer() {
  const [phase, setPhase] = useState<Phase>('assembly');
  const [assemblyProgress, setAssemblyProgress] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // Exact Math from NCERT Exercise 12.2 Q3
  const R = 1.4; // cm
  const TOTAL_LEN = 5.0; // cm
  const CYL_H = TOTAL_LEN - (2 * R); // 2.2 cm

  const volCylinder = Math.PI * Math.pow(R, 2) * CYL_H;
  const volHemispheres = (4 / 3) * Math.PI * Math.pow(R, 3);
  const volSingle = volCylinder + volHemispheres;
  
  const volTotal = volSingle * quantity;
  const volSyrup = volTotal * 0.30;

  // SVG Drawing Constants
  const SCALE = 30; // pixels per cm for the large view
  const pxR = R * SCALE;
  const pxCylH = CYL_H * SCALE;
  const cx = 400; // Center of SVG
  const cy = 250;

  useEffect(() => {
    if (assemblyProgress === 100 && phase === 'assembly') {
      setPhase('single');
    } else if (assemblyProgress < 100 && phase === 'single') {
      setPhase('assembly');
    }
  }, [assemblyProgress, phase]);

  const handleExtract = () => {
    setPhase('extracting');
    setTimeout(() => {
      setPhase('extracted');
    }, 2500); // 2.5s drain animation
  };

  const handleReset = () => {
    setPhase('assembly');
    setAssemblyProgress(0);
    setQuantity(1);
  };

  // Reusable Single Gulab Jamun SVG Component
  const GulabJamunSVG = ({ isSmall, extractState }: { isSmall?: boolean, extractState: 'solid' | 'draining' | 'empty' }) => {
    const s = isSmall ? 0.3 : 1; // scale
    const r = pxR * s;
    const h = pxCylH * s;
    
    // Gap for assembly animation
    const gap = isSmall ? 0 : (100 - assemblyProgress) * 1.5;

    const baseColor = "#92400e"; // dark brown
    const shellColor = "#fcd34d"; // transparent glass-like
    const syrupColor = "#f59e0b"; // golden amber

    const isSolid = extractState === 'solid';
    const fillProps = isSolid 
      ? { fill: baseColor, stroke: "#78350f" } 
      : { fill: "transparent", stroke: shellColor, strokeWidth: 2 };

    return (
      <g>
        {/* Left Hemisphere */}
        <motion.path 
          d={`M ${-h/2 - gap} ${r} A ${r} ${r} 0 0 1 ${-h/2 - gap} ${-r} Z`}
          {...fillProps}
          className="transition-colors duration-1000"
        />
        {/* Cylinder */}
        <motion.rect 
          x={-h/2} y={-r} width={h} height={r*2}
          {...fillProps}
          className="transition-colors duration-1000"
        />
        {/* Right Hemisphere */}
        <motion.path 
          d={`M ${h/2 + gap} ${-r} A ${r} ${r} 0 0 1 ${h/2 + gap} ${r} Z`}
          {...fillProps}
          className="transition-colors duration-1000"
        />

        {/* The Syrup inside (Visible only when not solid) */}
        {!isSolid && (
          <g>
            <clipPath id="jamun-clip">
              <rect x={-h/2} y={-r} width={h} height={r*2} />
              <path d={`M ${-h/2} ${r} A ${r} ${r} 0 0 1 ${-h/2} ${-r} Z`} />
              <path d={`M ${h/2} ${-r} A ${r} ${r} 0 0 1 ${h/2} ${r} Z`} />
            </clipPath>
            
            <motion.rect 
              clipPath="url(#jamun-clip)"
              x={-r - h/2} 
              y={-r} 
              width={(h + 2*r)} 
              height={r*2}
              fill={syrupColor}
              initial={{ y: r * 0.4 }} // starts 30% full (offset downwards)
              animate={{ y: extractState === 'draining' ? r * 2.5 : r * 0.4 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c0a09] rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Cookie className="text-amber-500" /> The Syrup Synthesizer
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Complex Real-World Volume: Calculating 30% syrup across 45 objects.
          </p>
        </div>
        {phase !== 'assembly' && phase !== 'single' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset Batch
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE DIGITAL SWEET SHOP) */}
        <div className="relative w-full lg:w-2/3 bg-gradient-to-b from-[#1c1917] to-[#0a0a0a] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0">
          
          <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl overflow-visible">
            
            <AnimatePresence mode="wait">
              {/* BIG VIEW (Phases: Assembly, Single) */}
              {(phase === 'assembly' || phase === 'single') && (
                <motion.g key="big-view" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <g transform={`translate(${cx}, ${cy})`}>
                    <GulabJamunSVG extractState="solid" />
                  </g>
                  
                  {/* Dimensions Annotations */}
                  <motion.g animate={{ opacity: assemblyProgress === 100 ? 1 : 0 }}>
                    <line x1={cx - pxCylH/2} y1={cy + pxR + 20} x2={cx + pxCylH/2} y2={cy + pxR + 20} stroke="#a8a29e" strokeWidth="2" />
                    <text x={cx} y={cy + pxR + 40} fill="#d6d3d1" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-mono">2.2 cm</text>
                    
                    <line x1={cx + pxCylH/2 + 10} y1={cy} x2={cx + pxCylH/2 + pxR - 10} y2={cy} stroke="#a8a29e" strokeWidth="2" strokeDasharray="4 4"/>
                    <text x={cx + pxCylH/2 + pxR/2} y={cy - 10} fill="#d6d3d1" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-mono">1.4 cm</text>
                  </motion.g>
                </motion.g>
              )}

              {/* GRID VIEW (Phases: Multiplying, Extracting, Extracted) */}
              {(phase === 'multiplying' || phase === 'extracting' || phase === 'extracted') && (
                <motion.g key="grid-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  
                  {/* 45 Items Grid */}
                  <g transform="translate(50, 50)">
                    {Array.from({ length: 45 }).map((_, i) => {
                      const row = Math.floor(i / 9);
                      const col = i % 9;
                      return (
                        <motion.g 
                          key={i} 
                          initial={{ scale: 0 }} 
                          animate={{ scale: i < quantity ? 1 : 0 }} 
                          transition={{ type: "spring", bounce: 0.4, delay: (i * 0.02) }} // Staggered pop-in
                          transform={`translate(${col * 60 + 30}, ${row * 60 + 30})`}
                        >
                          <GulabJamunSVG 
                            isSmall 
                            extractState={phase === 'extracting' || phase === 'extracted' ? (phase === 'extracted' ? 'empty' : 'draining') : 'solid'} 
                          />
                        </motion.g>
                      );
                    })}
                  </g>

                  {/* The Giant Measuring Beaker */}
                  <motion.g 
                    initial={{ x: 800 }} 
                    animate={{ x: 600 }} 
                    transition={{ type: "spring", bounce: 0.2 }}
                  >
                    <rect x="0" y="100" width="120" height="300" fill="none" stroke="#e7e5e4" strokeWidth="4" rx="8" />
                    {/* Measurement Marks */}
                    {[150, 200, 250, 300, 350].map(y => (
                      <line key={`tick-${y}`} x1="0" y1={y} x2="15" y2={y} stroke="#a8a29e" strokeWidth="2" />
                    ))}
                    
                    {/* The Collecting Syrup */}
                    <motion.rect 
                      x="4" 
                      width="112" 
                      fill="#f59e0b" // golden syrup
                      initial={{ y: 396, height: 0 }}
                      animate={{ 
                        y: phase === 'extracted' ? 100 + (300 * 0.7) : 396, // Fills to roughly 30% visual height
                        height: phase === 'extracted' ? (300 * 0.3) : 0 
                      }}
                      transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                      rx="4"
                    />
                    <text x="60" y="430" fill="#fcd34d" fontSize="18" fontWeight="bold" textAnchor="middle" className="font-mono">Syrup Vault</text>
                  </motion.g>

                </motion.g>
              )}
            </AnimatePresence>

          </svg>
        </div>

        {/* CONTROLS & HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Console */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800 pb-3">
              <span>Production Line</span>
              <Combine size={14} className="text-amber-500" />
            </div>
            
            <div className={`flex flex-col gap-5 transition-opacity duration-500 ${(phase === 'extracting' || phase === 'extracted') ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              
              {/* Assembly Slider */}
              <div className={`flex flex-col gap-2 transition-opacity ${phase === 'multiplying' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-stone-300 font-bold">1. Form Shape</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{assemblyProgress}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1" value={assemblyProgress} 
                  onChange={(e) => setAssemblyProgress(parseInt(e.target.value))} 
                  className="w-full accent-amber-600 bg-stone-800 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

              {/* Multiplier Slider */}
              <div className={`flex flex-col gap-2 transition-opacity ${phase !== 'single' && phase !== 'multiplying' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between font-mono text-sm items-center">
                  <span className="text-sky-400 font-bold">2. Batch Multiplier</span>
                  <span className="text-white bg-stone-950 px-3 py-1 rounded border border-stone-700">{quantity}x</span>
                </div>
                <input 
                  type="range" min="1" max="45" step="1" value={quantity} 
                  onChange={(e) => {
                    setQuantity(parseInt(e.target.value));
                    if (parseInt(e.target.value) > 1) setPhase('multiplying');
                  }} 
                  className="w-full accent-sky-500 bg-stone-800 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>

            </div>

            <AnimatePresence mode="wait">
              {quantity === 45 && phase === 'multiplying' && (
                <motion.button key="extract" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={handleExtract} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 mt-2">
                  <Droplet size={18} /> Extract 30% Syrup
                </motion.button>
              )}
              {phase === 'extracting' && (
                <motion.div key="draining" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-4 gap-3 text-amber-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                  <Beaker size={18} className="animate-bounce" /> Draining Volumes...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
              <Calculator className="text-sky-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Volume Formulation</h3>
            </div>
            
            <div className="p-6 space-y-4 flex flex-col h-full bg-[#1c1917]">
              
              <AnimatePresence mode="wait">
                {phase === 'assembly' && (
                  <motion.div key="text0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <p className="text-stone-300 text-sm leading-relaxed">
                      First, we must define the singular unit. Drag the slider to assemble the Cylinder and the two Hemispheres.
                    </p>
                  </motion.div>
                )}

                {(phase === 'single' || (phase === 'multiplying' && quantity < 45)) && (
                  <motion.div key="text1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-stone-400 font-bold text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2">Volume of 1 Unit</h4>
                    <div className="font-mono text-xs flex flex-col gap-2 text-stone-300">
                      <div className="flex justify-between text-amber-500"><span>Cylinder</span> <span>{volCylinder.toFixed(2)} cm³</span></div>
                      <div className="flex justify-between text-amber-500"><span>+ 2 Hemispheres</span> <span>{volHemispheres.toFixed(2)} cm³</span></div>
                      <div className="flex justify-between font-bold text-white mt-1 pt-1 border-t border-stone-700"><span>Total (1x)</span> <span>{volSingle.toFixed(2)} cm³</span></div>
                    </div>
                    <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl mt-auto">
                      <p className="text-stone-400 text-xs leading-relaxed text-center">
                        Crank the <strong className="text-sky-400 uppercase tracking-widest">Multiplier Dial</strong> up to 45 to build the full batch required by the word problem!
                      </p>
                    </div>
                  </motion.div>
                )}

                {(phase === 'extracting' || phase === 'extracted') && (
                  <motion.div key="text2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 h-full">
                    <h4 className="text-sky-400 font-bold text-[10px] uppercase tracking-widest border-b border-stone-800 pb-2">Scalar & Percentage Math</h4>
                    
                    <div className="flex flex-col gap-3 font-mono text-sm border-b border-stone-800 pb-4 text-stone-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sky-400">Total Volume (45x)</span>
                        <span>{volTotal.toFixed(1)} cm³</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-500">
                        <span>× Syrup Ratio (30%)</span>
                        <span>× 0.30</span>
                      </div>
                      <div className="flex justify-between items-center text-white font-bold text-xl mt-2 pt-3 border-t border-stone-700">
                        <span className="text-amber-400">Total Syrup</span>
                        <span>{volSyrup.toFixed(0)} cm³</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {phase === 'extracted' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-auto bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl">
                          <p className="text-amber-200/90 text-xs leading-relaxed">
                            <strong className="text-amber-400 uppercase tracking-widest">The "Aha!" Moment</strong><br/><br/>
                            Instead of a terrifying equation, it is just fluid dynamics! You calculate the total space, and literally pour out 30% of it into a beaker. 
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
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