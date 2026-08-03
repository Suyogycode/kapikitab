'use client';

import React, { useState, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { createXRStore, XR, useXRHitTest } from '@react-three/xr';

// 1. Create the store and memory-safe matrix helper outside the render loop
const store = createXRStore();
const matrixHelper = new THREE.Matrix4();

// 2. The Professional AR Architecture Component
function ARLabAnchor() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);

  // AR State Machine: null = Scanning | Vector3 = Anchored
  const [anchorPos, setAnchorPos] = useState<THREE.Vector3 | null>(null);
  const reticleRef = useRef<THREE.Mesh>(null);

  // The Hit-Test Scanner: Projects a ring onto the real-world floor
  useXRHitTest((results, getWorldMatrix) => {
    if (!anchorPos && reticleRef.current && results.length > 0) {
      getWorldMatrix(matrixHelper, results[0]);
      reticleRef.current.matrixAutoUpdate = false;
      reticleRef.current.matrix.copy(matrixHelper);
    }
  }, "viewer");

  // MUST return a valid JSX Element (React Fragment)
  return (
    <>
      {/* STATE 1: SCANNING (Physics is completely turned off here!) */}
      {!anchorPos && (
        <mesh
          ref={reticleRef}
          onPointerDown={() => {
            if (reticleRef.current) {
              const pos = new THREE.Vector3();
              pos.setFromMatrixPosition(reticleRef.current.matrix);
              setAnchorPos(pos); // Lock the physical anchor!
            }
          }}
        >
          <cylinderGeometry args={[0.15, 0.15, 0.01, 32]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.8} />
        </mesh>
      )}

      {/* STATE 2: ANCHORED (Spawn the lab EXACTLY where the user tapped) */}
      {anchorPos && (
        <group position={anchorPos}>

          {/* The Dashboard (Floating 1 meter above the physical anchor) */}
          <group position={[0, 1, 0]}>
            <Text position={[0, 0.35, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center">
              GRAVITY: {gravity.toFixed(1)}
            </Text>

            <mesh position={[0, 0.1, 0]} onClick={() => setResetKey(prev => prev + 1)}>
              <boxGeometry args={[0.4, 0.12, 0.04]} />
              <meshStandardMaterial color="#44403c" roughness={0.9} />
            </mesh>
            <Text position={[0, 0.1, 0.021]} fontSize={0.05} color="#10b981">
              DROP BALL
            </Text>

            <mesh position={[-0.25, -0.1, 0]} onClick={() => setGravity(g => Math.min(g + 2, 5))}>
              <boxGeometry args={[0.15, 0.1, 0.02]} />
              <meshStandardMaterial color="#292524" roughness={0.9} />
            </mesh>
            <Text position={[-0.25, -0.1, 0.011]} fontSize={0.04} color="#10b981">
              + GRAV
            </Text>

            <mesh position={[0.25, -0.1, 0]} onClick={() => setGravity(g => Math.max(g - 2, -25))}>
              <boxGeometry args={[0.15, 0.1, 0.02]} />
              <meshStandardMaterial color="#292524" roughness={0.9} />
            </mesh>
            <Text position={[0.25, -0.1, 0.011]} fontSize={0.04} color="#10b981">
              - GRAV
            </Text>
          </group>

          {/* The Physics Engine (Boots up ONLY after placement so the ball doesn't fall away) */}
          <Physics key={resetKey} gravity={[0, gravity, 0]}>
            
            <RigidBody position={[0, 1.5, 0]} colliders="ball" restitution={0.8} mass={1}>
              <mesh castShadow>
                <sphereGeometry args={[0.1, 32, 32]} />
                <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
              </mesh>
            </RigidBody>

            {/* The Invisible Real-World Floor */}
            <RigidBody type="fixed" position={[0, -0.05, 0]}>
              <mesh receiveShadow>
                <boxGeometry args={[5, 0.1, 5]} />
                <shadowMaterial transparent opacity={0.4} />
              </mesh>
            </RigidBody>

          </Physics>

        </group>
      )}
    </>
  );
}

// 3. The Main Exported Component
export default function GravityLabR3F() {
  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-[#1c1917] rounded-2xl overflow-hidden relative shadow-sm border border-stone-800 my-8">
      
      {/* Fallback standard UI Button */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => store.enterAR()}
          className="bg-stone-200/90 backdrop-blur-md text-stone-900 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl hover:bg-white transition-colors"
        >
          Enter AR
        </button>
      </div>

      <Canvas camera={{ position: [0, 1, 3], fov: 50 }}> 
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <OrbitControls makeDefault />
            <Environment preset="city" />

            {/* Render the AR logic state machine */}
            <ARLabAnchor />

          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}