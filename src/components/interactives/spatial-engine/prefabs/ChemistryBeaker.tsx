'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ChemistryBeakerProps {
  position?: [number, number, number];
  fluidColor?: string;   // Hex color for the liquid
  fillLevel?: number;    // 0.0 (empty) to 1.0 (full)
  scale?: number;
}

export default function ChemistryBeaker({
  position = [0, 0, 0],
  fluidColor = "#10b981", // Defaulting to a nice Kapikitab emerald
  fillLevel = 0.5,
  scale = 1
}: ChemistryBeakerProps) {
  const fluidRef = useRef<THREE.Mesh>(null);
  
  // The physical dimensions of our cylinder
  const beakerHeight = 1.5;
  const fluidMaxHeight = beakerHeight * 0.95; 

  // useFrame runs at 60 FPS. We use it to smoothly animate the fluid filling up!
  useFrame((state, delta) => {
    if (fluidRef.current) {
      // 1. Smoothly interpolate (lerp) the scale toward the target fill level
      const targetScaleY = Math.max(0.01, fillLevel);
      fluidRef.current.scale.y = THREE.MathUtils.lerp(fluidRef.current.scale.y, targetScaleY, delta * 5);
      
      // 2. Adjust the Y position so the fluid scales from the bottom up, not the center out
      const currentHeight = fluidMaxHeight * fluidRef.current.scale.y;
      fluidRef.current.position.y = -(fluidMaxHeight / 2) + (currentHeight / 2);
    }
  });

  return (
    <group position={position} scale={scale}>
      
      {/* OUTER SHELL: Premium Glass Material */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, beakerHeight, 64]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.95} // Glass-like transparency
          opacity={1}
          metalness={0.1}
          roughness={0.05}    // Very smooth
          ior={1.5}           // Index of Refraction for real glass
          thickness={0.1}
        />
      </mesh>

      {/* INNER VOLUME: The Chemical Fluid */}
      <mesh ref={fluidRef} castShadow receiveShadow>
        {/* Slightly narrower so it sits perfectly inside the glass walls */}
        <cylinderGeometry args={[0.48, 0.48, fluidMaxHeight, 64]} />
        <meshStandardMaterial 
          color={fluidColor} 
          transparent 
          opacity={0.85}
          roughness={0.3}     // Earthy, matte liquid finish
        />
      </mesh>

      {/* BEAKER BASE: A solid stone coaster to ground the design */}
      <mesh position={[0, -(beakerHeight / 2) - 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.1, 64]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>

    </group>
  );
}