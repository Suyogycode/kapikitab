'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// 3D TERM CONTAINER COMPONENT
// ==================================================================
function TermContainer({ 
  r, 
  n, 
  isActive, 
  xPos 
}: { 
  r: number; 
  n: number; 
  isActive: boolean; 
  xPos: number;
}) {
  const aPower = n - r;
  const bPower = r;

  // Animation for the highlight scale
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetScale = isActive ? 1.1 : 0.9;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, isActive ? 0.5 : 0, delta * 8);
  });

  return (
    <group ref={groupRef} position={[xPos, 0, 0]}>
      {/* THE GLASS CONTAINER */}
      <mesh position={[0, n / 2, 0]}>
        <boxGeometry args={[1.6, n + 0.2, 0.8]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.8} 
          opacity={1} 
          roughness={0.1} 
          ior={1.2} 
          thickness={0.5} 
          transparent
        />
      </mesh>

      {/* BLUE METER: Power of 'a' */}
      {aPower > 0 && (
        <mesh position={[-0.35, aPower / 2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, aPower, 16]} />
          <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={isActive ? 0.8 : 0.2} transparent opacity={0.9} />
        </mesh>
      )}

      {/* AMBER METER: Power of 'b' */}
      {bPower > 0 && (
        <mesh position={[0.35, bPower / 2, 0]}>
          <cylinderGeometry args={[0.25, 0.25, bPower, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={isActive ? 0.8 : 0.2} transparent opacity={0.9} />
        </mesh>
      )}

      {/* TOTAL VOLUME INDICATOR BRACKET */}
      <group position={[0, n + 0.5, 0]}>
        <Line points={[new THREE.Vector3(-0.7, 0, 0), new THREE.Vector3(0.7, 0, 0)]} color="#a8a29e" lineWidth={2} />
        <Line points={[new THREE.Vector3(-0.7, 0, 0), new THREE.Vector3(-0.7, -0.2, 0)]} color="#a8a29e" lineWidth={2} />
        <Line points={[new THREE.Vector3(0.7, 0, 0), new THREE.Vector3(0.7, -0.2, 0)]} color="#a8a29e" lineWidth={2} />
        <Billboard position={[0, 0.4, 0]}>
          <Text fontSize={0.3} color="#a8a29e">Total Volume = {n}</Text>
        </Billboard>
      </group>

      {/* ALGEBRAIC TERM LABEL */}
      <Billboard position={[0, -1, 0]}>
        <Text fontSize={0.35} color={isActive ? "#ffffff" : "#a8a29e"}>
          ⁴C{r} a^{aPower} b^{bPower}
        </Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function IndexBalancer() {
  const n = 4; // Focusing on a specific expansion (a + b)^4[cite: 31]
  const [activeTerm, setActiveTerm] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play progression logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveTerm((prev) => {
          if (prev >= n) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500); // 1.5 seconds per term
    }
    return () => clearInterval(interval);
  }, [isPlaying, n]);

  const handlePlay = () => {
    if (activeTerm >= n) setActiveTerm(0);
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setActiveTerm(0);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Index Balancer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing the powers of $a$ and $b$ in the expansion of $(a + b)^4$[cite: 31].
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[300px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Animation Timeline</span>
            <button 
              onClick={handleReset}
              className="text-stone-500 hover:text-stone-300 font-mono text-xs underline transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="flex gap-2 font-mono text-sm mb-4">
            <button 
              onClick={isPlaying ? handlePause : handlePlay}
              className={`flex-1 py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${isPlaying ? 'bg-amber-600/20 text-amber-400 border-amber-500/50' : 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
            >
              {isPlaying ? 'Pause' : 'Play Progression'}
            </button>
          </div>

          <div className="flex justify-between items-center text-sm font-mono bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <span className="text-blue-400">Power of 'a': {n - activeTerm}</span>
            <span className="text-stone-500">|</span>
            <span className="text-amber-400">Power of 'b': {activeTerm}</span>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/95 border border-emerald-500/50 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Conservation of Volume</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            As the progression animates across the terms, the blue liquid drains out by exactly one unit, while the amber liquid fills up by exactly one unit[cite: 31].
          </p>
          <div className="inline-block bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-base font-bold">
            The total volume indicator remains locked at exactly <span className="text-emerald-400">n = 4</span> for every single container[cite: 31].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 14], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={5} 
              maxDistance={25}
              target={[0, 2, 0]}
            />

            <group position={[0, -1.5, 0]}>
              {/* Render the 5 terms (0 to 4)[cite: 31] */}
              {[0, 1, 2, 3, 4].map((rIndex) => {
                // Space the containers evenly along the X axis
                const xPosition = (rIndex - 2) * 2.8;
                return (
                  <TermContainer 
                    key={rIndex} 
                    r={rIndex} 
                    n={n} 
                    isActive={activeTerm === rIndex} 
                    xPos={xPosition} 
                  />
                );
              })}
            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.4} far={10} position={[0, -2.5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}