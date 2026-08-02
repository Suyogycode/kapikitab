'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
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
    <div ref={containerRef} className="w-full h-[600px] rounded-2xl overflow-hidden relative border border-stone-800 shadow-2xl flex flex-col pointer-events-none">
      {/* 1. THE AR GLITCH FIX: Removed bg-stone-950 from the HTML div */}
      
      <div className="absolute top-0 left-0 w-full p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 pointer-events-none">
        <button 
          onClick={() => setResetKey(prev => prev + 1)}
          className="bg-stone-900/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 shadow-xl flex items-center gap-2 pointer-events-auto hover:bg-stone-800"
        >
          <RotateCcw size={14} /> Drop Ball
        </button>

        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-xl shadow-2xl w-full sm:w-64 border border-stone-200 pointer-events-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Gravity</span>
            <span className="text-sm font-mono text-emerald-600">{gravity.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="-25" max="5" step="0.1" value={gravity} 
            onChange={(e) => setGravity(parseFloat(e.target.value))} 
            className="w-full accent-emerald-500" 
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

      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}> 
          
          {/* 2. THE BACKGROUND FIX: This colors the PC screen, but turns invisible in AR! */}
          <color attach="background" args={['#1c1917']} />

          {store && (
            <XR store={store}>
              <Suspense fallback={null}>
                
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
                
                <OrbitControls makeDefault />
                <Environment preset="city" />

                <Physics key={resetKey} gravity={[0, gravity, 0]}>
                  
                  {/* 3. THE MASSIVE SCALE FIX: Radius 0.1 (10cm). Spawns 1 meter IN FRONT of you (-1) */}
                  <RigidBody position={[0, 1.5, -1]} colliders="ball" restitution={0.8} mass={1}>
                    <mesh castShadow>
                      <sphereGeometry args={[0.1, 32, 32]} />
                      <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                    </mesh>
                  </RigidBody>

                  <RigidBody type="fixed" position={[0, -0.05, 0]}>
                    <mesh receiveShadow>
                      <boxGeometry args={[10, 0.1, 10]} />
                      <meshStandardMaterial color="#292524" />
                    </mesh>
                  </RigidBody>
                  
                </Physics>

                {/* 4. THE PC INFINITY FIX: Shrunk the grid fade distance to 5 */}
                <Grid position={[0, 0, 0]} args={[10, 10]} cellColor="#10b981" sectionColor="#10b981" fadeDistance={5} fadeStrength={1.5} />

              </Suspense>
            </XR>
          )}
        </Canvas>
      </div>
    </div>
  );
}