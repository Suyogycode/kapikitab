'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard } from '@react-three/drei';

// ==================================================================
// NETWORK DATA SET & RELATIONS
// ==================================================================
// Z integers partitioned into modulo 3 equivalence classes.
const NODES = [
  { id: 0, init: [-4, 2, -2], cluster: [-6, 1.5, 0] },
  { id: 3, init: [-2, -3, 1], cluster: [-7.3, -0.75, 0] },
  { id: 6, init: [1, 4, -3], cluster: [-4.7, -0.75, 0] },
  
  { id: 1, init: [3, 1, 2], cluster: [0, 1.5, 0] },
  { id: 4, init: [5, -2, -1], cluster: [-1.3, -0.75, 0] },
  { id: 7, init: [-1, 0, 4], cluster: [1.3, -0.75, 0] },
  
  { id: 2, init: [2, 5, 1], cluster: [6, 1.5, 0] },
  { id: 5, init: [-3, -1, -4], cluster: [4.7, -0.75, 0] },
  { id: 8, init: [4, -4, 2], cluster: [7.3, -0.75, 0] },
];

const BASE_EDGES = [[0,3], [3,6], [1,4], [4,7], [2,5], [5,8]];
const SYM_EDGES = [[3,0], [6,3], [4,1], [7,4], [5,2], [8,5]];
const TRANS_EDGES = [[0,6], [1,7], [2,8]];
const SYM_TRANS_EDGES = [[6,0], [7,1], [8,2]];

// ==================================================================
// DYNAMIC 3D COMPONENTS
// ==================================================================

