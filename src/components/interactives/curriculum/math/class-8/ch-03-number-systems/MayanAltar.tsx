'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';
import { Play, ShieldAlert, Anchor } from 'lucide-react';

// ==================================================================
// MATH ENGINE: Mayan Base-20 (Modified to 360 for third tier)
// ==================================================================
const calculateMayanTiers = (num: number) => {
  const t360 = Math.floor(num / 360);
  const rem = num % 360;
  const t20 = Math.floor(rem / 20);
  const t1 = rem % 20;
  return [t1, t20, t360]; // Index 0 is bottom (1s), Index 2 is top (360s)
};

// ==================================================================
// NATIVE R3F COMPONENTS: Dots, Bars, and Shells
// ==================================================================
function MayanDigit({ value, isZeroFilled }: { value: number, isZeroFilled: boolean }) {
  if (value === 0) {
    if (!isZeroFilled) return null; // Empty Void
    // The Seashell (Zero Placeholder)
    return (
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.4, 0.8, 4, 16]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
        {/* Decorative lines to make it look like a shell */}
        <mesh position={[0, 0, 0.4]}>
           <boxGeometry args={[0.1, 1.2, 0.1]} />
           <meshStandardMaterial color="#a8a29e" />
        </mesh>
      </mesh>
    );
  }

  const bars = Math.floor(value / 5);
  const dots = value % 5;

  return (
    <group position={[0, 0.2, 0]}>
      {/* Render Bars (Value 5) */}
      {Array.from({ length: bars }).map((_, i) => (
        <mesh key={`bar-${i}`} position={[0, i * 0.3, 0]} castShadow>
          <boxGeometry args={[1.5, 0.2, 0.8]} />
          <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
      
      {/* Render Dots (Value 1) */}
      {Array.from({ length: dots }).map((_, i) => {
        const offset = (i - (dots - 1) / 2) * 0.4;
        return (
          <mesh key={`dot-${i}`} position={[offset, bars * 0.3 + 0.15, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.2} emissive="#059669" emissiveIntensity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function AltarTier({ 
  level, value, label, phase, isEmptyBelow 
}: { 
  level: number, value: number, label: string, phase: string, isEmptyBelow: boolean 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isZeroFilled = phase === 'stable' || phase === 'dropping-zeros';
  const isUnstable = value > 0 && isEmptyBelow && phase === 'wobbling';

  const yPos = level * 2.5;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Wobble effect if unstable
    if (isUnstable) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 25) * 0.08;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 20) * 0.02;
    } else {
      // Smoothly return to center
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, delta * 5);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 5);
    }
  });

  return (
    <group ref={groupRef} position={[0, yPos, 0]}>
      {/* Base Platform */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[4 - level * 0.5, 0.4, 4 - level * 0.5]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      
      {/* Support Pillar (Hollow if empty and no zero dropped) */}
      {level > 0 && (
        <mesh position={[0, -1.25, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 2.1, 16]} />
          <meshStandardMaterial 
            color="#44403c" 
            transparent 
            opacity={(value === 0 && !isZeroFilled) ? 0.1 : 1} // Transparent if missing structural zero
            roughness={1} 
          />
        </mesh>
      )}

      {/* The Mayan Digit representation */}
      {(phase !== 'idle') && (
        <MayanDigit value={value} isZeroFilled={isZeroFilled} />
      )}

      {/* Label */}
      <Text position={[-(2.5 - level * 0.25), 0.5, 0]} fontSize={0.3} color="#a8a29e" anchorX="right">
        {label}
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function MayanAltar() {
  const [inputNum, setInputNum] = useState<number>(360);
  const [phase, setPhase] = useState<'idle' | 'dropping' | 'wobbling' | 'dropping-zeros' | 'stable'>('idle');

  const tiers = useMemo(() => calculateMayanTiers(inputNum), [inputNum]);
  
  // Check if there's a structural void: A tier has a value, but a tier below it is 0
  const hasStructuralVoid = (tiers[2] > 0 && (tiers[1] === 0 || tiers[0] === 0)) || (tiers[1] > 0 && tiers[0] === 0);

  const handleSimulate = () => {
    setPhase('dropping');
    
    // If there is a void, trigger the wobble warning after 1.5 seconds
    setTimeout(() => {
      if (hasStructuralVoid) {
        setPhase('wobbling');
      } else {
        setPhase('stable');
      }
    }, 1500);
  };

  const handleDropZeros = () => {
    setPhase('dropping-zeros');
    setTimeout(() => setPhase('stable'), 1000);
  };

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-900 rounded-2xl overflow-hidden font-sans">
      
      {/* 2D HTML OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">The Mayan Altar</h2>
        <p className="text-stone-400 text-sm mt-1">The Physical Necessity of Zero</p>
      </div>

      {/* INPUT PANEL */}
      <div className="absolute top-6 right-6 z-10 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Target Number</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={inputNum} 
            onChange={(e) => {
              setInputNum(Math.max(1, Math.min(7199, parseInt(e.target.value) || 1)));
              setPhase('idle');
            }}
            disabled={phase !== 'idle' && phase !== 'stable'}
            className="w-24 bg-stone-800 text-emerald-400 font-mono text-xl p-2 rounded-xl border border-stone-600 focus:outline-none focus:border-emerald-500 text-center"
          />
          {phase === 'idle' && (
            <button onClick={handleSimulate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl flex items-center justify-center transition-colors">
              <Play size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ALERTS & RESOLUTIONS */}
      {phase === 'wobbling' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="bg-red-950/80 backdrop-blur-md border border-red-900 text-red-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl mb-4 animate-pulse">
            <ShieldAlert size={20} className="text-red-500" />
            <div>
              <p className="font-bold text-sm uppercase tracking-widest">Structural Collapse Imminent</p>
              <p className="text-xs opacity-80">Upper positional values have no foundation!</p>
            </div>
          </div>
          <button 
            onClick={handleDropZeros}
            className="bg-stone-200 hover:bg-white text-stone-900 px-8 py-3 rounded-full font-bold uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all"
          >
            <Anchor size={18} /> Drop Seashells (Zeros)
          </button>
        </div>
      )}

      {phase === 'stable' && hasStructuralVoid && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-emerald-950/80 backdrop-blur-md border border-emerald-900 text-emerald-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
{/*         <Sparkles size={20} className="text-emerald-500" /> */} 
            <div>
              <p className="font-bold text-sm uppercase tracking-widest">Altar Stabilized</p>
              <p className="text-xs opacity-80">The Zero placeholder preserves the structural integrity of mathematics.</p>
            </div>
          </div>
        </div>
      )}

      {/* THE 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [6, 4, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <Environment preset="city" />
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 - 0.05} target={[0, 2.5, 0]} />

          <group position={[0, -1, 0]}>
            <AltarTier level={0} value={tiers[0]} label="1s" phase={phase} isEmptyBelow={false} />
            <AltarTier level={1} value={tiers[1]} label="20s" phase={phase} isEmptyBelow={tiers[0] === 0} />
            <AltarTier level={2} value={tiers[2]} label="360s" phase={phase} isEmptyBelow={tiers[1] === 0 || tiers[0] === 0} />
          </group>

          <ContactShadows frames={1} resolution={512} scale={15} blur={2} opacity={0.6} far={10} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
    </div>
  );
}