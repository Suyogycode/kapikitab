'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, RoundedBox } from '@react-three/drei';

type Phase = 'broken' | 'built' | 'reacting' | 'fused';

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function CatalystScene({ phase }: { phase: Phase }) {
  const term1Ref = useRef<THREE.Group>(null);
  const term2Ref = useRef<THREE.Group>(null);
  const catalystRef = useRef<THREE.Group>(null);
  const fusedRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!term1Ref.current || !term2Ref.current || !catalystRef.current || !fusedRef.current) return;

    // Default target positions and opacities
    let t1Pos = new THREE.Vector3(-3, 0, 0);
    let t2Pos = new THREE.Vector3(3, 0, 0);
    let catPos = new THREE.Vector3(0, 5, 0);
    
    let t1Scale = 1;
    let t2Scale = 1;
    let catScale = phase === 'built' ? 1 : 0;
    let fusedScale = 0;

    let catOpacity = phase === 'built' ? 1 : 0;
    let termsOpacity = 1;
    let fusedOpacity = 0;

    // Animation Logic based on Phase
    if (phase === 'reacting') {
      // Catalyst drops down and splits into the terms[cite: 20]
      catPos.set(0, 1.5, 0);
      catScale = 1;
      catOpacity = 1;
    } else if (phase === 'fused') {
      // Terms magnetically snap together to the center[cite: 20]
      t1Pos.set(-0.5, 0, 0);
      t2Pos.set(0.5, 0, 0);
      t1Scale = 0;
      t2Scale = 0;
      catScale = 0;
      termsOpacity = 0;
      
      // The fused block appears[cite: 20]
      fusedScale = 1;
      fusedOpacity = 1;
    }

    // Apply Lerp Interpolations
    term1Ref.current.position.lerp(t1Pos, delta * 4);
    term2Ref.current.position.lerp(t2Pos, delta * 4);
    catalystRef.current.position.lerp(catPos, delta * 4);
    
    term1Ref.current.scale.setScalar(THREE.MathUtils.lerp(term1Ref.current.scale.x, t1Scale, delta * 5));
    term2Ref.current.scale.setScalar(THREE.MathUtils.lerp(term2Ref.current.scale.x, t2Scale, delta * 5));
    catalystRef.current.scale.setScalar(THREE.MathUtils.lerp(catalystRef.current.scale.x, catScale, delta * 5));
    fusedRef.current.scale.setScalar(THREE.MathUtils.lerp(fusedRef.current.scale.x, fusedScale, delta * 5));

    // Handle Opacities (requires casting materials)
    const t1Mat = (term1Ref.current.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    const t2Mat = (term2Ref.current.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    const catMat = (catalystRef.current.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    const fusedMat = (fusedRef.current.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;

    t1Mat.opacity = THREE.MathUtils.lerp(t1Mat.opacity, termsOpacity, delta * 5);
    t2Mat.opacity = THREE.MathUtils.lerp(t2Mat.opacity, termsOpacity, delta * 5);
    catMat.opacity = THREE.MathUtils.lerp(catMat.opacity, catOpacity, delta * 5);
    fusedMat.opacity = THREE.MathUtils.lerp(fusedMat.opacity, fusedOpacity, delta * 5);
  });

  return (
    <group position={[0, -1, 0]}>
      {/* Conveyor Belt / Assembly Line Platform[cite: 20] */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[12, 0.5, 4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
      </mesh>
      
      {/* Plus Sign (Visible before fusion) */}
      <Text position={[0, 0.5, 0]} fontSize={1.5} color="#64748b" visible={phase !== 'fused'}>
        +
      </Text>

      {/* TERM 1: dy/dx */}
      <group ref={term1Ref}>
        <RoundedBox args={[2.5, 2.5, 2.5]} radius={0.2} smoothness={4}>
          <meshStandardMaterial color="#3b82f6" transparent opacity={1} />
        </RoundedBox>
        <Text position={[0, 0, 1.3]} fontSize={0.8} color="#ffffff" fontWeight="bold">
          dy/dx
        </Text>
        {phase === 'reacting' && (
          <Text position={[0, 1.5, 1.3]} fontSize={0.5} color="#10b981" fontWeight="bold">
            * I.F.
          </Text>
        )}
      </group>

      {/* TERM 2: P * y */}
      <group ref={term2Ref}>
        <RoundedBox args={[2.5, 2.5, 2.5]} radius={0.2} smoothness={4}>
          <meshStandardMaterial color="#3b82f6" transparent opacity={1} />
        </RoundedBox>
        <Text position={[0, 0, 1.3]} fontSize={0.8} color="#ffffff" fontWeight="bold">
          P * y
        </Text>
        {phase === 'reacting' && (
          <Text position={[0, 1.5, 1.3]} fontSize={0.5} color="#10b981" fontWeight="bold">
            * I.F.
          </Text>
        )}
      </group>

      {/* CATALYST BLOCK: e^(Integral P dx)[cite: 20] */}
      <group ref={catalystRef}>
        <RoundedBox args={[4, 1.5, 1.5]} radius={0.2} smoothness={4}>
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} transparent opacity={0} />
        </RoundedBox>
        <Text position={[0, 0, 0.8]} fontSize={0.5} color="#ffffff" fontWeight="bold">
          I.F. = e^(Integral P dx)
        </Text>
      </group>

      {/* FUSED BLOCK: d/dx(y * I.F.)[cite: 20] */}
      <group ref={fusedRef}>
        <RoundedBox args={[6, 3, 3]} radius={0.3} smoothness={4}>
          <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={0.3} transparent opacity={0} />
        </RoundedBox>
        <Text position={[0, 0, 1.6]} fontSize={0.8} color="#ffffff" fontWeight="bold">
          d/dx (y * I.F.)
        </Text>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function IntegratingCatalyst() {
  const [phase, setPhase] = useState<Phase>('broken');

  const advanceSequence = () => {
    if (phase === 'broken') setPhase('built');
    else if (phase === 'built') setPhase('reacting');
    else if (phase === 'reacting') setPhase('fused');
    else setPhase('broken');
  };

  const isAhaMoment = phase === 'fused';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Integrating Catalyst</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Solve dy/dx + Py = Q by multiplying the equation by an Integrating Factor (I.F.)[cite: 20].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Assembly Line</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Step 1 */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'broken' ? 'border-red-500/50 bg-red-950/30 text-red-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">1. Disjointed Sum[cite: 20]</div>
              <div>dy/dx + Py</div>
              <div className="text-xs mt-1 opacity-80">Cannot be directly integrated.</div>
            </div>

            {/* Step 2 & 3 */}
            <div className={`p-3 rounded-lg border transition-colors ${(phase === 'built' || phase === 'reacting') ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">2. Catalyst Injection[cite: 20]</div>
              <div>I.F. * dy/dx + P * I.F. * y</div>
              <div className="text-xs mt-1 opacity-80">Multiplying block across all terms.</div>
            </div>

            {/* Step 4 */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'fused' ? 'border-purple-500/50 bg-purple-950/30 text-purple-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">3. Product Rule Fusion[cite: 20]</div>
              <div>d/dx (y * I.F.)</div>
              <div className="text-xs mt-1 opacity-80">Perfectly integrable derivative.</div>
            </div>

          </div>

          <button 
            onClick={advanceSequence}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${
              phase === 'broken' ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
              phase === 'built' ? 'bg-sky-600 border-sky-500 text-white hover:bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 
              phase === 'reacting' ? 'bg-purple-600 border-purple-500 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]' :
              'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {phase === 'broken' ? 'Build Catalyst Block' : 
             phase === 'built' ? 'Drop into Machine' : 
             phase === 'reacting' ? 'Force Chemical Fusion' : 'Reset Assembly Line'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(147,51,234,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Product Rule Fusion Completed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As the Integrating Factor swept through the left side, the messy sum chemically reacted. The parts magnetically snapped together, physically fusing into a single, clean Product Rule block[cite: 20].
          </p>
          <div className="inline-block bg-purple-950/50 px-6 py-2 rounded-lg border border-purple-900/50 font-mono text-base font-bold text-purple-300">
            The literal magic of the Integrating Factor: it exists solely to forcefully collapse a chaotic sum into a perfect, integrable derivative[cite: 20].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} />

            <CatalystScene phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}