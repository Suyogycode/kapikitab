'use client';

import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { Layers } from 'lucide-react';

// ==================================================================
// NATIVE R3F COMPONENTS
// ==================================================================
function ExponentialPaper({ folds }: { folds: number }) {
  const paperRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!paperRef.current) return;
    
    // VISUAL TRICK: We use a logarithmic scale for the 3D rendering 
    // so the GPU doesn't crash when calculating the distance to the moon.
    const visualHeight = Math.max(0.01, Math.pow(1.15, folds) * 0.05);
    
    // Smoothly animate the paper growing
    paperRef.current.scale.y = THREE.MathUtils.lerp(paperRef.current.scale.y, visualHeight, delta * 4);
    paperRef.current.position.y = paperRef.current.scale.y / 2;

    // Smoothly pull the camera back as the paper grows
    const targetZ = 5 + (folds * 0.4);
    const targetY = 2 + (folds * 0.2);
    state.camera.position.lerp(new THREE.Vector3(0, targetY, targetZ), delta * 2);
  });

  return (
    <mesh ref={paperRef} castShadow receiveShadow>
      <boxGeometry args={[4, 1, 3]} />
      <meshStandardMaterial color="#f5f5f4" roughness={0.9} />
    </mesh>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function LunarFold() {
  const [folds, setFolds] = useState<number>(0);

  // Math Engine: Calculate actual thickness (Starts at 0.001 cm = 0.00001 meters)
  const thicknessCM = 0.001 * Math.pow(2, folds);
  
  // Format the distance into human-readable scales
  const getFormattedDistance = (cm: number) => {
    if (cm < 100) return `${cm.toFixed(3)} cm`;
    const meters = cm / 100;
    if (meters < 1000) return `${meters.toFixed(2)} Meters`;
    const km = meters / 1000;
    return `${km.toFixed(2)} Kilometers`;
  };

  // Determine the current milestone milestone
  let milestone = "A standard sheet of paper.";
  let placeholderColor = "bg-stone-300"; // Fallback color for SVG
  
  if (folds >= 46) {
    milestone = "703,687 km: You have passed the Moon!";
    placeholderColor = "bg-slate-800"; // Space
  } else if (folds >= 30) {
    milestone = "10.7 km: Cruising altitude of commercial airplanes.";
    placeholderColor = "bg-sky-400"; // Sky
  } else if (folds >= 26) {
    milestone = "671 meters: Taller than the Burj Khalifa.";
    placeholderColor = "bg-amber-600"; // Desert city
  } else if (folds >= 15) {
    milestone = "32 meters: Taller than a 10-story building.";
    placeholderColor = "bg-emerald-600"; // Trees/City
  } else if (folds >= 10) {
    milestone = "102 cm: About the height of a toddler.";
    placeholderColor = "bg-rose-400";
  }

  return (
    <div className="w-full h-full min-h-[600px] relative bg-stone-900 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* TOP UI OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">The Lunar Fold</h2>
        <p className="text-stone-400 text-sm mt-1">Visualizing Exponential Growth: <span className="font-mono text-emerald-400">0.001 × 2ⁿ</span></p>
      </div>

      {/* MILESTONE INDICATOR (WITH SVG PLACEHOLDER) */}
      <div className="absolute top-6 right-6 z-10 w-64 bg-stone-800/80 backdrop-blur-md border border-stone-700 rounded-2xl p-4 shadow-2xl">
        <div className={`w-full h-24 rounded-lg mb-3 flex items-center justify-center overflow-hidden transition-colors duration-700 ${placeholderColor}`}>
          {/* 
            SVG PLACEHOLDER: 
            Replace this span with <img src={`/assets/milestone-${folds}.svg`} /> 
            when your designer hands off the milestone illustrations!
          */}
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest text-center px-2">
            [ Illustration Placeholder ]
          </span>
        </div>
        <p className="text-sm font-medium text-stone-200 leading-tight">{milestone}</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="flex-1 w-full relative min-h-[400px] z-0">
        <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <Environment preset="city" />
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 - 0.05} />

          <group position={[0, -1, 0]}>
            {/* The base desk/floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#1c1917" roughness={0.8} />
            </mesh>
            <ExponentialPaper folds={folds} />
            <ContactShadows resolution={512} scale={10} blur={2} opacity={0.6} far={5} />
          </group>
        </Canvas>
        </div>
      </div>

      {/* BOTTOM CONTROL PANEL */}
      <div className="p-6 bg-white border-t border-stone-200 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={16} /> Number of Folds (n)
              </label>
              <span className="text-lg font-mono font-bold text-emerald-600">{folds}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="46" 
              value={folds} 
              onChange={(e) => setFolds(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 w-full sm:w-64 shrink-0 text-center">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Actual Thickness</p>
            <p className="text-lg font-mono font-bold text-stone-800">
              {getFormattedDistance(thicknessCM)}
            </p>
          </div>

        </div>
      </div>

    </div>
    
  );
}