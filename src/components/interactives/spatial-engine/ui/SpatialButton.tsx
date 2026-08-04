'use client';

import React, { useState } from 'react';
import { Text } from '@react-three/drei';
// Import the context hook from our core engine
import { useARAnchor } from '../core/KapikitabAREnvironment';

interface SpatialButtonProps {
  position: [number, number, number];
  label: string;
  onTrigger: () => void;
  isPrimary?: boolean;
  isDanger?: boolean;
}

export default function SpatialButton({ position, label, onTrigger, isPrimary = false, isDanger = false }: SpatialButtonProps) {
  const [pressed, setPressed] = useState(false);
  const resetAnchor = useARAnchor(); // Connects to the Core Engine

  // Kapikitab's minimalist, earthy color palette
  const baseColor = isDanger ? "#7f1d1d" : (isPrimary ? "#44403c" : "#292524");
  const highlightColor = isDanger ? "#ef4444" : "#10b981"; 
  const size: [number, number, number] = isPrimary ? [0.35, 0.12, 0.04] : [0.15, 0.08, 0.02];

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setPressed(true);
    
    // Haptic feedback for tactile realism
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); 
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setPressed(false);
    
    // If it's a danger button named "RE-ANCHOR", trigger the engine reset automatically
    if (isDanger && label === "RE-ANCHOR" && resetAnchor) {
      resetAnchor();
    } else {
      onTrigger();
    }
  };

  return (
    <group position={position}>
      {/* The "Clumsy Thumb" Hitbox - 1.1x larger than the visual button */}
      <mesh
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={() => setPressed(false)}
      >
        <boxGeometry args={[size[0] * 1.1, size[1] * 1.1, size[2] * 2]} />
      </mesh>

      {/* The Visual Button - frustumCulled={false} prevents it from vanishing */}
      <mesh scale={pressed ? 0.9 : 1} frustumCulled={false}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={pressed ? highlightColor : baseColor} roughness={0.9} />
      </mesh>

      {/* The Text Label */}
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