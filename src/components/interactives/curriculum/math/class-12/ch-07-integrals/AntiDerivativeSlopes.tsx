'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'idle' | 'slope_field' | 'reconstructing' | 'aha_moment';

// ==================================================================
// MATH FUNCTIONS
// ==================================================================
// Derivative function: f(x) = 2x
// Parent function: F(x) = x^2 + C

const f = (x: number) => 2 * x;
const F = (x: number, c: number) => Math.pow(x, 2) + c;

// ==================================================================
// 3D SCENE COMPONENT (Must be inside Canvas)
// ==================================================================
function IntegralScene({ phase, constantC }: { phase: Phase, constantC: number }) {
  const traceRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Mesh>(null);
  const [traceProgress, setTraceProgress] = useState(0);

  // 1. Generate the Derivative Curve (y = 2x)
  const derivativePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -5; x <= 5; x += 0.1) {
      pts.push([x, f(x), -0.5]); // Push slightly back in Z space
    }
    return pts;
  }, []);

  // 2. Generate the Slope Field based on dy/dx = 2x[cite: 22]
  const slopeFieldLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let x = -4; x <= 4; x += 0.5) {
      for (let y = -2; y <= 10; y += 1) {
        const slope = f(x);
        const angle = Math.atan(slope);
        const length = 0.25;
        const dx = Math.cos(angle) * length;
        const dy = Math.sin(angle) * length;
        lines.push([
          [x - dx, y - dy, 0],
          [x + dx, y + dy, 0]
        ]);
      }
    }
    return lines;
  }, []);

  // 3. Generate the Parent Curve F(x) = x^2 + C
  const parentCurvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      pts.push([x, F(x, constantC), 0.1]);
    }
    return pts;
  }, [constantC]);

  useFrame((_, delta) => {
    if (phase === 'reconstructing') {
      // Animate the particle tracing the curve[cite: 22]
      if (traceProgress < 1) {
        setTraceProgress(Math.min(1, traceProgress + delta * 0.4));
      }
    } else if (phase === 'aha_moment') {
      setTraceProgress(1); // Fully drawn
    } else {
      setTraceProgress(0); // Reset
    }

    if (particleRef.current && traceProgress > 0) {
      // Map progress 0-1 to x-coordinates -4 to 4
      const currentX = -4 + traceProgress * 8;
      const currentY = F(currentX, constantC);
      particleRef.current.position.set(currentX, currentY, 0.1);
    }
  });

  // Calculate visible portion of the reconstructed curve
  const visiblePointsCount = Math.max(2, Math.floor(traceProgress * parentCurvePoints.length));
  const visibleParentPoints = parentCurvePoints.slice(0, visiblePointsCount);

  return (
    <group>
      {/* 2D Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 4, -0.6]} />
      <Line points={[[-10, 0, -0.55], [10, 0, -0.55]] as [number, number, number][]} color="#475569" lineWidth={2} />
      <Line points={[[0, -6, -0.55], [0, 14, -0.55]] as [number, number, number][]} color="#475569" lineWidth={2} />

      {/* DERIVATIVE CURVE: f(x) = 2x[cite: 22] */}
      {phase === 'idle' && (
        <group>
          <Line points={derivativePoints} color="#ef4444" lineWidth={3} />
          <Billboard position={[4.5, 9, -0.5]}>
            <Text fontSize={0.6} color="#ef4444" fontWeight="bold">f(x) = 2x</Text>
          </Billboard>
        </group>
      )}

      {/* SLOPE FIELD[cite: 22] */}
      {(phase === 'slope_field' || phase === 'reconstructing' || phase === 'aha_moment') && (
        <group>
          {slopeFieldLines.map((line, i) => (
            <Line key={i} points={line} color="#3b82f6" lineWidth={2} transparent opacity={0.4} />
          ))}
        </group>
      )}

      {/* RECONSTRUCTED PARENT CURVE: F(x) = x^2 + C[cite: 22] */}
      {(phase === 'reconstructing' || phase === 'aha_moment') && traceProgress > 0 && (
        <group ref={traceRef}>
          <Line points={visibleParentPoints} color="#fcd34d" lineWidth={5} />
          
          {/* Glowing Trace Particle[cite: 22] */}
          <mesh ref={particleRef}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1} />
          </mesh>

          <Billboard position={[-3, F(-3, constantC) + 1.5, 0.1]}>
            <Text fontSize={0.6} color="#fcd34d" fontWeight="bold">
              F(x) = x² {constantC >= 0 ? `+ ${constantC.toFixed(1)}` : `- ${Math.abs(constantC).toFixed(1)}`}
            </Text>
          </Billboard>
        </group>
      )}

      {/* AHA MOMENT TANGENT INDICATOR */}
      {phase === 'aha_moment' && (
        <group position={[2, F(2, constantC), 0.2]}>
          <Line 
            points={[[-1.5, -1.5 * f(2), 0], [1.5, 1.5 * f(2), 0]] as [number, number, number][]} 
            color="#10b981" 
            lineWidth={4} 
          />
          <mesh>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <Billboard position={[2, 1, 0]}>
            <Text fontSize={0.4} color="#10b981">Slope = 4 (Constant)</Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AntiDerivativeSlopes() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [constantC, setConstantC] = useState<number>(0);

  const advancePhase = () => {
    if (phase === 'idle') setPhase('slope_field');
    else if (phase === 'slope_field') setPhase('reconstructing');
    else if (phase === 'reconstructing') setPhase('aha_moment');
    else {
      setPhase('idle');
      setConstantC(0);
    }
  };

  const isAhaMoment = phase === 'aha_moment';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Anti-Derivative Slopes</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Integration accumulates slopes to reconstruct the original curve[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Integration Engine</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${phase === 'idle' ? 'border-red-500/50 text-red-400 bg-red-950/30' : 'border-stone-800 text-stone-600'}`}>
              1. Original Derivative: f(x) = 2x[cite: 22]
            </div>
            <div className={`p-2 rounded border ${phase === 'slope_field' ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              2. Map Slope Field (Tangent Vectors)[cite: 22]
            </div>
            <div className={`p-2 rounded border ${phase === 'reconstructing' ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              3. Trace Flow to Reconstruct F(x)[cite: 22]
            </div>
            <div className={`p-2 rounded border ${phase === 'aha_moment' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-600'}`}>
              4. Define Constant of Integration (+C)[cite: 22]
            </div>
          </div>

          {phase === 'aha_moment' && (
            <div className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-950/30 mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-400 font-bold text-sm">Shift Constant (+C)[cite: 22]</span>
                <span className="text-emerald-200 font-mono">C = {constantC.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-3" max="5" step="0.5" 
                value={constantC} 
                onChange={(e) => setConstantC(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          <button 
            onClick={advancePhase}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'aha_moment' ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}
          >
            {phase === 'idle' ? 'Generate Slope Field' : 
             phase === 'slope_field' ? 'Reconstruct Curve' : 
             phase === 'reconstructing' ? 'Unlock Integration Constant' : 'Reset System'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">The Integration Constant (+C) Proven</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As you shift the curve upward and downward, cycling through x^2 + 1, x^2 - 3, and x^2 + C, the tangent slope at any given x-coordinate remains completely identical across all variations[cite: 22].
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-sm font-bold text-emerald-300">
            This visually proves why the constant of integration (+C) is mandatory: an infinite number of vertical shifts share the exact same derivative profile[cite: 22].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <IntegralScene phase={phase} constantC={constantC} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}