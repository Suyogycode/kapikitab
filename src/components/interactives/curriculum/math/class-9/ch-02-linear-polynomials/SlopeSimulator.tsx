'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Line, ContactShadows } from '@react-three/drei';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

// ==================================================================
// NATIVE 3D PHYSICS COMPONENTS
// ==================================================================

// 1. The Auto-Rickshaw (Growth)
function Rickshaw({ targetX, targetY }: { targetX: number, targetY: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!ref.current) return;
    // Smooth driving physics
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, delta * 5);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, delta * 5);
  });

  return (
    <group ref={ref} position={[0, 0, 0.2]}>
      {/* Rickshaw Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.4]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Rickshaw Roof (Black Canvas) */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.45]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.2, 0.1, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.1, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// 2. The Battery (Decay)
function Battery({ targetX, targetY, chargeRatio }: { targetX: number, targetY: number, chargeRatio: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, delta * 5);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, delta * 5);
  });

  // Color transitions from emerald to rose as it dies
  const color = chargeRatio > 0.5 ? "#10b981" : chargeRatio > 0.2 ? "#f59e0b" : "#ef4444";

  return (
    <group ref={ref} position={[0, 0, 0.2]}>
      {/* Battery Casing */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.4} metalness={0.8} transparent opacity={0.6} />
      </mesh>
      {/* Battery Terminal */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.15]} />
        <meshStandardMaterial color="#d6d3d1" metalness={0.9} />
      </mesh>
      {/* Active Charge Level */}
      <mesh position={[0, (0.7 * chargeRatio) / 2 + 0.05, 0]}>
        <boxGeometry args={[0.4, 0.7 * chargeRatio, 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// 3. Dynamic Graph Line
function GraphLine({ points, color }: { points: [number, number, number][], color: string }) {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={5}
      transparent
    />
  );
}

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function SlopeSimulator() {
  // Global Time (x-axis)
  const [time, setTime] = useState<number>(5);
  
  // Scenario 1: Growth (Auto-Rickshaw Fare)
  const [gSlope, setGSlope] = useState<number>(60);
  const [gInt, setGInt] = useState<number>(100);
  
  // Scenario 2: Decay (Prepaid Balance)
  const [dSlope, setDSlope] = useState<number>(-40);
  const [dInt, setDInt] = useState<number>(600);

  // Math Scale Modifiers (to fit 0-1000 y-values into a reasonable 3D visual space)
  const VISUAL_SCALE_Y = 100;
  
  // Live Calculations
  const currentGrowthY = (gSlope * time) + gInt;
  const currentDecayY = Math.max(0, (dSlope * time) + dInt); // Prevent negative battery
  const batteryRatio = currentDecayY / dInt;

  // Generate Trailing Line Points
  const growthPoints: [number, number, number][] = [[0, gInt / VISUAL_SCALE_Y, 0.1], [time, currentGrowthY / VISUAL_SCALE_Y, 0.1]];
  const decayPoints: [number, number, number][] = [[0, dInt / VISUAL_SCALE_Y, 0.1], [time, currentDecayY / VISUAL_SCALE_Y, 0.1]];

  return (
    <div className="w-full h-full min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [5, 5, 14], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 15]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <OrbitControls enableZoom={true} target={[5, 4, 0]} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 4} />
            
            {/* Vertical Glass Graph Board */}
            <mesh position={[5, 4, -0.1]}>
              <planeGeometry args={[12, 10]} />
              <meshPhysicalMaterial color="#1c1917" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
            </mesh>

            {/* Vertical Grid (XY Plane) */}
            <Grid args={[12, 10]} position={[5, 4, 0]} rotation={[Math.PI / 2, 0, 0]} cellSize={1} cellThickness={1.5} cellColor="#3f3f46" sectionSize={1} fadeDistance={40} />

            {/* Axes */}
            <Line points={[[-0.1, 0, 0], [10.5, 0, 0]]} color="#a8a29e" lineWidth={4} />
            <Line points={[[0, -0.1, 0], [0, 8.5, 0]]} color="#a8a29e" lineWidth={4} />
            <Text position={[10.8, 0, 0]} fontSize={0.4} fontWeight="bold" color="#a8a29e">Time (x)</Text>
            <Text position={[0, 8.8, 0]} fontSize={0.4} fontWeight="bold" color="#a8a29e">Value (y)</Text>

            {/* Data Lines */}
            <GraphLine points={growthPoints} color="#10b981" />
            <GraphLine points={decayPoints} color="#ef4444" />

            {/* Vehicles */}
            <Rickshaw targetX={time} targetY={currentGrowthY / VISUAL_SCALE_Y} />
            <Battery targetX={time} targetY={currentDecayY / VISUAL_SCALE_Y} chargeRatio={batteryRatio} />

            <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" position={[5, -0.2, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
          <Activity className="text-emerald-500" /> The Slope Simulator
        </h2>
        <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
          Graphing $y = ax + b$: Growth vs. Decay.
        </p>
      </div>

      {/* FLOATING CONTROLS HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col xl:flex-row gap-4 pointer-events-none">
        
        {/* Growth Panel (Rickshaw) */}
        <div className="flex-1 bg-emerald-950/80 backdrop-blur-md border border-emerald-900/50 rounded-xl p-5 shadow-2xl pointer-events-auto">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <TrendingUp size={14} /> Auto-Rickshaw Fare (Growth)
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] text-emerald-200/70 font-mono mb-1">
                <span>Rate/Km (a)</span> <span className="font-bold text-white">₹{gSlope}</span>
              </div>
              <input type="range" min="10" max="100" step="10" value={gSlope} onChange={(e) => setGSlope(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-emerald-200/70 font-mono mb-1">
                <span>Base Fare (b)</span> <span className="font-bold text-white">₹{gInt}</span>
              </div>
              <input type="range" min="0" max="300" step="50" value={gInt} onChange={(e) => setGInt(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div className="pt-2 border-t border-emerald-900/50 flex justify-between font-mono text-sm text-white">
              <span>$y = {gSlope}x + {gInt}$</span>
              <span className="font-bold text-emerald-400">Total: ₹{currentGrowthY}</span>
            </div>
          </div>
        </div>

        {/* Global Time Control */}
        <div className="flex-1 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-5 shadow-2xl pointer-events-auto flex flex-col justify-center items-center">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Clock size={14} /> Time Progression (x)
          </h3>
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xl text-white font-mono font-bold mb-2">
              <span>0</span>
              <span className="text-sky-400">x = {time}</span>
              <span>10</span>
            </div>
            <input type="range" min="0" max="10" step="0.1" value={time} onChange={(e) => setTime(parseFloat(e.target.value))} className="w-full accent-sky-500 h-2" />
          </div>
          <p className="text-[10px] text-stone-500 mt-4 text-center">Drive the vehicles across the X-axis.</p>
        </div>

        {/* Decay Panel (Battery) */}
        <div className="flex-1 bg-rose-950/80 backdrop-blur-md border border-rose-900/50 rounded-xl p-5 shadow-2xl pointer-events-auto">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <TrendingDown size={14} /> Mobile Data (Decay)
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] text-rose-200/70 font-mono mb-1">
                <span>Usage/Hour (a)</span> <span className="font-bold text-white">{dSlope} MB</span>
              </div>
              <input type="range" min="-100" max="-10" step="10" value={dSlope} onChange={(e) => setDSlope(parseInt(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-rose-200/70 font-mono mb-1">
                <span>Starting Balance (b)</span> <span className="font-bold text-white">{dInt} MB</span>
              </div>
              <input type="range" min="300" max="1000" step="100" value={dInt} onChange={(e) => setDInt(parseInt(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <div className="pt-2 border-t border-rose-900/50 flex justify-between font-mono text-sm text-white">
              <span>$y = {dSlope}x + {dInt}$</span>
              <span className="font-bold text-rose-400">Left: {Math.max(0, currentDecayY)} MB</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}