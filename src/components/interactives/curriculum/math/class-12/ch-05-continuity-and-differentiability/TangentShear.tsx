'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// TANGENT VECTOR COMPONENT
// ==================================================================
function TangentTracker({ targetX }: { targetX: number }) {
  const leftVectorRef = useRef<THREE.Group>(null);
  const rightVectorRef = useRef<THREE.Group>(null);
  const pointRef = useRef<THREE.Mesh>(null);
  const radarRef = useRef<THREE.Group>(null);

  const isShattered = Math.abs(targetX) < 0.05;

  useFrame((state, delta) => {
    if (!leftVectorRef.current || !rightVectorRef.current || !pointRef.current || !radarRef.current) return;

    const currentX = targetX;
    const currentY = Math.abs(currentX);

    // Update the central tracking point
    pointRef.current.position.lerp(new THREE.Vector3(currentX, currentY, 0.1), delta * 10);

    // Radar beam sweeping effect
    const time = state.clock.getElapsedTime();
    radarRef.current.position.copy(pointRef.current.position);
    radarRef.current.rotation.z = time * 2;

    // Tangent Line / Fractured Vectors
    if (isShattered) {
      // Snap and fracture at x = 0
      leftVectorRef.current.position.lerp(new THREE.Vector3(0, 0, 0), delta * 10);
      leftVectorRef.current.rotation.z = THREE.MathUtils.lerp(leftVectorRef.current.rotation.z, Math.PI / 4, delta * 10); // Points +1 (Up-Right)
      
      rightVectorRef.current.position.lerp(new THREE.Vector3(0, 0, 0), delta * 10);
      rightVectorRef.current.rotation.z = THREE.MathUtils.lerp(rightVectorRef.current.rotation.z, -Math.PI / 4, delta * 10); // Points -1 (Up-Left)
    } else {
      // Intact single tangent line sliding along the curve
      const slope = currentX < 0 ? -1 : 1;
      const angle = Math.atan(slope);

      leftVectorRef.current.position.lerp(new THREE.Vector3(currentX, currentY, 0), delta * 10);
      leftVectorRef.current.rotation.z = THREE.MathUtils.lerp(leftVectorRef.current.rotation.z, angle, delta * 15);
      
      rightVectorRef.current.position.lerp(new THREE.Vector3(currentX, currentY, 0), delta * 10);
      rightVectorRef.current.rotation.z = THREE.MathUtils.lerp(rightVectorRef.current.rotation.z, angle, delta * 15);
    }
  });

  return (
    <group>
      {/* Tracker Point */}
      <mesh ref={pointRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={isShattered ? "#ef4444" : "#fcd34d"} />
      </mesh>

      {/* Radar Ring */}
      <group ref={radarRef}>
        <Line points={[[-0.6, 0, 0.05], [0.6, 0, 0.05]] as [number, number, number][]} color="#38bdf8" lineWidth={1} transparent opacity={0.4} />
        <Line points={[[0, -0.6, 0.05], [0, 0.6, 0.05]] as [number, number, number][]} color="#38bdf8" lineWidth={1} transparent opacity={0.4} />
      </group>

      {/* Conflicting Vector 1 (Represents RHD when shattered) */}
      <group ref={leftVectorRef}>
        <Line points={[[0, 0, 0.1], [3, 0, 0.1]] as [number, number, number][]} color={isShattered ? "#ef4444" : "#f59e0b"} lineWidth={isShattered ? 6 : 4} />
        {isShattered && (
          <Billboard position={[3.5, 0, 0.2]}>
            <Text fontSize={0.5} color="#ef4444" fontWeight="bold">RHD (+1)</Text>
          </Billboard>
        )}
      </group>

      {/* Conflicting Vector 2 (Represents LHD when shattered) */}
      <group ref={rightVectorRef}>
        <Line points={[[-3, 0, 0.1], [0, 0, 0.1]] as [number, number, number][]} color={isShattered ? "#ef4444" : "#f59e0b"} lineWidth={isShattered ? 6 : 4} />
        {isShattered && (
          <Billboard position={[-3.5, 0, 0.2]}>
            <Text fontSize={0.5} color="#ef4444" fontWeight="bold">LHD (-1)</Text>
          </Billboard>
        )}
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function TangentShear() {
  const [targetX, setTargetX] = useState<number>(-5);

  const isShattered = Math.abs(targetX) < 0.05;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Tangent Shear</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Every differentiable function is continuous, but the converse is not true. Using f(x) = |x| as the classic counterexample.
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Derivative Radar</span>
            <span className={isShattered ? "text-red-400 font-mono text-xs font-bold" : "text-emerald-400 font-mono text-xs font-bold"}>
              x = {targetX.toFixed(2)}
            </span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${isShattered ? 'border-red-500/50 bg-red-950/50' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between mb-1">
                <span className="text-stone-400">Left-Hand Derivative (LHD):</span>
                <span className="text-sky-400 font-bold">-1</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-400">Right-Hand Derivative (RHD):</span>
                <span className="text-amber-400 font-bold">+1</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-stone-800">
                <span className="text-stone-400">Differentiability at x:</span>
                <span className={isShattered ? "text-red-400 font-bold animate-pulse" : "text-emerald-400 font-bold"}>
                  {isShattered ? "LHD != RHD" : "LHD == RHD"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-sky-500/50 bg-sky-950/30">
            <div className="text-sky-400 font-bold mb-2">Drag Tangent Line</div>
            <input 
              type="range" min="-5" max="5" step="0.05" 
              value={targetX} 
              onChange={(e) => setTargetX(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="text-sky-200 text-xs mt-2 text-center">
              Move the tangent line across the cusp at x = 0.
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-300 ${isShattered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-red-950/95 border-2 border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-in slide-in-from-bottom-4">
          <p className="text-red-400 text-sm uppercase tracking-widest font-bold mb-2">Tangent Line Shattered</p>
          <p className="text-red-100 text-sm leading-relaxed mb-2">
            When the tangent hits the sharp vertex at x = 0, it cannot decide whether to point upward (+1) or downward (-1). The line violently snaps and fractures into two conflicting vectors.
          </p>
          <div className="inline-block bg-red-900/50 px-6 py-2 rounded-lg border border-red-700 font-mono text-base font-bold text-white">
            Even though the curve is unbroken (continuous), the abrupt change in slope shatters the derivative.
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <group>
              {/* 2D Coordinate Grid */}
              <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
              <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
              <Line points={[[0, -2, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
              
              <Billboard position={[0.5, 9, 0]}><Text fontSize={0.5} color="#64748b">Y</Text></Billboard>
              <Billboard position={[9, 0.5, 0]}><Text fontSize={0.5} color="#64748b">X</Text></Billboard>

              {/* ABSOLUTE VALUE CURVE: f(x) = |x| */}
              <Line points={[[-10, 10, 0], [0, 0, 0], [10, 10, 0]] as [number, number, number][]} color="#38bdf8" lineWidth={4} />
              
              {/* The Dynamic Tangent Vector Tracker */}
              <TangentTracker targetX={targetX} />
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}