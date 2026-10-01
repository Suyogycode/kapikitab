'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MATH & MAPPING LOGIC
// ==================================================================
// Standard Textbook 3D Coordinate System:
// X and Y form the horizontal plane, Z is the vertical height.
// We map this to Three.js (where Y is vertical) as follows:
// Math (X, Y, Z) -> Three.js (X, Z, -Y) for natural textbook orientation.
const getOctantName = (x: number, y: number, z: number) => {
  if (x > 0 && y > 0 && z > 0) return 'I';
  if (x < 0 && y > 0 && z > 0) return 'II';
  if (x < 0 && y < 0 && z > 0) return 'III';
  if (x > 0 && y < 0 && z > 0) return 'IV';
  if (x > 0 && y > 0 && z < 0) return 'V';
  if (x < 0 && y > 0 && z < 0) return 'VI';
  if (x < 0 && y < 0 && z < 0) return 'VII';
  if (x > 0 && y < 0 && z < 0) return 'VIII';
  return 'I';
};

const getSignText = (val: number) => (val > 0 ? 'positive (+)' : 'negative (-)');

// ==================================================================
// ANIMATED POINT & OCTANT VOLUME
// ==================================================================
function AnimatedOctantTracker({ x, y, z }: { x: number; y: number; z: number }) {
  const pointRef = useRef<THREE.Group>(null);
  const volumeRef = useRef<THREE.Mesh>(null);

  // Target positions mapped to Three.js coordinate space
  // Math X -> Three X
  // Math Y -> Three -Z (depth)
  // Math Z -> Three Y (height)
  const targetPos = new THREE.Vector3(x * 6, z * 6, -y * 6);
  const volumePos = new THREE.Vector3(x * 5, z * 5, -y * 5);

  useFrame((_, delta) => {
    if (pointRef.current) {
      pointRef.current.position.lerp(targetPos, delta * 6);
    }
    if (volumeRef.current) {
      volumeRef.current.position.lerp(volumePos, delta * 6);
    }
  });

  const octant = getOctantName(x, y, z);

  return (
    <group>
      {/* THE GLOWING POINT MASS[cite: 23] */}
      <group ref={pointRef}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={1} />
        </mesh>
        
        {/* 3D TEXT PROJECTED INTO SPACE[cite: 23] */}
        <Billboard position={[0, 2, 0]}>
          <Text fontSize={0.6} color="#fcd34d" fontWeight="bold">
            Octant {octant}
          </Text>
          <Text position={[0, -0.6, 0]} fontSize={0.35} color="#fbbf24">
            X is {getSignText(x)}
          </Text>
          <Text position={[0, -1.1, 0]} fontSize={0.35} color="#fbbf24">
            Y is {getSignText(y)}
          </Text>
          <Text position={[0, -1.6, 0]} fontSize={0.35} color="#fbbf24">
            Z is {getSignText(z)}
          </Text>
        </Billboard>
      </group>

      {/* ILLUMINATED ACTIVE OCTANT REGION[cite: 23] */}
      <mesh ref={volumeRef}>
        <boxGeometry args={[10, 10, 10]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function OctantNavigator() {
  const [signX, setSignX] = useState<number>(1);
  const [signY, setSignY] = useState<number>(1);
  const [signZ, setSignZ] = useState<number>(1);

  const toggleSign = (axis: 'X' | 'Y' | 'Z') => {
    if (axis === 'X') setSignX((prev) => prev * -1);
    if (axis === 'Y') setSignY((prev) => prev * -1);
    if (axis === 'Z') setSignZ((prev) => prev * -1);
  };

  const octant = getOctantName(signX, signY, signZ);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Octant Navigator</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Coordinate axes divide spatial geometry into eight distinct regions[cite: 23].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Coordinate Switches</span>
            <span className="text-amber-400 font-mono text-sm font-bold">Octant {octant}</span>
          </div>
          
          <div className="flex justify-between gap-3 font-mono text-sm">
            <button 
              onClick={() => toggleSign('X')}
              className={`flex-1 py-3 rounded-lg transition-all border font-bold text-lg ${signX > 0 ? 'bg-red-900/50 text-red-400 border-red-500' : 'bg-stone-800 text-stone-500 border-stone-700'}`}
            >
              X {signX > 0 ? '+' : '-'}
            </button>
            <button 
              onClick={() => toggleSign('Y')}
              className={`flex-1 py-3 rounded-lg transition-all border font-bold text-lg ${signY > 0 ? 'bg-green-900/50 text-green-400 border-green-500' : 'bg-stone-800 text-stone-500 border-stone-700'}`}
            >
              Y {signY > 0 ? '+' : '-'}
            </button>
            <button 
              onClick={() => toggleSign('Z')}
              className={`flex-1 py-3 rounded-lg transition-all border font-bold text-lg ${signZ > 0 ? 'bg-blue-900/50 text-blue-400 border-blue-500' : 'bg-stone-800 text-stone-500 border-stone-700'}`}
            >
              Z {signZ > 0 ? '+' : '-'}
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/95 border border-amber-500/50 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Spatial Mapping Engine</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            The engine dynamically dims seven of the regions, illuminating only the specific octant where the point resides[cite: 23]. 
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-sm text-stone-300">
            Physically experiencing how crossing a coordinate plane instantly flips a single coordinate's sign turns rote memorization into a spatial mapping game[cite: 23].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [20, 15, 25], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 1.5} 
              minDistance={10} 
              maxDistance={50}
              target={[0, 0, 0]}
            />

            <group>
              {/* AXES LINES */}
              {/* Math X-Axis (Three X-Axis) - Red */}
              <Line points={[[-20, 0, 0], [20, 0, 0]] as [number, number, number][]} color="#ef4444" lineWidth={3} />
              <Billboard position={[22, 0, 0]}><Text fontSize={1.2} color="#ef4444" fontWeight="bold">X</Text></Billboard>
              <Billboard position={[-22, 0, 0]}><Text fontSize={1.2} color="#ef4444" fontWeight="bold">X'</Text></Billboard>

              {/* Math Y-Axis (Three -Z-Axis) - Green */}
              <Line points={[[0, 0, -20], [0, 0, 20]] as [number, number, number][]} color="#22c55e" lineWidth={3} />
              <Billboard position={[0, 0, -22]}><Text fontSize={1.2} color="#22c55e" fontWeight="bold">Y</Text></Billboard>
              <Billboard position={[0, 0, 22]}><Text fontSize={1.2} color="#22c55e" fontWeight="bold">Y'</Text></Billboard>

              {/* Math Z-Axis (Three Y-Axis) - Blue */}
              <Line points={[[0, -20, 0], [0, 20, 0]] as [number, number, number][]} color="#3b82f6" lineWidth={3} />
              <Billboard position={[0, 22, 0]}><Text fontSize={1.2} color="#3b82f6" fontWeight="bold">Z</Text></Billboard>
              <Billboard position={[0, -22, 0]}><Text fontSize={1.2} color="#3b82f6" fontWeight="bold">Z'</Text></Billboard>

              {/* THE 3 INTERSECTING PLANES[cite: 23] */}
              {/* XY Plane (Math Horizontal) -> Three.js XZ plane */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[40, 40]} />
                <meshBasicMaterial color="#94a3b8" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
              
              {/* YZ Plane (Math Vertical Depth) -> Three.js YZ plane */}
              <mesh rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[40, 40]} />
                <meshBasicMaterial color="#94a3b8" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>

              {/* ZX Plane (Math Vertical Horizontal) -> Three.js XY plane */}
              <mesh>
                <planeGeometry args={[40, 40]} />
                <meshBasicMaterial color="#94a3b8" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>

              {/* DYNAMIC TELEPORTING POINT & VOLUME */}
              <AnimatedOctantTracker x={signX} y={signY} z={signZ} />

            </group>

            <ContactShadows frames={1} resolution={512} scale={60} blur={2} opacity={0.2} far={20} position={[0, -20, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}