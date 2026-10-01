'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// EVENT LOGIC & DATA
// ==================================================================
const SAMPLE_SPACE = [1, 2, 3, 4, 5, 6];

type EventBRule = 'lessThan4' | 'even';

function getMembership(num: number, ruleB: EventBRule) {
  const inA = num % 2 !== 0; // Event A: "Odd number appears"[cite: 22]
  let inB = false;
  
  if (ruleB === 'lessThan4') {
    inB = num < 4; // "Number less than 4 appears"[cite: 22]
  } else {
    inB = num % 2 === 0; // "Even number"[cite: 22]
  }

  if (inA && inB) return 'AB';
  if (inA) return 'A';
  if (inB) return 'B';
  return 'NONE';
}

// ==================================================================
// 3D MAGNETIC DIE COMPONENT
// ==================================================================
function MagneticDie({ 
  num, 
  membership, 
  index 
}: { 
  num: number; 
  membership: 'A' | 'B' | 'AB' | 'NONE';
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate target positions based on magnetic zones[cite: 22]
  const targetPos = useMemo(() => {
    const spacing = 1.8;
    const offset = (spacing * 2) / 2; // Rough centering for up to 3 items
    
    if (membership === 'A') return new THREE.Vector3(-6, 0.5, (index * spacing) - offset);
    if (membership === 'B') return new THREE.Vector3(6, 0.5, (index * spacing) - offset);
    if (membership === 'AB') return new THREE.Vector3(0, 1.5, (index * spacing) - offset); // Raised slightly for the crash
    return new THREE.Vector3(0, 0.5, -6); // Neutral / Unclaimed zone
  }, [membership, index]);

  const isColliding = membership === 'AB';

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Magnetic pull interpolation
    groupRef.current.position.lerp(targetPos, delta * 6);
    
    // Violent wobble if caught in the collision zone[cite: 22]
    if (isColliding) {
      groupRef.current.rotation.x += delta * 5;
      groupRef.current.rotation.y += delta * 3;
    } else {
      // Smoothly settle back to upright
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 5);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 5);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 5);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial 
          color={isColliding ? "#f59e0b" : "#e2e8f0"} 
          emissive={isColliding ? "#d97706" : "#000000"} 
          emissiveIntensity={isColliding ? 0.8 : 0} 
          roughness={0.2} 
        />
      </mesh>
      {/* 3D Number Label */}
      {!isColliding && (
        <Billboard position={[0, 0, 0.61]}>
          <Text fontSize={0.8} color="#0f172a" fontWeight="bold">{num}</Text>
        </Billboard>
      )}
      {/* If colliding, render text on multiple faces to see it tumbling */}
      {isColliding && (
        <>
          <Billboard position={[0, 0, 0.61]}><Text fontSize={0.8} color="#ffffff" fontWeight="bold">{num}</Text></Billboard>
          <Billboard position={[0, 0, -0.61]} rotation={[0, Math.PI, 0]}><Text fontSize={0.8} color="#ffffff" fontWeight="bold">{num}</Text></Billboard>
          <Billboard position={[0, 0.61, 0]} rotation={[-Math.PI/2, 0, 0]}><Text fontSize={0.8} color="#ffffff" fontWeight="bold">{num}</Text></Billboard>
        </>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function CollisionGrid() {
  const [ruleB, setRuleB] = useState<EventBRule>('lessThan4');

  // Math Set Calculations for the HUD
  const setA = SAMPLE_SPACE.filter(n => getMembership(n, ruleB).includes('A'));
  const setB = SAMPLE_SPACE.filter(n => getMembership(n, ruleB).includes('B'));
  const intersection = SAMPLE_SPACE.filter(n => getMembership(n, ruleB) === 'AB');
  const union = [...new Set([...setA, ...setB])].sort();
  
  const isMutuallyExclusive = intersection.length === 0;
  const isExhaustive = union.length === SAMPLE_SPACE.length;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Collision Grid</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Two events are mutually exclusive if they cannot occur simultaneously ($A \cap B = \phi$)[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Event Controls</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <div className="p-3 rounded-lg border border-blue-500/50 bg-blue-950/30">
              <div className="text-blue-400 font-bold mb-1">Event A (Fixed)</div>
              <div className="text-stone-300">"Odd number appears"[cite: 22]</div>
              <div className="text-stone-500 mt-1 text-xs">A = {'{'}{setA.join(', ')}{'}'}</div>
            </div>
            
            <div className={`p-3 rounded-lg border transition-colors ${ruleB === 'lessThan4' ? 'border-amber-500/50 bg-amber-950/30' : 'border-emerald-500/50 bg-emerald-950/30'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={ruleB === 'lessThan4' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>Event B (Toggle)</span>
              </div>
              <button 
                onClick={() => setRuleB(ruleB === 'lessThan4' ? 'even' : 'lessThan4')}
                className="w-full py-2 bg-stone-950 hover:bg-stone-800 border border-stone-700 rounded text-stone-300 transition-colors my-2"
              >
                {ruleB === 'lessThan4' ? '"Number less than 4 appears"' : '"Even number appears"'}
              </button>
              <div className="text-stone-500 text-xs">B = {'{'}{setB.join(', ')}{'}'}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Intersection ($A \cap B$):</span>
              <span className={isMutuallyExclusive ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {isMutuallyExclusive ? 'ϕ (Empty)' : `{${intersection.join(', ')}}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Union ($A \cup B$):</span>
              <span className={isExhaustive ? "text-emerald-400 font-bold" : "text-stone-400 font-bold"}>
                {`{${union.join(', ')}}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className={`bg-stone-900/95 border p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-colors duration-500 ${isMutuallyExclusive ? 'border-emerald-500' : 'border-amber-500'}`}>
          <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${isMutuallyExclusive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isMutuallyExclusive ? 'Perfectly Disjoint System' : 'Magnetic Collision Detected'}
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            {!isMutuallyExclusive 
              ? "Faces 1 and 3 are violently pulled by both zones simultaneously, crashing in the middle to form a glowing intersection, visually proving the events are not mutually exclusive[cite: 22]."
              : "The dice seamlessly split into two disjoint sets covering all 6 faces, physically demonstrating a perfectly mutually exclusive and exhaustive system[cite: 22]."}
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-base font-bold text-white">
            {isMutuallyExclusive && isExhaustive ? "Mutually Exclusive AND Exhaustive" : "Not Mutually Exclusive"}
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 8, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <group>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[0, 0, 0]} position={[0, -0.1, 0]} />
              
              {/* MAGNETIC ZONE A */}
              <mesh position={[-6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[4, 64]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} depthWrite={false} />
              </mesh>
              <Line 
                points={(() => {
                  const pts: [number, number, number][] = [];
                  for(let i=0; i<=Math.PI*2; i+=0.1) pts.push([-6 + 4 * Math.cos(i), 0.02, 4 * Math.sin(i)]);
                  return pts;
                })()}
                color="#3b82f6" lineWidth={2} 
              />
              <Billboard position={[-6, 0.5, -4.5]}><Text fontSize={0.6} color="#60a5fa" fontWeight="bold">Event A Zone</Text></Billboard>

              {/* MAGNETIC ZONE B */}
              <mesh position={[6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[4, 64]} />
                <meshBasicMaterial color={ruleB === 'lessThan4' ? "#f59e0b" : "#10b981"} transparent opacity={0.1} depthWrite={false} />
              </mesh>
              <Line 
                points={(() => {
                  const pts: [number, number, number][] = [];
                  for(let i=0; i<=Math.PI*2; i+=0.1) pts.push([6 + 4 * Math.cos(i), 0.02, 4 * Math.sin(i)]);
                  return pts;
                })()}
                color={ruleB === 'lessThan4' ? "#f59e0b" : "#10b981"} lineWidth={2} 
              />
              <Billboard position={[6, 0.5, -4.5]}><Text fontSize={0.6} color={ruleB === 'lessThan4' ? "#fcd34d" : "#34d399"} fontWeight="bold">Event B Zone</Text></Billboard>

              {/* COLLISION ZONE (Middle) */}
              {!isMutuallyExclusive && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[3, 64]} />
                  <meshBasicMaterial color="#ef4444" transparent opacity={0.15} depthWrite={false} />
                </mesh>
              )}

              {/* NEUTRAL ZONE */}
              {!isExhaustive && (
                <Billboard position={[0, 0.5, -7]}>
                  <Text fontSize={0.5} color="#94a3b8" fontWeight="bold">Unclaimed Sample Space</Text>
                </Billboard>
              )}

              {/* THE 6 DICE */}
              {SAMPLE_SPACE.map((num, i) => {
                const membership = getMembership(num, ruleB);
                // Create an index just for spacing calculation per group
                const groupCount = SAMPLE_SPACE.filter(n => getMembership(n, ruleB) === membership).length;
                const localIndex = SAMPLE_SPACE.filter(n => getMembership(n, ruleB) === membership).indexOf(num);
                
                return (
                  <MagneticDie 
                    key={num} 
                    num={num} 
                    membership={membership} 
                    index={localIndex} 
                  />
                );
              })}

            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.4} far={15} position={[0, -0.5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}