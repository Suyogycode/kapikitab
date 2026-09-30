'use client';

import React, { useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type BoundaryType = 'strict' | 'slack';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function InfiniteClamp() {
  const [boundaryType, setBoundaryType] = useState<BoundaryType>('strict');
  const [testPointX, setTestPointX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const BOUNDARY_X = 3;

  // --- DRAG & REPULSION PHYSICS ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    calculatePosition(e.point.x);
  };

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      calculatePosition(e.point.x);
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  const calculatePosition = (cursorX: number) => {
    if (boundaryType === 'slack') {
      // Physical lock: Stops exactly at 3 (Solid Steel Bolt)[cite: 25]
      setTestPointX(Math.min(cursorX, BOUNDARY_X));
    } else {
      // Magnetic Repulsion (Strict Inequality)[cite: 25]
      // Uses an asymptotic function so as cursorX -> infinity, testPointX -> 3
      if (cursorX < BOUNDARY_X - 1) {
        setTestPointX(cursorX);
      } else {
        // e^(-(cursorX - 2)) creates the "infinitely close but never touching" feel
        const repelledX = BOUNDARY_X - Math.exp(-(cursorX - (BOUNDARY_X - 1)));
        setTestPointX(repelledX);
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Infinite Clamp</h2>
          <p className="text-stone-400 text-sm max-w-xl mb-4">
            Solve: <span className="font-mono text-emerald-400">3x - 2 &lt; 2x + 1</span> ⇒ <span className="font-mono text-emerald-400">x &lt; 3</span>[cite: 25]
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl min-w-[280px] pointer-events-auto">
          <div className="mb-4 flex justify-between items-center border-b border-stone-800 pb-2">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Boundary Type</span>
          </div>
          
          <div className="flex gap-2 font-mono text-sm">
            <button 
              onClick={() => { setBoundaryType('strict'); setTestPointX(0); }}
              className={`flex-1 py-2 rounded-lg transition-all border ${boundaryType === 'strict' ? 'bg-blue-900/50 text-blue-300 border-blue-500' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
            >
              Strict (&lt;)
            </button>
            <button 
              onClick={() => { setBoundaryType('slack'); setTestPointX(0); }}
              className={`flex-1 py-2 rounded-lg transition-all border ${boundaryType === 'slack' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
            >
              Slack (≤)
            </button>
          </div>

          <div className="mt-4 flex justify-between items-center text-stone-300 font-mono text-sm">
            <span>Test Point (x):</span>
            <span className={`font-bold ${testPointX === BOUNDARY_X ? 'text-emerald-400' : 'text-blue-400'}`}>
              {testPointX.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className={`bg-stone-900/95 border p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center transition-colors duration-500 shadow-2xl ${
          boundaryType === 'slack' ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)]'
        }`}>
          <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${boundaryType === 'slack' ? 'text-emerald-400' : 'text-blue-400'}`}>
            {boundaryType === 'slack' ? 'Physical Steel Bolt' : 'Repulsive Forcefield'}
          </p>
          <p className="text-stone-300 text-sm leading-relaxed">
            {boundaryType === 'slack' 
              ? 'The steel bolt penetrates the rod, acting as an inclusive dark circle. You can physically drag the test point until it hits exactly 3 and stops[cite: 25].' 
              : 'The magnetic forcefield acts as an exclusive open circle. If you try to drag into it, the point aggressively repels your cursor—getting infinitely close to 3, but never touching it[cite: 25].'}
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 5]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minDistance={3} 
              maxDistance={15}
              target={[0, 0, 0]}
            />

            {/* INVISIBLE CAPTURE PLANE for tracking mouse/stylus drags */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              visible={false}
            >
              <planeGeometry args={[50, 50]} />
              <meshBasicMaterial />
            </mesh>

            <group>
              {/* THE METALLIC ROD (Number Line)[cite: 25] */}
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 14, 32]} />
                <meshStandardMaterial color="#78716c" roughness={0.3} metalness={0.8} />
              </mesh>

              {/* TICK MARKS */}
              {[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((num) => (
                <group key={num} position={[num, 0, 0]}>
                  <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.05, 0.4, 0.05]} />
                    <meshStandardMaterial color="#a8a29e" />
                  </mesh>
                  <Billboard position={[0, -0.6, 0]}>
                    <Text fontSize={0.3} color="#a8a29e">{num.toString()}</Text>
                  </Billboard>
                </group>
              ))}

              {/* THE BOUNDARY CLAMP AT X = 3 */}
              <group position={[BOUNDARY_X, 0, 0]}>
                {boundaryType === 'slack' ? (
                  // Solid Steel Bolt (Slack Inequality)[cite: 25]
                  <mesh position={[0, 0.3, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 1, 32]} />
                    <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.9} />
                  </mesh>
                ) : (
                  // Repulsive Magnetic Forcefield (Strict Inequality)[cite: 25]
                  <mesh rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[0.4, 0.05, 16, 64]} />
                    <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} transparent opacity={0.8} />
                  </mesh>
                )}
                
                <Billboard position={[0, 1, 0]}>
                  <Text fontSize={0.4} color={boundaryType === 'slack' ? '#10b981' : '#3b82f6'}>
                    {boundaryType === 'slack' ? 'x ≤ 3' : 'x < 3'}
                  </Text>
                </Billboard>
              </group>

              {/* THE DRAGGABLE TEST POINT */}
              <mesh position={[testPointX, 0, 0]} pointerEvents="none">
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.5} />
              </mesh>

              {/* VISUAL SOLUTION HIGHLIGHT */}
              <mesh position={[(testPointX - 7) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.12, 0.12, testPointX + 7, 32]} />
                <meshStandardMaterial color="#f59e0b" transparent opacity={0.4} emissive="#f59e0b" emissiveIntensity={0.5} />
              </mesh>
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.5} far={10} position={[0, -2, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}