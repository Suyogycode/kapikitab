'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type PegId = 1 | 2 | 3 | null;

// ==================================================================
// MATH UTILITIES
// ==================================================================
// Calculates determinant of the 3x3 matrix for triangle area
const calculateDeterminant = (p1: number[], p2: number[], p3: number[]) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  return x1 * (y2 - y3) - y1 * (x2 - x3) + 1 * (x2 * y3 - y2 * x3);
};

// Projects point P onto the line formed by A and B
const projectPointOntoLine = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const A = px - ax;
  const B = py - ay;
  const C = bx - ax;
  const D = by - ay;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  const xx = ax + param * C;
  const yy = ay + param * D;
  
  const dist = Math.sqrt(Math.pow(px - xx, 2) + Math.pow(py - yy, 2));
  return { xx, yy, dist };
};

// ==================================================================
// 3D SCENE COMPONENT (Must be inside Canvas)
// ==================================================================
function MembraneScene({ 
  p1, p2, p3, setP1, setP2, setP3, activePeg, setActivePeg, determinant 
}: { 
  p1: number[], p2: number[], p3: number[], 
  setP1: (v: number[]) => void, setP2: (v: number[]) => void, setP3: (v: number[]) => void,
  activePeg: PegId, setActivePeg: (v: PegId) => void,
  determinant: number
}) {
  const isCollinear = Math.abs(determinant) < 0.1;

  // Handle Dragging with Magnetic Snapping to Collinearity
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!activePeg) return;

    let newX = e.point.x;
    let newY = e.point.y;

    // Magnetic Snap Logic
    if (activePeg === 1) {
      const proj = projectPointOntoLine(newX, newY, p2[0], p2[1], p3[0], p3[1]);
      if (proj.dist < 0.6) { newX = proj.xx; newY = proj.yy; }
      setP1([newX, newY]);
    } else if (activePeg === 2) {
      const proj = projectPointOntoLine(newX, newY, p1[0], p1[1], p3[0], p3[1]);
      if (proj.dist < 0.6) { newX = proj.xx; newY = proj.yy; }
      setP2([newX, newY]);
    } else if (activePeg === 3) {
      const proj = projectPointOntoLine(newX, newY, p1[0], p1[1], p2[0], p2[1]);
      if (proj.dist < 0.6) { newX = proj.xx; newY = proj.yy; }
      setP3([newX, newY]);
    }
  };

  // Generate Solid Membrane Shape
  const membraneShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(p1[0], p1[1]);
    shape.lineTo(p2[0], p2[1]);
    shape.lineTo(p3[0], p3[1]);
    shape.lineTo(p1[0], p1[1]);
    return shape;
  }, [p1, p2, p3]);

  return (
    <group>
      {/* INVISIBLE DRAG PLANE */}
      <mesh 
        position={[0, 0, 0]} 
        onPointerMove={handlePointerMove}
        onPointerUp={() => setActivePeg(null)}
        onPointerLeave={() => setActivePeg(null)}
        visible={false}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial />
      </mesh>

      {/* 2D Coordinate Grid */}
      <gridHelper args={[40, 40, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
      <Line points={[[-20, 0, -0.1], [20, 0, -0.1]] as [number, number, number][]} color="#334155" lineWidth={2} />
      <Line points={[[0, -20, -0.1], [0, 20, -0.1]] as [number, number, number][]} color="#334155" lineWidth={2} />

      {/* GLOWING NEON MEMBRANE */}
      {!isCollinear && (
        <mesh position={[0, 0, -0.05]}>
          <shapeGeometry args={[membraneShape]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {/* MEMBRANE OUTLINE (Crushes to 1D string when collinear) */}
      <Line 
        points={[[p1[0], p1[1], 0], [p2[0], p2[1], 0], [p3[0], p3[1], 0], [p1[0], p1[1], 0]] as [number, number, number][]} 
        color={isCollinear ? "#ef4444" : "#d946ef"} 
        lineWidth={isCollinear ? 6 : 3} 
      />

      {/* METALLIC PEGS */}
      {[
        { id: 1, pos: p1, label: "(x1, y1)" },
        { id: 2, pos: p2, label: "(x2, y2)" },
        { id: 3, pos: p3, label: "(x3, y3)" }
      ].map((peg) => (
        <group key={peg.id} position={[peg.pos[0], peg.pos[1], 0]}>
          <mesh 
            onPointerDown={(e) => { e.stopPropagation(); setActivePeg(peg.id as PegId); document.body.style.cursor = 'grabbing'; }}
            onPointerOver={() => { if(!activePeg) document.body.style.cursor = 'grab'; }}
            onPointerOut={() => { if(!activePeg) document.body.style.cursor = 'auto'; }}
            position={[0, 0, 0.4]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
            <meshStandardMaterial color={activePeg === peg.id ? "#38bdf8" : "#94a3b8"} metalness={0.8} roughness={0.2} />
          </mesh>
          <Billboard position={[0, 0.8, 0.5]}>
            <Text fontSize={0.4} color="#f8fafc" fontWeight="bold">
              {peg.label}
            </Text>
            <Text position={[0, -0.4, 0]} fontSize={0.3} color="#94a3b8">
              ({peg.pos[0].toFixed(1)}, {peg.pos[1].toFixed(1)})
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
export default function CollinearMembrane() {
  const [p1, setP1] = useState<number[]>([-4, -2]);
  const [p2, setP2] = useState<number[]>([4, -2]);
  const [p3, setP3] = useState<number[]>([0, 4]);
  const [activePeg, setActivePeg] = useState<PegId>(null);

  const determinant = calculateDeterminant(p1, p2, p3);
  const area = Math.abs(0.5 * determinant);
  const isCollinear = Math.abs(determinant) < 0.1;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Collinear Membrane</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            If the points are collinear, the area of the triangle is exactly zero[cite: 18].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Live Determinant</span>
            <span className={isCollinear ? "text-red-400 font-mono text-xs font-bold" : "text-purple-400 font-mono text-xs font-bold"}>
              Area = {area.toFixed(1)}
            </span>
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-4 bg-stone-950 p-4 rounded-lg border border-stone-800 font-mono">
            <div className="text-stone-500 text-2xl">|</div>
            <div className="flex flex-col gap-2 text-center text-sm">
              <div className="text-stone-300"><span className="text-sky-300 w-8 inline-block">{p1[0].toFixed(1)}</span> <span className="text-sky-300 w-8 inline-block">{p1[1].toFixed(1)}</span> <span className="text-stone-500 w-4 inline-block">1</span></div>
              <div className="text-stone-300"><span className="text-sky-300 w-8 inline-block">{p2[0].toFixed(1)}</span> <span className="text-sky-300 w-8 inline-block">{p2[1].toFixed(1)}</span> <span className="text-stone-500 w-4 inline-block">1</span></div>
              <div className="text-stone-300"><span className="text-sky-300 w-8 inline-block">{p3[0].toFixed(1)}</span> <span className="text-sky-300 w-8 inline-block">{p3[1].toFixed(1)}</span> <span className="text-stone-500 w-4 inline-block">1</span></div>
            </div>
            <div className="text-stone-500 text-2xl">|</div>
            <div className="text-stone-400">=</div>
            <div className={`text-lg font-bold w-12 text-center ${isCollinear ? 'text-red-400' : 'text-emerald-400'}`}>
              {determinant.toFixed(1)}
            </div>
          </div>

          <div className="text-stone-400 text-xs text-center border-t border-stone-800 pt-3">
            Task: Drag a peg perfectly onto the line connecting the other two to force the determinant to exactly 0[cite: 18].
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isCollinear ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-red-400 text-xs uppercase tracking-widest font-bold mb-2">Total Dimensional Collapse</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As you dragged the peg closer to the line connecting the other two, the determinant's value plummeted[cite: 18]. 
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            When the peg snapped perfectly onto the line, the glowing membrane was crushed flat into a 1D string, and the determinant reads 0[cite: 18].
          </p>
          <div className="inline-block bg-red-950/50 px-6 py-2 rounded-lg border border-red-900/50 font-mono text-base font-bold text-red-400">
            A determinant measuring zero physically means a total collapse of 2D space[cite: 18].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 20]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <MembraneScene 
              p1={p1} p2={p2} p3={p3} 
              setP1={setP1} setP2={setP2} setP3={setP3} 
              activePeg={activePeg} setActivePeg={setActivePeg}
              determinant={determinant}
            />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}