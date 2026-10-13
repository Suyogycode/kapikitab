'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function OrthogonalGridScene({ pA, pB }: { pA: number, pB: number }) {
  const stripARef = useRef<THREE.Mesh>(null);
  const stripBRef = useRef<THREE.Mesh>(null);
  const intersectRef = useRef<THREE.Mesh>(null);
  
  // Total sample space is a 10x10 square representing probability of 1.0
  const GRID_SIZE = 10;

  useFrame((_, delta) => {
    if (!stripARef.current || !stripBRef.current || !intersectRef.current) return;

    // Target dimensions and positions
    // Event A (Horizontal Strip)
    const targetHeightA = pA * GRID_SIZE;
    const targetScaleA = new THREE.Vector3(GRID_SIZE, targetHeightA || 0.01, 1);
    const targetPosA = new THREE.Vector3(GRID_SIZE / 2, targetHeightA / 2, 0);

    // Event B (Vertical Strip)
    const targetWidthB = pB * GRID_SIZE;
    const targetScaleB = new THREE.Vector3(targetWidthB || 0.01, GRID_SIZE, 1);
    const targetPosB = new THREE.Vector3(targetWidthB / 2, GRID_SIZE / 2, 0);

    // Intersection (A ∩ B)
    const targetScaleInt = new THREE.Vector3(targetWidthB || 0.01, targetHeightA || 0.01, 1);
    const targetPosInt = new THREE.Vector3(targetWidthB / 2, targetHeightA / 2, 0.1); // Slightly elevated to prevent z-fighting

    // Lerp animations for smooth slider dragging
    stripARef.current.scale.lerp(targetScaleA, delta * 8);
    stripARef.current.position.lerp(targetPosA, delta * 8);

    stripBRef.current.scale.lerp(targetScaleB, delta * 8);
    stripBRef.current.position.lerp(targetPosB, delta * 8);

    intersectRef.current.scale.lerp(targetScaleInt, delta * 8);
    intersectRef.current.position.lerp(targetPosInt, delta * 8);
  });

  return (
    <group position={[-5, -5, 0]}>
      {/* Base Grid / Sample Space (1.0 x 1.0) */}
      <mesh position={[GRID_SIZE / 2, GRID_SIZE / 2, -0.1]}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <gridHelper 
        args={[GRID_SIZE, 10, "#334155", "#1e293b"]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[GRID_SIZE / 2, GRID_SIZE / 2, -0.05]} 
      />

      {/* Grid Outlines */}
      <Line points={[[0, 0, 0], [GRID_SIZE, 0, 0], [GRID_SIZE, GRID_SIZE, 0], [0, GRID_SIZE, 0], [0, 0, 0]] as [number, number, number][]} color="#475569" lineWidth={2} />

      {/* Axis Labels */}
      <Billboard position={[GRID_SIZE / 2, -0.8, 0]}>
        <Text fontSize={0.5} color="#10b981">Probability of Event B</Text>
      </Billboard>
      <Billboard position={[-1.2, GRID_SIZE / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Text fontSize={0.5} color="#3b82f6">Probability of Event A</Text>
      </Billboard>

      {/* Event A (Horizontal Strip)[cite: 27] */}
      <mesh ref={stripARef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Event B (Vertical Strip)[cite: 27] */}
      <mesh ref={stripBRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Overlapping Product Area (Intersection)[cite: 27] */}
      <mesh ref={intersectRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function OrthogonalGrid() {
  const [pA, setPA] = useState<number>(0.6);
  const [pB, setPB] = useState<number>(0.5);

  const jointProbability = pA * pB;
  const isAhaMoment = pA > 0 && pB > 0;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Orthogonal Grid</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Two events are independent if the occurrence of one does not affect the probability of the other[cite: 27].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Independent Events</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Probability P(A) Slider[cite: 27] */}
            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-950/20">
              <div className="flex justify-between text-blue-400 font-bold mb-3 text-xs uppercase tracking-widest">
                <span>P(A) - Horizontal</span>
                <span>{pA.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={pA} 
                onChange={(e) => setPA(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Probability P(B) Slider[cite: 27] */}
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20">
              <div className="flex justify-between text-emerald-400 font-bold mb-3 text-xs uppercase tracking-widest">
                <span>P(B) - Vertical</span>
                <span>{pB.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={pB} 
                onChange={(e) => setPB(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Joint Probability HUD */}
            <div className="p-3 rounded-lg border border-purple-500/50 bg-purple-950/30 mt-2">
              <div className="text-purple-300 font-bold mb-1">Intersection P(A ∩ B)</div>
              <div className="text-xs text-purple-200/70 mb-2">P(A) × P(B)</div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-purple-400">{pA.toFixed(2)} × {pB.toFixed(2)}</span>
                <span className="text-purple-300 font-bold">= {jointProbability.toFixed(3)}</span>
              </div>
            </div>

          </div>

          <button 
            onClick={() => { setPA(0.5); setPB(0.5); }}
            className="w-full py-2.5 rounded-lg border border-stone-600 bg-stone-800 text-stone-300 hover:bg-stone-700 font-bold text-xs tracking-widest uppercase transition-colors"
          >
            Reset Grid
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Proof of Independence</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Because the events are independent, the intersecting area scales precisely like the area of a rectangle (width × height)[cite: 27].
          </p>
          <div className="inline-block bg-purple-950/50 px-6 py-2 rounded-lg border border-purple-900/50 font-mono text-sm font-bold text-purple-300">
            This proves why multiplying their individual probabilities yields the exact intersection space: P(A ∩ B) = P(A) · P(B)[cite: 27].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, -2, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <Environment preset="city" />
            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
            <OrthogonalGridScene pA={pA} pB={pB} />
            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -6, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}