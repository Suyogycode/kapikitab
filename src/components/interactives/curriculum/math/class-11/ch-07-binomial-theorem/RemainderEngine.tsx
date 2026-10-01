'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

// ==================================================================
// 3D TERM BLOCK ENGINE
// ==================================================================
function TermBlock({
  position,
  label,
  valueLabel,
  power,
  filterX,
  isSubtracted
}: {
  position: [number, number, number];
  label: string;
  valueLabel: string;
  power: number;
  filterX: number;
  isSubtracted: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // A term is vaporized if the filter has passed its X position AND its power >= 2
  const isVaporized = filterX > position[0] && power >= 2;
  
  // The nC1(5) term gets subtracted at the very end
  const isAnnihilated = isSubtracted && power === 1;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Scale down to 0 if vaporized or annihilated
    const targetScale = (isVaporized || isAnnihilated) ? 0 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    
    // Add a slight floating effect if still alive
    if (targetScale > 0.5) {
      groupRef.current.position.y = position[1] + Math.sin(Date.now() / 500 + position[0]) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <boxGeometry args={[1.8, 1.2, 0.5]} />
        <meshStandardMaterial 
          color={power >= 2 ? "#ef4444" : "#3b82f6"} 
          emissive={power >= 2 ? "#b91c1c" : "#1d4ed8"} 
          emissiveIntensity={0.5} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      <Billboard position={[0, 0, 0.26]}>
        <Text fontSize={0.35} color="#ffffff" fontWeight="bold">
          {label}
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.25} color="#cbd5e1">
          {valueLabel}
        </Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// 3D SUBTRACTION ANIMATION
// ==================================================================
function SubtractionLabel() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Lerp from top down to final position to replicate the slide-in effect
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 6);
    }
  });

  return (
    <group ref={groupRef} position={[-2, 2, 0]}>
      <Text position={[0, 1.5, 0]} fontSize={0.6} color="#ef4444" fontWeight="bold">
        - 5n
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function RemainderEngine() {
  const [step, setStep] = useState<number>(0);
  const [filterX, setFilterX] = useState<number>(-8);
  
  const isExpanded = step >= 1;
  const isFiltered = filterX > 6;
  const isSubtracted = step >= 2;
  const isAhaMoment = isSubtracted;

  const handleSplit = () => setStep(1);
  const handleSubtract = () => setStep(2);
  const handleReset = () => {
    setStep(0);
    setFilterX(-8);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Remainder Engine</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Prove that <span className="font-mono text-blue-400">6ⁿ - 5n</span> always leaves a remainder of 1 when divided by 25.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Division Machine</span>
            <button 
              onClick={handleReset}
              className="text-stone-500 hover:text-stone-300 font-mono text-xs underline transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm">
            {!isExpanded ? (
              <button 
                onClick={handleSplit}
                className="w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                SPLIT BASE: (1 + 5)ⁿ
              </button>
            ) : (
              <>
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1 text-xs text-stone-400">
                    <span>Drag Filter (÷ 25)</span>
                    <span>{filterX > 6 ? 'Complete' : 'Scanning...'}</span>
                  </div>
                  <input 
                    type="range" 
                    min="-8" 
                    max="8" 
                    step="0.1" 
                    value={filterX} 
                    onChange={(e) => setFilterX(parseFloat(e.target.value))}
                    disabled={isSubtracted}
                    className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
                
                {isFiltered && !isSubtracted && (
                  <button 
                    onClick={handleSubtract}
                    className="w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-in fade-in duration-300"
                  >
                    SUBTRACT 5n
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Remainder Isolated</p>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
              The filter instantly vaporizes every term that contains a power of 5² or higher, since they are perfectly divisible by 25. 
              The only terms that physically survive are nC₀(1) and nC₁(5).
            </p>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
              The engine then subtracts the 5n term requested by the problem.
            </p>
            <div className="inline-block bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-base font-bold">
              <span className="text-stone-400 line-through mr-2">Complex Algebraic Expansion</span> ➔ <span className="text-emerald-400">Solitary 1</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 11], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={5} 
              maxDistance={25}
              target={[0, 0, 0]}
            />

            {/* INITIAL STATE (Before Expansion) */}
            {!isExpanded && (
              <group position={[0, 0, 0]}>
                <Text fontSize={1.5} color="#ffffff" fontWeight="bold">
                  6ⁿ - 5n
                </Text>
              </group>
            )}

            {/* EXPANDED STATE */}
            {isExpanded && (
              <group>
                {/* The Base Equation Tracker */}
                <Text position={[-3, 2.5, 0]} fontSize={0.5} color="#94a3b8" anchorX="left">
                  (1 + 5)ⁿ - 5n =
                </Text>

                {/* THE 5 REPRESENTATIVE TERMS */}
                <TermBlock position={[-5, 0, 0]} label="nC₀ (1)(5⁰)" valueLabel="= 1" power={0} filterX={filterX} isSubtracted={isSubtracted} />
                <Text position={[-3.5, 0, 0]} fontSize={0.6} color="#ffffff">+</Text>
                
                <TermBlock position={[-2, 0, 0]} label="nC₁ (1)(5¹)" valueLabel="= 5n" power={1} filterX={filterX} isSubtracted={isSubtracted} />
                <Text position={[-0.5, 0, 0]} fontSize={0.6} color="#ffffff">+</Text>
                
                <TermBlock position={[1.5, 0, 0]} label="nC₂ (1)(5²)" valueLabel="= 25(...)" power={2} filterX={filterX} isSubtracted={isSubtracted} />
                <Text position={[3.2, 0, 0]} fontSize={0.6} color="#ffffff">+</Text>
                
                <TermBlock position={[5, 0, 0]} label="..." valueLabel="Multiple of 25" power={3} filterX={filterX} isSubtracted={isSubtracted} />

                {/* THE PHYSICAL DIVIDE BY 25 FILTER */}
                <group position={[filterX, 0, 0]}>
                  {/* Glowing Laser Scanner */}
                  <mesh>
                    <boxGeometry args={[0.1, 4, 2]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} transparent opacity={0.8} />
                  </mesh>
                  {/* Scanner Glass Pane */}
                  <mesh position={[-1, 0, 0]}>
                    <planeGeometry args={[2, 4]} />
                    <meshBasicMaterial color="#ef4444" transparent opacity={0.1} side={THREE.DoubleSide} />
                  </mesh>
                  <Billboard position={[0, 2.5, 0]}>
                    <Text fontSize={0.3} color="#f87171" fontWeight="bold">
                      FILTER: ÷ 25 (5²)
                    </Text>
                  </Billboard>
                </group>

                {/* SUBTRACTION ANIMATION */}
                {isSubtracted && <SubtractionLabel />}
              </group>
            )}

            <ContactShadows frames={1} resolution={512} scale={30} blur={2} opacity={0.4} far={10} position={[0, -3, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}