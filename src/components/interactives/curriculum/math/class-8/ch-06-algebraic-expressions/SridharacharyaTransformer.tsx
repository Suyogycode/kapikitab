'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import { Play, RotateCcw, BoxSelect, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: The Geometric Proof Mechanics
// ==================================================================
function TransformerScene({ step, bValue }: { step: number, bValue: number }) {
  const p1Ref = useRef<THREE.Mesh>(null); // Bottom Rectangle: a * (a-b)
  const p2Ref = useRef<THREE.Mesh>(null); // Top-Left Rectangle: (a-b) * b
  const p3Ref = useRef<THREE.Mesh>(null); // Top-Right Square: b^2 (The Cutout)
  
  const a = 4; // We lock 'a' to a physical size of 4 units for the 3D space

  useFrame((_, delta) => {
    if (!p1Ref.current || !p2Ref.current || !p3Ref.current) return;

    const b = bValue;

    // --------------------------------------------------
    // PIECE 1: Bottom Rectangle (Never rotates, only anchors)
    // --------------------------------------------------
    p1Ref.current.position.set(0, -b/2, 0);
    p1Ref.current.scale.lerp(new THREE.Vector3(a, a-b, 0.5), delta * 5);

    // --------------------------------------------------
    // PIECE 2: Top-Left Rectangle (Fractures, then moves & rotates)
    // --------------------------------------------------
    const p2TargetPos = new THREE.Vector3(-b/2, a/2 - b/2, 0);
    let p2TargetRot = 0;
    
    if (step === 2) {
      // Fracture: Pull slightly up and left
      p2TargetPos.set(-b/2 - 0.2, a/2 - b/2 + 0.2, 0); 
    } else if (step === 3) {
      // Transform: Rotate -90deg and snap to the right side of Piece 1
      p2TargetPos.set(a/2 + b/2, -b/2, 0); 
      p2TargetRot = -Math.PI / 2;
    }
    
    p2Ref.current.position.lerp(p2TargetPos, delta * 4);
    p2Ref.current.rotation.z = THREE.MathUtils.lerp(p2Ref.current.rotation.z, p2TargetRot, delta * 4);
    p2Ref.current.scale.lerp(new THREE.Vector3(a-b, b, 0.5), delta * 5);

    // --------------------------------------------------
    // PIECE 3: Top-Right Cutout (b^2)
    // --------------------------------------------------
    const p3TargetPos = new THREE.Vector3(a/2 - b/2, a/2 - b/2, 0);
    const p3TargetScale = new THREE.Vector3(b, b, 0.5);
    
    if (step > 0) {
      // The Subtraction: It falls backward into the void and shrinks to dust
      p3TargetPos.z = -2;
      p3TargetScale.setScalar(0.001); // Safe 0.001 to prevent WebGL Context Loss
    }
    
    p3Ref.current.position.lerp(p3TargetPos, delta * 4);
    p3Ref.current.scale.lerp(p3TargetScale, delta * 4);
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Piece 1: Bottom Rectangle */}
      <mesh ref={p1Ref} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.1} />
        {step === 3 && (
          <Text position={[0, 0, 0.26]} fontSize={0.3} color="#ffffff">
            a × (a-b)
          </Text>
        )}
      </mesh>

      {/* Piece 2: Top-Left Rectangle */}
      <mesh ref={p2Ref} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.1} />
        {step === 3 && (
          <Text position={[0, 0, 0.26]} fontSize={0.3} color="#ffffff">
            b × (a-b)
          </Text>
        )}
      </mesh>

      {/* Piece 3: The b^2 Cutout */}
      <mesh ref={p3Ref} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        {/* Turns red just before it vanishes */}
        <meshStandardMaterial color={step > 0 ? "#ef4444" : "#d97706"} roughness={0.4} metalness={0.1} transparent opacity={step > 0 ? 0.5 : 1} />
        {step === 0 && (
          <Text position={[0, 0, 0.26]} fontSize={0.4} color="#ffffff">
            b²
          </Text>
        )}
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function SridharacharyaTransformer() {
  const [step, setStep] = useState<number>(0);
  const [bValue, setBValue] = useState<number>(1.5); // Ranges from 1 to 2.5

  const proofs = [
    { title: "The Initial Square", equation: "a²", desc: "We begin with a solid stone square of area a²." },
    { title: "The Subtraction", equation: "a² - b²", desc: "We laser-cut a smaller square (b²) from the corner and discard it. The remaining L-shape has an area of exactly a² - b²." },
    { title: "The Fracture", equation: "a(a-b) + b(a-b)", desc: "The L-shape naturally fractures into two distinct rectangular blocks based on the cut." },
    { title: "The Sridharacharya Transform", equation: "(a + b)(a - b)", desc: "By rotating the blue block 90° and magnetically snapping it to the green block, the chaotic L-shape forms a perfect, single rectangle with sides (a+b) and (a-b)!" }
  ];

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-900 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* TOP HTML OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">Sridharacharya Transformer</h2>
        <p className="text-emerald-400 text-sm font-mono mt-1">a² - b² = (a + b)(a - b)</p>
      </div>

      {/* INPUT CONTROLS */}
      <div className="absolute top-6 right-6 z-20 bg-stone-800/80 backdrop-blur-md p-4 rounded-2xl border border-stone-700 w-64 shadow-xl">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center justify-between mb-2">
          <span className="flex items-center gap-1"><BoxSelect size={14} className="text-emerald-500" /> Cutout Size (b)</span>
        </label>
        <input 
          type="range" min="0.8" max="2.5" step="0.1" 
          value={bValue} 
          onChange={(e) => { setBValue(parseFloat(e.target.value)); setStep(0); }}
          className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
            
            <TransformerScene step={step} bValue={bValue} />

            {/* Back Wall / Floor for shadows */}
            <mesh position={[0, 0, -1]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#1c1917" roughness={1} />
            </mesh>
          </Suspense>
        </Canvas>
      </div>

      {/* BOTTOM CONTROL UI & AHA! BOX */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-10 pointer-events-none flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`w-full max-w-2xl backdrop-blur-md border p-5 rounded-2xl shadow-2xl flex items-start gap-4 pointer-events-auto mb-6 ${step === 3 ? 'bg-emerald-950/80 border-emerald-500' : 'bg-black/80 border-stone-700'}`}
          >
            {step === 3 ? <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-1" /> : <Sparkles size={24} className="text-amber-500 shrink-0 mt-1" />}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`font-bold text-sm uppercase tracking-widest ${step === 3 ? 'text-emerald-400' : 'text-stone-300'}`}>{proofs[step].title}</span>
                <span className="font-mono text-xs px-2 py-1 rounded-md bg-stone-900 text-stone-400 border border-stone-700">Area: {proofs[step].equation}</span>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed">
                {proofs[step].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 pointer-events-auto">
          {step < 3 ? (
            <button 
              onClick={() => setStep(prev => prev + 1)}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2 shadow-xl"
            >
              <Play size={16} /> Next Transform
            </button>
          ) : (
            <button 
              onClick={() => setStep(0)}
              className="px-8 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2 shadow-xl"
            >
              <RotateCcw size={16} /> Reset Engine
            </button>
          )}
        </div>
      </div>

    </div>
  );
}