'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MATH & GEOMETRY UTILS
// ==================================================================

// Check if a point satisfies all constraints[cite: 23]
// x >= 0, y >= 0, 5x + y <= c1, x + y <= c2
const isValid = (x: number, y: number, c1: number, c2: number) => {
  const eps = 0.001;
  return (
    x >= -eps && 
    y >= -eps && 
    (5 * x + y) <= c1 + eps && 
    (x + y) <= c2 + eps
  );
};

// Sort vertices counter-clockwise to form a valid polygon
const sortVertices = (pts: THREE.Vector2[]) => {
  if (pts.length === 0) return pts;
  const center = pts.reduce((acc, p) => acc.add(p), new THREE.Vector2()).divideScalar(pts.length);
  return pts.sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);
    return angleA - angleB;
  });
};

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function GridScene({ c1, c2 }: { c1: number, c2: number }) {
  // We scale down the values by a factor of 10 for rendering in the 3D space
  const scale = 10;
  const sC1 = c1 / scale;
  const sC2 = c2 / scale;

  // Calculate Feasible Region Vertices[cite: 23]
  const feasiblePolygon = useMemo(() => {
    // Potential intersection points of the 4 bounding lines (x=0, y=0, 5x+y=c1, x+y=c2)
    const points: THREE.Vector2[] = [];
    
    // 1. (0, 0)
    points.push(new THREE.Vector2(0, 0));
    // 2. x=0, 5x+y=c1 -> (0, c1)
    points.push(new THREE.Vector2(0, sC1));
    // 3. x=0, x+y=c2 -> (0, c2)
    points.push(new THREE.Vector2(0, sC2));
    // 4. y=0, 5x+y=c1 -> (c1/5, 0)
    points.push(new THREE.Vector2(sC1 / 5, 0));
    // 5. y=0, x+y=c2 -> (c2, 0)
    points.push(new THREE.Vector2(sC2, 0));
    // 6. 5x+y=c1 and x+y=c2 -> 4x = c1-c2 -> x = (c1-c2)/4, y = c2-x
    const intX = (sC1 - sC2) / 4;
    const intY = sC2 - intX;
    points.push(new THREE.Vector2(intX, intY));

    // Filter to strictly valid points
    const validPoints = points.filter(p => isValid(p.x, p.y, sC1, sC2));
    
    // Deduplicate
    const uniquePoints: THREE.Vector2[] = [];
    validPoints.forEach(vp => {
      if (!uniquePoints.some(up => up.distanceTo(vp) < 0.01)) {
        uniquePoints.push(vp);
      }
    });

    return sortVertices(uniquePoints);
  }, [sC1, sC2]);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (feasiblePolygon.length > 2) {
      s.moveTo(feasiblePolygon[0].x, feasiblePolygon[0].y);
      for (let i = 1; i < feasiblePolygon.length; i++) {
        s.lineTo(feasiblePolygon[i].x, feasiblePolygon[i].y);
      }
      s.lineTo(feasiblePolygon[0].x, feasiblePolygon[0].y);
    }
    return s;
  }, [feasiblePolygon]);

  // C1 Line: 5x + y = c1
  const line1Pts = useMemo(() => [
    [0, sC1, 0] as [number, number, number], 
    [sC1 / 5, 0, 0] as [number, number, number]
  ], [sC1]);

  // C2 Line: x + y = c2
  const line2Pts = useMemo(() => [
    [0, sC2, 0] as [number, number, number], 
    [sC2, 0, 0] as [number, number, number]
  ], [sC2]);

  return (
    <group position={[-5, -4, 0]}>
      {/* Grid and Axes */}
      <gridHelper args={[30, 30, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[5, 5, -0.1]} />
      <Line points={[[-2, 0, 0], [12, 0, 0]] as [number, number, number][]} color="#94a3b8" lineWidth={3} />
      <Line points={[[0, -2, 0], [0, 12, 0]] as [number, number, number][]} color="#94a3b8" lineWidth={3} />
      <Billboard position={[12, -0.5, 0]}><Text fontSize={0.5} color="#94a3b8">Tables (x)</Text></Billboard>
      <Billboard position={[-1, 12, 0]}><Text fontSize={0.5} color="#94a3b8">Chairs (y)</Text></Billboard>

      {/* Constraint 1 (5x + y <= c1) */}
      {sC1 > 0 && (
        <group>
          <Line points={line1Pts} color="#ef4444" lineWidth={4} />
          {/* Invalid Half-Plane Shading (Red)[cite: 23] */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.05} depthWrite={false} />
          </mesh>
          <Billboard position={[sC1 / 10, sC1 / 2 + 1, 0.1]}>
            <Text fontSize={0.4} color="#ef4444" fontWeight="bold">5x + y = {c1}</Text>
          </Billboard>
        </group>
      )}

      {/* Constraint 2 (x + y <= c2) */}
      {sC2 > 0 && (
        <group>
          <Line points={line2Pts} color="#f59e0b" lineWidth={4} />
          {/* Invalid Half-Plane Shading (Red)[cite: 23] */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.05} depthWrite={false} />
          </mesh>
          <Billboard position={[sC2 / 2 + 1, sC2 / 2 + 1, 0.1]}>
            <Text fontSize={0.4} color="#f59e0b" fontWeight="bold">x + y = {c2}</Text>
          </Billboard>
        </group>
      )}

      {/* Feasible Region (Translucent Blue Polygon)[cite: 23] */}
      {feasiblePolygon.length > 2 && (
        <mesh position={[0, 0, 0.05]}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Feasible Region Vertices Highlight */}
      {feasiblePolygon.map((v, i) => (
        <mesh key={i} position={[v.x, v.y, 0.1]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ConstraintIntersectionGrid() {
  const [c1, setC1] = useState<number>(100);
  const [c2, setC2] = useState<number>(60);

  // Check if feasible region exists (if intersection forms a valid polygon)[cite: 23]
  // We approximate this by checking if the origin is valid and if bounds allow area
  const hasFeasibleRegion = c1 >= 0 && c2 >= 0; 
  // In a real scenario with non-origin bounding, we'd check polygon area. 
  // Here, if c1=0 or c2=0, it pinches to a point/line. If < 0, it vanishes.
  const isPinched = c1 <= 5 || c2 <= 5; 

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Constraint Intersection Grid</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Linear inequalities combined with non-negative restrictions overlap to carve out a convex polygon known as the feasible region[cite: 23].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Resource Allocation</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-300">
              <div className="font-bold mb-1">Non-Negative Restrictions</div>
              <div className="text-sky-300">x {'>'}= 0, y {'>'}= 0</div>
            </div>

            <div className="p-3 rounded-lg border border-red-500/50 bg-red-950/30 text-red-400">
              <div className="font-bold mb-1">Constraint 1 (e.g., Labor)</div>
              <div>5x + y {'<'}= {c1}</div>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/50 bg-amber-950/30 text-amber-400">
              <div className="font-bold mb-1">Constraint 2 (e.g., Materials)</div>
              <div>x + y {'<'}= {c2}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="p-4 rounded-lg border border-stone-700 bg-stone-950/50">
              <div className="flex justify-between text-red-400 font-bold mb-3 text-xs uppercase tracking-widest">
                <span>Push C1 Boundary</span>
                <span>{c1}</span>
              </div>
              <input 
                type="range" min="-20" max="150" step="5" 
                value={c1} 
                onChange={(e) => setC1(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
            
            <div className="p-4 rounded-lg border border-stone-700 bg-stone-950/50">
              <div className="flex justify-between text-amber-400 font-bold mb-3 text-xs uppercase tracking-widest">
                <span>Push C2 Boundary</span>
                <span>{c2}</span>
              </div>
              <input 
                type="range" min="-20" max="100" step="5" 
                value={c2} 
                onChange={(e) => setC2(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isPinched || !hasFeasibleRegion ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-red-900/95 border border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-red-300 text-xs uppercase tracking-widest font-bold mb-2">Impossible Scenario Detected</p>
          <p className="text-stone-100 text-sm leading-relaxed mb-3">
            By pushing a constraint too far, the blue region pinched shut or vanished entirely[cite: 23].
          </p>
          <div className="inline-block bg-red-950/50 px-6 py-2 rounded-lg border border-red-800 font-mono text-lg font-bold text-red-400">
            NO FEASIBLE SOLUTION
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <GridScene c1={c1} c2={c2} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -5, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}