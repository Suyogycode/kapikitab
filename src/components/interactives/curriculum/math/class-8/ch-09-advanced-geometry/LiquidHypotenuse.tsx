'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Play, RotateCcw, BoxSelect, Droplet, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F COMPONENTS
// ==================================================================
function Basin({ size, phase, isHypotenuse = false }: { size: number, phase: string, isHypotenuse?: boolean }) {
  const liquidRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (!liquidRef.current) return;

    // Logic: Hypotenuse starts empty (0.001) and fills to 1.
    // The legs (a and b) start full (1) and empty to 0.001.
    let targetFill = 1;
    if (phase === 'idle') {
      targetFill = isHypotenuse ? 0.001 : 1;
    } else if (phase === 'pouring' || phase === 'done') {
      targetFill = isHypotenuse ? 1 : 0.001;
    }

    const currentScale = liquidRef.current.scale.z;
    liquidRef.current.scale.z = THREE.MathUtils.lerp(currentScale, targetFill, delta * 3);
    
    // Adjust position so it scales from the bottom of the basin
    // Base thickness is 0.2, fluid max thickness is 0.18
    const maxZOffset = 0.1; 
    liquidRef.current.position.z = 0.1 + (liquidRef.current.scale.z * maxZOffset) / 2;
  });

  return (
    <group>
      {/* The Stone Basin Frame */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[size, size, 0.2]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      
      {/* The Emerald Liquid */}
      <mesh ref={liquidRef} position={[0, 0, 0.1]}>
        <boxGeometry args={[size - 0.2, size - 0.2, 0.18]} />
        <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.1} emissive="#059669" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function GeometryRig({ a, b, phase }: { a: number, b: number, phase: string }) {
  const c = Math.sqrt(a * a + b * b);

  // Generate the central Right-Angled Triangle dynamically
  const triangleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(a, 0);
    shape.lineTo(0, b);
    shape.lineTo(0, 0);
    return shape;
  }, [a, b]);

  const extrudeSettings = { depth: 0.2, bevelEnabled: false };

  // Calculate rotation for the hypotenuse basin
  const hypotenuseAngle = Math.atan2(b, -a);

  return (
    <group position={[-a / 2, -b / 2, 0]}>
      {/* The Central Triangle */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[triangleShape, extrudeSettings]} />
        <meshStandardMaterial color="#44403c" roughness={0.8} />
      </mesh>

      {/* Basin A (Base) */}
      <group position={[a / 2, -a / 2, 0]}>
        <Basin size={a} phase={phase} />
      </group>

      {/* Basin B (Height) */}
      <group position={[-b / 2, b / 2, 0]}>
        <Basin size={b} phase={phase} />
      </group>

      {/* Basin C (Hypotenuse) */}
      <group position={[a, 0, 0]} rotation={[0, 0, hypotenuseAngle]}>
        {/* Local offset to attach the square perfectly to the outer edge */}
        <group position={[c / 2, -c / 2, 0]}>
          <Basin size={c} phase={phase} isHypotenuse={true} />
        </group>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function LiquidHypotenuse() {
  const [a, setA] = useState<number>(3);
  const [b, setB] = useState<number>(4);
  const [phase, setPhase] = useState<'idle' | 'pouring' | 'done'>('idle');

  const cSquared = (a * a) + (b * b);
  const c = Math.sqrt(cSquared);
  const isInteger = Number.isInteger(c);

  const handleCombine = () => {
    setPhase('pouring');
    setTimeout(() => setPhase('done'), 2000);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER & MATH HUD */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            The Liquid Hypotenuse
          </h2>
          <p className="text-stone-400 text-sm mt-1">Baudhāyana's Theorem: <span className="font-mono text-emerald-400">a² + b² = c²</span></p>
        </div>

        <div className="bg-stone-900 border border-stone-700 p-4 rounded-xl shadow-xl flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-stone-500 text-[10px] uppercase font-bold tracking-widest mb-1">Area a²</span>
            <span className="text-emerald-400 font-mono text-xl">{a * a}</span>
          </div>
          <span className="text-stone-600 font-bold text-xl">+</span>
          <div className="flex flex-col items-center">
            <span className="text-stone-500 text-[10px] uppercase font-bold tracking-widest mb-1">Area b²</span>
            <span className="text-emerald-400 font-mono text-xl">{b * b}</span>
          </div>
          <span className="text-stone-600 font-bold text-xl">=</span>
          <div className="flex flex-col items-center">
            <span className="text-stone-500 text-[10px] uppercase font-bold tracking-widest mb-1">Area c²</span>
            <span className={`font-mono text-xl ${phase === 'done' ? 'text-emerald-400' : 'text-stone-300'}`}>{cSquared}</span>
          </div>
        </div>
      </div>

      {/* THE 3D ENGINE */}
      <div className="flex-1 w-full relative min-h-[400px] z-0 bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner overflow-hidden">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 10, 15]} intensity={1.5} castShadow />
              <Environment preset="city" />
              
              {/* Isometric angle to see the basins */}
              <OrbitControls 
                enableZoom={false} 
                maxPolarAngle={Math.PI / 2} 
                minPolarAngle={Math.PI / 4}
              />
              
              {/* Slightly tilted so the student can see the depth of the liquid filling */}
              <group rotation={[-0.4, 0, 0]}>
                <GeometryRig a={a} b={b} phase={phase} />
              </group>

              <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.6} far={10} color="#000000" />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* AHA! MESSAGE BOX */}
      <div className="mt-6 z-10 shrink-0">
        <AnimatePresence mode="wait">
          {phase === 'done' ? (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl flex items-start gap-3 shadow-xl">
              <Droplet size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-stone-200 text-sm leading-relaxed">
                <strong>The Perfect Fit:</strong> The liquid from the <span className="font-mono">a²</span> and <span className="font-mono">b²</span> basins poured directly into the <span className="font-mono">c²</span> basin. It fills to the exact microscopic brim—never overflowing, never falling short! 
                {isInteger && <span className="block mt-2 text-emerald-300">Because the final hypotenuse ({c}) is a clean whole number, this is known as a <strong>Pythagorean Triple</strong>!</span>}
              </p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/60 backdrop-blur-md border border-stone-700/50 p-5 rounded-2xl flex items-start gap-3 shadow-lg">
              <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                Adjust the base (a) and height (b) of the central triangle. The attached square basins will dynamically resize to match. When you are ready, hit <strong>Combine</strong> to pour the liquid.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTROLS */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 z-10 shrink-0">
        
        <div className="flex-1 w-full bg-stone-900 border border-stone-800 rounded-xl p-4">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <BoxSelect size={14} className="text-emerald-500" /> Base (a)
            </label>
            <span className="text-sm font-mono font-bold text-white">{a} Units</span>
          </div>
          <input 
            type="range" min="2" max="6" step="1" 
            value={a} 
            onChange={(e) => { setA(parseInt(e.target.value)); setPhase('idle'); }}
            disabled={phase !== 'idle'}
            className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
          />
        </div>

        <div className="shrink-0">
          {phase === 'idle' ? (
            <button 
              onClick={handleCombine}
              className="px-8 py-4 h-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Play size={18} /> Combine
            </button>
          ) : (
            <button 
              onClick={() => setPhase('idle')}
              className="px-8 py-4 h-full bg-stone-700 hover:bg-stone-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Reset
            </button>
          )}
        </div>

        <div className="flex-1 w-full bg-stone-900 border border-stone-800 rounded-xl p-4">
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <BoxSelect size={14} className="text-emerald-500" /> Height (b)
            </label>
            <span className="text-sm font-mono font-bold text-white">{b} Units</span>
          </div>
          <input 
            type="range" min="2" max="6" step="1" 
            value={b} 
            onChange={(e) => { setB(parseInt(e.target.value)); setPhase('idle'); }}
            disabled={phase !== 'idle'}
            className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
          />
        </div>

      </div>
    </div>
  );
}