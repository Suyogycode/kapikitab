'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// DATA SETS & MATH CALCULATIONS
// ==================================================================
const N = 4;
// We use a simplified dataset where the mean is exactly 0 (the flat 2D plane).
const POINTS = [
  { id: 1, x: -6, dev: 2, color: '#3b82f6' },
  { id: 2, x: -2, dev: -1, color: '#10b981' },
  { id: 3, x: 2, dev: 3, color: '#f59e0b' },
  { id: 4, x: 6, dev: -4, color: '#ef4444' }
];

const SUM_OF_SQUARES = POINTS.reduce((sum, p) => sum + p.dev * p.dev, 0); // 4 + 1 + 9 + 16 = 30
const VARIANCE = SUM_OF_SQUARES / N; // 30 / 4 = 7.5
const STD_DEV = Math.sqrt(VARIANCE); // ~2.738

const GIANT_SQUARE_SIDE = Math.sqrt(SUM_OF_SQUARES);

type Phase = 'scatter' | 'extrude' | 'melt' | 'variance' | 'stddev';

// ==================================================================
// ANIMATED INDIVIDUAL SQUARE
// ==================================================================
function AnimatedDeviationSquare({
  x, dev, color, phase
}: {
  x: number; dev: number; color: string; phase: Phase;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const side = Math.abs(dev);
  const posY = dev / 2; // Center the square between the mean (0) and the point (dev)

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Scale up the square during 'extrude', melt it away during 'melt'
      const targetScale = phase === 'extrude' ? side : 0.001;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * 4);
      
      // Move towards center during melt
      const targetX = (phase === 'melt' || phase === 'variance' || phase === 'stddev') ? 0 : x;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 4);
    }
  });

  return (
    <group>
      {/* 1D Distance Line (visible in scatter phase) */}
      <group>
        <Line points={[[x, 0, 0], [x, dev, 0]] as [number, number, number][]} color={color} lineWidth={2} dashed dashScale={2} />
        <mesh position={[x, dev, 0.1]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* 2D Extruded Square */}
      <mesh ref={meshRef} position={[x, posY, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ==================================================================
// ANIMATED AGGREGATE SQUARE (Must be inside Canvas)
// ==================================================================
function AnimatedAggregate({ phase }: { phase: Phase }) {
  const aggregateRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (aggregateRef.current) {
      let targetScale = 0.001;
      let targetOpacity = 0;

      if (phase === 'melt') {
        targetScale = GIANT_SQUARE_SIDE;
        targetOpacity = 0.8;
      } else if (phase === 'variance' || phase === 'stddev') {
        targetScale = STD_DEV;
        targetOpacity = 0.8;
      }

      aggregateRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * 4);
      aggregateRef.current.position.y = aggregateRef.current.scale.y / 2;
      (aggregateRef.current.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(
        (aggregateRef.current.material as THREE.MeshStandardMaterial).opacity, 
        targetOpacity, 
        delta * 4
      );
    }
  });

  return (
    <group>
      <mesh ref={aggregateRef} position={[0, 0, 0.1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#a855f7" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      
      {/* Standard Deviation 1D Edge Highlight */}
      {phase === 'stddev' && (
        <group position={[0, 0, 0.2]}>
          <Line 
            points={[[-STD_DEV/2, 0, 0], [STD_DEV/2, 0, 0]] as [number, number, number][]} 
            color="#10b981" 
            lineWidth={6} 
          />
          <Billboard position={[0, -0.6, 0]}>
            <Text fontSize={0.6} color="#10b981" fontWeight="bold">σ = {STD_DEV.toFixed(2)}</Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function LeastSquaresForge() {
  const [phase, setPhase] = useState<Phase>('scatter');

  const advancePhase = () => {
    if (phase === 'scatter') setPhase('extrude');
    else if (phase === 'extrude') setPhase('melt');
    else if (phase === 'melt') setPhase('variance');
    else if (phase === 'variance') setPhase('stddev');
    else setPhase('scatter');
  };

  const isAhaMoment = phase === 'stddev' || phase === 'variance' || phase === 'melt';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Least Squares Forge</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Variance squares deviations to overcome negative signs, creating 2D areas instead of 1D lines.
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Dispersion Engine</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">n = 4</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${phase === 'scatter' ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              {String.raw`Deviations: $x_i - \bar{x}$`}
            </div>
            <div className={`p-2 rounded border ${phase === 'extrude' ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              {String.raw`Square Areas: $(x_i - \bar{x})^2$`}
            </div>
            <div className={`p-2 rounded border ${phase === 'melt' ? 'border-red-500/50 text-red-400 bg-red-950/30' : 'border-stone-800 text-stone-600'}`}>
              {String.raw`Sum of Squares: $\Sigma(x_i - \bar{x})^2$ = ${SUM_OF_SQUARES}`}
            </div>
            <div className={`p-2 rounded border ${phase === 'variance' ? 'border-purple-500/50 text-purple-400 bg-purple-950/30' : 'border-stone-800 text-stone-600'}`}>
              Variance ($\sigma^2$): Average Area = {VARIANCE}
            </div>
            <div className={`p-2 rounded border ${phase === 'stddev' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-600'}`}>
              Standard Deviation ($\sigma$): {STD_DEV.toFixed(2)}
            </div>
          </div>

          <button 
            onClick={advancePhase}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'stddev' ? 'bg-stone-800 text-stone-500 border-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {phase === 'scatter' ? 'Extrude Squares' : 
             phase === 'extrude' ? 'Calculate Sum of Squares' : 
             phase === 'melt' ? 'Calculate Variance (Average)' : 
             phase === 'variance' ? 'Calculate σ (Extract Root)' : 'Reset System'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Dimensional Collapse</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            {phase === 'melt' && "The engine sweeps all scattered squares together, melting them down into one giant 2D square representing the total Sum of Squares."}
            {phase === 'variance' && "It slices this giant square into n equal pieces to find the average area—the Variance (σ²)."}
            {phase === 'stddev' && "Finally, the engine highlights just one edge of this average square. The 2D area collapses back into a 1D length, returning the data to its original units—revealing the Standard Deviation (σ)."}
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 5, 22], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 15]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <group>
              {/* THE MEAN PLANE (Flat 2D Plane) */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[40, 10]} />
                <meshBasicMaterial color="#475569" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
              <Line points={[[-20, 0, 0], [20, 0, 0]] as [number, number, number][]} color="#94a3b8" lineWidth={2} />
              <Billboard position={[12, 0.5, 0]}><Text fontSize={0.6} color="#cbd5e1" fontWeight="bold">Mean (x̄)</Text></Billboard>

              {/* INDIVIDUAL DEVIATION SQUARES */}
              {POINTS.map((p) => (
                <AnimatedDeviationSquare 
                  key={p.id} 
                  x={p.x} 
                  dev={p.dev} 
                  color={p.color} 
                  phase={phase} 
                />
              ))}

              {/* AGGREGATE SQUARE (Sum of Squares -> Variance) */}
              <AnimatedAggregate phase={phase} />
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -5, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}