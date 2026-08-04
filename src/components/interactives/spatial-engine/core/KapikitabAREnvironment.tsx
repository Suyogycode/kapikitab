'use client';

import React, { useState, Suspense, useRef, createContext, useContext } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { createXRStore, XR, useXRHitTest, useXR } from '@react-three/xr';

// 1. Initialize engine variables
const store = createXRStore();
const matrixHelper = new THREE.Matrix4();

// 2. Create a global Context so any button inside the lab can reset the AR anchor
export const ARAnchorContext = createContext<(() => void) | null>(null);

// Custom hook so future UI buttons can easily access the re-anchor function
export function useARAnchor() {
  return useContext(ARAnchorContext);
}

// 3. The Internal Scene Manager (Handles PC vs AR routing)
function ARSceneManager({ children }: { children: React.ReactNode }) {
  const isAR = useXR((state) => state.mode === 'immersive-ar');
  const [anchorPos, setAnchorPos] = useState<THREE.Vector3 | null>(null);
  const reticleRef = useRef<THREE.Mesh>(null);

  useXRHitTest((results, getWorldMatrix) => {
    if (isAR && !anchorPos && reticleRef.current && results.length > 0) {
      getWorldMatrix(matrixHelper, results[0]);
      reticleRef.current.matrixAutoUpdate = false;
      reticleRef.current.matrix.copy(matrixHelper);
    }
  }, "viewer");

  // PC MODE: Center the lab perfectly on screen
  if (!isAR) {
    return (
      <>
        <Grid position={[0, -0.05, 0]} args={[10, 10]} cellColor="#10b981" sectionColor="#10b981" fadeDistance={5} fadeStrength={1.5} />
        {children}
      </>
    );
  }

  // AR MODE: Execute surface detection state machine
  return (
    <>
      {!anchorPos && (
        <mesh
          ref={reticleRef}
          onPointerDown={() => {
            if (reticleRef.current) {
              const pos = new THREE.Vector3();
              pos.setFromMatrixPosition(reticleRef.current.matrix);
              setAnchorPos(pos);
            }
          }}
        >
          <ringGeometry args={[0.15, 0.2, 32]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {anchorPos && (
        <group position={anchorPos}>
          {/* Wrap children in the Context Provider so they can trigger a reset */}
          <ARAnchorContext.Provider value={() => setAnchorPos(null)}>
            {children}
          </ARAnchorContext.Provider>
        </group>
      )}
    </>
  );
}

// 4. The Main Exported Wrapper
export default function KapikitabAREnvironment({ children }: { children: React.ReactNode }) {
  return (
    // THE FIX: Changed to w-full h-full absolute inset-0 to perfectly fill the parent container!
    // Removed margins, fixed aspect ratios, and hardcoded borders.
    <div className="w-full h-full absolute inset-0 overflow-hidden z-10 pointer-events-auto">
      
      {/* Universal AR Entry Button */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => store.enterAR()}
          className="bg-stone-200/90 backdrop-blur-md text-stone-900 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl hover:bg-white transition-colors"
        >
          Enter AR
        </button>
      </div>

      {/* The Universal 3D Canvas */}
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50, near: 0.01, far: 1000 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}> 
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <OrbitControls makeDefault />
            <Environment preset="city" />
            
            <ARSceneManager>
              {children}
            </ARSceneManager>

          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}