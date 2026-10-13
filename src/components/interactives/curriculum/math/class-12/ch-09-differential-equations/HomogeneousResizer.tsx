'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard, Line } from '@react-three/drei';

type Phase = 'scaling' | 'folded';

// ==================================================================
// 3D SURFACE COMPONENT
// ==================================================================
function HomogeneousSurface({ lambda, phase }: { lambda: number, phase: Phase }) {
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  const surfaceGroupRef = useRef<THREE.Group>(null);
  const axesRef = useRef<THREE.Group>(null);
  const morphProgress = useRef(0);

  useFrame((_, delta) => {
    if (!geomRef.current || !surfaceGroupRef.current || !axesRef.current) return;

    // Smoothly animate the morphing phase
    const targetProgress = phase === 'folded' ? 1 : 0;
    morphProgress.current = THREE.MathUtils.lerp(morphProgress.current, targetProgress, delta * 4);

    // Update PlaneGeometry vertices to stretch with lambda and fold into 2D
    const pos = geomRef.current.attributes.position.array as Float32Array;
    const uvs = geomRef.current.attributes.uv.array as Float32Array;

    for (let i = 0; i < pos.length / 3; i++) {
      const uvX = uvs[i * 2];
      const uvY = uvs[i * 2 + 1];

      // Base parameters: u in [0.1, 1], w in [-1, 1]
      const u = 0.1 + uvX * 0.9;
      const w = -1 + uvY * 2;

      // Base coordinates
      const x_base = u * 5;
      const y_base = w * 5;

      // Scaled coordinates based on lambda
      const x_scaled = x_base * lambda;
      const y_scaled = y_base * lambda;

      // Homogeneous Function: Z = (x^2 - y^2) / (x^2 + y^2)[cite: 21]
      // Note: Because it's homogeneous degree 0, Z only depends on v = y/x = w/u
      const v = w / u;
      const z_height = 3 * (1 - v * v) / (1 + v * v);

      // 3D coordinates (Y is up in R3F, so we map Z to Y, and y to -Z)[cite: 21]
      const target3D_X = x_scaled;
      const target3D_Y = z_height;
      const target3D_Z = -y_scaled;

      // 2D folded coordinates (v vs z_height mapped flat on the XY plane)[cite: 21]
      // We scale v visually to fit the screen
      const target2D_X = v * 3;
      const target2D_Y = z_height;
      const target2D_Z = 0;

      // Interpolate based on morph progress[cite: 21]
      pos[i * 3] = THREE.MathUtils.lerp(target3D_X, target2D_X, morphProgress.current);
      pos[i * 3 + 1] = THREE.MathUtils.lerp(target3D_Y, target2D_Y, morphProgress.current);
      pos[i * 3 + 2] = THREE.MathUtils.lerp(target3D_Z, target2D_Z, morphProgress.current);
    }
    
    geomRef.current.attributes.position.needsUpdate = true;
    geomRef.current.computeVertexNormals();

    // Adjust global group positioning and scale for camera framing[cite: 21]
    const targetGroupScale = phase === 'folded' ? 1.5 : 0.8;
    const targetGroupX = phase === 'folded' ? 0 : -3;
    surfaceGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(surfaceGroupRef.current.scale.x, targetGroupScale, delta * 3));
    surfaceGroupRef.current.position.x = THREE.MathUtils.lerp(surfaceGroupRef.current.position.x, targetGroupX, delta * 3);

    // Fade and scale the 3D axes when folding[cite: 21]
    axesRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.01, morphProgress.current));
  });

  return (
    <group>
      {/* Dynamic 3D Axes that grow with Lambda */}
      <group ref={axesRef}>
        <Line points={[[-10, 0, 0], [15, 0, 0]] as [number, number, number][]} color="#ef4444" lineWidth={2} />
        <Line points={[[0, 0, -15], [0, 0, 15]] as [number, number, number][]} color="#3b82f6" lineWidth={2} />
        <Billboard position={[12, 0.5, 0]}><Text fontSize={0.8} color="#ef4444">X</Text></Billboard>
        <Billboard position={[0.5, 0.5, -12]}><Text fontSize={0.8} color="#3b82f6">Y</Text></Billboard>
      </group>

      {/* Folded 2D Axes (v-axis) */}
      {phase === 'folded' && (
        <group position={[0, 0, -0.5]}>
          <Line points={[[-10, 0, 0], [10, 0, 0]] as [number, number, number][]} color="#10b981" lineWidth={2} />
          <Billboard position={[6, 0.5, 0]}><Text fontSize={0.6} color="#10b981" fontWeight="bold">v-Axis (v = y/x)</Text></Billboard>
        </group>
      )}

      {/* The Morphing Homogeneous Surface */}
      <group ref={surfaceGroupRef}>
        <mesh>
          {/* We use a highly subdivided plane to allow smooth vertex morphing */}
          <planeGeometry args={[1, 1, 64, 64]} ref={geomRef} />
          <meshStandardMaterial color="#8b5cf6" side={THREE.DoubleSide} transparent opacity={0.9} roughness={0.2} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function HomogeneousResizer() {
  const [lambda, setLambda] = useState(1);
  const [phase, setPhase] = useState<Phase>('scaling');

  const isFolded = phase === 'folded';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Homogeneous Resizer</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            A differential equation is homogeneous if replacing x and y with lambda*x and lambda*y results in the original function.
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Substitution Engine</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className={`p-3 rounded-lg border transition-colors ${!isFolded ? 'border-purple-500/50 bg-purple-950/30 text-purple-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Function F(x, y)</div>
              <div>F(lambda*x, lambda*y) = F(x, y)</div>
              <div className="text-xs mt-1 opacity-80">Relative slope refuses to change under scaling.</div>
            </div>

            <div className={`p-3 rounded-lg border transition-colors ${isFolded ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="font-bold mb-1">Variable Separated</div>
              <div>v = y/x</div>
              <div className="text-xs mt-1 opacity-80">Surface folds into 2D plane separated by v and x.</div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-sky-500/50 bg-sky-950/30 mb-4">
            <div className="flex justify-between text-sky-400 font-bold mb-2 text-xs">
              <span>Scale (lambda)</span>
              <span>{lambda.toFixed(1)}x</span>
            </div>
            <input 
              type="range" min="0.5" max="2.5" step="0.1" 
              value={lambda} 
              onChange={(e) => {
                setLambda(parseFloat(e.target.value));
                if (phase === 'folded') setPhase('scaling');
              }}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <button 
            onClick={() => setPhase(isFolded ? 'scaling' : 'folded')}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${isFolded ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {isFolded ? 'Reset Topology' : 'Substitute y = vx'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isFolded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Dimensionality Reduced</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Because the ratio between y and x never changes under scaling, the entire complex system can be driven by a single new variable representing that ratio: v = y/x.
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-emerald-300">
            The massive 3D surface elegantly folds down into a simple 2D plane where the variables v and x cleanly separate to opposite sides of the equation.
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [12, 10, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <HomogeneousSurface lambda={lambda} phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}