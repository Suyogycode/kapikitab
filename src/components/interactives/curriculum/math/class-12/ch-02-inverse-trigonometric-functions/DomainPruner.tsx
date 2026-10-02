'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type DragState = 'left' | 'right' | null;

// ==================================================================
// 3D WAVE ENGINE (Must be inside Canvas)
// ==================================================================
function WaveEngine({ 
  leftBound, rightBound, setLeftBound, setRightBound, isPrincipal, isValid 
}: { 
  leftBound: number, rightBound: number, 
  setLeftBound: (v: number) => void, setRightBound: (v: number) => void,
  isPrincipal: boolean, isValid: boolean 
}) {
  const [dragState, setDragState] = useState<DragState>(null);
  const beamRef = useRef<THREE.Group>(null);
  const detachedWaveRef = useRef<THREE.Group>(null);

  // Generate the full infinite background wave[cite: 22]
  const fullWave = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -10; x <= 10; x += 0.1) {
      pts.push([x, Math.sin(x), 0]);
    }
    return pts;
  }, []);

  // Generate the active selected segment
  const activeWave = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = leftBound; x <= rightBound; x += 0.05) {
      pts.push([x, Math.sin(x), 0]);
    }
    // Ensure the exact endpoints are included
    if (pts[pts.length - 1][0] !== rightBound) {
      pts.push([rightBound, Math.sin(rightBound), 0]);
    }
    return pts;
  }, [leftBound, rightBound]);

  useFrame((state, delta) => {
    // Animate the Horizontal Scanning Beam[cite: 22]
    if (beamRef.current) {
      // Scan up and down between -1.2 and 1.2
      const beamY = Math.sin(state.clock.elapsedTime * 1.5) * 1.2;
      beamRef.current.position.y = beamY;
    }

    // Animate the physical detachment of the Principal Branch[cite: 22]
    if (detachedWaveRef.current) {
      const targetZ = isPrincipal ? 1.0 : 0.05;
      detachedWaveRef.current.position.z = THREE.MathUtils.lerp(detachedWaveRef.current.position.z, targetZ, delta * 4);
    }
  });

  // --- DRAG PHYSICS ---
  const handlePointerDown = (type: DragState) => (e: any) => {
    e.stopPropagation();
    setDragState(type);
    document.body.style.cursor = 'ew-resize';
  };

  const handlePointerMove = (e: any) => {
    if (!dragState) return;
    
    let newX = e.point.x;
    
    // Magnetic Snap to key Pi intervals
    const snapPoints = [-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI];
    for (const snap of snapPoints) {
      if (Math.abs(newX - snap) < 0.3) {
        newX = snap;
        break;
      }
    }

    if (dragState === 'left') {
      if (newX < rightBound - 0.2 && newX >= -6) setLeftBound(newX);
    } else if (dragState === 'right') {
      if (newX > leftBound + 0.2 && newX <= 6) setRightBound(newX);
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
    document.body.style.cursor = 'auto';
  };

  // Determine Beam Color: Red if invalid (strikes twice), Green if valid[cite: 22]
  const beamColor = isValid ? "#10b981" : "#ef4444";

  return (
    <group>
      {/* INVISIBLE CAPTURE PLANE FOR DRAGGING */}
      <mesh 
        position={[0, 0, 0]} 
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>

      {/* BACKGROUND WAVE */}
      <Line points={fullWave} color="#334155" lineWidth={3} />

      {/* X and Y Axes */}
      <Line points={[[-10, 0, -0.1], [10, 0, -0.1]] as [number, number, number][]} color="#475569" lineWidth={1} />
      <Line points={[[0, -3, -0.1], [0, 3, -0.1]] as [number, number, number][]} color="#475569" lineWidth={1} />
      
      {/* Label Pi markers */}
      <Billboard position={[-Math.PI, -0.4, 0]}><Text fontSize={0.4} color="#94a3b8">-π</Text></Billboard>
      <Billboard position={[-Math.PI/2, -0.4, 0]}><Text fontSize={0.4} color="#94a3b8">-π/2</Text></Billboard>
      <Billboard position={[Math.PI/2, -0.4, 0]}><Text fontSize={0.4} color="#94a3b8">π/2</Text></Billboard>
      <Billboard position={[Math.PI, -0.4, 0]}><Text fontSize={0.4} color="#94a3b8">π</Text></Billboard>

      {/* ACTIVE SELECTED SEGMENT */}
      <group ref={detachedWaveRef}>
        <Line 
          points={activeWave} 
          color={isPrincipal ? "#fbbf24" : (isValid ? "#3b82f6" : "#ef4444")} 
          lineWidth={isPrincipal ? 6 : 4} 
        />
        {/* Glow effect for principal branch */}
        {isPrincipal && (
          <Line points={activeWave} color="#f59e0b" lineWidth={12} transparent opacity={0.3} />
        )}
      </group>

      {/* DIGITAL CROPPING LASERS (Left)[cite: 22] */}
      <group position={[leftBound, 0, 0]}>
        <Line points={[[0, -4, 0], [0, 4, 0]] as [number, number, number][]} color="#38bdf8" lineWidth={2} dashed dashScale={4} />
        <mesh 
          position={[0, 0, 0.1]}
          onPointerDown={handlePointerDown('left')}
          onPointerOver={() => document.body.style.cursor = 'ew-resize'}
          onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
        >
          <boxGeometry args={[0.4, 8, 0.4]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} />
        </mesh>
        <mesh position={[0, Math.sin(leftBound), 0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* DIGITAL CROPPING LASERS (Right)[cite: 22] */}
      <group position={[rightBound, 0, 0]}>
        <Line points={[[0, -4, 0], [0, 4, 0]] as [number, number, number][]} color="#38bdf8" lineWidth={2} dashed dashScale={4} />
        <mesh 
          position={[0, 0, 0.1]}
          onPointerDown={handlePointerDown('right')}
          onPointerOver={() => document.body.style.cursor = 'ew-resize'}
          onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
        >
          <boxGeometry args={[0.4, 8, 0.4]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} />
        </mesh>
        <mesh position={[0, Math.sin(rightBound), 0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* HORIZONTAL SCANNING BEAM[cite: 22] */}
      <group ref={beamRef}>
        <Line points={[[-10, 0, 0.2], [10, 0, 0.2]] as [number, number, number][]} color={beamColor} lineWidth={3} />
        {/* Visual intersection indicators could be added here, but the beam color change suffices for the AHA moment */}
      </group>

    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function DomainPruner() {
  const [leftBound, setLeftBound] = useState<number>(-0.5);
  const [rightBound, setRightBound] = useState<number>(2.5);

  // Validation Logic
  // A branch is valid if its width is exactly PI (allowing slight floating point margin).
  // If it's wider than PI, it will hit multiple Y values (fail horizontal line test).
  const domainWidth = rightBound - leftBound;
  const isValid = domainWidth <= Math.PI + 0.05; 
  
  // Principal Value Branch is exactly [-PI/2, PI/2][cite: 22]
  const isPrincipal = Math.abs(leftBound - (-Math.PI / 2)) < 0.1 && Math.abs(rightBound - Math.PI / 2) < 0.1;

  // Format labels for HUD
  const formatPi = (val: number) => {
    const piRatio = val / Math.PI;
    if (Math.abs(piRatio) < 0.05) return "0";
    if (Math.abs(piRatio - 0.5) < 0.05) return "π/2";
    if (Math.abs(piRatio + 0.5) < 0.05) return "-π/2";
    if (Math.abs(piRatio - 1) < 0.05) return "π";
    if (Math.abs(piRatio + 1) < 0.05) return "-π";
    return val.toFixed(2);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Domain Pruner</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Restricting the domain of $y = \sin x$ to make it invertible[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Scanner Telemetry</span>
            <span className={isPrincipal ? "text-amber-400 font-mono text-xs font-bold" : isValid ? "text-emerald-400 font-mono text-xs font-bold" : "text-red-400 font-mono text-xs font-bold"}>
              {isPrincipal ? "PRINCIPAL BRANCH" : isValid ? "VALID (ONE-ONE)" : "INVALID (MANY-ONE)"}
            </span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Current Domain:</span>
              <span className="text-sky-400 font-bold">[{formatPi(leftBound)}, {formatPi(rightBound)}]</span>
            </div>
            
            <div className={`p-3 rounded-lg border transition-colors ${!isValid ? 'border-red-500/50 bg-red-950/30' : 'border-stone-800 bg-stone-950'}`}>
              <div className={!isValid ? 'text-red-400 font-bold mb-1' : 'text-stone-500 font-bold mb-1'}>Horizontal Line Test</div>
              <div className={!isValid ? 'text-red-300 text-xs' : 'text-stone-600 text-xs'}>
                {!isValid ? "Beam strikes curve twice. Function is many-one.[cite: 22]" : "Beam strikes exactly once. Function is one-one."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isPrincipal ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Principal Value Branch Locked</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            You carefully dragged the lasers to exactly -π/2 and π/2. The horizontal beam scans up and down, confirming it never hits the curve more than once[cite: 22].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-amber-400">
            The isolated segment has physically detached from the infinite wave. This is the official principal value branch for sin^-1 x[cite: 22].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 20]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <WaveEngine 
              leftBound={leftBound} 
              rightBound={rightBound} 
              setLeftBound={setLeftBound} 
              setRightBound={setRightBound} 
              isPrincipal={isPrincipal} 
              isValid={isValid} 
            />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -4, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}