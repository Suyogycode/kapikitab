'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Line } from '@react-three/drei';
import { Map, Info, Compass, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F COMPONENTS
// ==================================================================
function MapSurface({ rfDenominator }: { rfDenominator: number }) {
  const arcRef = useRef<THREE.Line>(null);

  // The base map distance is fixed at 4.8cm. 
  // In our 3D space, we'll treat 1 unit as 1 cm for the map scale.
  const pinA: [number, number, number] = [-2.4, 0.05, 0];
  const pinB: [number, number, number] = [2.4, 0.05, 0];

  // Calculate the arc height dynamically based on the RF scale.
  // 6,000,000 is our max scale, translating to a visual height of ~4 units.
  const arcHeight = (rfDenominator / 6000000) * 4;

  const arcPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = THREE.MathUtils.lerp(pinA[0], pinB[0], t);
      // Parabolic arc for the 3D extrusion
      const y = 0.05 + Math.sin(t * Math.PI) * arcHeight;
      const z = 0;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, [arcHeight]);

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. The Heavy Stone Desk */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[12, 1, 8]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>

      {/* 2. The Map Canvas */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#e7e5e4" roughness={1} />
        {/* SVG Placeholders for the topographical map of South India */}
        <Text position={[0, 0.01, -1.5]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.4} color="#a8a29e" fontStyle="italic">
          [ Topographical Map Placeholder ]
        </Text>
      </mesh>

      {/* 3. The City Pins */}
      <mesh position={pinA} castShadow>
        <cylinderGeometry args={[0.08, 0.02, 0.4, 16]} />
        <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={pinB} castShadow>
        <cylinderGeometry args={[0.08, 0.02, 0.4, 16]} />
        <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* 4. The 2D Map Distance Line */}
      <Line points={[pinA, pinB]} color="#10b981" lineWidth={3} />
      
      {/* 5. The 3D Extruded Actual Distance Arc */}
      <Line points={arcPoints} color="#0ea5e9" lineWidth={4} dashed dashScale={2} dashSize={0.2} dashOffset={0} />

      {/* Floating 3D Label for the Map Distance */}
      <Text position={[0, 0.3, 0.5]} fontSize={0.25} color="#059669">
        Map: 4.8 cm
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function CartographersDesk() {
  // RF Denominator (e.g., 1 : 6,000,000)
  const [rfDenominator, setRfDenominator] = useState<number>(6000000);
  
  // Math Engine
  const mapDistanceCM = 4.8;
  const actualDistanceCM = mapDistanceCM * rfDenominator;
  const actualDistanceKM = actualDistanceCM / 100000;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white flex items-center gap-3">
          <Compass className="text-emerald-500" /> The Cartographer's Desk
        </h2>
        <p className="text-stone-400 text-sm mt-1">Direct Proportion: Map Scale vs. Reality</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 4, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minPolarAngle={Math.PI / 4}
            />
            
            <MapSurface rfDenominator={rfDenominator} />

            <ContactShadows frames={1} resolution={512} scale={15} blur={2} opacity={0.6} far={10} color="#000000" />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Live Math HUD & Controls */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 flex flex-col items-center pointer-events-none">
        
        {/* Floating Distance Readout */}
        <motion.div 
          layout
          className="mb-6 bg-sky-950/80 backdrop-blur-md border border-sky-500/50 p-4 rounded-2xl shadow-2xl flex flex-col items-center pointer-events-auto min-w-[250px]"
        >
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1 mb-1">
            <Ruler size={14} /> Actual Geographical Distance
          </span>
          <span className="text-4xl font-mono font-bold text-white tracking-tight">
            {actualDistanceKM.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
          </span>
        </motion.div>

        {/* The RF Slider Panel */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 pointer-events-auto">
          
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-5 shadow-xl flex flex-col justify-center">
            <div className="flex justify-between items-end mb-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Map size={16} className="text-emerald-500" /> Representative Fraction (RF)
              </label>
              <span className="text-sm font-mono font-bold text-emerald-400">
                1 : {rfDenominator.toLocaleString()}
              </span>
            </div>
            <input 
              type="range" min="1000000" max="10000000" step="500000" 
              value={rfDenominator} 
              onChange={(e) => setRfDenominator(parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-stone-700/50 p-4 rounded-xl flex items-start gap-3 shadow-lg">
            <Info size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-stone-300 text-sm leading-relaxed">
              <strong>The Scale Multiplier:</strong> The physical distance on the map (4.8 cm) never changes. But as you adjust the RF scale, the real-world distance mathematically balloons outward, visualized by the expanding blue arc!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}