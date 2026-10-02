'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

// ==================================================================
// 3D BALLOON COMPONENT (Must be inside Canvas)
// ==================================================================
function ExpandingBalloon({ radius }: { radius: number }) {
  const balloonRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!balloonRef.current || !wireframeRef.current) return;
    
    // Smoothly interpolate scale for fluid visual expansion
    const targetScale = new THREE.Vector3(radius, radius, radius);
    balloonRef.current.scale.lerp(targetScale, delta * 10);
    wireframeRef.current.scale.lerp(targetScale, delta * 10);
    
    // Slowly rotate to emphasize 3D volume
    balloonRef.current.rotation.y += delta * 0.2;
    wireframeRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      {/* Solid Inner Volume Representation */}
      <mesh ref={balloonRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial 
          color="#38bdf8" 
          transmission={0.8} 
          opacity={0.9} 
          roughness={0.1} 
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Outer Wireframe Surface Area Representation */}
      <mesh ref={wireframeRef}>
        <sphereGeometry args={[1.02, 32, 32]} />
        <meshBasicMaterial 
          color="#7dd3fc" 
          wireframe 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Center Origin Point */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ScalingRipple() {
  // Time (t) is our independent variable.
  // We assume radius grows linearly with time: r(t) = t (so dr/dt = 1).
  const [time, setTime] = useState<number>(1);

  // Geometric Calculations
  const r = time;
  const area = 4 * Math.PI * Math.pow(r, 2);
  const volume = (4 / 3) * Math.PI * Math.pow(r, 3);

  // Rate of Change Calculations (Derivatives)
  const dr_dt = 1; // Constant growth rate of radius
  const dA_dt = 8 * Math.PI * r * dr_dt; // Chain rule: dA/dr * dr/dt
  const dV_dt = 4 * Math.PI * Math.pow(r, 2) * dr_dt; // Chain rule: dV/dr * dr/dt

  // For the Aha Moment, trigger when time gets high enough to show extreme non-linear scaling
  const isAhaMoment = time > 3.5;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Scaling Ripple</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Derivatives measure the instantaneous rate of change of one variable with respect to another[cite: 19].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Live Telemetry</span>
            <span className="text-sky-400 font-mono text-xs font-bold">t = {time.toFixed(1)}s</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Radius Stats */}
            <div className="p-3 rounded-lg border border-sky-500/50 bg-sky-950/30">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sky-400 font-bold">Radius (r)</span>
                <span className="text-sky-100">{r.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-sky-300/70">Rate (dr/dt):</span>
                <span className="text-sky-300 font-bold">{dr_dt.toFixed(1)} m/s (Constant)</span>
              </div>
            </div>

            {/* Surface Area Stats */}
            <div className="p-3 rounded-lg border border-amber-500/50 bg-amber-950/30 transition-all duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-400 font-bold">Area (A)</span>
                <span className="text-amber-100">{area.toFixed(1)} m^2</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300/70">Rate (dA/dt):</span>
                <span className="text-amber-300 font-bold">{(dA_dt).toFixed(1)} m^2/s</span>
              </div>
              {/* Visual acceleration bar */}
              <div className="w-full h-1 bg-stone-900 mt-2 rounded overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (dA_dt / 100) * 100)}%` }}></div>
              </div>
            </div>

            {/* Volume Stats */}
            <div className="p-3 rounded-lg border border-emerald-500/50 bg-emerald-950/30 transition-all duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-400 font-bold">Volume (V)</span>
                <span className="text-emerald-100">{volume.toFixed(1)} m^3</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-300/70">Rate (dV/dt):</span>
                <span className="text-emerald-300 font-bold">{(dV_dt).toFixed(1)} m^3/s</span>
              </div>
              {/* Visual acceleration bar */}
              <div className="w-full h-1 bg-stone-900 mt-2 rounded overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (dV_dt / 300) * 100)}%` }}></div>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-lg border border-stone-700 bg-stone-950">
            <div className="text-stone-300 font-bold mb-2 text-center text-sm">Drag Time Slider</div>
            <input 
              type="range" min="0.1" max="5" step="0.1" 
              value={time} 
              onChange={(e) => setTime(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-400"
            />
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-sky-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(56,189,248,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-sky-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Scaling Observed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As the radius grows linearly (a constant input rate of 1 m/s), you can watch the Area and Volume curves accelerate exponentially[cite: 19]. 
          </p>
          <div className="inline-block bg-sky-950/50 px-6 py-2 rounded-lg border border-sky-900/50 font-mono text-sm font-bold text-sky-300">
            This physically demonstrates why a constant input rate yields a non-constant output velocity, turning abstract calculus into a direct observation[cite: 19].
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

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <group>
              {/* 3D Grid Floor */}
              <gridHelper args={[40, 40, "#1e293b", "#0f172a"]} rotation={[0, 0, 0]} position={[0, -2, 0]} />
              
              {/* Expanding Spherical Balloon[cite: 19] */}
              <ExpandingBalloon radius={r} />
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -1.9, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}