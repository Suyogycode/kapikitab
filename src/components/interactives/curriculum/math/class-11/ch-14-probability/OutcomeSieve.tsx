'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// DATA SETS & EVENT RULES
// ==================================================================
type Outcome = { id: string; pos: [number, number, number]; heads: number };

// 3D coordinates representing the 8 vertices of a cube
const OUTCOMES: Outcome[] = [
  { id: 'HHH', pos: [3, 3, 3], heads: 3 },
  { id: 'HHT', pos: [3, 3, -3], heads: 2 },
  { id: 'HTH', pos: [3, -3, 3], heads: 2 },
  { id: 'THH', pos: [-3, 3, 3], heads: 2 },
  { id: 'HTT', pos: [3, -3, -3], heads: 1 },
  { id: 'THT', pos: [-3, 3, -3], heads: 1 },
  { id: 'TTH', pos: [-3, -3, 3], heads: 1 },
  { id: 'TTT', pos: [-3, -3, -3], heads: 0 },
];

type RuleType = 'all' | 'atLeastTwo' | 'exactlyOne' | 'noHeads';

const evaluateRule = (rule: RuleType, heads: number) => {
  if (rule === 'all') return true;
  if (rule === 'atLeastTwo') return heads >= 2;
  if (rule === 'exactlyOne') return heads === 1;
  if (rule === 'noHeads') return heads === 0;
  return false;
};

// ==================================================================
// 3D ENGINE COMPONENTS
// ==================================================================

// Individual Outcome Node
function OutcomeNode({ outcome, isActive }: { outcome: Outcome; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetScale = isActive ? 1.2 : 0.5;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    }
  });

  return (
    <group position={new THREE.Vector3(...outcome.pos)}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
          color={isActive ? "#10b981" : "#475569"} 
          emissive={isActive ? "#059669" : "#1e293b"} 
          emissiveIntensity={isActive ? 1 : 0.2} 
        />
      </mesh>
      <Billboard position={[0, 1.2, 0]}>
        <Text fontSize={0.6} color={isActive ? "#ffffff" : "#94a3b8"} fontWeight="bold">
          {outcome.id}
        </Text>
      </Billboard>
    </group>
  );
}

