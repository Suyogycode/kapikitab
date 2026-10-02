'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'tracing_left' | 'lifting' | 'tracing_right';

// ==================================================================
// 3D PEN COMPONENT
// ==================================================================
function VirtualPen({ 
  targetX, 
  setPhase 
}: { 
  targetX: number;
  setPhase: (phase: Phase) => void;
}) {
  const penGroupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Group>(null);
  const [trailPoints, setTrailPoints] = useState<[number, number, number][]>([]);

  // Function definition: f(x) = 1 for x <= 0, f(x) = 2 for x > 0[cite: 20]
  const getFofX = (x: number) => (x <= 0 ? 1 : 2);

  useFrame((_, delta) => {
    if (!penGroupRef.current) return;

    const currentX = penGroupRef.current.position.x;
    const targetY = getFofX(targetX);
    const currentY = penGroupRef.current.position.y;
    
    // Determine if we are crossing the discontinuity (x = 0)
    const isJumping = Math.abs(targetY - currentY) > 0.1 && Math.abs(currentX) < 0.5;
    
    // If jumping, the pen must physically lift off the paper (Z-axis increase)[cite: 20]
    const targetZ = isJumping ? 2 : 0; 
    const currentZ = penGroupRef.current.position.z;

    // Update Phase for the HUD
    if (currentZ > 0.5) {
      setPhase('lifting');
    } else if (currentX <= 0) {
      setPhase('tracing_left');
    } else {
      setPhase('tracing_right');
    }

    // Smoothly interpolate the pen's position
    penGroupRef.current.position.x = THREE.MathUtils.lerp(currentX, targetX, delta * 8);
    penGroupRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, delta * (isJumping ? 4 : 12));
    penGroupRef.current.position.z = THREE.MathUtils.lerp(currentZ, targetZ, delta * 12);

    // Pen tilt effect based on movement and lift
    const targetRotX = isJumping ? -Math.PI / 4 : -Math.PI / 6;
    const targetRotZ = (targetX - currentX) * -0.5;
    penGroupRef.current.rotation.x = THREE.MathUtils.lerp(penGroupRef.current.rotation.x, targetRotX, delta * 5);
    penGroupRef.current.rotation.z = THREE.MathUtils.lerp(penGroupRef.current.rotation.z, targetRotZ, delta * 5);

    // Leave a glowing ink trail if the pen is touching the paper (Z ≈ 0)
    if (currentZ < 0.1 && Math.abs(targetX - currentX) > 0.01) {
      setTrailPoints(prev => {
        const newPts = [...prev, [currentX, currentY, 0.05] as [number, number, number]];
        if (newPts.length > 100) newPts.shift(); // Keep trail manageable
        return newPts;
      });
    }
  });

  return (
    <group>
      {/* The 3D Pen */}
      <group ref={penGroupRef} position={[-5, 1, 0]} rotation={[-Math.PI / 6, 0, 0]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.02, 3, 16]} />
          <meshStandardMaterial color="#fcd34d" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.03, 0.2, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* The Ink Trail */}
      {trailPoints.length > 1 && (
        <Line points={trailPoints} color="#f59e0b" lineWidth={4} transparent opacity={0.8} />
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function PenLiftSimulator() {
  const [targetX, setTargetX] = useState<number>(-5);
  const [phase, setPhase] = useState<Phase>('tracing_left');

  const isLifted = phase === 'lifting';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Pen-Lift Simulator</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            A function is continuous if it can be drawn without lifting the pen from the paper (lim x-&gt;c f(x) = f(c))[cite: 20].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Continuity Engine</span>
            <span className={isLifted ? "text-red-400 font-mono text-xs font-bold" : "text-emerald-400 font-mono text-xs font-bold"}>
              x = {targetX.toFixed(2)}
            </span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-300">
              <div className="font-bold mb-1">Piecewise Function:</div>
              <div>f(x) = 1 for x &le; 0</div>
              <div>f(x) = 2 for x &gt; 0</div>
            </div>

            {/* LIVE LIMIT BREAKDOWN HUD[cite: 20] */}
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${isLifted ? 'border-red-500/50 bg-red-950/50' : 'border-stone-800 bg-stone-950'}`}>
              <div className="flex justify-between mb-1">
                <span className="text-stone-400">Left-Hand Limit (LHL):</span>
                <span className="text-sky-400 font-bold">1</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-400">Right-Hand Limit (RHL):</span>
                <span className="text-sky-400 font-bold">2</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-stone-800">
                <span className="text-stone-400">Status at x = 0:</span>
                <span className={isLifted ? "text-red-400 font-bold animate-pulse" : "text-stone-500 font-bold"}>
                  {isLifted ? "LHL != RHL" : "Approaching..."}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-950/30">
            <div className="text-emerald-400 font-bold mb-2">Drag Stylus (X-Axis)</div>
            <input 
              type="range" min="-5" max="5" step="0.05" 
              value={targetX} 
              onChange={(e) => setTargetX(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="text-emerald-200 text-xs mt-2 text-center">
              Trace the curve from left to right[cite: 20].
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT RED FLARE[cite: 20] */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-300 ${isLifted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-red-950/95 border-2 border-red-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-in slide-in-from-bottom-4">
          <p className="text-red-400 text-sm uppercase tracking-widest font-bold mb-2 flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
            Discontinuity Detected
          </p>
          <p className="text-red-100 text-sm leading-relaxed mb-2">
            The simulation forces you to physically lift the pen to cross the gap to the upper branch[cite: 20]. 
          </p>
          <div className="inline-block bg-red-900/50 px-6 py-2 rounded-lg border border-red-700 font-mono text-base font-bold text-white">
            Because LHL != RHL, the jump breaks the definition of continuity[cite: 20].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            {/* Lock rotation so the 2D piecewise function remains legible */}
            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <group>
              {/* 2D Coordinate Grid */}
              <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
              <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
              <Line points={[[0, -10, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
              
              <Billboard position={[0.5, 9, 0]}><Text fontSize={0.5} color="#64748b">Y</Text></Billboard>
              <Billboard position={[9, 0.5, 0]}><Text fontSize={0.5} color="#64748b">X</Text></Billboard>
              <Billboard position={[-0.4, -0.4, 0]}><Text fontSize={0.4} color="#64748b">0</Text></Billboard>

              {/* PIECEWISE FUNCTION GRAPH[cite: 20] */}
              {/* Branch 1: x <= 0, y = 1 */}
              <Line points={[[-10, 1, 0], [0, 1, 0]] as [number, number, number][]} color="#38bdf8" lineWidth={4} />
              <mesh position={[0, 1, 0.1]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>

              {/* Branch 2: x > 0, y = 2 */}
              <Line points={[[0.15, 2, 0], [10, 2, 0]] as [number, number, number][]} color="#38bdf8" lineWidth={4} />
              <mesh position={[0, 2, 0.1]}>
                <ringGeometry args={[0.1, 0.15, 16]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
              </mesh>

              {/* The Virtual Pen */}
              <VirtualPen targetX={targetX} setPhase={setPhase} />
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}