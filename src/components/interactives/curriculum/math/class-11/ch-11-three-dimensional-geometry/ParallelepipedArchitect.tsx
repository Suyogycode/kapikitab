'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// 3D ANIMATION ENGINE
// ==================================================================
function AnimatedBuilder({ 
  x, y, z, step 
}: { 
  x: number; y: number; z: number; step: number; 
}) {
  // Group refs for scaling and positioning
  const xAxisRef = useRef<THREE.Group>(null);
  const xySweepRef = useRef<THREE.Group>(null);
  const zExtrudeRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const pNodeRef = useRef<THREE.Group>(null);

  // State refs for animation lerping
  const p1 = useRef(0);
  const p2 = useRef(0);
  const p3 = useRef(0);
  const p4 = useRef(0);

  useFrame((_, delta) => {
    // Lerp progress variables based on the current active step
    p1.current = THREE.MathUtils.lerp(p1.current, step >= 1 ? 1 : 0, delta * 5);
    p2.current = THREE.MathUtils.lerp(p2.current, step >= 2 ? 1 : 0, delta * 5);
    p3.current = THREE.MathUtils.lerp(p3.current, step >= 3 ? 1 : 0, delta * 5);
    p4.current = THREE.MathUtils.lerp(p4.current, step >= 4 ? 1 : 0, delta * 5);

    // 1. Extrude line along X-axis to A[cite: 24]
    if (xAxisRef.current) {
      const currentX = x * p1.current;
      xAxisRef.current.scale.x = Math.max(0.001, currentX);
      xAxisRef.current.position.x = currentX / 2;
    }

    // 2. Sweep rectangle across XY-plane to M(x,y,0)[cite: 24]
    if (xySweepRef.current) {
      const currentY = y * p2.current; // Depth in math is Y
      xySweepRef.current.scale.z = Math.max(0.001, currentY);
      xySweepRef.current.position.z = -currentY / 2; // -Z is math +Y
      xySweepRef.current.position.x = x / 2; // Centered on X
      xySweepRef.current.scale.x = x;
    }

    // 3. Extrude upward along Z-axis to P(x,y,z)[cite: 24]
    if (zExtrudeRef.current && pNodeRef.current) {
      const currentZ = z * p3.current; // Height in math is Z
      zExtrudeRef.current.scale.y = Math.max(0.001, currentZ);
      zExtrudeRef.current.position.y = currentZ / 2;
      zExtrudeRef.current.position.x = x;
      zExtrudeRef.current.position.z = -y;

      pNodeRef.current.position.set(x, currentZ, -y);
    }

    // 4. Enclose point P inside a solid, translucent rectangular box[cite: 24]
    if (boxRef.current) {
      boxRef.current.scale.set(x, z, y);
      boxRef.current.position.set(x / 2, z / 2, -y / 2);
      (boxRef.current.material as THREE.MeshStandardMaterial).opacity = p4.current * 0.15;
    }
  });

  return (
    <group>
      {/* 1. X-Axis Extrusion (O to A) */}
      <group ref={xAxisRef} position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {step >= 1 && (
        <Billboard position={[x, -0.6, 0]}>
          <Text fontSize={0.5} color="#60a5fa" fontWeight="bold">A({x}, 0, 0)</Text>
        </Billboard>
      )}

      {/* 2. XY-Plane Sweep (A to M) */}
      <group ref={xySweepRef} position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.05, 1]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
      {step >= 2 && (
        <Billboard position={[x, -0.6, -y]}>
          <Text fontSize={0.5} color="#34d399" fontWeight="bold">M({x}, {y}, 0)</Text>
        </Billboard>
      )}

      {/* 3. Z-Axis Extrusion (M to P) - The Glowing Blue Tether[cite: 24] */}
      <group ref={zExtrudeRef} position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#7c3aed" emissiveIntensity={1} />
        </mesh>
      </group>
      
      {/* Target Point P */}
      <group ref={pNodeRef} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
        {step >= 3 && (
          <Billboard position={[0, 0.8, 0]}>
            <Text fontSize={0.6} color="#fcd34d" fontWeight="bold">P({x}, {y}, {z})</Text>
          </Billboard>
        )}
      </group>

      {/* 4. The Enclosing Parallelepiped */}
      <mesh ref={boxRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fcd34d" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 5. Dimension Lines (Aha! Moment)[cite: 24] */}
      {step >= 4 && (
        <group>
          {/* Distance from P to YZ Plane (x-coordinate) */}
          <Line points={[[x, z, -y], [0, z, -y]] as [number, number, number][]} color="#ef4444" dashed dashScale={2} lineWidth={3} />
          <Billboard position={[x / 2, z + 0.5, -y]}>
            <Text fontSize={0.4} color="#ef4444" fontWeight="bold">Gap x = {x}</Text>
          </Billboard>

          {/* Distance from P to ZX Plane (y-coordinate) */}
          <Line points={[[x, z, -y], [x, z, 0]] as [number, number, number][]} color="#22c55e" dashed dashScale={2} lineWidth={3} />
          <Billboard position={[x + 0.5, z + 0.5, -y / 2]}>
            <Text fontSize={0.4} color="#22c55e" fontWeight="bold">Gap y = {y}</Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ParallelepipedArchitect() {
  const [x, setX] = useState<number>(3);
  const [y, setY] = useState<number>(4);
  const [z, setZ] = useState<number>(5);
  const [step, setStep] = useState<number>(0);

  const isAhaMoment = step === 4;

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else setStep(0);
  };

  // Reset sequence if coordinates change
  useEffect(() => {
    setStep(0);
  }, [x, y, z]);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Parallelepiped Architect</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Locating a point $P(x, y, z)$ by drawing three planes parallel to the coordinate planes[cite: 24].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Construction Phase</span>
            <span className="text-amber-400 font-mono text-xs font-bold">Step {step}/4</span>
          </div>
          
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-red-400 font-mono font-bold w-4">X</span>
              <input type="range" min="1" max="6" step="1" value={x} onChange={(e) => setX(parseInt(e.target.value))} className="flex-1 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
              <span className="text-white font-mono w-4">{x}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 font-mono font-bold w-4">Y</span>
              <input type="range" min="1" max="6" step="1" value={y} onChange={(e) => setY(parseInt(e.target.value))} className="flex-1 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
              <span className="text-white font-mono w-4">{y}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-mono font-bold w-4">Z</span>
              <input type="range" min="1" max="6" step="1" value={z} onChange={(e) => setZ(parseInt(e.target.value))} className="flex-1 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <span className="text-white font-mono w-4">{z}</span>
            </div>
          </div>

          <button 
            onClick={nextStep}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${step === 4 ? 'bg-stone-800 text-stone-400 border-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {step === 0 ? 'Start Construction' : step === 4 ? 'Reset Engine' : 'Next Phase'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Architectural Reality</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            The engine draws the remaining parallel planes to enclose point $P$ inside a solid, translucent rectangular box[cite: 24]. 
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-sm text-white">
            The dimension lines explicitly prove that the $x$-coordinate is not just a spot on an axis, but the physical gap between point $P$ and the entire $YZ$-plane[cite: 24].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [10, 8, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={5} 
              maxDistance={35}
              target={[x/2, z/2, -y/2]}
            />

            <group>
              {/* AXES LINES */}
              {/* Math X-Axis (Three X) - Red */}
              <Line points={[[-10, 0, 0], [10, 0, 0]] as [number, number, number][]} color="#ef4444" lineWidth={1} />
              <Billboard position={[11, 0, 0]}><Text fontSize={0.8} color="#ef4444" fontWeight="bold">X</Text></Billboard>

              {/* Math Y-Axis (Three -Z) - Green */}
              <Line points={[[0, 0, -10], [0, 0, 10]] as [number, number, number][]} color="#22c55e" lineWidth={1} />
              <Billboard position={[0, 0, -11]}><Text fontSize={0.8} color="#22c55e" fontWeight="bold">Y</Text></Billboard>

              {/* Math Z-Axis (Three Y) - Blue */}
              <Line points={[[0, -10, 0], [0, 10, 0]] as [number, number, number][]} color="#3b82f6" lineWidth={1} />
              <Billboard position={[0, 11, 0]}><Text fontSize={0.8} color="#3b82f6" fontWeight="bold">Z</Text></Billboard>

              {/* THE 3 INTERSECTING PLANES (Faint Background) */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#64748b" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
              <mesh rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#64748b" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
              <mesh>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#64748b" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>

              {/* Origin O(0,0,0)[cite: 24] */}
              <Billboard position={[-0.5, -0.5, 0]}>
                <Text fontSize={0.5} color="#94a3b8" fontWeight="bold">O</Text>
              </Billboard>

              {/* THE DYNAMIC BUILDER */}
              <AnimatedBuilder x={x} y={y} z={z} step={step} />

            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.3} far={20} position={[0, -0.1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}