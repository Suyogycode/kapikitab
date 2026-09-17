'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, RotateCcw, Droplets, Waves, TrendingUp } from 'lucide-react';

export default function CubicRollercoaster() {
  // Cubic Coefficients: y = ax³ + bx² + cx + d
  const [a, setA] = useState<number>(0.2);
  const [b, setB] = useState<number>(0);
  const [c, setC] = useState<number>(-5);
  const [d, setD] = useState<number>(0);

  // Rollercoaster Cart State
  const [cartX, setCartX] = useState<number>(-10);

  // SVG Coordinate Mapping
  const GRAPH_SIZE = 600;
  const MATH_RANGE = 10;
  const SCALE = GRAPH_SIZE / (MATH_RANGE * 2);

  const mapX = (x: number) => (x + MATH_RANGE) * SCALE;
  const mapY = (y: number) => GRAPH_SIZE - (y + MATH_RANGE) * SCALE;

  // Generate SVG Path & Detect Zero Crossings (Splashes)
  const { path, zeroes } = useMemo(() => {
    let pathString = '';
    const detectedZeroes: number[] = [];
    const step = 0.1;
    
    let prevY = a * Math.pow(-MATH_RANGE, 3) + b * Math.pow(-MATH_RANGE, 2) + c * -MATH_RANGE + d;

    for (let x = -MATH_RANGE; x <= MATH_RANGE; x += step) {
      const y = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
      const px = mapX(x);
      const py = mapY(y);
      
      if (x === -MATH_RANGE) {
        pathString += `M ${px} ${py} `;
      } else {
        pathString += `L ${px} ${py} `;
      }

      // Zero-Crossing Detection (Sign change)
      if (prevY * y <= 0 && Math.abs(y - prevY) > 0.001) {
        // Linear interpolation for exact zero coordinate
        const ratio = Math.abs(prevY) / (Math.abs(prevY) + Math.abs(y));
        const exactX = (x - step) + ratio * step;
        
        // Prevent duplicate detection from float rounding
        if (!detectedZeroes.some(z => Math.abs(z - exactX) < 0.5)) {
          detectedZeroes.push(exactX);
        }
      }
      prevY = y;
    }
    
    return { path: pathString, zeroes: detectedZeroes };
  }, [a, b, c, d]);

  // Animate the Rollercoaster Cart
  useEffect(() => {
    let animationFrameId: number;
    let direction = 1;
    let currentX = -10;
    const speed = 0.06;

    const animateCart = () => {
      currentX += speed * direction;
      if (currentX >= MATH_RANGE) direction = -1;
      if (currentX <= -MATH_RANGE) direction = 1;
      
      setCartX(currentX);
      animationFrameId = requestAnimationFrame(animateCart);
    };

    animateCart();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const cartY = a * Math.pow(cartX, 3) + b * Math.pow(cartX, 2) + c * cartX + d;

  const handleReset = () => {
    setA(0.2);
    setB(0);
    setC(-5);
    setD(0);
  };

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#0c131a] rounded-2xl border border-sky-900/50 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <Waves className="text-sky-400" /> The Cubic Rollercoaster
          </h2>
          <p className="text-sky-200/60 text-sm mt-1">
            Understanding degree constraints: Try to make the track splash 4 times!
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-sky-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-sky-800 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Track
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
        
        {/* INTERACTIVE WORKSPACE (THE THEME PARK) */}
        <div className="relative w-full max-w-[600px] aspect-square bg-[#101824] border-4 border-sky-900/50 rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.1)] overflow-hidden flex items-center justify-center">
          
          <svg viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`} className="w-full h-full relative z-10">
            
            {/* The Water Zone (Below X-Axis) */}
            <rect 
              x="0" 
              y={GRAPH_SIZE / 2} 
              width={GRAPH_SIZE} 
              height={GRAPH_SIZE / 2} 
              fill="#0ea5e9" 
              opacity="0.15" 
            />
            
            {/* Grid Lines */}
            <g className="opacity-20">
              {Array.from({ length: MATH_RANGE * 2 + 1 }).map((_, i) => {
                const pos = i * SCALE;
                return (
                  <React.Fragment key={i}>
                    <line x1={pos} y1="0" x2={pos} y2={GRAPH_SIZE} stroke="#38bdf8" strokeWidth="1" />
                    <line x1="0" y1={pos} x2={GRAPH_SIZE} y2={pos} stroke="#38bdf8" strokeWidth="1" />
                  </React.Fragment>
                );
              })}
            </g>

            {/* The Water Level (X-Axis) */}
            <line x1="0" y1={GRAPH_SIZE / 2} x2={GRAPH_SIZE} y2={GRAPH_SIZE / 2} stroke="#38bdf8" strokeWidth="3" opacity="0.6" />
            <line x1={GRAPH_SIZE / 2} y1="0" x2={GRAPH_SIZE / 2} y2={GRAPH_SIZE} stroke="#38bdf8" strokeWidth="1" opacity="0.3" />

            {/* The Rollercoaster Track */}
            <path 
              d={path} 
              fill="none" 
              stroke="#f1f5f9" 
              strokeWidth="6" 
              strokeLinecap="round" 
              className="transition-all duration-75"
            />
            <path 
              d={path} 
              fill="none" 
              stroke="#94a3b8" 
              strokeWidth="2" 
              strokeDasharray="4 8"
              className="transition-all duration-75"
            />

            {/* Water Splashes (Zeroes) */}
            <AnimatePresence>
              {zeroes.map((z, index) => (
                <motion.g 
                  key={`${z.toFixed(1)}-${index}`}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                >
                  <circle cx={mapX(z)} cy={GRAPH_SIZE / 2} r="16" fill="#0ea5e9" opacity="0.3" className="animate-ping" />
                  <circle cx={mapX(z)} cy={GRAPH_SIZE / 2} r="8" fill="#38bdf8" className="drop-shadow-[0_0_10px_rgba(56,189,248,1)]" />
                  <path d={`M ${mapX(z)-10} ${GRAPH_SIZE/2} Q ${mapX(z)} ${GRAPH_SIZE/2 - 20} ${mapX(z)+10} ${GRAPH_SIZE/2}`} fill="none" stroke="#e0f2fe" strokeWidth="3" opacity="0.8"/>
                </motion.g>
              ))}
            </AnimatePresence>

            {/* The Rollercoaster Cart */}
            <g transform={`translate(${mapX(cartX)}, ${mapY(cartY)})`} className="transition-transform duration-75">
              <circle cx="0" cy="0" r="10" fill="#f43f5e" className="drop-shadow-[0_0_15px_rgba(225,29,72,0.8)]" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
            </g>

          </svg>
        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Engineering Panel (Sliders) */}
          <div className="bg-sky-950/40 backdrop-blur-md border border-sky-900/50 rounded-xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex justify-between items-center text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/50 pb-3">
              <span>Track Engineering</span>
              <span className="text-white font-mono tracking-normal">y = ax³ + bx² + cx + d</span>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-sky-300 font-bold">a (Twist Multiplier)</span>
                  <span className="text-white bg-sky-950 px-2 rounded border border-sky-800">{a.toFixed(2)}</span>
                </div>
                <input type="range" min="-1" max="1" step="0.05" value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="w-full accent-sky-400" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-emerald-300 font-bold">b (Peak Shift)</span>
                  <span className="text-white bg-sky-950 px-2 rounded border border-sky-800">{b.toFixed(1)}</span>
                </div>
                <input type="range" min="-5" max="5" step="0.5" value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="w-full accent-emerald-400" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-amber-300 font-bold">c (Valley Depth)</span>
                  <span className="text-white bg-sky-950 px-2 rounded border border-sky-800">{c.toFixed(1)}</span>
                </div>
                <input type="range" min="-10" max="10" step="0.5" value={c} onChange={(e) => setC(parseFloat(e.target.value))} className="w-full accent-amber-400" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-rose-300 font-bold">d (Water Level Offset)</span>
                  <span className="text-white bg-sky-950 px-2 rounded border border-sky-800">{d.toFixed(1)}</span>
                </div>
                <input type="range" min="-10" max="10" step="0.5" value={d} onChange={(e) => setD(parseFloat(e.target.value))} className="w-full accent-rose-400" />
              </div>
            </div>
          </div>

          {/* Mathematical Translation HUD */}
          <div className="bg-sky-950/40 backdrop-blur-md border border-sky-900/50 rounded-xl shadow-2xl flex flex-col overflow-hidden flex-1">
            <div className="bg-sky-950/80 p-4 border-b border-sky-900/50 flex items-center gap-3">
              <Anchor className="text-sky-400" size={18} />
              <h3 className="font-bold text-sky-100 uppercase tracking-widest text-xs">Degree Constraints</h3>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm flex flex-col h-full">
              
              {/* Splash Counter */}
              <div className="bg-sky-900/30 border border-sky-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sky-400 text-xs font-sans uppercase tracking-widest font-bold">Water Splashes (Zeroes)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-white">{zeroes.length}</span>
                    <span className="text-sky-500/50 text-2xl">/ 3</span>
                  </div>
                </div>
                <Droplets size={40} className={zeroes.length === 3 ? "text-emerald-400 animate-pulse" : "text-sky-500/50"} />
              </div>

              {/* The Challenge / "Aha!" Moment Explanation */}
              <div className="mt-auto pt-6 border-t border-sky-900/50">
                <AnimatePresence mode="wait">
                  {zeroes.length === 3 ? (
                    <motion.div key="max" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <TrendingUp className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                      <p className="text-sky-100/90 font-sans text-xs leading-relaxed">
                        <strong className="text-emerald-400 uppercase tracking-widest">Maximum Intersections Reached!</strong><br/><br/>
                        You've warped the track to hit the water 3 times. Try as hard as you can with the sliders above—<strong className="text-white">can you make it splash 4 times?</strong><br/><br/>
                        It's mathematically impossible. A polynomial of degree <strong className="text-emerald-400">n</strong> (in this case, 3) can bend at most <strong className="text-emerald-400">n-1</strong> times, locking its maximum zero count permanently to 3.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="default" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                      <TrendingUp className="text-sky-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-sky-200/70 font-sans text-xs leading-relaxed">
                        Adjust the sliders to build peaks and valleys. Try to get the red rollercoaster cart to splash through the blue water level exactly three times!
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