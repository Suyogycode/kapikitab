'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';

type FunctionType = 'identity' | 'modulus' | 'greatest_integer' | 'signum';

// ==================================================================
// 3D SEGMENT ENGINE
// ==================================================================
function LineSegment({ x, activeFn }: { x: number, activeFn: FunctionType }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate target properties based on the active function[cite: 15]
  const { targetY, targetAngle, targetLen } = useMemo(() => {
    let y = x;
    let angle = Math.PI / 4; 
    let len = 0.1 * Math.SQRT2;

    if (activeFn === 'modulus') {
      y = Math.abs(x);
      angle = x >= 0 ? Math.PI / 4 : -Math.PI / 4;
    } 
    else if (activeFn === 'greatest_integer') {
      y = Math.floor(x);
      angle = 0;
      len = 0.1; // Flat horizontal chunk
    } 
    else if (activeFn === 'signum') {
      y = Math.sign(x);
      angle = 0;
      len = 0.1; // Flat horizontal beams[cite: 15]
    }

    return { targetY: y, targetAngle: angle, targetLen: len };
  }, [x, activeFn]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Smoothly animate the mechanical transformations[cite: 15]
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 8);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetAngle, delta * 8);
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetLen, delta * 8);
  });

  return (
    <mesh ref={meshRef} position={[x, x, 0]}>
      {/* Box geometry gives the line physical thickness to catch light[cite: 15] */}
      <boxGeometry args={[1, 0.06, 0.06]} />
      <meshStandardMaterial 
        color="#34d399" 
        emissive="#059669" 
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// ==================================================================
// AXES COMPONENT
// ==================================================================
function CoordinateAxes() {
  const gridMarks = Array.from({ length: 11 }, (_, i) => i - 5);

  return (
    <group>
      {/* X and Y Axes */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[12, 0.02, 0.02]} />
        <meshBasicMaterial color="#57534e" />
      </mesh>
      <mesh position={[0, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[12, 0.02, 0.02]} />
        <meshBasicMaterial color="#57534e" />
      </mesh>

      {/* Grid Tick Marks */}
      {gridMarks.map(num => (
        <group key={`tick-${num}`}>
          {num !== 0 && (
            <>
              {/* X-axis labels */}
              <Text position={[num, -0.4, 0]} fontSize={0.2} color="#a8a29e" anchorX="center">
                {num.toString()}
              </Text>
              {/* Y-axis labels */}
              <Text position={[-0.4, num, 0]} fontSize={0.2} color="#a8a29e" anchorX="center" anchorY="middle">
                {num.toString()}
              </Text>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function FunctionTransformer() {
  const [activeFn, setActiveFn] = useState<FunctionType>('identity');

  // Generate 101 segments from -5 to 5 (step size 0.1)
  const segments = useMemo(() => {
    return Array.from({ length: 101 }, (_, i) => -5 + i * 0.1);
  }, []);

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Function Transformer</h2>
        <p className="text-stone-400 text-sm max-w-2xl mb-4">
          Graphing Real Functions
        </p>

        {/* CONTROL PANEL */}
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          <button 
            onClick={() => setActiveFn('identity')}
            className={`px-4 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all border ${activeFn === 'identity' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'}`}
          >
            f(x) = x
          </button>
          <button 
            onClick={() => setActiveFn('modulus')}
            className={`px-4 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all border ${activeFn === 'modulus' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'}`}
          >
            Modulus |x|
          </button>
          <button 
            onClick={() => setActiveFn('greatest_integer')}
            className={`px-4 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all border ${activeFn === 'greatest_integer' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'}`}
          >
            Greatest Int [x]
          </button>
          <button 
            onClick={() => setActiveFn('signum')}
            className={`px-4 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all border ${activeFn === 'signum' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'}`}
          >
            Signum(x)
          </button>
        </div>
      </div>

      {/* THE AHA MOMENT EXPLANATION */}
      {activeFn !== 'identity' && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/90 border border-emerald-900/50 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in fade-in duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Mechanical Transformation</p>
            <p className="text-stone-300 text-sm leading-relaxed">
              These functions are not just arbitrary drawings; they are active, mechanical transformations of the standard identity line[cite: 15]. 
              {activeFn === 'modulus' && ' The physical hinges snap the negative values upward into a positive range.'}
              {activeFn === 'greatest_integer' && ' The line shatters and drops to the floor of each integer interval, proving why it is a step function[cite: 15].'}
              {activeFn === 'signum' && ' The line separates entirely into three strict, flat rules: positive, zero, and negative.'}
            </p>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2} 
              minDistance={3} 
              maxDistance={15} 
            />

            <CoordinateAxes />

            {/* DYNAMIC LINE SEGMENTS */}
            <group>
              {segments.map((xVal) => (
                <LineSegment key={xVal.toFixed(2)} x={xVal} activeFn={activeFn} />
              ))}
            </group>

          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}