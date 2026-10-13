'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type ShapeMode = 'circle' | 'ellipse';
type Phase = 'idle' | 'slicing' | 'isolate' | 'multiply';

// ==================================================================
// 3D QUADRANT COMPONENT
// ==================================================================
function Quadrant({ 
  a, b, quadIndex, phase 
}: { 
  a: number, b: number, quadIndex: 1 | 2 | 3 | 4, phase: Phase 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  // Generate the Quarter Geometry (Q1)
  const quarterShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    // Draw the curved arc for Q1
    for (let t = 0; t <= Math.PI / 2 + 0.01; t += 0.05) {
      shape.lineTo(a * Math.cos(t), b * Math.sin(t));
    }
    shape.lineTo(0, 0);
    return shape;
  }, [a, b]);

  useFrame((_, delta) => {
    if (!meshRef.current || !edgesRef.current) return;

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const edgeMat = edgesRef.current.material as THREE.LineBasicMaterial;

    // Target States based on Phase
    let targetOpacity = 0.8;
    let targetScale = 1;
    let targetColor = new THREE.Color("#3b82f6"); // Default Blue
    let targetPos = new THREE.Vector3(0, 0, 0);

    // Q1 is always visible and colored prominently when isolated
    if (quadIndex === 1) {
      if (phase === 'isolate' || phase === 'multiply') {
        targetColor = new THREE.Color("#f59e0b"); // Highlight Q1 Gold
      }
      if (phase === 'slicing') {
        targetPos.set(0.2, 0.2, 0); // Slight separation
      }
    } else {
      // Logic for Q2, Q3, Q4
      if (phase === 'slicing') {
        if (quadIndex === 2) targetPos.set(-0.2, 0.2, 0);
        if (quadIndex === 3) targetPos.set(-0.2, -0.2, 0);
        if (quadIndex === 4) targetPos.set(0.2, -0.2, 0);
      } else if (phase === 'isolate') {
        targetOpacity = 0; // Hide other quadrants to focus on Q1[cite: 22]
        targetScale = 0;
      } else if (phase === 'multiply') {
        targetOpacity = 0.8;
        targetScale = 1;
        targetColor = new THREE.Color("#fcd34d"); // Light gold for cloned quadrants
      }
    }

    // Apply Lerp Animations
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 4);
    edgeMat.opacity = THREE.MathUtils.lerp(edgeMat.opacity, targetOpacity, delta * 4);
    
    meshRef.current.visible = mat.opacity > 0.01;
    edgesRef.current.visible = edgeMat.opacity > 0.01;

    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 5));
    edgesRef.current.scale.setScalar(THREE.MathUtils.lerp(edgesRef.current.scale.x, targetScale, delta * 5));
    
    mat.color.lerp(targetColor, delta * 4);
    meshRef.current.position.lerp(targetPos, delta * 4);
    edgesRef.current.position.lerp(targetPos, delta * 4);
  });

  // Base rotations to arrange the 4 identical Q1 shapes into a full circle/ellipse
  let rotationZ = 0;
  if (quadIndex === 2) rotationZ = Math.PI / 2;
  if (quadIndex === 3) rotationZ = Math.PI;
  if (quadIndex === 4) rotationZ = -Math.PI / 2;

  // Extrude settings for 3D depth
  const extrudeSettings = { depth: 0.5, bevelEnabled: false };

  return (
    <group rotation={[0, 0, rotationZ]}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <extrudeGeometry args={[quarterShape, extrudeSettings]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Wireframe edges for clear slicing visualization */}
      <lineSegments ref={edgesRef} position={[0, 0, 0.5]}>
        <edgesGeometry args={[new THREE.ShapeGeometry(quarterShape)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}

// ==================================================================
// SCENE ASSEMBLY
// ==================================================================
function SymmetryScene({ mode, phase }: { mode: ShapeMode, phase: Phase }) {
  // Define dimensions based on mode
  const a = mode === 'circle' ? 3 : 4;
  const b = mode === 'circle' ? 3 : 2;

  return (
    <group>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.6]} />
      <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      <Line points={[[0, -10, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      
      {/* Slicing Tool Lasers (Only visible during slicing)[cite: 22] */}
      {phase === 'slicing' && (
        <group position={[0, 0, 0.6]}>
          <Line points={[[-5, 0, 0], [5, 0, 0]] as [number, number, number][]} color="#ef4444" lineWidth={4} dashed dashScale={4} />
          <Line points={[[0, -5, 0], [0, 5, 0]] as [number, number, number][]} color="#ef4444" lineWidth={4} dashed dashScale={4} />
        </group>
      )}

      {/* Axis Labels */}
      <Billboard position={[0.5, 8.5, 0]}><Text fontSize={0.4} color="#94a3b8">Y</Text></Billboard>
      <Billboard position={[9.5, 0.5, 0]}><Text fontSize={0.4} color="#94a3b8">X</Text></Billboard>

      {/* The 4 Quadrants */}
      <Quadrant a={a} b={b} quadIndex={1} phase={phase} />
      <Quadrant a={a} b={b} quadIndex={2} phase={phase} />
      <Quadrant a={a} b={b} quadIndex={3} phase={phase} />
      <Quadrant a={a} b={b} quadIndex={4} phase={phase} />

      {/* Multiplier Handle Label[cite: 22] */}
      {phase === 'multiply' && (
        <Billboard position={[a + 1.5, b + 1.5, 1]}>
          <Text fontSize={1.2} color="#fcd34d" fontWeight="bold">x 4</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SymmetricQuadrant() {
  const [mode, setMode] = useState<ShapeMode>('circle');
  const [phase, setPhase] = useState<Phase>('idle');

  const advancePhase = () => {
    if (phase === 'idle') setPhase('slicing');
    else if (phase === 'slicing') setPhase('isolate');
    else if (phase === 'isolate') setPhase('multiply');
    else {
      setPhase('idle');
    }
  };

  const isAhaMoment = phase === 'multiply';
  const a = mode === 'circle' ? 3 : 4;
  const b = mode === 'circle' ? 3 : 2;
  const totalArea = Math.PI * a * b;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Symmetric Quadrant</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Simplify area calculations by exploiting symmetry across coordinate axes[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Shape Config</span>
          </div>
          
          {/* Shape Toggle */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => { setMode('circle'); setPhase('idle'); }}
              className={`flex-1 py-2 rounded border font-bold font-mono text-sm ${mode === 'circle' ? 'bg-sky-900/50 border-sky-500 text-sky-400' : 'bg-stone-950 border-stone-700 text-stone-500 hover:border-stone-600'}`}
            >
              Circle
            </button>
            <button 
              onClick={() => { setMode('ellipse'); setPhase('idle'); }}
              className={`flex-1 py-2 rounded border font-bold font-mono text-sm ${mode === 'ellipse' ? 'bg-sky-900/50 border-sky-500 text-sky-400' : 'bg-stone-950 border-stone-700 text-stone-500 hover:border-stone-600'}`}
            >
              Ellipse
            </button>
          </div>

          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-300">
              <div className="font-bold mb-1">
                {mode === 'circle' ? "x^2 + y^2 = a^2" : "(x^2 / a^2) + (y^2 / b^2) = 1"}
              </div>
            </div>

            {/* Q1 Isolate Box[cite: 22] */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'isolate' || phase === 'multiply' ? 'border-amber-500/50 bg-amber-950/30' : 'border-stone-800 bg-stone-950 text-stone-600'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={phase === 'isolate' || phase === 'multiply' ? "text-amber-400 font-bold" : "text-stone-500"}>Quadrant 1 Region</span>
              </div>
              <div className="text-xs text-amber-200">x {'>'}= 0, y {'>'}= 0</div>
              <div className="text-xs text-amber-200 mt-1">y = sqrt({mode === 'circle' ? 'a^2' : 'b^2(1 - x^2/a^2)'} - x^2)</div>
            </div>

            {/* Total Area Box */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'multiply' ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-stone-800 bg-stone-950 text-stone-600'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={phase === 'multiply' ? "text-emerald-400 font-bold" : "text-stone-500"}>Total Computed Area</span>
              </div>
              <div className="text-xs text-emerald-200">4 * Integral [0 to a] y dx</div>
              <div className="font-bold text-emerald-300 mt-1">
                = {mode === 'circle' ? 'pi * a^2' : 'pi * a * b'} ({totalArea.toFixed(2)})
              </div>
            </div>
          </div>

          <button 
            onClick={advancePhase}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'multiply' ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700' : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}
          >
            {phase === 'idle' ? 'Slice Shape into 4' : 
             phase === 'slicing' ? 'Isolate First Quadrant' : 
             phase === 'isolate' ? 'Expand x4 (Multiply)' : 'Reset Shape'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Leveraging Symmetry</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            By isolating the first quadrant, you avoided messy negative-number bounds[cite: 22].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-amber-300">
            Watching the single integrated quadrant clone and rotate to fill the entire area provides an unforgettable visual intuition for leveraging symmetry in calculus[cite: 22].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 15]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <SymmetryScene mode={mode} phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -0.1, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}