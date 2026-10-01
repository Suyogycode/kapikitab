'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MATH & SCALING CONSTANTS
// ==================================================================
const GRAVITY = 4.9; // Using 4.9 for the s = 4.9t^2 formula[cite: 26]
const T1 = 2; // Fixed anchor at t = 2[cite: 26]

// Visual scaling multipliers to fit the math onto the screen
const SCALE_X = 2.5;  // 1 unit of time = 2.5 3D units
const SCALE_Y = 0.15; // 1 unit of distance = 0.15 3D units
const GRAPH_ORIGIN = new THREE.Vector3(-1, -4, 0);

type DragState = 't2' | null;

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SecantSlider() {
  const [t2, setT2] = useState<number>(4.5);
  const [dragState, setDragState] = useState<DragState>(null);

  // Derive Mathematical Values
  const s1 = GRAVITY * Math.pow(T1, 2);
  const s2 = GRAVITY * Math.pow(t2, 2);
  const h = t2 - T1;
  
  // To avoid dividing by exactly 0, handle the snapped state
  const isSnapped = Math.abs(h) < 0.02;
  const activeT2 = isSnapped ? T1 : t2;
  const activeS2 = isSnapped ? s1 : s2;
  const activeH = isSnapped ? 0 : h;
  
  const averageVelocity = isSnapped 
    ? (GRAVITY * 2 * T1) // Derivative 9.8t at t=2 is 19.6
    : (activeS2 - s1) / activeH;

  // Derive Visual Coordinates for the Graph
  const p1Vis = new THREE.Vector3(GRAPH_ORIGIN.x + T1 * SCALE_X, GRAPH_ORIGIN.y + s1 * SCALE_Y, 0);
  const p2Vis = new THREE.Vector3(GRAPH_ORIGIN.x + activeT2 * SCALE_X, GRAPH_ORIGIN.y + activeS2 * SCALE_Y, 0);

  // Secant / Tangent Line endpoints (extending the line infinitely visually)
  const visualSlope = isSnapped 
    ? (GRAVITY * 2 * T1 * SCALE_Y) / SCALE_X
    : (p2Vis.y - p1Vis.y) / (p2Vis.x - p1Vis.x);
    
  const lineStart = p1Vis.clone().add(new THREE.Vector3(-10, -10 * visualSlope, 0));
  const lineEnd = p1Vis.clone().add(new THREE.Vector3(10, 10 * visualSlope, 0));

  // Pre-calculate the background parabola curve
  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let t = 0; t <= 5; t += 0.1) {
      pts.push([
        GRAPH_ORIGIN.x + t * SCALE_X,
        GRAPH_ORIGIN.y + (GRAVITY * t * t) * SCALE_Y,
        -0.1
      ]);
    }
    return pts;
  }, []);

  // --- DRAG PHYSICS ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setDragState('t2');
    document.body.style.cursor = 'ew-resize';
  };

  const handlePointerMove = (e: any) => {
    if (dragState === 't2') {
      // Map visual X back to mathematical t2
      let rawT = (e.point.x - GRAPH_ORIGIN.x) / SCALE_X;
      
      // Clamp values and apply the magnetic snap
      if (rawT > 5) rawT = 5;
      if (rawT < T1) rawT = T1;
      
      if (Math.abs(rawT - T1) < 0.15) {
        rawT = T1;
      }
      
      setT2(rawT);
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Secant Slider</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Finding instantaneous velocity using limits. Curve: $s = 4.9t^2$[cite: 26].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Velocity Telemetry</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">t₁ = {T1}s</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-stone-300 font-mono text-sm">
              <span>Time Marker ($t_2$)</span>
              <span className={`font-bold ${isSnapped ? 'text-emerald-400' : 'text-amber-400'}`}>
                {activeT2.toFixed(2)} s
              </span>
            </div>
            <input 
              type="range" min="2" max="5" step="0.01" value={t2} 
              onChange={(e) => setT2(parseFloat(e.target.value))}
              className={`w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer ${isSnapped ? 'accent-emerald-500' : 'accent-amber-500'}`}
            />
          </div>

          <div className="flex flex-col gap-2 bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-sm">
            <div className="flex justify-between items-center text-stone-400">
              <span>Interval ($h$):</span>
              <span className={isSnapped ? 'text-emerald-400 font-bold' : ''}>
                {activeH.toFixed(3)} s
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-400">
              <span>Displacement ($\Delta s$):</span>
              <span>{(activeS2 - s1).toFixed(2)} m</span>
            </div>
            
            <div className="border-t border-stone-800 my-1"></div>
            
            <div className="flex justify-between items-center">
              <span className={`${isSnapped ? 'text-emerald-400' : 'text-white'} font-bold`}>
                {isSnapped ? 'Instant Velocity:' : 'Average Velocity:'}
              </span>
              <span className={`font-bold ${isSnapped ? 'text-emerald-400' : 'text-amber-400'}`}>
                {averageVelocity.toFixed(2)} m/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isSnapped ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Limit Reached</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            As the interval $h$ shrinks towards zero, the two points merge[cite: 26]. The secant line smoothly pivots and snaps into a perfect tangent line resting on the curve[cite: 26].
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-emerald-400">
            You physically proved that instantaneous velocity is simply average velocity calculated over an infinitely small time gap[cite: 26].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [5, 4, 20], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            {/* INVISIBLE CAPTURE PLANE FOR DRAGGING */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              visible={false}
            >
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial />
            </mesh>

            <group>
              {/* ============================================================== */}
              {/* LEFT SIDE: THE PHYSICAL CLIFF & BALL[cite: 26]                 */}
              {/* ============================================================== */}
              <group position={[-8, 0, 0]}>
                {/* 3D Cliff */}
                <mesh position={[0, -2, -1]}>
                  <boxGeometry args={[3, 14, 2]} />
                  <meshStandardMaterial color="#334155" roughness={0.8} />
                </mesh>
                
                {/* The Dropping Ball */}
                {/* Height maps to the current activeS2 to visually link time and space */}
                <mesh position={[2, 5 - (activeS2 * SCALE_Y), 0]}>
                  <sphereGeometry args={[0.4, 32, 32]} />
                  <meshStandardMaterial color={isSnapped ? "#10b981" : "#f59e0b"} emissive={isSnapped ? "#059669" : "#d97706"} emissiveIntensity={0.5} />
                </mesh>

                {/* Ground */}
                <mesh position={[2, -6, 0]}>
                  <boxGeometry args={[4, 0.2, 4]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
              </group>

              {/* ============================================================== */}
              {/* RIGHT SIDE: THE DYNAMIC GRAPH[cite: 26]                        */}
              {/* ============================================================== */}
              <group>
                {/* Axes */}
                <Line points={[[GRAPH_ORIGIN.x - 1, GRAPH_ORIGIN.y, 0], [GRAPH_ORIGIN.x + 15, GRAPH_ORIGIN.y, 0]] as [number, number, number][]} color="#64748b" lineWidth={2} />
                <Line points={[[GRAPH_ORIGIN.x, GRAPH_ORIGIN.y - 1, 0], [GRAPH_ORIGIN.x, GRAPH_ORIGIN.y + 15, 0]] as [number, number, number][]} color="#64748b" lineWidth={2} />

                {/* Mathematical Curve (s = 4.9t^2) */}
                <Line points={curvePoints} color="#334155" lineWidth={4} />

                {/* Secant / Tangent Line */}
                <Line 
                  points={[lineStart, lineEnd]} 
                  color={isSnapped ? "#10b981" : "#fcd34d"} 
                  lineWidth={isSnapped ? 4 : 2} 
                />

                {/* Fixed Point P1 at t = 2 */}
                <group position={p1Vis}>
                  <mesh>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} />
                  </mesh>
                  <Billboard position={[-1.2, 0.5, 0]}>
                    <Text fontSize={0.4} color="#34d399" fontWeight="bold">t=2</Text>
                  </Billboard>
                </group>

                {/* Draggable Point P2 at t2 */}
                {!isSnapped && (
                  <group position={p2Vis}>
                    <mesh 
                      onPointerDown={handlePointerDown}
                      onPointerOver={() => document.body.style.cursor = 'ew-resize'}
                      onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
                    >
                      <sphereGeometry args={[0.35, 32, 32]} />
                      <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
                    </mesh>
                    <Billboard position={[1.2, -0.5, 0]}>
                      <Text fontSize={0.4} color="#fbbf24" fontWeight="bold">t₂</Text>
                    </Billboard>
                  </group>
                )}
              </group>

            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -6, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}