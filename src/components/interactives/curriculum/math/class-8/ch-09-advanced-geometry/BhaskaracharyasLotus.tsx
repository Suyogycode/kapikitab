'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Line, Text } from '@react-three/drei';
import { Wind, Flower2, Info, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: The Physics Rig
// ==================================================================
function LotusRig({ wind }: { wind: number }) {
  const pivotRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  // The Math:
  // x^2 + 3^2 = (x+1)^2
  // x^2 + 9 = x^2 + 2x + 1
  // 2x = 8  =>  x = 4 (Depth)
  // Stem Length = x + 1 = 5
  // Base distance = 3
  
  const depth = 4;
  const stemLength = 5;
  const base = 3;
  const maxAngle = Math.asin(base / stemLength); // Angle when the lotus touches the water (3 units away)

  useFrame((state, delta) => {
    if (!pivotRef.current || !waterRef.current) return;

    // Calculate target rotation based on wind slider
    const targetAngle = (wind / 100) * maxAngle;
    pivotRef.current.rotation.z = THREE.MathUtils.lerp(pivotRef.current.rotation.z, -targetAngle, delta * 4);

    // Subtle water animation
    waterRef.current.position.y = - (depth / 2) + Math.sin(state.clock.elapsedTime) * 0.05;
  });

  const isLocked = wind === 100;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. The Lake Bed */}
      <mesh position={[1.5, -depth - 0.5, 0]} receiveShadow>
        <boxGeometry args={[10, 1, 6]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>

      {/* 2. The Water Volume (Cross Section) */}
      <mesh ref={waterRef} position={[1.5, -depth / 2, 0]}>
        <boxGeometry args={[10, depth, 6]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.3} roughness={0.1} depthWrite={false} />
      </mesh>

      {/* Water Surface Grid line for clarity */}
      <gridHelper args={[10, 10, 0x0ea5e9, 0x0284c7]} position={[1.5, 0, 0]} />

      {/* 3. The Lotus Stem Pivot Rig */}
      <group position={[0, -depth, 0]} ref={pivotRef}>
        
        {/* The Stem */}
        <mesh position={[0, stemLength / 2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, stemLength, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.6} />
        </mesh>
        
        {/* The Lotus Flower */}
        <group position={[0, stemLength, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#ec4899" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.15, 0]} castShadow>
            <coneGeometry args={[0.3, 0.5, 8]} />
            <meshStandardMaterial color="#f472b6" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* 4. Architectural Geometry Overlay (Appears only at 100% Wind) */}
      {isLocked && (
        <group position={[0, 0, 0.5]}>
          {/* Vertical Depth Line */}
          <Line points={[[0, -depth, 0], [0, 0, 0]]} color="#facc15" lineWidth={3} dashed dashScale={10} dashSize={0.2} dashOffset={0} />
          <Text position={[-0.3, -depth / 2, 0]} fontSize={0.4} color="#facc15" fontStyle="italic">
            x
          </Text>

          {/* Horizontal Base Line */}
          <Line points={[[0, 0, 0], [base, 0, 0]]} color="#facc15" lineWidth={3} dashed dashScale={10} dashSize={0.2} dashOffset={0} />
          <Text position={[base / 2, 0.3, 0]} fontSize={0.4} color="#facc15" fontStyle="italic">
            3
          </Text>

          {/* Stem Label (Hypotenuse) */}
          <Text position={[1.7, -1.8, 0]} fontSize={0.4} color="#22c55e" fontStyle="italic" rotation={[0, 0, -maxAngle]}>
            x + 1
          </Text>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function BhaskaracharyasLotus() {
  const [wind, setWind] = useState<number>(0);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">Bhāskarāchārya's Lotus</h2>
        <p className="text-stone-400 text-sm mt-1">Līlāvatī: Where Algebra meets Geometry.</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [1.5, -0.5, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minPolarAngle={Math.PI / 2 - 0.2}
              target={[1.5, -2, 0]}
            />
            
            <LotusRig wind={wind} />

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.6} far={10} color="#000000" position={[1.5, -4.4, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Controls & Math HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        {/* AHA! Message (Shows on 100% Wind) */}
        <AnimatePresence mode="wait">
          {wind === 100 ? (
            <motion.div 
              key="aha"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-amber-950/90 backdrop-blur-md border border-amber-500/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xl pointer-events-auto mb-6"
            >
              <BookOpen size={28} className="text-amber-400 shrink-0 mt-1" />
              <div>
                <p className="text-amber-50 text-sm leading-relaxed mb-3">
                  The physics perfectly forms a right-angled triangle. Applying Pythagoras' theorem gives us the equation to find the lake's depth ($x$):
                </p>
                <div className="bg-stone-950 border border-amber-900/50 p-3 rounded-xl inline-block">
                  <div className="font-mono text-emerald-400 text-lg">
                    <span className="text-amber-400">3²</span> + <span className="text-amber-400">x²</span> = <span className="text-emerald-400">(x + 1)²</span>
                  </div>
                  <div className="font-mono text-stone-400 text-sm mt-1 border-t border-stone-800 pt-1">
                    9 + x² = x² + 2x + 1  <br/>
                    8 = 2x  <br/>
                    <strong className="text-white">x = 4</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
             <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-xl bg-black/60 backdrop-blur-md border border-stone-700/50 p-4 rounded-xl flex items-start gap-3 shadow-lg pointer-events-auto mb-6"
            >
              <Info size={20} className="text-stone-400 shrink-0 mt-0.5" />
              <p className="text-stone-300 text-sm leading-relaxed">
                A lotus stem sticks <strong>1 unit</strong> above the water. A gentle breeze blows it sideways until the flower kisses the surface exactly <strong>3 units</strong> away. Use the slider to simulate the wind.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wind Slider */}
        <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-5 shadow-xl pointer-events-auto">
          <div className="flex justify-between items-end mb-3">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Wind size={16} className={wind === 100 ? "text-amber-500" : "text-sky-500"} /> Wind Speed
            </label>
            <span className={`text-sm font-mono font-bold ${wind === 100 ? "text-amber-500" : "text-white"}`}>{wind}%</span>
          </div>
          <input 
            type="range" min="0" max="100" step="1" 
            value={wind} 
            onChange={(e) => setWind(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-sky-500"
          />
        </div>

      </div>

    </div>
  );
}