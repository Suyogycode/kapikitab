'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';

// ==================================================================
// MATH LOGIC & TYPES
// ==================================================================
type RelationRule = 'none' | 'y_eq_x_plus_1' | 'x_eq_y_square' | 'y_greater_x';

const SET_A = [0, 1, 2, 3, 4, 5]; // Plotted on X-axis[cite: 13]
const SET_B = [-2, -1, 0, 1, 2, 3]; // Plotted on Z-axis (representing y values)[cite: 13]

// Evaluates if an ordered pair (x, y) satisfies the relation[cite: 13]
const checkRelation = (x: number, y: number, rule: RelationRule) => {
  switch (rule) {
    case 'y_eq_x_plus_1': return y === x + 1;
    case 'x_eq_y_square': return x === y * y;
    case 'y_greater_x': return y > x;
    case 'none':
    default: return true;
  }
};

// ==================================================================
// 3D NODE ENGINE (The Ordered Pairs)
// ==================================================================
function OrderedPairNode({ x, y, rule }: { x: number, y: number, rule: RelationRule }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const isValid = useMemo(() => checkRelation(x, y, rule), [x, y, rule]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Animation targets based on validity
    const targetScale = isValid ? 1 : 0.01;
    const targetY = isValid ? 0 : -3; // Fall away if invalid[cite: 13]
    
    // Smoothly interpolate scale and position
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 10));
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 5);
  });

  return (
    // Note: Math 'y' is mapped to R3F 'z' to lay flat on the grid[cite: 13]
    <mesh ref={meshRef} position={[x, 0, y]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      {/* Glowing Glass Sphere Material[cite: 13] */}
      <meshPhysicalMaterial 
        color={isValid ? "#34d399" : "#ef4444"} 
        emissive={isValid ? "#059669" : "#000000"} 
        emissiveIntensity={isValid ? 0.5 : 0}
        transmission={0.9} 
        opacity={1} 
        metalness={0.1} 
        roughness={0.1} 
        ior={1.5} 
        thickness={0.5} 
      />
    </mesh>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function CartesianMatrix() {
  const [rule, setRule] = useState<RelationRule>('none');

  // Calculate active Domain and Range based on the current rule[cite: 13]
  const { domain, range } = useMemo(() => {
    const activeDomain = new Set<number>();
    const activeRange = new Set<number>();
    
    SET_A.forEach(x => {
      SET_B.forEach(y => {
        if (checkRelation(x, y, rule)) {
          activeDomain.add(x);
          activeRange.add(y);
        }
      });
    });

    return {
      domain: Array.from(activeDomain).sort((a, b) => a - b),
      range: Array.from(activeRange).sort((a, b) => a - b)
    };
  }, [rule]);

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-auto bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Cartesian Matrix</h2>
            <p className="text-stone-400 text-sm max-w-xl">
              Set A = {'{'} {SET_A.join(', ')} {'}'} <br/>
              Set B = {'{'} {SET_B.join(', ')} {'}'}
            </p>
          </div>

          {/* CONTROL PANEL */}
          <div className="flex flex-col gap-2 bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Select Relation Rule</span>
            <select 
              value={rule} 
              onChange={(e) => setRule(e.target.value as RelationRule)}
              className="bg-stone-800 text-emerald-400 border border-stone-700 rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="none">A × B (Total Cartesian Product)</option>
              <option value="y_eq_x_plus_1">y = x + 1</option>
              <option value="x_eq_y_square">x is the square of y (x = y²)</option>
              <option value="y_greater_x">y &gt; x</option>
            </select>
          </div>
        </div>
      </div>

      {/* AHA MOMENT: DOMAIN & RANGE DISPLAY */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/90 border border-emerald-900/50 p-4 rounded-xl backdrop-blur-md max-w-2xl w-full flex justify-around shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="text-center">
            <p className="text-stone-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1">Domain (Active X)</p>
            <p className="text-emerald-400 font-mono text-base sm:text-lg">
              {'{'} {domain.length > 0 ? domain.join(', ') : '∅'} {'}'}
            </p>
          </div>
          <div className="w-px bg-stone-700 mx-4"></div>
          <div className="text-center">
            <p className="text-stone-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1">Range (Active Y)</p>
            <p className="text-emerald-400 font-mono text-base sm:text-lg">
              {'{'} {range.length > 0 ? range.join(', ') : '∅'} {'}'}
            </p>
          </div>
        </div>
      </div>

      {/* THE 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [2.5, 4, 8], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enablePan={true} 
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minDistance={3} 
              maxDistance={20} 
              target={[2.5, 0, 0.5]}
            />

            {/* THE CARTESIAN GRID */}
            <group>
              <gridHelper args={[12, 12, "#334155", "#1e293b"]} position={[2.5, -0.1, 0.5]} />
              
              {/* X-Axis (Set A) */}
              <mesh position={[2.5, -0.05, -3.5]}>
                <cylinderGeometry args={[0.03, 0.03, 12]} />
                <meshStandardMaterial color="#3b82f6" />
              </mesh>
              <Text position={[8.5, 0, -3.5]} fontSize={0.4} color="#3b82f6" anchorX="center" anchorY="middle">
                Set A (x)
              </Text>
              
              {/* Z-Axis (Set B) */}
              <mesh position={[-3.5, -0.05, 0.5]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 12]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              <Text position={[-3.5, 0, 6.5]} fontSize={0.4} color="#ef4444" anchorX="center" anchorY="middle" rotation={[0, -Math.PI / 2, 0]}>
                Set B (y)
              </Text>

              {/* Axis Labels */}
              {SET_A.map(x => (
                <Text key={`x-${x}`} position={[x, 0, -3.5]} fontSize={0.25} color="#94a3b8" anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
                  {x.toString()}
                </Text>
              ))}
              {SET_B.map(y => (
                <Text key={`y-${y}`} position={[-3.5, 0, y]} fontSize={0.25} color="#94a3b8" anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
                  {y.toString()}
                </Text>
              ))}
            </group>

            {/* THE ORDERED PAIRS (Intersection Spheres) */}
            <group>
              {SET_A.map(x => 
                SET_B.map(y => (
                  <OrderedPairNode key={`${x},${y}`} x={x} y={y} rule={rule} />
                ))
              )}
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.4} far={10} color="#000000" position={[2.5, -3, 0.5]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}