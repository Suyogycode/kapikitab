'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// ANIMATED GEOMETRY BLOCK
// ==================================================================
function AnimatedBlock({
  targetPos,
  targetScale,
  targetOpacity,
  color,
  label,
  labelPos,
  showLabel
}: {
  targetPos: [number, number, number];
  targetScale: [number, number, number];
  targetOpacity: number;
  color: string;
  label: string;
  labelPos: [number, number, number];
  showLabel: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const textRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(...targetPos), delta * 5);
      meshRef.current.scale.lerp(new THREE.Vector3(...targetScale), delta * 5);
    }
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, delta * 5);
    }
    if (textRef.current) {
      textRef.current.position.lerp(new THREE.Vector3(...labelPos), delta * 5);
      // Fade text out if block is hidden
      const textMat = textRef.current.children[0] as any; // Access Troika text material
      if (textMat && textMat.material) {
         textMat.material.opacity = THREE.MathUtils.lerp(textMat.material.opacity, showLabel && targetOpacity > 0.1 ? 1 : 0, delta * 5);
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial ref={materialRef} color={color} transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={textRef}>
        <Billboard>
          <Text fontSize={0.4} color="#ffffff" fontWeight="bold" fillOpacity={0}>
            {label}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function FirstPrincipleForge() {
  const [phase, setPhase] = useState<number>(0);
  const [h, setH] = useState<number>(2.0);
  
  const X = 4; // Base side length x = 4

  const isAhaMoment = phase >= 3;

  const handleNext = () => {
    if (phase < 4) {
      setPhase(phase + 1);
      if (phase === 3) setH(2.0); // Reset h before entering limit phase
    } else {
      setPhase(0);
      setH(2.0);
    }
  };

  // --- TARGET STATE CALCULATIONS ---

  // 1. Base Square (Area = x^2)
  const baseOpacity = phase >= 2 ? 0 : 0.8;
  const basePos: [number, number, number] = [X/2, X/2, 0];
  const baseScale: [number, number, number] = [X, X, 1];

  // 2. Right Strip (Area = xh -> Length = x)
  const rightOpacity = phase >= 1 ? 0.8 : 0;
  const rightPos: [number, number, number] = phase >= 3 ? [X/2, 0, 0] : [X + h/2, X/2, 0];
  const rightScale: [number, number, number] = phase >= 3 ? [X, 0.5, 1] : [h, X, 1];
  const rightLabelPos: [number, number, number] = phase >= 3 ? [X/2, -0.6, 0] : [X + h/2 + 0.6, X/2, 0];
  const rightLabel = phase >= 3 ? "x" : "xh";

  // 3. Top Strip (Area = xh -> Length = x)
  const topOpacity = phase >= 1 ? 0.8 : 0;
  const topPos: [number, number, number] = phase >= 3 ? [X + X/2, 0, 0] : [X/2, X + h/2, 0];
  const topScale: [number, number, number] = phase >= 3 ? [X, 0.5, 1] : [X, h, 1];
  const topLabelPos: [number, number, number] = phase >= 3 ? [X + X/2, -0.6, 0] : [X/2, X + h/2 + 0.6, 0];
  const topLabel = phase >= 3 ? "x" : "xh";

  // 4. Corner Square (Area = h^2 -> Length = h)
  const cornerOpacity = phase >= 1 ? (h > 0.01 ? 0.8 : 0) : 0;
  const cornerPos: [number, number, number] = phase >= 3 ? [X + X + h/2, 0, 0] : [X + h/2, X + h/2, 0];
  const cornerScale: [number, number, number] = phase >= 3 ? [Math.max(0.001, h), 0.5, 1] : [Math.max(0.001, h), Math.max(0.001, h), 1];
  const cornerLabelPos: [number, number, number] = phase >= 3 ? [X + X + h/2, -0.6, 0] : [X + h/2 + 0.6, X + h/2 + 0.6, 0];
  const cornerLabel = phase >= 3 ? "h" : "h²";

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The First Principle Forge</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            {String.raw`Geometric derivation of $f'(x) = \lim_{h\to0} \frac{f(x+h)-f(x)}{h}$ for $f(x) = x^2$.`}
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Calculus Engine</span>
            <span className="text-blue-400 font-mono text-xs font-bold">Phase {phase}/4</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${phase === 0 ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' : 'border-stone-800 text-stone-600'}`}>
              Base Area: $f(x) = x^2$
            </div>
            <div className={`p-2 rounded border ${phase === 1 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-600'}`}>
              +h Expansion: $f(x+h)$
            </div>
            <div className={`p-2 rounded border ${phase === 2 ? 'border-red-500/50 text-red-400 bg-red-950/30' : 'border-stone-800 text-stone-600'}`}>
              Numerator: $f(x+h) - f(x)$
            </div>
            <div className={`p-2 rounded border ${phase === 3 ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              Divide by h: $2x + h$
            </div>
            <div className={`p-2 rounded border ${phase === 4 ? 'border-purple-500/50 text-purple-400 bg-purple-950/30' : 'border-stone-800 text-stone-600'}`}>
              Limit as $h \to 0$: $2x$
            </div>
          </div>

          {phase === 4 && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-1 text-stone-300 font-mono text-sm">
                <span>Shrink interval ($h$)</span>
                <span className="font-bold text-purple-400">{h.toFixed(3)}</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.01" value={h} 
                onChange={(e) => setH(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          )}

          <button 
            onClick={handleNext}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 4 && h > 0.05 ? 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
            disabled={phase === 4 && h > 0.05}
          >
            {phase === 0 ? 'Expand +h' : phase === 1 ? 'Subtract f(x)' : phase === 2 ? 'Divide by h' : phase === 3 ? 'Apply Limit' : 'Reset Forge'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-purple-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-2">Dimensional Unwrapping</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Dividing by $h$ visually flattens the border into a 1D line of length $2x + h$[cite: 20]. Twisting the dial pushes $h \to 0$, causing the tiny $h$ segment to physically vaporize, leaving exactly $2x$[cite: 20].
          </p>
          <div className="inline-block bg-purple-950/50 px-6 py-2 rounded-lg border border-purple-900/50 font-mono text-base font-bold text-white">
            {String.raw`The power rule ($nx^{n-1}$) is no longer a magic trick; it is the physical unwrapping of a geometric shape.`}
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [5, -4, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 15]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <group position={[-5, -2, 0]}>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[40, 40, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[5, 5, -0.2]} />
              
              {/* X and Y Axes */}
              <Line points={[[-5, 0, -0.1], [15, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
              <Line points={[[0, -2, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />

              {/* 1. Base x^2 Square */}
              <AnimatedBlock 
                targetPos={basePos} targetScale={baseScale} targetOpacity={baseOpacity} 
                color="#3b82f6" label="x²" labelPos={[X/2, X/2, 0]} showLabel={phase === 0} 
              />
              
              {/* 2. Right xh Strip */}
              <AnimatedBlock 
                targetPos={rightPos} targetScale={rightScale} targetOpacity={rightOpacity} 
                color="#10b981" label={rightLabel} labelPos={rightLabelPos} showLabel={phase >= 1} 
              />

              {/* 3. Top xh Strip */}
              <AnimatedBlock 
                targetPos={topPos} targetScale={topScale} targetOpacity={topOpacity} 
                color="#10b981" label={topLabel} labelPos={topLabelPos} showLabel={phase >= 1} 
              />

              {/* 4. Corner h^2 Square */}
              <AnimatedBlock 
                targetPos={cornerPos} targetScale={cornerScale} targetOpacity={cornerOpacity} 
                color="#f59e0b" label={cornerLabel} labelPos={cornerLabelPos} showLabel={phase >= 1 && h > 0.05} 
              />

              {/* Dynamic Dimensions Bracket for the flattened line */}
              {phase >= 3 && (
                <group position={[0, -1.2, 0]}>
                  <Line points={[[0, 0, 0], [0, -0.5, 0], [X * 2 + h, -0.5, 0], [X * 2 + h, 0, 0]] as [number, number, number][]} color="#94a3b8" />
                  <Billboard position={[X + h/2, -1, 0]}>
                    <Text fontSize={0.5} color="#cbd5e1" fontWeight="bold">
                      {phase === 3 ? "2x + h" : (h < 0.05 ? "2x" : "2x + h")}
                    </Text>
                  </Billboard>
                </group>
              )}
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -6, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}