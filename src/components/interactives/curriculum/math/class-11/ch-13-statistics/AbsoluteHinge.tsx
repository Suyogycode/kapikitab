'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// DATA SETS & SCALING
// ==================================================================
const MEAN = 8;
const OBSERVATIONS = 4;
const TOTAL_ABS_DEV = 12; // (4 + 2 + |-2| + |-4|)
const MEAN_DEV = TOTAL_ABS_DEV / OBSERVATIONS; // 3

const DEVIATIONS = [
  { id: 1, point: 12, val: 4, initY: 3, cancelX: 0, stackX: 0, color: '#3b82f6' },
  { id: 2, point: 10, val: 2, initY: 1, cancelX: 4, stackX: 4, color: '#60a5fa' },
  { id: 3, point: 6, val: -2, initY: -1, cancelX: 6, stackX: 6, color: '#f87171' },
  { id: 4, point: 4, val: -4, initY: -3, cancelX: 4, stackX: 8, color: '#ef4444' }
];

type Phase = 'start' | 'cancel' | 'hinge' | 'stack';

// ==================================================================
// ANIMATED DEVIATION BAR
// ==================================================================
function AnimatedDeviationBar({
  val, initY, phase, cancelX, stackX, color
}: {
  val: number; initY: number; phase: Phase; cancelX: number; stackX: number; color: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isNeg = val < 0;

  // Determine target coordinates based on the current phase
  let targetX = 0;
  let targetY = initY;
  let targetRotY = 0;

  if (phase === 'cancel') {
    targetX = cancelX;
    targetY = 0;
  } else if (phase === 'hinge') {
    targetRotY = isNeg ? Math.PI : 0; // Rotate 180 degrees over the hinge[cite: 19]
  } else if (phase === 'stack') {
    targetX = stackX;
    targetY = 0;
    targetRotY = isNeg ? Math.PI : 0;
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 5);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 5);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 5);
  });

  return (
    <group ref={groupRef}>
      {/* The Vector Block */}
      <mesh position={[val / 2, 0, 0]}>
        <boxGeometry args={[Math.abs(val), 0.6, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
      
      {/* Mechanical Hinge (Only visible on negative vectors during transformation)[cite: 19] */}
      {isNeg && (phase === 'hinge' || phase === 'stack') && (
        <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 1.2, 32]} />
          <meshStandardMaterial color="#fcd34d" metalness={0.8} emissive="#d97706" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Point Label attached to the end of the vector */}
      {phase === 'start' && (
        <Billboard position={[val + (isNeg ? -1 : 1), 0, 0]}>
          <Text fontSize={0.5} color={color} fontWeight="bold">
            {val > 0 ? `+${val}` : val}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AbsoluteHinge() {
  const [phase, setPhase] = useState<Phase>('start');

  const advancePhase = () => {
    if (phase === 'start') setPhase('cancel');
    else if (phase === 'cancel') setPhase('hinge');
    else if (phase === 'hinge') setPhase('stack');
    else setPhase('start');
  };

  const isCancelled = phase === 'cancel';
  const isAhaMoment = phase === 'stack';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Absolute Hinge</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Why we must take the absolute value of deviations before averaging them[cite: 19].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Dataset Engine</span>
            <span className="text-blue-400 font-mono text-xs font-bold">Mean (x̄) = {MEAN}</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            {DEVIATIONS.map(dev => (
              <div key={dev.id} className="flex justify-between items-center bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-stone-400">Point: {dev.point}</span>
                <span className={dev.val > 0 ? "text-blue-400" : "text-red-400"}>
                  {phase === 'start' || phase === 'cancel' 
                    ? `Dev: ${dev.val > 0 ? '+' : ''}${dev.val}` 
                    : `|Dev|: ${Math.abs(dev.val)}`}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={advancePhase}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'cancel' ? 'bg-amber-600 hover:bg-amber-500 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'} text-white`}
          >
            {phase === 'start' ? 'Sum Natural Deviations' : 
             phase === 'cancel' ? 'Apply Absolute Value |x_i - x̄|' : 
             phase === 'hinge' ? 'Stack Absolute Column' : 'Reset System'}
          </button>
        </div>
      </div>

      {/* DISPERSION CANCELLED ERROR */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-300 ${isCancelled ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="bg-red-950/90 border-2 border-red-500 px-8 py-4 rounded-xl backdrop-blur-md text-center shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse">
          <h3 className="text-red-400 font-bold text-xl uppercase tracking-widest mb-1">Error: Dispersion Cancelled</h3>
          <p className="text-red-200 font-mono text-sm">Negative 3D vectors perfectly slide over and cancel out the positive vectors[cite: 19].</p>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Mechanical Absolute Value</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Every negative vector on the left side physically swings 180 degrees over the hinge[cite: 19]. Now pointing in the same direction, all the vectors smoothly stack end-to-end to form a single, massive column[cite: 19]. 
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-white">
            Divide Total Length ({TOTAL_ABS_DEV}) by Observations ({OBSERVATIONS}) = Mean Deviation ({MEAN_DEV})[cite: 19]
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [5, 0, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 15]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <group position={[-3, 0, 0]}>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} />
              
              {/* GLOWING MEAN LINE (x̄)[cite: 19] */}
              <Line points={[[0, -6, -0.5], [0, 6, -0.5]] as [number, number, number][]} color="#fcd34d" lineWidth={4} />
              <Billboard position={[0, 6.5, 0]}><Text fontSize={0.6} color="#fcd34d" fontWeight="bold">Mean (x̄)</Text></Billboard>

              {/* DYNAMIC DEVIATION BARS */}
              {DEVIATIONS.map((dev) => (
                <AnimatedDeviationBar 
                  key={dev.id} 
                  val={dev.val} 
                  initY={dev.initY} 
                  phase={phase} 
                  cancelX={dev.cancelX} 
                  stackX={dev.stackX} 
                  color={dev.color} 
                />
              ))}

              {/* DIVISION BRACKET FOR FINAL MEAN DEVIATION[cite: 19] */}
              {phase === 'stack' && (
                <group position={[0, -1.5, 0]}>
                  {/* Total Length Bracket */}
                  <Line points={[[0, 0, 0], [0, -0.5, 0], [TOTAL_ABS_DEV, -0.5, 0], [TOTAL_ABS_DEV, 0, 0]] as [number, number, number][]} color="#94a3b8" />
                  <Billboard position={[TOTAL_ABS_DEV / 2, -1, 0]}>
                    <Text fontSize={0.5} color="#cbd5e1" fontWeight="bold">Σ|x_i - x̄| = {TOTAL_ABS_DEV}</Text>
                  </Billboard>
                  
                  {/* Mean Deviation Segment Highlight (Length of 3) */}
                  <mesh position={[MEAN_DEV / 2, -0.5, 0]}>
                    <boxGeometry args={[MEAN_DEV, 0.1, 0.1]} />
                    <meshBasicMaterial color="#10b981" />
                  </mesh>
                  <Billboard position={[MEAN_DEV / 2, 0.3, 0]}>
                    <Text fontSize={0.4} color="#10b981" fontWeight="bold">Mean Dev = {MEAN_DEV}</Text>
                  </Billboard>
                </group>
              )}
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -7, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}