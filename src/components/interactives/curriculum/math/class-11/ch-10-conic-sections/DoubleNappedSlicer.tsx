'use client';

import React, { useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// 2D PROJECTION SVG COMPONENT
// ==================================================================
function Projection2D({ conicType }: { conicType: string }) {
  return (
    <div className="w-full h-40 bg-stone-950 border border-stone-800 rounded-lg mt-4 flex items-center justify-center relative overflow-hidden">
      <span className="absolute top-2 left-2 text-[10px] text-stone-500 uppercase tracking-widest font-bold">Live 2D Projection[cite: 20]</span>
      <svg width="120" height="120" viewBox="0 0 100 100" className="opacity-90">
        {conicType === 'Circle' && (
          <circle cx="50" cy="50" r="30" fill="none" stroke="#10b981" strokeWidth="4" />
        )}
        {conicType === 'Ellipse' && (
          <ellipse cx="50" cy="50" rx="40" ry="22" fill="none" stroke="#3b82f6" strokeWidth="4" transform="rotate(-15 50 50)" />
        )}
        {conicType === 'Parabola' && (
          <path d="M 20 90 Q 50 10 80 90" fill="none" stroke="#f59e0b" strokeWidth="4" />
        )}
        {conicType === 'Hyperbola' && (
          <>
            <path d="M 20 10 Q 50 45 80 10" fill="none" stroke="#ef4444" strokeWidth="4" />
            <path d="M 20 90 Q 50 55 80 90" fill="none" stroke="#ef4444" strokeWidth="4" />
          </>
        )}
      </svg>
    </div>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function DoubleNappedSlicer() {
  // beta is the angle of the plane relative to the vertical axis[cite: 20]
  const [beta, setBeta] = useState<number>(90); 
  
  // Generator angle of the cone (radius = 4, height = 4 => slope = 1 => 45 degrees)
  const ALPHA = 45; 

  // Determine Conic Type[cite: 20]
  let conicType = 'Circle';
  let color = '#10b981';
  
  if (beta === 90) {
    conicType = 'Circle';
    color = '#10b981';
  } else if (beta > ALPHA) {
    conicType = 'Ellipse';
    color = '#3b82f6';
  } else if (beta === ALPHA) {
    conicType = 'Parabola';
    color = '#f59e0b';
  } else if (beta < ALPHA) {
    conicType = 'Hyperbola';
    color = '#ef4444';
  }

  const isAhaMoment = beta <= ALPHA;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Double-Napped Slicer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Conic sections are curves obtained by intersecting a right circular cone with a plane[cite: 20].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Slicer Telemetry</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">α = {ALPHA}°</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-300 font-mono text-sm">Plane Angle (β)</span>
              <span className="font-bold text-white font-mono">{beta}°</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="90" 
              step="1" 
              value={beta} 
              onChange={(e) => setBeta(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center bg-stone-950 p-3 rounded-lg border border-stone-800">
            <span className="text-stone-400 text-sm font-mono">Resulting Curve:</span>
            <span className="font-bold text-lg" style={{ color }}>{conicType}</span>
          </div>

          <Projection2D conicType={conicType} />
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-500" style={{ borderColor: color }}>
            <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color }}>Infinite Intersection</p>
            {beta === ALPHA ? (
              <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
                When β exactly matches the cone's generator angle α, the intersection snaps into an infinite parabola[cite: 20]. The plane cuts parallel to the side of the cone.
              </p>
            ) : (
              <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
                Tilting it further (0 ≤ β &lt; α) causes the plane to strike both the upper and lower nappes simultaneously, instantly revealing the two distinct branches of a hyperbola[cite: 20].
              </p>
            )}
            <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-sm font-bold text-white">
              It proves these distinct 2D curves all share the exact same 3D origin[cite: 20].
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [10, 4, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.2} 
              minDistance={10} 
              maxDistance={35}
              target={[0, 0, 0]}
            />

            <group>
              {/* UPPER NAPPE */}
              <group position={[0, 2, 0]}>
                <mesh>
                  <coneGeometry args={[4, 4, 64]} />
                  <meshPhysicalMaterial 
                    color="#475569" 
                    transmission={0.9} 
                    opacity={1} 
                    roughness={0.1} 
                    side={THREE.DoubleSide} 
                    transparent 
                  />
                </mesh>
                
                {/* Generator Angle Line (Alpha) */}
                <Line 
                  points={[[0, 2, 0], [4, -2, 0]] as [number, number, number][]} 
                  color="#10b981" 
                  dashed 
                  dashScale={4} 
                  lineWidth={2} 
                />
                <Billboard position={[2.5, 0, 0]}>
                  <Text fontSize={0.4} color="#10b981" fontWeight="bold">α = 45°</Text>
                </Billboard>
              </group>

              {/* LOWER NAPPE */}
              <group position={[0, -2, 0]} rotation={[Math.PI, 0, 0]}>
                <mesh>
                  <coneGeometry args={[4, 4, 64]} />
                  <meshPhysicalMaterial 
                    color="#475569" 
                    transmission={0.9} 
                    opacity={1} 
                    roughness={0.1} 
                    side={THREE.DoubleSide} 
                    transparent 
                  />
                </mesh>
              </group>

              {/* THE SLICING PLANE */}
              {/* Pivot is offset to [0, 1.5, 1] to ensure distinct, non-degenerate curves for all angles */}
              <group position={[0, 1.5, 1]} rotation={[(90 - beta) * (Math.PI / 180), 0, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[14, 14]} />
                  <meshStandardMaterial 
                    color={color} 
                    emissive={color} 
                    emissiveIntensity={0.2} 
                    transparent 
                    opacity={0.6} 
                    side={THREE.DoubleSide} 
                  />
                </mesh>
                
                {/* Visual frame for the glass plane */}
                <Line 
                  points={[
                    [-7, 0, -7], [7, 0, -7], [7, 0, 7], [-7, 0, 7], [-7, 0, -7]
                  ] as [number, number, number][]} 
                  color={color} 
                  lineWidth={2} 
                />
              </group>
            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.3} far={10} position={[0, -4.5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}