// Individual Floating Integer Node[cite: 24]
function NetworkNode({ 
  node, isEquivalence, positionsRef, isReflexive 
}: { 
  node: typeof NODES[0], isEquivalence: boolean, positionsRef: React.MutableRefObject<Record<number, THREE.Vector3>>, isReflexive: boolean 
}) {
  const meshRef = useRef<THREE.Group>(null);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Determine target location: Fractured Clusters vs Chaotic Web[cite: 24]
    const dest = (isEquivalence ? node.cluster : node.init) as [number, number, number];
    const [x, y, z] = dest;
    targetPos.set(x, y, z);
    
    meshRef.current.position.lerp(targetPos, delta * 4);
    
    // Update the central reference store so edges can follow the moving node
    positionsRef.current[node.id].copy(meshRef.current.position);
  });

  return (
    <group ref={meshRef} position={new THREE.Vector3(...node.init)}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={0.8} />
      </mesh>
      
      <Billboard position={[0, 0.8, 0]}>
        <Text fontSize={0.6} color="#ffffff" fontWeight="bold">{node.id}</Text>
      </Billboard>

      {/* Reflexive glowing loop back to itself ((a, a) ∈ R)[cite: 24] */}
      {isReflexive && (
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.05, 16, 32]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Dynamic Curved Laser Beam Edge[cite: 24]
function NetworkEdge({ 
  source, target, positionsRef, color 
}: { 
  source: number, target: number, positionsRef: React.MutableRefObject<Record<number, THREE.Vector3>>, color: string 
}) {
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const curveRef = useRef(new THREE.QuadraticBezierCurve3());

  useFrame(() => {
    const p1 = positionsRef.current[source];
    const p2 = positionsRef.current[target];
    if (!p1 || !p2 || !geoRef.current) return;

    // Calculate a dynamic midpoint to arc the laser, preventing A->B and B->A from perfectly overlapping
    const mid = p1.clone().lerp(p2, 0.5);
    const up = new THREE.Vector3(0, 1, 0);
    const dir = p2.clone().sub(p1).normalize();
    const cross = dir.clone().cross(up).normalize();

    // Push the curve outward based on direction
    mid.add(cross.multiplyScalar(1.2));
    mid.y += 0.5;

    curveRef.current.v0.copy(p1);
    curveRef.current.v1.copy(mid);
    curveRef.current.v2.copy(p2);

    geoRef.current.setFromPoints(curveRef.current.getPoints(20));
  });

  return (
    <line>
      <bufferGeometry ref={geoRef} />
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.7} />
    </line>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function EquivalenceNetwork() {
  const [isReflexive, setIsReflexive] = useState<boolean>(false);
  const [isSymmetric, setIsSymmetric] = useState<boolean>(false);
  const [isTransitive, setIsTransitive] = useState<boolean>(false);

  const isEquivalence = isReflexive && isSymmetric && isTransitive;

  // Shared ref store for node positions (initialized to starting points)
  const positionsRef = useRef<Record<number, THREE.Vector3>>({});
  if (Object.keys(positionsRef.current).length === 0) {
    NODES.forEach(n => {
      positionsRef.current[n.id] = new THREE.Vector3(...n.init);
    });
  }

  // Dynamically assemble the active network of edges[cite: 24]
  const activeEdges = useMemo(() => {
    const edges: { source: number, target: number, color: string }[] = [];
    
    // Base Relations
    BASE_EDGES.forEach(([s, t]) => edges.push({ source: s, target: t, color: '#60a5fa' }));
    
    // Return lasers automatically firing back ((a, b) => (b, a))[cite: 24]
    if (isSymmetric) {
      SYM_EDGES.forEach(([s, t]) => edges.push({ source: s, target: t, color: '#34d399' }));
    }
    
    // New lasers permanently welding gaps ((a, b) and (b, c) => (a, c))[cite: 24]
    if (isTransitive) {
      TRANS_EDGES.forEach(([s, t]) => edges.push({ source: s, target: t, color: '#a855f7' }));
      if (isSymmetric) {
        SYM_TRANS_EDGES.forEach(([s, t]) => edges.push({ source: s, target: t, color: '#f472b6' }));
      }
    }
    
    return edges;
  }, [isSymmetric, isTransitive]);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Equivalence Network</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            An arbitrary equivalence relation $R$ divides a set $X$ into mutually disjoint subsets (partitions)[cite: 24].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Global Forcefields</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <button 
              onClick={() => setIsReflexive(!isReflexive)}
              className={`p-3 text-left rounded-lg transition-all border ${isReflexive ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-500 hover:border-stone-600'}`}
            >
              <div className="font-bold">Reflexive: $(a, a) \in R$</div>
              <div className="text-xs mt-1">Glow loop back to itself[cite: 24]</div>
            </button>
            
            <button 
              onClick={() => setIsSymmetric(!isSymmetric)}
              className={`p-3 text-left rounded-lg transition-all border ${isSymmetric ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-500 hover:border-stone-600'}`}
            >
              <div className="font-bold">Symmetric: $(a, b) \Rightarrow (b, a)$</div>
              <div className="text-xs mt-1">Return laser automatically fires[cite: 24]</div>
            </button>
            
            <button 
              onClick={() => setIsTransitive(!isTransitive)}
              className={`p-3 text-left rounded-lg transition-all border ${isTransitive ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-500 hover:border-stone-600'}`}
            >
              <div className="font-bold">Transitive: $(a, b), (b, c) \Rightarrow (a, c)$</div>
              <div className="text-xs mt-1">Bridge gaps directly[cite: 24]</div>
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isEquivalence ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Equivalence Classes Formed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            When all three forcefields are activated simultaneously, the chaotic web of lasers aggressively reorganizes itself[cite: 24]. The network physically fractures and clusters into isolated, perfectly fully-connected islands[cite: 24]. 
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-sm font-bold text-white">
            An equivalence relation is simply a mathematical sorting algorithm that guarantees the total separation of a dataset into disjoint partitions[cite: 24].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 8, 20], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <group>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[0, 0, 0]} position={[0, -4, 0]} />
              
              {/* DYNAMIC EDGES */}
              {activeEdges.map((edge, idx) => (
                <NetworkEdge 
                  key={`${edge.source}-${edge.target}-${idx}`} 
                  source={edge.source} 
                  target={edge.target} 
                  positionsRef={positionsRef} 
                  color={edge.color} 
                />
              ))}

              {/* DYNAMIC NODES */}
              {NODES.map((node) => (
                <NetworkNode 
                  key={node.id} 
                  node={node} 
                  isEquivalence={isEquivalence} 
                  positionsRef={positionsRef} 
                  isReflexive={isReflexive} 
                />
              ))}
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -4.1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}