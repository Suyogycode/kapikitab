'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

type Phase = 'universal' | 'select_events' | 'condition_f';

// ==================================================================
// DATA MODEL
// ==================================================================
const OUTCOMES = [
  { id: 'HHH', e: true, f: false, pos: [1.5, 1.5, 1.5] },
  { id: 'HHT', e: true, f: false, pos: [1.5, 1.5, -1.5] },
  { id: 'HTH', e: true, f: false, pos: [1.5, -1.5, 1.5] },
  { id: 'HTT', e: false, f: false, pos: [1.5, -1.5, -1.5] },
  { id: 'THH', e: true, f: true, pos: [-1.5, 1.5, 1.5] },
  { id: 'THT', e: false, f: true, pos: [-1.5, 1.5, -1.5] },
  { id: 'TTH', e: false, f: true, pos: [-1.5, -1.5, 1.5] },
  { id: 'TTT', e: false, f: true, pos: [-1.5, -1.5, -1.5] },
];

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function UniverseScene({ phase }: { phase: Phase }) {
  const outerSphereRef = useRef<THREE.Mesh>(null);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    // Animate Outer Sphere (The Universal Sample Space)[cite: 26]
    if (outerSphereRef.current) {
      const mat = outerSphereRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = phase === 'condition_f' ? 0 : 0.2;
      const targetScale = phase === 'condition_f' ? 1.5 : 1; // Shatters/Expands outwards[cite: 26]
      
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 4);
      outerSphereRef.current.scale.setScalar(THREE.MathUtils.lerp(outerSphereRef.current.scale.x, targetScale, delta * 3));
      outerSphereRef.current.visible = mat.opacity > 0.01;
    }

    // Animate Outcomes
    OUTCOMES.forEach((outcome, i) => {
      const node = nodeRefs.current[i];
      if (!node) return;

      const mesh = node.children[0] as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      let targetScale = 1;
      let targetOpacity = 1;
      let targetColor = new THREE.Color("#64748b"); // Default Slate
      let targetEmissive = new THREE.Color("#000000");

      if (phase === 'select_events') {
        if (outcome.e && !outcome.f) targetColor = new THREE.Color("#38bdf8"); // E only (Sky Blue)
        if (!outcome.e && outcome.f) targetColor = new THREE.Color("#f43f5e"); // F only (Rose)
        if (outcome.e && outcome.f) targetColor = new THREE.Color("#a855f7"); // E intersection F (Purple)
      } else if (phase === 'condition_f') {
        if (!outcome.f) {
          targetScale = 0; // Evaporates non-F outcomes[cite: 26]
          targetOpacity = 0;
        } else {
          // F survives and glows[cite: 26]
          if (outcome.e) {
            targetColor = new THREE.Color("#a855f7"); // E given F (Target numerator)
            targetEmissive = new THREE.Color("#7e22ce");
          } else {
            targetColor = new THREE.Color("#f43f5e"); // Just F
            targetEmissive = new THREE.Color("#be123c");
          }
          targetScale = 1.2;
        }
      }

      node.scale.setScalar(THREE.MathUtils.lerp(node.scale.x, targetScale, delta * 5));
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 5);
      mat.color.lerp(targetColor, delta * 5);
      mat.emissive.lerp(targetEmissive, delta * 5);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, phase === 'condition_f' ? 1 : 0, delta * 5);
      
      mesh.visible = mat.opacity > 0.01;
      (node.children[1] as any).visible = mat.opacity > 0.01; // Toggle Billboard text visibility
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Universal Sample Space Sphere[cite: 26] */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Outcome Nodes */}
      {OUTCOMES.map((outcome, i) => (
        <group 
          key={outcome.id} 
          position={new THREE.Vector3(...outcome.pos)} 
          ref={(el) => { nodeRefs.current[i] = el; }}
        >
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#64748b" transparent opacity={1} />
          </mesh>
          <Billboard position={[0, 0.7, 0]}>
            <Text fontSize={0.4} color="#ffffff" fontWeight="bold">
              {outcome.id}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ShrinkingUniverse() {
  const [phase, setPhase] = useState<Phase>('universal');

  const advanceSequence = () => {
    if (phase === 'universal') setPhase('select_events');
    else if (phase === 'select_events') setPhase('condition_f');
    else setPhase('universal');
  };

  const isAhaMoment = phase === 'condition_f';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Shrinking Universe</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Conditional probability: What is the probability of event E given that event F has already occurred?[cite: 26]
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Sample Space Tracker</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Universal Space */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'universal' ? 'border-stone-500/50 bg-stone-800 text-stone-200' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="flex justify-between">
                <span className="font-bold">Universal Space (S)</span>
                <span>n(S) = 8</span>
              </div>
              <div className="text-xs opacity-70 mt-1">Tossing three coins.</div>
            </div>

            {/* Event Definitions[cite: 26] */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'select_events' ? 'border-sky-500/50 bg-sky-950/30 text-stone-200' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="flex justify-between text-sky-400 mb-1">
                <span className="font-bold">Event E (Sky)</span>
                <span>n(E) = 4</span>
              </div>
              <div className="text-xs opacity-70 mb-2">"At least two heads"</div>
              
              <div className="flex justify-between text-rose-400 mb-1">
                <span className="font-bold">Event F (Rose)</span>
                <span>n(F) = 4</span>
              </div>
              <div className="text-xs opacity-70 mb-2">"First coin shows tail"</div>

              <div className="flex justify-between text-purple-400 pt-2 border-t border-stone-800">
                <span className="font-bold">Intersection (E ∩ F)</span>
                <span>n(E ∩ F) = 1</span>
              </div>
            </div>

            {/* Conditional Calculation[cite: 26] */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'condition_f' ? 'border-purple-500/50 bg-purple-950/30 text-purple-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-2">Condition: Given F occurred</div>
              <div className="flex justify-between items-center text-lg">
                <span>P(E | F) =</span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-purple-500/50 pb-1 px-2">n(E ∩ F)</span>
                  <span className="pt-1 px-2">n(F)</span>
                </div>
                <span>=</span>
                <div className="flex flex-col items-center font-bold">
                  <span className="border-b border-purple-500/50 pb-1 px-2 text-purple-300">1</span>
                  <span className="pt-1 px-2 text-rose-300">4</span>
                </div>
              </div>
            </div>

          </div>

          <button 
            onClick={advanceSequence}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${
              phase === 'universal' ? 'bg-sky-600 border-sky-500 text-white hover:bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 
              phase === 'select_events' ? 'bg-purple-600 border-purple-500 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 
              'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {phase === 'universal' ? 'Select Events (E & F)' : 
             phase === 'select_events' ? 'Trigger "Given F"' : 
             'Reset Universe'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Visual Contraction of Reality</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            When the condition was triggered, the massive outer sphere instantly shattered and evaporated[cite: 26]. Only the sub-region representing event F survived and glowed brightly[cite: 26].
          </p>
          <div className="inline-block bg-purple-950/50 px-6 py-2 rounded-lg border border-purple-900/50 font-mono text-sm font-bold text-purple-300">
            The denominator of the formula physically shrunk from the total sample space n(S) down to the restricted subset n(F)[cite: 26].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <UniverseScene phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}