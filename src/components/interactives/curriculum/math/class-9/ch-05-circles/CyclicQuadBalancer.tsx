'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Line, ContactShadows } from '@react-three/drei';
import { Scale, Unlock, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function CyclicQuadrilateralBalancer() {
  const RADIUS = 5;

  // State
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [draggedNode, setDraggedNode] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  // Initial Coordinates locked to the circle
  const [posA, setPosA] = useState({ x: RADIUS * Math.cos(Math.PI/4), y: RADIUS * Math.sin(Math.PI/4) });
  const [posB, setPosB] = useState({ x: RADIUS * Math.cos(3*Math.PI/4), y: RADIUS * Math.sin(3*Math.PI/4) });
  const [posC, setPosC] = useState({ x: RADIUS * Math.cos(5*Math.PI/4), y: RADIUS * Math.sin(5*Math.PI/4) });
  const [posD, setPosD] = useState({ x: RADIUS * Math.cos(7*Math.PI/4), y: RADIUS * Math.sin(7*Math.PI/4) });

  // --- Mathematical Geometry Engine ---
  const calcGeometry = useMemo(() => {
    const getInteriorAngle = (p1: any, p2: any, p3: any) => {
      const v1 = new THREE.Vector2(p1.x - p2.x, p1.y - p2.y).normalize();
      const v2 = new THREE.Vector2(p3.x - p2.x, p3.y - p2.y).normalize();
      const dot = Math.max(-1, Math.min(1, v1.dot(v2)));
      return Math.acos(dot) * (180 / Math.PI);
    };

    const angA = getInteriorAngle(posD, posA, posB);
    const angB = getInteriorAngle(posA, posB, posC);
    const angC = getInteriorAngle(posB, posC, posD);
    const angD = getInteriorAngle(posC, posD, posA);

    const sumAC = angA + angC;
    const sumBD = angB + angD;

    const isCyclic = Math.abs(sumAC - 180) < 0.5 && Math.abs(sumBD - 180) < 0.5;

    return { angA, angB, angC, angD, sumAC, sumBD, isCyclic };
  }, [posA, posB, posC, posD]);

  // --- 3D Drag Physics ---
  const handlePointerMove = (e: any) => {
    if (!draggedNode) return;
    let { x, y } = e.point;

    if (isLocked) {
      const angle = Math.atan2(y, x);
      x = RADIUS * Math.cos(angle);
      y = RADIUS * Math.sin(angle);
    } else {
      x = Math.max(-9, Math.min(9, x));
      y = Math.max(-9, Math.min(9, y));
    }

    if (draggedNode === 'A') setPosA({ x, y });
    if (draggedNode === 'B') setPosB({ x, y });
    if (draggedNode === 'C') setPosC({ x, y });
    if (draggedNode === 'D') setPosD({ x, y });
  };

  const handlePointerUp = () => setDraggedNode(null);

  const circlePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push([RADIUS * Math.cos(angle), RADIUS * Math.sin(angle), 0]);
    }
    return points;
  }, []);

  return (
    <div className="w-full h-full min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col select-none">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          {/* THE FIX: Suspense Boundary added back in to handle asynchronous font and HDRI loading */}
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 10]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls enableZoom={true} enableRotate={false} />

            <mesh position={[0, 0, -0.2]} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial visible={false} />
            </mesh>

            <Grid args={[40, 40]} position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} cellSize={1} cellThickness={1} cellColor="#3f3f46" sectionSize={5} fadeDistance={40} />

            <Line 
              points={circlePoints} 
              color={isLocked ? "#10b981" : "#57534e"} 
              lineWidth={isLocked ? 4 : 2} 
              transparent opacity={isLocked ? 0.8 : 0.3} 
            />

            <Line 
              points={[
                [posA.x, posA.y, 0.05], [posB.x, posB.y, 0.05], 
                [posC.x, posC.y, 0.05], [posD.x, posD.y, 0.05], 
                [posA.x, posA.y, 0.05]
              ]} 
              color={calcGeometry.isCyclic ? "#0ea5e9" : "#f43f5e"} 
              lineWidth={4} 
            />

            {[
              { id: 'A', pos: posA },
              { id: 'B', pos: posB },
              { id: 'C', pos: posC },
              { id: 'D', pos: posD },
            ].map(pin => (
              <group key={pin.id} position={[pin.pos.x, pin.pos.y, 0.1]}>
                <mesh 
                  onPointerOver={() => document.body.style.cursor = draggedNode === pin.id ? 'grabbing' : 'grab'}
                  onPointerOut={() => document.body.style.cursor = 'auto'}
                  onPointerDown={(e) => { 
                    e.stopPropagation(); 
                    setDraggedNode(pin.id as any); 
                    (e.target as any).setPointerCapture(e.pointerId); 
                    document.body.style.cursor = 'grabbing';
                  }}
                  onPointerUp={(e) => { 
                    e.stopPropagation(); 
                    setDraggedNode(null); 
                    (e.target as any).releasePointerCapture(e.pointerId); 
                    document.body.style.cursor = 'grab';
                  }}
                >
                  <sphereGeometry args={[0.4, 32, 32]} />
                  <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
                </mesh>
                <Text position={[0, -0.8, 0.1]} fontSize={0.6} fontWeight="bold" color="#ffffff" outlineWidth={0.05} outlineColor="#000000">
                  {pin.id}
                </Text>
              </group>
            ))}

            <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" position={[0, 0, -0.15]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Scale className={calcGeometry.isCyclic ? "text-emerald-500" : "text-rose-500"} /> The Cyclic Balancer
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Visualizing Theorem 11 & 12: Opposite angles of a cyclic quadrilateral.
          </p>
        </div>
        
        <button 
          onClick={() => setIsLocked(!isLocked)}
          className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg border pointer-events-auto backdrop-blur-md ${
            isLocked 
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900 hover:bg-emerald-900/80' 
              : 'bg-rose-950/80 text-rose-400 border-rose-900 hover:bg-rose-900/80'
          }`}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          {isLocked ? 'Track Locked' : 'Track Unlocked'}
        </button>
      </div>

      {/* FLOATING CONTROLS HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row gap-6 pointer-events-none items-end">
        
        {/* Math & Logic Panel */}
        <div className="flex-1 max-w-lg bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Angle Balancer</h3>
            {calcGeometry.isCyclic ? (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 size={12} /> Theorem 11 Sustained
              </span>
            ) : (
              <span className="bg-rose-950 text-rose-400 border border-rose-900/50 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                <AlertTriangle size={12} /> Theorem 12 Broken
              </span>
            )}
          </div>
          
          <div className="p-6 space-y-6 font-mono text-sm">
            
            {/* Scale 1: A + C */}
            <div>
              <p className="text-stone-500 text-xs mb-2 uppercase tracking-widest">Opposite Scale (A + C)</p>
              <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${calcGeometry.isCyclic ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'}`}>
                <span className="text-stone-300">∠A + ∠C</span>
                <span className="text-stone-500">=</span>
                <span className="text-sky-400">{calcGeometry.angA.toFixed(1)}°</span>
                <span className="text-stone-500">+</span>
                <span className="text-sky-400">{calcGeometry.angC.toFixed(1)}°</span>
                <span className="text-stone-500">=</span>
                <span className={`font-bold text-lg ${calcGeometry.isCyclic ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calcGeometry.sumAC.toFixed(1)}°
                </span>
              </div>
            </div>

            {/* Scale 2: B + D */}
            <div>
              <p className="text-stone-500 text-xs mb-2 uppercase tracking-widest">Opposite Scale (B + D)</p>
              <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${calcGeometry.isCyclic ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'}`}>
                <span className="text-stone-300">∠B + ∠D</span>
                <span className="text-stone-500">=</span>
                <span className="text-amber-400">{calcGeometry.angB.toFixed(1)}°</span>
                <span className="text-stone-500">+</span>
                <span className="text-amber-400">{calcGeometry.angD.toFixed(1)}°</span>
                <span className="text-stone-500">=</span>
                <span className={`font-bold text-lg ${calcGeometry.isCyclic ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calcGeometry.sumBD.toFixed(1)}°
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* The "Aha!" Moment Explanations */}
        <div className="flex-1 flex flex-col justify-end gap-3 pointer-events-auto">
          <AnimatePresence mode="wait">
            {isLocked ? (
              <motion.div key="locked" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                <p className="text-xs text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-5 py-4 rounded-xl border border-emerald-900/50 shadow-2xl leading-relaxed">
                  <strong>The Aha! Moment (Theorem 11):</strong> Grab vertex A and drag it along the circle. As ∠A physically shrinks, watch ∠C actively expand in real-time to compensate. <br/><br/>
                  The math scale never tips, remaining locked at exactly <strong>180°</strong> as long as the vertices are concyclic!
                </p>
              </motion.div>
            ) : calcGeometry.isCyclic ? (
              <motion.div key="unlocked-safe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                <p className="text-xs text-stone-300 bg-stone-900/80 backdrop-blur-md px-5 py-4 rounded-xl border border-stone-800 shadow-2xl leading-relaxed">
                  The track is unlocked. Drag a vertex <strong>off</strong> the circular path to break the concyclicity and test the theorem's bounds.
                </p>
              </motion.div>
            ) : (
              <motion.div key="unlocked-broken" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                <p className="text-xs text-rose-400 bg-rose-950/90 backdrop-blur-md px-5 py-4 rounded-xl border border-rose-900/50 shadow-2xl leading-relaxed">
                  <strong>The Aha! Moment (Theorem 12):</strong> The tether instantly shattered! By dragging a vertex off the circle, you broke the 180° balance. <br/><br/>
                  This physically proves the converse theorem: if the sum of opposite angles is <em>not</em> 180°, a circle <strong>cannot</strong> pass through all four points.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}