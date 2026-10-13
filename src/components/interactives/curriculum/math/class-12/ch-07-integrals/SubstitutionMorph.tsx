'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Billboard, Line } from '@react-three/drei';

type Phase = 'idle' | 'highlight_u' | 'isolate_du' | 'morphing' | 'u_space';

// ==================================================================
// MATH FUNCTIONS
// ==================================================================
// Integral: Int [ 2x * sin(x^2 + 1) ] dx
// Substitution: u = x^2 + 1
// Derivative: du = 2x dx
// Transformed: Int [ sin(u) ] du

const X_MIN = -2.5;
const X_MAX = 2.5;
const POINTS_COUNT = 200;

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function MorphScene({ phase }: { phase: Phase }) {
  const lineGeomRef = useRef<THREE.BufferGeometry>(null);
  const uLabelRef = useRef<THREE.Group>(null);
  const xLabelRef = useRef<THREE.Group>(null);
  
  // Track morph progress (0 = x-space, 1 = u-space)
  const morphProgress = useRef(0);

  // Pre-calculate source (x-space) and target (u-space) points
  const pointsData = useMemo(() => {
    const src = [];
    const tgt = [];
    const step = (X_MAX - X_MIN) / POINTS_COUNT;
    
    for (let i = 0; i <= POINTS_COUNT; i++) {
      const x = X_MIN + i * step;
      const u = x * x + 1; // u = x^2 + 1
      
      // x-space: y = 2x * sin(x^2 + 1)
      const y_x = 2 * x * Math.sin(u);
      src.push(new THREE.Vector3(x, y_x, 0));
      
      // u-space: horizontal axis is u, vertical is sin(u)
      const y_u = Math.sin(u);
      tgt.push(new THREE.Vector3(u, y_u, 0));
    }
    return { src, tgt };
  }, []);

  useFrame((_, delta) => {
    if (!lineGeomRef.current) return;

    // Determine target progress based on phase
    const targetProgress = (phase === 'morphing' || phase === 'u_space') ? 1 : 0;
    
    // Smoothly animate the morphing variable
    morphProgress.current = THREE.MathUtils.lerp(morphProgress.current, targetProgress, delta * 3);

    // Update line geometry vertices
    const positions = lineGeomRef.current.attributes.position.array as Float32Array;
    
    for (let i = 0; i <= POINTS_COUNT; i++) {
      const srcPt = pointsData.src[i];
      const tgtPt = pointsData.tgt[i];
      
      positions[i * 3] = THREE.MathUtils.lerp(srcPt.x, tgtPt.x, morphProgress.current);
      positions[i * 3 + 1] = THREE.MathUtils.lerp(srcPt.y, tgtPt.y, morphProgress.current);
      positions[i * 3 + 2] = THREE.MathUtils.lerp(srcPt.z, tgtPt.z, morphProgress.current);
    }
    
    lineGeomRef.current.attributes.position.needsUpdate = true;

    // Fade labels based on morph progress
    if (xLabelRef.current && uLabelRef.current) {
      xLabelRef.current.position.y = THREE.MathUtils.lerp(0.5, -2, morphProgress.current);
      uLabelRef.current.position.y = THREE.MathUtils.lerp(-2, 0.5, morphProgress.current);
    }
  });

  return (
    <group position={[-1, 0, 0]}>
      {/* Dynamic Coordinate Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[1, 0, -0.6]} />
      <Line points={[[-10, 0, -0.1], [12, 0, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
      <Line points={[[0, -10, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
      
      {/* Axis Labels */}
      <group ref={xLabelRef}>
        <Billboard position={[8, 0, 0]}><Text fontSize={0.6} color="#94a3b8">X-Axis</Text></Billboard>
      </group>
      <group ref={uLabelRef}>
        <Billboard position={[8, 0, 0]}><Text fontSize={0.6} color="#38bdf8" fontWeight="bold">U-Axis (u = x² + 1)</Text></Billboard>
      </group>

      {/* The Morphing Function Line */}
      <line>
        <bufferGeometry ref={lineGeomRef}>
          <bufferAttribute 
            attach="attributes-position" 
            args={[new Float32Array((POINTS_COUNT + 1) * 3), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#fcd34d" linewidth={4} />
      </line>

      {/* Floating Sparkles to emphasize the curve */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SubstitutionMorph() {
  const [phase, setPhase] = useState<Phase>('idle');

  const advanceSequence = () => {
    if (phase === 'idle') setPhase('highlight_u');
    else if (phase === 'highlight_u') setPhase('isolate_du');
    else if (phase === 'isolate_du') {
      setPhase('morphing');
      setTimeout(() => setPhase('u_space'), 1500); // Auto transition after morph
    }
    else if (phase === 'u_space') setPhase('idle');
  };

  const isAhaMoment = phase === 'u_space';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Substitution Morph</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Integration by substitution transforms a complex integral into a standard form by changing the independent variable.
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Variable Transformer</span>
          </div>
          
          {/* EQUATION DISPLAY */}
          <div className="bg-stone-950 p-4 rounded-lg border border-stone-700 mb-6 font-mono text-center flex flex-col gap-2">
            
            {/* The Integral */}
            <div className="text-lg">
              <span className="text-stone-400">Integral [ </span>
              <span className={`transition-colors duration-500 ${phase === 'isolate_du' ? 'text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : (phase === 'morphing' || phase === 'u_space') ? 'opacity-0' : 'text-stone-200'}`}>
                2x
              </span>
              <span className={`transition-colors duration-500 ${phase === 'morphing' || phase === 'u_space' ? 'text-amber-400' : 'text-stone-200'}`}>
                {' * sin('}
              </span>
              <span className={`transition-colors duration-500 ${phase === 'highlight_u' || phase === 'isolate_du' ? 'text-sky-400 font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : phase === 'morphing' || phase === 'u_space' ? 'text-sky-400 font-bold' : 'text-stone-200'}`}>
                {phase === 'morphing' || phase === 'u_space' ? 'u' : 'x² + 1'}
              </span>
              <span className={`transition-colors duration-500 ${phase === 'morphing' || phase === 'u_space' ? 'text-amber-400' : 'text-stone-200'}`}>
                {') '}
              </span>
              <span className={`transition-colors duration-500 ${phase === 'isolate_du' ? 'text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : phase === 'morphing' || phase === 'u_space' ? 'text-emerald-400 font-bold' : 'text-stone-200'}`}>
                {phase === 'morphing' || phase === 'u_space' ? 'du' : 'dx'}
              </span>
              <span className="text-stone-400"> ]</span>
            </div>

            {/* Substitution Variables Tracker */}
            <div className="flex justify-around text-xs mt-2 border-t border-stone-800 pt-2">
              <span className={`transition-opacity duration-500 ${phase === 'idle' ? 'opacity-30' : 'opacity-100 text-sky-400'}`}>
                u = x² + 1
              </span>
              <span className={`transition-opacity duration-500 ${phase === 'idle' || phase === 'highlight_u' ? 'opacity-30' : 'opacity-100 text-emerald-400'}`}>
                du = 2x dx
              </span>
            </div>
          </div>

          <button 
            onClick={advanceSequence}
            disabled={phase === 'morphing'}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'morphing' ? 'bg-stone-800 text-stone-500 border-stone-700' : phase === 'u_space' ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]'}`}
          >
            {phase === 'idle' ? 'Highlight Inner Function (u)' : 
             phase === 'highlight_u' ? 'Isolate Derivative (du)' : 
             phase === 'isolate_du' ? 'Confirm Substitution Morph' : 
             phase === 'morphing' ? 'Transforming...' : 'Reset Graph'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-1000 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(147,51,234,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Coordinate System Transformation</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            When you confirmed the substitution, the complex function physically re-scaled its coordinate grid.
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The twisted, convoluted x-space graph clearly folded over and unwrapped itself into a simple, linear u-space graph: <span className="text-amber-400 font-mono">Integral [ sin(u) ] du</span>.
          </p>
          <div className="inline-block bg-purple-950/50 px-6 py-2 rounded-lg border border-purple-900/50 font-mono text-sm font-bold text-purple-300">
            Substitution is not just an algebra trick; it is a spatial warp that flattens a tangled problem into a standard, solvable form.
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} />

            <MorphScene phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -0.5, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}