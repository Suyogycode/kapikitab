'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'idle' | 'falling' | 'rolling' | 'settled';

// ==================================================================
// MATH FUNCTIONS
// ==================================================================
// Using a polynomial with a clear local max and two local mins: 
// f(x) = 0.1x^4 - 0.8x^2 + 2
// f'(x) = 0.4x^3 - 1.6x
// f''(x) = 1.2x^2 - 1.6
// Critical points at x = -2 (Min), x = 0 (Max), x = 2 (Min)

const f = (x: number) => 0.1 * Math.pow(x, 4) - 0.8 * Math.pow(x, 2) + 2;
const df = (x: number) => 0.4 * Math.pow(x, 3) - 1.6 * x;
const ddf = (x: number) => 1.2 * Math.pow(x, 2) - 1.6;

// ==================================================================
// 3D TERRAIN & PHYSICS ENGINE
// ==================================================================
function TerrainScene({ dropX, phase, setPhase, setLiveX }: { 
  dropX: number, phase: Phase, setPhase: (p: Phase) => void, setLiveX: (x: number) => void 
}) {
  const ballRef = useRef<THREE.Group>(null);
  const sensorRef = useRef<THREE.Group>(null);
  
  // Track current physical state of the ball
  const ballState = useRef({ x: dropX, y: 5, velocityX: 0 });

  // Generate the 1D curve extruded visually to look like a track/terrain
  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      pts.push([x, f(x), 0]);
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    if (!ballRef.current || !sensorRef.current) return;

    // Reset ball position if we are dropping a new one
    if (phase === 'idle') {
      ballState.current = { x: dropX, y: f(dropX) + 3, velocityX: 0 };
      ballRef.current.position.set(ballState.current.x, ballState.current.y, 0);
      sensorRef.current.visible = false;
      return;
    }

    if (phase === 'falling') {
      ballState.current.y -= delta * 10; // Gravity
      if (ballState.current.y <= f(ballState.current.x) + 0.3) {
        ballState.current.y = f(ballState.current.x) + 0.3;
        setPhase('rolling');
      }
    } 
    else if (phase === 'rolling') {
      // Simulate rolling down the gradient[cite: 21]
      const slope = df(ballState.current.x);
      
      // Acceleration relies on the negative slope
      ballState.current.velocityX -= slope * delta * 15;
      
      // Apply friction so it eventually settles
      ballState.current.velocityX *= 0.92;
      
      ballState.current.x += ballState.current.velocityX * delta;
      
      // Lock bounds
      if (ballState.current.x < -3.5) { ballState.current.x = -3.5; ballState.current.velocityX *= -0.5; }
      if (ballState.current.x > 3.5) { ballState.current.x = 3.5; ballState.current.velocityX *= -0.5; }

      ballState.current.y = f(ballState.current.x) + 0.3;

      // Check if settled (velocity is near zero and close to a critical point)
      if (Math.abs(ballState.current.velocityX) < 0.05 && Math.abs(slope) < 0.1) {
        setPhase('settled');
      }
    }
    else if (phase === 'settled') {
      // Snap to exact critical point for clean UI reading
      const slope = df(ballState.current.x);
      if (Math.abs(slope) > 0.001) {
        ballState.current.x -= slope * delta * 2;
      }
      ballState.current.y = f(ballState.current.x) + 0.3;
      
      // Deploy Curvature Sensor[cite: 21]
      sensorRef.current.visible = true;
      sensorRef.current.position.lerp(new THREE.Vector3(ballState.current.x, f(ballState.current.x), 0), delta * 5);
      
      // Rotate sensor based on concavity (umbrella vs bowl)[cite: 21]
      const concavity = ddf(ballState.current.x);
      const targetRot = concavity < 0 ? Math.PI : 0; // Flip umbrella down if negative
      sensorRef.current.rotation.z = THREE.MathUtils.lerp(sensorRef.current.rotation.z, targetRot, delta * 5);
    }

    // Apply to meshes
    ballRef.current.position.set(ballState.current.x, ballState.current.y, 0);
    setLiveX(ballState.current.x);
  });

  const isConcaveUp = ddf(ballState.current.x) > 0;
  const sensorColor = isConcaveUp ? "#10b981" : "#ef4444"; // Green for bowl (min), Red for umbrella (max)

  return (
    <group>
      {/* Background Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
      <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />
      <Line points={[[0, -10, -0.1], [0, 10, -0.1]] as [number, number, number][]} color="#475569" lineWidth={2} />

      {/* Complex Function Terrain[cite: 21] */}
      <Line points={curvePoints} color="#60a5fa" lineWidth={6} />
      
      {/* Terrain Depth Visualization */}
      <mesh position={[0, -2, -0.1]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial color="#1e3a8a" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {/* The Virtual Ball[cite: 21] */}
      <group ref={ballRef}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#fcd34d" metalness={0.4} roughness={0.2} />
        </mesh>
      </group>

      {/* Local Curvature Sensor (Umbrella / Bowl)[cite: 21] */}
      <group ref={sensorRef} visible={false}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color={sensorColor} wireframe transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <Billboard position={[0, (isConcaveUp ? -1.5 : 1.5), 0]}>
          <Text fontSize={0.5} color={sensorColor} fontWeight="bold">
            {isConcaveUp ? "BOWL (f'' > 0)" : "UMBRELLA (f'' < 0)"}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ValleyTrap() {
  const [dropX, setDropX] = useState<number>(0.5);
  const [liveX, setLiveX] = useState<number>(dropX);
  const [phase, setPhase] = useState<Phase>('idle');

  const currentSlope = df(liveX);
  const currentConcavity = ddf(liveX);
  
  const isSettled = phase === 'settled';
  const isMax = isSettled && currentConcavity < 0;
  const isMin = isSettled && currentConcavity > 0;

  const handleDrop = () => {
    setPhase('falling');
  };

  const handleReset = () => {
    setPhase('idle');
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Valley Trap</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Classifying Local Maxima & Minima via the Second Derivative Test f''(x)[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Terrain Sensor</span>
            <span className="text-sky-400 font-mono text-xs font-bold">x = {liveX.toFixed(2)}</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950 text-stone-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-stone-400">Slope f'(x):</span>
                <span className={Math.abs(currentSlope) < 0.1 ? "text-amber-400 font-bold" : "text-sky-300 font-bold"}>
                  {currentSlope.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-stone-400">Concavity f''(x):</span>
                <span className={currentConcavity < 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                  {currentConcavity.toFixed(2)}
                </span>
              </div>
            </div>

            {isSettled && (
              <div className={`p-3 rounded-lg border transition-colors duration-300 ${isMax ? 'border-red-500/50 bg-red-950/30 text-red-400' : 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400'}`}>
                <div className="font-bold mb-1 text-center text-lg uppercase tracking-widest">
                  {isMax ? "Local Maximum" : "Local Minimum"}
                </div>
                <div className="text-xs text-center">
                  {isMax ? "f'(x)=0 and f''(x)<0 (Hill)" : "f'(x)=0 and f''(x)>0 (Valley)"}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border border-sky-500/50 bg-sky-950/30 mb-4">
            <div className="text-sky-400 font-bold mb-2 text-center text-sm">Set Drop Zone</div>
            <input 
              type="range" min="-3" max="3" step="0.1" 
              value={dropX} 
              onChange={(e) => {
                setDropX(parseFloat(e.target.value));
                if (phase !== 'idle') setPhase('idle');
              }}
              disabled={phase === 'falling' || phase === 'rolling'}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <button 
            onClick={phase === 'idle' ? handleDrop : handleReset}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'falling' || phase === 'rolling' ? 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed' : phase === 'settled' ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]'}`}
            disabled={phase === 'falling' || phase === 'rolling'}
          >
            {phase === 'idle' ? 'Drop Virtual Ball' : phase === 'settled' ? 'Reset Simulator' : 'Rolling...'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isSettled ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`bg-stone-900/95 border p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.5)] ${isMax ? 'border-red-500 shadow-red-500/30' : 'border-emerald-500 shadow-emerald-500/30'}`}>
          <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${isMax ? 'text-red-400' : 'text-emerald-400'}`}>
            Physical Concavity Assessment
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            {isMax 
              ? "At the peak of a hill, the sensor measures a downward concavity (f''(x) < 0), forcing the system to flag it as a local maximum[cite: 21]." 
              : "At the bottom of a valley, the upward concavity yields f''(x) > 0, confirming a local minimum[cite: 21]."}
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-sm font-bold text-stone-300">
            The abstract second derivative test becomes a physical assessment of whether a turning point curves like an umbrella (maximum) or a bowl (minimum)[cite: 21].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} />

            <TerrainScene dropX={dropX} phase={phase} setPhase={setPhase} setLiveX={setLiveX} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}