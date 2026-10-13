'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'forward' | 'dropped' | 'reverse' | 'aha_moment';

// ==================================================================
// MATH DATA (Factory Defective Parts Scenario)[cite: 28]
// ==================================================================
const CAUSES = [
  { id: 'E1', name: 'Machine 1', pE: 0.3, pA_given_E: 0.05, pos: [-5, 4, 0], color: '#3b82f6' }, // Blue
  { id: 'E2', name: 'Machine 2', pE: 0.5, pA_given_E: 0.02, pos: [0, 4, 0], color: '#10b981' },  // Green
  { id: 'E3', name: 'Machine 3', pE: 0.2, pA_given_E: 0.04, pos: [5, 4, 0], color: '#f59e0b' },  // Amber
];

const NODE_A_POS = [0, -3, 0];
// Total P(A) = Sum( P(E_i) * P(A|E_i) )
const TOTAL_P_A = CAUSES.reduce((sum, c) => sum + (c.pE * c.pA_given_E), 0);
const TARGET_CAUSE = CAUSES[0]; // We will trace back to E1 for the AHA moment
const TARGET_REVERSE_P = (TARGET_CAUSE.pE * TARGET_CAUSE.pA_given_E) / TOTAL_P_A;

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function BayesScene({ phase }: { phase: Phase }) {
  const particleRefs = useRef<(THREE.Group | null)[]>([]);
  const dropParticleRef = useRef<THREE.Group>(null);
  
  // Trace Progress (0 to 1)
  const traceProgress = useRef(0);
  const dropProgress = useRef(0);

  useFrame((_, delta) => {
    // 1. Drop Particle Animation[cite: 28]
    if (dropParticleRef.current) {
      if (phase === 'dropped' || phase === 'reverse' || phase === 'aha_moment') {
        dropProgress.current = THREE.MathUtils.lerp(dropProgress.current, 1, delta * 5);
      } else {
        dropProgress.current = 0;
      }
      
      const startY = 2;
      const endY = NODE_A_POS[1];
      dropParticleRef.current.position.set(NODE_A_POS[0], THREE.MathUtils.lerp(startY, endY, dropProgress.current), 0);
      dropParticleRef.current.visible = dropProgress.current > 0.01;
      
      const mat = (dropParticleRef.current.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = phase === 'reverse' || phase === 'aha_moment' ? 0 : 1; // Hide when splitting
    }

    // 2. Reverse Flow Animation[cite: 28]
    if (phase === 'reverse' || phase === 'aha_moment') {
      traceProgress.current = THREE.MathUtils.lerp(traceProgress.current, 1, delta * 3);
    } else {
      traceProgress.current = 0;
    }

    CAUSES.forEach((cause, i) => {
      const pGroup = particleRefs.current[i];
      if (!pGroup) return;

      const pStart = new THREE.Vector3(...NODE_A_POS);
      const pEnd = new THREE.Vector3(...cause.pos);
      
      pGroup.position.copy(pStart).lerp(pEnd, traceProgress.current);
      
      const mat = (pGroup.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      
      // Aha moment dims non-target paths[cite: 28]
      if (phase === 'aha_moment') {
        mat.opacity = cause.id === TARGET_CAUSE.id ? 1 : 0.1;
      } else {
        mat.opacity = traceProgress.current > 0.01 ? 1 : 0;
      }
      pGroup.visible = mat.opacity > 0;
    });
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.6]} />

      {/* Causes Nodes (E1, E2, E3)[cite: 28] */}
      {CAUSES.map((cause, i) => (
        <group key={cause.id} position={new THREE.Vector3(...cause.pos)}>
          <mesh>
            <boxGeometry args={[2, 1.5, 0.5]} />
            <meshStandardMaterial color={cause.color} transparent opacity={phase === 'aha_moment' && cause.id !== TARGET_CAUSE.id ? 0.3 : 0.9} />
          </mesh>
          <Billboard position={[0, 0, 0.3]}>
            <Text fontSize={0.4} color="#ffffff" fontWeight="bold">{cause.id}</Text>
          </Billboard>
          <Billboard position={[0, 1.2, 0]}>
            <Text fontSize={0.3} color={cause.color}>P({cause.id}) = {cause.pE}</Text>
          </Billboard>
          
          {/* Connecting Forward Path */}
          <Line 
            points={[cause.pos, NODE_A_POS] as [number, number, number][]} 
            color={cause.color} 
            lineWidth={phase === 'aha_moment' && cause.id === TARGET_CAUSE.id ? 6 : 2} 
            transparent 
            opacity={phase === 'aha_moment' && cause.id !== TARGET_CAUSE.id ? 0.2 : 0.6} 
          />
        </group>
      ))}

      {/* Observed Event Node (A)[cite: 28] */}
      <group position={new THREE.Vector3(...NODE_A_POS)}>
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 0.5, 32]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0.8} />
        </mesh>
        <Billboard position={[0, 0, 0.3]}>
          <Text fontSize={0.5} color="#ffffff" fontWeight="bold">Event A</Text>
        </Billboard>
      </group>

      {/* Dropped Particle (Positive Test / Defective Item)[cite: 28] */}
      <group ref={dropParticleRef}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1} transparent />
        </mesh>
      </group>

      {/* Reverse Tracing Particles[cite: 28] */}
      {CAUSES.map((cause, i) => (
        <group key={`trace-${cause.id}`} ref={(el) => { particleRefs.current[i] = el; }}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={cause.color} emissive={cause.color} emissiveIntensity={1} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ReverseFlowMachine() {
  const [phase, setPhase] = useState<Phase>('forward');

  const advanceSequence = () => {
    if (phase === 'forward') setPhase('dropped');
    else if (phase === 'dropped') setPhase('reverse');
    else if (phase === 'reverse') setPhase('aha_moment');
    else setPhase('forward');
  };

  const isAhaMoment = phase === 'aha_moment';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Reverse-Flow Machine</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Calculate the probability of a root cause given an observed outcome—inverting conditional probability[cite: 28].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Bayesian Calculator</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Step 1: Forward Paths */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'forward' ? 'border-sky-500/50 bg-sky-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="font-bold mb-1 text-sky-400">1. Forward Paths (Causes)[cite: 28]</div>
              <div className="text-xs text-stone-400">Hypotheses feeding into observed event A.</div>
            </div>

            {/* Step 2: Observation */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'dropped' ? 'border-red-500/50 bg-red-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="font-bold mb-1 text-red-400">2. Observed Outcome (A)[cite: 28]</div>
              <div className="text-xs text-stone-400">Defective item drops into output node.</div>
            </div>

            {/* Step 3: Total Probability */}
            <div className={`p-3 rounded-lg border transition-colors ${(phase === 'reverse' || phase === 'aha_moment') ? 'border-purple-500/50 bg-purple-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="font-bold mb-1 text-purple-400">3. Total Probability P(A)</div>
              <div className="text-xs text-stone-400 mb-1">Sum of all possible incoming pathways[cite: 28].</div>
              <div className="text-purple-300 font-bold">= {TOTAL_P_A.toFixed(3)}</div>
            </div>

            {/* Step 4: Bayes' Theorem (Aha Moment) */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'aha_moment' ? 'border-amber-500/50 bg-amber-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="font-bold mb-1 text-amber-400">4. Reverse Probability P(E1 | A)[cite: 28]</div>
              <div className="flex justify-between items-center text-sm py-1">
                <span>Path E1 / Total P(A)</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-stone-300">{(TARGET_CAUSE.pE * TARGET_CAUSE.pA_given_E).toFixed(3)} / {TOTAL_P_A.toFixed(3)}</span>
                <span className="text-amber-400">{(TARGET_REVERSE_P * 100).toFixed(1)}%</span>
              </div>
            </div>

          </div>

          <button 
            onClick={advanceSequence}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${
              phase === 'forward' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 
              phase === 'dropped' ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 
              phase === 'reverse' ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 
              'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {phase === 'forward' ? 'Drop Defective Item' : 
             phase === 'dropped' ? 'Trace Branching Network Backward' : 
             phase === 'reverse' ? 'Calculate Specific Cause (E1)' : 
             'Reset System'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Reverse Probability Computed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The engine highlighted the specific forward path divided by the total sum of all possible incoming pathways[cite: 28]. 
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-sm font-bold text-amber-300">
            This demystifies how medical tests trace back to actual disease rates or how factories track defective parts to specific machines[cite: 28].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <BayesScene phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -4, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}