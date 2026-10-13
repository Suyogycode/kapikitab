'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MATH FUNCTIONS
// ==================================================================
// We use a cubic polynomial: f(x) = x^3 / 4 - 3x
// Its derivative is: f'(x) = 3x^2 / 4 - 3
// Critical points (where f'(x) = 0) are at x = -2 (local max) and x = 2 (local min).

const f = (x: number) => (Math.pow(x, 3) / 4) - (3 * x);
const df = (x: number) => (3 * Math.pow(x, 2) / 4) - 3;

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function CurveScene({ targetX }: { targetX: number }) {
  const pointRef = useRef<THREE.Group>(null);
  const tangentRef = useRef<THREE.Group>(null);

  // Generate the full cubic curve for the background
  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -5; x <= 5; x += 0.1) {
      pts.push([x, f(x), 0]);
    }
    return pts;
  }, []);

  const currentY = f(targetX);
  const currentSlope = df(targetX);
  
  // Determine color based on slope behavior[cite: 20]
  let activeColor = "#fcd34d"; // Gold for zero slope (Critical Point)
  if (currentSlope > 0.05) activeColor = "#ef4444"; // Fiery Red for positive slope (Increasing)[cite: 20]
  if (currentSlope < -0.05) activeColor = "#3b82f6"; // Cool Blue for negative slope (Decreasing)[cite: 20]

  useFrame((_, delta) => {
    if (!pointRef.current || !tangentRef.current) return;

    // Smoothly animate the point along the curve
    const targetPos = new THREE.Vector3(targetX, currentY, 0.1);
    pointRef.current.position.lerp(targetPos, delta * 12);

    // Smoothly animate the tangent line rotation
    // The angle of the tangent line is the arctangent of the slope
    const targetAngle = Math.atan(currentSlope);
    
    tangentRef.current.position.lerp(targetPos, delta * 12);
    // Keep rotation interpolation clean without flipping
    tangentRef.current.rotation.z = THREE.MathUtils.lerp(tangentRef.current.rotation.z, targetAngle, delta * 15);
  });

  return (
    <group>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
      <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
      <Line points={[[0, -10, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
      
      {/* The Smooth Undulating 3D Curve[cite: 20] */}
      <Line points={curvePoints} color="#94a3b8" lineWidth={5} />

      {/* The Dynamic Tangent Line[cite: 20] */}
      <group ref={tangentRef}>
        <Line points={[[-3, 0, 0.05], [3, 0, 0.05]] as [number, number, number][]} color={activeColor} lineWidth={6} />
      </group>

      {/* The Glowing Point[cite: 20] */}
      <group ref={pointRef}>
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={activeColor} emissive={activeColor} emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SlopeSwitch() {
  const [rawX, setRawX] = useState<number>(-4);

  // Apply a magnetic snap to exact critical points so the tangent locks perfectly horizontal[cite: 20]
  let targetX = rawX;
  if (Math.abs(rawX - 2) < 0.15) targetX = 2;
  if (Math.abs(rawX + 2) < 0.15) targetX = -2;

  const currentSlope = df(targetX);
  const isCritical = Math.abs(currentSlope) <= 0.05;
  const isIncreasing = currentSlope > 0.05;
  const isDecreasing = currentSlope < -0.05;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Slope Switch</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Critical points f'(x) = 0 act as exact boundaries where the function switches behavior[cite: 20].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Derivative Tracker</span>
            <span className="text-stone-300 font-mono text-xs font-bold">x = {targetX.toFixed(2)}</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Dynamic Status Readout */}
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${isIncreasing ? 'border-red-500/50 bg-red-950/30' : isDecreasing ? 'border-blue-500/50 bg-blue-950/30' : 'border-amber-500/50 bg-amber-950/30'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={isIncreasing ? "text-red-400 font-bold" : isDecreasing ? "text-blue-400 font-bold" : "text-amber-400 font-bold"}>
                  {isIncreasing ? "Strictly Increasing" : isDecreasing ? "Strictly Decreasing" : "Critical Point"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">f'(x) Value:</span>
                <span className={isIncreasing ? "text-red-300 font-bold" : isDecreasing ? "text-blue-300 font-bold" : "text-amber-300 font-bold"}>
                  {currentSlope.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-stone-400">Condition:</span>
                <span className={isIncreasing ? "text-red-300 font-bold" : isDecreasing ? "text-blue-300 font-bold" : "text-amber-300 font-bold"}>
                  {isIncreasing ? "f'(x) > 0" : isDecreasing ? "f'(x) < 0" : "f'(x) = 0"}
                </span>
              </div>
            </div>
            
          </div>

          <div className="p-4 rounded-lg border border-stone-700 bg-stone-950">
            <div className="text-stone-300 font-bold mb-2 text-center text-sm">Drag Point Along Curve</div>
            <input 
              type="range" min="-4.5" max="4.5" step="0.05" 
              value={rawX} 
              onChange={(e) => setRawX(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-400"
            />
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isCritical ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Turning Point Hit</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As you physically push the point over the "hills" and through the "valleys" of the curve, you can watch the derivative change signs in real-time[cite: 20].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-sm font-bold text-amber-300">
            Finding where a function increases or decreases is simply a matter of tracking when the tangent's tilt flips from positive to negative[cite: 20].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            {/* Lock rotation for clearer 2D reading, but keep it in 3D space */}
            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <CurveScene targetX={targetX} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -8, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}