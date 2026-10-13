'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard, Box } from '@react-three/drei';

type Phase = 'idle' | 'finding' | 'aha_moment';

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function BridgeScene({ phase }: { phase: Phase }) {
  // Pre-calculated Math for Skew Lines
  // Line 1: r = a1 + t*b1 -> a1=(0, 2, 0), b1=(1, 0, 1)
  // Line 2: r = a2 + s*b2 -> a2=(0, -2, 2), b2=(1, 1, 0)
  
  const a1 = useMemo(() => new THREE.Vector3(0, 2, 0), []);
  const b1 = useMemo(() => new THREE.Vector3(1, 0, 1), []);
  
  const a2 = useMemo(() => new THREE.Vector3(0, -2, 2), []);
  const b2 = useMemo(() => new THREE.Vector3(1, 1, 0), []);

  // Exact coordinates of minimum separation (calculated via vector projection)
  const p1 = useMemo(() => new THREE.Vector3(8/3, 2, 8/3), []);
  const p2 = useMemo(() => new THREE.Vector3(10/3, 4/3, 2), []);

  // Strut References
  const strutRef = useRef<THREE.Mesh>(null);
  const rightAngle1Ref = useRef<THREE.Group>(null);
  const rightAngle2Ref = useRef<THREE.Group>(null);

  // Line points for visual rendering (extending far in both directions)
  const line1Points = useMemo(() => {
    return [
      a1.clone().add(b1.clone().multiplyScalar(-10)).toArray(),
      a1.clone().add(b1.clone().multiplyScalar(10)).toArray()
    ] as [number, number, number][];
  }, [a1, b1]);

  const line2Points = useMemo(() => {
    return [
      a2.clone().add(b2.clone().multiplyScalar(-10)).toArray(),
      a2.clone().add(b2.clone().multiplyScalar(10)).toArray()
    ] as [number, number, number][];
  }, [a2, b2]);

  useFrame((_, delta) => {
    // Animate the strut
    if (strutRef.current) {
      const targetOpacity = phase !== 'idle' ? 0.9 : 0;
      const mat = strutRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 4);
      strutRef.current.visible = mat.opacity > 0.01;
    }

    // Animate the right angle indicators[cite: 22]
    if (rightAngle1Ref.current && rightAngle2Ref.current) {
      const targetScale = phase === 'aha_moment' ? 1 : 0;
      rightAngle1Ref.current.scale.setScalar(THREE.MathUtils.lerp(rightAngle1Ref.current.scale.x, targetScale, delta * 5));
      rightAngle2Ref.current.scale.setScalar(THREE.MathUtils.lerp(rightAngle2Ref.current.scale.x, targetScale, delta * 5));
    }
  });

  // Calculate orientation for the strut cylinder
  const strutDistance = p1.distanceTo(p2);
  const strutCenter = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const strutQuaternion = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  }, [p1, p2]);

  return (
    <group position={[-1, 0, -1]}>
      {/* Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} position={[0, -5, 0]} />

      {/* Line 1 (L1)[cite: 22] */}
      <group>
        <Line points={line1Points} color="#3b82f6" lineWidth={5} />
        <Billboard position={a1.clone().add(new THREE.Vector3(0, 0.5, 0))}>
          <Text fontSize={0.6} color="#3b82f6" fontWeight="bold">Line 1</Text>
        </Billboard>
      </group>

      {/* Line 2 (L2)[cite: 22] */}
      <group>
        <Line points={line2Points} color="#ef4444" lineWidth={5} />
        <Billboard position={a2.clone().add(new THREE.Vector3(0, 0.5, 0))}>
          <Text fontSize={0.6} color="#ef4444" fontWeight="bold">Line 2</Text>
        </Billboard>
      </group>

      {/* The Glowing Green Skew Bridge (Shortest Distance Strut)[cite: 22] */}
      <mesh ref={strutRef} position={strutCenter} quaternion={strutQuaternion}>
        <cylinderGeometry args={[0.08, 0.08, strutDistance, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1} transparent opacity={0} />
      </mesh>

      {/* Right Angle Indicators[cite: 22] */}
      <group ref={rightAngle1Ref} position={p1}>
        <Box args={[0.3, 0.3, 0.05]} position={[-0.15, -0.15, 0]} rotation={[0, Math.PI/4, 0]}>
          <meshBasicMaterial color="#fcd34d" transparent opacity={0.8} />
        </Box>
      </group>
      
      <group ref={rightAngle2Ref} position={p2}>
        <Box args={[0.3, 0.3, 0.05]} position={[0.15, 0.15, 0]} rotation={[Math.PI/2, Math.PI/4, 0]}>
          <meshBasicMaterial color="#fcd34d" transparent opacity={0.8} />
        </Box>
      </group>

      {/* AHA Moment Labels */}
      {phase === 'aha_moment' && (
        <Billboard position={strutCenter.clone().add(new THREE.Vector3(0, 0.5, 0))}>
          <Text fontSize={0.4} color="#10b981" fontWeight="bold">d = 1.15 units</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SkewBridge() {
  const [phase, setPhase] = useState<Phase>('idle');

  const advanceSequence = () => {
    if (phase === 'idle') setPhase('finding');
    else if (phase === 'finding') setPhase('aha_moment');
    else setPhase('idle');
  };

  const isAhaMoment = phase === 'aha_moment';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Skew-Bridge</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Finding the shortest distance requires constructing a mutually perpendicular line segment[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Formula Breakdown</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Base Lines */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'idle' ? 'border-sky-500/50 bg-sky-950/30 text-sky-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Vector Equations</div>
              <div>L1: r = a1 + λb1</div>
              <div>L2: r = a2 + μb2</div>
            </div>

            {/* Formula Components[cite: 22] */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'finding' ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Cross Product Vector</div>
              <div>Normal (n) = b1 x b2</div>
              <div className="text-xs mt-1 opacity-80">Defines the perpendicular direction.</div>
            </div>

            {/* Shortest Distance Calculation */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'aha_moment' ? 'border-amber-500/50 bg-amber-950/30 text-amber-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Shortest Distance (d)</div>
              <div className="py-1">
                <span className="border-b border-amber-500/50 pb-1 block w-max">| (b1 x b2) · (a2 - a1) |</span>
                <span className="pt-1 block w-max text-center">| b1 x b2 |</span>
              </div>
              <div className="text-xs mt-2 opacity-80 font-bold">d ≈ 1.15 units</div>
            </div>

          </div>

          <button 
            onClick={advanceSequence}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${
              phase === 'idle' ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
              phase === 'finding' ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 
              'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {phase === 'idle' ? 'Find Shortest Distance' : 
             phase === 'finding' ? 'Verify Perpendicularity' : 
             'Reset Space'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Mutually Perpendicular Confirmed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The engine highlighted a right-angle indicator where the strut meets both lines, proving it is mutually perpendicular to both[cite: 22].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-sm font-bold text-amber-300">
            The scalar triple product computes the height of the parallelepiped formed by the lines, giving the exact distance[cite: 22].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [6, 4, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <BridgeScene phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -5.1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}