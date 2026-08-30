'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import { Play, RotateCcw, Sigma, Binary, Pickaxe, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: The Pyramid Rig
// ==================================================================

function StoneBlock({ 
  position, 
  targetY, 
  phase, 
  triggerPhase, 
  label, 
  delay = 0 
}: { 
  position: [number, number, number], 
  targetY: number, 
  phase: string, 
  triggerPhase: string[], 
  label: string, 
  delay?: number 
}) {
  const blockRef = useRef<THREE.Group>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (triggerPhase.includes(phase)) {
      const timer = setTimeout(() => setActive(true), delay);
      return () => clearTimeout(timer);
    } else if (phase === 'idle') {
      setActive(false);
    }
  }, [phase, triggerPhase, delay]);

  useFrame((_, delta) => {
    if (!blockRef.current) return;
    
    if (active) {
      blockRef.current.position.y = THREE.MathUtils.lerp(blockRef.current.position.y, targetY, delta * 8);
    } else {
      blockRef.current.position.y = targetY + 6; // Suspended high above
    }
  });

  return (
    <group ref={blockRef} position={[position[0], targetY + 6, position[2]]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 1, 1]} />
        <meshStandardMaterial color="#44403c" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* The Chiseled Engraving */}
      <Text 
        position={[0, 0, 0.51]} 
        fontSize={0.4} 
        color="#e7e5e4" 
      >
        {label}
      </Text>
    </group>
  );
}

