'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Line } from '@react-three/drei';
import { Copy, RotateCw, Combine, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: The Cloning Rig
// ==================================================================
function TrapeziumRig({ phase }: { phase: string }) {
  const cloneRef = useRef<THREE.Group>(null);
  const cloneMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Math parameters for the standard trapezium
  const a = 2; // Top base width
  const b = 4; // Bottom base width
  const h = 2; // Height
  
  // Custom Shape Geometry
  const trapShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Bottom-left (-2, -1), Bottom-right (2, -1) -> Width = 4
    shape.moveTo(-b/2, -h/2);
    shape.lineTo(b/2, -h/2);
    // Top-right (1, 1), Top-left (-1, 1) -> Width = 2
    shape.lineTo(a/2, h/2);
    shape.lineTo(-a/2, h/2);
    shape.lineTo(-b/2, -h/2);
    return shape;
  }, [a, b, h]);

  const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };

  useFrame((_, delta) => {
    if (!cloneRef.current || !cloneMaterialRef.current) return;

    // State Machine Targets
    let targetZ = 0;
    let targetX = 0;
    let targetRotZ = 0;
    let targetOpacity = 0;

    if (phase === 'cloned') {
      targetZ = 1.5; // Pops forward
      targetOpacity = 0.6; // Ghostly
    } else if (phase === 'rotated') {
      targetZ = 1.5;
      targetRotZ = Math.PI; // 180 degrees
      targetOpacity = 0.6;
    } else if (phase === 'merged' || phase === 'aha') {
      // Snaps to the right edge to form the parallelogram
      // Shift calculation: Base difference / 2 + Top Base / 2 + Bottom Base / 2 = 3
      targetX = 3; 
      targetZ = 0;
      targetRotZ = Math.PI;
      targetOpacity = 1; // Solidifies
    }

    // Smooth Lerping
    cloneRef.current.position.z = THREE.MathUtils.lerp(cloneRef.current.position.z, targetZ, delta * 4);
    cloneRef.current.position.x = THREE.MathUtils.lerp(cloneRef.current.position.x, targetX, delta * 4);
    cloneRef.current.rotation.z = THREE.MathUtils.lerp(cloneRef.current.rotation.z, targetRotZ, delta * 4);
    cloneMaterialRef.current.opacity = THREE.MathUtils.lerp(cloneMaterialRef.current.opacity, targetOpacity, delta * 4);
  });

  return (
    <group position={[-1.5, 0, 0]}>
      {/* 1. The Original Stone Trapezium */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[trapShape, extrudeSettings]} />
        <meshStandardMaterial color="#44403c" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Base Labels for Original */}
      <Text position={[0, -1.3, 0.2]} fontSize={0.3} color="#a8a29e" fontStyle="italic">b</Text>
      <Text position={[0, 1.3, 0.2]} fontSize={0.3} color="#a8a29e" fontStyle="italic">a</Text>

      {/* 2. The Ghost Clone */}
      <group ref={cloneRef}>
        <mesh castShadow receiveShadow>
          <extrudeGeometry args={[trapShape, extrudeSettings]} />
          <meshStandardMaterial 
            ref={cloneMaterialRef} 
            color="#10b981" 
            roughness={0.2} 
            metalness={0.4} 
            transparent 
            opacity={0} 
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 3. The "Aha" Laser Slice (Halving the Parallelogram) */}
      {(phase === 'aha') && (
        <group position={[1.5, 0, 0.4]}>
          <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#10b981" lineWidth={5} dashed dashScale={5} dashSize={0.2} />
          {/* Combined Base Label */}
          <Text position={[0, -1.6, 0]} fontSize={0.4} color="#34d399">
            New Base = (a + b)
          </Text>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function TrapeziumCloner() {
  const [phase, setPhase] = useState<'idle' | 'cloned' | 'rotated' | 'merged' | 'aha'>('idle');

  const advanceSequence = () => {
    if (phase === 'idle') setPhase('cloned');
    else if (phase === 'cloned') setPhase('rotated');
    else if (phase === 'rotated') setPhase('merged');
    else if (phase === 'merged') setPhase('aha');
  };

  const handleReset = () => setPhase('idle');

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white flex items-center gap-3">
          <Copy className="text-emerald-500" /> The Trapezium Cloner
        </h2>
        <p className="text-stone-400 text-sm mt-1">Deriving area through duplication.</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2} 
              minPolarAngle={0}
              target={[0, 0, 0]}
            />
            
            <TrapeziumRig phase={phase} />

            <ContactShadows frames={1} resolution={1024} scale={20} blur={2} opacity={0.6} far={10} color="#000000" position={[0, -1.2, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Controls & Math HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        {/* AHA! Message Panel */}
        <AnimatePresence mode="wait">
          {phase === 'aha' && (
            <motion.div 
              key="aha"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xl pointer-events-auto mb-6"
            >
              <Sparkles size={28} className="text-emerald-400 shrink-0 mt-1" />
              <div>
                <p className="text-emerald-50 text-sm leading-relaxed mb-3">
                  <strong>The Ultimate Proof:</strong> Two identical trapeziums perfectly form one massive parallelogram with a base of <span className="font-mono text-emerald-300">(a + b)</span> and a height of <span className="font-mono text-emerald-300">h</span>. Since the parallelogram's area is <span className="font-mono text-emerald-300">h × (a + b)</span>, a single trapezium must be exactly half of that!
                </p>
                <div className="bg-stone-950 border border-emerald-900 p-3 rounded-xl inline-block">
                  <div className="font-mono text-emerald-400 text-lg font-bold">
                    Area = ½ × h × (a + b)
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex gap-4 pointer-events-auto bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl border border-stone-800 shadow-xl">
          
          <button 
            onClick={advanceSequence}
            disabled={phase === 'aha'}
            className="w-48 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {phase === 'idle' && <><Copy size={16} /> 1. Clone Shape</>}
            {phase === 'cloned' && <><RotateCw size={16} /> 2. Rotate 180°</>}
            {phase === 'rotated' && <><Combine size={16} /> 3. Merge Shapes</>}
            {phase === 'merged' && <><Sparkles size={16} /> 4. Reveal Formula</>}
            {phase === 'aha' && <><CheckCircle2 size={16} /> Completed</>}
          </button>

          <button 
            onClick={handleReset}
            disabled={phase === 'idle'}
            className="px-6 py-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} /> Reset
          </button>
          
        </div>

      </div>
    </div>
  );
}