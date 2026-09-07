'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, ContactShadows } from '@react-three/drei';
import { Box, Maximize2, Minimize2, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE 3D PHYSICS BLOCK
// ==================================================================
function AnimatedBlock({ size, packedPos, isExploded, color, label }: any) {
  const ref = useRef<THREE.Group>(null);
  
  // The outward explosion factor
  const EXPLODE_MULTIPLIER = 1.8;
  const explodedPos = [
    packedPos[0] * EXPLODE_MULTIPLIER,
    packedPos[1] * EXPLODE_MULTIPLIER,
    packedPos[2] * EXPLODE_MULTIPLIER,
  ];

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = isExploded ? explodedPos : packedPos;
    
    // Smooth, heavy 3D lerping
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, target[0], delta * 4);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, target[1], delta * 4);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, target[2], delta * 4);
  });

  return (
    <group ref={ref} position={packedPos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.1} 
          transparent 
          opacity={0.85} 
          clearcoat={1}
        />
      </mesh>
      
      {/* Label sitting on the front face of the block */}
      <Text 
        position={[0, 0, size[2] / 2 + 0.01]} 
        fontSize={Math.min(...size) * 0.4} 
        fontWeight="bold" 
        color="#ffffff" 
        outlineWidth={0.02} 
        outlineColor="#000000"
      >
        {label}
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN ENGINE
// ==================================================================
export default function CubicExploder() {
  const [a, setA] = useState<number>(3);
  const [b, setB] = useState<number>(2);
  const [isExploded, setIsExploded] = useState<boolean>(false);

  // Volume calculations for the HUD
  const volA3 = Math.pow(a, 3);
  const volB3 = Math.pow(b, 3);
  const volA2B = Math.pow(a, 2) * b;
  const volAB2 = a * Math.pow(b, 2);
  const totalVolume = Math.pow(a + b, 3);

  // Spatial Coordinate Math
  // We center the entire (a+b) cube at [0,0,0] by subtracting the offset from every block
  const offset = (a + b) / 2;
  
  // Helper to calculate exact center positions for the 8 chunks
  const pA = a / 2 - offset;
  const pB = a + b / 2 - offset;

  // The 8 Blocks making up (a+b)³
  const blocks = [
    // 1x a³ Cube (Emerald)
    { id: 'a3', size: [a, a, a], pos: [pA, pA, pA], color: '#10b981', label: 'a³' },
    
    // 3x a²b Cuboids (Sky Blue)
    { id: 'a2b-1', size: [b, a, a], pos: [pB, pA, pA], color: '#0ea5e9', label: 'a²b' },
    { id: 'a2b-2', size: [a, b, a], pos: [pA, pB, pA], color: '#0ea5e9', label: 'a²b' },
    { id: 'a2b-3', size: [a, a, b], pos: [pA, pA, pB], color: '#0ea5e9', label: 'a²b' },

    // 3x ab² Cuboids (Amber)
    { id: 'ab2-1', size: [b, b, a], pos: [pB, pB, pA], color: '#f59e0b', label: 'ab²' },
    { id: 'ab2-2', size: [b, a, b], pos: [pB, pA, pB], color: '#f59e0b', label: 'ab²' },
    { id: 'ab2-3', size: [a, b, b], pos: [pA, pB, pB], color: '#f59e0b', label: 'ab²' },

    // 1x b³ Cube (Rose)
    { id: 'b3', size: [b, b, b], pos: [pB, pB, pB], color: '#f43f5e', label: 'b³' },
  ];

  return (
    <div className="w-full h-full min-h-[800px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col">
      
      {/* 3D SPATIAL CANVAS (FULL BLEED) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [8, 6, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <directionalLight position={[-10, -5, -10]} intensity={0.5} />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={true} 
              autoRotate={!isExploded} 
              autoRotateSpeed={0.5} 
              maxPolarAngle={Math.PI / 1.5} 
            />

            <group position={[0, 1, 0]}>
              {blocks.map((block) => (
                <AnimatedBlock
                  key={block.id}
                  size={block.size}
                  packedPos={block.pos}
                  isExploded={isExploded}
                  color={block.color}
                  label={block.label}
                />
              ))}
            </group>

            <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.6} far={10} color="#000000" position={[0, -2, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Box className="text-emerald-500" /> The 3D Cubic Exploder
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Visualizing the volume identity $(a + b)^3$
          </p>
        </div>
      </div>

      {/* FLOATING CONTROLS & HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col xl:flex-row gap-6 pointer-events-none">
        
        {/* Dimension Controls */}
        <div className="w-full xl:w-72 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-5 shadow-2xl pointer-events-auto shrink-0 flex flex-col justify-center">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            Cube Dimensions
          </h3>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-[10px] text-stone-400 font-mono mb-2">
                <span className="uppercase tracking-widest font-bold text-emerald-400">Side (a)</span> 
                <span className="font-bold text-white">{a} units</span>
              </div>
              <input type="range" min="2" max="4" step="1" value={a} onChange={(e) => setA(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            
            <div>
              <div className="flex justify-between text-[10px] text-stone-400 font-mono mb-2">
                <span className="uppercase tracking-widest font-bold text-rose-400">Side (b)</span> 
                <span className="font-bold text-white">{b} units</span>
              </div>
              <input type="range" min="1" max="3" step="1" value={b} onChange={(e) => setB(parseInt(e.target.value))} className="w-full accent-rose-500" />
            </div>
            
            <button 
              onClick={() => setIsExploded(!isExploded)}
              className={`w-full py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg border ${
                isExploded 
                  ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' 
                  : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
              }`}
            >
              {isExploded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              {isExploded ? 'Collapse Cube' : 'Expand Cube'}
            </button>
          </div>
        </div>

        {/* Mathematical Translation HUD */}
        <div className="flex-1 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="text-emerald-500" size={18} />
              <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Algebraic Catalog</h3>
            </div>
            <span className="text-stone-500 font-mono text-xs font-bold">Total Volume: {totalVolume}</span>
          </div>
          
          <div className="p-6 font-mono text-sm h-full flex flex-col">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg">
                <div className="text-emerald-400 text-xs font-bold mb-1 uppercase tracking-widest">1x a³ Cube</div>
                <div className="text-white text-lg">{`$${a}^3 = ${volA3}$`}</div>
              </div>
              <div className="bg-sky-950/30 border border-sky-900/50 p-3 rounded-lg">
                <div className="text-sky-400 text-xs font-bold mb-1 uppercase tracking-widest">3x a²b Cuboids</div>
                <div className="text-white text-lg">{`$3(${a}^2 \\times ${b}) = ${3 * volA2B}$`}</div>
              </div>
              <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg">
                <div className="text-amber-400 text-xs font-bold mb-1 uppercase tracking-widest">3x ab² Cuboids</div>
                <div className="text-white text-lg">{`$3(${a} \\times ${b}^2) = ${3 * volAB2}$`}</div>
              </div>
              <div className="bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg">
                <div className="text-rose-400 text-xs font-bold mb-1 uppercase tracking-widest">1x b³ Cube</div>
                <div className="text-white text-lg">{`$${b}^3 = ${volB3}$`}</div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-stone-800">
              <AnimatePresence mode="wait">
                {isExploded ? (
                  <motion.div 
                    key="exploded"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-stone-300 text-xs leading-relaxed font-sans">
                      <strong>The Aha! Moment:</strong> By breaking apart the master cube, we can visually prove the expansion. The total volume $(a+b)^3$ is exactly equal to the sum of these 8 distinct geometric blocks:<br/><br/>
                      <strong className="text-emerald-400 text-sm font-mono bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                        {`$(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$`}
                      </strong>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="collapsed"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-stone-500 text-xs leading-relaxed font-sans">
                      This is a solid cube with an edge length of <strong>(a + b)</strong>.<br/><br/>
                      Click <strong>"Expand Cube"</strong> to fracture it into its 8 algebraic components and explore the interior structure.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}