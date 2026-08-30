'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Line, Text } from '@react-three/drei';
import { Play, RotateCcw, Box, Navigation, Lightbulb, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: The Unfolding Box Rig
// ==================================================================
function NetBoxRig({ phase }: { phase: string }) {
  const topHinge = useRef<THREE.Group>(null);
  const bottomHinge = useRef<THREE.Group>(null);
  const rightHinge = useRef<THREE.Group>(null);
  const leftHinge = useRef<THREE.Group>(null);
  const backHinge = useRef<THREE.Group>(null);
  
  const foldProgress = useRef(0);

  // Coordinate Mathematics for the paths
  const antPos = [-0.6, -0.8, 0.03] as [number, number, number];
  const ladduPos = [0.6, 0.4, 0.03] as [number, number, number];

  // The Intuitive (Red) Path: Straight up to the edge, then across
  const redFront = [new THREE.Vector3(...antPos), new THREE.Vector3(-0.6, 1.5, 0.03)];
  const redTop = [new THREE.Vector3(-0.6, -1, 0.03), new THREE.Vector3(...ladduPos)];

  // The Mathematical Shortest (Blue) Path: A straight line in 2D space
  // Intersection calculated at the hinge (y=1.5)
  const hingeX = 0.146; 
  const blueFront = [new THREE.Vector3(...antPos), new THREE.Vector3(hingeX, 1.5, 0.03)];
  const blueTop = [new THREE.Vector3(hingeX, -1, 0.03), new THREE.Vector3(...ladduPos)];

  useFrame((_, delta) => {
    // Determine target fold state: 0 = Folded Box, 1 = Flat Net
    const target = (phase === 'unfolding' || phase === 'unfolded' || phase === 'draw-blue') ? 1 : 0;
    foldProgress.current = THREE.MathUtils.lerp(foldProgress.current, target, delta * 4);

    if (topHinge.current && bottomHinge.current && rightHinge.current && leftHinge.current && backHinge.current) {
      // Hinge logic: Lerping from their 3D folded angles (±90 deg) down to 0 (flat)
      topHinge.current.rotation.x = THREE.MathUtils.lerp(-Math.PI / 2, 0, foldProgress.current);
      bottomHinge.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, 0, foldProgress.current);
      rightHinge.current.rotation.y = THREE.MathUtils.lerp(Math.PI / 2, 0, foldProgress.current);
      leftHinge.current.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2, 0, foldProgress.current);
      backHinge.current.rotation.y = THREE.MathUtils.lerp(Math.PI / 2, 0, foldProgress.current);
    }
  });

  const showRed = phase !== 'idle';
  const showBlue = phase === 'draw-blue' || phase === 'folding' || phase === 'done';

  return (
    <group position={[0, 0, 0]}>
      
      {/* FRONT FACE (The Base Anchor) */}
      <group>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 3, 0.04]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
        </mesh>
        
        {/* The Ant */}
        <mesh position={antPos} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#1c1917" roughness={0.4} />
        </mesh>
        
        {showRed && <Line points={redFront} color="#ef4444" lineWidth={5} dashed dashScale={10} dashSize={0.2} dashOffset={0} />}
        {showBlue && <Line points={blueFront} color="#3b82f6" lineWidth={6} />}

        {/* TOP HINGE & FACE */}
        <group position={[0, 1.5, 0]} ref={topHinge}>
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 2, 0.04]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
          </mesh>
          
          {/* The Laddu (Sweet) */}
          <group position={ladduPos}>
            <mesh castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#d97706" roughness={0.4} emissive="#b45309" emissiveIntensity={0.2} />
            </mesh>
          </group>

          {showRed && <Line points={redTop} color="#ef4444" lineWidth={5} dashed dashScale={10} dashSize={0.2} dashOffset={0} />}
          {showBlue && <Line points={blueTop} color="#3b82f6" lineWidth={6} />}
        </group>

        {/* BOTTOM HINGE & FACE */}
        <group position={[0, -1.5, 0]} ref={bottomHinge}>
          <mesh position={[0, -1, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 2, 0.04]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
          </mesh>
        </group>

        {/* RIGHT HINGE & FACE */}
        <group position={[1, 0, 0]} ref={rightHinge}>
          <mesh position={[1, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 3, 0.04]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
          </mesh>

          {/* BACK HINGE & FACE (Attached to Right Face) */}
          <group position={[2, 0, 0]} ref={backHinge}>
            <mesh position={[1, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 3, 0.04]} />
              <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* LEFT HINGE & FACE */}
        <group position={[-1, 0, 0]} ref={leftHinge}>
          <mesh position={[-1, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 3, 0.04]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
          </mesh>
        </group>

      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function AntsJourney() {
  const [phase, setPhase] = useState<'idle' | 'draw-red' | 'unfolding' | 'unfolded' | 'draw-blue' | 'folding' | 'done'>('idle');

  // The Sequential Event Engine
  const advanceSequence = () => {
    if (phase === 'idle') setPhase('draw-red');
    else if (phase === 'draw-red') {
      setPhase('unfolding');
      setTimeout(() => setPhase('unfolded'), 1000);
    }
    else if (phase === 'unfolded') setPhase('draw-blue');
    else if (phase === 'draw-blue') {
      setPhase('folding');
      setTimeout(() => setPhase('done'), 1000);
    }
  };

  const handleReset = () => setPhase('idle');

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white flex items-center gap-2">
          <Map className="text-emerald-500" /> The Ant's Journey
        </h2>
        <p className="text-stone-400 text-sm mt-1">Finding the shortest path via 2D Nets.</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [-4, 3, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minPolarAngle={Math.PI / 4}
              target={[0, 0, 0]}
            />
            
            {/* The Box Rig */}
            <group position={[0, -0.5, 0]}>
              <NetBoxRig phase={phase} />
            </group>

            {/* A deep drop shadow plane to catch the unfolded net */}
            <ContactShadows frames={1} resolution={1024} scale={25} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -2, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Controls & Math HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        {/* AHA! Message Panel */}
        <AnimatePresence mode="wait">
          {(phase === 'draw-blue' || phase === 'folding' || phase === 'done') && (
            <motion.div 
              key="aha"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-blue-950/80 backdrop-blur-md border border-blue-500/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xl pointer-events-auto mb-6"
            >
              <Lightbulb size={28} className="text-blue-400 shrink-0 mt-1" />
              <div>
                <p className="text-blue-50 text-sm leading-relaxed">
                  <strong>The Illusion of 3D:</strong> What looked like a jagged, diagonal shortcut in 3D (the blue line) is actually a perfectly straight line when the box is flattened! The intuitive "straight" path (the red line) is physically longer. 
                </p>
                {phase === 'done' && (
                  <p className="text-emerald-400 text-xs font-mono mt-2 bg-stone-950 p-2 rounded-lg inline-block border border-blue-900">
                    Nets allow us to solve 3D shortest-path problems using 2D geometry.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex gap-4 pointer-events-auto bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl border border-stone-800 shadow-xl">
          
          <button 
            onClick={advanceSequence}
            disabled={phase === 'done' || phase === 'unfolding' || phase === 'folding'}
            className="w-48 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {phase === 'idle' && <><Navigation size={16} /> 1. Guess Path</>}
            {phase === 'draw-red' && <><Box size={16} /> 2. Unfold Net</>}
            {phase === 'unfolded' && <><Navigation size={16} /> 3. Find Shortest</>}
            {phase === 'draw-blue' && <><Box size={16} /> 4. Fold Up</>}
          </button>

          <button 
            onClick={handleReset}
            disabled={phase === 'idle'}
            className="px-6 py-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} /> Reset
          </button>
          
        </div>

      </div>

    </div>
  );
}