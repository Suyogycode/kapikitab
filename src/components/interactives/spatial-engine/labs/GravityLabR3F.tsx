'use client';

import React, { useState } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

// 1. Import our custom Kapikitab Spatial Engine tools!
import KapikitabAREnvironment from '../core/KapikitabAREnvironment';
import SpatialButton from '../ui/SpatialButton';

export default function GravityLabR3F() {
  // The scientific state logic remains unchanged
  const [gravity, setGravity] = useState(-9.81);
  const [resetKey, setResetKey] = useState(0);
  const [labScale, setLabScale] = useState(1);
  const [labRot, setLabRot] = useState(0);

  // 2. The Assembly: Look how clean and readable this is now!
  return (
    <KapikitabAREnvironment>
      <group scale={labScale} rotation={[0, labRot, 0]}>
        
        {/* The Spatial Dashboard */}
        <Billboard position={[0, 1.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text position={[0, 0.4, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center" frustumCulled={false}>
            GRAVITY: {gravity.toFixed(1)}
          </Text>

          <SpatialButton position={[-0.3, 0.2, 0]} label="+ GRAV" onTrigger={() => setGravity(g => Math.min(g + 2, 5))} />
          <SpatialButton position={[0, 0.2, 0]} label="DROP BALL" isPrimary={true} onTrigger={() => setResetKey(prev => prev + 1)} />
          <SpatialButton position={[0.3, 0.2, 0]} label="- GRAV" onTrigger={() => setGravity(g => Math.max(g - 2, -25))} />

          <SpatialButton position={[-0.3, 0.05, 0]} label="SPIN L" onTrigger={() => setLabRot(r => r - Math.PI / 4)} />
          
          {/* Notice we don't even pass an onTrigger for RE-ANCHOR. The button's internal engine hook handles it automatically! */}
          <SpatialButton position={[0, 0.05, 0]} label="RE-ANCHOR" isDanger={true} onTrigger={() => {}} /> 
          
          <SpatialButton position={[0.3, 0.05, 0]} label="SPIN R" onTrigger={() => setLabRot(r => r + Math.PI / 4)} />

          <SpatialButton position={[-0.18, -0.1, 0]} label="ZOOM OUT" onTrigger={() => setLabScale(s => Math.max(0.5, s - 0.2))} />
          <SpatialButton position={[0.18, -0.1, 0]} label="ZOOM IN" onTrigger={() => setLabScale(s => Math.min(3, s + 0.2))} />
        </Billboard>

        {/* The Physics Engine */}
        <Physics key={`${resetKey}-${labScale}-${labRot}`} gravity={[0, gravity, 0]}>
          
          <RigidBody position={[0, 1.5, 0]} colliders="ball" restitution={0.8} mass={1}>
            <mesh castShadow frustumCulled={false}>
              <sphereGeometry args={[0.1, 32, 32]} />
              <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
            </mesh>
          </RigidBody>

          {/* The Infinite Catch-Floor */}
          <RigidBody type="fixed" position={[0, -0.05, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[100, 0.1, 100]} />
              <shadowMaterial transparent opacity={0.4} />
            </mesh>
          </RigidBody>

        </Physics>
      </group>
    </KapikitabAREnvironment>
  );
}