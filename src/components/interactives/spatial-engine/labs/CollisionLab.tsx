'use client';

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import { Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';

import KapikitabAREnvironment from '../core/KapikitabAREnvironment';
import SpatialButton from '../ui/SpatialButton';

export default function CollisionLab() {
  // We use RapierRigidBody refs to apply physical forces to the 3D models
  const projectileRef = useRef<RapierRigidBody>(null);
  
  // A simple key to instantly reset the physics simulation
  const [resetKey, setResetKey] = useState(0);

  const fireProjectile = () => {
    if (projectileRef.current) {
      // Wake up the physics body and apply a massive force vector along the X-axis
      projectileRef.current.wakeUp();
      projectileRef.current.applyImpulse({ x: 2.5, y: 0, z: 0 }, true);
    }
  };

  return (
    <KapikitabAREnvironment>
      <group position={[0, 0, 0]}>
        
        {/* THE UI DASHBOARD */}
        <Billboard position={[0, 2.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text position={[0, 0.4, 0]} fontSize={0.08} color="#d6d3d1" anchorX="center" frustumCulled={false}>
            ELASTIC COLLISION
          </Text>
          <SpatialButton position={[-0.3, 0.2, 0]} label="FIRE MASS 1" isPrimary={true} onTrigger={fireProjectile} />
          <SpatialButton position={[0, 0.2, 0]} label="RE-ANCHOR" isDanger={true} onTrigger={() => {}} />
          <SpatialButton position={[0.3, 0.2, 0]} label="RESET LAB" onTrigger={() => setResetKey(prev => prev + 1)} />
        </Billboard>

        {/* ENGINE #3: THE RAPIER PHYSICS WORLD */}
        <Physics key={resetKey} gravity={[0, -9.81, 0]}>
          
          {/* MASS 1: The Projectile (1kg) */}
          <RigidBody 
            ref={projectileRef} 
            position={[-1.5, 1.2, 0]} 
            colliders="ball" 
            mass={1} 
            restitution={1} // 1 = Perfect bounciness (no kinetic energy lost)
            friction={0}    // 0 = No drag
          >
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.15, 32, 32]} />
              {/* Earthy Amber color for Mass 1 */}
              <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.2} />
            </mesh>
          </RigidBody>

          {/* MASS 2: The Target (3kg - heavier!) */}
          <RigidBody 
            position={[0, 1.2, 0]} 
            colliders="ball" 
            mass={3} 
            restitution={1} 
            friction={0}
          >
            <mesh castShadow receiveShadow>
              {/* Slightly larger to visually indicate higher mass */}
              <sphereGeometry args={[0.22, 32, 32]} />
              <meshStandardMaterial color="#44403c" roughness={0.7} metalness={0.1} />
            </mesh>
          </RigidBody>

          {/* THE FRICTIONLESS TRACK */}
          <RigidBody type="fixed" position={[0, 1, 0]} restitution={0.5} friction={0}>
            <mesh receiveShadow>
              <boxGeometry args={[4, 0.05, 0.4]} />
              <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
            </mesh>
          </RigidBody>

          {/* INVISIBLE WALLS (To keep them from falling off the ends) */}
          <RigidBody type="fixed" position={[-2, 1.2, 0]}>
             <mesh visible={false}><boxGeometry args={[0.1, 0.5, 0.4]}/></mesh>
          </RigidBody>
          <RigidBody type="fixed" position={[2, 1.2, 0]}>
             <mesh visible={false}><boxGeometry args={[0.1, 0.5, 0.4]}/></mesh>
          </RigidBody>

        </Physics>
      </group>
    </KapikitabAREnvironment>
  );
}