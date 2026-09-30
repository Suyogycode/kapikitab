'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line } from '@react-three/drei';

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

// Generates the points for a curved line along the circumference
function WrappedArc({ startAngle, endAngle, radius, color, isClockwise }: { startAngle: number, endAngle: number, radius: number, color: string, isClockwise: boolean }) {
  const points = useMemo(() => {
    const pts = [];
    const segments = 32;
    const dir = isClockwise ? -1 : 1;
    for (let i = 0; i <= segments; i++) {
      const theta = startAngle + (endAngle - startAngle) * (i / segments);
      pts.push(new THREE.Vector3(Math.cos(theta * dir) * radius, Math.sin(theta * dir) * radius, 0));
    }
    return pts;
  }, [startAngle, endAngle, radius, isClockwise]);

  if (startAngle >= endAngle) return null;

  return (
    <Line points={points} color={color} lineWidth={8} />
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function RadianUnroller() {
  const [radians, setRadians] = useState<number>(0);
  const [isClockwise, setIsClockwise] = useState<boolean>(false);

  const RADIUS = 3;
  const PI = Math.PI;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    // Snap to exact PI for the Aha moment[cite: 16]
    if (Math.abs(val - PI) < 0.05) val = PI; 
    setRadians(val);
  };

  const isAhaMoment = radians === PI;

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Radian Unroller</h2>
        <p className="text-stone-400 text-sm max-w-2xl mb-4">
          Wrap the rigid radius along the edge to measure the angle physically[cite: 16].
        </p>

        {/* CONTROLS (Pointer events re-enabled) */}
        <div className="pointer-events-auto bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Rotation</span>
            <div className="flex bg-stone-950 rounded-lg overflow-hidden border border-stone-800">
              <button 
                onClick={() => setIsClockwise(false)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${!isClockwise ? 'bg-emerald-900/50 text-emerald-400' : 'text-stone-500 hover:text-stone-300'}`}
              >
                + (Anticlockwise)
              </button>
              <button 
                onClick={() => setIsClockwise(true)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${isClockwise ? 'bg-red-900/50 text-red-400' : 'text-stone-500 hover:text-stone-300'}`}
              >
                - (Clockwise)
              </button>
            </div>
          </div>

          <div className="mb-2 flex justify-between">
            <span className="text-stone-400 font-mono text-sm">Wrap Progress:</span>
            <span className="text-white font-mono font-bold">{radians.toFixed(2)} rad</span>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max={PI} 
            step="0.01" 
            value={radians} 
            onChange={handleSliderChange}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between mt-4 gap-2">
            <button onClick={() => setRadians(1)} className="flex-1 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-mono border border-stone-700">1 Rad</button>
            <button onClick={() => setRadians(2)} className="flex-1 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-mono border border-stone-700">2 Rad</button>
            <button onClick={() => setRadians(3)} className="flex-1 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-mono border border-stone-700">3 Rad</button>
            <button onClick={() => setRadians(PI)} className="flex-1 py-1 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 rounded text-xs font-mono border border-emerald-700">180° (π)</button>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT OVERLAY */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Proof</p>
            <p className="text-white text-base leading-relaxed">
              You wrapped <span className="text-blue-400 font-bold">3</span> full radius segments along the edge. The remaining sliver is exactly <span className="text-purple-400 font-bold font-mono">0.14159...</span> radius lengths[cite: 16].
            </p>
            <div className="mt-3 text-emerald-300 font-mono text-xl font-bold bg-emerald-950/50 py-2 rounded-lg border border-emerald-900/50">
              π radian = 180°
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 9], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 5, 5]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls 
              enableRotate={false} 
              enablePan={false} 
              enableZoom={false} 
            />

            <group position={[-1, 0, 0]}>
              {/* BASE UNIT CIRCLE */}
              <mesh>
                <ringGeometry args={[RADIUS - 0.02, RADIUS + 0.02, 64]} />
                <meshBasicMaterial color="#44403c" />
              </mesh>
              {/* Origin Point */}
              <mesh>
                <circleGeometry args={[0.08, 16]} />
                <meshBasicMaterial color="#a8a29e" />
              </mesh>
              
              {/* DYNAMIC SHADED SECTOR (The angle swept)[cite: 16] */}
              {radians > 0 && (
                <mesh>
                  {/* CircleGeometry args: radius, segments, thetaStart, thetaLength */}
                  <circleGeometry args={[RADIUS, 64, 0, radians * (isClockwise ? -1 : 1)]} />
                  <meshBasicMaterial color="#10b981" transparent opacity={0.15} side={THREE.DoubleSide} />
                </mesh>
              )}

              {/* RADIUS SEGMENT 1 (0 to 1 rad) */}
              <WrappedArc startAngle={0} endAngle={Math.min(radians, 1)} radius={RADIUS} color="#3b82f6" isClockwise={isClockwise} />
              
              {/* RADIUS SEGMENT 2 (1 to 2 rad) */}
              <WrappedArc startAngle={1} endAngle={Math.min(radians, 2)} radius={RADIUS} color="#ef4444" isClockwise={isClockwise} />
              
              {/* RADIUS SEGMENT 3 (2 to 3 rad) */}
              <WrappedArc startAngle={2} endAngle={Math.min(radians, 3)} radius={RADIUS} color="#eab308" isClockwise={isClockwise} />
              
              {/* THE SLIVER (3 to PI rad)[cite: 16] */}
              <WrappedArc startAngle={3} endAngle={Math.min(radians, PI)} radius={RADIUS} color="#a855f7" isClockwise={isClockwise} />

              {/* THE STRAIGHT UNWRAPPED RADIUS (Hinged at the current arc end) */}
              {radians < PI && (
                <group rotation={[0, 0, radians * (isClockwise ? -1 : 1)]}>
                  <mesh position={[RADIUS, (1 - (radians % 1)) * RADIUS / 2 * (isClockwise ? -1 : 1), 0]}>
                     {/* The remaining straight length shrinks as it wraps */}
                     <boxGeometry args={[0.06, (1 - (radians % 1)) * RADIUS, 0.06]} />
                     <meshStandardMaterial 
                        color="#ffffff" 
                        emissive="#ffffff" 
                        emissiveIntensity={0.5} 
                     />
                  </mesh>
                </group>
              )}

              {/* LABELS */}
              <Text position={[RADIUS / 2, -0.3, 0]} fontSize={0.3} color="#a8a29e">r</Text>
              
              {/* Dynamic Angle Label */}
              {radians > 0.2 && (
                <Text 
                  position={[
                    Math.cos(radians / 2 * (isClockwise ? -1 : 1)) * 1.5, 
                    Math.sin(radians / 2 * (isClockwise ? -1 : 1)) * 1.5, 
                    0
                  ]} 
                  fontSize={0.4} 
                  color="#10b981"
                >
                  θ
                </Text>
              )}
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.3} far={10} position={[0, -4, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}