// The Dynamic Net that shrinks to bound the subset[cite: 21]
function DynamicSieveNet({ activeOutcomes, rule }: { activeOutcomes: Outcome[], rule: RuleType }) {
  const netRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  // Calculate the physical bounding box of the active subset[cite: 21]
  const targetPos = useMemo(() => {
    if (activeOutcomes.length === 0) return new THREE.Vector3(0, 0, 0);
    const minX = Math.min(...activeOutcomes.map(o => o.pos[0]));
    const maxX = Math.max(...activeOutcomes.map(o => o.pos[0]));
    const minY = Math.min(...activeOutcomes.map(o => o.pos[1]));
    const maxY = Math.max(...activeOutcomes.map(o => o.pos[1]));
    const minZ = Math.min(...activeOutcomes.map(o => o.pos[2]));
    const maxZ = Math.max(...activeOutcomes.map(o => o.pos[2]));
    return new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
  }, [activeOutcomes]);

  const targetScale = useMemo(() => {
    if (activeOutcomes.length === 0) return new THREE.Vector3(0.01, 0.01, 0.01);
    const minX = Math.min(...activeOutcomes.map(o => o.pos[0]));
    const maxX = Math.max(...activeOutcomes.map(o => o.pos[0]));
    const minY = Math.min(...activeOutcomes.map(o => o.pos[1]));
    const maxY = Math.max(...activeOutcomes.map(o => o.pos[1]));
    const minZ = Math.min(...activeOutcomes.map(o => o.pos[2]));
    const maxZ = Math.max(...activeOutcomes.map(o => o.pos[2]));
    // Add padding to encapsulate the spheres
    return new THREE.Vector3(
      Math.max(2.5, maxX - minX + 2.5), 
      Math.max(2.5, maxY - minY + 2.5), 
      Math.max(2.5, maxZ - minZ + 2.5)
    );
  }, [activeOutcomes]);

  useFrame((_, delta) => {
    if (netRef.current && wireframeRef.current) {
      const isUniversal = rule === 'all';
      
      // Expand to cover the entire space, or shrink to the specific subset[cite: 21]
      const finalPos = isUniversal ? new THREE.Vector3(0, 0, 0) : targetPos;
      const finalScale = isUniversal ? new THREE.Vector3(9.5, 9.5, 9.5) : targetScale;

      netRef.current.position.lerp(finalPos, delta * 4);
      netRef.current.scale.lerp(finalScale, delta * 4);
      wireframeRef.current.position.lerp(finalPos, delta * 4);
      wireframeRef.current.scale.lerp(finalScale, delta * 4);
    }
  });

  return (
    <group>
      {/* Translucent Glowing Core */}
      <mesh ref={netRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#10b981" transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Wireframe Netting[cite: 21] */}
      <mesh ref={wireframeRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function OutcomeSieve() {
  const [activeRule, setActiveRule] = useState<RuleType>('all');

  const activeOutcomes = OUTCOMES.filter(o => evaluateRule(activeRule, o.heads));
  const isAhaMoment = activeRule !== 'all';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Outcome Sieve</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            An event $E$ is mathematically defined as a physical subset of a sample space $S$[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Compound Event Rules</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">n(E) = {activeOutcomes.length}</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <button 
              onClick={() => setActiveRule('all')}
              className={`p-3 text-left rounded-lg transition-all border ${activeRule === 'all' ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-500 hover:border-stone-600'}`}
            >
              Universal Set: All Outcomes (S)
            </button>
            <button 
              onClick={() => setActiveRule('atLeastTwo')}
              className={`p-3 text-left rounded-lg transition-all border ${activeRule === 'atLeastTwo' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-stone-800 text-stone-500 hover:border-stone-600'}`}
            >
              Event A: "At least two heads appear"[cite: 21]
            </button>
            <button 
              onClick={() => setActiveRule('exactlyOne')}
              className={`p-3 text-left rounded-lg transition-all border ${activeRule === 'exactlyOne' ? 'border-amber-500/50 text-amber-400 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-stone-800 text-stone-500 hover:border-stone-600'}`}
            >
              Event B: "Exactly one head appears"
            </button>
            <button 
              onClick={() => setActiveRule('noHeads')}
              className={`p-3 text-left rounded-lg transition-all border ${activeRule === 'noHeads' ? 'border-red-500/50 text-red-400 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-stone-800 text-stone-500 hover:border-stone-600'}`}
            >
              Event C: "No heads appear"[cite: 21]
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Tactile Filtering</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            {activeRule === 'atLeastTwo' && "The engine drops a physical, glowing net through the sphere, capturing only HHT, HTH, THH, and HHH[cite: 21]."}
            {activeRule === 'exactlyOne' && "The net isolates HTT, THT, and TTH, leaving the extreme outcomes outside its bounds."}
            {activeRule === 'noHeads' && "The net shrinks to isolate only TTT, the singular point where zero heads appear[cite: 21]."}
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-white">
            This proves that events are simply physical subsets carved out of a larger sample space ($E \subseteq S$)[cite: 21].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [10, 8, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <group>
              {/* Universal Sample Space Sphere Boundary */}
              <mesh>
                <sphereGeometry args={[7, 32, 32]} />
                <meshBasicMaterial color="#334155" wireframe transparent opacity={0.1} />
              </mesh>

              {/* INDIVIDUAL OUTCOMES */}
              {OUTCOMES.map((outcome) => (
                <OutcomeNode 
                  key={outcome.id} 
                  outcome={outcome} 
                  isActive={evaluateRule(activeRule, outcome.heads)} 
                />
              ))}

              {/* THE DYNAMIC GLOWING NET[cite: 21] */}
              <DynamicSieveNet activeOutcomes={activeOutcomes} rule={activeRule} />

            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -6, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}