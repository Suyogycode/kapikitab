'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function DimensionCollapser() {
  const [crank, setCrank] = useState<number>(0);
  
  // Base complex number z = 3 + 4i
  const x = 3;
  const y = 4;
  
  const r = Math.sqrt(x * x + y * y); // Modulus: 5
  const theta = Math.atan2(y, x); // Angle in radians
  const thetaDeg = (theta * 180) / Math.PI; // ~53.13 degrees

  // Calculate current animation state based on the crank (0 to 1)
  // Lengths multiply: r * r^t
  const currentR = r * Math.pow(r, crank); 
  // Angles add/cancel: sweeps towards 0
  const currentThetaZ = theta * (1 - crank);
  const currentThetaZBar = -theta * (1 - crank);

  // Calculate coordinates for the sweeping vectors
  const zX = currentR * Math.cos(currentThetaZ);
  const zY = currentR * Math.sin(currentThetaZ);
  
  const zBarX = currentR * Math.cos(currentThetaZBar);
  const zBarY = currentR * Math.sin(currentThetaZBar);

  const isAhaMoment = crank === 1;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-default">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Dimension Collapser</h2>
          <p className="text-stone-400 text-sm max-w-xl mb-4">
            Visualizing the identity <span className="font-mono text-emerald-400">z · z̄ = |z|²</span>[cite: 22].
          </p>
        </div>

        {/* MATH HUD */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl min-w-[280px] pointer-events-auto">
          <div className="mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Multiplication Crank</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={crank} 
              onChange={(e) => setCrank(parseFloat(e.target.value))}
              className="w-full h-2 mt-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm border-t border-stone-800 pt-3">
            <div className="flex justify-between items-center text-stone-300">
              <span>Lengths Multiply:</span>
              <span className="font-bold text-white">{(r).toFixed(1)} × {(Math.pow(r, crank)).toFixed(1)} = {currentR.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center text-stone-300">
              <span>Angles Add:</span>
              <span className="font-bold text-white">{thetaDeg.toFixed(1)}° + {(-thetaDeg * crank).toFixed(1)}° = {(thetaDeg * (1 - crank)).toFixed(1)}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Imaginary Annihilation</p>
            <p className="text-white text-base leading-relaxed">
              The rotational forces violently pull against each other as the vectors sweep across the plane[cite: 22]. They slam exactly flat onto the Real (X) axis, completely destroying the imaginary dimension and snapping perfectly onto the real number <span className="text-emerald-400 font-bold font-mono">25</span>[cite: 22].
            </p>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [12, 0, 30], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2} 
              minDistance={10} 
              maxDistance={50}
              target={[10, 0, 0]}
            />

            <group>
              {/* ARGAND PLANE AXES */}
              <Line points={[new THREE.Vector3(-5, 0, -0.1), new THREE.Vector3(30, 0, -0.1)]} color="#57534e" lineWidth={2} />
              <Line points={[new THREE.Vector3(0, -10, -0.1), new THREE.Vector3(0, 10, -0.1)]} color="#57534e" lineWidth={2} />
              
              <Text position={[28, -1.5, 0]} fontSize={0.8} color="#a8a29e" anchorX="center" anchorY="middle">Real (x)</Text>
              <Text position={[-2, 9, 0]} fontSize={0.8} color="#a8a29e" anchorX="center" anchorY="middle">Im (iy)</Text>

              {/* GRID TICKS */}
              {[5, 10, 15, 20, 25].map((num) => (
                <group key={`x-${num}`}>
                  <Line points={[new THREE.Vector3(num, -0.3, -0.1), new THREE.Vector3(num, 0.3, -0.1)]} color="#78716c" />
                  <Text position={[num, -1, 0]} fontSize={0.6} color="#78716c">{num.toString()}</Text>
                </group>
              ))}

              {/* SWEEPING VECTOR Z (Blue) */}
              <Line 
                points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(zX, zY, 0)]} 
                color="#3b82f6" 
                lineWidth={5} 
              />
              <mesh position={[zX, zY, 0.1]}>
                <circleGeometry args={[0.3, 32]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
              </mesh>
              <Text position={[zX, zY + 1.2, 0.2]} fontSize={0.8} color="#3b82f6">
                {isAhaMoment ? '|z|²' : 'z'}
              </Text>

              {/* SWEEPING VECTOR Z-BAR (Red) */}
              {!isAhaMoment && (
                <>
                  <Line 
                    points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(zBarX, zBarY, 0)]} 
                    color="#ef4444" 
                    lineWidth={5} 
                  />
                  <mesh position={[zBarX, zBarY, 0.1]}>
                    <circleGeometry args={[0.3, 32]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
                  </mesh>
                  <Text position={[zBarX, zBarY - 1.2, 0.2]} fontSize={0.8} color="#ef4444">
                    z̄
                  </Text>
                </>
              )}
              
              {/* AHA MOMENT GLOW at 25 */}
              {isAhaMoment && (
                <mesh position={[25, 0, -0.2]}>
                  <circleGeometry args={[2, 32]} />
                  <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
                </mesh>
              )}

            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.3} far={10} position={[10, -5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}