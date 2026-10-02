'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard, Line } from '@react-three/drei';

// ==================================================================
// DYNAMIC GEAR COMPONENT
// ==================================================================
function TransmissionGear({ 
  position, 
  rotationZ, 
  radius, 
  color, 
  label, 
  speedLabel 
}: { 
  position: [number, number, number], 
  rotationZ: number, 
  radius: number, 
  color: string, 
  label: string,
  speedLabel: string
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = rotationZ;
    }
  });

  // Dynamically calculate teeth based on radius so they mesh correctly
  const teethCount = Math.max(8, Math.floor(radius * 8));

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Gear Core */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius, radius, 0.5, 32]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Gear Inner Hole / Axle */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.2, radius * 0.2, 0.52, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        
        {/* Gear Teeth */}
        {Array.from({ length: teethCount }).map((_, i) => {
          const angle = (i / teethCount) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[0.3, 0.3, 0.5]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
      
      {/* Floating Labels */}
      <Billboard position={[0, radius + 1, 0]}>
        <Text fontSize={0.6} color={color} fontWeight="bold">{label}</Text>
        <Text position={[0, -0.6, 0]} fontSize={0.4} color="#f8fafc">{speedLabel}</Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// GEARBOX ENGINE (Inside Canvas)
// ==================================================================
function GearBoxScene({ innerRate, outerRatio }: { innerRate: number, outerRatio: number }) {
  // We manage the cumulative rotation angles manually to prevent snapping when changing speeds
  const rot1Ref = useRef(0);
  const rot2Ref = useRef(0);

  // Mechanical Physics: 
  // Speed of Gear 1 = innerRate (dt/dx)
  // Speed of Gear 2 = innerRate * outerRatio
  // To achieve this gear ratio mechanically, Radius 1 / Radius 2 must equal outerRatio.
  const radius1 = 3;
  const radius2 = 3 / outerRatio;
  
  // Calculate the distance needed between the two gears so their teeth mesh perfectly
  const gearDistance = radius1 + radius2;

  useFrame((_, delta) => {
    // Gear 1 rotates forward
    const speed1 = innerRate;
    rot1Ref.current += speed1 * delta;

    // Gear 2 rotates in the opposite direction at the scaled speed
    const speed2 = innerRate * outerRatio;
    rot2Ref.current -= speed2 * delta;
  });

  return (
    <group position={[-gearDistance / 2, -1, 0]}>
      {/* Base Mount */}
      <mesh position={[gearDistance / 2, 0, -0.5]}>
        <boxGeometry args={[gearDistance + Math.max(radius1, radius2) * 2 + 2, Math.max(radius1, radius2) * 2 + 2, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Gear 1: Inner Function (u(x)) */}
      <TransmissionGear 
        position={[0, 0, 0]} 
        rotationZ={rot1Ref.current} 
        radius={radius1} 
        color="#3b82f6" 
        label="Gear 1 (Inner)" 
        speedLabel={`Speed: ${innerRate.toFixed(1)} rad/s`}
      />

      {/* Gear 2: Outer Function (v(t)) */}
      <TransmissionGear 
        position={[gearDistance, 0, 0]} 
        rotationZ={rot2Ref.current} 
        radius={radius2} 
        color="#f59e0b" 
        label="Gear 2 (Outer)" 
        speedLabel={`Speed: ${(innerRate * outerRatio).toFixed(1)} rad/s`}
      />
      
      {/* Vector Visualization of Speed */}
      <group position={[gearDistance, 0, 1]}>
        <Line 
          points={[[0, 0, 0], [0, innerRate * outerRatio, 0]] as [number, number, number][]} 
          color="#10b981" 
          lineWidth={8} 
        />
        <mesh position={[0, innerRate * outerRatio, 0]}>
          <coneGeometry args={[0.2, 0.4, 16]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <Billboard position={[0.8, (innerRate * outerRatio) / 2, 0]}>
          <Text fontSize={0.5} color="#10b981" fontWeight="bold">Output Vector</Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function GearBoxChainRule() {
  const [innerRate, setInnerRate] = useState<number>(1.0); // dt/dx
  const [outerRatio, setOuterRatio] = useState<number>(2.0); // dv/dt
  const [showAha, setShowAha] = useState<boolean>(false);

  const finalOutput = innerRate * outerRatio;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Gear-Box Chain Rule</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            The derivative of a composite function f(x) = v(u(x)) is solved using the Chain Rule[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Transmission Controls</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">
              Output: {finalOutput.toFixed(1)}
            </span>
          </div>
          
          <div className="flex flex-col gap-4 mb-6">
            {/* Inner Rate Slider (Gear 1 Speed) */}
            <div className="p-3 rounded-lg border border-blue-500/50 bg-blue-950/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-400 font-bold text-sm">Inner Deriv (dt/dx)</span>
                <span className="text-blue-200 font-mono">{innerRate.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.1" 
                value={innerRate} 
                onChange={(e) => {
                  setInnerRate(parseFloat(e.target.value));
                  setShowAha(true);
                }}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-blue-300/70 text-xs mt-2">Sets the base rotation of Gear 1[cite: 22].</div>
            </div>

            {/* Outer Ratio Slider (Gear 2 Scaling) */}
            <div className="p-3 rounded-lg border border-amber-500/50 bg-amber-950/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-amber-400 font-bold text-sm">Outer Deriv (dv/dt)</span>
                <span className="text-amber-200 font-mono">{outerRatio.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.5" max="3" step="0.1" 
                value={outerRatio} 
                onChange={(e) => {
                  setOuterRatio(parseFloat(e.target.value));
                  setShowAha(true);
                }}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="text-amber-300/70 text-xs mt-2">Scales the transmission ratio (changes gear size)[cite: 22].</div>
            </div>
          </div>

          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-center font-mono text-emerald-400 font-bold">
            df/dx = (dv/dt) * (dt/dx)
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${showAha ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Mechanical Transmission Validated</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The output speed is a direct product of the sequential gear ratios[cite: 22]. 
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-white">
            By watching the inner and outer velocities multiply into a combined output vector, the abstract formula transforms into an intuitive mechanical transmission[cite: 22].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} />

            <GearBoxScene innerRate={innerRate} outerRatio={outerRatio} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}