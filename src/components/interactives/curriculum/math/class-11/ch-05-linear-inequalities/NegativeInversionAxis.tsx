'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Text, Environment, ContactShadows } from '@react-three/drei';

// ==================================================================
// CAMERA ORBIT ENGINE
// ==================================================================
function CameraRig({ isFlipped }: { isFlipped: boolean }) {
  const currentAngle = useRef(0);

  useFrame((state, delta) => {
    // 0 rad = Front (+Z), PI rad = Behind (-Z)[cite: 23]
    const targetAngle = isFlipped ? Math.PI : 0;
    currentAngle.current = THREE.MathUtils.lerp(currentAngle.current, targetAngle, delta * 2.5);

    const radius = 11;
    state.camera.position.x = Math.sin(currentAngle.current) * radius;
    state.camera.position.z = Math.cos(currentAngle.current) * radius;
    state.camera.position.y = 2.5;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// ==================================================================
// 3D NUMBER LINE & INEQUALITY RAY
// ==================================================================
function NumberLineScene({ isFlipped }: { isFlipped: boolean }) {
  const ticks = Array.from({ length: 17 }, (_, i) => i - 8); // -8 to +8

  return (
    <group>
      {/* MAIN AXIS BAR */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 18, 16]} />
        <meshStandardMaterial color="#57534e" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* TICKS AND BILLBOARD LABELS */}
      {ticks.map((num) => (
        <group key={num} position={[num, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.35, 0.04]} />
            <meshStandardMaterial color={num === 0 ? '#10b981' : '#78716c'} />
          </mesh>
          <Billboard position={[0, -0.45, 0]}>
            <Text
              fontSize={0.3}
              color={num === 0 ? '#10b981' : num === 2 ? '#38bdf8' : '#a8a29e'}
              anchorX="center"
              anchorY="middle"
            >
              {num.toString()}
            </Text>
          </Billboard>
        </group>
      ))}

      {/* INEQUALITY RAY: x > 2 */}
      <group position={[2, 0, 0]}>
        {/* Open Boundary Marker at 2 (Strict Inequality) */}
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[0.15, 0.22, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>

        {/* Shaded Solution Ray heading towards +infinity */}
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 5, 16]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Arrowhead pointing along ray */}
        <mesh position={[5.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.2, 0.5, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Floating Label above Ray */}
        <Billboard position={[2.5, 0.6, 0]}>
          <Text fontSize={0.4} color="#38bdf8" anchorX="center" anchorY="middle">
            {isFlipped ? 'x > 2 (Greater Than)' : '-3x < -6 (Less Than)'}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function NegativeInversionAxis() {
  const [isDivided, setIsDivided] = useState<boolean>(false);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Negative Inversion Axis</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing the sign-reversal rule during negative division[cite: 23].
          </p>
        </div>

        {/* OPERATION CONTROL PANEL */}
        <div className="pointer-events-auto bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl flex flex-col gap-3 min-w-[280px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Active Inequality</span>
            <span className={`font-mono font-bold text-lg ${isDivided ? 'text-emerald-400' : 'text-blue-400'}`}>
              {isDivided ? 'x > 2' : '-3x < -6'}
            </span>
          </div>

          <button
            onClick={() => setIsDivided(!isDivided)}
            className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all border ${
              isDivided
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isDivided ? '↺ Reset to Front View' : '÷ Divide by -3'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT PANEL */}
      {isDivided && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500/50 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Spatial Perspective Inversion</p>
            <p className="text-stone-200 text-sm leading-relaxed mb-3">
              Dividing by a negative number physically orbits your perspective $180^\circ$ to the opposite side of the coordinate universe[cite: 23]. Look at the axis: positive numbers now lie on your left and negative numbers on your right[cite: 23]. 
            </p>
            <p className="text-emerald-300 font-mono text-sm bg-emerald-950/50 py-2 rounded-lg border border-emerald-900/50">
              Left and Right are inverted: "Less Than" physically becomes "Greater Than"[cite: 23].
            </p>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2.5, 11], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 8, 8]} intensity={1.5} />
            <Environment preset="city" />

            <CameraRig isFlipped={isDivided} />
            <NumberLineScene isFlipped={isDivided} />

            <ContactShadows frames={1} resolution={512} scale={25} blur={2} opacity={0.3} far={10} position={[0, -2.5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}