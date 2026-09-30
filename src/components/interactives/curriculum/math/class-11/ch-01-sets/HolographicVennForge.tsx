'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';
import { Geometry, Base, Subtraction, Intersection, Addition } from '@react-three/csg';

type Operation = 'none' | 'intersection' | 'difference' | 'demorgan';

// ==================================================================
// 3D SET ENGINE
// ==================================================================
function Sets({ operation }: { operation: Operation }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Set positions
  const posA = new THREE.Vector3(-0.8, 0, 0);
  const posB = new THREE.Vector3(0.8, 0, 0);
  const posC = new THREE.Vector3(0, -1.2, 0.8);
  const radius = 1.4;

  // De Morgan Camera Animation
  useFrame((state, delta) => {
    if (operation === 'demorgan') {
      // Smoothly rotate the camera around the origin
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(state.clock.elapsedTime * 0.5) * 8, delta * 2);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, Math.cos(state.clock.elapsedTime * 0.5) * 8, delta * 2);
      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      
      {/* ================= UNIVERSAL SET (U) ================= */}
      {operation === 'demorgan' ? (
        // De Morgan's Proof: The cube glows EXCEPT the union (U - (A U B))
        <mesh>
          <Geometry>
            <Base>
              <boxGeometry args={[6, 6, 6]} />
            </Base>
            <Subtraction position={posA}>
              <sphereGeometry args={[radius, 32, 32]} />
            </Subtraction>
            <Subtraction position={posB}>
              <sphereGeometry args={[radius, 32, 32]} />
            </Subtraction>
          </Geometry>
          <meshStandardMaterial 
            color="#10b981" 
            transparent 
            opacity={0.3} 
            emissive="#10b981" 
            emissiveIntensity={0.5} 
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : (
        // Standard Universal Set (Faint Glass Cube)
        <mesh>
          <boxGeometry args={[6, 6, 6]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.05} depthWrite={false} side={THREE.BackSide} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(6, 6, 6)]} />
            <lineBasicMaterial color="#333333" />
          </lineSegments>
        </mesh>
      )}

      {/* ================= THE SETS ================= */}
      {operation === 'none' && (
        <>
          <mesh position={posA}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} roughness={0.1} />
          </mesh>
          <mesh position={posB}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.6} roughness={0.1} />
          </mesh>
          <mesh position={posC}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial color="#eab308" transparent opacity={0.4} roughness={0.1} />
          </mesh>
        </>
      )}

      {operation === 'intersection' && (
        <>
          {/* Glowing Neon Core (A ∩ B) */}
          <mesh>
            <Geometry>
              <Base position={posA}>
                <sphereGeometry args={[radius, 32, 32]} />
              </Base>
              <Intersection position={posB}>
                <sphereGeometry args={[radius, 32, 32]} />
              </Intersection>
            </Geometry>
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} roughness={0.2} />
          </mesh>

          {/* Wireframes of A and B */}
          <mesh position={posA}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.2} />
          </mesh>
          <mesh position={posB}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.2} />
          </mesh>
        </>
      )}

      {operation === 'difference' && (
        <>
          {/* A - B (Concave Bite) */}
          <mesh>
            <Geometry>
              <Base position={posA}>
                <sphereGeometry args={[radius, 32, 32]} />
              </Base>
              <Subtraction position={posB}>
                <sphereGeometry args={[radius, 32, 32]} />
              </Subtraction>
            </Geometry>
            <meshStandardMaterial color="#3b82f6" roughness={0.1} metalness={0.5} />
          </mesh>

          {/* Faint Wireframe of B to show what was subtracted */}
          <mesh position={posB}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.15} />
          </mesh>
        </>
      )}

      {/* Floating Labels */}
      {operation !== 'demorgan' && (
        <>
          <Text position={[-1.5, 1.8, 0]} fontSize={0.4} color="#60a5fa">A</Text>
          <Text position={[1.5, 1.8, 0]} fontSize={0.4} color="#f87171">B</Text>
          <Text position={[-2.8, 2.8, 2.8]} fontSize={0.4} color="#9ca3af">U</Text>
        </>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function HolographicVennForge() {
  const [operation, setOperation] = useState<Operation>('none');

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 pointer-events-auto bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-2xl font-serif text-white mb-2">The Holographic Venn Forge</h2>
        <p className="text-stone-400 text-sm mb-6 max-w-xl">
          Visualizing set operations through 3D constructive solid geometry.
        </p>
        
        {/* CONTROL PANEL */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setOperation('none')}
            className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
              operation === 'none' ? 'bg-stone-800 text-white border-stone-600' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
            }`}
          >
            Reset (U)
          </button>
          
          <button 
            onClick={() => setOperation('intersection')}
            className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
              operation === 'intersection' ? 'bg-purple-900/40 text-purple-300 border-purple-700' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
            }`}
          >
            A ∩ B (Intersection)
          </button>

          <button 
            onClick={() => setOperation('difference')}
            className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
              operation === 'difference' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
            }`}
          >
            A - B (Difference)
          </button>

          <button 
            onClick={() => setOperation('demorgan')}
            className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all flex items-center gap-2 ${
              operation === 'demorgan' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
            }`}
          >
            <span className="text-emerald-500">✨ Aha!</span> Proof: (A ∪ B)' = A' ∩ B'
          </button>
        </div>
      </div>

      {/* THE AHA MOMENT EXPLANATION */}
      {operation === 'demorgan' && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/90 border border-emerald-900/50 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">De Morgan's Laws Visualized</p>
            <p className="text-stone-300 text-sm leading-relaxed">
              The glowing volume represents everything outside of A and B. By taking a "bite" of A and B out of the Universal Cube, we prove that the complement of their Union <span className="font-mono text-emerald-300">(A ∪ B)'</span> is structurally identical to intersecting their individual complements <span className="font-mono text-emerald-300">A' ∩ B'</span>.
            </p>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={operation === 'demorgan' ? 0.2 : 0.6} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enablePan={false} 
              maxPolarAngle={Math.PI / 1.5} 
              minDistance={4} 
              maxDistance={15} 
            />

            <Sets operation={operation} />

          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}