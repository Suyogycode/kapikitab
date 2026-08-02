'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { createXRStore, XR } from '@react-three/xr';

const store = createXRStore();

export default function GravityLabR3F() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-[#1c1917] rounded-2xl overflow-hidden relative shadow-sm border border-stone-200/20 my-8">
      
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => store.enterAR()}
          className="bg-stone-100/90 backdrop-blur-md text-stone-800 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase border border-stone-300 shadow-xl hover:bg-white transition-colors"
        >
          Enter AR
        </button>
      </div>

      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}> 
        <XR store={store}>
          <Suspense fallback={null}>
            
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            
            <OrbitControls makeDefault />
            <Environment preset="city" />

            {/* THE SPATIAL UI */}
            <group position={[0, 1.2, -1]}>
              
              {/* THE FIX: Removed the custom font URL. Using safe default text. */}
              <Text position={[0, 0.25, 0]} fontSize={0.08} color="#a8a29e" anchorX="center">
                GRAVITY: {gravity.toFixed(2)}
              </Text>

              <mesh position={[0, 0, 0]} onClick={() => setResetKey(prev => prev + 1)}>
                <boxGeometry args={[0.3, 0.1, 0.02]} />
                <meshStandardMaterial color="#292524" roughness={0.8} />
              </mesh>
              
              {/* THE FIX: Removed the custom font URL. */}
              <Text position={[0, 0, 0.015]} fontSize={0.04} color="#10b981">
                TAP TO DROP
              </Text>
            </group>

            <Physics key={resetKey} gravity={[0, gravity, 0]}>
              
              <RigidBody position={[0, 2.5, -1]} colliders="ball" restitution={0.8} mass={1}>
                <mesh castShadow>
                  <sphereGeometry args={[0.1, 32, 32]} />
                  <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                </mesh>
              </RigidBody>

              <RigidBody type="fixed" position={[0, -0.05, 0]}>
                <mesh receiveShadow>
                  <boxGeometry args={[10, 0.1, 10]} />
                  <meshStandardMaterial color="#1c1917" />
                </mesh>
              </RigidBody>
              
            </Physics>

            <Grid position={[0, 0, 0]} args={[10, 10]} cellColor="#10b981" sectionColor="#10b981" fadeDistance={4} fadeStrength={1.5} />

          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}