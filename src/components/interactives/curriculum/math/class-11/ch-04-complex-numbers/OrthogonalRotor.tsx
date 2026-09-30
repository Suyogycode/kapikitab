'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line } from '@react-three/drei';

// ==================================================================
// 3D VECTOR ENGINE
// ==================================================================
function RotatingVector({ power }: { power: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Each power of i represents a 90-degree (PI/2) counter-clockwise rotation[cite: 20].
    // Note: In 3D space, rotating CCW around the Y axis means a negative angle.
    const targetAngle = power * (Math.PI / 2);
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, 
      targetAngle, 
      delta * 5
    );
  });

  return (
    <group ref={groupRef}>
      {/* The Vector Body */}
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* The Vector Arrowhead */}
      <mesh position={[3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.4, 16]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function OrthogonalRotor() {
  const [power, setPower] = useState<number>(0);

  // Determine current state for the UI display
  const currentCycle = power % 4;
  let displayValue = '1';
  if (currentCycle === 1) displayValue = 'i';
  if (currentCycle === 2) displayValue = '-1';
  if (currentCycle === 3) displayValue = '-i';

  const handleMultiply = () => {
    setPower(prev => prev + 1);
  };

  const handleReset = () => {
    setPower(0);
  };

  const isAhaMoment = power >= 2;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Orthogonal Rotor</h2>
        <p className="text-stone-400 text-sm max-w-2xl mb-4">
          Visualizing powers of <i>i</i> on the Argand plane[cite: 20].
        </p>

        {/* HUD CONTROLS */}
        <div className="pointer-events-auto bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md max-w-sm shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Active State</span>
            <button 
              onClick={handleReset}
              className="text-stone-500 hover:text-stone-300 font-mono text-xs underline transition-colors"
            >
              Reset to 1
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-stone-950 p-3 rounded-lg border border-stone-800 mb-4">
            <div className="text-stone-400 font-mono text-sm">
              i<sup className="text-xs">{power}</sup> =
            </div>
            <div className="text-emerald-400 font-mono text-2xl font-bold">
              {displayValue}
            </div>
          </div>

          <button 
            onClick={handleMultiply}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-mono text-sm uppercase tracking-wider font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          >
            × Multiply by i
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-blue-500/50 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-blue-400 text-xs uppercase tracking-widest font-bold mb-2">Rotational Operator</p>
            <p className="text-white text-sm sm:text-base leading-relaxed">
              Multiplying by <i>i</i> is not a numerical trick; it is a strict 90° rotational operator[cite: 20]. Two 90° left turns result in facing 180° backward in the exact opposite direction[cite: 20].
            </p>
            <p className="mt-3 text-emerald-400 font-mono font-bold bg-emerald-950/50 py-2 rounded-lg border border-emerald-900/50 inline-block px-6">
              i² = -1
            </p>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 6, 8], fov: 55 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minDistance={4} 
              maxDistance={15}
              target={[0, 0, 0]} 
            />

            {/* THE ARGAND PLANE (Coordinate System)[cite: 20] */}
            <group>
              <gridHelper args={[10, 10, "#334155", "#1e293b"]} position={[0, -0.1, 0]} />
              
              {/* Real Axis (X) */}
              <Line 
                points={[new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0)]} 
                color="#94a3b8" 
                lineWidth={2} 
              />
              <Text position={[4.5, 0, 0.5]} fontSize={0.3} color="#94a3b8" rotation={[-Math.PI/2, 0, 0]}>
                Real (Re)
              </Text>
              <Text position={[3, 0.2, 0]} fontSize={0.4} color="#10b981">1</Text>
              <Text position={[-3, 0.2, 0]} fontSize={0.4} color="#ef4444">-1</Text>

              {/* Imaginary Axis (Z) */}
              <Line 
                points={[new THREE.Vector3(0, 0, -5), new THREE.Vector3(0, 0, 5)]} 
                color="#94a3b8" 
                lineWidth={2} 
              />
              <Text position={[0.5, 0, -4.5]} fontSize={0.3} color="#94a3b8" rotation={[-Math.PI/2, 0, 0]}>
                Imaginary (Im)
              </Text>
              {/* In WebGL, negative Z goes "into" the screen, which represents the positive imaginary direction when viewed from top */}
              <Text position={[0, 0.2, -3]} fontSize={0.4} color="#a855f7">i</Text>
              <Text position={[0, 0.2, 3]} fontSize={0.4} color="#f59e0b">-i</Text>
            </group>

            {/* THE ROTATING VECTOR */}
            <RotatingVector power={power} />

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.4} far={10} position={[0, -2, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}