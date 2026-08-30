'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';

// ==================================================================
// NATIVE R3F ANIMATION COMPONENTS (Optimized for Stability)
// ==================================================================
function AnimatedCube({ phase, size, x, initialY, z, color }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Kept at 0.001 to prevent matrix inversion crashes
    const targetScale = phase === 'idle' ? 1 : 0.001; 
    const targetY = phase === 'idle' ? initialY : 0.001;

    const currentScale = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, targetScale, delta * 3));
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 3);
  });

  return (
    <mesh ref={meshRef} position={[x, initialY, z]} castShadow>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
    </mesh>
  );
}

function AnimatedFluid({ phase }: { phase: string }) {
  const fluidRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!fluidRef.current) return;
    
    const targetScaleY = phase === 'idle' ? 0.01 : 2.8;
    const targetPosY = phase === 'idle' ? 0.01 : 1.4;

    fluidRef.current.scale.y = THREE.MathUtils.lerp(fluidRef.current.scale.y, targetScaleY, delta * 2.5);
    fluidRef.current.position.y = THREE.MathUtils.lerp(fluidRef.current.position.y, targetPosY, delta * 2.5);
  });

  return (
    <mesh ref={fluidRef} position={[0, 0.01, 0]}>
      <cylinderGeometry args={[1.45, 1.45, 1, 32]} />
      <meshStandardMaterial color="#059669" transparent opacity={0.85} roughness={0.3} />
    </mesh>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function TaxicabMachine() {
  const [phase, setPhase] = useState<'idle' | 'melting' | 'done'>('idle');

  const handleVerify = () => {
    setPhase('melting');
    setTimeout(() => setPhase('done'), 3000);
  };

  return (
    <div className="w-full h-full min-h-[600px] relative bg-stone-900 rounded-2xl overflow-hidden font-sans">
      
      {/* 2D HTML OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">The Taxicab Machine</h2>
        <p className="text-emerald-400 text-sm font-mono mt-1">12³ + 1³ = 10³ + 9³ = 1729</p>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center z-10 pointer-events-auto">
        <button 
          onClick={handleVerify}
          disabled={phase !== 'idle'}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-600 text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase shadow-xl transition-all"
        >
          {phase === 'idle' ? 'Verify Ramanujan\'s Claim' : phase === 'melting' ? 'Fracturing Cubes...' : '1729 Verified!'}
        </button>
      </div>

      {/* THE 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
        {/* THE FIX: Suspense boundary ensures WebGL doesn't render until environment/textures are ready */}
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <Environment preset="city" />
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 - 0.1} />

          {/* LEFT PLATFORM: 12³ and 1³ */}
          <group position={[-3, 0, 0]}>
            <Text position={[0, -0.5, 2]} fontSize={0.4} color="#d6d3d1">12³ + 1³</Text>
            <AnimatedCube phase={phase} size={2.4} x={-0.5} initialY={1.2} z={0} color="#10b981" />
            <AnimatedCube phase={phase} size={0.2} x={1.2} initialY={0.1} z={1.2} color="#10b981" />
          </group>

          {/* CENTER BEAKER: The 1729 Collector */}
          <group position={[0, 0, 0]}>
            <Text position={[0, -0.5, 2]} fontSize={0.5} color="#10b981">
              {phase === 'done' ? '1729' : '???'}
            </Text>
            
            {/* THE FIX: Simplified glass material to prevent transmission shader crashes */}
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 3, 32]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} metalness={0.8} />
            </mesh>

            <AnimatedFluid phase={phase} />
          </group>

          {/* RIGHT PLATFORM: 10³ and 9³ */}
          <group position={[3, 0, 0]}>
            <Text position={[0, -0.5, 2]} fontSize={0.4} color="#d6d3d1">10³ + 9³</Text>
            <AnimatedCube phase={phase} size={2.0} x={-0.5} initialY={1.0} z={-0.5} color="#3b82f6" />
            <AnimatedCube phase={phase} size={1.8} x={1.0} initialY={0.9} z={1.0} color="#3b82f6" />
          </group>

          {/* THE FIX: frames={1} bakes the shadow instantly instead of calculating it every frame */}
          <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
    </div>
  );
}