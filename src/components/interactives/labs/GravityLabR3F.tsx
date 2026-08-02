'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Float } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { createXRStore, XR } from '@react-three/xr';

const store = createXRStore();

export default function GravityLabR3F() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-[#1c1917] rounded-2xl overflow-hidden relative shadow-sm border border-stone-800 my-8">
      
      {/* 2D Fallback: Just the AR entry button floating cleanly in the top corner */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => store.enterAR()}
          className="bg-stone-200/90 backdrop-blur-md text-stone-900 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl hover:bg-white transition-colors"
        >
          Enter AR
        </button>
      </div>

      <Canvas camera={{ position: [0, 0.5, 3], fov: 50 }}> 
        <XR store={store}>
          <Suspense fallback={null}>
            
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            
            <OrbitControls makeDefault />
            <Environment preset="city" />

            {/* 
              THE SPATIAL UI DASHBOARD 
              Positioned exactly in front of the camera lens (Z=-1.5)
              Wrapped in a Float component for a smooth, premium hovering effect.
            */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
              <group position={[0, 0, -1.5]}>
                
                <Text position={[0, 0.35, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center">
                  GRAVITY: {gravity.toFixed(1)}
                </Text>

                {/* DROP BUTTON */}
                <mesh position={[0, 0.1, 0]} onClick={() => setResetKey(prev => prev + 1)}>
                  <boxGeometry args={[0.4, 0.12, 0.04]} />
                  <meshStandardMaterial color="#44403c" roughness={0.9} />
                </mesh>
                <Text position={[0, 0.1, 0.021]} fontSize={0.05} color="#a8a29e">
                  DROP BALL
                </Text>

                {/* + GRAVITY BUTTON */}
                <mesh position={[-0.25, -0.1, 0]} onClick={() => setGravity(g => Math.min(g + 2, 5))}>
                  <boxGeometry args={[0.15, 0.1, 0.02]} />
                  <meshStandardMaterial color="#292524" roughness={0.9} />
                </mesh>
                <Text position={[-0.25, -0.1, 0.011]} fontSize={0.04} color="#10b981">
                  + GRAV
                </Text>

                {/* - GRAVITY BUTTON */}
                <mesh position={[0.25, -0.1, 0]} onClick={() => setGravity(g => Math.max(g - 2, -25))}>
                  <boxGeometry args={[0.15, 0.1, 0.02]} />
                  <meshStandardMaterial color="#292524" roughness={0.9} />
                </mesh>
                <Text position={[0.25, -0.1, 0.011]} fontSize={0.04} color="#10b981">
                  - GRAV
                </Text>

              </group>
            </Float>

            <Physics key={resetKey} gravity={[0, gravity, 0]}>
              
              {/* The Ball: Spawns slightly higher so you can watch it fall */}
              <RigidBody position={[0, 1.5, -1.5]} colliders="ball" restitution={0.8} mass={1}>
                <mesh castShadow>
                  <sphereGeometry args={[0.1, 32, 32]} />
                  <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                </mesh>
              </RigidBody>

              {/* 
                THE INVISIBLE FLOOR FIX
                This sits 1 meter below your phone. The material is 100% transparent, 
                but it will magically catch the shadow of the ball! 
              */}
              <RigidBody type="fixed" position={[0, -1, 0]}>
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[20, 20]} />
                  <shadowMaterial transparent opacity={0.4} />
                </mesh>
              </RigidBody>
              
            </Physics>

          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}