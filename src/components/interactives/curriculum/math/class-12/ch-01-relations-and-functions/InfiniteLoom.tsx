'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'idle' | 'weaving' | 'inspecting';

// ==================================================================
// DATA & MATH SETUP
// ==================================================================
const DOMAIN_X = [1, 2, 3, 4, 5, 6, 7];
const CODOMAIN_Y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

// Spacing constants for the towering pillars
const Y_START = 8;
const Y_STEP = 1.4;
const X_POS = -5; // Domain X position
const Y_POS = 5;  // Codomain Y position

// Mapping function f(x) = 2x
const f = (x: number) => 2 * x;

// ==================================================================
// 3D ENGINE COMPONENTS (Inside Canvas)
// ==================================================================

// The Camera Controller for the "Aha!" Moment[cite: 20]
function LoomCameraController({ phase }: { phase: Phase }) {
  const { camera } = useThree();
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame((_, delta) => {
    if (phase === 'inspecting') {
      // Fly over to the Codomain Y pillar[cite: 20]
      camera.position.lerp(new THREE.Vector3(Y_POS - 2, 0, 12), delta * 2);
      targetLookAt.current.lerp(new THREE.Vector3(Y_POS, 0, 0), delta * 2);
    } else {
      // Default view
      camera.position.lerp(new THREE.Vector3(0, 0, 18), delta * 2);
      targetLookAt.current.lerp(new THREE.Vector3(0, 0, 0), delta * 2);
    }
    camera.lookAt(targetLookAt.current);
  });

  return null;
}

