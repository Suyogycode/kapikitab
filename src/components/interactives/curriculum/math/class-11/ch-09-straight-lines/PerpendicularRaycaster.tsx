'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MATH HELPERS & CONSTANTS
// ==================================================================
// Line Equation: Ax + By + C = 0
// Let's use 3x + 4y - 12 = 0
const A = 3;
const B = 4;
const C = -12;
const DENOMINATOR = Math.sqrt(A * A + B * B); // 5

const getLineY = (x: number) => (-A * x - C) / B;

// Foot of perpendicular from (x1, y1) to Ax + By + C = 0
const getPerpendicularFoot = (x1: number, y1: number) => {
  const k = -(A * x1 + B * y1 + C) / (A * A + B * B);
  return {
    x: x1 + A * k,
    y: y1 + B * k,
  };
};

type DragState = 'point' | 'radar' | null;

// ==================================================================
// RADAR ANIMATION CONTROLLER (Must be inside Canvas)
// ==================================================================
function RadarAnimationController({ 
  isLocked, 
  footX, 
  radarX, 
  setRadarX, 
  getLineY 
}: { 
  isLocked: boolean; 
  footX: number; 
  radarX: number; 
  setRadarX: (x: number) => void;
  getLineY: (x: number) => number;
}) {
  const radarPosRef = useRef(new THREE.Vector3(radarX, getLineY(radarX), 0));

  useFrame((_, delta) => {
    const targetX = isLocked ? footX : radarX;
    const targetY = getLineY(targetX);
    
    radarPosRef.current.x = THREE.MathUtils.lerp(radarPosRef.current.x, targetX, delta * 8);
    radarPosRef.current.y = THREE.MathUtils.lerp(radarPosRef.current.y, targetY, delta * 8);
    
    // Auto-sync state if animating to lock so the UI distance numbers update
    if (isLocked && Math.abs(radarX - footX) > 0.01) {
      setRadarX(radarPosRef.current.x);
    }
  });

  return null;
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function PerpendicularRaycaster() {
  const [p, setP] = useState<[number, number]>([-3, 8]); // P(x1, y1)
  const [radarX, setRadarX] = useState<number>(6); // X coord of radar target on the line
  const [dragState, setDragState] = useState<DragState>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const foot = getPerpendicularFoot(p[0], p[1]);
  const currentRadarY = getLineY(radarX);
  
  const currentDistance = Math.sqrt(Math.pow(p[0] - radarX, 2) + Math.pow(p[1] - currentRadarY, 2));
  const shortestDistance = Math.abs(A * p[0] + B * p[1] + C) / DENOMINATOR;

  // --- DRAG PHYSICS ---
  const handlePointerDown = (type: DragState) => (e: any) => {
    e.stopPropagation();
    setDragState(type);
    setIsLocked(false);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: any) => {
    if (!dragState) return;
    
    if (dragState === 'point') {
      setP([e.point.x, e.point.y]);
      // If locked, keep radar on the foot automatically
      if (isLocked) {
        const newFoot = getPerpendicularFoot(e.point.x, e.point.y);
        setRadarX(newFoot.x);
      }
    } else if (dragState === 'radar') {
      setRadarX(e.point.x);
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
    document.body.style.cursor = 'auto';
  };

  const triggerSnap = () => {
    setIsLocked(true);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Perpendicular Raycaster</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Distance of a point from a line.
          </p>
        </div>

        {/* HUD TRACKER */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl min-w-[320px] pointer-events-auto">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Raycaster Telemetry</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">Line: 3x + 4y - 12 = 0</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <div className="flex justify-between items-center text-blue-400">
              <span>Point Mass P(x₁, y₁):</span>
              <span className="font-bold">({p[0].toFixed(1)}, {p[1].toFixed(1)})</span>
            </div>
            
            <div className="flex justify-between items-center bg-stone-950 p-2.5 rounded-lg border border-stone-800 mt-1">
              <span className="text-stone-400">Current Beam Length:</span>
              <span className={`font-bold text-lg ${isLocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentDistance.toFixed(2)} units
              </span>
            </div>
          </div>

          <button 
            onClick={triggerSnap}
            disabled={isLocked}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${isLocked ? 'bg-emerald-900/50 text-emerald-500 border-emerald-900 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {isLocked ? 'Perpendicular Locked' : 'Find Shortest Path'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isLocked ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Breakdown</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            The radar beam automatically sweeps back and drops perfectly perpendicular to the line. The complex absolute-value fraction is physically assembled as the spatial projection of the point.
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-3 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-white flex flex-col items-center">
            <div className="border-b border-emerald-500/50 pb-1 mb-1">
              Numerator |Ax₁ + By₁ + C| = {Math.abs(A * p[0] + B * p[1] + C).toFixed(1)}
            </div>
            <div>
              Hypotenuse Vector √(A² + B²) = {DENOMINATOR.toFixed(1)}
            </div>
            <div className="text-emerald-400 mt-2">
              Distance (d) = {shortestDistance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            {/* Animation Controller mounted inside the Canvas context */}
            <RadarAnimationController 
              isLocked={isLocked} 
              footX={foot.x} 
              radarX={radarX} 
              setRadarX={setRadarX} 
              getLineY={getLineY} 
            />

            {/* INVISIBLE CAPTURE PLANE */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              visible={false}
            >
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial />
            </mesh>

            <group>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
              <Line points={[[-30, 0, -0.1], [30, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={1} />
              <Line points={[[0, -30, -0.1], [0, 30, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={1} />

              {/* THE MASSIVE LINE (3x + 4y - 12 = 0) */}
              <Line 
                points={[[-30, getLineY(-30), 0], [30, getLineY(30), 0]] as [number, number, number][]} 
                color="#64748b" 
                lineWidth={4} 
              />
              <Billboard position={[8, getLineY(8) + 1, 0]}>
                <Text fontSize={0.6} color="#94a3b8" fontWeight="bold">Ax + By + C = 0</Text>
              </Billboard>

              {/* THE GLOWING POINT MASS P(x1, y1) */}
              <group position={[p[0], p[1], 0.1]}>
                <mesh 
                  onPointerDown={handlePointerDown('point')}
                  onPointerOver={() => document.body.style.cursor = 'grab'}
                  onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
                >
                  <sphereGeometry args={[0.4, 32, 32]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.8} />
                </mesh>
                <Billboard position={[0, 0.8, 0]}>
                  <Text fontSize={0.5} color="#60a5fa" fontWeight="bold">P(x₁, y₁)</Text>
                </Billboard>
              </group>

              {/* RADAR BEAM & TARGET */}
              <group>
                {/* The dynamic taut string (Radar Beam) */}
                <Line 
                  points={[[p[0], p[1], 0], [radarX, currentRadarY, 0]] as [number, number, number][]} 
                  color={isLocked ? "#10b981" : "#f59e0b"} 
                  lineWidth={isLocked ? 4 : 2}
                  dashed={!isLocked}
                  dashScale={4}
                />
                
                {/* Radar Target Node on the line */}
                <mesh 
                  position={[radarX, currentRadarY, 0.1]}
                  onPointerDown={handlePointerDown('radar')}
                  onPointerOver={() => document.body.style.cursor = 'ew-resize'}
                  onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
                >
                  <sphereGeometry args={[0.3, 32, 32]} />
                  <meshStandardMaterial 
                    color={isLocked ? "#10b981" : "#f59e0b"} 
                    emissive={isLocked ? "#059669" : "#d97706"} 
                    emissiveIntensity={isLocked ? 1 : 0.5} 
                  />
                </mesh>

                {/* 90-degree Orthogonal Lock Symbol (Only when locked) */}
                {isLocked && (
                  <group position={[foot.x, foot.y, 0.1]} rotation={[0, 0, Math.atan(-A/B)]}>
                    <Line 
                      points={[[0, 0.8, 0], [0.8, 0.8, 0], [0.8, 0, 0]] as [number, number, number][]} 
                      color="#10b981" 
                      lineWidth={3} 
                    />
                  </group>
                )}
              </group>
            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.3} far={10} position={[0, -5, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}