function PyramidRig({ phase, mode, valA, valB, valC }: { phase: string, mode: 'algebra' | 'number', valA: number, valB: number, valC: number }) {
  
  // Format labels based on mode
  const l1 = mode === 'algebra' ? 'a' : valA.toString();
  const l2 = mode === 'algebra' ? 'b' : valB.toString();
  const l3 = mode === 'algebra' ? 'c' : valC.toString();

  const l4 = mode === 'algebra' ? 'a + b' : (valA + valB).toString();
  const l5 = mode === 'algebra' ? 'b + c' : (valB + valC).toString();

  const l6 = mode === 'algebra' ? 'a + 2b + c' : (valA + 2 * valB + valC).toString();

  return (
    <group position={[0, -1, 0]}>
      {/* Base Pedestal */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[6.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>

      {/* Layer 1 (Bottom Row - Always active if not idle) */}
      <StoneBlock position={[-2, 0, 0]} targetY={0} phase={phase} triggerPhase={['setup', 'layer1', 'layer2', 'done']} label={l1} delay={0} />
      <StoneBlock position={[0, 0, 0]} targetY={0} phase={phase} triggerPhase={['setup', 'layer1', 'layer2', 'done']} label={l2} delay={100} />
      <StoneBlock position={[2, 0, 0]} targetY={0} phase={phase} triggerPhase={['setup', 'layer1', 'layer2', 'done']} label={l3} delay={200} />

      {/* Layer 2 (Middle Row) */}
      <StoneBlock position={[-1, 0, 0]} targetY={1} phase={phase} triggerPhase={['layer1', 'layer2', 'done']} label={l4} delay={0} />
      <StoneBlock position={[1, 0, 0]} targetY={1} phase={phase} triggerPhase={['layer1', 'layer2', 'done']} label={l5} delay={200} />

      {/* Layer 3 (Top Row) */}
      <StoneBlock position={[0, 0, 0]} targetY={2} phase={phase} triggerPhase={['layer2', 'done']} label={l6} delay={0} />
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function VirahankaPyramid() {
  const [phase, setPhase] = useState<'idle' | 'setup' | 'layer1' | 'layer2' | 'done'>('idle');
  const [mode, setMode] = useState<'algebra' | 'number'>('algebra');
  
  const [valA, setValA] = useState<number>(1);
  const [valB, setValB] = useState<number>(3);
  const [valC, setValC] = useState<number>(2);

  const handleStack = () => {
    if (phase === 'idle') {
      setPhase('setup');
      setTimeout(() => setPhase('layer1'), 800);
      setTimeout(() => setPhase('layer2'), 1800);
      setTimeout(() => setPhase('done'), 2600);
    }
  };

  const handleReset = () => {
    setPhase('idle');
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white flex items-center gap-2">
          <Pickaxe className="text-amber-500" /> The Virahānka Pyramid
        </h2>
        <p className="text-stone-400 text-sm mt-1">Algebraic Stacking & Substitution</p>
      </div>

      {/* Mode Toggle */}
      <div className="absolute top-6 right-6 z-20 flex bg-stone-900 border border-stone-800 rounded-xl p-1 shadow-lg">
        <button 
          onClick={() => setMode('algebra')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${mode === 'algebra' ? 'bg-amber-600 text-white' : 'text-stone-500 hover:text-stone-300'}`}
        >
          <Sigma size={14} /> Algebra Mode
        </button>
        <button 
          onClick={() => setMode('number')}
          disabled={phase !== 'done'}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${mode === 'number' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:text-stone-300 disabled:opacity-30'}`}
        >
          <Binary size={14} /> Number Mode
        </button>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 4, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minPolarAngle={Math.PI / 4}
              target={[0, 0, 0]}
            />
            
            <PyramidRig phase={phase} mode={mode} valA={valA} valB={valB} valC={valC} />

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.6} far={10} color="#000000" position={[0, -1.5, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Controls & HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        {/* AHA! Message Panel */}
        <AnimatePresence mode="wait">
          {phase === 'done' && mode === 'number' && (
            <motion.div 
              key="aha"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xl pointer-events-auto mb-6"
            >
              <Lightbulb size={28} className="text-emerald-400 shrink-0 mt-1" />
              <div>
                <p className="text-emerald-50 text-sm leading-relaxed mb-2">
                  <strong>The Magic of Substitution:</strong> The top block transforms from $a + 2b + c$ directly into its numeric sum! Notice how the middle block ($b$) is counted <em>twice</em> at the top because it physically supports both blocks in the middle row.
                </p>
                <div className="bg-stone-950 p-2 rounded-lg inline-block border border-emerald-900 font-mono text-sm text-emerald-400">
                  {valA} + 2({valB}) + {valC} = {valA + 2*valB + valC}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Controls */}
        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto w-full max-w-2xl">
          <div className="flex-1 bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl border border-stone-800 shadow-xl flex items-center justify-between gap-4">
            
            <div className="flex flex-col items-center flex-1">
              <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Block A</label>
              <input type="number" value={valA} onChange={(e) => { setValA(parseInt(e.target.value) || 0); if(mode === 'number') setMode('algebra'); }} className="w-full max-w-[60px] bg-stone-800 text-white font-mono text-center rounded border border-stone-600 p-1" />
            </div>
            
            <div className="w-px h-8 bg-stone-700" />
            
            <div className="flex flex-col items-center flex-1">
              <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Block B</label>
              <input type="number" value={valB} onChange={(e) => { setValB(parseInt(e.target.value) || 0); if(mode === 'number') setMode('algebra'); }} className="w-full max-w-[60px] bg-stone-800 text-white font-mono text-center rounded border border-stone-600 p-1" />
            </div>
            
            <div className="w-px h-8 bg-stone-700" />
            
            <div className="flex flex-col items-center flex-1">
              <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Block C</label>
              <input type="number" value={valC} onChange={(e) => { setValC(parseInt(e.target.value) || 0); if(mode === 'number') setMode('algebra'); }} className="w-full max-w-[60px] bg-stone-800 text-white font-mono text-center rounded border border-stone-600 p-1" />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="shrink-0 flex items-stretch">
            {phase === 'idle' ? (
              <button 
                onClick={handleStack}
                className="px-8 py-2 w-full bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Play size={18} /> Stack Blocks
              </button>
            ) : (
              <button 
                onClick={handleReset}
                className="px-8 py-2 w-full bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Reset
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}