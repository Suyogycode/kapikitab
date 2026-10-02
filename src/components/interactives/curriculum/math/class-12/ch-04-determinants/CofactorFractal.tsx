'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'idle' | 'extract_a11' | 'extract_a12' | 'extract_a13' | 'fractal';

// ==================================================================
// DATA SETS & POSITION CALCULATIONS
// ==================================================================
const MATRIX_VALUES = [
  [2, -1, 3],
  [4, 1, 5],
  [-2, 0, 6]
];

// Flat array with metadata for easier mapping
const ELEMENTS = MATRIX_VALUES.flatMap((row, r) => 
  row.map((val, c) => ({
    id: `a${r+1}${c+1}`,
    val,
    r,
    c,
    basePos: new THREE.Vector3((c - 1) * 1.5, (1 - r) * 1.5, 0)
  }))
);

// ==================================================================
// 3D ELEMENT COMPONENT
// ==================================================================
function AnimatedElement({ 
  element, phase 
}: { 
  element: typeof ELEMENTS[0]; phase: Phase 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate target states based on phase
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  let targetOpacity = 1;
  let targetScale = 1;
  let color = "#3b82f6"; // Default Blue
  let emissive = "#1d4ed8";

  // Base state
  targetPos.copy(element.basePos);

  if (phase === 'extract_a11') {
    if (element.r === 0 && element.c === 0) { // a11[cite: 23]
      targetPos.set(-3, 0, 2);
      targetScale = 1.2;
    } else if (element.r === 0 || element.c === 0) { // Laser burns row/col[cite: 23]
      targetOpacity = 0.1;
      color = "#ef4444";
    } else { // Minor M11[cite: 23]
      targetPos.x -= 0.5;
      targetPos.y += 0.5;
    }
  } 
  else if (phase === 'extract_a12') {
    if (element.r === 0 && element.c === 1) { // a12
      targetPos.set(-3, 0, 2);
      targetScale = 1.2;
      color = "#ef4444"; // Alternating negative sign (Red)[cite: 23]
      emissive = "#b91c1c";
    } else if (element.r === 0 || element.c === 1) {
      targetOpacity = 0.1;
      color = "#ef4444";
    } else { // Minor M12
      if (element.c === 0) targetPos.x += 0.5;
      if (element.c === 2) targetPos.x -= 0.5;
      targetPos.y += 0.5;
    }
  }
  else if (phase === 'extract_a13') {
    if (element.r === 0 && element.c === 2) { // a13
      targetPos.set(-3, 0, 2);
      targetScale = 1.2;
    } else if (element.r === 0 || element.c === 2) {
      targetOpacity = 0.1;
      color = "#ef4444";
    } else { // Minor M13
      targetPos.x += 0.5;
      targetPos.y += 0.5;
    }
  }
  else if (phase === 'fractal') {
    // Shatter into three distinct 2x2 sub-grids[cite: 23]
    if (element.r === 0) {
      targetScale = 1.2;
      if (element.c === 0) { targetPos.set(-7, 2, 0); }
      if (element.c === 1) { targetPos.set(0, 2, 0); color = "#ef4444"; emissive = "#b91c1c"; }
      if (element.c === 2) { targetPos.set(7, 2, 0); }
    } else {
      // Create duplicates visually by routing elements to specific areas
      // For simplicity in this engine without cloning, we map the remaining elements to form one of the minors,
      // but conceptually they represent the fractured pieces. We'll arrange them in a spread pattern.
      targetOpacity = 0.8;
      targetScale = 0.8;
      targetPos.copy(element.basePos);
      targetPos.x *= 2.5; // Spread out
    }
  }

  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    
    groupRef.current.position.lerp(targetPos, delta * 5);
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 5);
    
    // Animate color transition
    const targetColor = new THREE.Color(color);
    mat.color.lerp(targetColor, delta * 5);
    const targetEmissive = new THREE.Color(emissive);
    mat.emissive.lerp(targetEmissive, delta * 5);
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 1.2, 0.4]} />
        <meshStandardMaterial transparent depthWrite={false} metalness={0.5} roughness={0.2} />
      </mesh>
      <Billboard position={[0, 0, 0.25]}>
        <Text fontSize={0.6} color="#ffffff" fontWeight="bold">
          {element.val}
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.25} color="#cbd5e1">
          {element.id}
        </Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function CofactorFractal() {
  const [phase, setPhase] = useState<Phase>('idle');

  const advanceExpansion = () => {
    if (phase === 'idle') setPhase('extract_a11');
    else if (phase === 'extract_a11') setPhase('extract_a12');
    else if (phase === 'extract_a12') setPhase('extract_a13');
    else if (phase === 'extract_a13') setPhase('fractal');
    else setPhase('idle');
  };

  const isAhaMoment = phase === 'fractal';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Cofactor Fractal</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Expanding a 3x3 determinant requires breaking it down into smaller 2x2 determinants (minors)[cite: 23].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Expansion Engine</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">Alternating Signs (-1)^(i+j)</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${phase === 'idle' ? 'border-sky-500/50 text-sky-400 bg-sky-950/30' : 'border-stone-800 text-stone-600'}`}>
              Start: Select First Row (R1)[cite: 23]
            </div>
            <div className={`p-2 rounded border ${phase === 'extract_a11' ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              Step 1: + a11 * M11[cite: 23]
            </div>
            <div className={`p-2 rounded border ${phase === 'extract_a12' ? 'border-red-500/50 text-red-400 bg-red-950/30' : 'border-stone-800 text-stone-600'}`}>
              Step 2: - a12 * M12[cite: 23]
            </div>
            <div className={`p-2 rounded border ${phase === 'extract_a13' ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              Step 3: + a13 * M13[cite: 23]
            </div>
          </div>

          <button 
            onClick={advanceExpansion}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'fractal' ? 'bg-stone-800 text-stone-500 border-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {phase === 'idle' ? 'Extract a11' : 
             phase === 'extract_a11' ? 'Extract a12' : 
             phase === 'extract_a12' ? 'Extract a13' : 
             phase === 'extract_a13' ? 'Shatter Matrix' : 'Reset Grid'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Recursive Geometric Fracturing</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The massive 3x3 grid physically shatters into distinct 2x2 sub-grids[cite: 23]. 
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-white">
            Expanding a determinant is not just an arbitrary formula, but a recursive, geometric fracturing of the matrix into smaller, manageable dimensions[cite: 23].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 20]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <group>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[40, 40, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} />

              {/* DYNAMIC MATRIX ELEMENTS */}
              {ELEMENTS.map((el) => (
                <AnimatedElement key={el.id} element={el} phase={phase} />
              ))}

              {/* Laser Grid Visualizer for step-by-step burnout */}
              {phase !== 'idle' && phase !== 'fractal' && (
                <group position={[0, 0, -0.5]}>
                  <Line points={[[-3, 1.5, 0], [3, 1.5, 0]] as [number, number, number][]} color="#ef4444" lineWidth={4} transparent opacity={0.5} />
                  {phase === 'extract_a11' && <Line points={[[-1.5, 3, 0], [-1.5, -3, 0]] as [number, number, number][]} color="#ef4444" lineWidth={4} transparent opacity={0.5} />}
                  {phase === 'extract_a12' && <Line points={[[0, 3, 0], [0, -3, 0]] as [number, number, number][]} color="#ef4444" lineWidth={4} transparent opacity={0.5} />}
                  {phase === 'extract_a13' && <Line points={[[1.5, 3, 0], [1.5, -3, 0]] as [number, number, number][]} color="#ef4444" lineWidth={4} transparent opacity={0.5} />}
                </group>
              )}
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -4, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}