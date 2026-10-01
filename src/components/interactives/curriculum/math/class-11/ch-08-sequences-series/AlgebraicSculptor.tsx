'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

// ==================================================================
// 3D PILLAR COMPONENT
// ==================================================================
function Pillar({ 
  index, 
  step, 
  filterX, 
  xPos 
}: { 
  index: number; 
  step: number; 
  filterX: number; 
  xPos: number;
}) {
  const mainGroupRef = useRef<THREE.Group>(null);
  const redBlockRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);

  // Determine current algebraic values[cite: 21]
  const val7 = '7'.repeat(index);
  const val1 = '1'.repeat(index);
  const val9 = '9'.repeat(index);
  const val10 = '1' + '0'.repeat(index);

  let displayVal = val7;
  let isNine = false;
  const isSnapped = step === 3;

  if (step >= 1) displayVal = val1;
  if (step >= 2 || (step === 1 && filterX > xPos)) {
    displayVal = val9;
    isNine = true;
  }
  if (isSnapped) displayVal = val10;

  // Base physical dimensions
  const baseHeight = index * 1.5;

  useFrame((_, delta) => {
    if (!mainGroupRef.current || !redBlockRef.current || !textRef.current) return;

    // Scale main pillar based on state (shrinks at 1, stretches at 9, snaps at 10)[cite: 21]
    let targetHeight = baseHeight;
    if (step >= 1 && !isNine) targetHeight = baseHeight * 0.4;
    if (isNine && !isSnapped) targetHeight = baseHeight * 1.2;
    if (isSnapped) targetHeight = baseHeight * 1.3;

    mainGroupRef.current.scale.y = THREE.MathUtils.lerp(mainGroupRef.current.scale.y, targetHeight, delta * 6);
    mainGroupRef.current.position.y = mainGroupRef.current.scale.y / 2;
    textRef.current.position.y = mainGroupRef.current.scale.y + 0.5;

    // Animate the red "-1" block dropping out during the G.P. Snap[cite: 21]
    const targetRedY = isSnapped ? -0.8 : 0;
    const targetRedScale = isSnapped ? 1 : 0;
    
    redBlockRef.current.position.y = THREE.MathUtils.lerp(redBlockRef.current.position.y, targetRedY, delta * 5);
    redBlockRef.current.scale.lerp(new THREE.Vector3(targetRedScale, targetRedScale, targetRedScale), delta * 8);
  });

  return (
    <group position={[xPos, 0, 0]}>
      {/* MAIN PILLAR */}
      <group ref={mainGroupRef}>
        <mesh>
          <boxGeometry args={[1.5, 1, 1.5]} />
          <meshStandardMaterial 
            color={isSnapped ? "#10b981" : isNine ? "#8b5cf6" : step >= 1 ? "#94a3b8" : "#3b82f6"} 
            roughness={0.2} 
            metalness={0.4} 
          />
        </mesh>
      </group>

      {/* DROPPING RED BLOCK (-1)[cite: 21] */}
      <group ref={redBlockRef} position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 0.6, 1.4]} />
          <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.8} />
        </mesh>
        <Billboard position={[0, 0, 0.8]}>
          <Text fontSize={0.4} color="#ffffff" fontWeight="bold">-1</Text>
        </Billboard>
      </group>

      {/* DYNAMIC TEXT LABEL */}
      <group ref={textRef}>
        <Billboard>
          <Text fontSize={0.6} color="#ffffff" fontWeight="bold">
            {displayVal}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AlgebraicSculptor() {
  const [step, setStep] = useState<number>(0);
  const [filterX, setFilterX] = useState<number>(-8);

  const isFactored = step >= 1;
  const isMultiplied = filterX > 6;
  const isSnapped = step === 3;
  const isAhaMoment = isSnapped;

  const handleFactor = () => setStep(1);
  const handleSnap = () => setStep(3);
  const handleReset = () => {
    setStep(0);
    setFilterX(-8);
  };

  // Determine global multiplier prefix[cite: 21]
  let multiplierText = "";
  if (step === 1 && !isMultiplied) multiplierText = "7 ×";
  if (isMultiplied || step >= 2 || (step === 1 && filterX > -3)) multiplierText = "7/9 ×";

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Algebraic Sculptor</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visually transforming the <span className="font-mono text-blue-400">7 + 77 + 777</span> series into a G.P[cite: 21].
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Operation Tools</span>
            <button 
              onClick={handleReset}
              className="text-stone-500 hover:text-stone-300 font-mono text-xs underline transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm">
            {!isFactored ? (
              <button 
                onClick={handleFactor}
                className="w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                FACTOR OUT 7
              </button>
            ) : (
              <>
                <div className={`mb-2 transition-opacity ${isSnapped ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex justify-between items-center mb-1 text-xs text-stone-400">
                    <span>Drag Filter (× 9/9)</span>
                    <span>{filterX > 6 ? 'Complete' : 'Scanning...'}</span>
                  </div>
                  <input 
                    type="range" 
                    min="-8" 
                    max="8" 
                    step="0.1" 
                    value={filterX} 
                    onChange={(e) => {
                      setFilterX(parseFloat(e.target.value));
                      if (parseFloat(e.target.value) > 6 && step === 1) setStep(2);
                    }}
                    className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                
                {isMultiplied && !isSnapped && (
                  <button 
                    onClick={handleSnap}
                    className="w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-in fade-in duration-300"
                  >
                    G.P. SNAP
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
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Organization</p>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
              The chaotic 777 series is now visibly organized into a perfect geometric progression of 10s, minus exactly $n$ red blocks[cite: 21]. The final formula is completely demystified as the exact physical instructions needed to reshape the blocks[cite: 21].
            </p>
            <div className="inline-block bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-base font-bold text-white">
              {String.raw`$S_n = \frac{7}{9} \left[ \frac{10(10^n - 1)}{9} - n \right]$`}
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 14], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={5} 
              maxDistance={25}
              target={[0, 2, 0]}
            />

            {/* GLOBAL MULTIPLIER LABEL[cite: 21] */}
            {multiplierText && (
              <Billboard position={[-7, 2, 0]}>
                <Text fontSize={1.2} color="#fcd34d" fontWeight="bold">
                  {multiplierText}
                </Text>
              </Billboard>
            )}

            {/* THE THREE PILLARS (Terms 1, 2, 3)[cite: 21] */}
            <Pillar index={1} step={step} filterX={filterX} xPos={-3} />
            <Billboard position={[-0.5, 2, 0]}>
              <Text fontSize={1} color="#ffffff">+</Text>
            </Billboard>
            
            <Pillar index={2} step={step} filterX={filterX} xPos={2} />
            <Billboard position={[4.5, 2, 0]}>
              <Text fontSize={1} color="#ffffff">+</Text>
            </Billboard>
            
            <Pillar index={3} step={step} filterX={filterX} xPos={7} />

            {/* THE PHYSICAL MULTIPLY BY 9/9 FILTER[cite: 21] */}
            {isFactored && !isSnapped && (
              <group position={[filterX, 3, 0]}>
                <mesh>
                  <boxGeometry args={[0.1, 8, 4]} />
                  <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={2} transparent opacity={0.6} />
                </mesh>
                <Billboard position={[0, 4.5, 0]}>
                  <Text fontSize={0.5} color="#d8b4fe" fontWeight="bold">
                    × 9/9
                  </Text>
                </Billboard>
              </group>
            )}

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.4} far={10} position={[0, -1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}