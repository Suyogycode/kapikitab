'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function RadarScene({ 
  setHoverData 
}: { 
  setHoverData: (data: { x: number, y: number, z: number, isSnapped: boolean, snappedIndex: number | null }) => void 
}) {
  const pointerRef = useRef<THREE.Group>(null);
  
  // Real-world coordinates[cite: 24]
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

  // Handle Raycasted Pointer Movement
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!pointerRef.current) return;
    
    // Get raw 3D position
    let px = e.point.x;
    let py = e.point.y;

    // Convert back to real-world coordinates
    let realX = px * SCALE;
    let realY = py * SCALE;

    let isSnapped = false;
    let snappedIndex: number | null = null;
    let zVal = 0;

    // Check snapping to vertices
    const SNAP_RADIUS = 3; // in real-world units
    for (let i = 0; i < realVertices.length; i++) {
      const v = realVertices[i];
      const dist = Math.sqrt(Math.pow(realX - v.x, 2) + Math.pow(realY - v.y, 2));
      if (dist < SNAP_RADIUS) {
        realX = v.x;
        realY = v.y;
        px = v.x / SCALE;
        py = v.y / SCALE;
        isSnapped = true;
        snappedIndex = i;
        break;
      }
    }

    // Objective Function: Z = 250x + 75y
    zVal = 250 * realX + 75 * realY;

    // Update physical pointer position
    pointerRef.current.position.set(px, py, 0.1);

    // Bubble data up to UI HUD
    setHoverData({ x: realX, y: realY, z: zVal, isSnapped, snappedIndex });
  };

  useFrame((_, delta) => {
    if (pointerRef.current) {
      // Pulse effect on the cursor
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      pointerRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[-3, -5, 0]}>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[30, 30, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[5, 5, -0.1]} />
      <Line points={[[-2, 0, 0], [12, 0, 0]] as [number, number, number][]} color="#64748b" lineWidth={3} />
      <Line points={[[0, -2, 0], [0, 15, 0]] as [number, number, number][]} color="#64748b" lineWidth={3} />

      {/* Axis Labels */}
      <Billboard position={[12, -0.5, 0]}><Text fontSize={0.5} color="#94a3b8">Tables (x)</Text></Billboard>
      <Billboard position={[-1, 15, 0]}><Text fontSize={0.5} color="#94a3b8">Chairs (y)</Text></Billboard>

      {/* Invisible Catch Plane for Pointer Events */}
      <mesh position={[5, 5, 0]} onPointerMove={handlePointerMove} visible={false}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial />
      </mesh>

      {/* Feasible Region Polygon */}
      <group>
        <mesh position={[0, 0, 0.05]}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <Line points={outlinePoints} color="#3b82f6" lineWidth={3} position={[0, 0, 0.06]} />
      </group>

      {/* Glowing Vertex Nodes[cite: 24] */}
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

      {/* Hovering Profit Counter / Cursor[cite: 24] */}
      <group ref={pointerRef} position={[0, 0, 0.1]}>
        <mesh>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.1, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function VertexRadar() {
  const [hoverData, setHoverData] = useState({ x: 0, y: 0, z: 0, isSnapped: false, snappedIndex: null as number | null });

  // Max profit is at (10, 50) -> Z = 6250[cite: 24]
  const isMaxProfit = hoverData.isSnapped && hoverData.snappedIndex === 2;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Vertex Radar</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Theorem 1 guarantees the optimal value always occurs at a corner point[cite: 24].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Profit Counter[cite: 24]</span>
            {hoverData.isSnapped && (
              <span className="text-amber-400 font-mono text-xs font-bold animate-pulse">
                [ SNAPPED ] 🔔
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-2">
            
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-300">
              <div className="font-bold mb-1">Objective Function</div>
              <div className="text-sky-300 text-lg">Z = 250x + 75y</div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors duration-200 ${isMaxProfit ? 'border-amber-500/50 bg-amber-950/30' : hoverData.isSnapped ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between text-xs text-stone-400 mb-2">
                <span>Current Radar Pos:</span>
                <span>({hoverData.x.toFixed(1)}, {hoverData.y.toFixed(1)})</span>
              </div>
              <div className="flex justify-between items-end border-t border-stone-800 pt-2">
                <span className="text-stone-500">Live Profit (Z):</span>
                <span className={`text-2xl font-bold tracking-tight ${isMaxProfit ? 'text-amber-400' : hoverData.isSnapped ? 'text-emerald-400' : 'text-stone-200'}`}>
                  ₹{hoverData.z.toFixed(0)}
                </span>
              </div>
            </div>

          </div>

          <div className="text-xs text-stone-500 text-center mt-2 italic">
            Drag cursor across the region.
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isMaxProfit ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Maximum Profit Locked</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Testing hundreds of interior points versus the vertices reveals that the maximum profit invariably peaks right at the sharp corners of the polygon[cite: 24].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-amber-300">
            Peak Value Discovered: ₹6250 (10 Tables, 50 Chairs)[cite: 24]
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950 cursor-crosshair">
        <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <RadarScene setHoverData={setHoverData} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -5, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}