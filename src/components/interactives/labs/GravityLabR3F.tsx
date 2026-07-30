'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { RotateCcw, Loader2 } from 'lucide-react';
// 1. THE FIX: Import createXRStore instead of the deprecated ARButton
import { createXRStore, XR } from '@react-three/xr';

// 2. THE FIX: Initialize the XR store outside your component
const store = createXRStore();

export default function GravityLabR3F() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="w-full h-[600px] bg-stone-950 rounded-2xl overflow-hidden relative border border-stone-800 shadow-2xl">
      
      <button 
        onClick={() => setResetKey(prev => prev + 1)}
        className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20 shadow-xl flex items-center gap-2 hover:bg-white/20 transition-colors"
      >
        <RotateCcw size={14} /> Drop Ball
      </button>

      {/* 3. THE FIX: A standard HTML button that triggers the AR session */}
      <button 
        onClick={() => store.enterAR()}
        className="absolute bottom-6 right-6 z-50 bg-white text-stone-900 px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-xl border border-stone-200 hover:scale-105 transition-transform"
      >
        Enter AR
      </button>

      <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
        
        {/* 4. THE FIX: Pass the store into the XR tag to fix the TypeScript error */}
        <XR store={store}>
          <Suspense 
            fallback={
              <Html center>
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                  <span className="text-stone-400 text-xs font-mono uppercase tracking-widest">Loading Physics...</span>
                </div>
              </Html>
            }
          >
            <OrbitControls makeDefault />
            <Environment preset="city" />

            <Physics key={resetKey} gravity={[0, gravity, 0]}>
              <RigidBody position={[0, 8, 0]} colliders="ball" restitution={0.8} mass={1}>
                <mesh>
                  <sphereGeometry args={[1, 32, 32]} />
                  <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                </mesh>
              </RigidBody>

              <RigidBody type="fixed" position={[0, -2, 0]}>
                <mesh>
                  <boxGeometry args={[15, 1, 15]} />
                  <meshStandardMaterial color="#292524" />
                </mesh>
              </RigidBody>
            </Physics>
          </Suspense>

          <Html position={[4, 3, 0]} center transform>
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl w-64 border border-stone-200 pointer-events-auto">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Gravitational Pull</span>
                <span className="text-lg font-mono text-emerald-600">{gravity.toFixed(2)}</span>
              </div>
              
              <input 
                type="range" 
                min="-25" 
                max="5" 
                step="0.1" 
                value={gravity} 
                onChange={(e) => setGravity(parseFloat(e.target.value))} 
                className="w-full accent-emerald-500 cursor-grab active:cursor-grabbing" 
              />
            </div>
          </Html>
        </XR>
      </Canvas>
    </div>
  );
}