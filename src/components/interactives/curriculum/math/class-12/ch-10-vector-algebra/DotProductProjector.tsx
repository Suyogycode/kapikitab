'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// CUSTOM VECTOR ARROW COMPONENT
// ==================================================================
function VectorArrow({ 
  start, 
  end, 
  color, 
  label,
  headSize = 0.4,
  lineWidth = 0.05
}: { 
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  color: string, 
  label?: string,
  headSize?: number,
  lineWidth?: number
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
    
    const actualHeadLength = Math.min(headSize, length * 0.5);
    const bodyLength = Math.max(0.01, length - actualHeadLength);
    
    bodyRef.scale.y = THREE.MathUtils.lerp(bodyRef.scale.y, bodyLength, delta * 8);
    bodyRef.position.y = bodyRef.scale.y / 2;
    headRef.position.y = bodyRef.scale.y + (actualHeadLength / 2);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[lineWidth, lineWidth, 1, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh>
        <coneGeometry args={[lineWidth * 3, headSize, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
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
function ProjectorScene({ theta }: { theta: number }) {
  const rad = (theta * Math.PI) / 180;
  
  const magA = 4.0;
  const magB = 5.0;

  // Vector B is fixed along the X-axis
  const vecB = useMemo(() => new THREE.Vector3(magB, 0, 0), [magB]);
  
  // Vector A rotates based on theta
  const vecA = useMemo(() => new THREE.Vector3(magA * Math.cos(rad), magA * Math.sin(rad), 0), [magA, rad]);

  // Projection of A onto B
  const projLength = magA * Math.cos(rad);
  const vecProj = useMemo(() => new THREE.Vector3(projLength, 0, 0), [projLength]);

  const laserRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.1; // Slight hover effect for the sun
    }
  });

  return (
    <group position={[-2, -2, 0]}>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[2, 2, -0.6]} />
      <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      <Line points={[[0, -10, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
      
      {/* Base Vectors */}
      <VectorArrow start={new THREE.Vector3(0,0,0)} end={vecB} color="#38bdf8" label="b" />
      <VectorArrow start={new THREE.Vector3(0,0,0)} end={vecA} color="#10b981" label="a" />

      {/* Laser Beam (Virtual Sun) */}
      <group ref={laserRef}>
        <Line 
          points={[[vecA.x, vecA.y, 0], [vecProj.x, 0, 0]] as [number, number, number][]} 
          color="#fef08a" 
          lineWidth={2} 
          dashed 
          dashScale={4} 
        />
        <mesh position={[vecProj.x, 0, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
      </group>

      {/* Glowing Shadow Segment (The Projection) */}
      <group ref={shadowRef} position={[0, 0, 0.1]}>
        {Math.abs(projLength) > 0.05 && (
          <VectorArrow 
            start={new THREE.Vector3(0,0,0)} 
            end={vecProj} 
            color="#f97316" 
            headSize={0.3} 
            lineWidth={0.08} 
          />
        )}
      </group>

      {/* Angle Arc Indicator */}
      {theta > 0 && (
        <Line 
          points={Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 19) * rad;
            return [1.5 * Math.cos(angle), 1.5 * Math.sin(angle), 0] as [number, number, number];
          })}
          color="#fcd34d" 
          lineWidth={3} 
        />
      )}
      <Billboard position={[1.8 * Math.cos(rad / 2), 1.8 * Math.sin(rad / 2), 0]}>
        <Text color="#fcd34d" fontSize={0.4} fontWeight="bold">θ</Text>
      </Billboard>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function DotProductProjector() {
  const [theta, setTheta] = useState<number>(60); // Angle in degrees

  const magA = 4.0;
  const magB = 5.0;
  
  const rad = (theta * Math.PI) / 180;
  const shadowLength = magA * Math.cos(rad);
  const dotProduct = magA * magB * Math.cos(rad);

  const isOrthogonal = theta === 90;
  const isParallel = theta === 0;
  const isAhaMoment = isOrthogonal || isParallel;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Dot-Product Projector</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            The dot product a · b measures how much one vector "points" in the direction of another[cite: 26].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Scalar Product Data</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Vector Magnitudes */}
            <div className="flex gap-2">
              <div className="flex-1 p-2 rounded border border-emerald-500/50 bg-emerald-950/30 text-emerald-400 text-center">
                |a| = {magA.toFixed(1)}
              </div>
              <div className="flex-1 p-2 rounded border border-sky-500/50 bg-sky-950/30 text-sky-400 text-center">
                |b| = {magB.toFixed(1)}
              </div>
            </div>

            {/* Projection / Shadow Length */}
            <div className={`p-3 rounded-lg border transition-colors ${isOrthogonal ? 'border-red-500/50 bg-red-950/30' : 'border-orange-500/50 bg-orange-950/30'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={isOrthogonal ? "text-red-400 font-bold" : "text-orange-400 font-bold"}>Shadow Length</span>
              </div>
              <div className="text-xs text-stone-400 mb-1">proj_b(a) = |a| * cos(θ)</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-300">cos({theta}°) = {Math.cos(rad).toFixed(2)}</span>
                <span className={`font-bold ${isOrthogonal ? 'text-red-400' : 'text-orange-300'}`}>
                  {Math.abs(shadowLength).toFixed(2)} {shadowLength < 0 ? '(Flipped)' : ''}
                </span>
              </div>
            </div>

            {/* Dot Product Final Calculation */}
            <div className={`p-3 rounded-lg border transition-colors ${isOrthogonal ? 'border-red-500/50 bg-red-950/30' : isParallel ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-stone-300 font-bold">Dot Product (a · b)</span>
              </div>
              <div className="text-xs text-stone-400 mb-1">|a| * |b| * cos(θ)</div>
              <div className="flex justify-between items-center text-lg mt-1 pt-2 border-t border-stone-800/50">
                <span className="text-stone-500 text-sm">Result:</span>
                <span className={`font-bold ${isOrthogonal ? 'text-red-400' : isParallel ? 'text-emerald-400' : 'text-stone-200'}`}>
                  {dotProduct.toFixed(1)}
                </span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-lg border border-sky-500/50 bg-sky-950/30 mb-4">
            <div className="flex justify-between text-sky-400 font-bold mb-2 text-xs">
              <span>0°</span>
              <span>Rotate Vector a (θ)</span>
              <span>180°</span>
            </div>
            <input 
              type="range" min="0" max="180" step="1" 
              value={theta} 
              onChange={(e) => setTheta(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setTheta(90)}
              className="flex-1 py-2 rounded border border-red-500/50 text-red-400 hover:bg-red-950/50 font-bold text-xs uppercase"
            >
              Set Orthogonal
            </button>
            <button 
              onClick={() => setTheta(0)}
              className="flex-1 py-2 rounded border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/50 font-bold text-xs uppercase"
            >
              Set Parallel
            </button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`bg-stone-900/95 border p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.4)] ${isOrthogonal ? 'border-red-500 shadow-red-500/30' : 'border-emerald-500 shadow-emerald-500/30'} animate-in slide-in-from-bottom-4 duration-500`}>
          <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${isOrthogonal ? 'text-red-400' : 'text-emerald-400'}`}>
            Physical Visualization Achieved
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            {isOrthogonal 
              ? "When a and b are perpendicular (θ = 90°), the shadow vanishes entirely, and the dot product drops to exactly zero[cite: 26]." 
              : "When they point in the exact same direction (θ = 0°), the shadow perfectly matches the full length of a[cite: 26]."}
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-sm font-bold text-stone-300">
            The dot product is simply the length of one vector multiplied by the shadow it casts on the other[cite: 26].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[0, 10, 5]} intensity={1.5} />
            <Environment preset="city"/>

            <OrbitControls enablePan={true} enableRotate={true} enableZoom={true} />

            <ProjectorScene theta={theta} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}