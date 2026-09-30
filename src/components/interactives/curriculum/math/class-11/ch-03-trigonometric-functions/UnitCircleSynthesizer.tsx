'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function UnitCircleSynthesizer() {
  const [angleDeg, setAngleDeg] = useState<number>(45);

  const SCALE = 3; // Visual scale multiplier for the unit circle
  
  // Mathematical values
  const angleRad = (angleDeg * Math.PI) / 180;
  const a = Math.cos(angleRad); // Cosine
  const b = Math.sin(angleRad); // Sine

  // Scaled 3D coordinates
  const px = a * SCALE;
  const py = b * SCALE;

  // Determine active quadrant
  const getQuadrant = () => {
    let q = 1;
    if (angleDeg > 90 && angleDeg <= 180) q = 2;
    else if (angleDeg > 180 && angleDeg <= 270) q = 3;
    else if (angleDeg > 270 && angleDeg < 360) q = 4;
    return q;
  };

  const quadrant = getQuadrant();

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Unit Circle Synthesizer</h2>
        <p className="text-stone-400 text-sm max-w-2xl mb-4">
          Redefining trigonometric ratios as functions using a point P(a,b) on a unit circle[cite: 17].
        </p>

        {/* CONTROLS */}
        <div className="pointer-events-auto bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md max-w-md shadow-xl">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-stone-400 font-mono text-sm">Move Point P:</span>
            <span className="text-white font-mono font-bold">{angleDeg}°</span>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="359" 
            step="1" 
            value={angleDeg} 
            onChange={(e) => setAngleDeg(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between mt-4 text-xs font-mono">
            <div className="flex flex-col items-center p-2 bg-blue-950/40 border border-blue-900/50 rounded-lg w-1/2 mr-1">
              <span className="text-blue-400">cos(x) = a</span>
              <span className={`text-lg font-bold ${a >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {a.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-950/40 border border-purple-900/50 rounded-lg w-1/2 ml-1">
              <span className="text-purple-400">sin(x) = b</span>
              <span className={`text-lg font-bold ${b >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {b.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/95 border border-stone-700 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <p className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-2">Quadrant {quadrant} Analysis</p>
          <p className="text-stone-300 text-sm leading-relaxed mb-3">
            Watch the shadows cross the origin[cite: 17]. The X-axis projection (cosine) is currently <strong className={a >= 0 ? 'text-emerald-400' : 'text-red-400'}>{a >= 0 ? 'Positive' : 'Negative'}</strong>, and the Y-axis projection (sine) is currently <strong className={b >= 0 ? 'text-emerald-400' : 'text-red-400'}>{b >= 0 ? 'Positive' : 'Negative'}</strong>.
          </p>
          <div className="flex justify-center gap-4 font-mono text-sm">
            <span className={a >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              a {a >= 0 ? '>' : '<'} 0
            </span>
            <span className="text-stone-500">|</span>
            <span className={b >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              b {b >= 0 ? '>' : '<'} 0
            </span>
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 5, 5]} intensity={1.5} />
            <Environment preset="city" />
            
            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2} 
              minDistance={4} 
              maxDistance={15} 
            />

            <group>
              {/* AXES */}
              <Line points={[[-SCALE - 1, 0, 0], [SCALE + 1, 0, 0]]} color="#57534e" lineWidth={2} />
              <Line points={[[0, -SCALE - 1, 0], [0, SCALE + 1, 0]]} color="#57534e" lineWidth={2} />
              
              <Text position={[SCALE + 1.5, 0, 0]} fontSize={0.3} color="#a8a29e" anchorX="center" anchorY="middle">X</Text>
              <Text position={[0, SCALE + 1.5, 0]} fontSize={0.3} color="#a8a29e" anchorX="center" anchorY="middle">Y</Text>

              {/* UNIT CIRCLE TRACK (a² + b² = 1)[cite: 17] */}
              <mesh>
                <ringGeometry args={[SCALE - 0.02, SCALE + 0.02, 64]} />
                <meshBasicMaterial color="#78716c" transparent opacity={0.5} />
              </mesh>

              {/* THE POINT P(a,b) */}
              <mesh position={[px, py, 0.1]}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
              </mesh>
              <Text position={[px + 0.4, py + 0.4, 0]} fontSize={0.3} color="#10b981" anchorX="center" anchorY="middle">
                P(a, b)
              </Text>

              {/* ORTHOGONAL LASER PROJECTIONS[cite: 17] */}
              {/* To X-Axis (Cosine shadow) */}
              <Line points={[[px, py, 0], [px, 0, 0]]} color="#60a5fa" lineWidth={1.5} dashed dashScale={10} />
              <Line points={[[0, 0, 0], [px, 0, 0]]} color="#3b82f6" lineWidth={8} />
              <Text position={[px / 2, -0.4, 0]} fontSize={0.3} color="#60a5fa" anchorX="center" anchorY="middle">
                a = cos(x)
              </Text>

              {/* To Y-Axis (Sine shadow) */}
              <Line points={[[px, py, 0], [0, py, 0]]} color="#c084fc" lineWidth={1.5} dashed dashScale={10} />
              <Line points={[[0, 0, 0], [0, py, 0]]} color="#a855f7" lineWidth={8} />
              <Text position={[-0.7, py / 2, 0]} fontSize={0.3} color="#c084fc" anchorX="center" anchorY="middle">
                b = sin(x)
              </Text>
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.3} far={10} position={[0, -5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}