'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MATH FUNCTIONS & CONSTANTS
// ==================================================================
// Function: f(x) = -0.2 * x^2 + 5
const f = (x: number) => -0.2 * Math.pow(x, 2) + 5;
const F = (x: number) => (-0.2 * Math.pow(x, 3)) / 3 + 5 * x;

const A_LIMIT = -4;
const B_LIMIT = 4;
const EXACT_AREA = F(B_LIMIT) - F(A_LIMIT);

// ==================================================================
// 3D SCENE COMPONENT (Must be inside Canvas)
// ==================================================================
function SqueezerScene({ n, isMelted }: { n: number, isMelted: boolean }) {
  const rectsGroupRef = useRef<THREE.Group>(null);
  const solidSlabRef = useRef<THREE.Mesh>(null);

  // 1. Generate the continuous curve line
  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -5; x <= 5; x += 0.1) {
      pts.push([x, f(x), 0]);
    }
    return pts;
  }, []);

  // 2. Generate Vertical Elementary Strips (Left Endpoint Approximation)
  const rectsData = useMemo(() => {
    const data = [];
    const dx = (B_LIMIT - A_LIMIT) / n;
    for (let i = 0; i < n; i++) {
      const startX = A_LIMIT + i * dx;
      const height = f(startX + dx / 2); // Use midpoint for better fit visually
      data.push({ x: startX + dx / 2, height, width: dx });
    }
    return data;
  }, [n]);

  // 3. Generate the Solid Slab Shape for the continuous area
  const slabShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(A_LIMIT, 0);
    shape.lineTo(A_LIMIT, f(A_LIMIT));
    for (let x = A_LIMIT; x <= B_LIMIT; x += 0.1) {
      shape.lineTo(x, f(x));
    }
    shape.lineTo(B_LIMIT, f(B_LIMIT));
    shape.lineTo(B_LIMIT, 0);
    shape.lineTo(A_LIMIT, 0);
    return shape;
  }, []);

  useFrame((_, delta) => {
    // Animate the transition between discrete strips and continuous volume
    if (rectsGroupRef.current && solidSlabRef.current) {
      const targetRectOpacity = isMelted ? 0.0 : 0.8;
      const targetSlabOpacity = isMelted ? 0.8 : 0.0;
      const targetSlabZ = isMelted ? 0.5 : 0.01;

      // Fade rectangles out
      rectsGroupRef.current.children.forEach((mesh: any) => {
        if (mesh.material) {
          mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, targetRectOpacity, delta * 5);
          mesh.visible = mesh.material.opacity > 0.01;
        }
      });

      // Fade and extrude solid slab in
      const slabMat = solidSlabRef.current.material as THREE.MeshStandardMaterial;
      slabMat.opacity = THREE.MathUtils.lerp(slabMat.opacity, targetSlabOpacity, delta * 3);
      solidSlabRef.current.visible = slabMat.opacity > 0.01;
      solidSlabRef.current.scale.z = THREE.MathUtils.lerp(solidSlabRef.current.scale.z, targetSlabZ, delta * 4);
    }
  });

  return (
    <group>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.6]} />
      <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      <Line points={[[0, -2, -0.1], [0, 8, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      
      {/* Boundary Lines x = a and x = b */}
      <Line points={[[A_LIMIT, 0, 0], [A_LIMIT, f(A_LIMIT), 0]] as [number, number, number][]} color="#ef4444" lineWidth={2} dashed dashScale={4} />
      <Line points={[[B_LIMIT, 0, 0], [B_LIMIT, f(B_LIMIT), 0]] as [number, number, number][]} color="#ef4444" lineWidth={2} dashed dashScale={4} />

      {/* Axis Labels */}
      <Billboard position={[0.5, 7.5, 0]}><Text fontSize={0.4} color="#94a3b8">Y</Text></Billboard>
      <Billboard position={[9.5, 0.5, 0]}><Text fontSize={0.4} color="#94a3b8">X</Text></Billboard>
      <Billboard position={[A_LIMIT, -0.5, 0]}><Text fontSize={0.4} color="#ef4444" fontWeight="bold">x = a</Text></Billboard>
      <Billboard position={[B_LIMIT, -0.5, 0]}><Text fontSize={0.4} color="#ef4444" fontWeight="bold">x = b</Text></Billboard>

      {/* The Continuous Curve f(x) */}
      <Line points={curvePoints} color="#ef4444" lineWidth={4} />

      {/* DISCRETE ELEMENTARY STRIPS */}
      <group ref={rectsGroupRef}>
        {rectsData.map((rect, i) => (
          <mesh key={`rect-${n}-${i}`} position={[rect.x, rect.height / 2, 0.25]}>
            {/* Draw strips with slight gaps to emphasize discrete dx */}
            <boxGeometry args={[rect.width * 0.9, rect.height, 0.5]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} roughness={0.2} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* SOLID GEOMETRIC VOLUME SLAB */}
      <mesh ref={solidSlabRef} position={[0, 0, 0]}>
        <extrudeGeometry args={[slabShape, { depth: 1, bevelEnabled: false }]} />
        <meshStandardMaterial color="#fcd34d" transparent opacity={0} roughness={0.2} metalness={0.4} emissive="#d97706" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function VerticalSqueezer() {
  const [n, setN] = useState<number>(4);

  // Calculate current approximation
  const dx = (B_LIMIT - A_LIMIT) / n;
  let currentSum = 0;
  for (let i = 0; i < n; i++) {
    const midX = A_LIMIT + i * dx + dx / 2;
    currentSum += f(midX) * dx;
  }

  // The AHA! Moment triggers when n approaches infinity (we use 100 as the max resolution threshold)
  const isMelted = n >= 100;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Vertical Squeezer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Total area is the sum of infinite vertical strips of height y and width dx.
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Area Accumulator</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Strip Properties */}
            <div className={`p-3 rounded-lg border transition-colors ${!isMelted ? 'border-blue-500/50 bg-blue-950/30 text-blue-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">Elementary Strips</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Strip Width (dx):</span>
                <span className="font-bold">{dx.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-stone-400">Total Strips (n):</span>
                <span className="font-bold">{n >= 100 ? 'Infinite (approaching)' : n}</span>
              </div>
            </div>

            {/* Summation HUD */}
            <div className={`p-3 rounded-lg border transition-colors ${isMelted ? 'border-amber-500/50 bg-amber-950/30 text-amber-400' : 'border-stone-800 bg-stone-950 text-stone-300'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">Live Summation</span>
              </div>
              <div className="flex justify-between items-center text-lg mt-1">
                <span className="text-stone-400 text-xs">Total Area:</span>
                <span className="font-bold">{isMelted ? EXACT_AREA.toFixed(3) : currentSum.toFixed(3)}</span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-lg border border-sky-500/50 bg-sky-950/30">
            <div className="flex justify-between text-sky-400 font-bold mb-2 text-xs">
              <span>Coarse</span>
              <span>Resolution Dial (dx)</span>
              <span>dx -{'>'} 0</span>
            </div>
            <input 
              type="range" min="4" max="100" step="1" 
              value={n} 
              onChange={(e) => setN(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isMelted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Continuous Solid Volume Formed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            When the strip width dx approaches zero, the jagged tops of the rectangles melt into a smooth, translucent volumetric slab.
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-amber-300">
            An integral is simply a continuous summation of infinitely thin slices.
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 15]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} />

            <SqueezerScene n={n} isMelted={isMelted} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -0.1, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}