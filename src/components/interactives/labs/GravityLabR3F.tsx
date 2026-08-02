'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
// Added Grid for a cool laboratory aesthetic
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { RotateCcw } from 'lucide-react';
import { createXRStore, XR } from '@react-three/xr';

export default function GravityLabR3F() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      const xrStore = createXRStore({
        domOverlay: containerRef.current 
      });
      setStore(xrStore);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[600px] bg-stone-950 rounded-2xl overflow-hidden relative border border-stone-800 shadow-2xl flex flex-col">
      
      {/* 
        1. THE UI FIX: Flexbox Layout + Pointer Events 
        We use pointer-events-none on the wrapper so we don't block the 3D canvas,
        but pointer-events-auto on the actual buttons so they remain clickable.
      */}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 pointer-events-none">
        
        <button 
          onClick={() => setResetKey(prev => prev + 1)}
          className="bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20 shadow-xl flex items-center gap-2 hover:bg-white/20 transition-colors pointer-events-auto"
        >
          <RotateCcw size={14} /> Drop Ball
        </button>

        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-2xl w-full sm:w-64 border border-stone-200 pointer-events-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Gravitational Pull</span>
            <span className="text-sm font-mono text-emerald-600">{gravity.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="-25" max="5" step="0.1" value={gravity} 
            onChange={(e) => setGravity(parseFloat(e.target.value))} 
            className="w-full accent-emerald-500 cursor-grab active:cursor-grabbing" 
          />
        </div>
      </div>

      {store && (
        <button 
          onClick={() => store.enterAR()}
          className="absolute bottom-6 right-6 z-50 bg-white text-stone-900 px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-xl border border-stone-200 hover:scale-105 transition-transform pointer-events-auto"
        >
          Enter AR
        </button>
      )}

      {/* 2. THE CAMERA FIX: Pulled back and raised slightly */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }}> 
          {store && (
            <XR store={store}>
              <Suspense fallback={null}>
                
                {/* 3. THE LIGHTING FIX: Actually illuminate the darkness! */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
                
                <OrbitControls makeDefault />
                <Environment preset="city" />

                <Physics key={resetKey} gravity={[0, gravity, 0]}>
                  
                  {/* 4. THE BALL FIX: Larger (40cm) and spawned higher */}
                  <RigidBody position={[0, 4, 0]} colliders="ball" restitution={0.8} mass={1}>
                    <mesh castShadow>
                      <sphereGeometry args={[0.4, 32, 32]} />
                      <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                    </mesh>
                  </RigidBody>

                  {/* 5. THE FLOOR FIX: Visible again so you can see it on PC */}
                  <RigidBody type="fixed" position={[0, -0.5, 0]}>
                    <mesh receiveShadow>
                      <boxGeometry args={[15, 0.5, 15]} />
                      <meshStandardMaterial color="#292524" />
                    </mesh>
                  </RigidBody>
                  
                </Physics>

                {/* Bonus: A subtle emerald laboratory grid on the floor! */}
                <Grid position={[0, -0.24, 0]} args={[15, 15]} cellColor="#10b981" sectionColor="#10b981" fadeDistance={15} fadeStrength={1.5} />

              </Suspense>
            </XR>
          )}
        </Canvas>
      </div>
    </div>
  );
}