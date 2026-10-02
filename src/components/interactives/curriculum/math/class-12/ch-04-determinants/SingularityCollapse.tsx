'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard, Line } from '@react-three/drei';

// ==================================================================
// 3D SCENE COMPONENT (Must be inside Canvas)
// ==================================================================
function SingularityScene({ detValue }: { detValue: number }) {
  const p1Ref = useRef<THREE.Group>(null);
  const p2Ref = useRef<THREE.Group>(null);
  const p3Ref = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!p1Ref.current || !p2Ref.current || !p3Ref.current || !orbRef.current) return;

    // The planes morph based on the determinant value[cite: 19].
    // At det = 1: They are orthogonal (intersecting perfectly at the origin).
    // At det = 0: They flatten and tilt into a parallel stack, destroying the intersection[cite: 19].

    // Plane 1 (Red)
    const p1TargetRotZ = detValue * (Math.PI / 2); // 90 degrees to 0 degrees
    const p1TargetPosY = (1 - detValue) * 2.5; // 0 to 2.5 (Stacks upward)
    p1Ref.current.rotation.z = THREE.MathUtils.lerp(p1Ref.current.rotation.z, p1TargetRotZ, delta * 5);
    p1Ref.current.position.y = THREE.MathUtils.lerp(p1Ref.current.position.y, p1TargetPosY, delta * 5);

    // Plane 2 (Green)
    const p2TargetRotX = detValue * (Math.PI / 2); // 90 degrees to 0 degrees
    p2Ref.current.rotation.x = THREE.MathUtils.lerp(p2Ref.current.rotation.x, p2TargetRotX, delta * 5);

    // Plane 3 (Blue) - Always flat, but moves downward to form the stack
    const p3TargetPosY = (1 - detValue) * -2.5; // 0 to -2.5 (Stacks downward)
    p3Ref.current.position.y = THREE.MathUtils.lerp(p3Ref.current.position.y, p3TargetPosY, delta * 5);

    // The Glowing Orb (Unique Solution)
    // Instant vanish when det = 0, otherwise scales with the determinant[cite: 19].
    const targetOrbScale = detValue === 0 ? 0 : 0.5 + (detValue * 0.5);
    orbRef.current.scale.setScalar(THREE.MathUtils.lerp(orbRef.current.scale.x, targetOrbScale, delta * 8));
  });

  return (
    <group>
      {/* Plane 1 (Red) */}
      <group ref={p1Ref}>
        <mesh>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#ef4444" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} roughness={0.1} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(10, 10)]} />
          <lineBasicMaterial color="#f87171" />
        </lineSegments>
      </group>

      {/* Plane 2 (Green) */}
      <group ref={p2Ref}>
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#10b981" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} roughness={0.1} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(10, 10)]} />
          <lineBasicMaterial color="#34d399" />
        </lineSegments>
      </group>

      {/* Plane 3 (Blue) */}
      <group ref={p3Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} roughness={0.1} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(10, 10)]} />
          <lineBasicMaterial color="#60a5fa" />
        </lineSegments>
      </group>

      {/* GLOWING ORB (Unique Intersection Point)[cite: 19] */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={1} />
        <Billboard position={[0, 1, 0]}>
          <Text fontSize={0.6} color="#fde68a" fontWeight="bold">
            {detValue > 0.01 ? "Unique Solution (X)" : ""}
          </Text>
        </Billboard>
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SingularityCollapse() {
  const [detValue, setDetValue] = useState<number>(1.0);

  const isCollapsed = detValue === 0;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Singularity Collapse</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            A system of linear equations AX = B is solved using X = A^(-1)B[cite: 19].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">System Engine</span>
            <span className={isCollapsed ? "text-red-400 font-mono text-xs font-bold" : "text-emerald-400 font-mono text-xs font-bold"}>
              |A| = {detValue.toFixed(2)}
            </span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className={`p-3 rounded-lg border transition-colors ${!isCollapsed ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Non-Singular Matrix</div>
              <div className="text-xs">|A| != 0. Unique solution exists[cite: 19].</div>
            </div>
            
            <div className={`p-3 rounded-lg border transition-colors ${isCollapsed ? 'border-red-500/50 bg-red-950/30 text-red-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Singular Matrix</div>
              <div className="text-xs">|A| = 0. No unique solution exists[cite: 19].</div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-sky-500/50 bg-sky-950/30">
            <div className="text-sky-400 font-bold mb-2">Determinant Control Slider</div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={detValue} 
              onChange={(e) => setDetValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="text-sky-200 text-xs mt-2 text-center">
              Drag the determinant down toward 0[cite: 19].
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isCollapsed ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-red-400 text-xs uppercase tracking-widest font-bold mb-2">3D Reality Collapsed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As the determinant approached 0, the three intersecting planes flattened and tilted. At the exact moment |A| = 0, the planes violently snapped into a parallel stack[cite: 19].
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The glowing orb instantly vanished[cite: 19]. 
          </p>
          <div className="inline-block bg-red-950/50 px-6 py-2 rounded-lg border border-red-900/50 font-mono text-base font-bold text-red-400">
            A "singular matrix" collapses 3D reality, destroying the unique intersection point and rendering the system impossible to solve[cite: 19].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [10, 8, 14], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <SingularityScene detValue={detValue} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -4, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}