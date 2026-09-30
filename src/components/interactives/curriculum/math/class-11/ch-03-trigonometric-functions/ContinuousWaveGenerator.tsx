'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Line } from '@react-three/drei';

// ==================================================================
// 3D WAVE ENGINE (Optimized for 60FPS without React State overhead)
// ==================================================================
const MAX_POINTS = 300;
const RADIUS = 2;
const CIRCLE_X = -3;
const PEN_X = 0;

function MechanicalPlotter({ speed }: { speed: number }) {
  const pointPRef = useRef<THREE.Mesh>(null);
  const penRef = useRef<THREE.Mesh>(null);
  const theta = useRef(0);

  // Safely construct the buffer geometries in memory instead of JSX
  const armGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    return geo;
  }, []);

  const waveGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 3), 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    theta.current += delta * speed;
    
    const currentY = Math.sin(theta.current) * RADIUS;
    const currentX = CIRCLE_X + Math.cos(theta.current) * RADIUS;

    if (pointPRef.current) pointPRef.current.position.set(currentX, currentY, 0.1);
    if (penRef.current) penRef.current.position.set(PEN_X, currentY, 0.2);

    // Update the Mechanical Arm
    const armPos = armGeo.attributes.position.array as Float32Array;
    armPos[0] = currentX; armPos[1] = currentY; armPos[2] = 0.1;
    armPos[3] = PEN_X;    armPos[4] = currentY; armPos[5] = 0.1;
    armGeo.attributes.position.needsUpdate = true;

    // Shift the infinite paper tape wave history rightwards
    const wavePos = waveGeo.attributes.position.array as Float32Array;
    for (let i = MAX_POINTS - 1; i > 0; i--) {
      wavePos[i * 3] = wavePos[(i - 1) * 3] + (delta * 3); // X axis (Scroll speed)
      wavePos[i * 3 + 1] = wavePos[(i - 1) * 3 + 1];       // Y axis
      wavePos[i * 3 + 2] = wavePos[(i - 1) * 3 + 2];       // Z axis
    }
    
    // Inject newest point
    wavePos[0] = PEN_X;
    wavePos[1] = currentY;
    wavePos[2] = 0;
    waveGeo.attributes.position.needsUpdate = true;
  });

return (
    <group>
      <mesh ref={pointPRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
      </mesh>

      {/* The Mechanical Plotting Arm */}
      <line>
        <primitive object={armGeo} attach="geometry" />
        <lineBasicMaterial color="#3b82f6" linewidth={2} />
      </line>

      <mesh ref={penRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.02, 0.5, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* The Continuous Sine Wave Graph */}
      <line>
        <primitive object={waveGeo} attach="geometry" />
        <lineBasicMaterial color="#a855f7" />
      </line>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ContinuousWaveGenerator() {
  const [speed, setSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const activeSpeed = isPlaying ? speed : 0;
  const isAhaMoment = speed >= 3;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Continuous Wave Generator</h2>
        <p className="text-stone-400 text-sm max-w-2xl mb-4">
          Visualizing periodicity and the origin of trigonometric graphs[cite: 18].
        </p>

        {/* CONTROLS */}
        <div className="pointer-events-auto bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md max-w-sm shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Rotation Motor</span>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs uppercase font-bold transition-colors border ${isPlaying ? 'bg-red-950/50 text-red-400 border-red-900' : 'bg-emerald-950/50 text-emerald-400 border-emerald-900'}`}
            >
              {isPlaying ? 'Pause' : 'Start'}
            </button>
          </div>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-stone-400 font-mono text-sm">Speed:</span>
            <span className="text-white font-mono font-bold">{speed.toFixed(1)}x</span>
          </div>
          
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.5" 
            value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Periodicity Proven</p>
            <p className="text-white text-sm sm:text-base leading-relaxed">
              As the circle completes 360° (2π radians), the physical height of point P resets[cite: 18]. The pen smoothly traces the exact same oscillatory path, anchoring the abstract wave graph as the physical history of circular height over time[cite: 18].
            </p>
            <p className="mt-3 text-emerald-400 font-mono font-bold bg-emerald-950/50 py-2 rounded-lg border border-emerald-900/50 inline-block px-4">
              sin(2nπ + x) = sin(x)
            </p>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [2, 0, 11], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 5, 5]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2} 
              minDistance={5} 
              maxDistance={20}
              target={[2, 0, 0]} 
            />

            {/* LEFT SIDE: The Unit Circle */}
            <group position={[CIRCLE_X, 0, 0]}>
              <mesh>
                <ringGeometry args={[RADIUS - 0.03, RADIUS + 0.03, 64]} />
                <meshBasicMaterial color="#57534e" />
              </mesh>
              {/* Wrapped in Vector3 for strict TypeScript typing */}
              <Line 
                points={[new THREE.Vector3(-RADIUS - 0.5, 0, 0), new THREE.Vector3(RADIUS + 0.5, 0, 0)]} 
                color="#44403c" 
              />
              <Line 
                points={[new THREE.Vector3(0, -RADIUS - 0.5, 0), new THREE.Vector3(0, RADIUS + 0.5, 0)]} 
                color="#44403c" 
              />
              <Text position={[0, -RADIUS - 0.5, 0]} fontSize={0.3} color="#78716c">Unit Circle</Text>
            </group>

            {/* RIGHT SIDE: The Infinite Paper Tape */}
            <group position={[PEN_X + 4, 0, -0.1]}>
              <mesh>
                <planeGeometry args={[10, RADIUS * 2.5]} />
                <meshBasicMaterial color="#1c1917" transparent opacity={0.6} />
              </mesh>
              {/* Wrapped in Vector3 for strict TypeScript typing */}
              <Line 
                points={[new THREE.Vector3(-5, 0, 0.01), new THREE.Vector3(5, 0, 0.01)]} 
                color="#44403c" 
                dashed 
                dashScale={5} 
              />
              <Text position={[0, -RADIUS - 0.5, 0]} fontSize={0.3} color="#78716c">y = sin(x)</Text>
            </group>

            {/* MECHANICAL SYSTEM & WAVE */}
            <MechanicalPlotter speed={activeSpeed} />

          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}