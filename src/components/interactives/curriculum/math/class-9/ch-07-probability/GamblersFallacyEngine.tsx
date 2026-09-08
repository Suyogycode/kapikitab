'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, ContactShadows } from '@react-three/drei';
import { Coins, Zap, AlertOctagon, TrendingUp, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE 3D PHYSICS COMPONENTS
// ==================================================================

function Coin3D({ isFlipping, side }: { isFlipping: boolean, side: 'H' | 'T' }) {
  const coinRef = useRef<THREE.Group>(null);
  const [spinSpeed, setSpinSpeed] = useState(0);

  useFrame((_, delta) => {
    if (!coinRef.current) return;
    
    if (isFlipping) {
      // Wild spinning during hyper-drive or manual flip
      setSpinSpeed(Math.PI * 15);
      coinRef.current.rotation.x += spinSpeed * delta;
    } else {
      // Settle on the correct face
      const targetRotation = side === 'H' ? 0 : Math.PI;
      coinRef.current.rotation.x = THREE.MathUtils.lerp(coinRef.current.rotation.x, targetRotation, delta * 10);
      
      // Add a tiny idle float
      coinRef.current.position.y = Math.sin(Date.now() / 500) * 0.1;
    }
  });

  return (
    <group ref={coinRef}>
      {/* Coin Edge */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.4, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Heads Face (Emerald) */}
      <group position={[0, 0, 0.21]}>
        <mesh>
          <circleGeometry args={[1.9, 32]} />
          <meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.4} />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={2} fontWeight="bold" color="#ffffff">
          H
        </Text>
      </group>

      {/* Tails Face (Amber) */}
      <group position={[0, 0, -0.21]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <circleGeometry args={[1.9, 32]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.4} />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={2} fontWeight="bold" color="#ffffff">
          T
        </Text>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN ENGINE
// ==================================================================

type GraphPoint = { flips: number; prob: number };

export default function GamblersFallacyEngine() {
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  const [speed, setSpeed] = useState<number>(0); // 0, 10, 100, 10000
  const [warningActive, setWarningActive] = useState(false);
  const [graphData, setGraphData] = useState<GraphPoint[]>([]);

  const totalFlips = heads + tails;
  const experimentalProb = totalFlips === 0 ? 0 : heads / totalFlips;
  const isFlipping = speed > 0;
  const currentSide = (heads + tails) % 2 === 0 ? 'H' : 'T'; // Just for visual resting state

  // Core Flipping Logic
  const executeFlips = (count: number) => {
    let newHeads = 0;
    let newTails = 0;
    let localStreak = currentStreak;
    let hitWarning = false;

    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.5) {
        newHeads++;
        localStreak++;
      } else {
        newTails++;
        localStreak = 0;
      }

      // Trigger Gambler's Fallacy at 5 heads in a row
      if (localStreak === 5 && !warningActive) {
        hitWarning = true;
        break; 
      }
    }

    setHeads(h => h + newHeads);
    setTails(t => t + newTails);
    setCurrentStreak(localStreak);

    if (hitWarning) {
      setSpeed(0);
      setWarningActive(true);
    }

    // Update Graph Data dynamically with Decimation to prevent memory leaks
    setGraphData(prev => {
      const newTotal = totalFlips + newHeads + newTails;
      const newProb = (heads + newHeads) / newTotal;
      const newData = [...prev, { flips: newTotal, prob: newProb }];
      
      // If the array gets too big, compress it by keeping every 2nd element, plus the newest one
      if (newData.length > 150) {
        return newData.filter((_, idx) => idx % 2 === 0).concat({ flips: newTotal, prob: newProb });
      }
      return newData;
    });
  };

  const handleManualFlip = () => {
    if (warningActive) return;
    executeFlips(1);
  };

  const resetEngine = () => {
    setHeads(0);
    setTails(0);
    setCurrentStreak(0);
    setSpeed(0);
    setWarningActive(false);
    setGraphData([]);
  };

  // Hyper-Drive Loop
  useEffect(() => {
    if (speed === 0 || warningActive) return;
    
    const interval = setInterval(() => {
      // Chunk the flips based on speed to keep React responsive
      const chunk = speed >= 10000 ? 1000 : speed >= 100 ? 10 : 1;
      executeFlips(chunk);
    }, 50);

    return () => clearInterval(interval);
  }, [speed, warningActive, heads, tails, currentStreak]);

  // Generate SVG Path for the graph
  const generateGraphPath = () => {
    if (graphData.length === 0) return "";
    return graphData.map((pt, index) => {
      const x = (index / Math.max(1, graphData.length - 1)) * 100;
      // Invert Y because SVG 0,0 is top-left. Map 0.0-1.0 to 100-0
      const y = 100 - (pt.prob * 100);
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="w-full h-full min-h-[800px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col select-none">
      
      {/* 3D SPATIAL CANVAS */}
      <div className="absolute inset-0 z-0 lg:w-1/2">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />

            <group position={[0, 0, 0]}>
              <Coin3D isFlipping={isFlipping} side={currentSide} />
            </group>

            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={10} color="#000000" position={[0, -2.5, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* GAMBLER'S FALLACY MODAL OVERLAY */}
      <AnimatePresence>
        {warningActive && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-rose-950/90 border border-rose-900 rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertOctagon size={32} className="text-rose-500" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Gambler's Fallacy Warning!</h2>
              <p className="text-rose-200/80 text-sm mb-6 leading-relaxed">
                The engine just flipped <strong>5 Heads in a row!</strong> <br/><br/>
                Human instinct screams that a "Tails" is overdue to balance the universe. Based on the laws of probability, what is the actual chance that the <em>next</em> flip is Tails?
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button onClick={() => setWarningActive(false)} className="w-full py-3 bg-stone-800 hover:bg-rose-900 text-stone-300 rounded-xl border border-stone-700 hover:border-rose-500 transition-all text-sm font-bold">
                  High (&gt; 50%) It's overdue!
                </button>
                <button onClick={() => { setWarningActive(false); setSpeed(0); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl border border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-sm font-bold uppercase tracking-widest">
                  Exactly 50% (No Memory)
                </button>
                <button onClick={() => setWarningActive(false)} className="w-full py-3 bg-stone-800 hover:bg-rose-900 text-stone-300 rounded-xl border border-stone-700 hover:border-rose-500 transition-all text-sm font-bold">
                  Low (&gt; 50%) It's on a streak!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Coins className="text-amber-500" /> The Gambler's Fallacy
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Experimental vs. Theoretical Probability in the long run.
          </p>
        </div>
        <button onClick={resetEngine} className="px-4 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors pointer-events-auto backdrop-blur-md">
          <RotateCcw size={14} className="inline mr-2" /> Reset
        </button>
      </div>

      {/* CONTROLS & GRAPH HUD */}
      <div className="absolute bottom-0 right-0 w-full lg:w-1/2 h-full flex flex-col justify-end p-6 gap-6 pointer-events-none">
        
        {/* Dynamic Line Graph */}
        <div className="flex-1 max-h-[300px] w-full bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl p-5 flex flex-col pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} /> Law of Large Numbers
            </h3>
            <span className="text-emerald-400 font-mono text-sm font-bold">P(Heads) = {(experimentalProb * 100).toFixed(1)}%</span>
          </div>

          <div className="flex-1 relative border-l border-b border-stone-700 pb-2 pl-2">
            
            {/* Graph Y-Axis Labels */}
            <div className="absolute -left-2 top-0 -translate-x-full text-[10px] text-stone-500 font-mono">1.0</div>
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full text-[10px] text-emerald-500 font-bold font-mono">0.5</div>
            <div className="absolute -left-2 bottom-2 -translate-x-full text-[10px] text-stone-500 font-mono">0.0</div>

            {/* The 0.5 Theoretical Probability Line */}
            <div className="absolute top-1/2 left-0 w-full border-t border-emerald-500/50 border-dashed" />

            {/* The SVG Data Line */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <polyline 
                points={generateGraphPath()} 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2" 
                strokeLinejoin="round" 
              />
            </svg>

            {/* X-Axis Label */}
            <div className="absolute -bottom-6 right-0 text-[10px] text-stone-500 font-mono">Total Flips: {totalFlips}</div>
          </div>
        </div>

        {/* Hyper-Drive Engine Controls */}
        <div className="w-full bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl p-5 pointer-events-auto">
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Total Heads</span>
              <span className="text-emerald-400 text-xl font-bold font-mono">{heads.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Total Tails</span>
              <span className="text-amber-400 text-xl font-bold font-mono">{tails.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              onClick={handleManualFlip}
              disabled={isFlipping || warningActive}
              className="py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors disabled:opacity-50"
            >
              Flip 1x
            </button>
            <button 
              onClick={() => setSpeed(speed === 10 ? 0 : 10)}
              disabled={warningActive}
              className={`py-3 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${speed === 10 ? 'bg-sky-600 text-white border-sky-500 shadow-[0_0_15px_rgba(2,132,199,0.5)]' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'}`}
            >
              10x / sec
            </button>
            <button 
              onClick={() => setSpeed(speed === 1000 ? 0 : 1000)}
              disabled={warningActive}
              className={`py-3 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${speed === 1000 ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'}`}
            >
              1K / sec
            </button>
            <button 
              onClick={() => setSpeed(speed === 10000 ? 0 : 10000)}
              disabled={warningActive}
              className={`py-3 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all flex justify-center items-center gap-1 ${speed === 10000 ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'}`}
            >
              <Zap size={14} /> 10K / sec
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}