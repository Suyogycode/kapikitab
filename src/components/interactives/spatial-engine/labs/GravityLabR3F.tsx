'use client';

import React, { useState, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Billboard, Grid } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { createXRStore, XR, useXRHitTest, useXR } from '@react-three/xr';

const store = createXRStore();
const matrixHelper = new THREE.Matrix4();

// ============================================================================
// 1. THE PRODUCTION SPATIAL BUTTON (Frustum Culling Fixed)
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

  // Maintaining the clean, minimalist, earthy aesthetic
  const baseColor = isDanger ? "#7f1d1d" : (isPrimary ? "#44403c" : "#292524");
  const highlightColor = isDanger ? "#ef4444" : "#10b981"; 
  const size: [number, number, number] = isPrimary ? [0.35, 0.12, 0.04] : [0.15, 0.08, 0.02];

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setPressed(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20); 
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setPressed(false);
    onTrigger();
  };

  return (
    <group position={position}>
      {/* THE FIX: Shrunk the hitbox from 2x to 1.1x to stop overlapping! */}
      <mesh
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={() => setPressed(false)}
      >
        <boxGeometry args={[size[0] * 1.1, size[1] * 1.1, size[2] * 2]} />
      </mesh>

      <mesh scale={pressed ? 0.9 : 1} frustumCulled={false}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={pressed ? highlightColor : baseColor} roughness={0.9} />
      </mesh>

      <Text
        position={[0, 0, size[2] / 2 + 0.005]}
        fontSize={isPrimary ? 0.045 : 0.03}
        color={pressed ? "#ffffff" : (isDanger ? "#fecaca" : "#10b981")}
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        {label}
      </Text>
    </group>
  );
}

// ============================================================================
// 2. THE UNIFIED LAB CONTENT (Renders in both PC and AR modes perfectly)
// ============================================================================
function LabContent({ 
  gravity, setGravity, 
  resetKey, setResetKey, 
  labScale, setLabScale, 
  labRot, setLabRot,
  onReanchor 
}: any) {
  return (
    <group scale={labScale} rotation={[0, labRot, 0]}>
      
      {/* UI Dashboard */}
      <Billboard position={[0, 1.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text position={[0, 0.4, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center" frustumCulled={false}>
          GRAVITY: {gravity.toFixed(1)}
        </Text>

        {/* THE FIX: Widened positions from ±0.25 to ±0.30 */}
        <SpatialButton position={[-0.3, 0.2, 0]} label="+ GRAV" onTrigger={() => setGravity((g: number) => Math.min(g + 2, 5))} />
        <SpatialButton position={[0, 0.2, 0]} label="DROP BALL" isPrimary={true} onTrigger={() => setResetKey((prev: number) => prev + 1)} />
        <SpatialButton position={[0.3, 0.2, 0]} label="- GRAV" onTrigger={() => setGravity((g: number) => Math.max(g - 2, -25))} />

        <SpatialButton position={[-0.3, 0.05, 0]} label="SPIN L" onTrigger={() => setLabRot((r: number) => r - Math.PI / 4)} />
        
        {onReanchor && (
          <SpatialButton position={[0, 0.05, 0]} label="RE-ANCHOR" isDanger={true} onTrigger={onReanchor} />
        )}
        
        <SpatialButton position={[0.3, 0.05, 0]} label="SPIN R" onTrigger={() => setLabRot((r: number) => r + Math.PI / 4)} />

        {/* Zoom buttons widened slightly to match */}
        <SpatialButton position={[-0.18, -0.1, 0]} label="ZOOM OUT" onTrigger={() => setLabScale((s: number) => Math.max(0.5, s - 0.2))} />
        <SpatialButton position={[0.18, -0.1, 0]} label="ZOOM IN" onTrigger={() => setLabScale((s: number) => Math.min(3, s + 0.2))} />
      </Billboard>

      {/* Physics Engine */}
      <Physics key={`${resetKey}-${labScale}-${labRot}`} gravity={[0, gravity, 0]}>
        <RigidBody position={[0, 1.5, 0]} colliders="ball" restitution={0.8} mass={1}>
          <mesh castShadow frustumCulled={false}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
          </mesh>
        </RigidBody>

        {/* Infinite Floor */}
        <RigidBody type="fixed" position={[0, -0.05, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[100, 0.1, 100]} />
            <shadowMaterial transparent opacity={0.4} />
          </mesh>
        </RigidBody>
      </Physics>
    </group>
  );
}

// ============================================================================
// 3. THE SCENE MANAGER (Handles AR vs Standard 3D Logic)
// ============================================================================
function SceneManager() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);
  const [labScale, setLabScale] = useState(1);
  const [labRot, setLabRot] = useState(0);

  // WebXR State detection
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

  // IF WE ARE NOT IN AR: Render perfectly in the center of the screen
  if (!isAR) {
    return (
      <>
        <Grid position={[0, -0.05, 0]} args={[10, 10]} cellColor="#10b981" sectionColor="#10b981" fadeDistance={5} fadeStrength={1.5} />
        <LabContent 
          gravity={gravity} setGravity={setGravity} 
          resetKey={resetKey} setResetKey={setResetKey} 
          labScale={labScale} setLabScale={setLabScale} 
          labRot={labRot} setLabRot={setLabRot} 
          onReanchor={null} // No re-anchor button in standard 3D!
        />
      </>
    );
  }

  // IF WE ARE IN AR: Render the Surface Detection workflow
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
          <LabContent 
            gravity={gravity} setGravity={setGravity} 
            resetKey={resetKey} setResetKey={setResetKey} 
            labScale={labScale} setLabScale={setLabScale} 
            labRot={labRot} setLabRot={setLabRot} 
            onReanchor={() => setAnchorPos(null)} 
          />
        </group>
      )}
    </>
  );
}

// ============================================================================
// 4. MAIN EXPORT
// ============================================================================
export default function GravityLabR3F() {
  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-[#1c1917] rounded-2xl overflow-hidden relative shadow-sm border border-stone-800 my-8">
      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        <button 
          onClick={() => store.enterAR()}
          className="bg-stone-200/90 backdrop-blur-md text-stone-900 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-xl hover:bg-white transition-colors"
        >
          Enter AR
        </button>
      </div>

      <Canvas camera={{ position: [0, 1.5, 4], fov: 50, near: 0.01, far: 1000 }}> 
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <OrbitControls makeDefault />
            <Environment preset="city" />
            <SceneManager />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}