'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// DATA SETS & MATH CALCULATIONS
// ==================================================================

// Original 2x4 Coordinate Matrix X[cite: 22]
// Row 1: x-coordinates, Row 2: y-coordinates
const X_MATRIX = [
  [1, 4, 5, 2],
  [1, 1, 4, 3]
];

// Combine into vertices for easier rendering
const ORIGINAL_VERTICES = X_MATRIX[0].map((x, i) => [x, X_MATRIX[1][i], 0] as [number, number, number]);

// ==================================================================
// 3D SCENE COMPONENT (Must be inside Canvas)
// ==================================================================
function TransformerScene({ t11, t12, t21, t22 }: { t11: number, t12: number, t21: number, t22: number }) {
  
  // Calculate TX = X_new[cite: 22]
  const transformedVertices = useMemo(() => {
    return ORIGINAL_VERTICES.map(([x, y]) => [
      t11 * x + t12 * y,
      t21 * x + t22 * y,
      0.1 // Slight Z offset to prevent z-fighting with the grid
    ] as [number, number, number]);
  }, [t11, t12, t21, t22]);

  // Create solid filled shapes for the original and transformed polygons
  const originalShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(ORIGINAL_VERTICES[0][0], ORIGINAL_VERTICES[0][1]);
    ORIGINAL_VERTICES.forEach((v, i) => {
      if (i > 0) shape.lineTo(v[0], v[1]);
    });
    shape.lineTo(ORIGINAL_VERTICES[0][0], ORIGINAL_VERTICES[0][1]);
    return shape;
  }, []);

  const transformedShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(transformedVertices[0][0], transformedVertices[0][1]);
    transformedVertices.forEach((v, i) => {
      if (i > 0) shape.lineTo(v[0], v[1]);
    });
    shape.lineTo(transformedVertices[0][0], transformedVertices[0][1]);
    return shape;
  }, [transformedVertices]);

  // Close the line loops
  const originalLine = [...ORIGINAL_VERTICES, ORIGINAL_VERTICES[0]];
  const transformedLine = [...transformedVertices, transformedVertices[0]];

  return (
    <group>
      {/* 2D Coordinate Grid[cite: 22] */}
      <gridHelper args={[40, 40, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]} />
      
      {/* Axes */}
      <Line points={[[-20, 0, 0], [20, 0, 0]] as [number, number, number][]} color="#64748b" lineWidth={3} />
      <Line points={[[0, -20, 0], [0, 20, 0]] as [number, number, number][]} color="#64748b" lineWidth={3} />

      {/* ORIGINAL SHAPE (Ghosted) */}
      <mesh position={[0, 0, 0]}>
        <shapeGeometry args={[originalShape]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Line points={originalLine} color="#94a3b8" lineWidth={2} dashed dashScale={4} />

      {/* TRANSFORMED SHAPE (Glowing Active Matrix)[cite: 22] */}
      <mesh position={[0, 0, 0.05]}>
        <shapeGeometry args={[transformedShape]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Line points={transformedLine} color="#34d399" lineWidth={5} />

      {/* Vertex Labels for Transformed Shape */}
      {transformedVertices.map((v, i) => (
        <group key={`v-${i}`} position={v}>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="#fcd34d" />
          </mesh>
          <Billboard position={[0, 0.6, 0.1]}>
            <Text fontSize={0.5} color="#fcd34d" fontWeight="bold">
              ({v[0].toFixed(1)}, {v[1].toFixed(1)})
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function CompositionTransformer() {
  // Transformation Matrix T (2x2)[cite: 22]
  const [t11, setT11] = useState(1);
  const [t12, setT12] = useState(0);
  const [t21, setT21] = useState(0);
  const [t22, setT22] = useState(1);

  const applyPreset = (preset: 'identity' | 'reflectY' | 'double' | 'shearX') => {
    if (preset === 'identity') { setT11(1); setT12(0); setT21(0); setT22(1); }
    if (preset === 'reflectY') { setT11(-1); setT12(0); setT21(0); setT22(1); } // Flips across Y-axis[cite: 22]
    if (preset === 'double') { setT11(2); setT12(0); setT21(0); setT22(2); } // Doubles size[cite: 22]
    if (preset === 'shearX') { setT11(1); setT12(1.5); setT21(0); setT22(1); }
  };

  const isIdentity = t11 === 1 && t12 === 0 && t21 === 0 && t22 === 1;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Composition Transformer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Multiplying by a matrix is applying a spatial warp drive to a geometric universe[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Transformation Matrix T</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 bg-stone-950 p-4 rounded-lg border border-stone-800">
            {/* T11 */}
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-mono text-xs text-center">t11</span>
              <input type="range" min="-3" max="3" step="0.1" value={t11} onChange={(e) => setT11(parseFloat(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <span className="text-emerald-400 font-mono text-center font-bold">{t11.toFixed(1)}</span>
            </div>
            {/* T12 */}
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-mono text-xs text-center">t12</span>
              <input type="range" min="-3" max="3" step="0.1" value={t12} onChange={(e) => setT12(parseFloat(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <span className="text-emerald-400 font-mono text-center font-bold">{t12.toFixed(1)}</span>
            </div>
            {/* T21 */}
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-mono text-xs text-center">t21</span>
              <input type="range" min="-3" max="3" step="0.1" value={t21} onChange={(e) => setT21(parseFloat(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <span className="text-emerald-400 font-mono text-center font-bold">{t21.toFixed(1)}</span>
            </div>
            {/* T22 */}
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-mono text-xs text-center">t22</span>
              <input type="range" min="-3" max="3" step="0.1" value={t22} onChange={(e) => setT22(parseFloat(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <span className="text-emerald-400 font-mono text-center font-bold">{t22.toFixed(1)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            <button onClick={() => applyPreset('identity')} className="py-2 border border-stone-700 bg-stone-800 text-stone-300 rounded hover:bg-stone-700 transition">Identity</button>
            <button onClick={() => applyPreset('reflectY')} className="py-2 border border-sky-500/50 bg-sky-950/30 text-sky-400 rounded hover:bg-sky-900/50 transition">Reflect Y-Axis</button>
            <button onClick={() => applyPreset('double')} className="py-2 border border-amber-500/50 bg-amber-950/30 text-amber-400 rounded hover:bg-amber-900/50 transition">Double Size</button>
            <button onClick={() => applyPreset('shearX')} className="py-2 border border-purple-500/50 bg-purple-950/30 text-purple-400 rounded hover:bg-purple-900/50 transition">Shear X</button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${!isIdentity ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Linear Transformation Achieved</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As you drag the sliders of T, the physical shape on the grid stretches, shears, and rotates[cite: 22]. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-3">
            <div className="bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 font-mono text-sm text-stone-300">
              T = [[-1, 0], [0, 1]] ➔ Flips across Y-axis[cite: 22]
            </div>
            <div className="bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 font-mono text-sm text-stone-300">
              T = [[2, 0], [0, 2]] ➔ Doubles its size[cite: 22]
            </div>
          </div>
          <p className="text-emerald-300 font-mono text-sm font-bold">
            The engine continuously calculates the product TX = X_new and plots the new coordinates in real-time[cite: 22].
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 20]} intensity={1.5} />
            <Environment preset="city" />

            {/* Locked OrbitControls for 2D Grid viewing */}
            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <TransformerScene t11={t11} t12={t12} t21={t21} t22={t22} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}