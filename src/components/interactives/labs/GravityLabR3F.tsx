'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { RotateCcw } from 'lucide-react';
import { createXRStore, XR } from '@react-three/xr';

export default function GravityLabR3F() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);
  
  // 1. THE FIX: Grab the wrapper div
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 2. THE FIX: State to hold the dynamic XR Store
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      const xrStore = createXRStore({
        // THE FIX: Version 6 just wants the raw HTML element directly!
        domOverlay: containerRef.current 
      });
      setStore(xrStore);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[600px] bg-stone-950 rounded-2xl overflow-hidden relative border border-stone-800 shadow-2xl">
      
      <button 
        onClick={() => setResetKey(prev => prev + 1)}
        className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20 shadow-xl flex items-center gap-2 hover:bg-white/20 transition-colors pointer-events-auto"
      >
        <RotateCcw size={14} /> Drop Ball
      </button>

      <div className="absolute right-6 top-6 z-10 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl w-64 border border-stone-200 pointer-events-auto">
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

      {/* 4. THE FIX: enterAR() now takes 0 arguments! */}
      {store && (
        <button 
          onClick={() => store.enterAR()}
          className="absolute bottom-6 right-6 z-50 bg-white text-stone-900 px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-xl border border-stone-200 hover:scale-105 transition-transform pointer-events-auto"
        >
          Enter AR
        </button>
      )}

      {/* THE 3D ENGINE */}
      <Canvas camera={{ position: [0, 1, 3], fov: 50 }}> 
        {/* Only render XR when the store is fully initialized */}
        {store && (
          <XR store={store}>
            <Suspense fallback={null}>
              <OrbitControls makeDefault />
              <Environment preset="city" />

              <Physics key={resetKey} gravity={[0, gravity, 0]}>
                
                <RigidBody position={[0, 1, -1]} colliders="ball" restitution={0.8} mass={1}>
                  <mesh>
                    <sphereGeometry args={[0.05, 32, 32]} />
                    <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                  </mesh>
                </RigidBody>

                <RigidBody type="fixed" position={[0, -0.5, 0]}>
                  <mesh visible={false}>
                    <boxGeometry args={[10, 0.1, 10]} />
                    <meshStandardMaterial color="#292524" />
                  </mesh>
                </RigidBody>
                
              </Physics>
            </Suspense>
          </XR>
        )}
      </Canvas>
    </div>
  );
}