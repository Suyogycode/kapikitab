'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Line, ContactShadows } from '@react-three/drei';
import { Rocket, Calculator, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function CosmicCollision() {
  const RADIUS = 5;

  // Fixed Positions for A, B, and C
  const posA = useMemo(() => ({ x: RADIUS * Math.cos(3*Math.PI/4), y: RADIUS * Math.sin(3*Math.PI/4) }), []);
  const posB = useMemo(() => ({ x: RADIUS * Math.cos(5*Math.PI/4), y: RADIUS * Math.sin(5*Math.PI/4) }), []);
  const posC = useMemo(() => ({ x: RADIUS * Math.cos(7*Math.PI/4), y: RADIUS * Math.sin(7*Math.PI/4) }), []);

  // Dynamic state for D
  const [angleD, setAngleD] = useState<number>(Math.PI / 4);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Calculate actual position of D based on the angle
  const rawPosD = { x: RADIUS * Math.cos(angleD), y: RADIUS * Math.sin(angleD) };

  // --- Distance & Collision Math ---
  const getDist = (p1: any, p2: any) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
  
  const rawD = getDist(rawPosD, posA);
  const isMerged = rawD < 0.6; // The Collision Threshold

  // If merged, D snaps perfectly to A. Otherwise, D is at its raw position.
  const posD = isMerged ? posA : rawPosD;

  // Final Edge Lengths for the HUD
  const edgeA = getDist(posA, posB); // Side a
  const edgeB = getDist(posB, posC); // Side b
  const edgeC = getDist(posC, posD); // Side c
  const edgeD = isMerged ? 0 : rawD; // Side d becomes 0 upon collision
  
  const s = (edgeA + edgeB + edgeC + edgeD) / 2;
  
  // Calculate Area (Brahmagupta's formula works for both since if d=0, it becomes Heron's)
  const area = Math.sqrt((s - edgeA) * (s - edgeB) * (s - edgeC) * (s - edgeD));

  // --- 3D Drag Physics ---
  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    const { x, y } = e.point;
    let angle = Math.atan2(y, x);
    if (angle < 0) angle += 2 * Math.PI;

    // Prevent D from crossing C (approx 315 deg or 5.5 rad) to keep the quadrilateral simple
    if (angle > 5.5) angle = 5.5; 
    setAngleD(angle);
  };

  return (
    <div className="w-full h-full min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col select-none">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 10]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls enableZoom={true} enableRotate={false} />

            {/* Invisible Drag Plane */}
            <mesh position={[0, 0, -0.2]} onPointerMove={handlePointerMove} onPointerUp={() => setIsDragging(false)} onPointerLeave={() => setIsDragging(false)}>
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial visible={false} />
            </mesh>

            {/* Transparent Glass Circle */}
            <mesh position={[0, 0, -0.1]}>
              <ringGeometry args={[RADIUS - 0.05, RADIUS + 0.05, 64]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} />
            </mesh>
            
            {/* Soft inner glow for the circle */}
            <mesh position={[0, 0, -0.15]}>
              <ringGeometry args={[RADIUS - 0.2, RADIUS + 0.2, 64]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} />
            </mesh>

            {/* The Shape Outline */}
            <Line 
              points={[
                [posA.x, posA.y, 0.05], [posB.x, posB.y, 0.05], 
                [posC.x, posC.y, 0.05], [posD.x, posD.y, 0.05], 
                [posA.x, posA.y, 0.05]
              ]} 
              color={isMerged ? "#10b981" : "#0ea5e9"} 
              lineWidth={5} 
            />

            {/* Fixed Vertices A, B, C */}
            {[
              { id: 'A', pos: posA, color: isMerged ? '#10b981' : '#f43f5e' },
              { id: 'B', pos: posB, color: '#f59e0b' },
              { id: 'C', pos: posC, color: '#f59e0b' },
            ].map(pin => (
              <group key={pin.id} position={[pin.pos.x, pin.pos.y, 0.1]}>
                <mesh>
                  <sphereGeometry args={[0.3, 32, 32]} />
                  <meshStandardMaterial color={pin.color} roughness={0.2} metalness={0.8} />
                </mesh>
                <Text position={[0, -0.7, 0.1]} fontSize={0.5} fontWeight="bold" color="#ffffff" outlineWidth={0.05} outlineColor="#000000">
                  {pin.id}
                </Text>
              </group>
            ))}

            {/* Draggable Vertex D (The Comet) */}
            <group position={[posD.x, posD.y, 0.15]}>
              {/* Collision Flash Effect */}
              {isMerged && (
                <mesh position={[0,0,-0.1]}>
                  <sphereGeometry args={[0.8, 32, 32]} />
                  <meshBasicMaterial color="#10b981" transparent opacity={0.4} />
                </mesh>
              )}
              
              <mesh 
                onPointerOver={() => document.body.style.cursor = isDragging ? 'grabbing' : 'grab'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
                onPointerDown={(e) => { 
                  e.stopPropagation(); 
                  setIsDragging(true); 
                  (e.target as any).setPointerCapture(e.pointerId); 
                  document.body.style.cursor = 'grabbing';
                }}
                onPointerUp={(e) => { 
                  e.stopPropagation(); 
                  setIsDragging(false); 
                  (e.target as any).releasePointerCapture(e.pointerId); 
                  document.body.style.cursor = 'grab';
                }}
              >
                <sphereGeometry args={isMerged ? [0.4, 32, 32] : [0.5, 32, 32]} />
                <meshStandardMaterial color={isMerged ? "#10b981" : "#0ea5e9"} emissive={isMerged ? "#10b981" : "#0ea5e9"} emissiveIntensity={0.5} roughness={0.1} />
              </mesh>
              {!isMerged && (
                <Text position={[0, 0.8, 0.1]} fontSize={0.5} fontWeight="bold" color="#38bdf8" outlineWidth={0.05} outlineColor="#000000">
                  Drag D
                </Text>
              )}
            </group>

            <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" position={[0, 0, -0.2]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Rocket className="text-sky-500" /> The Cosmic Collision
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Connecting Brahmagupta's Quadrilateral to Heron's Triangle.
          </p>
        </div>
      </div>

      {/* FLOATING CONTROLS HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col xl:flex-row gap-6 pointer-events-none items-end">
        
        {/* Math & Logic Panel */}
        <div className="w-full xl:w-80 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto shrink-0">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs flex items-center gap-2">
              <Info size={14} className="text-sky-500" /> Variables
            </h3>
            <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${isMerged ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-sky-950 text-sky-400 border border-sky-900/50'}`}>
              {isMerged ? 'Triangle' : 'Quadrilateral'}
            </span>
          </div>
          
          <div className="p-5 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-stone-400 border-b border-stone-800 pb-2 mb-2">
              <span>Semi-perimeter (s):</span>
              <span className="font-bold text-white">{s.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Side a (A-B):</span>
              <span className="text-stone-300">{edgeA.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Side b (B-C):</span>
              <span className="text-stone-300">{edgeB.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Side c (C-D):</span>
              <span className="text-stone-300">{edgeC.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-stone-950 -mx-2 px-2 py-1 rounded border border-stone-800">
              <span className={isMerged ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>Side d (D-A):</span>
              <span className={isMerged ? "text-emerald-400 font-bold" : "text-sky-400 font-bold"}>{edgeD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* The Formula Transformation HUD */}
        <div className="flex-1 w-full bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs flex items-center gap-2">
              <Calculator size={14} className={isMerged ? "text-emerald-500" : "text-amber-500"} /> Area Formula
            </h3>
            <span className="text-white font-mono font-bold">Area ≈ {area.toFixed(2)}</span>
          </div>
          
          <div className="p-6 flex flex-col justify-center h-full">
            <div className="flex flex-col gap-2">
              <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${isMerged ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isMerged ? "Heron's Formula (Triangle)" : "Brahmagupta's Formula (Cyclic Quad)"}
              </span>
              
              {/* Dynamic Math Rendering Container */}
              <div className="bg-stone-950 border border-stone-800 rounded-lg p-5 flex items-center overflow-x-auto">
                <span className="text-white text-xl font-mono mr-2 shrink-0">Area = √</span>
                
                <div className="flex items-center text-xl font-mono text-stone-300">
                  <span className="mr-1">(</span>
                  
                  {/* The collapsing (s - d) term */}
                  <AnimatePresence mode="popLayout">
                    {isMerged ? (
                      <motion.span 
                        key="heron-s"
                        initial={{ opacity: 0, scale: 0.8, color: '#f43f5e' }}
                        animate={{ opacity: 1, scale: 1, color: '#10b981' }}
                        className="font-bold inline-block"
                      >
                        s
                      </motion.span>
                    ) : (
                      <motion.span 
                        key="brahma-sd"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, color: '#f43f5e' }}
                        className="text-sky-400 font-bold inline-block"
                      >
                        (s - d)
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  <span className="ml-1">) (s - a) (s - b) (s - c)</span>
                </div>
              </div>
            </div>

            {/* The "Aha!" Moment Explanation */}
            <div className="mt-6 pt-6 border-t border-stone-800">
              <AnimatePresence mode="wait">
                {isMerged ? (
                  <motion.div 
                    key="merged"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3"
                  >
                    <Zap className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Cosmic Collision Achieved</h4>
                      <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                        By crashing vertex D into vertex A, the side length <strong>d shrinks to exactly 0</strong>. <br/><br/>
                        When $d = 0$, the mathematical term $(s - d)$ gracefully collapses into just $(s)$. You have just visually proven that Heron's formula for a triangle is actually just Brahmagupta's formula for a quadrilateral... where one side happens to be zero!
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="unmerged"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-stone-400 text-xs leading-relaxed font-sans">
                      <strong>The Aha! Moment:</strong> Grab the blue vertex <strong className="text-sky-400">D</strong> and drag it counter-clockwise along the orbit until it violently collides with the red vertex <strong className="text-rose-400">A</strong>. Keep your eyes on the $(s - d)$ term in the formula as they merge!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}