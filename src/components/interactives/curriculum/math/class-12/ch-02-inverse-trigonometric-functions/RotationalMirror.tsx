'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'idle' | 'mirror' | 'rotating' | 'done';

// ==================================================================
// 3D SCENE COMPONENT (Must be inside Canvas)
// ==================================================================
function MirrorScene({ 
  phase, 
  rotationProgress, 
  setRotationProgress 
}: { 
  phase: Phase, 
  rotationProgress: number, 
  setRotationProgress: (val: number) => void 
}) {
  const gridGroupRef = useRef<THREE.Group>(null);
  const mirrorRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate the restricted Sine Curve (Principal Value Branch)
  const sineWave = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -Math.PI / 2; x <= Math.PI / 2; x += 0.05) {
      pts.push([x, Math.sin(x), 0]);
    }
    pts.push([Math.PI / 2, Math.sin(Math.PI / 2), 0]);
    return pts;
  }, []);

  // Generate a ghost trail of the original sine wave for visual reference
  const ghostWave = useMemo(() => sineWave, [sineWave]);

  useFrame((_, delta) => {
    if (!gridGroupRef.current) return;

    // The axis of rotation is the line y = x (vector [1, 1, 0])
    const rotationAxis = new THREE.Vector3(1, 1, 0).normalize();
    // Angle goes from 0 to PI (180 degrees)[cite: 23]
    const targetAngle = rotationProgress * Math.PI;

    // Apply the 3D spatial rotation around the custom axis[cite: 23]
    gridGroupRef.current.setRotationFromAxisAngle(rotationAxis, targetAngle);

    // Animate the mirror deployment[cite: 23]
    if (mirrorRef.current) {
      const targetOpacity = phase !== 'idle' ? 0.3 : 0;
      const targetScale = phase !== 'idle' ? 15 : 0.01;
      
      const mat = mirrorRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 4);
      mirrorRef.current.scale.x = THREE.MathUtils.lerp(mirrorRef.current.scale.x, targetScale, delta * 5);
      mirrorRef.current.scale.y = THREE.MathUtils.lerp(mirrorRef.current.scale.y, targetScale, delta * 5);
    }
  });

  // Wacom Stylus / Pointer Grab Mechanics to pull the grid into 3D space[cite: 23]
  const handlePointerDown = (e: any) => {
    if (phase === 'rotating' || phase === 'done') {
      e.stopPropagation();
      setIsDragging(true);
      document.body.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      // Map horizontal stylus drag to the 180-degree rotation progress
      let newProgress = rotationProgress + e.movementX * 0.005;
      if (newProgress < 0) newProgress = 0;
      if (newProgress > 1) newProgress = 1;
      setRotationProgress(newProgress);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group 
      onPointerDown={handlePointerDown} 
      onPointerMove={handlePointerMove} 
      onPointerUp={handlePointerUp} 
      onPointerLeave={handlePointerUp}
    >
      {/* INVISIBLE CAPTURE SPHERE FOR ROTATION DRAG */}
      <mesh visible={false}>
        <sphereGeometry args={[20, 16, 16]} />
        <meshBasicMaterial side={THREE.DoubleSide} />
      </mesh>

      {/* THE ROTATIONAL MIRROR (y = x) */}
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh ref={mirrorRef} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.9} opacity={0} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      
      {/* Mirror Label */}
      {phase !== 'idle' && (
        <Billboard position={[4, 4, 0]}>
          <Text fontSize={0.6} color="#7dd3fc" fontWeight="bold">y = x</Text>
        </Billboard>
      )}

      {/* GHOST TRAIL (Original Sine Wave) */}
      {(rotationProgress > 0) && (
        <group>
          <Line points={ghostWave} color="#334155" lineWidth={2} dashed dashScale={4} />
          <Billboard position={[Math.PI/2 + 0.5, 1, 0]}>
            <Text fontSize={0.4} color="#64748b">y = sin(x)</Text>
          </Billboard>
        </group>
      )}

      {/* THE DYNAMIC ROTATING GRID & CURVE */}
      <group ref={gridGroupRef}>
        {/* Dynamic Grid Background */}
        <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]} />

        {/* X-Axis */}
        <Line points={[[-10, 0, 0], [10, 0, 0]] as [number, number, number][]} color="#ef4444" lineWidth={3} />
        <Billboard position={[9, 0.5, 0]}>
          <Text fontSize={0.6} color="#ef4444" fontWeight="bold">X</Text>
        </Billboard>

        {/* Y-Axis */}
        <Line points={[[0, -10, 0], [0, 10, 0]] as [number, number, number][]} color="#22c55e" lineWidth={3} />
        <Billboard position={[0.5, 9, 0]}>
          <Text fontSize={0.6} color="#22c55e" fontWeight="bold">Y</Text>
        </Billboard>

        {/* The Principal Value Branch Curve */}
        <Line points={sineWave} color="#fbbf24" lineWidth={5} />
        
        {/* Endpoints */}
        <mesh position={[-Math.PI / 2, -1, 0.1]}><sphereGeometry args={[0.2]} /><meshBasicMaterial color="#f59e0b" /></mesh>
        <mesh position={[Math.PI / 2, 1, 0.1]}><sphereGeometry args={[0.2]} /><meshBasicMaterial color="#f59e0b" /></mesh>
      </group>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function RotationalMirror() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [rotationProgress, setRotationProgress] = useState<number>(0);

  const handleDeployMirror = () => setPhase('mirror');
  
  const handleStartRotation = () => {
    setPhase('rotating');
  };

  const isAhaMoment = rotationProgress >= 0.99;

  // Auto-advance phase based on progress
  if (phase === 'rotating' && isAhaMoment) {
    setPhase('done');
  } else if (phase === 'done' && !isAhaMoment) {
    setPhase('rotating');
  }

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-grab active:cursor-grabbing">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The y = x Rotational Mirror</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            The graph of an inverse function is obtained as a mirror image along the line $y = x$[cite: 23].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Spatial Controls</span>
            <span className="text-sky-400 font-mono text-xs font-bold">{Math.round(rotationProgress * 180)}°</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-4">
            <button 
              onClick={phase === 'idle' ? handleDeployMirror : () => { setPhase('idle'); setRotationProgress(0); }}
              className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase !== 'idle' ? 'bg-stone-800 text-stone-500 border-stone-700' : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]'}`}
            >
              {phase === 'idle' ? 'Deploy Mirror (y = x)' : 'Reset Space'}
            </button>
            
            {phase !== 'idle' && (
              <div className="p-4 rounded-lg border border-amber-500/50 bg-amber-950/30 animate-in fade-in slide-in-from-top-2">
                <div className="text-amber-400 font-bold mb-2">Pull Grid into 3D Space[cite: 23]</div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={rotationProgress} 
                  onChange={(e) => {
                    if (phase === 'mirror') handleStartRotation();
                    setRotationProgress(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="text-amber-200 text-xs mt-2">
                  Rotate grid 180° around the mirror axis to physically swap the X and Y dimensions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Rigid 3D Spatial Rotation</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As you rotate the grid $180^\circ$ around the glowing $y = x$ axis, the original $X$ and $Y$ axes physically swap positions[cite: 23]. 
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            The sine curve leaves a brilliant particle trail behind it as it flips through the third dimension, settling perfectly into the vertical, serpentine shape of $y = \sin^{-1} x$[cite: 23].
          </p>
          <div className="inline-block bg-emerald-950/50 px-6 py-2 rounded-lg border border-emerald-900/50 font-mono text-base font-bold text-emerald-400">
            Finding an inverse graph is not a drawing trick; it is a physical flip in 3D space[cite: 23].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, -6, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 20]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <MirrorScene 
              phase={phase} 
              rotationProgress={rotationProgress} 
              setRotationProgress={setRotationProgress} 
            />

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.4} far={15} position={[0, -5, -2]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}