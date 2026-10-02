'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

// ==================================================================
// ANIMATED ASSEMBLY BLOCK (Must be inside Canvas)
// ==================================================================
function AnimatedAssemblyBlock({ step }: { step: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const blockRef = useRef<THREE.Mesh>(null);
  const attachmentsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !blockRef.current || !attachmentsRef.current) return;

    // 1. Determine Target State based on Assembly Line Step
    let targetX = -7;
    let targetScaleY = 1;
    let targetAttachmentOpacity = 0;

    if (step === 1) { // Inside Machine F[cite: 21]
      targetX = -3;
      targetScaleY = 4;
      targetAttachmentOpacity = 1;
    } else if (step === 2) { // Transit on Conveyor Belt[cite: 21]
      targetX = 0;
      targetScaleY = 4;
      targetAttachmentOpacity = 1;
    } else if (step === 3) { // Inside Machine G[cite: 21]
      targetX = 3;
      targetScaleY = 1;
      targetAttachmentOpacity = 0;
    } else if (step === 4) { // Finished[cite: 21]
      targetX = 7;
      targetScaleY = 1;
      targetAttachmentOpacity = 0;
    }

    // 2. Animate Position (Conveyor Belt Movement)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 3);

    // 3. Animate Stretch (Factor of 4)[cite: 21]
    blockRef.current.scale.y = THREE.MathUtils.lerp(blockRef.current.scale.y, targetScaleY, delta * 4);

    // 4. Animate Attachments (Adding 3 smaller attachments)[cite: 21]
    attachmentsRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material.opacity = THREE.MathUtils.lerp(
          child.material.opacity, 
          targetAttachmentOpacity, 
          delta * 5
        );
        // Ensure visibility is toggled off completely to prevent weird rendering
        child.visible = child.material.opacity > 0.01;
      }
    });
  });

  return (
    <group ref={groupRef} position={[-7, 1, 0]}>
      {/* The Core Block (x)[cite: 21] */}
      <mesh ref={blockRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#10b981" metalness={0.4} roughness={0.2} />
      </mesh>
      
      {/* The 3 Attachments (+3)[cite: 21] */}
      <group ref={attachmentsRef}>
        <mesh position={[0.7, 1.2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh position={[0.7, 0, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh position={[0.7, -1.2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Floating Identity Label */}
      <Billboard position={[0, 3, 0]}>
        <Text fontSize={0.5} color="#cbd5e1" fontWeight="bold">
          {step === 0 ? "x" : step === 4 ? "x" : step >= 1 && step <= 2 ? "f(x)" : ""}
        </Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function CompositionChamber() {
  const [step, setStep] = useState<number>(0);

  const advanceAssembly = () => {
    if (step < 4) setStep(step + 1);
    else setStep(0);
  };

  const isAhaMoment = step === 4;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Composition Chamber</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing function composition $g \circ f$ and invertibility ($g = f^{-1}$)[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Assembly Status</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">Phase {step}/4</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${step === 0 ? 'border-stone-500 text-stone-300 bg-stone-800' : 'border-stone-800 text-stone-600'}`}>
              Input: Raw Geometric Block ($x$)[cite: 21]
            </div>
            <div className={`p-2 rounded border ${step === 1 ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              Machine F: $f(x) = 4x + 3$[cite: 21]
            </div>
            <div className={`p-2 rounded border ${step === 2 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-600'}`}>
              Transit: $f(x)$ on Conveyor Belt[cite: 21]
            </div>
            <div className={`p-2 rounded border ${step === 3 ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              Machine G: g(y) = (y - 3) / 4[cite: 21]
            </div>
            <div className={`p-2 rounded border ${step === 4 ? 'border-purple-500/50 text-purple-400 bg-purple-950/30' : 'border-stone-800 text-stone-600'}`}>
              Output: $g(f(x)) = x$
            </div>
          </div>

          <button 
            onClick={advanceAssembly}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${step === 4 ? 'bg-stone-800 text-stone-500 border-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {step === 0 ? 'Feed into Machine F' : 
             step === 1 ? 'Move to Transit' : 
             step === 2 ? 'Feed into Machine G' : 
             step === 3 ? 'Eject Output' : 'Reset Assembly Line'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Invertibility Proven</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The block that drops out of the end of the line is structurally identical to the raw starting block $x$[cite: 21].
          </p>
          <div className="inline-block bg-purple-950/50 px-6 py-2 rounded-lg border border-purple-900/50 font-mono text-base font-bold text-white">
            Proving $g \circ f = I_X$ simply means the second machine successfully disassembled everything the first machine built[cite: 21].
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

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <group>
              {/* CONVEYOR BELT */}
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[20, 0.4, 3]} />
                <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
              </mesh>
              
              {/* MACHINE F (Stretches & Adds)[cite: 21] */}
              <group position={[-3, 2.5, 0]}>
                <mesh>
                  <boxGeometry args={[3, 5, 4]} />
                  <meshStandardMaterial color="#3b82f6" transparent opacity={0.2} depthWrite={false} />
                </mesh>
                <lineSegments>
                  <edgesGeometry args={[new THREE.BoxGeometry(3, 5, 4)]} />
                  <lineBasicMaterial color="#60a5fa" linewidth={2} />
                </lineSegments>
                <Billboard position={[0, 3, 0]}>
                  <Text fontSize={0.6} color="#60a5fa" fontWeight="bold">Machine F</Text>
                  <Text position={[0, -0.6, 0]} fontSize={0.4} color="#93c5fd">f(x) = 4x + 3</Text>
                </Billboard>
              </group>

              {/* MACHINE G (Strips & Compresses)[cite: 21] */}
              <group position={[3, 2.5, 0]}>
                <mesh>
                  <boxGeometry args={[3, 5, 4]} />
                  <meshStandardMaterial color="#f59e0b" transparent opacity={0.2} depthWrite={false} />
                </mesh>
                <lineSegments>
                  <edgesGeometry args={[new THREE.BoxGeometry(3, 5, 4)]} />
                  <lineBasicMaterial color="#fcd34d" linewidth={2} />
                </lineSegments>
                <Billboard position={[0, 3, 0]}>
                  <Text fontSize={0.6} color="#fbbf24" fontWeight="bold">Machine G</Text>
                  <Text position={[0, -0.6, 0]} fontSize={0.4} color="#fde68a">g(y) = (y-3)/4</Text>
                </Billboard>
              </group>

              {/* THE DYNAMIC BLOCK */}
              <AnimatedAssemblyBlock step={step} />

            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.4} far={10} position={[0, -0.5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}