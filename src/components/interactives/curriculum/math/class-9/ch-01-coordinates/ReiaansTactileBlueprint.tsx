'use client';

import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Line, ContactShadows } from '@react-three/drei';
import { MapPin, AlertCircle, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// 3D COMPONENTS
// ==================================================================

// 1. The Silver Pin Component
function BlueprintPin({ position, delay, visiblePhase }: { position: [number, number, number], delay: number, visiblePhase: number }) {
  const pinRef = useRef<THREE.Group>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (visiblePhase >= 1) {
      const timer = setTimeout(() => setActive(true), delay);
      return () => clearTimeout(timer);
    } else {
      setActive(false);
    }
  }, [visiblePhase, delay]);

  useFrame((_, delta) => {
    if (!pinRef.current) return;
    const targetY = active ? position[1] : 10;
    pinRef.current.position.y = THREE.MathUtils.lerp(pinRef.current.position.y, targetY, delta * 8);
  });

  return (
    <group ref={pinRef} position={[position[0], 10, position[2]]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#e7e5e4" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// 2. The Glowing Thread Component
function NeonThread({ start, end, visiblePhase, color = "#10b981" }: { start: [number, number, number], end: [number, number, number], visiblePhase: number, color?: string }) {
  const [opacity, setOpacity] = useState(0);

  useFrame((_, delta) => {
    const targetOpacity = visiblePhase >= 2 ? 1 : 0;
    setOpacity(THREE.MathUtils.lerp(opacity, targetOpacity, delta * 5));
  });

  if (opacity < 0.05) return null;

  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={4}
      transparent
      opacity={opacity}
      position={[0, 0.15, 0]} 
    />
  );
}

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function ReiaansTactileBlueprint() {
  const [phase, setPhase] = useState<number>(0);
  const [wardrobeX, setWardrobeX] = useState<number>(5);
  const [wardrobeY, setWardrobeY] = useState<number>(1);

  useEffect(() => {
    const p1 = setTimeout(() => setPhase(1), 500);
    const p2 = setTimeout(() => setPhase(2), 2500);
    const p3 = setTimeout(() => setPhase(3), 3500);
    return () => { clearTimeout(p1); clearTimeout(p2); clearTimeout(p3); };
  }, []);

  const isConflict = useMemo(() => {
    const doorRect = { left: 0, right: 2.5, bottom: 1.5, top: 4 };
    const wardRect = { left: wardrobeX, right: wardrobeX + 4, bottom: wardrobeY, top: wardrobeY + 2 };
    
    return (
      wardRect.left < doorRect.right &&
      wardRect.right > doorRect.left &&
      wardRect.bottom < doorRect.top &&
      wardRect.top > doorRect.bottom
    );
  }, [wardrobeX, wardrobeY]);

  const roomPins = [
    [0, 0, 0], [12, 0, 0], [12, 0, 10], [0, 0, 10], 
    [0, 0, 1.5], [0, 0, 4], 
    [3, 0, 0], [3, 0, 9]    
  ] as [number, number, number][];

  return (
    <div className="w-full h-full min-h-[750px] bg-[#1c1917] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {phase < 3 && (
            <motion.div 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm pointer-events-none"
            >
              <div className="px-6 py-3 bg-stone-900 border border-stone-700 rounded-full text-emerald-400 font-mono text-sm tracking-widest uppercase shadow-2xl animate-pulse">
                {phase === 0 ? 'Initializing Grid...' : phase === 1 ? 'Plotting Coordinates...' : 'Linking Geometry...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Canvas camera={{ position: [6, 14, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 20, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            {/* Shifted target so the grid stays centered above the floating UI panels */}
            <OrbitControls 
              enableZoom={true} 
              maxPolarAngle={Math.PI / 2.2} 
              minPolarAngle={Math.PI / 6}
              target={[6, 0, 4]} 
            />
            
            <Grid args={[12, 10]} position={[6, 0, 5]} cellSize={1} cellThickness={1.5} cellColor="#44403c" sectionSize={1} fadeDistance={40} />

            <group position={[0, 0, 0]}>
              <mesh position={[0, 0.05, 0]}>
                <circleGeometry args={[0.4, 32]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
              </mesh>
              {/* Maintained fontSize for scale, added fontWeight for boldness */}
              <Text position={[-0.8, 0.2, -0.8]} fontSize={0.5} fontWeight="bold" color="#10b981">O(0,0)</Text>
            </group>

            {roomPins.map((pos, i) => (
              <BlueprintPin key={i} position={pos} delay={i * 150} visiblePhase={phase} />
            ))}

            <NeonThread start={[0, 0, 0]} end={[12, 0, 0]} visiblePhase={phase} />
            <NeonThread start={[12, 0, 0]} end={[12, 0, 10]} visiblePhase={phase} />
            <NeonThread start={[12, 0, 10]} end={[0, 0, 10]} visiblePhase={phase} />
            <NeonThread start={[0, 0, 10]} end={[0, 0, 4]} visiblePhase={phase} />
            <NeonThread start={[0, 0, 1.5]} end={[0, 0, 0]} visiblePhase={phase} />
            
            <NeonThread start={[0, 0, 9]} end={[3, 0, 9]} visiblePhase={phase} color="#0ea5e9" />
            <NeonThread start={[3, 0, 9]} end={[3, 0, 0]} visiblePhase={phase} color="#0ea5e9" />

            {phase >= 3 && (
              <mesh position={[0, 0.02, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.5, 32, 0, Math.PI / 2]} />
                <meshBasicMaterial color="#ef4444" opacity={isConflict ? 0.4 : 0.08} transparent />
              </mesh>
            )}

            {phase >= 3 && (
              <group position={[wardrobeX + 2, 1, wardrobeY + 1]}>
                <mesh castShadow>
                  <boxGeometry args={[4, 2, 2]} />
                  <meshStandardMaterial 
                    color={isConflict ? "#ef4444" : "#d4aa70"} 
                    roughness={0.7} 
                    emissive={isConflict ? "#ef4444" : "#000000"}
                    emissiveIntensity={isConflict ? 0.4 : 0}
                  />
                </mesh>
                <Text position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} fontWeight="bold" color={isConflict ? "#ffffff" : "#44403c"}>
                  Wardrobe
                </Text>
              </group>
            )}

            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={10} color="#000000" position={[6, -0.05, 5]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
          <Compass className="text-emerald-500" /> Reiaan's Tactile Blueprint
        </h2>
        <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
          Understanding the Cartesian grid through physical space.
        </p>
      </div>

      {/* FLOATING CONTROLS & AHA! MOMENT */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row items-end gap-4 pointer-events-none">
        
        {/* Coordinate Inputs */}
        <div className="w-full md:w-80 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-5 shadow-2xl flex flex-col justify-center relative overflow-hidden pointer-events-auto">
          {phase < 3 && <div className="absolute inset-0 bg-stone-950/60 z-10" />}
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <MapPin size={14} /> Anchor Coordinates
          </label>
          
          <div className="flex items-center gap-5">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>X-Axis</span> <span className="font-bold">{wardrobeX}</span>
              </div>
              <input 
                type="range" min="0" max="8" step="1" 
                value={wardrobeX} onChange={(e) => setWardrobeX(parseInt(e.target.value))} 
                className="w-full accent-emerald-500" 
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>Y-Axis</span> <span className="font-bold">{wardrobeY}</span>
              </div>
              <input 
                type="range" min="0" max="8" step="1" 
                value={wardrobeY} onChange={(e) => setWardrobeY(parseInt(e.target.value))} 
                className="w-full accent-emerald-500" 
              />
            </div>
          </div>
        </div>

        {/* Dynamic Feedback Panel */}
        <div className="flex-1 relative w-full pointer-events-auto">
          <AnimatePresence mode="wait">
            {phase < 3 ? (
              <motion.div key="loading" className="h-full bg-stone-900/90 backdrop-blur-md border border-stone-800 p-5 rounded-xl flex items-center justify-center shadow-2xl">
                <p className="text-stone-400 text-sm italic">Constructing tactile environment...</p>
              </motion.div>
            ) : isConflict ? (
              <motion.div 
                key="conflict"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                className="h-full bg-rose-950/80 backdrop-blur-md border border-rose-900/50 p-5 rounded-xl flex items-start gap-4 shadow-2xl"
              >
                <AlertCircle size={24} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-400 uppercase tracking-widest text-xs mb-1">Spatial Collision</h3>
                  <p className="text-rose-100/90 text-sm leading-relaxed">
                    By placing the wardrobe anchor at <strong>({wardrobeX}, {wardrobeY})</strong>, its physical dimensions (4x2) intersect with the bathroom door's swing radius. In architecture, a coordinate isn't just a number—it dictates physical reality.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="safe"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                className="h-full bg-emerald-950/80 backdrop-blur-md border border-emerald-900/50 p-5 rounded-xl flex items-start gap-4 shadow-2xl"
              >
                <MapPin size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-400 uppercase tracking-widest text-xs mb-1">Clear Pathway</h3>
                  <p className="text-emerald-50/90 text-sm leading-relaxed">
                    The placement at <strong>({wardrobeX}, {wardrobeY})</strong> safely bypasses the door's arc. Notice how the origin $O(0,0)$ provides a universal reference point, allowing Reiaan to navigate the 12x10 grid with absolute precision.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}