'use client';

import React, { useState, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Line, ContactShadows } from '@react-three/drei';

// ==================================================================
// MATH LOGIC & TREE GENERATOR
// ==================================================================
// 2 Bags, 3 Tiffins per Bag, 2 Bottles per Tiffin[cite: 26]
const BAGS = 2;
const TIFFINS = 3;
const BOTTLES = 2;

function generateTree() {
  const nodes = { bags: [] as any[], tiffins: [] as any[], bottles: [] as any[] };
  
  // To keep the tree perfectly balanced, we calculate Y positions based on the 12 terminal endpoints.
  // 12 endpoints spaced by 1 unit on the Y-axis: 5.5 down to -5.5
  let bottleIndex = 0;
  
  for (let b = 0; b < BAGS; b++) {
    const bagId = `B${b + 1}`;
    const bagY = b === 0 ? 3 : -3; // Center of its children
    nodes.bags.push({ id: bagId, label: bagId, pos: new THREE.Vector3(-4, bagY, 0), bagIdx: b });

    for (let t = 0; t < TIFFINS; t++) {
      const tiffinId = `${bagId}-T${t + 1}`;
      const tiffinY = b === 0 ? 5 - (t * 2) : -1 - (t * 2); 
      nodes.tiffins.push({ id: tiffinId, parent: bagId, label: `T${t + 1}`, pos: new THREE.Vector3(0, tiffinY, 0), bagIdx: b, tiffinIdx: t });

      for (let w = 0; w < BOTTLES; w++) {
        const bottleId = `${tiffinId}-W${w + 1}`;
        const bottleY = 5.5 - bottleIndex;
        nodes.bottles.push({ id: bottleId, parent: tiffinId, label: `W${w + 1}`, pos: new THREE.Vector3(4, bottleY, 0), bagIdx: b, tiffinIdx: t });
        bottleIndex++;
      }
    }
  }
  return nodes;
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function PossibilityTree() {
  const [activeBag, setActiveBag] = useState<number | null>(null);
  const [activeTiffin, setActiveTiffin] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  const tree = useMemo(() => generateTree(), []);

  // Handlers for node clicks
  const handleBagClick = (bagIdx: number) => {
    setShowAll(false);
    setActiveBag(bagIdx);
    setActiveTiffin(null); // Reset tiffin when changing bags
  };

  const handleTiffinClick = (tiffinId: string, bagIdx: number) => {
    setShowAll(false);
    setActiveBag(bagIdx);
    setActiveTiffin(tiffinId);
  };

  const resetTree = () => {
    setActiveBag(null);
    setActiveTiffin(null);
    setShowAll(false);
  };

  const triggerAhaMoment = () => {
    setShowAll(true);
    setActiveBag(null);
    setActiveTiffin(null);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Possibility Tree</h2>
          <p className="text-stone-400 text-sm max-w-xl mb-4">
            Fundamental Principle of Counting: 2 Bags, 3 Tiffins, 2 Bottles[cite: 26].
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl min-w-[280px] pointer-events-auto">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Logic Flow</span>
            <button 
              onClick={resetTree}
              className="text-stone-500 hover:text-stone-300 font-mono text-xs underline transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm">
            <button 
              onClick={triggerAhaMoment}
              className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest ${showAll ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-800 text-emerald-400 border-stone-700 hover:bg-stone-700'}`}
            >
              SHOW ALL PATHS
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {showAll && (
        <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Expansion</p>
            <p className="text-stone-200 text-sm leading-relaxed mb-3">
              The tree visually proves why multiplication is required rather than addition[cite: 26]. The 2 initial branches explicitly split into 3 sub-branches, which split again into 2 sub-branches, creating exactly 12 terminal endpoints[cite: 26].
            </p>
            <div className="inline-block bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-lg font-bold">
              <span className="text-blue-400">2</span> × <span className="text-green-400">3</span> × <span className="text-purple-400">2</span> = <span className="text-emerald-400">12</span> Total Combinations[cite: 26]
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 14], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.2} 
              minDistance={5} 
              maxDistance={25}
              target={[0, 0, 0]}
            />

            <group>
              {/* ROOT NODE (Start) */}
              <mesh position={[-7, 0, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="#78716c" roughness={0.2} metalness={0.8} />
              </mesh>
              <Text position={[-7, 0.6, 0]} fontSize={0.3} color="#a8a29e">Start</Text>

              {/* DRAW BAGS */}
              {tree.bags.map((bag) => {
                const isActive = showAll || activeBag === bag.bagIdx;
                return (
                  <group key={bag.id}>
                    <Line 
                      points={[new THREE.Vector3(-7, 0, 0), bag.pos]} 
                      color={isActive ? "#60a5fa" : "#334155"} 
                      lineWidth={isActive ? 3 : 1} 
                    />
                    <mesh 
                      position={bag.pos} 
                      onClick={() => handleBagClick(bag.bagIdx)}
                      onPointerOver={() => document.body.style.cursor = 'pointer'}
                      onPointerOut={() => document.body.style.cursor = 'auto'}
                    >
                      <sphereGeometry args={[0.4, 32, 32]} />
                      <meshStandardMaterial color={isActive ? "#3b82f6" : "#475569"} emissive={isActive ? "#1d4ed8" : "#000000"} />
                    </mesh>
                    <Text position={[bag.pos.x, bag.pos.y + 0.7, bag.pos.z]} fontSize={0.3} color={isActive ? "#93c5fd" : "#64748b"}>
                      {bag.label}
                    </Text>
                  </group>
                );
              })}

              {/* DRAW TIFFINS */}
              {tree.tiffins.map((tiffin) => {
                const isParentActive = showAll || activeBag === tiffin.bagIdx;
                const isActive = showAll || activeTiffin === tiffin.id;
                const parentPos = tree.bags.find(b => b.id === tiffin.parent)!.pos;
                
                return (
                  <group key={tiffin.id}>
                    <Line 
                      points={[parentPos, tiffin.pos]} 
                      color={isParentActive ? "#4ade80" : "#334155"} 
                      lineWidth={isParentActive ? 2 : 1} 
                    />
                    <mesh 
                      position={tiffin.pos} 
                      onClick={() => handleTiffinClick(tiffin.id, tiffin.bagIdx)}
                      onPointerOver={() => document.body.style.cursor = 'pointer'}
                      onPointerOut={() => document.body.style.cursor = 'auto'}
                    >
                      <boxGeometry args={[0.5, 0.5, 0.5]} />
                      <meshStandardMaterial color={isActive ? "#22c55e" : "#475569"} emissive={isActive ? "#15803d" : "#000000"} />
                    </mesh>
                    <Text position={[tiffin.pos.x, tiffin.pos.y + 0.6, tiffin.pos.z]} fontSize={0.25} color={isActive ? "#86efac" : "#64748b"}>
                      {tiffin.label}
                    </Text>
                  </group>
                );
              })}

              {/* DRAW BOTTLES (Terminal Nodes) */}
              {tree.bottles.map((bottle) => {
                const isParentActive = showAll || activeTiffin === bottle.parent;
                const parentPos = tree.tiffins.find(t => t.id === bottle.parent)!.pos;
                
                return (
                  <group key={bottle.id}>
                    <Line 
                      points={[parentPos, bottle.pos]} 
                      color={isParentActive ? "#c084fc" : "#334155"} 
                      lineWidth={isParentActive ? 2 : 1} 
                    />
                    <mesh position={bottle.pos}>
                      <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
                      <meshStandardMaterial color={isParentActive ? "#a855f7" : "#475569"} emissive={isParentActive ? "#7e22ce" : "#000000"} />
                    </mesh>
                    <Text position={[bottle.pos.x + 0.6, bottle.pos.y, bottle.pos.z]} fontSize={0.25} color={isParentActive ? "#d8b4fe" : "#64748b"}>
                      {bottle.label}
                    </Text>
                  </group>
                );
              })}
            </group>

            <ContactShadows frames={1} resolution={512} scale={30} blur={2} opacity={0.3} far={10} position={[0, -7, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}