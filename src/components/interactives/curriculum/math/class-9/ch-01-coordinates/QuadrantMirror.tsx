'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, ContactShadows } from '@react-three/drei';
import { FlipHorizontal, FlipVertical, Compass } from 'lucide-react';

// ==================================================================
// NATIVE 3D PHYSICS COMPONENTS
// ==================================================================
function AnimatedNode({ targetX, targetZ }: { targetX: number, targetZ: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, delta * 6);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, delta * 6);
  });

  return (
    <group ref={ref} position={[targetX, 0.5, targetZ]}>
      <mesh castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
      </mesh>
      <Text position={[0, 1.2, 0]} fontSize={0.6} fontWeight="bold" color="#ffffff" outlineWidth={0.05} outlineColor="#000000">
        ({targetX}, {-targetZ})
      </Text>
    </group>
  );
}

function lerpAngle(start: number, end: number, t: number) {
  const shortestAngle = ((((end - start) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return start + shortestAngle * t;
}

function AnimatedEdge({ start, end }: { start: [number, number], end: [number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (!ref.current) return;
    
    const targetDist = Math.sqrt((end[0] - start[0])**2 + (end[1] - start[1])**2);
    const targetMidX = (start[0] + end[0]) / 2;
    const targetMidZ = (start[1] + end[1]) / 2;
    const targetAngle = -Math.atan2(end[1] - start[1], end[0] - start[0]);

    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetMidX, delta * 6);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetMidZ, delta * 6);
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetDist, delta * 6);
    ref.current.rotation.y = lerpAngle(ref.current.rotation.y, targetAngle, delta * 6);
  });

  return (
    <mesh ref={ref} position={[(start[0]+end[0])/2, 0.5, (start[1]+end[1])/2]} castShadow rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function QuadrantMirror() {
  const [reflection, setReflection] = useState<'none' | 'x' | 'y' | 'both'>('none');

  const baseCoords: [number, number][] = [[3, 4], [7, 1], [9, 6]];

  const getReflectedCoords = () => {
    switch (reflection) {
      case 'x': return baseCoords.map(([x, y]) => [x, -y] as [number, number]);
      case 'y': return baseCoords.map(([x, y]) => [-x, y] as [number, number]);
      case 'both': return baseCoords.map(([x, y]) => [-x, -y] as [number, number]);
      default: return baseCoords;
    }
  };

  const currentCoords = getReflectedCoords();

  return (
    <div className="w-full h-full min-h-[750px] bg-[#1c1917] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 18, 18], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 6} />
            
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshPhysicalMaterial color="#1c1917" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
            </mesh>

            <Grid args={[20, 20]} position={[0, 0, 0]} cellSize={1} cellThickness={1} cellColor="#3f3f46" sectionSize={10} sectionThickness={2.5} sectionColor="#10b981" fadeDistance={40} />
            
            <Text position={[5, 0.1, -5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2} fontWeight="bold" color="#292524">I</Text>
            <Text position={[-5, 0.1, -5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2} fontWeight="bold" color="#292524">II</Text>
            <Text position={[-5, 0.1, 5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2} fontWeight="bold" color="#292524">III</Text>
            <Text position={[5, 0.1, 5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2} fontWeight="bold" color="#292524">IV</Text>

            {currentCoords.map((coord, i) => (
              <AnimatedNode key={`node-${i}`} targetX={coord[0]} targetZ={coord[1]} />
            ))}

            {currentCoords.map((coord, i) => {
              const nextCoord = currentCoords[(i + 1) % currentCoords.length];
              return (
                <AnimatedEdge key={`edge-${i}`} start={coord} end={nextCoord} />
              );
            })}

            <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.6} far={10} color="#000000" position={[0, -0.1, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER & TOGGLES */}
      <div className="absolute top-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Compass className="text-emerald-500" /> The Quadrant Mirror
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Observe how signs change when reflecting across axes.
          </p>
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setReflection(reflection === 'y' ? 'none' : reflection === 'both' ? 'x' : reflection === 'x' ? 'both' : 'y')} 
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
              reflection === 'y' || reflection === 'both' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'
            }`}
          >
            <FlipHorizontal size={16}/> Reflect Y-Axis
          </button>
          
          <button 
            onClick={() => setReflection(reflection === 'x' ? 'none' : reflection === 'both' ? 'y' : reflection === 'y' ? 'both' : 'x')} 
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
              reflection === 'x' || reflection === 'both' ? 'bg-sky-600 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'
            }`}
          >
            <FlipVertical size={16}/> Reflect X-Axis
          </button>
        </div>
      </div>

      {/* FLOATING FEEDBACK HUD */}
      <div className="absolute bottom-8 right-8 bg-stone-900/90 backdrop-blur-md p-6 rounded-2xl border border-stone-700 shadow-2xl max-w-sm pointer-events-none">
        <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">Mathematical Translation</h3>
        {reflection === 'none' && <p className="text-stone-300 text-sm leading-relaxed">Original shape located in <strong>Quadrant I</strong>. Both x and y coordinates are positive (+, +).</p>}
        {reflection === 'y' && <p className="text-stone-300 text-sm leading-relaxed">Reflecting across the Y-axis negates the x-coordinates. Shape moved to <strong>Quadrant II</strong> (-, +).</p>}
        {reflection === 'x' && <p className="text-stone-300 text-sm leading-relaxed">Reflecting across the X-axis negates the y-coordinates. Shape moved to <strong>Quadrant IV</strong> (+, -).</p>}
        {reflection === 'both' && <p className="text-stone-300 text-sm leading-relaxed">Reflecting across both axes negates both coordinates. Shape moved to <strong>Quadrant III</strong> (-, -).</p>}
      </div>

    </div>
  );
}