'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Settings2, Play, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: The Reservoir & Pumps
// ==================================================================
function PumpingRig({ pumps, phase }: { pumps: number, phase: string }) {
  const waterRef = useRef<THREE.Mesh>(null);
  const maxCapacity = 36; // Constant volume (k = 36)

  useFrame((_, delta) => {
    if (!waterRef.current) return;

    if (phase === 'filling') {
      // The fill rate is directly proportional to the number of pumps
      const fillRate = pumps; 
      
      // Calculate target scale and position based on capacity
      if (waterRef.current.scale.y < 2.8) {
        waterRef.current.scale.y += (fillRate / maxCapacity) * 2.8 * delta * 2;
      }
    } else if (phase === 'idle') {
      waterRef.current.scale.y = 0.001;
    }
    
    // Offset Y so it grows from the bottom
    waterRef.current.position.y = -1.4 + (waterRef.current.scale.y / 2);
  });

  // Generate Pump Visuals dynamically
  const pumpMeshes = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const radius = 2.2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const isActive = i < pumps;

    return (
      <group key={`pump-${i}`} position={[x, 1.5, z]} rotation={[0, -angle + Math.PI, 0]}>
        {/* Pump Body */}
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.8, 0.8]} />
          <meshStandardMaterial color={isActive ? "#3b82f6" : "#44403c"} roughness={0.6} metalness={0.5} />
        </mesh>
        {/* Water Stream (Only visible if active and filling) */}
        {isActive && phase === 'filling' && (
          <mesh position={[0.4, -1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
            <meshStandardMaterial color="#0ea5e9" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
    );
  });

  return (
    <group position={[0, 0, 0]}>
      {/* The Glass Reservoir */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 3, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} roughness={0.1} ior={1.5} thickness={0.1} />
      </mesh>
      
      {/* The Reservoir Base */}
      <mesh position={[0, -1.6, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.7, 0.2, 32]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>

      {/* The Dynamic Water Volume */}
      <mesh ref={waterRef} position={[0, -1.4, 0]}>
        <cylinderGeometry args={[1.45, 1.45, 1, 32]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} roughness={0.2} />
      </mesh>

      {/* The Pumps */}
      {pumpMeshes}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function InverseEngine() {
  const [pumps, setPumps] = useState<number>(2);
  const [phase, setPhase] = useState<'idle' | 'filling' | 'done'>('idle');

  // Math Engine
  const k = 36; // Constant Volume (2 pumps * 18 hours = 36)
  const time = k / pumps; // Inverse proportion calculation

  // Visual layout helpers for the 2D blocks
  // Scale the widths so 1 unit = a visual chunk, max width = 36 units total
  const blockWidthUnit = 8; // Pixels per unit for UI

  const handleSimulate = () => {
    setPhase('filling');
    // Time the animation to end relative to the time calculated
    // In a real physics engine, time = y. Here we map 1 hour = 200ms visual time
    setTimeout(() => {
      setPhase('done');
    }, time * 200);
  };

  const handleReset = () => {
    setPhase('idle');
  };

  return (
    <div className="w-full h-full min-h-[800px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">The Inverse Engine</h2>
        <p className="text-stone-400 text-sm mt-1">Inverse Proportion: <span className="font-mono text-blue-400">x₁y₁ = x₂y₂ = k</span></p>
      </div>

      {/* TOP HALF: THE 3D SPATIAL ENGINE */}
      <div className="flex-1 w-full relative z-0 min-h-[350px]">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
              <Environment preset="city" />
              
              <OrbitControls 
                enableZoom={false} 
                maxPolarAngle={Math.PI / 2 - 0.1} 
                minPolarAngle={Math.PI / 4}
              />
              
              <PumpingRig pumps={pumps} phase={phase} />

              <ContactShadows frames={1} resolution={512} scale={15} blur={2} opacity={0.6} far={10} color="#000000" />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* BOTTOM HALF: The Physical Equation HUD */}
      <div className="bg-stone-900 border-t border-stone-800 p-6 z-10 flex flex-col shrink-0">
        
        {/* The Equation Blocks */}
        <div className="flex flex-col items-center justify-center w-full mb-8 font-mono">
          <div className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-3 flex items-center justify-center w-full">
            <span className="flex-1 text-right pr-4">Pumps (x)</span>
            <span className="px-2">×</span>
            <span className="flex-1 text-left pl-4">Time in Hours (y)</span>
            <span className="px-2">=</span>
            <span className="flex-1 text-left pl-4">Constant Volume (k)</span>
          </div>

          <div className="flex items-center gap-4">
            {/* The Pumps Block (x) */}
            <motion.div 
              layout
              className="bg-blue-950/80 border-2 border-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] h-12"
              animate={{ width: pumps * blockWidthUnit * 3 }} // Visual scaling
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <span className="text-xl font-bold text-blue-400">{pumps}</span>
            </motion.div>

            <span className="text-stone-500 font-bold text-xl">×</span>

            {/* The Time Block (y) - SHRINKS AS PUMPS INCREASE */}
            <motion.div 
              layout
              className="bg-stone-800 border-2 border-stone-500 rounded-lg flex items-center justify-center shadow-lg h-12"
              animate={{ width: time * blockWidthUnit * 3 }} // Shrinks proportionately
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <span className="text-xl font-bold text-stone-300">{time}</span>
            </motion.div>

            <span className="text-stone-500 font-bold text-xl">=</span>

            {/* The Constant Block (k) */}
            <div className="bg-emerald-950 border-2 border-emerald-800 rounded-lg flex items-center justify-center shadow-lg h-12 w-32">
              <span className="text-xl font-bold text-emerald-500">{k}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl mx-auto">
          
          <div className="flex-1 w-full bg-stone-950 border border-stone-800 rounded-xl p-4 shadow-inner">
            <div className="flex justify-between items-end mb-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={16} className="text-blue-500" /> Active Pumps (x)
              </label>
              <span className="text-sm font-mono font-bold text-blue-400">{pumps}</span>
            </div>
            <input 
              type="range" min="1" max="6" step="1" 
              value={pumps} 
              onChange={(e) => {
                setPumps(parseInt(e.target.value));
                if (phase !== 'idle') handleReset();
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-blue-500"
            />
          </div>

          <div className="shrink-0">
            {phase === 'idle' ? (
              <button 
                onClick={handleSimulate}
                className="px-8 py-4 h-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              >
                <Play size={18} /> Fill Reservoir
              </button>
            ) : (
              <button 
                onClick={handleReset}
                className="px-8 py-4 h-full bg-stone-700 hover:bg-stone-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Drain Water
              </button>
            )}
          </div>

        </div>

        {/* AHA Moment Panel */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-6 bg-black/40 border border-stone-800 p-4 rounded-xl flex items-start gap-3 w-full max-w-2xl mx-auto"
            >
              <Zap size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                As you slide to <span className="font-mono text-blue-400">{pumps}</span> pumps, watch the heavy stone "Time" block instantly shrink to <span className="font-mono text-stone-300">{time}</span> hours to compensate. The area of the two blocks combined always perfectly balances out to the constant volume of 36!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}