'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard, Line } from '@react-three/drei';

type AngleMode = 'valid' | 'invalid';
type Phase = 'idle' | 'gear1' | 'gear2' | 'jammed' | 'rerouting' | 'output';

// Math Constants
const PI_4 = Math.PI / 4;       // 0.785
const PI_2 = Math.PI / 2;       // 1.571 (The Barricade)
const PI_3_5 = (3 * Math.PI) / 5; // 1.885
const PI_2_5 = (2 * Math.PI) / 5; // 1.257 (The Reroute)

// ==================================================================
// STEAMPUNK GEAR COMPONENT
// ==================================================================
function SteampunkGear({ 
  position, rotationZ, color, label, teeth = 12 
}: { 
  position: [number, number, number], rotationZ: number, color: string, label: string, teeth?: number 
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, rotationZ, delta * 4);
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Gear Core */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2, 2, 0.5, 32]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Gear Inner Hole */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.52, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {/* Gear Teeth */}
        {Array.from({ length: teeth }).map((_, i) => {
          const angle = (i / teeth) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[0.4, 0.4, 0.5]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
      <Billboard position={[0, 3, 0]}>
        <Text fontSize={0.6} color={color} fontWeight="bold">{label}</Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// CALCULATION MACHINE (Inside Canvas)
// ==================================================================
function CalculationMachine({ mode, phase }: { mode: AngleMode, phase: Phase }) {
  const blockRef = useRef<THREE.Group>(null);
  
  // Calculate targets based on mode and phase
  const inputAngle = mode === 'valid' ? PI_4 : PI_3_5;
  const inputLabel = mode === 'valid' ? "π/4" : "3π/5";
  
  let targetGear1 = 0;
  let targetGear2 = 0;
  let targetBlockX = -8;
  let blockLabel = inputLabel;
  let blockColor = "#94a3b8";

  if (phase === 'gear1') {
    targetBlockX = -3.5;
    targetGear1 = inputAngle;
    blockColor = "#3b82f6";
    blockLabel = `sin(${inputLabel})`;
  } else if (phase === 'gear2') {
    targetBlockX = 3.5;
    targetGear1 = inputAngle;
    targetGear2 = -inputAngle; // Attempt exact reverse
    blockColor = "#f59e0b";
  } else if (phase === 'jammed') {
    targetBlockX = 3.5;
    targetGear1 = inputAngle;
    targetGear2 = -PI_2; // Hits the barricade at PI/2[cite: 19]
    blockColor = "#ef4444";
    blockLabel = "JAMMED";
  } else if (phase === 'rerouting') {
    targetBlockX = 3.5;
    targetGear1 = inputAngle;
    targetGear2 = -PI_2_5; // Reroutes to principal value[cite: 19]
    blockColor = "#10b981";
    blockLabel = "2π/5";
  } else if (phase === 'output') {
    targetBlockX = 8;
    targetGear1 = inputAngle;
    targetGear2 = mode === 'valid' ? -inputAngle : -PI_2_5;
    blockColor = "#10b981";
    blockLabel = mode === 'valid' ? "π/4" : "2π/5";
  }

  useFrame((_, delta) => {
    if (blockRef.current) {
      blockRef.current.position.x = THREE.MathUtils.lerp(blockRef.current.position.x, targetBlockX, delta * 3);
    }
  });

  return (
    <group>
      {/* Conveyor Belt */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[20, 0.5, 3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* GEAR 1: sin(x) */}
      <SteampunkGear position={[-3.5, 1, -1]} rotationZ={targetGear1} color="#3b82f6" label="Gear 1: sin(x)" />
      
      {/* GEAR 2: arcsin(x) */}
      <group position={[3.5, 1, -1]}>
        <SteampunkGear position={[0, 0, 0]} rotationZ={targetGear2} color="#f59e0b" label="Gear 2: sin⁻¹(x)" />
        
        {/* The Steel Barricade[cite: 19] */}
        <mesh position={[Math.cos(-PI_2) * 2.5, Math.sin(-PI_2) * 2.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
        </mesh>
        <Billboard position={[0, -3.5, 0]}>
          <Text fontSize={0.4} color="#ef4444" fontWeight="bold">Barricade at π/2</Text>
        </Billboard>
        
        {/* Jam Indicator */}
        {phase === 'jammed' && (
          <mesh position={[Math.cos(-PI_2) * 2.5, Math.sin(-PI_2) * 2.5, 0.6]}>
            <sphereGeometry args={[0.8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* The Travelling Block */}
      <group ref={blockRef} position={[-8, -1, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color={blockColor} metalness={0.3} roughness={0.2} />
        </mesh>
        <Billboard position={[0, 1.5, 0]}>
          <Text fontSize={0.5} color="#ffffff" fontWeight="bold">{blockLabel}</Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function CompositionJammer() {
  const [mode, setMode] = useState<AngleMode>('valid');
  const [phase, setPhase] = useState<Phase>('idle');

  const advancePhase = () => {
    if (phase === 'idle') setPhase('gear1');
    else if (phase === 'gear1') setPhase('gear2');
    else if (phase === 'gear2') {
      if (mode === 'valid') setPhase('output');
      else setPhase('jammed');
    }
    else if (phase === 'jammed') setPhase('rerouting');
    else if (phase === 'rerouting') setPhase('output');
    else {
      setPhase('idle');
    }
  };

  const resetMachine = (newMode: AngleMode) => {
    setMode(newMode);
    setPhase('idle');
  };

  const isAhaMoment = phase === 'jammed' || phase === 'rerouting';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Composition Jammer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Evaluating $\sin^{-1}(\sin x)$ inside and outside the principal value branch[cite: 19].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Input Selection</span>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => resetMachine('valid')}
              className={`flex-1 py-2 rounded border font-bold font-mono ${mode === 'valid' ? 'bg-sky-900/50 border-sky-500 text-sky-400' : 'bg-stone-950 border-stone-700 text-stone-500'}`}
            >
              x = π/4
            </button>
            <button 
              onClick={() => resetMachine('invalid')}
              className={`flex-1 py-2 rounded border font-bold font-mono ${mode === 'invalid' ? 'bg-amber-900/50 border-amber-500 text-amber-400' : 'bg-stone-950 border-stone-700 text-stone-500'}`}
            >
              x = 3π/5
            </button>
          </div>

          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${phase === 'gear1' ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              Step 1: Compute $\sin(x)$
            </div>
            <div className={`p-2 rounded border ${phase === 'gear2' ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              Step 2: Compute $\sin^{-1}(\sin(x))$
            </div>
            {mode === 'invalid' && (
              <div className={`p-2 rounded border ${phase === 'jammed' ? 'border-red-500/50 text-red-400 bg-red-950/30' : phase === 'rerouting' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-600'}`}>
                {phase === 'jammed' ? 'ERROR: Domain Boundary Hit!' : 'Rerouting to Principal Branch...'}
              </div>
            )}
            <div className={`p-2 rounded border ${phase === 'output' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-600'}`}>
              Final Output: {phase === 'output' ? (mode === 'valid' ? 'π/4' : '2π/5') : '...'}
            </div>
          </div>

          <button 
            onClick={advancePhase}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'output' ? 'bg-stone-800 text-stone-500 border-stone-700' : phase === 'jammed' ? 'bg-red-600 hover:bg-red-500 text-white border-red-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {phase === 'idle' ? 'Feed Machine' : 
             phase === 'gear1' ? 'Engage Inverse Gear' : 
             phase === 'gear2' ? 'Continue' : 
             phase === 'jammed' ? 'Reroute Gear' : 
             phase === 'rerouting' ? 'Eject Output' : 'Reset Machine'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-red-400 text-xs uppercase tracking-widest font-bold mb-2">Mechanical Barricade</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Gear 2 attempts to reverse the process, but it slams into a solid steel barricade bolted onto its rotation track at exactly π/2 (the strict boundary of the principal value branch)[cite: 19].
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Unable to reach 3π/5, the gear mechanically reroutes to the equivalent geometrical angle inside its boundary, spitting out 2π/5[cite: 19]. 
          </p>
          <div className="inline-block bg-red-950/50 px-6 py-2 rounded-lg border border-red-900/50 font-mono text-base font-bold text-white">
            The physical barrier prevents blindly canceling out operations without checking the domain constraints[cite: 19].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <CalculationMachine mode={mode} phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2.5, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}