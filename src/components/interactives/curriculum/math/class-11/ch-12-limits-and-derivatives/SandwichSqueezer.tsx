'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// DYNAMIC SHAPE GENERATORS
// ==================================================================
function GeometricSandwich({ xAngle, R }: { xAngle: number; R: number }) {
  // 1. Inner Triangle OAC
  const innerTriangleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(R, 0);
    shape.lineTo(R * Math.cos(xAngle), R * Math.sin(xAngle));
    shape.lineTo(0, 0);
    return shape;
  }, [xAngle, R]);

  // 2. Curved Sector OAC
  const sectorShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(R, 0);
    shape.absarc(0, 0, R, 0, xAngle, false);
    shape.lineTo(0, 0);
    return shape;
  }, [xAngle, R]);

  // 3. Outer Triangle OAB
  const outerTriangleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(R, 0);
    shape.lineTo(R, R * Math.tan(xAngle));
    shape.lineTo(0, 0);
    return shape;
  }, [xAngle, R]);

  return (
    <group>
      {/* Outer Triangle OAB (Area = 1/2 * tan x)[cite: 19] */}
      <mesh position={[0, 0, 0]}>
        <shapeGeometry args={[outerTriangleShape]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <Line 
        points={[[0, 0, 0.05], [R, 0, 0.05], [R, R * Math.tan(xAngle), 0.05], [0, 0, 0.05]] as [number, number, number][]} 
        color="#f87171" lineWidth={2} 
      />

      {/* Curved Sector OAC (Area = 1/2 * x)[cite: 19] */}
      <mesh position={[0, 0, 0.1]}>
        <shapeGeometry args={[sectorShape]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Line 
        points={(() => {
          const pts: [number, number, number][] = [[0, 0, 0.15], [R, 0, 0.15]];
          for(let i=0; i<=xAngle; i+=0.05) pts.push([R * Math.cos(i), R * Math.sin(i), 0.15]);
          pts.push([R * Math.cos(xAngle), R * Math.sin(xAngle), 0.15], [0, 0, 0.15]);
          return pts;
        })()}
        color="#fbbf24" lineWidth={3} 
      />

      {/* Inner Triangle OAC (Area = 1/2 * sin x)[cite: 19] */}
      <mesh position={[0, 0, 0.2]}>
        <shapeGeometry args={[innerTriangleShape]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Line 
        points={[[0, 0, 0.25], [R, 0, 0.25], [R * Math.cos(xAngle), R * Math.sin(xAngle), 0.25], [0, 0, 0.25]] as [number, number, number][]} 
        color="#60a5fa" lineWidth={4} 
      />
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SandwichSqueezer() {
  const [xAngle, setXAngle] = useState<number>(1.2);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const R = 10; // Visual scale multiplier

  // Mathematical areas calculated strictly off the unit circle (R=1)[cite: 19]
  const areaInner = 0.5 * Math.sin(xAngle);
  const areaSector = 0.5 * xAngle;
  const areaOuter = 0.5 * Math.tan(xAngle);

  // Core ratio for the limit theorem
  const sinXoverX = Math.sin(xAngle) / xAngle;
  const cosX = Math.cos(xAngle);

  const isSqueezed = xAngle < 0.02;

  // --- DRAG PHYSICS ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = 'ns-resize';
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    
    // Calculate angle from origin
    let rawAngle = Math.atan2(e.point.y, e.point.x);
    
    if (rawAngle > 1.4) rawAngle = 1.4; // Clamp upper
    if (rawAngle < 0.001) rawAngle = 0.001; // Avoid divide by zero crash
    
    // Magnetic snap to 0[cite: 19]
    if (rawAngle < 0.05) rawAngle = 0.001;

    setXAngle(rawAngle);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Sandwich Squeezer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Geometric proof of limₓ→₀ (sin x / x) = 1.
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Theorem Telemetry</span>
            <span className="text-amber-400 font-mono text-xs font-bold">Angle x = {xAngle.toFixed(3)} rad</span>
          </div>
          
          <div className="mb-4">
            <input 
              type="range" min="0.001" max="1.4" step="0.001" value={xAngle} 
              onChange={(e) => setXAngle(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className="flex justify-between items-center bg-blue-950/30 border border-blue-900/50 p-2 rounded">
              <span className="text-blue-400">Area ΔOAC (½ sin x):</span>
              <span className="text-blue-400 font-bold">{areaInner.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center bg-amber-950/30 border border-amber-900/50 p-2 rounded">
              <span className="text-amber-400">Area Sector (½ x):</span>
              <span className="text-amber-400 font-bold">{areaSector.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center bg-red-950/30 border border-red-900/50 p-2 rounded">
              <span className="text-red-400">Area ΔOAB (½ tan x):</span>
              <span className="text-red-400 font-bold">{areaOuter.toFixed(4)}</span>
            </div>
          </div>

          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-center">
            <div className="text-stone-400 text-xs mb-1 font-mono">
              Dividing by ½ sin x gives:
            </div>
            <div className="text-white font-mono font-bold">
              1 &lt; x / sin x &lt; 1 / cos x
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isSqueezed ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Mechanical Vice Grip Engaged</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            At the exact moment $x$ hits an infinitesimally small value, all three areas lock into the exact same numerical boundary[cite: 19]. The curved sector is physically crushed flat between the inner and outer triangles[cite: 19].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-lg font-bold text-amber-400">
            cos x ({cosX.toFixed(4)}) &lt; sin x / x ({sinXoverX.toFixed(4)}) &lt; 1
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [5, 5, 20], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            {/* INVISIBLE CAPTURE PLANE FOR DRAGGING */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              visible={false}
            >
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial />
            </mesh>

            <group position={[-2, -5, 0]}>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
              <Line points={[[-10, 0, -0.1], [25, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
              <Line points={[[0, -5, -0.1], [0, 25, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />

              {/* UNIT CIRCLE ARC (scaled by R) */}
              <Line 
                points={(() => {
                  const pts: [number, number, number][] = [];
                  for(let i=0; i<=Math.PI/2; i+=0.05) pts.push([R * Math.cos(i), R * Math.sin(i), -0.05]);
                  return pts;
                })()}
                color="#64748b" lineWidth={2} dashed dashScale={2} 
              />

              {/* DYNAMIC GEOMETRIC SANDWICH[cite: 19] */}
              <GeometricSandwich xAngle={xAngle} R={R} />

              {/* POINTS LABELS */}
              <Billboard position={[-0.8, -0.8, 0]}><Text fontSize={0.8} color="#94a3b8" fontWeight="bold">O</Text></Billboard>
              <Billboard position={[R + 0.8, -0.8, 0]}><Text fontSize={0.8} color="#94a3b8" fontWeight="bold">A</Text></Billboard>
              <Billboard position={[R * Math.cos(xAngle) - 0.5, R * Math.sin(xAngle) + 0.8, 0.3]}><Text fontSize={0.8} color="#60a5fa" fontWeight="bold">C</Text></Billboard>
              <Billboard position={[R + 0.8, R * Math.tan(xAngle) + 0.8, 0]}><Text fontSize={0.8} color="#f87171" fontWeight="bold">B</Text></Billboard>

              {/* DRAGGABLE ANGLE BOUNDARY NODE */}
              <group position={[R * Math.cos(xAngle), R * Math.sin(xAngle), 0.5]}>
                <mesh 
                  onPointerDown={handlePointerDown}
                  onPointerOver={() => document.body.style.cursor = 'ns-resize'}
                  onPointerOut={() => { if(!isDragging) document.body.style.cursor = 'auto' }}
                >
                  <sphereGeometry args={[0.4, 32, 32]} />
                  <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={0.8} />
                </mesh>
              </group>

              {/* ANGLE ARC VISUALIZER */}
              <Line 
                points={(() => {
                  const pts: [number, number, number][] = [];
                  for(let i=0; i<=xAngle; i+=0.05) pts.push([3 * Math.cos(i), 3 * Math.sin(i), 0.3]);
                  return pts;
                })()}
                color="#fcd34d" lineWidth={3} 
              />
              <Billboard position={[3.5 * Math.cos(xAngle/2), 3.5 * Math.sin(xAngle/2), 0.3]}>
                <Text fontSize={0.8} color="#fcd34d" fontWeight="bold">x</Text>
              </Billboard>

            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -6, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}