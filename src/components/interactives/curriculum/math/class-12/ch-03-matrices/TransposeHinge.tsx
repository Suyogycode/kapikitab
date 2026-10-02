'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

type MatrixType = 'symmetric' | 'skew';
type Phase = 'idle' | 'rotating' | 'done';

// ==================================================================
// DATA SETS
// ==================================================================
const SYMMETRIC_DATA = [
  { id: 1, val: 2, pos: [-2, 2, 0], isDiag: true },
  { id: 2, val: 4, pos: [0, 2, 0], isDiag: false },
  { id: 3, val: -5, pos: [2, 2, 0], isDiag: false },
  { id: 4, val: 4, pos: [-2, 0, 0], isDiag: false },
  { id: 5, val: 7, pos: [0, 0, 0], isDiag: true },
  { id: 6, val: 8, pos: [2, 0, 0], isDiag: false },
  { id: 7, val: -5, pos: [-2, -2, 0], isDiag: false },
  { id: 8, val: 8, pos: [0, -2, 0], isDiag: false },
  { id: 9, val: 1, pos: [2, -2, 0], isDiag: true },
];

const SKEW_DATA = [
  { id: 1, val: 0, pos: [-2, 2, 0], isDiag: true },
  { id: 2, val: 3, pos: [0, 2, 0], isDiag: false },
  { id: 3, val: -6, pos: [2, 2, 0], isDiag: false },
  { id: 4, val: -3, pos: [-2, 0, 0], isDiag: false },
  { id: 5, val: 0, pos: [0, 0, 0], isDiag: true },
  { id: 6, val: 4, pos: [2, 0, 0], isDiag: false },
  { id: 7, val: 6, pos: [-2, -2, 0], isDiag: false },
  { id: 8, val: -4, pos: [0, -2, 0], isDiag: false },
  { id: 9, val: 0, pos: [2, -2, 0], isDiag: true },
];

// ==================================================================
// 3D TILE COMPONENT
// ==================================================================
function GlassTile({ 
  val, pos, isDiag, progress, matrixType 
}: { 
  val: number; pos: number[]; isDiag: boolean; progress: number; matrixType: MatrixType;
}) {
  // If skew-symmetric and not on the diagonal, the value inverts smoothly during the 180° rotation[cite: 21]
  const isSkew = matrixType === 'skew';
  const displayVal = (isSkew && !isDiag) ? Math.round(val * Math.cos(progress * Math.PI)) : val;
  
  // Determine color based on current sign
  let color = "#475569"; // Gray for 0
  if (displayVal > 0) color = "#3b82f6"; // Blue for positive
  if (displayVal < 0) color = "#ef4444"; // Red for negative
  if (isDiag && isSkew) color = "#fcd34d"; // Gold for strictly 0 diagonal

  return (
    <group position={new THREE.Vector3(...pos)}>
      <mesh>
        <boxGeometry args={[1.6, 1.6, 0.4]} />
        <meshPhysicalMaterial 
          color={color} 
          transmission={0.8} 
          opacity={1} 
          roughness={0.2} 
          metalness={0.1} 
        />
      </mesh>
      {/* Billboard keeps the text perfectly upright and facing the camera, even while the box tumbles */}
      <Billboard position={[0, 0, 0]}>
        <Text fontSize={0.8} color="#ffffff" fontWeight="bold">
          {displayVal}
        </Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// 3D GRID SCENE (Must be inside Canvas)
// ==================================================================
function MatrixScene({ phase, progress, matrixType }: { phase: Phase; progress: number; matrixType: MatrixType }) {
  const gridGroupRef = useRef<THREE.Group>(null);
  const activeData = matrixType === 'symmetric' ? SYMMETRIC_DATA : SKEW_DATA;

  useFrame(() => {
    if (gridGroupRef.current) {
      // Rotate around the diagonal axis running through a11, a22, a33 (top-left to bottom-right)[cite: 21]
      const rotationAxis = new THREE.Vector3(1, -1, 0).normalize();
      gridGroupRef.current.setRotationFromAxisAngle(rotationAxis, progress * Math.PI);
    }
  });

  return (
    <group>
      {/* THICK DIAGONAL STEEL ROD[cite: 21] */}
      <mesh rotation={[0, 0, -Math.PI / 4]} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 12, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ROTATING TILE GRID[cite: 21] */}
      <group ref={gridGroupRef}>
        {activeData.map((tile) => (
          <GlassTile 
            key={tile.id} 
            val={tile.val} 
            pos={tile.pos} 
            isDiag={tile.isDiag} 
            progress={progress} 
            matrixType={matrixType} 
          />
        ))}
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function TransposeHinge() {
  const [matrixType, setMatrixType] = useState<MatrixType>('symmetric');
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase === 'rotating' || phase === 'done' || phase === 'idle') {
      setIsDragging(true);
      setPhase('rotating');
      document.body.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      // Map horizontal drag to 180° rotation progress
      let newProgress = progress + e.movementX * 0.005;
      if (newProgress < 0) newProgress = 0;
      if (newProgress > 1) newProgress = 1;
      setProgress(newProgress);
      
      if (newProgress >= 1) setPhase('done');
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'auto';
  };

  const resetMatrix = (type: MatrixType) => {
    setMatrixType(type);
    setPhase('idle');
    setProgress(0);
  };

  const isAhaMoment = matrixType === 'skew' && progress > 0.8;

  return (
    <div 
      className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown} 
      onPointerMove={handlePointerMove} 
      onPointerUp={handlePointerUp} 
      onPointerLeave={handlePointerUp}
    >
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Transpose Hinge</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Symmetric ($A' = A$) & Skew-Symmetric ($A' = -A$) Matrices[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Matrix Loader</span>
            <span className="text-sky-400 font-mono text-xs font-bold">{Math.round(progress * 180)}°</span>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => resetMatrix('symmetric')}
              className={`flex-1 py-2 rounded border font-bold font-mono text-sm ${matrixType === 'symmetric' ? 'bg-sky-900/50 border-sky-500 text-sky-400' : 'bg-stone-950 border-stone-700 text-stone-500 hover:border-stone-600'}`}
            >
              Symmetric
            </button>
            <button 
              onClick={() => resetMatrix('skew')}
              className={`flex-1 py-2 rounded border font-bold font-mono text-sm ${matrixType === 'skew' ? 'bg-amber-900/50 border-amber-500 text-amber-400' : 'bg-stone-950 border-stone-700 text-stone-500 hover:border-stone-600'}`}
            >
              Skew-Symmetric
            </button>
          </div>

          <div className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-950/30">
            <div className="text-emerald-400 font-bold mb-2">Drag to Transpose</div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={progress} 
              onChange={(e) => {
                setPhase('rotating');
                setProgress(parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="text-emerald-200 text-xs mt-2">
              Spin the entire grid 180° around the diagonal steel rod, swapping the top-right tiles with the bottom-left tiles[cite: 21].
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Zero-Diagonal Rule Proven</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The numbers land in their new spots, but their colors invert (representing the negative sign, $A' = -A$)[cite: 21]. Look closely at the diagonal steel rod[cite: 21]. 
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-white">
            Because the tiles on the rod a_ii never moved during the spin, the only way a number can equal its own negative a_ii = -a_ii is if it is exactly 0[cite: 21].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, -2, 14], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 20]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <MatrixScene phase={phase} progress={progress} matrixType={matrixType} />

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.4} far={15} position={[0, -5, -2]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}