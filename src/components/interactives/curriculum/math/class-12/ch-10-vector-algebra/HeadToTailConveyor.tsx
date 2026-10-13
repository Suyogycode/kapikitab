'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'floating' | 'triangle' | 'parallelogram';

// ==================================================================
// CUSTOM VECTOR ARROW COMPONENT
// ==================================================================
function VectorArrow({ 
  start, 
  end, 
  color, 
  label,
  isDashed = false,
  opacity = 1
}: { 
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  color: string, 
  label?: string,
  isDashed?: boolean,
  opacity?: number
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Calculate length and rotation dynamically
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    // Smoothly animate the group's position
    groupRef.current.position.lerp(start, delta * 8);

    // Set rotation to point towards the end
    const axis = new THREE.Vector3(0, 1, 0); // Default cylinder is along Y
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());
    groupRef.current.quaternion.slerp(quaternion, delta * 8);

    // Scale the arrow body based on length (reserving space for the arrowhead)
    const bodyRef = groupRef.current.children[0] as THREE.Mesh;
    const headRef = groupRef.current.children[1] as THREE.Mesh;
    
    const headLength = 0.4;
    const bodyLength = Math.max(0.01, length - headLength);
    
    // The cylinder center needs to be shifted by half its length
    bodyRef.scale.y = THREE.MathUtils.lerp(bodyRef.scale.y, bodyLength, delta * 8);
    bodyRef.position.y = bodyRef.scale.y / 2;
    
    // Position the arrowhead at the end of the body
    headRef.position.y = bodyRef.scale.y + (headLength / 2);
  });

  return (
    <group ref={groupRef}>
      {/* Arrow Body */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Arrow Head */}
      <mesh>
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Label */}
      {label && (
        <Billboard position={[0, 0, 0.5]}>
          <Text fontSize={0.4} color={color} fontWeight="bold">{label}</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function ConveyorScene({ phase }: { phase: Phase }) {
  // Define core vector values
  const vecA = useMemo(() => new THREE.Vector3(3, 4, 0), []);
  const vecB = useMemo(() => new THREE.Vector3(4, -1, 0), []);
  const vecResultant = useMemo(() => new THREE.Vector3().addVectors(vecA, vecB), [vecA, vecB]);

  // Target positions for Vector B based on Phase
  const bStart = useRef(new THREE.Vector3(1, -4, 0)); // Floating initially
  const bEnd = useRef(new THREE.Vector3().addVectors(bStart.current, vecB));
  
  // Opacities
  const resultantOpacity = useRef(0);
  const dashedOpacity = useRef(0);

  useFrame((_, delta) => {
    // Vector B Targets
    let targetBStart = new THREE.Vector3(1, -4, 0); // Floating phase
    
    if (phase === 'triangle') {
      targetBStart = vecA.clone(); // Head-to-Tail[cite: 21]
    } else if (phase === 'parallelogram') {
      targetBStart = new THREE.Vector3(0, 0, 0); // Co-initial point[cite: 21]
    }

    bStart.current.lerp(targetBStart, delta * 6);
    bEnd.current.copy(bStart.current).add(vecB);

    // Opacity Targets
    const targetResultantOpacity = phase !== 'floating' ? 1 : 0;
    const targetDashedOpacity = phase === 'parallelogram' ? 0.4 : 0;
    
    resultantOpacity.current = THREE.MathUtils.lerp(resultantOpacity.current, targetResultantOpacity, delta * 5);
    dashedOpacity.current = THREE.MathUtils.lerp(dashedOpacity.current, targetDashedOpacity, delta * 5);
  });

  return (
    <group position={[-3, -1, 0]}>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[3, 1, -0.6]} />
      <Line points={[[-10, 0, -0.1], [15, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      <Line points={[[0, -10, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      
      {/* Origin Point A */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color="#ffffff" />
        <Billboard position={[-0.4, -0.4, 0]}><Text fontSize={0.5} color="#ffffff">A</Text></Billboard>
      </mesh>

      {/* Vector a (Always anchored at origin) */}
      <VectorArrow start={new THREE.Vector3(0,0,0)} end={vecA} color="#3b82f6" label="Vector a" />

      {/* Vector b (Drags and Snaps)[cite: 21] */}
      <VectorArrow start={bStart.current} end={bEnd.current} color="#10b981" label="Vector b" />

      {/* Resultant Vector a + b (Materializes instantly)[cite: 21] */}
      {resultantOpacity.current > 0.01 && (
        <VectorArrow 
          start={new THREE.Vector3(0,0,0)} 
          end={vecResultant} 
          color="#f59e0b" 
          label="a + b" 
          opacity={resultantOpacity.current} 
        />
      )}

      {/* Parallelogram Dashed Projections[cite: 21] */}
      {dashedOpacity.current > 0.01 && (
        <group>
          {/* Dashed b starting from tip of a */}
          <Line 
            points={[vecA.toArray(), vecResultant.toArray()] as [number, number, number][]} 
            color="#10b981" 
            lineWidth={2} 
            dashed dashScale={4}
            transparent opacity={dashedOpacity.current} 
          />
          {/* Dashed a starting from tip of b */}
          <Line 
            points={[vecB.toArray(), vecResultant.toArray()] as [number, number, number][]} 
            color="#3b82f6" 
            lineWidth={2} 
            dashed dashScale={4}
            transparent opacity={dashedOpacity.current} 
          />
        </group>
      )}

      {/* Terminal Points for AHA Moment */}
      {phase !== 'floating' && (
        <group>
          {/* Point B (Tip of a) */}
          <mesh position={vecA}>
            <sphereGeometry args={[0.15]} />
            <meshBasicMaterial color="#ffffff" />
            <Billboard position={[-0.4, 0.4, 0]}><Text fontSize={0.5} color="#ffffff">B</Text></Billboard>
          </mesh>
          {/* Point C (Tip of resultant) */}
          <mesh position={vecResultant}>
            <sphereGeometry args={[0.15]} />
            <meshBasicMaterial color="#ffffff" />
            <Billboard position={[0.4, 0.4, 0]}><Text fontSize={0.5} color="#ffffff">C</Text></Billboard>
          </mesh>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function HeadToTailConveyor() {
  const [phase, setPhase] = useState<Phase>('floating');

  const isAhaMoment = phase === 'triangle' || phase === 'parallelogram';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Head-to-Tail Conveyor</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Vectors combine based on their direction and magnitude using the Triangle Law (AB + BC = AC)[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Vector Addition</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'floating' ? 'border-sky-500/50 bg-sky-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between mb-1">
                <span className="text-stone-300 font-bold">Vector a</span>
                <span className="text-sky-400">3i + 4j</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-300 font-bold">Vector b</span>
                <span className="text-emerald-400">4i - 1j</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border transition-colors ${phase === 'triangle' ? 'border-amber-500/50 bg-amber-950/30 text-amber-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Triangle Law (Head-to-Tail)[cite: 21]</div>
              <div>AB + BC = AC</div>
              <div className="text-xs mt-1 opacity-80">Initial point of b snaps to terminal point of a.</div>
            </div>

            <div className={`p-3 rounded-lg border transition-colors ${phase === 'parallelogram' ? 'border-purple-500/50 bg-purple-950/30 text-purple-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Parallelogram Law[cite: 21]</div>
              <div>Resultant Diagonal</div>
              <div className="text-xs mt-1 opacity-80">Vectors share a coinitial point.</div>
            </div>

          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setPhase('floating')}
              className={`w-full py-2 rounded border font-bold text-xs tracking-widest uppercase transition-all ${phase === 'floating' ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-800 border-stone-700 text-stone-400 hover:bg-stone-700'}`}
            >
              Reset Space
            </button>
            <button 
              onClick={() => setPhase('triangle')}
              className={`w-full py-2.5 rounded-lg border font-bold text-sm tracking-widest uppercase transition-all ${phase === 'triangle' ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-stone-800 border-stone-700 text-amber-500 hover:bg-stone-700'}`}
            >
              Snap Triangle Law
            </button>
            <button 
              onClick={() => setPhase('parallelogram')}
              className={`w-full py-2.5 rounded-lg border font-bold text-sm tracking-widest uppercase transition-all ${phase === 'parallelogram' ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-stone-800 border-stone-700 text-purple-500 hover:bg-stone-700'}`}
            >
              Show Parallelogram
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Equivalence Verified</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Moving from A to B and then B to C yields the exact same net displacement as going straight from A to C[cite: 21].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-sm font-bold text-amber-300">
            The geometric equivalence of the triangle and parallelogram laws becomes an undeniable physical reality[cite: 21].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <ConveyorScene phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}