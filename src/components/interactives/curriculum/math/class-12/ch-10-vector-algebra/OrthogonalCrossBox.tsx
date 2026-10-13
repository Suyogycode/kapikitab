'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'setup' | 'cross_product';

// ==================================================================
// CUSTOM VECTOR ARROW COMPONENT
// ==================================================================
function VectorArrow({ 
  start, 
  end, 
  color, 
  label,
  opacity = 1
}: { 
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  color: string, 
  label?: string,
  opacity?: number
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    if (length < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    groupRef.current.position.lerp(start, delta * 8);

    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());
    groupRef.current.quaternion.slerp(quaternion, delta * 8);

    const bodyRef = groupRef.current.children[0] as THREE.Mesh;
    const headRef = groupRef.current.children[1] as THREE.Mesh;
    
    const headLength = Math.min(0.4, length * 0.5);
    const bodyLength = Math.max(0.01, length - headLength);
    
    bodyRef.scale.y = THREE.MathUtils.lerp(bodyRef.scale.y, bodyLength, delta * 8);
    bodyRef.position.y = bodyRef.scale.y / 2;
    headRef.position.y = bodyRef.scale.y + (headLength / 2);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.3} />
      </mesh>
      <mesh>
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.3} />
      </mesh>
      {label && (
        <Billboard position={[0, 0, 0.5]}>
          <Text fontSize={0.4} color={color} fontWeight="bold">{label}</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function CrossBoxScene({ theta, phase }: { theta: number, phase: Phase }) {
  // Vector A is fixed along the X-axis
  const vecA = useMemo(() => new THREE.Vector3(4, 0, 0), []);
  
  // Vector B rotates in the XY plane based on theta (in radians)
  const vecB = useMemo(() => {
    const rad = (theta * Math.PI) / 180;
    return new THREE.Vector3(4 * Math.cos(rad), 4 * Math.sin(rad), 0);
  }, [theta]);

  // Cross Product C = A x B
  const vecC = useMemo(() => new THREE.Vector3().crossVectors(vecA, vecB), [vecA, vecB]);

  const parallelogramRef = useRef<THREE.Mesh>(null);
  const crossVectorRef = useRef<THREE.Group>(null);

  // Dynamic Parallelogram Geometry
  const pGeom = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(18); // 2 triangles, 3 vertices each, 3 coords per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  useFrame((_, delta) => {
    // Update Parallelogram Vertices (0 -> A -> A+B -> B)
    const positions = pGeom.attributes.position.array as Float32Array;
    const ptOrigin = [0, 0, 0];
    const ptA = [vecA.x, vecA.y, vecA.z];
    const ptB = [vecB.x, vecB.y, vecB.z];
    const ptAB = [vecA.x + vecB.x, vecA.y + vecB.y, vecA.z + vecB.z];

    // Triangle 1: Origin, A, B
    positions.set([...ptOrigin, ...ptA, ...ptB], 0);
    // Triangle 2: A, A+B, B
    positions.set([...ptA, ...ptAB, ...ptB], 9);
    pGeom.attributes.position.needsUpdate = true;
    pGeom.computeVertexNormals();

    // Cross Vector Shoot Up Animation[cite: 22]
    if (crossVectorRef.current) {
      const targetScale = phase === 'cross_product' ? 1 : 0;
      crossVectorRef.current.scale.setScalar(THREE.MathUtils.lerp(crossVectorRef.current.scale.x, targetScale, delta * 6));
    }
  });

  const isCollapsed = Math.abs(theta) < 1 || Math.abs(theta - 180) < 1;

  return (
    <group position={[-2, -2, 0]}>
      {/* Dynamic Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[2, 2, -0.1]} />
      <Line points={[[-10, 0, 0], [10, 0, 0]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      <Line points={[[0, -10, 0], [0, 10, 0]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      
      {/* Base Vectors */}
      <VectorArrow start={new THREE.Vector3(0,0,0)} end={vecA} color="#38bdf8" label="a" />
      <VectorArrow start={new THREE.Vector3(0,0,0)} end={vecB} color="#10b981" label="b" />

      {/* Spanned Parallelogram Surface[cite: 22] */}
      <mesh geometry={pGeom} material={new THREE.MeshStandardMaterial({ color: "#fcd34d", transparent: true, opacity: 0.4, side: THREE.DoubleSide })} />
      
      {/* Dashed Outline for Parallelogram */}
      <Line points={[vecA.toArray(), [vecA.x + vecB.x, vecA.y + vecB.y, 0]] as [number, number, number][]} color="#fcd34d" dashed dashScale={2} />
      <Line points={[vecB.toArray(), [vecA.x + vecB.x, vecA.y + vecB.y, 0]] as [number, number, number][]} color="#fcd34d" dashed dashScale={2} />

      {/* Cross Product Vector (a x b)[cite: 22] */}
      <group ref={crossVectorRef}>
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={vecC} color="#8b5cf6" />
        {phase === 'cross_product' && !isCollapsed && (
          <Billboard position={[vecC.x, vecC.y, vecC.z + 0.5]}>
            <Text fontSize={0.5} color="#8b5cf6" fontWeight="bold">a x b</Text>
          </Billboard>
        )}
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function OrthogonalCrossBox() {
  const [theta, setTheta] = useState<number>(45); // Angle in degrees
  const [phase, setPhase] = useState<Phase>('setup');

  const rad = (theta * Math.PI) / 180;
  
  // Vector Components for the HUD Determinant[cite: 22]
  const ax = 4.0, ay = 0.0, az = 0.0;
  const bx = 4 * Math.cos(rad), by = 4 * Math.sin(rad), bz = 0.0;
  
  const cx = ay * bz - az * by;
  const cy = az * bx - ax * bz;
  const cz = ax * by - ay * bx;

  const isCollapsed = Math.abs(theta) < 1 || Math.abs(theta - 180) < 1;
  const isAhaMoment = phase === 'cross_product' && isCollapsed;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Orthogonal Cross-Box</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            The cross product a x b results in a third vector mutually perpendicular to both a and b[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">3D Determinant Matrix</span>
          </div>
          
          <div className="flex flex-col gap-4 font-mono text-sm mb-6">
            
            {/* Determinant HUD[cite: 22] */}
            <div className="flex justify-center items-center py-2 bg-stone-950 border border-stone-700 rounded-lg">
              <div className="flex text-lg border-l-2 border-r-2 border-stone-500 px-4 py-2 gap-4 text-center">
                <div className="flex flex-col gap-2 text-stone-300">
                  <div className="text-red-400 font-bold">i</div>
                  <div className="text-sky-400">{ax.toFixed(1)}</div>
                  <div className="text-emerald-400">{bx.toFixed(1)}</div>
                </div>
                <div className="flex flex-col gap-2 text-stone-300">
                  <div className="text-green-400 font-bold">j</div>
                  <div className="text-sky-400">{ay.toFixed(1)}</div>
                  <div className="text-emerald-400">{by.toFixed(1)}</div>
                </div>
                <div className="flex flex-col gap-2 text-stone-300">
                  <div className="text-blue-400 font-bold">k</div>
                  <div className="text-sky-400">{az.toFixed(1)}</div>
                  <div className="text-emerald-400">{bz.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Cross Product Result */}
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'cross_product' ? 'border-purple-500/50 bg-purple-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between mb-1">
                <span className={phase === 'cross_product' ? 'text-purple-400 font-bold' : 'text-stone-500'}>Vector a x b:</span>
                <span className={phase === 'cross_product' ? 'text-purple-200' : 'text-stone-600'}>
                  [{cx.toFixed(1)}, {cy.toFixed(1)}, {cz.toFixed(1)}]
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1 border-t border-stone-800/50 pt-1">
                <span className="text-stone-400">Magnitude (Area):</span>
                <span className={phase === 'cross_product' ? 'text-amber-400 font-bold' : 'text-stone-600'}>
                  {Math.abs(cz).toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-950/30 mb-4">
            <div className="flex justify-between text-emerald-400 font-bold mb-2 text-xs">
              <span>Align Parallel</span>
              <span>Rotate Vector b</span>
              <span>Orthogonal</span>
            </div>
            <input 
              type="range" min="0" max="180" step="1" 
              value={theta} 
              onChange={(e) => setTheta(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <button 
            onClick={() => setPhase(phase === 'setup' ? 'cross_product' : 'setup')}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'cross_product' ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]'}`}
          >
            {phase === 'setup' ? 'Trigger Cross Product' : 'Reset System'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-red-400 text-xs uppercase tracking-widest font-bold mb-2">Parallel Collapse Detected</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Rotating vector b so that it aligns parallel to a caused the spanned parallelogram to collapse completely into a flat line[cite: 22].
          </p>
          <div className="inline-block bg-red-950/50 px-6 py-2 rounded-lg border border-red-900/50 font-mono text-sm font-bold text-red-300">
            The cross product vector violently shrunk to zero (0), providing a powerful visual proof of why parallel vectors have a cross product of zero[cite: 22].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [5, -8, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <CrossBoxScene theta={theta} phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -0.2, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}