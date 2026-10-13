'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Mode = 'net_area' | 'absolute_area';

// ==================================================================
// MATH FUNCTIONS & CONSTANTS
// ==================================================================
// Function: f(x) = sin(x)
// Interval: [0, 2pi]
const PI = Math.PI;
const A_LIMIT = 0;
const B_LIMIT = 2 * PI;

// ==================================================================
// 3D SCENE COMPONENT (Must be inside Canvas)
// ==================================================================
function WaveScene({ mode }: { mode: Mode }) {
  const lobe2Ref = useRef<THREE.Group>(null);
  const lobe2MeshRef = useRef<THREE.Mesh>(null);
  const lobe2LineRef = useRef<any>(null); // Reference to the line component

  const isAbsolute = mode === 'absolute_area';

  // LOBE 1: [0, pi] (Always Positive)
  const lobe1Shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    for (let x = 0; x <= PI; x += 0.05) {
      shape.lineTo(x, Math.sin(x));
    }
    shape.lineTo(PI, 0);
    shape.lineTo(0, 0);
    return shape;
  }, []);

  const lobe1Line = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = 0; x <= PI; x += 0.05) pts.push([x, Math.sin(x), 0]);
    return pts;
  }, []);

  // LOBE 2: [pi, 2pi] (Initially Negative, flips in Absolute mode)
  const lobe2Shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(PI, 0);
    for (let x = PI; x <= 2 * PI; x += 0.05) {
      shape.lineTo(x, Math.sin(x));
    }
    shape.lineTo(2 * PI, 0);
    shape.lineTo(PI, 0);
    return shape;
  }, []);

  const lobe2Line = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = PI; x <= 2 * PI; x += 0.05) pts.push([x, Math.sin(x), 0]);
    return pts;
  }, []);

  useFrame((_, delta) => {
    if (!lobe2Ref.current || !lobe2MeshRef.current) return;

    // In Absolute Mode, we flip the negative lobe upward by scaling Y by -1[cite: 23]
    const targetScaleY = isAbsolute ? -1 : 1;
    lobe2Ref.current.scale.y = THREE.MathUtils.lerp(lobe2Ref.current.scale.y, targetScaleY, delta * 6);

    // Color transition: Blue (negative) -> Orange (positive absolute)[cite: 23]
    const targetColor = new THREE.Color(isAbsolute ? "#f97316" : "#3b82f6");
    const mat = lobe2MeshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.lerp(targetColor, delta * 6);
    mat.emissive.lerp(new THREE.Color(isAbsolute ? "#c2410c" : "#1e3a8a"), delta * 6);
  });

  return (
    <group position={[-PI, 0, 0]}>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[PI, 0, -0.6]} />
      <Line points={[[-5, 0, -0.1], [12, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      <Line points={[[0, -5, -0.1], [0, 5, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      
      {/* Axis Labels */}
      <Billboard position={[0.5, 4.5, 0]}><Text fontSize={0.4} color="#94a3b8">Y</Text></Billboard>
      <Billboard position={[8, 0.5, 0]}><Text fontSize={0.4} color="#94a3b8">X</Text></Billboard>
      
      <Billboard position={[0, -0.5, 0]}><Text fontSize={0.4} color="#94a3b8">0</Text></Billboard>
      <Billboard position={[PI, -0.5, 0]}><Text fontSize={0.4} color="#94a3b8">pi</Text></Billboard>
      <Billboard position={[2 * PI, -0.5, 0]}><Text fontSize={0.4} color="#94a3b8">2pi</Text></Billboard>

      {/* LOBE 1 (Positive) */}
      <group>
        <Line points={lobe1Line} color="#3b82f6" lineWidth={4} />
        <mesh position={[0, 0, 0]}>
          <extrudeGeometry args={[lobe1Shape, { depth: 0.2, bevelEnabled: false }]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} roughness={0.2} metalness={0.1} />
        </mesh>
        <Billboard position={[PI / 2, 0.5, 0.3]}>
          <Text fontSize={0.5} color="#ffffff" fontWeight="bold">Area = +2</Text>
        </Billboard>
      </group>

      {/* LOBE 2 (Alternating) */}
      <group ref={lobe2Ref}>
        <Line ref={lobe2LineRef} points={lobe2Line} color="#3b82f6" lineWidth={4} />
        <mesh ref={lobe2MeshRef} position={[0, 0, 0]}>
          <extrudeGeometry args={[lobe2Shape, { depth: 0.2, bevelEnabled: false }]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Lobe 2 Label is flipped manually to counter the group's Y-scale flip */}
        <Billboard position={[1.5 * PI, -0.5, 0.3]} scale={[1, isAbsolute ? -1 : 1, 1]}>
          <Text fontSize={0.5} color="#ffffff" fontWeight="bold">
            {isAbsolute ? "Area = +2 (Absolute)" : "Area = -2"}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AlternatingWave() {
  const [mode, setMode] = useState<Mode>('net_area');

  const isAbsolute = mode === 'absolute_area';
  const totalArea = isAbsolute ? 4 : 0;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Alternating Wave</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Definite integrals calculate net signed area (areas below the X-axis count as negative)[cite: 23].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Integral Computer</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Net Signed Area Box */}
            <div className={`p-3 rounded-lg border transition-colors ${!isAbsolute ? 'border-sky-500/50 bg-sky-950/30' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={!isAbsolute ? "text-sky-400 font-bold" : "text-stone-500"}>Standard Definite Integral</span>
              </div>
              <div className="text-xs mb-1">Integral [0 to 2pi] sin(x) dx</div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-800/50 text-sm">
                <span>Net Area:</span>
                <span className={`font-bold ${!isAbsolute ? 'text-sky-300' : 'text-stone-500'}`}>2 + (-2) = 0</span>
              </div>
            </div>

            {/* Total Geometric Area Box */}
            <div className={`p-3 rounded-lg border transition-colors ${isAbsolute ? 'border-orange-500/50 bg-orange-950/30' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={isAbsolute ? "text-orange-400 font-bold" : "text-stone-500"}>Total Geometric Area</span>
              </div>
              <div className="text-xs mb-1">Integral [0 to 2pi] |sin(x)| dx</div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-800/50 text-sm">
                <span>Total Boundary:</span>
                <span className={`font-bold ${isAbsolute ? 'text-orange-300' : 'text-stone-500'}`}>|2| + |-2| = 4</span>
              </div>
            </div>

          </div>

          <button 
            onClick={() => setMode(isAbsolute ? 'net_area' : 'absolute_area')}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${isAbsolute ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' : 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]'}`}
          >
            {isAbsolute ? 'Reset to Standard Integral' : 'Toggle Absolute Value Mapper'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAbsolute ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-orange-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(249,115,22,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-orange-400 text-xs uppercase tracking-widest font-bold mb-2">Absolute Value Corrected</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The negative lobes lying below the X-axis instantly flipped upward, glowing bright orange[cite: 23]. 
          </p>
          <div className="inline-block bg-orange-950/50 px-6 py-2 rounded-lg border border-orange-900/50 font-mono text-base font-bold text-orange-300">
            The net sum updated to 4, correctly reflecting the total accumulated physical footprint. This clears up why raw integration yields zero even when a massive physical shape is drawn[cite: 23].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 15]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <WaveScene mode={mode} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}