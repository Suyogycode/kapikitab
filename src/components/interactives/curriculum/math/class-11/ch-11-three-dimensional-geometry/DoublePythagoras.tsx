'use client';

import React, { useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function DoublePythagoras() {
  const [step, setStep] = useState<number>(0);

  // Fixed coordinates for the demonstration to ensure a clear bounding box
  // Math Coordinates (x, y, z)
  const pMath = { x: -4, y: -3, z: -2 };
  const qMath = { x: 4, y: 3, z: 4 };

  // Intermediate points to form the parallelepiped path (P -> A -> N -> Q)
  const aMath = { x: qMath.x, y: pMath.y, z: pMath.z };
  const nMath = { x: qMath.x, y: qMath.y, z: pMath.z };

  // Map Math (x, y, z) to Three.js (x, z, -y) for standard textbook orientation
  const P = new THREE.Vector3(pMath.x, pMath.z, -pMath.y);
  const A = new THREE.Vector3(aMath.x, aMath.z, -aMath.y);
  const N = new THREE.Vector3(nMath.x, nMath.z, -nMath.y);
  const Q = new THREE.Vector3(qMath.x, qMath.z, -qMath.y);

  const isAhaMoment = step === 4;

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
    else setStep(0);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Double Pythagoras</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Deriving the 3D Distance Formula inside a rectangular parallelepiped[cite: 25].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Theorem Sequence</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">Step {step}/4</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${step >= 1 ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              1. Laser Beam: Distance $PQ$[cite: 25]
            </div>
            <div className={`p-2 rounded border ${step >= 2 ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              2. Drop Perpendicular $QN$ & Base $PN$[cite: 25]
            </div>
            <div className={`p-2 rounded border ${step >= 3 ? 'border-red-500/50 text-red-400 bg-red-950/30' : 'border-stone-800 text-stone-600'}`}>
              3. Base Triangle Legs $PA$ & $AN$
            </div>
          </div>

          <button 
            onClick={handleNextStep}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${step === 4 ? 'bg-stone-800 text-stone-400 border-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {step === 0 ? 'Calculate Distance' : step === 4 ? 'Reset Engine' : 'Next Step'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Seamless 3D Expansion</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <div className="bg-stone-950 p-3 rounded-lg border border-red-900/50 text-red-300 font-mono text-sm">
              Base: $PN^2 = PA^2 + AN^2$
            </div>
            <div className="text-stone-500">+</div>
            <div className="bg-stone-950 p-3 rounded-lg border border-blue-900/50 text-blue-300 font-mono text-sm">
              Vertical: $PQ^2 = PN^2 + NQ^2$
            </div>
          </div>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            By physically substituting the horizontal base into the vertical triangle, the student watches the 2D theorem seamlessly expand into a third dimension[cite: 25].
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-white">
            $PQ^2 = PA^2 + AN^2 + NQ^2$[cite: 25]
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [15, 10, 20], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={10} 
              maxDistance={40}
              target={[0, 0, 0]}
            />

            <group>
              {/* THE 3D GRID BACKGROUND */}
              <gridHelper args={[40, 40, "#334155", "#1e293b"]} position={[0, P.y, 0]} />

              {/* POINTS P AND Q[cite: 25] */}
              <group position={P}>
                <mesh><sphereGeometry args={[0.3, 32, 32]} /><meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={0.8} /></mesh>
                <Billboard position={[-1.5, 0.8, 0]}><Text fontSize={0.6} color="#fcd34d" fontWeight="bold">P(x₁, y₁, z₁)</Text></Billboard>
              </group>

              <group position={Q}>
                <mesh><sphereGeometry args={[0.3, 32, 32]} /><meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={0.8} /></mesh>
                <Billboard position={[1.5, 0.8, 0]}><Text fontSize={0.6} color="#fcd34d" fontWeight="bold">Q(x₂, y₂, z₂)</Text></Billboard>
              </group>

              {/* STEP 1: RIGID LASER BEAM PQ[cite: 25] */}
              {step >= 1 && (
                <Line points={[P, Q]} color="#f59e0b" lineWidth={4} />
              )}

              {/* STEP 2: DROP PERPENDICULAR TO N & DRAW PN[cite: 25] */}
              {step >= 2 && (
                <group>
                  <group position={N}>
                    <mesh><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#60a5fa" /></mesh>
                    <Billboard position={[0, -0.6, 0]}><Text fontSize={0.5} color="#60a5fa" fontWeight="bold">N</Text></Billboard>
                  </group>
                  <Line points={[Q, N]} color="#3b82f6" lineWidth={3} dashed dashScale={2} />
                  <Line points={[P, N]} color="#22c55e" lineWidth={3} />
                  
                  {/* Right Angle Symbol at N for vertical triangle */}
                  <group position={N}>
                    <Line points={[[0, 0.5, 0], [-0.5, 0.5, 0], [-0.5, 0, 0]] as [number, number, number][]} color="#3b82f6" lineWidth={2} />
                  </group>
                </group>
              )}

              {/* STEP 3: BASE TRIANGLE LEGS PA & AN */}
              {step >= 3 && (
                <group>
                  <group position={A}>
                    <mesh><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
                    <Billboard position={[0, -0.6, 0]}><Text fontSize={0.5} color="#ef4444" fontWeight="bold">A</Text></Billboard>
                  </group>
                  <Line points={[P, A]} color="#ef4444" lineWidth={3} />
                  <Line points={[A, N]} color="#ef4444" lineWidth={3} />

                  {/* Right Angle Symbol at A for base triangle */}
                  <group position={A}>
                    <Line points={[[-0.5, 0, 0], [-0.5, 0, -0.5], [0, 0, -0.5]] as [number, number, number][]} color="#ef4444" lineWidth={2} />
                  </group>
                </group>
              )}

              {/* STEP 4: ENCLOSING PARALLELEPIPED[cite: 25] */}
              {step >= 4 && (
                <group>
                  <Line points={[P, new THREE.Vector3(pMath.x, qMath.z, -pMath.y)]} color="#475569" dashed dashScale={2} />
                  <Line points={[new THREE.Vector3(pMath.x, qMath.z, -pMath.y), new THREE.Vector3(qMath.x, qMath.z, -pMath.y)]} color="#475569" dashed dashScale={2} />
                  <Line points={[new THREE.Vector3(qMath.x, qMath.z, -pMath.y), Q]} color="#475569" dashed dashScale={2} />
                  <Line points={[new THREE.Vector3(pMath.x, qMath.z, -pMath.y), new THREE.Vector3(pMath.x, qMath.z, -qMath.y)]} color="#475569" dashed dashScale={2} />
                  <Line points={[new THREE.Vector3(pMath.x, qMath.z, -qMath.y), Q]} color="#475569" dashed dashScale={2} />
                  <Line points={[new THREE.Vector3(pMath.x, pMath.z, -qMath.y), N]} color="#475569" dashed dashScale={2} />
                  <Line points={[new THREE.Vector3(pMath.x, pMath.z, -qMath.y), P]} color="#475569" dashed dashScale={2} />
                  <Line points={[new THREE.Vector3(pMath.x, pMath.z, -qMath.y), new THREE.Vector3(pMath.x, qMath.z, -qMath.y)]} color="#475569" dashed dashScale={2} />
                  <Line points={[A, new THREE.Vector3(qMath.x, qMath.z, -pMath.y)]} color="#475569" dashed dashScale={2} />
                  
                  {/* Highlight Base Plane */}
                  <mesh position={[(pMath.x + qMath.x)/2, pMath.z, -(pMath.y + qMath.y)/2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[Math.abs(qMath.x - pMath.x), Math.abs(qMath.y - pMath.y)]} />
                    <meshBasicMaterial color="#ef4444" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
                  </mesh>
                </group>
              )}
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.4} far={20} position={[0, -5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}