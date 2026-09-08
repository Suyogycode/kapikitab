'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Trail, ContactShadows, Text } from '@react-three/drei';
import { Activity, Play, RotateCcw, Lightbulb, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE 3D PHYSICS ENGINE (Kinematics)
// ==================================================================
function BouncingBall({ r, isDropping, onTermChange }: { r: number, isDropping: boolean, onTermChange: (term: number) => void }) {
  const ballRef = useRef<THREE.Group>(null);
  const trailRef = useRef<any>(null);
  const timeRef = useRef(0);
  const lastTermRef = useRef(-1);

  // Constants scaled for the 3D viewport (24 ft = 12 units)
  const H0 = 12; 
  const GRAVITY = 30; // Exaggerated gravity for visual snappiness
  const X_START = -8;
  const X_TOTAL_DIST = 16; // Travels from -8 to +8

  useFrame((_, delta) => {
    if (!ballRef.current) return;

    if (!isDropping) {
      // Reset State
      ballRef.current.position.set(X_START, H0, 0);
      timeRef.current = 0;
      if (trailRef.current) trailRef.current.clear(); // Clear the glowing tail
      if (lastTermRef.current !== 0) {
        lastTermRef.current = 0;
        onTermChange(0); // Term 0 means we are holding the ball at t1
      }
      return;
    }

    // Accumulate time
    timeRef.current += delta;
    const t = timeRef.current;

    // --- Exact Kinematic Math ---
    const tFall = Math.sqrt((2 * H0) / GRAVITY);
    // Infinite geometric sum of time: T_total = t_fall * (1 + sqrt(r)) / (1 - sqrt(r))
    const tTotalInf = tFall * ((1 + Math.sqrt(r)) / (1 - Math.sqrt(r)));
    const vx = X_TOTAL_DIST / tTotalInf; // Constant horizontal velocity

    // Calculate X position
    let currentX = X_START + vx * t;
    if (currentX > X_START + X_TOTAL_DIST) currentX = X_START + X_TOTAL_DIST;

    // Calculate Y position (Parabolic Bounces)
    let currentY = 0;
    let currentBounceIdx = 0; // 0 = initial fall, 1 = first bounce

    if (t <= tFall) {
      // Free fall from the balcony
      currentY = H0 - 0.5 * GRAVITY * t * t;
      currentBounceIdx = 0;
    } else {
      // Calculate which bounce we are currently inside
      let tAccumulator = tFall;
      let bounceIdx = 1;
      let isSettled = true;

      while (bounceIdx < 30) {
        const peakHeight = H0 * Math.pow(r, bounceIdx);
        const tHalf = Math.sqrt((2 * peakHeight) / GRAVITY);
        const tDuration = 2 * tHalf;

        if (t <= tAccumulator + tDuration) {
          // We are inside this bounce's time window!
          const tLocal = t - (tAccumulator + tHalf); // time relative to the peak of the bounce
          currentY = peakHeight - 0.5 * GRAVITY * tLocal * tLocal;
          currentBounceIdx = bounceIdx;
          isSettled = false;
          break;
        }
        tAccumulator += tDuration;
        bounceIdx++;
      }
      
      if (isSettled) currentY = 0;
    }

    // Floor collision buffer (ball radius is 0.4)
    if (currentY < 0.4) currentY = 0.4;

    // Apply Position
    ballRef.current.position.set(currentX, currentY, 0);

    // Only update React state when a NEW peak is reached to maintain 60FPS performance
    if (currentBounceIdx !== lastTermRef.current) {
      lastTermRef.current = currentBounceIdx;
      onTermChange(currentBounceIdx);
    }
  });

  return (
    <group>
      <Trail ref={trailRef} width={2} color="#f43f5e" length={40} decay={2} attenuation={(width) => width}>
        <group ref={ballRef}>
          <mesh>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} roughness={0.1} />
          </mesh>
          <pointLight color="#f43f5e" intensity={2} distance={5} />
        </group>
      </Trail>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function PhysicsOfTheBounce() {
  const [r, setR] = useState<number>(0.75);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [activeBounceIdx, setActiveBounceIdx] = useState<number>(0);

  const initialHeight = 24;

  // --- 2D Graph Generation ---
  const numTerms = 8;
  const graphData = useMemo(() => {
    const data = [];
    for (let i = 0; i < numTerms; i++) {
      data.push(initialHeight * Math.pow(r, i));
    }
    return data;
  }, [r, initialHeight]);

  // Active Term Display (t1 is index 0, t2 is index 1, etc.)
  const activeTermIndex = activeBounceIdx < numTerms ? activeBounceIdx : numTerms - 1;
  const currentHeight = graphData[activeTermIndex];

  return (
    <div className="w-full h-full min-h-[850px] lg:min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col select-none">
      
      {/* 3D SPATIAL CANVAS */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 6, 20], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />

            {/* The Stage / Floor */}
            <Grid args={[40, 40]} position={[0, 0, 0]} cellSize={1} cellThickness={1} cellColor="#3f3f46" sectionSize={5} sectionThickness={1.5} sectionColor="#57534e" fadeDistance={30} />
            <ContactShadows resolution={1024} scale={40} blur={2} opacity={0.5} far={10} color="#000000" position={[0, 0.1, 0]} />

            {/* The Digital Balcony */}
            <group position={[-8, 11.8, 0]}>
              <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[3, 1, 3]} />
                <meshStandardMaterial color="#292524" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[3.2, 0.1, 3.2]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
              </mesh>
              <Text position={[0, -0.5, 1.6]} fontSize={0.6} fontWeight="bold" color="#38bdf8">24 ft</Text>
            </group>

            {/* The Physics Engine */}
            <BouncingBall r={r} isDropping={isDropping} onTermChange={setActiveBounceIdx} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Activity className="text-rose-500" /> The Physics of the Bounce
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Visualizing Geometric Progressions in the real world.
          </p>
        </div>
      </div>

      {/* CONTROLS & HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col lg:flex-row gap-6 pointer-events-none items-end">
        
        {/* Controls Panel */}
        <div className="w-full lg:w-80 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl p-6 pointer-events-auto shrink-0 flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
              <span className="flex items-center gap-2"><Settings2 size={14} className="text-sky-500" /> Restitution (r)</span>
              <span className="text-white font-mono bg-stone-950 px-2 py-1 rounded border border-stone-800">{r.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="0.9" 
              step="0.05" 
              value={r} 
              onChange={(e) => {
                setR(parseFloat(e.target.value));
                setIsDropping(false);
              }}
              className="w-full accent-sky-500" 
            />
            <p className="text-[10px] text-stone-500 mt-2 leading-relaxed">
              Adjust the <strong>Common Ratio (r)</strong>. This dictates how much kinetic energy the ball retains after every bounce.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setIsDropping(false)}
              className="py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={() => setIsDropping(true)}
              disabled={isDropping}
              className="py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-950 disabled:text-rose-500 disabled:border-rose-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest border border-rose-500 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.3)] disabled:shadow-none"
            >
              <Play size={14} /> Drop Orb
            </button>
          </div>
        </div>

        {/* 2D Graph & HUD */}
        <div className="flex-1 w-full bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-stone-400 font-mono text-sm">
                <span>Formula:</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">
                  t<sub>n</sub> = a · r<sup>n-1</sup>
                </span>
              </div>
            </div>
            <div className="text-rose-400 font-mono font-bold text-sm bg-rose-950/30 px-3 py-1 rounded-full border border-rose-900/50 flex items-center gap-2">
              Term t<sub>{activeTermIndex + 1}</sub> = {currentHeight.toFixed(2)} ft
            </div>
          </div>
          
          <div className="p-6 flex flex-col lg:flex-row gap-8 items-center h-full">
            
            {/* SVG Plotter */}
            <div className="relative w-full lg:w-1/2 aspect-[2/1] border-l border-b border-stone-700 pb-2 pl-2 flex-shrink-0">
              <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                {/* Theoretical Curve (Dashed) */}
                <polyline 
                  points={graphData.map((val, i) => `${(i / (numTerms - 1)) * 400},${200 - (val / 24) * 200}`).join(' ')} 
                  fill="none" 
                  stroke="#44403c" 
                  strokeWidth="2" 
                  strokeDasharray="5 5" 
                />
                
                {/* Plotted Points (Active as ball bounces) */}
                {graphData.map((val, i) => {
                  const x = (i / (numTerms - 1)) * 400;
                  const y = 200 - (val / 24) * 200;
                  const isActive = i <= activeBounceIdx;
                  const isCurrent = i === activeTermIndex;

                  return (
                    <g key={i} className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                      {isActive && i > 0 && (
                        <line 
                          x1={( (i - 1) / (numTerms - 1) ) * 400} 
                          y1={200 - (graphData[i - 1] / 24) * 200} 
                          x2={x} 
                          y2={y} 
                          stroke="#f43f5e" 
                          strokeWidth="3" 
                        />
                      )}
                      <circle cx={x} cy={y} r={isCurrent ? 6 : 4} fill={isCurrent ? '#ffffff' : '#f43f5e'} className={isCurrent ? "drop-shadow-[0_0_8px_rgba(244,63,94,1)]" : ""} />
                      {isCurrent && (
                        <text x={x} y={y - 15} fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-mono">
                          {val.toFixed(1)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              
              {/* Axes Labels */}
              <div className="absolute -left-2 top-0 -translate-x-full text-[10px] text-stone-500 font-mono">24ft</div>
              <div className="absolute -left-2 bottom-2 -translate-x-full text-[10px] text-stone-500 font-mono">0ft</div>
              <div className="absolute -bottom-6 right-0 text-[10px] text-stone-500 font-mono">Time (n)</div>
            </div>

            {/* The "Aha!" Moment Explanation */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {isDropping ? (
                  <motion.div 
                    key="dropping"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl flex items-start gap-3 h-full"
                  >
                    <Lightbulb className="text-rose-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-2">The Exponential Curve</h4>
                      <p className="text-rose-100/80 font-sans text-xs leading-relaxed">
                        Unlike Arithmetic Progressions (which plot perfectly straight lines), Geometric Progressions form a beautiful, sweeping exponential curve.<br/><br/>
                        Notice how the gaps between the red dots get smaller and smaller? The ball is losing kinetic energy at a compounding geometric rate: <strong>t<sub>n</sub> = 24 · ({r.toFixed(2)})<sup>n-1</sup></strong>.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex items-start gap-3 h-full"
                  >
                    <Lightbulb className="text-stone-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-stone-400 text-xs leading-relaxed font-sans">
                      Select your restitution ratio, then click <strong>Drop Orb</strong>. Watch how the real-world dissipation of energy maps flawlessly onto a mathematical geometric sequence graph.
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