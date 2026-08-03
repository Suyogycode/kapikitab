'use client';

import React, { useState, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
// THE FIX: Imported Billboard to force the UI to always face the user
import { OrbitControls, Environment, Text, Billboard } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { createXRStore, XR, useXRHitTest } from '@react-three/xr';

const store = createXRStore();
const matrixHelper = new THREE.Matrix4();

function ARLabAnchor() {
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);
  
  // THE NEW CONTROLS: Zoom and Rotation State
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
      {/* STATE 1: SCANNING TARGET */}
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

      {/* STATE 2: ANCHORED LABORATORY */}
      {anchorPos && (
        <group position={anchorPos}>

          {/* 
            THE BILLBOARD FIX
            This wrapper forces the entire UI to constantly rotate and face your 
            camera. You can never lose the buttons to a bad angle again!
          */}
          <Billboard position={[0, 1.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
            
            <Text position={[0, 0.4, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center">
              GRAVITY: {gravity.toFixed(1)}
            </Text>

            {/* ROW 1: GRAVITY & DROP */}
            <mesh position={[-0.25, 0.2, 0]} onClick={() => setGravity(g => Math.min(g + 2, 5))}>
              <boxGeometry args={[0.15, 0.1, 0.02]} />
              <meshStandardMaterial color="#292524" roughness={0.9} />
              <Text position={[0, 0, 0.015]} fontSize={0.035} color="#10b981">+ GRAV</Text>
            </mesh>

            <mesh position={[0, 0.2, 0]} onClick={() => setResetKey(prev => prev + 1)}>
              <boxGeometry args={[0.3, 0.12, 0.04]} />
              <meshStandardMaterial color="#44403c" roughness={0.9} />
              <Text position={[0, 0, 0.021]} fontSize={0.045} color="#10b981">DROP BALL</Text>
            </mesh>

            <mesh position={[0.25, 0.2, 0]} onClick={() => setGravity(g => Math.max(g - 2, -25))}>
              <boxGeometry args={[0.15, 0.1, 0.02]} />
              <meshStandardMaterial color="#292524" roughness={0.9} />
              <Text position={[0, 0, 0.015]} fontSize={0.035} color="#10b981">- GRAV</Text>
            </mesh>

            {/* ROW 2: ROTATION & RE-ANCHOR */}
            <mesh position={[-0.25, 0.05, 0]} onClick={() => setLabRot(r => r - Math.PI / 4)}>
              <boxGeometry args={[0.15, 0.08, 0.02]} />
              <meshStandardMaterial color="#292524" />
              <Text position={[0, 0, 0.015]} fontSize={0.03} color="#0ea5e9">SPIN L</Text>
            </mesh>

            <mesh position={[0, 0.05, 0]} onClick={() => setAnchorPos(null)}>
              <boxGeometry args={[0.25, 0.08, 0.02]} />
              <meshStandardMaterial color="#991b1b" roughness={0.9} />
              <Text position={[0, 0, 0.015]} fontSize={0.035} color="#fecaca">RE-ANCHOR</Text>
            </mesh>

            <mesh position={[0.25, 0.05, 0]} onClick={() => setLabRot(r => r + Math.PI / 4)}>
              <boxGeometry args={[0.15, 0.08, 0.02]} />
              <meshStandardMaterial color="#292524" />
              <Text position={[0, 0, 0.015]} fontSize={0.03} color="#0ea5e9">SPIN R</Text>
            </mesh>

            {/* ROW 3: ZOOM / SCALE */}
            <mesh position={[-0.15, -0.1, 0]} onClick={() => setLabScale(s => Math.max(0.5, s - 0.2))}>
              <boxGeometry args={[0.15, 0.08, 0.02]} />
              <meshStandardMaterial color="#292524" />
              <Text position={[0, 0, 0.015]} fontSize={0.03} color="#eab308">ZOOM OUT</Text>
            </mesh>

            <mesh position={[0.15, -0.1, 0]} onClick={() => setLabScale(s => Math.min(3, s + 0.2))}>
              <boxGeometry args={[0.15, 0.08, 0.02]} />
              <meshStandardMaterial color="#292524" />
              <Text position={[0, 0, 0.015]} fontSize={0.03} color="#eab308">ZOOM IN</Text>
            </mesh>

          </Billboard>

          {/* 
            THE PHYSICS WRAPPER
            We inject the resetKey, scale, and rotation directly into the Physics key.
            If you zoom or rotate, the entire physics engine mathematically reboots 
            perfectly safely without glitching the rigidbodies!
          */}
          <group scale={labScale} rotation={[0, labRot, 0]}>
            <Physics key={`${resetKey}-${labScale}-${labRot}`} gravity={[0, gravity, 0]}>
              
              <RigidBody position={[0, 1.5, 0]} colliders="ball" restitution={0.8} mass={1}>
                <mesh castShadow>
                  <sphereGeometry args={[0.1, 32, 32]} />
                  <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
                </mesh>
              </RigidBody>

              {/* THE INFINITE FLOOR: 100 meters wide. The ball can never escape! */}
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

      {/* THE CAMERA FIX: near={0.01} prevents the models from turning invisible when close */}
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