// Glowing energy threads that shoot from X to Y[cite: 20]
function ShootingThread({ 
  startX, startY, endX, endY, delay, phase 
}: { 
  startX: number, startY: number, endX: number, endY: number, delay: number, phase: Phase 
}) {
  const [progress, setProgress] = useState(0);
  const isActive = phase === 'weaving' || phase === 'inspecting';

  useFrame((_, delta) => {
    if (isActive) {
      // Stagger the threading animation
      if (delay > 0) {
        delay -= delta * 10;
      } else if (progress < 1) {
        setProgress(Math.min(1, progress + delta * 3));
      }
    } else {
      setProgress(0);
    }
  });

  if (!isActive || progress === 0) return null;

  const p0 = new THREE.Vector3(startX, startY, 0);
  const p3 = new THREE.Vector3(endX, endY, 0);
  
  // Create a nice hanging curve for the loom
  const p1 = new THREE.Vector3(startX + 3, startY, 0);
  const p2 = new THREE.Vector3(endX - 3, endY, 0);
  
  const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
  const fullPoints = curve.getPoints(40);
  const visiblePoints = fullPoints.slice(0, Math.max(2, Math.floor(progress * 40)));

  return (
    <group>
      <Line points={visiblePoints} color="#38bdf8" lineWidth={3} />
      {/* Thread head glow */}
      <mesh position={visiblePoints[visiblePoints.length - 1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#7dd3fc" />
      </mesh>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function InfiniteLoom() {
  const [phase, setPhase] = useState<Phase>('idle');

  const handleWeave = () => setPhase('weaving');
  const handleInspect = () => setPhase('inspecting');
  const handleReset = () => setPhase('idle');

  const isAhaMoment = phase === 'inspecting';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Infinite Loom</h2>
          <p className="text-stone-400 text-sm max-w-xl">
  Visualizing One-One and Onto functions with f: ℕ → ℕ given by f(x) = 2x.
</p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Loom Controls</span>
            <span className="text-sky-400 font-mono text-xs font-bold">f(x) = 2x</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'weaving' || phase === 'inspecting' ? 'border-sky-500/50 bg-sky-950/30' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="text-sky-400 font-bold mb-1">One-One (Injective) Check</div>
              <div className="text-xs">Distinct inputs $\to$ Distinct outputs[cite: 20]</div>
            </div>
            
            <div className={`p-3 rounded-lg border transition-colors ${phase === 'inspecting' ? 'border-amber-500/50 bg-amber-950/30' : 'border-stone-800 bg-stone-950 text-stone-500'}`}>
              <div className="text-amber-400 font-bold mb-1">Onto (Surjective) Check</div>
              <div className="text-xs">Every element in Codomain is mapped[cite: 20]</div>
            </div>
          </div>

          <button 
            onClick={phase === 'idle' ? handleWeave : phase === 'weaving' ? handleInspect : handleReset}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'inspecting' ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700' : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]'}`}
          >
            {phase === 'idle' ? 'Weave Function' : phase === 'weaving' ? 'Inspect Codomain Y' : 'Reset Loom'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Permanently Dark Sockets</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            All the even sockets are glowing with incoming threads, but every odd socket ($1, 3, 5...$) is permanently dark, completely bypassed by the function[cite: 20]. 
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-white">
            The physical empty spaces on the pillar instantly prove that the function fails the definition of "onto" because elements like $1 \in \mathbbℕ have no preimage[cite: 20].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 20]} intensity={1.5} />
            <Environment preset="city" />
            
            {/* Camera controller component */}
            <LoomCameraController phase={phase} />
            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <group>
              {/* DOMAIN PILLAR X[cite: 20] */}
              <group position={[X_POS, 0, 0]}>
                <Billboard position={[0, Y_START + 1.5, 0]}>
                  <Text fontSize={1.2} color="#94a3b8" fontWeight="bold">Domain X</Text>
                </Billboard>
                {DOMAIN_X.map((x, i) => {
                  const posY = Y_START - (i * Y_STEP);
                  return (
                    <group key={`dom-${x}`} position={[0, posY, 0]}>
                      <mesh>
                        <boxGeometry args={[1.5, 1, 0.5]} />
                        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.2} />
                      </mesh>
                      <Billboard position={[-1.5, 0, 0]}>
                        <Text fontSize={0.6} color="#e2e8f0">{x}</Text>
                      </Billboard>
                      {/* Thread Socket */}
                      <mesh position={[0.76, 0, 0]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshBasicMaterial color={phase !== 'idle' ? "#38bdf8" : "#475569"} />
                      </mesh>
                    </group>
                  );
                })}
              </group>

              {/* CODOMAIN PILLAR Y[cite: 20] */}
              <group position={[Y_POS, 0, 0]}>
                <Billboard position={[0, Y_START + 1.5, 0]}>
                  <Text fontSize={1.2} color="#94a3b8" fontWeight="bold">Codomain Y</Text>
                </Billboard>
                {CODOMAIN_Y.map((y, i) => {
                  const posY = Y_START - (i * Y_STEP);
                  // Check if this socket receives a thread (is even for f(x)=2x)
                  const isMapped = y % 2 === 0;
                  const isGlowing = phase !== 'idle' && isMapped;
                  
                  return (
                    <group key={`codom-${y}`} position={[0, posY, 0]}>
                      <mesh>
                        <boxGeometry args={[1.5, 1, 0.5]} />
                        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.2} />
                      </mesh>
                      <Billboard position={[1.5, 0, 0]}>
                        <Text fontSize={0.6} color={isGlowing ? "#38bdf8" : "#94a3b8"}>{y}</Text>
                      </Billboard>
                      {/* Thread Socket */}
                      <mesh position={[-0.76, 0, 0]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshBasicMaterial color={isGlowing ? "#38bdf8" : "#1e293b"} />
                      </mesh>
                    </group>
                  );
                })}
              </group>

              {/* DYNAMIC ENERGY THREADS[cite: 20] */}
              {DOMAIN_X.map((x, i) => {
                const y = f(x);
                // Only render thread if target exists visually in our truncated pillar
                if (y > CODOMAIN_Y.length) return null;
                
                const startY = Y_START - (i * Y_STEP);
                const endY = Y_START - ((y - 1) * Y_STEP);

                return (
                  <ShootingThread 
                    key={`thread-${x}`}
                    startX={X_POS + 0.76} 
                    startY={startY} 
                    endX={Y_POS - 0.76} 
                    endY={endY} 
                    delay={i * 2} // Staggered delay
                    phase={phase}
                  />
                );
              })}
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -10, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}