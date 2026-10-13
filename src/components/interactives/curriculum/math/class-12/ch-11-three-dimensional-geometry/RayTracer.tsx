'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type EquationForm = 'vector' | 'cartesian';

// ==================================================================
// CUSTOM VECTOR ARROW COMPONENT
// ==================================================================
function VectorArrow({ 
  start, 
  end, 
  color, 
  label,
  lineWidth = 0.1,
  headSize = 0.5
}: { 
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  color: string, 
  label?: string,
  lineWidth?: number,
  headSize?: number
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
    groupRef.current.position.lerp(start, delta * 12);

    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());
    groupRef.current.quaternion.slerp(quaternion, delta * 12);

    const bodyRef = groupRef.current.children[0] as THREE.Mesh;
    const headRef = groupRef.current.children[1] as THREE.Mesh;
    
    const actualHeadLength = Math.min(headSize, length * 0.3);
    const bodyLength = Math.max(0.01, length - actualHeadLength);
    
    bodyRef.scale.y = THREE.MathUtils.lerp(bodyRef.scale.y, bodyLength, delta * 12);
    bodyRef.position.y = bodyRef.scale.y / 2;
    headRef.position.y = bodyRef.scale.y + (actualHeadLength / 2);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[lineWidth, lineWidth, 1, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh>
        <coneGeometry args={[lineWidth * 2.5, headSize, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      {label && (
        <Billboard position={[0, 0, 0.5]}>
          <Text fontSize={0.5} color={color} fontWeight="bold">{label}</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function TracerScene({ bx, by, bz }: { bx: number, by: number, bz: number }) {
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  
  // Fixed Point A (Position Vector a)
  const vecA = useMemo(() => new THREE.Vector3(2, 3, 2), []);
  
  // Direction Vector B
  const vecB = useMemo(() => new THREE.Vector3(bx, by, bz), [bx, by, bz]);
  
  // Ray Points (Shooting infinitely in both directions from A along B)[cite: 21]
  const rayPoints = useMemo(() => {
    const scale = 50; // Arbitrarily large to look infinite
    const startPt = vecA.clone().add(vecB.clone().multiplyScalar(-scale));
    const endPt = vecA.clone().add(vecB.clone().multiplyScalar(scale));
    return [startPt.toArray(), endPt.toArray()] as [number, number, number][];
  }, [vecA, vecB]);

  return (
    <group position={[0, -2, 0]}>
      {/* 3D Grid Planes for spatial awareness */}
      <gridHelper args={[20, 20, "#334155", "#0f172a"]} position={[0, 0, 0]} />
      
      {/* Axes */}
      <VectorArrow start={origin} end={new THREE.Vector3(10, 0, 0)} color="#475569" label="X" lineWidth={0.03} headSize={0.2} />
      <VectorArrow start={origin} end={new THREE.Vector3(0, 10, 0)} color="#475569" label="Y" lineWidth={0.03} headSize={0.2} />
      <VectorArrow start={origin} end={new THREE.Vector3(0, 0, 10)} color="#475569" label="Z" lineWidth={0.03} headSize={0.2} />

      {/* Position Vector a (Fixed Point)[cite: 21] */}
      <VectorArrow start={origin} end={vecA} color="#38bdf8" label="a" lineWidth={0.1} headSize={0.4} />
      <mesh position={vecA}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>

      {/* Direction Vector b (Originating from A for visual clarity)[cite: 21] */}
      <VectorArrow start={vecA} end={new THREE.Vector3().addVectors(vecA, vecB)} color="#10b981" label="b" lineWidth={0.15} headSize={0.5} />

      {/* The Infinite Glowing Ray[cite: 21] */}
      <Line points={rayPoints} color="#fcd34d" lineWidth={4} transparent opacity={0.6} />
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function RayTracer() {
  const [form, setForm] = useState<EquationForm>('vector');
  
  // Direction Vector B components (controlled via sliders mimicking stylus drag)[cite: 21]
  const [bx, setBx] = useState<number>(3);
  const [by, setBy] = useState<number>(1);
  const [bz, setBz] = useState<number>(-2);

  // Fixed Point A coordinates
  const ax = 2, ay = 3, az = 2;

  const isVector = form === 'vector';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Ray Tracer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            A line is uniquely defined by passing through a fixed point a with a specific direction vector b[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setForm('vector')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs tracking-widest uppercase transition-all ${isVector ? 'bg-sky-600 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
            >
              Vector Form
            </button>
            <button 
              onClick={() => setForm('cartesian')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs tracking-widest uppercase transition-all ${!isVector ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
            >
              Cartesian Form
            </button>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            {/* The Live Equation HUD[cite: 21] */}
            <div className={`p-4 rounded-lg border transition-colors duration-300 ${isVector ? 'border-sky-500/50 bg-sky-950/30' : 'border-purple-500/50 bg-purple-950/30'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={isVector ? "text-sky-400 font-bold" : "text-purple-400 font-bold"}>
                  {isVector ? 'r = a + λb' : 'Coordinate Algebra'}
                </span>
              </div>
              
              {isVector ? (
                <div className="text-stone-200 text-center py-2 text-lg">
                  <span className="text-stone-400">r = </span>
                  <span className="text-sky-300">({ax}î + {ay}ĵ + {az}k̂)</span>
                  <span className="text-stone-400"> + λ</span>
                  <span className="text-emerald-300">({bx}î {by >= 0 ? '+' : '-'} {Math.abs(by)}ĵ {bz >= 0 ? '+' : '-'} {Math.abs(bz)}k̂)</span>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-4 text-stone-200 py-2 text-lg">
                  <div className="flex flex-col items-center">
                    <span className="border-b border-stone-500 pb-1 px-2 text-sky-300">x - {ax}</span>
                    <span className="pt-1 px-2 text-emerald-300">{bx}</span>
                  </div>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b border-stone-500 pb-1 px-2 text-sky-300">y - {ay}</span>
                    <span className="pt-1 px-2 text-emerald-300">{by}</span>
                  </div>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b border-stone-500 pb-1 px-2 text-sky-300">z - {az}</span>
                    <span className="pt-1 px-2 text-emerald-300">{bz}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Directional Vector Controls (Stylus Simulator)[cite: 21] */}
          <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 mb-4">
            <div className="text-emerald-400 font-bold mb-3 text-xs text-center uppercase tracking-widest">
              Twist Direction Vector b
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold w-4">bx</span>
                <input type="range" min="-8" max="8" step="1" value={bx} onChange={(e) => setBx(parseInt(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                <span className="text-stone-400 w-8 text-right text-xs">{bx}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold w-4">by</span>
                <input type="range" min="-8" max="8" step="1" value={by} onChange={(e) => setBy(parseInt(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                <span className="text-stone-400 w-8 text-right text-xs">{by}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold w-4">bz</span>
                <input type="range" min="-8" max="8" step="1" value={bz} onChange={(e) => setBz(parseInt(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                <span className="text-stone-400 w-8 text-right text-xs">{bz}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${!isVector ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(147,51,234,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Algebraic Bridge Completed</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The components of vectors a and b automatically slotted into the numerators and denominators of the Cartesian fractions[cite: 21].
          </p>
          <div className="inline-block bg-purple-950/50 px-6 py-2 rounded-lg border border-purple-900/50 font-mono text-sm font-bold text-purple-300">
            This bridges vector notation directly with coordinate algebra, proving that both equations describe the exact same spatial path[cite: 21].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [10, 8, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <TracerScene bx={bx} by={by} bz={bz} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2.1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}