'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function OrthogonalSnapper() {
  const [m2, setM2] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // L1 is locked to a specific slope to act as the baseline
  const m1 = 0.5; 
  const targetOrthogonalM2 = -1 / m1; // -2.0

  // --- DRAG & MAGNETIC SNAP PHYSICS ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    calculateSlope(e.point.x, e.point.y);
  };

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      calculateSlope(e.point.x, e.point.y);
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  const calculateSlope = (x: number, y: number) => {
    // Avoid division by zero at the exact origin
    if (Math.abs(x) < 0.1) return;
    
    let rawM2 = y / x;

    // Magnetic Snap Logic[cite: 24]
    // If the user drags L2 close to the exact negative reciprocal, it locks in.
    if (Math.abs(rawM2 - targetOrthogonalM2) < 0.3) {
      rawM2 = targetOrthogonalM2;
    }

    // Limit extreme slopes to prevent visual breaking
    if (rawM2 > 10) rawM2 = 10;
    if (rawM2 < -10) rawM2 = -10;

    setM2(rawM2);
  };

  // --- LIVE MATH CALCULATIONS ---
  const denominator = 1 + m1 * m2;
  const isOrthogonal = Math.abs(denominator) < 0.001; // Accounting for floating point errors
  
  const thetaRad = isOrthogonal ? Math.PI / 2 : Math.atan(Math.abs((m2 - m1) / denominator));
  const thetaDeg = (thetaRad * 180) / Math.PI;

  const angle1Rad = Math.atan(m1);

  // Line coordinates extending outward from the origin
  const length = 15;
  const L1_Start: [number, number, number] = [-length, -length * m1, 0];
  const L1_End: [number, number, number] = [length, length * m1, 0];
  
  const L2_Start: [number, number, number] = [-length, -length * m2, 0];
  const L2_End: [number, number, number] = [length, length * m2, 0];

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Orthogonal Snapper</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Mechanics of perpendicular lines and the angle between them[cite: 24].
          </p>
        </div>

        {/* HUD TRACKER */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl min-w-[320px] pointer-events-auto">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Live Telemetry</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between items-center text-blue-400">
              <span>Slope L₁ (m₁):</span>
              <span className="font-bold">{m1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-pink-400">
              <span>Slope L₂ (m₂):</span>
              <span className="font-bold">{m2.toFixed(2)}</span>
            </div>
            
            <div className="my-1 border-t border-stone-800"></div>

            <div className="flex justify-between items-center text-stone-300">
              <span>Denominator (1 + m₁m₂):</span>
              <span className={`font-bold ${isOrthogonal ? 'text-emerald-400' : 'text-stone-300'}`}>
                {denominator.toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-stone-950 p-2.5 rounded-lg border border-stone-800 mt-1">
              <span className="text-stone-400">Angle (θ):</span>
              <span className={`font-bold text-lg ${isOrthogonal ? 'text-emerald-400' : 'text-white'}`}>
                {thetaDeg.toFixed(1)}°
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isOrthogonal ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Mechanical Lock Engaged</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            The denominator $(1 + m_1m_2)$ hits exactly zero, mathematically causing the tangent to become undefined (infinity)[cite: 24]. This perfectly aligns with a 90° vertical asymptote, visually locked by the rigid glowing square[cite: 24].
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-emerald-400">
            m₁m₂ = -1
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={false} 
              enablePan={true} 
              enableZoom={true} 
            />

            {/* INVISIBLE CAPTURE PLANE for tracking stylus/pointer drags */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              visible={false}
            >
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial />
            </mesh>

            <group>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[40, 40, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
              
              {/* X and Y Axes */}
              <Line points={[[-20, 0, -0.1], [20, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={1} />
              <Line points={[[0, -20, -0.1], [0, 20, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={1} />

              {/* L1: The Baseline (Blue) */}
              <Line points={[L1_Start, L1_End]} color="#3b82f6" lineWidth={4} />
              <Billboard position={[8, 8 * m1 + 0.8, 0]}>
                <Text fontSize={0.5} color="#60a5fa" fontWeight="bold">L₁</Text>
              </Billboard>

              {/* L2: The Draggable Line (Pink) */}
              <Line points={[L2_Start, L2_End]} color="#ec4899" lineWidth={5} />
              <Billboard position={[8, 8 * m2 - 0.8, 0]}>
                <Text fontSize={0.5} color="#f472b6" fontWeight="bold">L₂</Text>
              </Billboard>

              {/* THE INTERSECTION ORIGIN */}
              <mesh position={[0, 0, 0.1]}>
                <circleGeometry args={[0.3, 32]} />
                <meshStandardMaterial 
                  color={isOrthogonal ? "#10b981" : "#ffffff"} 
                  emissive={isOrthogonal ? "#10b981" : "#475569"} 
                  emissiveIntensity={isOrthogonal ? 2 : 0.5} 
                />
              </mesh>

              {/* THE RIGID 90-DEGREE LOCKING SQUARE[cite: 24] */}
              {isOrthogonal && (
                <group rotation={[0, 0, angle1Rad]} position={[0, 0, 0.1]}>
                  <Line 
                    points={[[0, 1.5, 0], [1.5, 1.5, 0], [1.5, 0, 0]] as [number, number, number][]} 
                    color="#10b981" 
                    lineWidth={4} 
                  />
                  {/* Subtle glow fill for the square */}
                  <mesh position={[0.75, 0.75, 0]}>
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.2} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              )}

              {/* DYNAMIC ANGLE ARC (Theta) */}
              {!isOrthogonal && (
                <group position={[0, 0, 0.05]}>
                  <mesh>
                    <ringGeometry args={[2, 2.1, 32, 1, Math.min(angle1Rad, Math.atan(m2)), Math.abs(Math.atan(m2) - angle1Rad)]} />
                    <meshBasicMaterial color="#fcd34d" side={THREE.DoubleSide} />
                  </mesh>
                  {/* Theta Label positioned inside the arc */}
                  <Billboard position={[
                    Math.cos((angle1Rad + Math.atan(m2)) / 2) * 2.8, 
                    Math.sin((angle1Rad + Math.atan(m2)) / 2) * 2.8, 
                    0
                  ]}>
                    <Text fontSize={0.5} color="#fcd34d" fontWeight="bold">θ</Text>
                  </Billboard>
                </group>
              )}

            </group>

            <ContactShadows frames={1} resolution={512} scale={30} blur={2} opacity={0.2} far={10} position={[0, 0, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}