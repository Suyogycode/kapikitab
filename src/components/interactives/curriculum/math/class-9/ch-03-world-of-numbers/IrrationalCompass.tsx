'use client';

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Line, ContactShadows } from '@react-three/drei';
import { Compass, Plus, MoveDown, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

// ==================================================================
// PRE-COMPUTED SPIRAL MATHEMATICS
// ==================================================================
const MAX_STAGES = 10;

// Pre-calculate the vertices for the Spiral of Theodorus
const spiralData = (() => {
  const points = [{ r: 1, theta: 0, x: 1, y: 0 }];
  let currentTheta = 0;
  
  for (let i = 1; i <= MAX_STAGES; i++) {
    // The angle added is arctan(1 / sqrt(i))
    currentTheta += Math.atan(1 / Math.sqrt(i));
    const r = Math.sqrt(i + 1);
    points.push({ 
      r, 
      theta: currentTheta, 
      x: r * Math.cos(currentTheta), 
      y: r * Math.sin(currentTheta) 
    });
  }
  return points;
})();

// ==================================================================
// NATIVE 3D PHYSICS COMPONENTS
// ==================================================================

// 1. Solid Triangle Face
function SpiralFace({ p1, p2, color }: { p1: any, p2: any, color: string }) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(p1.x, p1.y);
    shape.lineTo(p2.x, p2.y);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [p1, p2]);

  return (
    <mesh geometry={geom} position={[0, 0, 0.01]}>
      <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

// 2. The Dynamic Sweeping Compass
function CompassSweeper({ radius, startAngle, isSweeping, onComplete, value }: any) {
  const needleRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  // Reset progress if sweeping stops or stage changes
  useEffect(() => {
    if (!isSweeping) setProgress(0);
  }, [isSweeping, radius]);

  useFrame((_, delta) => {
    if (isSweeping && progress < 1) {
      const nextProgress = Math.min(1, progress + delta * 1.2);
      setProgress(nextProgress);
      if (nextProgress === 1) onComplete();
    }

    if (needleRef.current) {
      // Interpolate angle from startAngle down to 0
      const currentAngle = startAngle * (1 - progress);
      const currentX = radius * Math.cos(currentAngle);
      const currentY = radius * Math.sin(currentAngle);
      
      // Update needle position
      needleRef.current.rotation.z = currentAngle;
    }

    if (trailRef.current) {
      // Reveal the trail ring dynamically
      (trailRef.current.geometry as THREE.RingGeometry).dispose();
      trailRef.current.geometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64, 1, 0, startAngle * (1 - progress));
    }
  });

  if (!isSweeping && progress === 0) return null;

  return (
    <group position={[0, 0, 0.1]}>
      {/* The Needle/Arm */}
      <group ref={needleRef}>
        <Line points={[[0, 0, 0], [radius, 0, 0]]} color="#f59e0b" lineWidth={3} transparent opacity={0.8} />
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* The Fading Trail */}
      <mesh ref={trailRef} position={[0, 0, -0.01]}>
        <ringGeometry args={[radius - 0.02, radius + 0.02, 64, 1, 0, startAngle]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* The Target Mark on the Number Line */}
      {progress === 1 && (
        <group position={[radius, 0, 0.2]}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
          </mesh>
          <Text position={[0, -0.5, 0]} fontSize={0.35} fontWeight="bold" color="#f59e0b" outlineWidth={0.03} outlineColor="#000000">
            {value}
          </Text>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function IrrationalCompass() {
  const [stage, setStage] = useState<number>(1);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepDone, setSweepDone] = useState<boolean>(false);

  const colors = ["#10b981", "#0ea5e9", "#f43f5e", "#8b5cf6", "#eab308"];

  const handleNextStage = () => {
    if (stage < MAX_STAGES) {
      setStage(prev => prev + 1);
      setIsSweeping(false);
      setSweepDone(false);
    }
  };

  const handleSweep = () => {
    setIsSweeping(true);
  };

  const handleReset = () => {
    setStage(1);
    setIsSweeping(false);
    setSweepDone(false);
  };

  const activePoint = spiralData[stage];
  const exactRoot = `√${stage + 1}`;
  const decimalValue = Math.sqrt(stage + 1).toFixed(3);

  return (
    <div className="w-full h-full min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [2, 2, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            {/* Shifted target to keep spiral centered */}
            <OrbitControls enableZoom={true} target={[1.5, 1.5, 0]} maxPolarAngle={Math.PI / 2} minPolarAngle={0} />

            {/* Drafting Grid */}
            <Grid args={[20, 20]} position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} cellSize={1} cellThickness={1.5} cellColor="#3f3f46" sectionSize={5} fadeDistance={40} />

            {/* Solid Number Line (X-Axis) */}
            <Line points={[[-2, 0, 0], [6, 0, 0]]} color="#ffffff" lineWidth={5} />
            {[0, 1, 2, 3, 4, 5].map(num => (
              <group key={`tick-${num}`} position={[num, 0, 0]}>
                <Line points={[[0, -0.15, 0], [0, 0.15, 0]]} color="#ffffff" lineWidth={3} />
                <Text position={[0, -0.5, 0.1]} fontSize={0.4} fontWeight="bold" color="#d6d3d1">
                  {num}
                </Text>
              </group>
            ))}
            <Text position={[6.2, 0, 0.1]} fontSize={0.4} fontWeight="bold" color="#ffffff">Number Line</Text>

            {/* Construct the Spiral up to current stage */}
            {Array.from({ length: stage }).map((_, i) => {
              const p1 = spiralData[i];
              const p2 = spiralData[i + 1];
              const color = colors[i % colors.length];

              return (
                <group key={`triangle-${i}`}>
                  {/* The Face */}
                  <SpiralFace p1={p1} p2={p2} color={color} />
                  
                  {/* The Base (Inner Hypotenuse) */}
                  <Line points={[[0, 0, 0], [p1.x, p1.y, 0]]} color="#78716c" lineWidth={2} />
                  
                  {/* The Height (Outer Edge, always length 1) */}
                  <Line points={[[p1.x, p1.y, 0], [p2.x, p2.y, 0]]} color="#ffffff" lineWidth={3} />
                  
                  {/* The New Hypotenuse */}
                  <Line points={[[0, 0, 0], [p2.x, p2.y, 0]]} color={color} lineWidth={4} />

                  {/* Outer Edge Label (Length 1) */}
                  <Text position={[(p1.x + p2.x)/2 + 0.2, (p1.y + p2.y)/2 + 0.2, 0]} fontSize={0.3} fontWeight="bold" color="#ffffff">
                    1
                  </Text>
                  
                  {/* Hypotenuse Label */}
                  <Text position={[(p2.x)/2 - 0.2, (p2.y)/2 + 0.2, 0]} fontSize={0.35} fontWeight="bold" color={color} outlineWidth={0.03} outlineColor="#000000">
                    √{i + 2}
                  </Text>
                </group>
              );
            })}

            {/* The Dynamic Sweeping Compass */}
            <CompassSweeper 
              radius={activePoint.r} 
              startAngle={activePoint.theta} 
              isSweeping={isSweeping} 
              onComplete={() => setSweepDone(true)}
              value={`${decimalValue}...`} 
            />

            <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" position={[0, -0.2, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Compass className="text-emerald-500" /> The Irrational Compass
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Constructing the Square Root Spiral geometric lengths.
          </p>
        </div>
        <button onClick={handleReset} className="px-4 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors pointer-events-auto backdrop-blur-md">
          <RotateCcw size={14} className="inline mr-2" /> Reset
        </button>
      </div>

      {/* FLOATING CONTROLS HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row gap-6 pointer-events-none">
        
        {/* Math & Logic Panel */}
        <div className="flex-1 max-w-md bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Pythagorean Construction</h3>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded text-xs font-mono font-bold">
              Stage {stage}
            </span>
          </div>
          
          <div className="p-5 space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800">
              <span className="text-stone-400">Base Length:</span>
              <span className="text-stone-200 font-bold">√{stage}</span>
            </div>
            <div className="flex justify-between items-center bg-stone-950 p-3 rounded border border-stone-800">
              <span className="text-stone-400">Perpendicular Height:</span>
              <span className="text-stone-200 font-bold">1</span>
            </div>
            <div className="pt-2 border-t border-stone-800">
              <p className="text-emerald-400 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/50 text-base leading-relaxed">
                {`$c^2 = a^2 + b^2$`}<br/>
                {`$c = \\sqrt{(\\sqrt{${stage}})^2 + 1^2}$`}<br/>
                {`$c = \\sqrt{${stage} + 1} = ${exactRoot}$`}
                </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex-1 flex flex-col justify-end gap-3 pointer-events-auto max-w-xs ml-auto">
          
          <button 
            onClick={handleSweep}
            disabled={isSweeping || sweepDone}
            className="w-full px-6 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-500 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg border border-amber-500 disabled:border-stone-700"
          >
            <MoveDown size={18} /> 
            {sweepDone ? 'Compass Swept' : 'Sweep Compass'}
          </button>

          <button 
            onClick={handleNextStage}
            disabled={!sweepDone || stage >= MAX_STAGES}
            className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg border border-emerald-500 disabled:border-stone-700"
          >
            <Plus size={18} /> Build {stage < MAX_STAGES ? `√${stage + 2}` : 'Max Reached'}
          </button>
          
          {sweepDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-2">
              <p className="text-xs text-emerald-400 bg-emerald-950/50 px-3 py-2 rounded-lg border border-emerald-900/50">
                <strong>Aha!</strong> {exactRoot} is exactly <strong>{decimalValue}...</strong> on the physical number line. It is not a random decimal; it is a precise geometric reality.
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}