'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Line, ContactShadows } from '@react-three/drei';
import { Focus, Play, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE 3D PHYSICS COMPONENTS
// ==================================================================

// 1. Dynamic Growing Bisector Line
function AnimatedBisector({ start, direction, isVisible }: { start: [number, number], direction: [number, number], isVisible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame((_, delta) => {
    if (isVisible && progress < 1) {
      setProgress(Math.min(1, progress + delta * 1.5));
    } else if (!isVisible && progress > 0) {
      setProgress(0);
    }
  });

  if (progress === 0) return null;

  // The line shoots outward in both directions from the midpoint
  const p1: [number, number, number] = [start[0] + direction[0] * 15 * progress, start[1] + direction[1] * 15 * progress, 0.05];
  const p2: [number, number, number] = [start[0] - direction[0] * 15 * progress, start[1] - direction[1] * 15 * progress, 0.05];

  return (
    <group ref={ref}>
      <Line points={[p1, p2]} color="#0ea5e9" lineWidth={3} transparent opacity={0.6} dashed dashScale={10} dashSize={0.5} gapSize={0.2} />
      <mesh position={[start[0], start[1], 0.1]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>
    </group>
  );
}

// 2. Expanding Circumcircle
function AnimatedCircle({ center, radius, isVisible }: { center: [number, number], radius: number, isVisible: boolean }) {
  const [progress, setProgress] = useState(0);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (isVisible && progress < 1) {
      setProgress(Math.min(1, progress + delta * 2));
    } else if (!isVisible && progress > 0) {
      setProgress(0);
    }

    if (trailRef.current && progress > 0) {
      (trailRef.current.geometry as THREE.RingGeometry).dispose();
      // Draw the circle sweeping out to 360 degrees (Math.PI * 2)
      trailRef.current.geometry = new THREE.RingGeometry(radius - 0.04, radius + 0.04, 64, 1, 0, Math.PI * 2 * progress);
    }
  });

  if (progress === 0 || radius === 0) return null;

  return (
    <group position={[center[0], center[1], 0.05]}>
      {/* Expanding Ring */}
      <mesh ref={trailRef}>
        <ringGeometry args={[radius - 0.04, radius + 0.04, 64, 1, 0, 0]} />
        <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
      </mesh>
      {/* Glowing Center Point */}
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
      </mesh>
      <Text position={[0, -0.6, 0.1]} fontSize={0.5} fontWeight="bold" color="#10b981" outlineWidth={0.03} outlineColor="#000000">
        O
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function CircumcentreTriangulator() {
  const [posA, setPosA] = useState({ x: -3, y: -2 });
  const [posB, setPosB] = useState({ x: 4, y: -1 });
  const [posC, setPosC] = useState({ x: 0, y: 3 });
  
  const [draggedNode, setDraggedNode] = useState<'A' | 'B' | 'C' | null>(null);
  const [phase, setPhase] = useState<'idle' | 'bisecting' | 'circled'>('idle');

  // Mathematical Calculations
  const calcGeometry = useMemo(() => {
    // 1. Collinearity Check (Area of Triangle < threshold)
    const area = Math.abs(posA.x * (posB.y - posC.y) + posB.x * (posC.y - posA.y) + posC.x * (posA.y - posB.y)) / 2;
    const isCollinear = area < 0.5;

    // 2. Midpoints
    const mAB: [number, number] = [(posA.x + posB.x) / 2, (posA.y + posB.y) / 2];
    const mBC: [number, number] = [(posB.x + posC.x) / 2, (posB.y + posC.y) / 2];
    const mCA: [number, number] = [(posC.x + posA.x) / 2, (posC.y + posA.y) / 2];

    // 3. Normalized Perpendicular Vectors
    const getPerp = (p1: any, p2: any): [number, number] => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      return [-dy / len, dx / len];
    };
    const pAB = getPerp(posA, posB);
    const pBC = getPerp(posB, posC);
    const pCA = getPerp(posC, posA);

    // 4. Circumcenter (Intersection of bisectors)
    let Ox = 0, Oy = 0, R = 0;
    if (!isCollinear) {
      const D = 2 * (posA.x * (posB.y - posC.y) + posB.x * (posC.y - posA.y) + posC.x * (posA.y - posB.y));
      const aSq = posA.x ** 2 + posA.y ** 2;
      const bSq = posB.x ** 2 + posB.y ** 2;
      const cSq = posC.x ** 2 + posC.y ** 2;
      
      Ox = (aSq * (posB.y - posC.y) + bSq * (posC.y - posA.y) + cSq * (posA.y - posB.y)) / D;
      Oy = (aSq * (posC.x - posB.x) + bSq * (posA.x - posC.x) + cSq * (posB.x - posA.x)) / D;
      R = Math.sqrt((posA.x - Ox) ** 2 + (posA.y - Oy) ** 2);
    }

    return { isCollinear, mAB, mBC, mCA, pAB, pBC, pCA, Ox, Oy, R };
  }, [posA, posB, posC]);

  const handleDragMap = (e: any) => {
    if (!draggedNode) return;
    const pt = e.point;
    // Keep pins within bounds
    const clamp = (val: number) => Math.max(-8, Math.min(8, val));
    const newPos = { x: clamp(pt.x), y: clamp(pt.y) };
    
    if (draggedNode === 'A') setPosA(newPos);
    if (draggedNode === 'B') setPosB(newPos);
    if (draggedNode === 'C') setPosC(newPos);
    
    setPhase('idle'); // Break animations if user moves a pin
  };

  const executeEngine = () => {
    setPhase('bisecting');
    if (!calcGeometry.isCollinear) {
      setTimeout(() => setPhase('circled'), 1200);
    }
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 10]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls enableZoom={true} enableRotate={false} />

            {/* The Invisible Mathematical Drag Plane */}
            <mesh position={[0, 0, -0.2]} onPointerMove={handleDragMap} onPointerUp={() => setDraggedNode(null)} onPointerLeave={() => setDraggedNode(null)}>
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial visible={false} />
            </mesh>

            {/* Blueprint Grid */}
            <Grid args={[40, 40]} position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} cellSize={1} cellThickness={1} cellColor="#3f3f46" sectionSize={5} fadeDistance={40} />

            {/* The Triangle Chords */}
            <Line points={[[posA.x, posA.y, 0], [posB.x, posB.y, 0]]} color="#a8a29e" lineWidth={4} />
            <Line points={[[posB.x, posB.y, 0], [posC.x, posC.y, 0]]} color="#a8a29e" lineWidth={4} />
            <Line points={[[posC.x, posC.y, 0], [posA.x, posA.y, 0]]} color="#a8a29e" lineWidth={4} />

            {/* The 3 Draggable Pins */}
            {[
              { id: 'A', pos: posA, color: '#f59e0b' },
              { id: 'B', pos: posB, color: '#f59e0b' },
              { id: 'C', pos: posC, color: '#f59e0b' }
            ].map(pin => (
              <group key={pin.id} position={[pin.pos.x, pin.pos.y, 0]}>
                <mesh 
                  onPointerDown={(e) => { e.stopPropagation(); setDraggedNode(pin.id as any); (e.target as any).setPointerCapture(e.pointerId); }}
                  onPointerUp={(e) => { e.stopPropagation(); setDraggedNode(null); (e.target as any).releasePointerCapture(e.pointerId); }}
                >
                  <sphereGeometry args={[0.4, 32, 32]} />
                  <meshStandardMaterial color={draggedNode === pin.id ? '#ffffff' : pin.color} roughness={0.2} metalness={0.8} />
                </mesh>
                <Text position={[0, -0.8, 0.1]} fontSize={0.6} fontWeight="bold" color="#ffffff" outlineWidth={0.05} outlineColor="#000000">
                  {pin.id}
                </Text>
              </group>
            ))}

            {/* The Bisectors & Circumcircle Engine */}
            <AnimatedBisector start={calcGeometry.mAB} direction={calcGeometry.pAB} isVisible={phase !== 'idle'} />
            <AnimatedBisector start={calcGeometry.mBC} direction={calcGeometry.pBC} isVisible={phase !== 'idle'} />
            <AnimatedBisector start={calcGeometry.mCA} direction={calcGeometry.pCA} isVisible={phase !== 'idle'} />
            
            {!calcGeometry.isCollinear && (
              <AnimatedCircle center={[calcGeometry.Ox, calcGeometry.Oy]} radius={calcGeometry.R} isVisible={phase === 'circled'} />
            )}

            <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" position={[0, 0, -0.15]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Focus className="text-emerald-500" /> The Circumcentre Triangulator
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            How many circles can you draw through three distinct points?
          </p>
        </div>
        <button onClick={() => { setPosA({x: -3, y: -2}); setPosB({x: 4, y: -1}); setPosC({x: 0, y: 3}); setPhase('idle'); }} className="px-4 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors pointer-events-auto backdrop-blur-md">
          <RotateCcw size={14} className="inline mr-2" /> Reset Pins
        </button>
      </div>

      {/* FLOATING CONTROLS HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row gap-6 pointer-events-none items-end">
        
        {/* Math & Logic Panel */}
        <div className="flex-1 max-w-md bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric State</h3>
            {calcGeometry.isCollinear ? (
              <span className="bg-rose-950 text-rose-400 border border-rose-900/50 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                <AlertTriangle size={12} /> Collinear (Line)
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest">
                Non-Collinear (Triangle)
              </span>
            )}
          </div>
          
          <div className="p-5 space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center text-stone-400 text-xs uppercase tracking-widest px-2">
              <span>Point</span>
              <span>Coordinates (x, y)</span>
            </div>
            
            {/* Coordinate Readouts */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-amber-500 font-bold">A</span>
                <span className="text-stone-300">{`(${posA.x.toFixed(1)}, ${posA.y.toFixed(1)})`}</span>
              </div>
              <div className="flex justify-between items-center bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-amber-500 font-bold">B</span>
                <span className="text-stone-300">{`(${posB.x.toFixed(1)}, ${posB.y.toFixed(1)})`}</span>
              </div>
              <div className="flex justify-between items-center bg-stone-950 p-2 rounded border border-stone-800">
                <span className="text-amber-500 font-bold">C</span>
                <span className="text-stone-300">{`(${posC.x.toFixed(1)}, ${posC.y.toFixed(1)})`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Aha Moment */}
        <div className="flex-1 flex flex-col justify-end gap-3 pointer-events-auto">
          
          <AnimatePresence mode="wait">
            {phase === 'idle' ? (
              <motion.div key="hint" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                <p className="text-xs text-stone-400 bg-stone-900/80 px-4 py-3 rounded-xl border border-stone-800 shadow-lg">
                  Drag the amber pins around the drafting board to create any shape. When ready, click "Find Centre".
                </p>
              </motion.div>
            ) : calcGeometry.isCollinear ? (
              <motion.div key="collinear" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                <p className="text-xs text-rose-400 bg-rose-950/80 backdrop-blur-md px-4 py-3 rounded-xl border border-rose-900/50 shadow-2xl">
                  <strong>Aha!</strong> Because the points are in a straight line, the perpendicular bisectors are perfectly parallel. They will never intersect, proving it is <strong>impossible</strong> to draw a circle through three collinear points!
                </p>
              </motion.div>
            ) : phase === 'circled' ? (
              <motion.div key="circled" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                <p className="text-xs text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-4 py-3 rounded-xl border border-emerald-900/50 shadow-2xl">
                  <strong>Aha!</strong> For any three non-collinear points, the perpendicular bisectors will cross at exactly one unique intersection point (O). This creates one, and only one, perfect circle.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button 
            onClick={executeEngine}
            disabled={phase !== 'idle'}
            className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg border border-emerald-500 disabled:border-stone-700"
          >
            <Play size={18} fill={phase === 'idle' ? "currentColor" : "none"} /> 
            {phase === 'idle' ? 'Find Centre' : 'Computing Geometry...'}
          </button>

        </div>
      </div>
    </div>
  );
}