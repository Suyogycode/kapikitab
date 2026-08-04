'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Billboard, Text, useGLTF } from '@react-three/drei';

import KapikitabAREnvironment from '../core/KapikitabAREnvironment';
import SpatialButton from '../ui/SpatialButton';

const PARTICLE_COUNT = 800;
const dummy = new THREE.Object3D(); 

function LoadedAirfoil({ url, tilt }: { url: string, tilt: number }) {
  const { scene } = useGLTF(url);
  const baseRotation: [number, number, number] = [Math.PI / 2, 0, Math.PI / 2];
  return (
    <group rotation={[0, 0, tilt * (Math.PI / 180)]}>
      {/* We apply the correction rotation directly to the primitive so it aligns with our world */}
      <primitive 
        object={scene} 
        scale={0.5} 
        rotation={baseRotation} 
      />
    </group>
  );
}

export default function WindTunnelLab({ modelUrl }: { modelUrl?: string }) {
  const [windSpeed, setWindSpeed] = useState(1.0);
  const [wingTilt, setWingTilt] = useState(15); // Default tilt set to 15 degrees
  
  const workerRef = useRef<Worker | null>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // 1. Boot up Web Worker
  useEffect(() => {
    workerRef.current = new Worker('/workers/aerodynamicsWorker.js');

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'PHYSICS_TICK' && meshRef.current) {
        const positions = e.data.positions;
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    };

    return () => workerRef.current?.terminate();
  }, []);

  // 2. Transmit State to Worker
  useEffect(() => {
    if (workerRef.current) {
      // Sending BOTH wind speed and wing tilt to the background thread
      workerRef.current.postMessage({ type: 'UPDATE_PARAMS', windSpeed, wingTilt });
    }
  }, [windSpeed, wingTilt]);

  return (
    <KapikitabAREnvironment>
      <group position={[0, 0, 0]}>
        
        {/* THE UI DASHBOARD */}
        <Billboard position={[0, 2.8, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
          {/* Wind Speed Controls */}
          <Text position={[0, 0.4, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center" frustumCulled={false}>
            MACH: {(windSpeed * 0.5).toFixed(1)}
          </Text>
          <SpatialButton position={[-0.3, 0.2, 0]} label="- SPEED" onTrigger={() => setWindSpeed(s => Math.max(0.1, s - 0.5))} />
          <SpatialButton position={[0, 0.2, 0]} label="RE-ANCHOR" isDanger={true} onTrigger={() => {}} />
          <SpatialButton position={[0.3, 0.2, 0]} label="+ SPEED" onTrigger={() => setWindSpeed(s => Math.min(5.0, s + 0.5))} />

          {/* Wing Tilt Controls */}
          <Text position={[0, -0.1, 0]} fontSize={0.06} color="#10b981" anchorX="center" frustumCulled={false}>
            ANGLE OF ATTACK: {wingTilt}°
          </Text>
          <SpatialButton position={[-0.2, -0.25, 0]} label="PITCH DOWN" onTrigger={() => setWingTilt(t => Math.max(-45, t - 5))} />
          <SpatialButton position={[0.2, -0.25, 0]} label="PITCH UP" onTrigger={() => setWingTilt(t => Math.min(45, t + 5))} />
        </Billboard>

        {/* THE PHYSICAL AIRPLANE WING */}
        <group position={[0, 1.5, 0]}>
           {modelUrl ? (
             <LoadedAirfoil url={modelUrl} tilt={wingTilt} />
           ) : (
             <mesh rotation={[0, 0, wingTilt * (Math.PI / 180)]} castShadow receiveShadow>
               <capsuleGeometry args={[0.08, 0.6, 16, 32]} />
               <meshStandardMaterial color="#44403c" roughness={0.7} metalness={0.2} />
             </mesh>
           )}
        </group>

        {/* THE PARTICLE RENDERER */}
        <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial 
            color="#2563eb" // A rich, royal blue
            emissive="#1d4ed8" // A very faint glow to keep them visible
            emissiveIntensity={0.4} 
            roughness={0.2} // Makes them slightly shiny
            metalness={0.1}
            toneMapped={false} 
          />
        </instancedMesh>
        
      </group>
    </KapikitabAREnvironment>
  );
}