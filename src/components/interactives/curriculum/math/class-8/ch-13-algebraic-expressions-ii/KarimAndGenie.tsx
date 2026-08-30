'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import { Play, RotateCcw, FastForward, History, Sparkles, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// MATH ENGINE & STORY STATES
// ==================================================================
const REVERSE_STEPS = [
  { coins: 0, desc: "End of Journey. Sack is empty.", eq: "0" },
  { coins: 8, desc: "Time Reverse: Genie returns 8 coins.", eq: "0 + 8 = 8" },
  { coins: 4, desc: "Time Reverse: Karim walks backward (halves).", eq: "8 ÷ 2 = 4" },
  { coins: 12, desc: "Time Reverse: Genie returns 8 coins.", eq: "4 + 8 = 12" },
  { coins: 6, desc: "Time Reverse: Karim walks backward (halves).", eq: "12 ÷ 2 = 6" },
  { coins: 14, desc: "Time Reverse: Genie returns 8 coins.", eq: "6 + 8 = 14" },
  { coins: 7, desc: "Time Reverse: Karim walks backward to START.", eq: "14 ÷ 2 = 7" },
];

// ==================================================================
// NATIVE R3F ENGINE: The Banyan Tree Rig
// ==================================================================
function StoryRig({ phase, timeStep }: { phase: string, timeStep: number }) {
  const karimRef = useRef<THREE.Group>(null);
  const sackRef = useRef<THREE.Mesh>(null);
  const genieRef = useRef<THREE.Group>(null);
  
  // Dynamic scaling and positioning based on the time step
  useFrame((state, delta) => {
    if (!karimRef.current || !sackRef.current || !genieRef.current) return;

    // Genie Hover Animation
    genieRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;

    if (phase === 'forward_play') {
      // Simulate Karim running around the tree fast
      karimRef.current.rotation.y += delta * 4;
      // Shrink sack to 0
      sackRef.current.scale.setScalar(THREE.MathUtils.lerp(sackRef.current.scale.x, 0.1, delta * 0.5));
    } 
    else if (phase === 'reversing') {
      // Position Karim based on time step
      // Even steps (0, 2, 4, 6) = At Genie (Angle 0)
      // Odd steps (1, 3, 5) = At Genie (Angle 0), just receiving coins
      // The walk happens between odd and even.
      const targetAngle = (timeStep / 2) * (Math.PI * 2);
      karimRef.current.rotation.y = THREE.MathUtils.lerp(karimRef.current.rotation.y, targetAngle, delta * 3);

      // Scale sack based on coins
      const targetScale = Math.max(0.2, REVERSE_STEPS[timeStep].coins * 0.15);
      sackRef.current.scale.setScalar(THREE.MathUtils.lerp(sackRef.current.scale.x, targetScale, delta * 5));
    }
    else {
      // Idle / Start
      karimRef.current.rotation.y = 0;
      sackRef.current.scale.setScalar(0.8); // Unknown starting size
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* The Ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[5, 5, 1, 32]} />
        <meshStandardMaterial color="#292524" roughness={1} />
      </mesh>

      {/* The Banyan Tree */}
      <group position={[0, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 3, 8]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 3.5, 0]}>
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
        <mesh castShadow receiveShadow position={[1.5, 2.5, 1]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial color="#166534" roughness={0.8} />
        </mesh>
        <mesh castShadow receiveShadow position={[-1.5, 2.8, -1]}>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshStandardMaterial color="#14532d" roughness={0.8} />
        </mesh>
      </group>

      {/* The Genie */}
      <group ref={genieRef} position={[0, 1.5, 3.5]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 0.6, 16, 16]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.2} emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 1, 0]} fontSize={0.3} color="#38bdf8">Genie</Text>
      </group>

      {/* Karim & His Sack (Orbital Rig) */}
      <group ref={karimRef}>
        <group position={[0, 0, 2.5]}>
          {/* Karim Avatar */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} />
          </mesh>
          
          {/* The Coin Sack */}
          <mesh ref={sackRef} position={[0.4, 0.5, 0]} castShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.9} />
          </mesh>
        </group>
      </group>

    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function KarimAndGenie() {
  const [phase, setPhase] = useState<'idle' | 'forward_play' | 'reversing'>('idle');
  const [timeStep, setTimeStep] = useState<number>(0);

  const handlePlayStory = () => {
    setPhase('forward_play');
    // Simulate the 3 rounds passing quickly
    setTimeout(() => {
      setPhase('reversing');
      setTimeStep(0); // Start at the end (0 coins)
    }, 3000);
  };

  const handleReset = () => {
    setPhase('idle');
    setTimeStep(0);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white flex items-center gap-3">
          <History className="text-emerald-500" /> Karim & The Genie's Loop
        </h2>
        <p className="text-stone-400 text-sm mt-1">Solving equations via Time-Reversal.</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [5, 4, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 - 0.05} 
              minPolarAngle={Math.PI / 4}
              target={[0, 1, 0]}
            />
            
            <StoryRig phase={phase} timeStep={timeStep} />

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.6} far={10} color="#000000" position={[0, -1.5, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Controls & HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        {/* Story / Aha Panel */}
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl bg-black/60 backdrop-blur-md border border-stone-700/50 p-5 rounded-2xl flex items-start gap-4 shadow-lg pointer-events-auto mb-6">
              <Coins size={24} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                <strong>The Puzzle:</strong> Karim walks around a magic Banyan tree. Every time he completes a loop, his coins <strong>double</strong>. But immediately after, a Genie forces him to pay <strong>8 coins</strong>. After exactly 3 rounds, Karim has 0 coins left. How many did he start with?
              </p>
            </motion.div>
          )}

          {phase === 'forward_play' && (
            <motion.div key="forward" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl bg-amber-950/60 backdrop-blur-md border border-amber-900/50 p-5 rounded-2xl flex items-center justify-center gap-4 shadow-lg mb-6">
              <FastForward size={24} className="text-amber-500 animate-pulse" />
              <p className="text-amber-300 font-bold tracking-widest uppercase">Fast Forwarding 3 Rounds...</p>
            </motion.div>
          )}

          {phase === 'reversing' && (
            <motion.div key="reversing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl flex flex-col gap-4 shadow-2xl pointer-events-auto mb-6">
              <div className="flex items-start gap-3">
                <Sparkles size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-300 uppercase tracking-widest text-xs mb-1">Time Reversal Algebra</h3>
                  <p className="text-emerald-50 text-sm leading-relaxed">
                    To find the start, we must run time backward! Subtractions become additions (Genie gives coins back), and multiplications become divisions (Tree halves the coins). 
                  </p>
                </div>
              </div>
              
              <div className="bg-stone-950 border border-emerald-900 p-4 rounded-xl flex items-center justify-between">
                <div className="text-stone-400 font-mono text-sm">{REVERSE_STEPS[timeStep].desc}</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">{REVERSE_STEPS[timeStep].eq}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="w-full max-w-2xl flex gap-4 pointer-events-auto">
          
          {phase === 'idle' && (
             <button 
               onClick={handlePlayStory}
               className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
             >
               <Play size={18} /> Watch The Story
             </button>
          )}

          {phase === 'forward_play' && (
             <button disabled className="w-full py-4 bg-stone-800 text-stone-600 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
               Processing...
             </button>
          )}

          {phase === 'reversing' && (
            <div className="w-full bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-center">
              <div className="flex justify-between items-end mb-3">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Reverse Timeline Scrubber
                </label>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {timeStep === 6 ? 'Start of Story (Answer Found!)' : `Step ${timeStep} / 6`}
                </span>
              </div>
              <input 
                type="range" min="0" max="6" step="1" 
                value={timeStep} 
                onChange={(e) => setTimeStep(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-emerald-500"
              />
              <div className="w-full flex justify-between mt-2 px-1">
                <span className="text-[9px] font-mono text-stone-500 uppercase">End (0 Coins)</span>
                <span className="text-[9px] font-mono text-stone-500 uppercase">Start (? Coins)</span>
              </div>
            </div>
          )}

          {(phase === 'reversing' || phase === 'forward_play') && (
            <button 
              onClick={handleReset}
              className="shrink-0 px-6 bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-colors flex flex-col items-center justify-center gap-1 shadow-lg"
            >
              <RotateCcw size={18} /> Reset
            </button>
          )}

        </div>

      </div>
    </div>
  );
}