'use client';

import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function SweeperScene({ zValue }: { zValue: number }) {
  // Real-world coordinates for the feasible region[cite: 25]
  const realVertices = [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 10, y: 50 },
    { x: 0, y: 60 }
  ];

  // Scale factor to map real-world to 3D space
  const SCALE = 5; 
  const scaledVertices = realVertices.map(v => new THREE.Vector3(v.x / SCALE, v.y / SCALE, 0));

  // Create Polygon Shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(scaledVertices[0].x, scaledVertices[0].y);
    scaledVertices.forEach(v => s.lineTo(v.x, v.y));
    s.lineTo(scaledVertices[0].x, scaledVertices[0].y);
    return s;
  }, [scaledVertices]);

  // Polygon Outline Points
  const outlinePoints = useMemo(() => {
    const pts = scaledVertices.map(v => [v.x, v.y, 0] as [number, number, number]);
    pts.push([scaledVertices[0].x, scaledVertices[0].y, 0]); // close the loop
    return pts;
  }, [scaledVertices]);

  // Iso-Profit Line Points: Z = 250x + 75y => y = (Z - 250x) / 75[cite: 25]
  const isoLinePoints = useMemo(() => {
    const x1 = -5; // Extended boundary left
    const x2 = 25; // Extended boundary right
    
    const y1 = (zValue - 250 * x1) / 75;
    const y2 = (zValue - 250 * x2) / 75;

    return [
      [x1 / SCALE, y1 / SCALE, 0.1] as [number, number, number],
      [x2 / SCALE, y2 / SCALE, 0.1] as [number, number, number]
    ];
  }, [zValue]);

  return (
    <group position={[-3, -5, 0]}>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[30, 30, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[5, 5, -0.1]} />
      <Line points={[[-2, 0, 0], [12, 0, 0]] as [number, number, number][]} color="#64748b" lineWidth={3} />
      <Line points={[[0, -2, 0], [0, 15, 0]] as [number, number, number][]} color="#64748b" lineWidth={3} />

      {/* Axis Labels */}
      <Billboard position={[12, -0.5, 0]}><Text fontSize={0.5} color="#94a3b8">Tables (x)</Text></Billboard>
      <Billboard position={[-1, 15, 0]}><Text fontSize={0.5} color="#94a3b8">Chairs (y)</Text></Billboard>

      {/* Feasible Region Polygon */}
      <group>
        <mesh position={[0, 0, 0.05]}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <Line points={outlinePoints} color="#3b82f6" lineWidth={3} position={[0, 0, 0.06]} />
      </group>

      {/* Glowing Vertex Nodes */}
      {scaledVertices.map((v, i) => (
        <group key={`vertex-${i}`} position={[v.x, v.y, 0.1]}>
          <mesh>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={1} />
          </mesh>
          <Billboard position={[0, 0.6, 0]}>
            <Text fontSize={0.4} color="#fcd34d" fontWeight="bold">
              ({realVertices[i].x}, {realVertices[i].y})
            </Text>
          </Billboard>
        </group>
      ))}

      {/* Iso-Profit Sweeper Line[cite: 25] */}
      <group>
        <Line points={isoLinePoints} color="#f43f5e" lineWidth={5} />
        <Billboard position={[isoLinePoints[0][0] + 1, isoLinePoints[0][1] + 1, 0.2]}>
          <Text fontSize={0.5} color="#f43f5e" fontWeight="bold">Z = {zValue}</Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function IsoProfitSweeper() {
  const [zValue, setZValue] = useState<number>(0);

  // Maximum Profit at (10, 50) is 6250[cite: 25]
  const isOptimal = zValue === 6250;
  const isOutOfBounds = zValue > 6250;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Iso-Profit Sweeper</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Slide the parallel "iso-profit" line across the feasible region to visually maximize the objective function[cite: 25].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Optimization Controls</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-300">
              <div className="font-bold mb-1">Objective Function</div>
              <div className="text-sky-300 text-lg">Z = 250x + 75y</div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors duration-200 ${isOptimal ? 'border-amber-500/50 bg-amber-950/30' : isOutOfBounds ? 'border-red-500/50 bg-red-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between items-end">
                <span className="text-stone-500">Target Profit (Z):</span>
                <span className={`text-2xl font-bold tracking-tight ${isOptimal ? 'text-amber-400 animate-pulse' : isOutOfBounds ? 'text-red-400' : 'text-stone-200'}`}>
                  ₹{zValue}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-950/20 mb-4">
            <div className="text-rose-400 font-bold mb-3 text-xs text-center uppercase tracking-widest">
              Push Iso-Profit Line[cite: 25]
            </div>
            
            <input 
              type="range" min="0" max="7500" step="50" 
              value={zValue} 
              onChange={(e) => setZValue(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <button 
            onClick={() => setZValue(6250)}
            className="w-full py-2.5 rounded-lg border border-amber-500/50 text-amber-400 hover:bg-amber-950/50 font-bold text-xs tracking-widest uppercase transition-colors"
          >
            Snap to Optimal Vertex
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isOptimal ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Absolute Last Corner Kissed[cite: 25]</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The optimal solution is always at the boundary corner because it is the very last point the profit line touches before leaving the legal zone[cite: 25].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-amber-300">
            Optimal Output: ₹6250 (Vertex: 10, 50)
          </div>
        </div>
      </div>

      {/* OUT OF BOUNDS WARNING */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isOutOfBounds ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-red-900/95 border border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-red-300 text-xs uppercase tracking-widest font-bold mb-2">Infeasible Region</p>
          <p className="text-stone-100 text-sm leading-relaxed">
            The profit line has fully exited the feasible polygon. No valid resource allocation exists for this profit level[cite: 25].
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
          <React.Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <Environment preset="city" />
            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
            <SweeperScene zValue={zValue} />
            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -5, -1]} />
          </React.Suspense>
        </Canvas>
      </div>
    </div>
  );
}