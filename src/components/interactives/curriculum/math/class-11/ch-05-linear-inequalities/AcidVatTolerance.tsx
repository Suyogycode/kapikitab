'use client';

import React, { useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AcidVatTolerance() {
  // State: Liters of 30% acid solution added (x)
  const [addedVolume, setAddedVolume] = useState<number>(0);

  // Constants based on the problem[cite: 24]
  const BASE_VOL = 600;
  const BASE_CONC = 0.12;
  const ADDED_CONC = 0.30;
  const MIN_CONC = 0.15;
  const MAX_CONC = 0.18;

  // Real-time Math Engine Calculations
  const totalVolume = BASE_VOL + addedVolume;
  const totalAcid = (BASE_VOL * BASE_CONC) + (addedVolume * ADDED_CONC);
  const currentConcPct = (totalAcid / totalVolume) * 100;

  // The critical boundary values derived algebraically[cite: 24]
  const lowerLimitX = 120; // x > 120
  const upperLimitX = 300; // x < 300
  
  const isValid = addedVolume >= lowerLimitX && addedVolume <= upperLimitX;
  const isBelow = addedVolume < lowerLimitX;
  const isAbove = addedVolume > upperLimitX;

  // 3D Spatial Mapping
  // 1200L total capacity maps to 6 units of 3D height. (Scale = 0.005 units/L)
  const SCALE = 0.005;
  const vatBaseY = -3;
  
  const fluidHeight = totalVolume * SCALE;
  const fluidCenterY = vatBaseY + (fluidHeight / 2);

  const lowerLaserY = vatBaseY + ((BASE_VOL + lowerLimitX) * SCALE); // Y = 0.6
  const upperLaserY = vatBaseY + ((BASE_VOL + upperLimitX) * SCALE); // Y = 1.5

  // Dynamic Fluid Color
  const getFluidColor = () => {
    if (isValid) return "#10b981"; // Green (Valid Safe Zone)[cite: 24]
    if (isAbove) return "#ef4444"; // Red (Invalid - Too Concentrated)[cite: 24]
    // Below 120L: Lerp from Pale Yellow to Amber[cite: 24]
    // For simplicity in R3F props without a manual lerp loop, we use CSS hex switching
    return addedVolume < 60 ? "#fef08a" : "#f59e0b"; 
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Acid Vat Tolerance</h2>
          <p className="text-stone-400 text-sm max-w-xl mb-4">
            Double Inequalities: Keep the mixture between 15% and 18% concentration[cite: 24].
          </p>
        </div>

        {/* MATH HUD */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl min-w-[300px] pointer-events-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Valve: 30% Acid (x)</span>
              <span className="text-white font-mono font-bold">{addedVolume} L</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="500" 
              step="5" 
              value={addedVolume} 
              onChange={(e) => setAddedVolume(parseFloat(e.target.value))}
              className="w-full h-2 mt-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm border-t border-stone-800 pt-3">
            <div className="flex justify-between items-center text-stone-300">
              <span>Total Volume:</span>
              <span className="font-bold text-white">{totalVolume} L</span>
            </div>
            <div className="flex justify-between items-center text-stone-300">
              <span>Current Conc:</span>
              <span className={`font-bold ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                {currentConcPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className={`bg-stone-900/95 border p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center transition-colors duration-500 shadow-2xl ${
          isValid ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'border-stone-700'
        }`}>
          <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${isValid ? 'text-emerald-400' : 'text-stone-400'}`}>
            Algebraic Safe Zone
          </p>
          
          {/* Displaying the abstract inequality tethered to the visual[cite: 24] */}
          <div className="text-stone-300 font-mono text-sm sm:text-base leading-relaxed bg-stone-950 p-3 rounded-lg border border-stone-800 mb-3 overflow-x-auto">
            <span className="text-blue-400">15%</span> &lt; Mixture &lt; <span className="text-purple-400">18%</span><br/>
            0.15(x + 600) &lt; <span className="text-amber-400">0.30x + 0.12(600)</span> &lt; 0.18(x + 600)
          </div>
          
          <p className="text-white text-sm">
            {isBelow && `Diluted. Add more 30% solution to hit the 15% floor (x > 120).`}
            {isValid && `Perfect mixture! The abstract overlap is now a physical safe zone (120 < x < 300)[cite: 24].`}
            {isAbove && `Too concentrated! The mixture exceeded the 18% ceiling (x < 300)[cite: 24].`}
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minDistance={5} 
              maxDistance={20}
              target={[0, 0, 0]}
            />

            <group>
              {/* THE GLASS VAT */}
              <mesh position={[0, 0, 0]}>
                {/* 1200L Vat = Height 6 */}
                <cylinderGeometry args={[2.2, 2.2, 6, 32]} />
                <meshPhysicalMaterial 
                  color="#ffffff" 
                  transmission={0.9} 
                  opacity={1} 
                  metalness={0.1} 
                  roughness={0.1} 
                  ior={1.2} 
                  thickness={0.5} 
                  transparent 
                />
              </mesh>
              {/* Vat Bottom */}
              <mesh position={[0, vatBaseY, 0]}>
                <cylinderGeometry args={[2.2, 2.2, 0.1, 32]} />
                <meshStandardMaterial color="#333333" />
              </mesh>

              {/* THE ACID FLUID */}
              <mesh position={[0, fluidCenterY, 0]}>
                <cylinderGeometry args={[2.15, 2.15, fluidHeight, 32]} />
                <meshPhysicalMaterial 
                  color={getFluidColor()}
                  transmission={0.8}
                  transparent
                  opacity={0.9}
                  roughness={0.2}
                />
              </mesh>

              {/* LOWER LASER BOUNDARY (15% Floor)[cite: 24] */}
              <group position={[0, lowerLaserY, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[2.2, 0.05, 16, 64]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
                </mesh>
                <Text position={[3.5, 0, 0]} fontSize={0.3} color="#60a5fa" anchorX="left" anchorY="middle">
                  15% (x = 120L)
                </Text>
              </group>

              {/* UPPER LASER BOUNDARY (18% Ceiling)[cite: 24] */}
              <group position={[0, upperLaserY, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[2.2, 0.05, 16, 64]} />
                  <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={1} />
                </mesh>
                <Text position={[3.5, 0, 0]} fontSize={0.3} color="#c084fc" anchorX="left" anchorY="middle">
                  18% (x = 300L)
                </Text>
              </group>

              {/* DYNAMIC FLUID LEVEL LABEL */}
              <Text position={[-3.5, fluidCenterY + (fluidHeight / 2), 0]} fontSize={0.4} color={getFluidColor()} anchorX="right" anchorY="middle">
                {currentConcPct.toFixed(1)}%
              </Text>
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.5} far={10} position={[0, -3.1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}