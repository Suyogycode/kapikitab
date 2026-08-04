'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';

import KapikitabAREnvironment from '../core/KapikitabAREnvironment';
import SpatialButton from '../ui/SpatialButton';

const PARTICLE_COUNT = 500;
// We use a single invisible "dummy" object to calculate the 3D math for all 500 particles instantly
const dummy = new THREE.Object3D(); 

export default function WindTunnelLab() {
  const [windSpeed, setWindSpeed] = useState(1.0);
  
  // Refs to hold our background CPU thread and our GPU rendering mesh
  const workerRef = useRef<Worker | null>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // 1. Boot up the Web Worker when the lab loads
  useEffect(() => {
    workerRef.current = new Worker('/workers/aerodynamicsWorker.js');

    // 2. Listen for the massive array of numbers coming from the background thread
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'PHYSICS_TICK' && meshRef.current) {
        const positions = e.data.positions;
        
        // InstancedMesh Magic: Apply the coordinates to our 1 single draw call
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        // Tell the GPU it's time to redraw
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    };

    // Kill the background thread if the student leaves the page
    return () => workerRef.current?.terminate();
  }, []);

  // 3. Send UI changes (like pressing the speed buttons) to the background thread
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'UPDATE_PARAMS', windSpeed });
    }
  }, [windSpeed]);

  return (
    <KapikitabAREnvironment>
      <group position={[0, 0, 0]}>
        
        {/* THE UI DASHBOARD */}
        <Billboard position={[0, 2.8, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text position={[0, 0.4, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center" frustumCulled={false}>
            MACH: {(windSpeed * 0.5).toFixed(1)}
          </Text>
          <SpatialButton position={[-0.3, 0.2, 0]} label="- SPEED" onTrigger={() => setWindSpeed(s => Math.max(0.1, s - 0.5))} />
          <SpatialButton position={[0, 0.2, 0]} label="RE-ANCHOR" isDanger={true} onTrigger={() => {}} />
          <SpatialButton position={[0.3, 0.2, 0]} label="+ SPEED" onTrigger={() => setWindSpeed(s => Math.min(5.0, s + 0.5))} />
        </Billboard>

        {/* THE PARTICLE RENDERER (1 Draw Call!) */}
        <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
          <sphereGeometry args={[0.015, 8, 8]} />
          {/* Glowing emerald particles */}
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} toneMapped={false} />
        </instancedMesh>
        
      </group>
    </KapikitabAREnvironment>
  );
}