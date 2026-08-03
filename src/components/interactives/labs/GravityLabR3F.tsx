'use client';

import React, { useState, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Billboard } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { createXRStore, XR, useXRHitTest } from '@react-three/xr';

const store = createXRStore();
const matrixHelper = new THREE.Matrix4();

// ============================================================================
// 1. THE PRODUCTION SPATIAL BUTTON COMPONENT
// ============================================================================
interface SpatialButtonProps {
  position: [number, number, number];
  label: string;
  onTrigger: () => void;
  isPrimary?: boolean;
  isDanger?: boolean;
}

function SpatialButton({ position, label, onTrigger, isPrimary = false, isDanger = false }: SpatialButtonProps) {
  const [pressed, setPressed] = useState(false);

  // Minimalist, earthy palette
  const baseColor = isDanger ? "#7f1d1d" : (isPrimary ? "#44403c" : "#292524");
  const highlightColor = isDanger ? "#ef4444" : "#10b981"; 
  const size: [number, number, number] = isPrimary ? [0.35, 0.12, 0.04] : [0.15, 0.08, 0.02];

  const handlePointerDown = (e: any) => {
    e.stopPropagation(); // Prevents tapping the button from accidentally tapping the floor behind it
    setPressed(true);
    
    // HAPTIC FEEDBACK: Vibrates the user's phone for 20ms to simulate a physical click
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); 
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setPressed(false);
    onTrigger(); // Execute the logic only when the user lifts their finger
  };

  return (
    <group position={position}>
      {/* 
        THE HITBOX: Invisible, but 2x wider and 4x deeper than the visual button. 
        This guarantees the WebXR raycaster catches imprecise mobile screen taps! 
      */}
      <mesh
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={() => setPressed(false)} // Reset if finger slides off the button
      >
        <boxGeometry args={[size[0] * 2, size[1] * 2, size[2] * 4]} />
      </mesh>

      {/* THE VISUAL BUTTON: Scales down by 10% when pressed to give visual physical feedback */}
      <mesh scale={pressed ? 0.9 : 1}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={pressed ? highlightColor : baseColor} roughness={0.9} />
      </mesh>

      <Text
        position={[0, 0, size[2] / 2 + 0.005]}
        fontSize={isPrimary ? 0.045 : 0.03}
        color={pressed ? "#ffffff" : (isDanger ? "#fecaca" : "#10b981")}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// ============================================================================
// 2. THE AR LABORATORY ARCHITECTURE
// ============================================================================
function ARLabAnchor() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);
  
  const [labScale, setLabScale] = useState(1);
  const [labRot, setLabRot] = useState(0);

  const [anchorPos, setAnchorPos] = useState<THREE.Vector3 | null>(null);
  const reticleRef = useRef<THREE.Mesh>(null);

  useXRHitTest((results, getWorldMatrix) => {
    if (!anchorPos && reticleRef.current && results.length > 0) {
      getWorldMatrix(matrixHelper, results[0]);
      reticleRef.current.matrixAutoUpdate = false;
      reticleRef.current.matrix.copy(matrixHelper);
    }
  }, "viewer");

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
          <Billboard position={[0, 1.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
            
            <Text position={[0, 0.4, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center">
              GRAVITY: {gravity.toFixed(1)}
            </Text>

            {/* Replaced raw meshes with our production Spatial Buttons */}
            
            {/* ROW 1: GRAVITY & DROP */}
            <SpatialButton position={[-0.25, 0.2, 0]} label="+ GRAV" onTrigger={() => setGravity(g => Math.min(g + 2, 5))} />
            <SpatialButton position={[0, 0.2, 0]} label="DROP BALL" isPrimary={true} onTrigger={() => setResetKey(prev => prev + 1)} />
            <SpatialButton position={[0.25, 0.2, 0]} label="- GRAV" onTrigger={() => setGravity(g => Math.max(g - 2, -25))} />

            {/* ROW 2: ROTATION & RE-ANCHOR */}
            <SpatialButton position={[-0.25, 0.05, 0]} label="SPIN L" onTrigger={() => setLabRot(r => r - Math.PI / 4)} />
            <SpatialButton position={[0, 0.05, 0]} label="RE-ANCHOR" isDanger={true} onTrigger={() => setAnchorPos(null)} />
            <SpatialButton position={[0.25, 0.05, 0]} label="SPIN R" onTrigger={() => setLabRot(r => r + Math.PI / 4)} />

            {/* ROW 3: ZOOM / SCALE */}
            <SpatialButton position={[-0.15, -0.1, 0]} label="ZOOM OUT" onTrigger={() => setLabScale(s => Math.max(0.5, s - 0.2))} />
            <SpatialButton position={[0.15, -0.1, 0]} label="ZOOM IN" onTrigger={() => setLabScale(s => Math.min(3, s + 0.2))} />

          </Billboard>

          <group scale={labScale} rotation={[0, labRot, 0]}>
            <Physics key={`${resetKey}-${labScale}-${labRot}`} gravity={[0, gravity, 0]}>
              <RigidBody position={[0, 1.5, 0]} colliders="ball" restitution={0.8} mass={1}>
                <mesh castShadow>
                  <sphereGeometry args={[0.1, 32, 32]} />
                  <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                </mesh>
              </RigidBody>

              <RigidBody type="fixed" position={[0, -0.05, 0]}>
                <mesh receiveShadow>
                  <boxGeometry args={[100, 0.1, 100]} />
                  <shadowMaterial transparent opacity={0.4} />
                </mesh>
              </RigidBody>
            </Physics>
          </group>
        </group>
      )}
    </>
  );
}

// ============================================================================
// 3. MAIN EXPORT
// ============================================================================
export default function GravityLabR3F() {
  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-[#1c1917] rounded-2xl overflow-hidden relative shadow-sm border border-stone-800 my-8">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => store.enterAR()}
          className="bg-stone-200/90 backdrop-blur-md text-stone-900 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl hover:bg-white transition-colors"
        >
          Enter AR
        </button>
      </div>

      <Canvas camera={{ position: [0, 1, 3], fov: 50, near: 0.01, far: 1000 }}> 
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <OrbitControls makeDefault />
            <Environment preset="city" />
            <ARLabAnchor />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}