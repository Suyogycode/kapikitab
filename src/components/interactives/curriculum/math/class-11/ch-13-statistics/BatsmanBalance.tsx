'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// DATA SETS & SCALING
// ==================================================================
// Both datasets sum to 265, mean = 53.
const scoresA = [0, 20, 31, 97, 117]; 
const scoresB = [46, 49, 53, 57, 60];

const MEAN = 53;
const SCALE_X = 0.15; // Visual scaling factor

type Phase = 'start' | 'dropA' | 'dropB' | 'wind';

// ==================================================================
// 3D SEESAW COMPONENT
// ==================================================================
function Seesaw({ 
  scores, 
  color, 
  isDropped, 
  isWindy, 
  inertiaMultiplier, 
  position 
}: { 
  scores: number[]; 
  color: string; 
  isDropped: boolean; 
  isWindy: boolean; 
  inertiaMultiplier: number;
  position: [number, number, number];
}) {
  const plankRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!plankRef.current) return;
    
    // Smoothly animate the wobble based on "wind" and rotational inertia[cite: 21]
    if (isWindy) {
      const time = state.clock.getElapsedTime();
      // Heavy inertia (Batsman A) causes massive, chaotic wobble. Low inertia (B) barely vibrates[cite: 21].
      const targetRotation = Math.sin(time * 12) * (0.05 * inertiaMultiplier);
      plankRef.current.rotation.z = THREE.MathUtils.lerp(plankRef.current.rotation.z, targetRotation, delta * 8);
    } else {
      // Return to perfect static equilibrium[cite: 21]
      plankRef.current.rotation.z = THREE.MathUtils.lerp(plankRef.current.rotation.z, 0, delta * 5);
    }
  });

  return (
    <group position={position}>
      {/* The Fulcrum fixed exactly at the 53 mark (relative 0 in our local space)[cite: 21] */}
      <mesh position={[0, -0.6, 0]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Fulcrum Label */}
      <Billboard position={[0, -1.5, 0]}>
        <Text fontSize={0.5} color="#cbd5e1" fontWeight="bold">μ = 53</Text>
      </Billboard>

      {/* The Dynamic Plank */}
      <group ref={plankRef} position={[0, 0, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[20, 0.1, 2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        
        {/* The Heavy Steel Blocks representing scores[cite: 21] */}
        {scores.map((score, idx) => {
          const blockX = (score - MEAN) * SCALE_X;
          return (
            <Block 
              key={idx} 
              targetX={blockX} 
              isDropped={isDropped} 
              color={color} 
              score={score} 
              delay={idx * 0.15} 
            />
          );
        })}
      </group>
    </group>
  );
}

// Sub-component for individual falling blocks
function Block({ targetX, isDropped, color, score, delay }: { targetX: number, isDropped: boolean, color: string, score: number, delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startY = 8;
  const [active, setActive] = useState(false);

  // Staggered drop effect
  React.useEffect(() => {
    if (isDropped) {
      const timer = setTimeout(() => setActive(true), delay * 1000);
      return () => clearTimeout(timer);
    } else {
      setActive(false);
      if (meshRef.current) meshRef.current.position.y = startY;
    }
  }, [isDropped, delay]);

  useFrame((_, delta) => {
    if (meshRef.current && active) {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0.5, delta * 10);
    }
  });

  return (
    <mesh ref={meshRef} position={[targetX, startY, 0]}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      <Billboard position={[0, 0.7, 0]}>
        <Text fontSize={0.3} color={color} fontWeight="bold" fillOpacity={active ? 1 : 0}>{score}</Text>
      </Billboard>
    </mesh>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function BatsmanBalance() {
  const [phase, setPhase] = useState<Phase>('start');

  const advancePhase = () => {
    if (phase === 'start') setPhase('dropA');
    else if (phase === 'dropA') setPhase('dropB');
    else if (phase === 'dropB') setPhase('wind');
    else setPhase('start');
  };

  const isAhaMoment = phase === 'wind';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Batsman's Balance</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Why central tendency (mean/median) is an incomplete picture of performance[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Innings Telemetry</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <div className={`p-3 rounded-lg border ${phase === 'dropA' || phase === 'wind' ? 'border-red-500/50 bg-red-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between items-center text-red-400 font-bold mb-1">
                <span>Batsman A (Wild)</span>
                <span>μ = 53</span>
              </div>
              <div className="text-stone-400 text-xs tracking-wider">0, 20, 31, 97, 117</div>
            </div>
            
            <div className={`p-3 rounded-lg border ${phase === 'dropB' || phase === 'wind' ? 'border-blue-500/50 bg-blue-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between items-center text-blue-400 font-bold mb-1">
                <span>Batsman B (Consistent)</span>
                <span>μ = 53</span>
              </div>
              <div className="text-stone-400 text-xs tracking-wider">46, 49, 53, 57, 60</div>
            </div>
          </div>

          <button 
            onClick={advancePhase}
            className="w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            {phase === 'start' ? 'Drop Batsman A Weights' : 
             phase === 'dropA' ? 'Drop Batsman B Weights' : 
             phase === 'dropB' ? 'Introduce Perturbation (Wind)' : 'Reset System'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Rotational Inertia & Dispersion</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Batsman B's seesaw (where blocks are clustered tightly around 53) barely vibrates[cite: 21]. Batsman A's seesaw, loaded with extreme weights at 0 and 117, violently wobbles due to its massive rotational inertia[cite: 21].
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-base font-bold text-emerald-400">
            While the centers are identical, the scatter completely changes the stability of the system, instantly proving why we must measure dispersion[cite: 21].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 22], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} />

            <group>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} />
              
              {/* X-Axis Number Line */}
              <Line points={[[-12, -4.5, -0.5], [12, -4.5, -0.5]] as [number, number, number][]} color="#475569" lineWidth={2} />
              <Billboard position={[-8.5, -5.2, -0.5]}><Text fontSize={0.5} color="#64748b">0</Text></Billboard>
              <Billboard position={[0, -5.2, -0.5]}><Text fontSize={0.5} color="#64748b">53</Text></Billboard>
              <Billboard position={[9.5, -5.2, -0.5]}><Text fontSize={0.5} color="#64748b">117</Text></Billboard>

              {/* BATSMAN A SEESAW (Back) */}
              <Seesaw 
                scores={scoresA} 
                color="#ef4444" // Red for A
                isDropped={phase === 'dropA' || phase === 'dropB' || phase === 'wind'} 
                isWindy={phase === 'wind'} 
                inertiaMultiplier={8.0} // High dispersion = high wobble
                position={[0, 3, -1]} 
              />
              
              {/* BATSMAN B SEESAW (Front) */}
              <Seesaw 
                scores={scoresB} 
                color="#3b82f6" // Blue for B
                isDropped={phase === 'dropB' || phase === 'wind'} 
                isWindy={phase === 'wind'} 
                inertiaMultiplier={0.3} // Tight cluster = low wobble
                position={[0, -2, 4]} 
              />
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.4} far={10} position={[0, -3.5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}