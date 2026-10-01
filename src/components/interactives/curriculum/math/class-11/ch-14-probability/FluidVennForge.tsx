'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

type Phase = 'empty' | 'fillA' | 'fillB' | 'drain';

// ==================================================================
// ANIMATED FLUIDS COMPONENT (Must be inside Canvas)
// ==================================================================
function AnimatedFluids({ phase }: { phase: Phase }) {
  const liquidARef = useRef<THREE.Group>(null);
  const liquidBRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Group>(null);

  // Programmatically generate the exact Lens intersection shape[cite: 23]
  const lensShape = useMemo(() => {
    const shape = new THREE.Shape();
    const angle = Math.acos(1.2 / 2); // Intersection angle (1.2 offset, 2 radius)
    // Start at top intersection point (0, 1.6)
    shape.moveTo(0, 1.6);
    // Arc bounding from Set B's edge (left side of the lens)
    shape.absarc(1.2, 0, 2, Math.PI - angle, Math.PI + angle, false);
    // Arc bounding from Set A's edge (right side of the lens)
    shape.absarc(-1.2, 0, 2, -angle, angle, false);
    return shape;
  }, []);

  const extrudeSettings = { depth: 1, bevelEnabled: false, curveSegments: 32 };

  useFrame((_, delta) => {
    if (!liquidARef.current || !liquidBRef.current || !lensRef.current) return;

    let targetA = 0.001;
    let targetB = 0.001;
    let targetLens = 0.001;

    if (phase === 'fillA') {
      targetA = 1;
    } else if (phase === 'fillB') {
      targetA = 1;
      targetB = 1;
      targetLens = 2; // Double height in the intersection[cite: 23]
    } else if (phase === 'drain') {
      targetA = 1;
      targetB = 1;
      targetLens = 1; // Leveled plane[cite: 23]
    }

    // Smoothly animate fluid levels
    liquidARef.current.scale.y = THREE.MathUtils.lerp(liquidARef.current.scale.y, targetA, delta * 4);
    liquidBRef.current.scale.y = THREE.MathUtils.lerp(liquidBRef.current.scale.y, targetB, delta * 4);
    
    // Lens scales independently to show the double-fill and drain[cite: 23]
    lensRef.current.scale.z = THREE.MathUtils.lerp(lensRef.current.scale.z, targetLens, delta * 4);
  });

  return (
    <group>
      {/* WIREFRAME CONTAINERS */}
      <mesh position={[-1.2, 1.25, 0]}>
        <cylinderGeometry args={[2, 2, 2.5, 64]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
      </mesh>
      <Billboard position={[-2.5, 2.8, 0]}>
        <Text fontSize={0.6} color="#60a5fa" fontWeight="bold">Set A</Text>
      </Billboard>

      <mesh position={[1.2, 1.25, 0]}>
        <cylinderGeometry args={[2, 2, 2.5, 64]} />
        <meshBasicMaterial color="#eab308" wireframe transparent opacity={0.15} />
      </mesh>
      <Billboard position={[2.5, 2.8, 0]}>
        <Text fontSize={0.6} color="#facc15" fontWeight="bold">Set B</Text>
      </Billboard>

      {/* FLUID A (Blue)[cite: 23] */}
      <group position={[-1.2, 0, 0]} ref={liquidARef}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.98, 1.98, 1, 64]} />
          <meshPhysicalMaterial color="#3b82f6" transmission={0.9} opacity={1} roughness={0.1} />
        </mesh>
      </group>

      {/* FLUID B (Yellow)[cite: 23] */}
      <group position={[1.2, 0, 0]} ref={liquidBRef}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.98, 1.98, 1, 64]} />
          <meshPhysicalMaterial color="#eab308" transmission={0.9} opacity={1} roughness={0.1} />
        </mesh>
      </group>

      {/* FLUID INTERSECTION A ∩ B (Green Lens)[cite: 23] */}
      {/* Rotated to lay flat, Z-axis becomes upward Y-axis. Scaled slightly on X/Y to prevent Z-fighting */}
      <group rotation={[-Math.PI / 2, 0, 0]} ref={lensRef}>
        <mesh scale={[1.01, 1.01, 1]}>
          <extrudeGeometry args={[lensShape, extrudeSettings]} />
          <meshPhysicalMaterial color="#10b981" transmission={0.2} opacity={0.9} roughness={0.1} emissive="#059669" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Intersection Label */}
      {(phase === 'fillB' || phase === 'drain') && (
        <Billboard position={[0, (phase === 'fillB' ? 2.5 : 1.5), 0]}>
          <Text fontSize={0.5} color="#34d399" fontWeight="bold">A ∩ B</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function FluidVennForge() {
  const [phase, setPhase] = useState<Phase>('empty');

  const advanceSequence = () => {
    if (phase === 'empty') setPhase('fillA');
    else if (phase === 'fillA') setPhase('fillB');
    else if (phase === 'fillB') setPhase('drain');
    else setPhase('empty');
  };

  const isAhaMoment = phase === 'drain';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Fluid Venn Forge</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing the Addition Theorem to prevent double-counting in probability[cite: 23].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Fluid Dynamics Sequence</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'fillA' ? 'border-blue-500/50 bg-blue-950/30 text-blue-400' : 'border-stone-800 text-stone-500 bg-stone-950'}`}>
              <div className="font-bold mb-1">1. Add Probability of A</div>
              <div className="text-xs">Formula: $P(A)$</div>
            </div>
            
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'fillB' ? 'border-amber-500/50 bg-amber-950/30 text-amber-400' : 'border-stone-800 text-stone-500 bg-stone-950'}`}>
              <div className="font-bold mb-1">2. Add Probability of B</div>
              <div className="text-xs">Formula: $P(A) + P(B)$</div>
            </div>

            <div className={`p-3 rounded-lg border transition-colors ${phase === 'drain' ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400' : 'border-stone-800 text-stone-500 bg-stone-950'}`}>
              <div className="font-bold mb-1">3. Drain the Double-Counted Overlap</div>
              <div className="text-xs">Formula: $P(A) + P(B) - P(A \cap B)$[cite: 23]</div>
            </div>
          </div>

          <button 
            onClick={advanceSequence}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'drain' ? 'bg-stone-800 text-stone-500 border-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {phase === 'empty' ? 'Fill Set A (Blue)' : 
             phase === 'fillA' ? 'Fill Set B (Yellow)' : 
             phase === 'fillB' ? 'Drain Overlap to Level' : 'Empty Venn Diagram'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Mathematical Leveling</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Because the green intersection section was filled twice, its physical liquid level rose to double the height of the rest of the diagram[cite: 23]. 
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-4">
            To mathematically level the plane and accurately find $P(A \cup B)$, the engine physically drains exactly one layer of the green liquid[cite: 23]. 
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-lg font-bold text-emerald-400">
            $P(A \cup B) = P(A) + P(B) - P(A \cap B)$[cite: 23]
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 15, 10]} intensity={1.2} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} />

            <group position={[0, -1, 0]}>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[40, 40, "#334155", "#1e293b"]} rotation={[0, 0, 0]} position={[0, 0, 0]} />
              
              {/* Animated Fluids Wrapper */}
              <AnimatedFluids phase={phase} />
            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.3} far={10} position={[0, -1.1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}