'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';

type Phase = 'initial' | 'generated' | 'smashed';

// ==================================================================
// PERMUTATION LOGIC
// ==================================================================
const getPermutations = (arr: string[]): string[][] => {
  if (arr.length === 0) return [[]];
  const result: string[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = getPermutations(rest);
    for (const p of perms) {
      result.push([arr[i], ...p]);
    }
  }
  return result;
};

// ==================================================================
// 3D WORD BLOCK ENGINE
// ==================================================================
function WordBlock({ 
  letters, 
  index, 
  phase, 
  smashedIndex 
}: { 
  letters: string[], 
  index: number, 
  phase: Phase, 
  smashedIndex: number 
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate target positions based on the current phase
  const targetPos = useMemo(() => {
    if (phase === 'initial') {
      return new THREE.Vector3(0, 0, 0); // Hide at center
    } 
    
    if (phase === 'generated') {
      // 24 items: 6 columns x 4 rows
      const col = index % 6;
      const row = Math.floor(index / 6);
      return new THREE.Vector3((col * 2.5) - 6.25, (row * -1.5) + 2.25, 0);
    } 
    
    // 'smashed' phase
    // 12 items: 4 columns x 3 rows
    const col = smashedIndex % 4;
    const row = Math.floor(smashedIndex / 4);
    // Add a microscopic Z-offset to prevent z-fighting when blocks fuse
    return new THREE.Vector3((col * 3.5) - 5.25, (row * -2) + 2, index * 0.001);
    
  }, [phase, index, smashedIndex]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Smoothly fly to target position
    groupRef.current.position.lerp(targetPos, delta * 6);
    
    // Handle visibility/scale
    const targetScale = phase === 'initial' ? 0 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
  });

  return (
    <group ref={groupRef}>
      {letters.map((letter, i) => {
        // Strip the subscript 1 or 2 if we are in the smashed phase
        const displayLetter = phase === 'smashed' ? letter.replace(/[12]/, '') : letter;
        const isO = displayLetter.startsWith('O');
        
        return (
          <group key={i} position={[(i * 0.5) - 0.75, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.45, 0.6, 0.2]} />
              <meshStandardMaterial 
                color={isO ? "#3b82f6" : "#64748b"} 
                metalness={0.2} 
                roughness={0.2} 
              />
            </mesh>
            {/* Fixed: Removed the missing font prop so it doesn't suspend indefinitely */}
            <Text 
              position={[0, 0, 0.11]} 
              fontSize={0.35} 
              color="#ffffff"
            >
              {displayLetter}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AnagramSmasher() {
  const [phase, setPhase] = useState<Phase>('initial');

  // Pre-calculate the 24 distinct permutations of R, O1, O2, T
  const { allPerms, purePerms } = useMemo(() => {
    const perms = getPermutations(['R', 'O1', 'O2', 'T']);
    
    // Determine unique "smashed" structures to assign grid indices
    const uniquePures: string[] = [];
    
    const mappedPerms = perms.map((letters) => {
      const pureString = letters.join('').replace(/[12]/g, '');
      if (!uniquePures.includes(pureString)) {
        uniquePures.push(pureString);
      }
      return {
        letters,
        pureString,
        smashedIndex: uniquePures.indexOf(pureString)
      };
    });

    return { allPerms: mappedPerms, purePerms: uniquePures };
  }, []);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Anagram Smasher</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing permutations with identical objects using <span className="font-mono text-blue-400">ROOT</span>.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[280px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Physics Engine</span>
            <button 
              onClick={() => setPhase('initial')}
              className="text-stone-500 hover:text-stone-300 font-mono text-xs underline transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm">
            <button 
              onClick={() => setPhase('generated')}
              disabled={phase === 'generated' || phase === 'smashed'}
              className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest ${phase === 'initial' ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'}`}
            >
              GENERATE (4!)
            </button>
            <button 
              onClick={() => setPhase('smashed')}
              disabled={phase !== 'generated'}
              className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest ${phase === 'generated' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'}`}
            >
              REMOVE SUBSCRIPTS (÷2!)
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {phase === 'smashed' && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Visceral Compression</p>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
              Instantly, O₁ and O₂ lose their markings and become identical. The engine detects duplicates across the grid and physically fuses them together. 
            </p>
            <div className="inline-block bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-base font-bold">
              <span className="text-blue-400">24 Items</span> ÷ <span className="text-red-400">2! (Internal Permutations)</span> = <span className="text-emerald-400">12 Unique Words</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={5} 
              maxDistance={25}
              target={[0, 0, 0]}
            />

            <group>
              {allPerms.map((perm, index) => (
                <WordBlock 
                  key={index} 
                  letters={perm.letters} 
                  index={index} 
                  phase={phase} 
                  smashedIndex={perm.smashedIndex} 
                />
              ))}
            </group>

            <ContactShadows frames={1} resolution={512} scale={30} blur={2} opacity={0.4} far={10} position={[0, -4, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}