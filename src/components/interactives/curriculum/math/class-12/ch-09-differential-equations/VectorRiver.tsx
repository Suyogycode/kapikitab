'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Mode = 'general' | 'particular';

// ==================================================================
// MATH FUNCTIONS & SLOPE FIELD
// ==================================================================
// Differential Equation: dy/dx = cos(x)
// General Solution: y = sin(x) + C
const dy_dx = (x: number) => Math.cos(x);
const F = (x: number, C: number) => Math.sin(x) + C;

const GRID_SIZE = 10;
const STEP = 1;

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function RiverScene({ mode, dropPos, setDropPos }: { mode: Mode, dropPos: { x: number, y: number } | null, setDropPos: (p: {x: number, y: number}) => void }) {
  const trailRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const [traceProgress, setTraceProgress] = useState(0);

  // 1. Generate the Slope Field (Hundreds of glowing 3D arrows)[cite: 18]
  const arrows = useMemo(() => {
    const items = [];
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x += STEP) {
      for (let y = -GRID_SIZE; y <= GRID_SIZE; y += STEP) {
        const slope = dy_dx(x);
        const angle = Math.atan(slope);
        items.push({ x, y, angle });
      }
    }
    return items;
  }, []);

  // 2. Generate Ghostly Parallel Curves (General Solution)[cite: 18]
  const generalCurves = useMemo(() => {
    const curves = [];
    for (let C = -8; C <= 8; C += 2) {
      const pts: [number, number, number][] = [];
      for (let x = -GRID_SIZE; x <= GRID_SIZE; x += 0.1) {
        pts.push([x, F(x, C), -0.1]);
      }
      curves.push(pts);
    }
    return curves;
  }, []);

  // 3. Particular Solution calculations
  let particularC = 0;
  let particularCurve: [number, number, number][] = [];
  
  if (dropPos) {
    // If y = sin(x) + C, then C = y - sin(x)
    particularC = dropPos.y - Math.sin(dropPos.x);
    for (let x = dropPos.x; x <= GRID_SIZE; x += 0.1) {
      particularCurve.push([x, F(x, particularC), 0.1]);
    }
  }

  useFrame((_, delta) => {
    if (mode === 'particular' && dropPos) {
      if (traceProgress < 1) {
        setTraceProgress(Math.min(1, traceProgress + delta * 0.3));
      }
    } else {
      setTraceProgress(0);
    }

    // Animate the leaf/sphere riding the river[cite: 18]
    if (sphereRef.current && particularCurve.length > 0) {
      const currentIndex = Math.floor(traceProgress * (particularCurve.length - 1));
      const currentPt = particularCurve[currentIndex];
      if (currentPt) {
        sphereRef.current.position.set(currentPt[0], currentPt[1], 0.2);
      }
    }
  });

  const handlePlaneClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDropPos({ x: e.point.x, y: e.point.y });
    setTraceProgress(0);
  };

  const visibleTraceCount = Math.max(1, Math.floor(traceProgress * particularCurve.length));
  const visibleParticularCurve = particularCurve.slice(0, visibleTraceCount);

  return (
    <group>
      {/* Invisible Click Plane for dropping the Initial Condition sphere */}
      <mesh position={[0, 0, 0]} onClick={handlePlaneClick} visible={false}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial />
      </mesh>

      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} />
      <Line points={[[-10, 0, -0.4], [10, 0, -0.4]] as [number, number, number][]} color="#475569" lineWidth={2} />
      <Line points={[[0, -10, -0.4], [0, 10, -0.4]] as [number, number, number][]} color="#475569" lineWidth={2} />

      {/* SLOPE FIELD ARROWS[cite: 18] */}
      {arrows.map((arrow, i) => (
        <group key={i} position={[arrow.x, arrow.y, -0.2]} rotation={[0, 0, arrow.angle]}>
          <Line points={[[-0.3, 0, 0], [0.3, 0, 0]] as [number, number, number][]} color="#0ea5e9" lineWidth={2} transparent opacity={0.4} />
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.2, 4]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}

      {/* GENERAL SOLUTION: Ghostly Parallel Curves[cite: 18] */}
      {mode === 'general' && generalCurves.map((curve, i) => (
        <Line key={`gc-${i}`} points={curve} color="#94a3b8" lineWidth={2} transparent opacity={0.3} />
      ))}

      {/* PARTICULAR SOLUTION: The Neon Trail[cite: 18] */}
      {mode === 'particular' && dropPos && (
        <group ref={trailRef}>
          {visibleParticularCurve.length > 1 && (
            <Line points={visibleParticularCurve} color="#f59e0b" lineWidth={5} />
          )}
          
          <mesh ref={sphereRef} position={[dropPos.x, dropPos.y, 0.2]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={1} />
          </mesh>

          {traceProgress > 0.1 && (
            <Billboard position={[dropPos.x, dropPos.y + 1.5, 0.2]}>
              <Text fontSize={0.5} color="#fcd34d" fontWeight="bold">
                y = sin(x) {particularC >= 0 ? `+ ${particularC.toFixed(2)}` : `- ${Math.abs(particularC).toFixed(2)}`}
              </Text>
            </Billboard>
          )}
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function VectorRiver() {
  const [mode, setMode] = useState<Mode>('general');
  const [dropPos, setDropPos] = useState<{ x: number, y: number } | null>(null);

  const handleSetGeneral = () => {
    setMode('general');
    setDropPos(null);
  };

  const handleSetParticular = () => {
    setMode('particular');
  };

  const isAhaMoment = mode === 'particular' && dropPos !== null;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Vector River</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            A general solution contains arbitrary constants representing an infinite family of curves[cite: 18].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Diff-Eq Engine</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-300">
              <div className="font-bold mb-1">Differential Equation</div>
              <div className="text-sky-300">dy/dx = cos(x)</div>
            </div>

            <div className={`p-3 rounded-lg border transition-colors ${mode === 'general' ? 'border-sky-500/50 bg-sky-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="font-bold mb-1 text-stone-300">General Solution</div>
              <div className={mode === 'general' ? 'text-sky-400' : 'text-stone-500'}>y = sin(x) + C</div>
            </div>

            <div className={`p-3 rounded-lg border transition-colors ${mode === 'particular' ? 'border-amber-500/50 bg-amber-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="font-bold mb-1 text-stone-300">Particular Solution</div>
              {dropPos ? (
                <div className="text-amber-400">
                  Initial Condition: ({dropPos.x.toFixed(1)}, {dropPos.y.toFixed(1)})
                </div>
              ) : (
                <div className={mode === 'particular' ? 'text-amber-400 animate-pulse' : 'text-stone-500'}>
                  Click anywhere on the grid to drop a condition[cite: 18].
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSetGeneral}
              className={`flex-1 py-2 rounded border font-bold text-xs tracking-widest uppercase transition-all ${mode === 'general' ? 'bg-sky-600 border-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-stone-800 border-stone-700 text-stone-400 hover:bg-stone-700'}`}
            >
              General
            </button>
            <button 
              onClick={handleSetParticular}
              className={`flex-1 py-2 rounded border font-bold text-xs tracking-widest uppercase transition-all ${mode === 'particular' ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-stone-800 border-stone-700 text-stone-400 hover:bg-stone-700'}`}
            >
              Particular
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Arbitrary Constant Eliminated</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Like dropping a leaf into a rushing river, the sphere is instantly carried by the arrows, leaving a bright neon trail behind it[cite: 18]. 
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-sm font-bold text-amber-300">
            Substituting a coordinate eliminates the arbitrary constant C, collapsing infinite possibilities into a single particular solution[cite: 18].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <RiverScene mode={mode} dropPos={dropPos} setDropPos={setDropPos} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}