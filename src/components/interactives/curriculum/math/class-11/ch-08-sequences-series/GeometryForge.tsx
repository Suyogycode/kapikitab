'use client';

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard, Line } from '@react-three/drei';

type Phase = 'setup' | 'gm' | 'compare';

// ==================================================================
// 3D AREA MORPHING ENGINE
// ==================================================================
function RectangleToSquare({ a, b, phase, originX, originY }: { a: number, b: number, phase: Phase, originX: number, originY: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const gm = Math.sqrt(a * b);

  // Offset the geometry so its origin is at the bottom-left corner (0,0,0)
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 0.2);
    geo.translate(0.5, 0.5, 0);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Target dimensions based on the current phase
    const targetW = phase === 'setup' ? a : gm;
    const targetH = phase === 'setup' ? b : gm;

    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetW, delta * 4);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetH, delta * 4);
  });

  return (
    <group position={[originX, originY, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.2} transparent opacity={0.8} />
      </mesh>
      
      {/* Dynamic Label for Area */}
      <Billboard position={[a / 2, -0.6, 0.2]}>
        <Text fontSize={0.4} color="#a8a29e">
          {phase === 'setup' ? `Area = a × b = ${(a * b).toFixed(0)}` : `Area = G² = ${(gm * gm).toFixed(0)}`}
        </Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// EXTRACTED G.M. ROD (The Aha! Comparison)
// ==================================================================
function ExtractedGMRod({ gm, isVisible, originX, originY }: { gm: number, isVisible: boolean, originX: number, originY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.15, 0.15, 1, 32);
    g.rotateZ(Math.PI / 2);
    g.translate(0.5, 0, 0); // Origin at left tip
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetScale = isVisible ? gm : 0.001;
    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 5);
  });

  return (
    <group ref={groupRef} position={[originX, originY, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} />
      </mesh>
      <Billboard position={[gm / 2, 0.5, 0]}>
        <Text fontSize={0.35} color="#10b981" fontWeight="bold">
          G.M. (G) = {gm.toFixed(2)}
        </Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function GeometryForge() {
  const [a, setA] = useState<number>(16);
  const [b, setB] = useState<number>(4);
  const [phase, setPhase] = useState<Phase>('setup');

  const am = (a + b) / 2;
  const gm = Math.sqrt(a * b);
  
  // A common left-aligned origin for visual comparison
  const ORIGIN_X = -8; 

  // Reset phase when sliders change to show the physical transformation again
  useEffect(() => {
    setPhase('setup');
  }, [a, b]);

  const isAhaMoment = phase === 'compare';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Geometry Forge</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Proving the A.M. vs. G.M. Inequality (A ≥ G).
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Physical Lengths</span>
          </div>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-red-400 font-mono text-sm font-bold">Length a: {a}</span>
          </div>
          <input 
            type="range" min="1" max="20" step="1" value={a} 
            onChange={(e) => setA(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-500 mb-4"
          />

          <div className="mb-2 flex justify-between items-center">
            <span className="text-amber-400 font-mono text-sm font-bold">Length b: {b}</span>
          </div>
          <input 
            type="range" min="1" max="20" step="1" value={b} 
            onChange={(e) => setB(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-4"
          />

          <div className="flex gap-2 font-mono text-sm">
            <button 
              onClick={() => setPhase('gm')}
              disabled={phase !== 'setup'}
              className={`flex-1 py-2.5 rounded-lg transition-all border font-bold ${phase === 'setup' ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'}`}
            >
              FIND G.M.
            </button>
            <button 
              onClick={() => setPhase('compare')}
              disabled={phase !== 'gm'}
              className={`flex-1 py-2.5 rounded-lg transition-all border font-bold ${phase === 'gm' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'}`}
            >
              COMPARE
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Parallel Verification</p>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
              The engine extracts the green side of the square (G) and lays it directly parallel to the blue rod (A). You can visually see that the blue A.M. rod is physically longer than the green G.M. square side. 
            </p>
            <div className="inline-block bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-base font-bold text-white">
              Adjust the sliders to make <span className="text-red-400">a</span> and <span className="text-amber-400">b</span> closer in value. The blue and green rods approach the same length, perfectly demonstrating why equality only occurs when a = b.
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 22], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2} 
              minDistance={10} 
              maxDistance={35}
              target={[2, 2, 0]}
            />

            <group>
              {/* 1. END-TO-END RODS (a and b) */}
              <group position={[ORIGIN_X, 7, 0]}>
                {/* Rod 'a' */}
                <mesh position={[a / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.15, 0.15, a, 32]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.2} />
                </mesh>
                <Billboard position={[a / 2, 0.6, 0]}>
                  <Text fontSize={0.35} color="#ef4444" fontWeight="bold">a = {a}</Text>
                </Billboard>

                {/* Rod 'b' */}
                <mesh position={[a + (b / 2), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.15, 0.15, b, 32]} />
                  <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
                </mesh>
                <Billboard position={[a + (b / 2), 0.6, 0]}>
                  <Text fontSize={0.35} color="#f59e0b" fontWeight="bold">b = {b}</Text>
                </Billboard>
              </group>

              {/* 2. THE ARITHMETIC MEAN ROD (A) */}
              <group position={[ORIGIN_X, 5.5, 0]}>
                <mesh position={[am / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.2, 0.2, am, 32]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.5} />
                </mesh>
                <Billboard position={[am / 2, 0.6, 0]}>
                  <Text fontSize={0.35} color="#60a5fa" fontWeight="bold">A.M. (A) = {am.toFixed(2)}</Text>
                </Billboard>

                {/* Alignment laser going down to the GM rod */}
                {phase === 'compare' && (
                  <Line 
                    points={[[am, 0, 0], [am, -1.5, 0]] as [number, number, number][]} 
                    color="#60a5fa" dashed dashScale={5} 
                  />
                )}
              </group>

              {/* 3. EXTRACTED GEOMETRIC MEAN ROD (G) */}
              <ExtractedGMRod gm={gm} isVisible={phase === 'compare'} originX={ORIGIN_X} originY={4} />

              {/* 4. THE 2D MORPHING RECTANGLE -> SQUARE */}
              {/* Ground Anchor line for Area */}
              <Line 
                points={[[ORIGIN_X, -2.1, 0], [ORIGIN_X + 25, -2.1, 0]] as [number, number, number][]} 
                color="#44403c" 
              />
              <RectangleToSquare a={a} b={b} phase={phase} originX={ORIGIN_X} originY={-2} />

            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -2.2, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}