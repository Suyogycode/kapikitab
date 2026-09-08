'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Triangle, Calculator, Zap, Maximize, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// SHARED 3D RESOURCES (Optimized for 2000+ Meshes)
// ==================================================================
const L = 10; // Master Side Length
const H = L * (Math.sqrt(3) / 2); // Master Height

// Generate the flat geometric shape once
const triangleShape = new THREE.Shape();
triangleShape.moveTo(0, H * 2/3);
triangleShape.lineTo(-L/2, -H/3);
triangleShape.lineTo(L/2, -H/3);
triangleShape.closePath();

const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
const sharedGeometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
const solidMaterial = new THREE.MeshStandardMaterial({ color: "#d6d3d1", roughness: 0.4, metalness: 0.2 });
const dropMaterial = new THREE.MeshStandardMaterial({ color: "#f43f5e", roughness: 0.4, metalness: 0.5, emissive: "#f43f5e", emissiveIntensity: 0.5 });

// ==================================================================
// RECURSIVE ENGINE & PHYSICS
// ==================================================================

// The dropping piece that tumbles into the abyss
function FallingHole({ size, position, active }: { size: number, position: [number, number, number], active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Reset position if stage changes
  const startY = position[1];
  const startRot = Math.PI; // Upside down

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    if (active) {
      // Tumble downwards
      if (meshRef.current.position.y > -30) {
        meshRef.current.position.y -= delta * 15;
        meshRef.current.rotation.x += delta * 5;
        meshRef.current.rotation.z += delta * 2;
      }
    } else {
      // Snap back to starting inverse position if not active
      meshRef.current.position.set(position[0], startY, position[2]);
      meshRef.current.rotation.set(0, 0, startRot);
    }
  });

  // Only render if it's the actively falling stage to save massive amounts of GPU memory
  if (!active) return null;

  return (
    <mesh 
      ref={meshRef} 
      geometry={sharedGeometry} 
      material={dropMaterial} 
      position={position} 
      scale={size / L} 
      rotation={[0, 0, Math.PI]} // Inverted
      castShadow
    />
  );
}

// The core recursive fractal builder
function SierpinskiNode({ depth, maxDepth, size, position }: { depth: number, maxDepth: number, size: number, position: [number, number, number] }) {
  if (depth === maxDepth) {
    // Base Case: Render the solid stone chunk
    return <mesh geometry={sharedGeometry} material={solidMaterial} position={position} scale={size / L} castShadow receiveShadow />;
  }

  // Recursive Case: Calculate positions for the 3 sub-triangles
  const h = size * (Math.sqrt(3) / 2);
  const offset = size / 4;
  const yTop = position[1] + h / 3;
  const yBottom = position[1] - h / 6;

  const topPos: [number, number, number] = [position[0], yTop, position[2]];
  const leftPos: [number, number, number] = [position[0] - offset, yBottom, position[2]];
  const rightPos: [number, number, number] = [position[0] + offset, yBottom, position[2]];
  
  // The center hole position
  const centerPos: [number, number, number] = [position[0], position[1] + h/12, position[2]];

  return (
    <group>
      <SierpinskiNode depth={depth + 1} maxDepth={maxDepth} size={size / 2} position={topPos} />
      <SierpinskiNode depth={depth + 1} maxDepth={maxDepth} size={size / 2} position={leftPos} />
      <SierpinskiNode depth={depth + 1} maxDepth={maxDepth} size={size / 2} position={rightPos} />
      
      {/* Spawn the falling laser-cut piece only exactly when the depth transitions */}
      <FallingHole size={size / 2} position={centerPos} active={maxDepth === depth + 1} />
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SierpinskiFractalForge() {
  const [stage, setStage] = useState<number>(0);

  // Math calculations for HUD
  const triangleCount = Math.pow(3, stage);
  const areaRatio = Math.pow(0.75, stage);
  const areaPercentage = (areaRatio * 100).toFixed(2);

  return (
    <div className="w-full h-full min-h-[800px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col select-none">
      
      {/* 3D SPATIAL CANVAS */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
            <directionalLight position={[-10, -10, -10]} intensity={0.3} />
            <Environment preset="city" />
            
            {/* Allow student to zoom deep into the fractal holes */}
            <OrbitControls enablePan={true} enableZoom={true} minDistance={2} maxDistance={20} />

            <group position={[0, -1, 0]}>
              <SierpinskiNode depth={0} maxDepth={stage} size={L} position={[0, 0, 0]} />
            </group>

            <ContactShadows resolution={1024} scale={30} blur={2.5} opacity={0.6} far={10} color="#000000" position={[0, -5, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* FLOATING HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Triangle className="text-rose-500" /> The Sierpiński Forge
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Geometric Progressions and the Paradox of Infinity.
          </p>
        </div>
        <button 
          onClick={() => setStage(0)}
          className="px-4 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors pointer-events-auto backdrop-blur-md flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Forge
        </button>
      </div>

      {/* CONTROLS & HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row gap-6 pointer-events-none items-end">
        
        {/* Stage Control Slider */}
        <div className="w-full md:w-1/3 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl p-6 pointer-events-auto shrink-0">
          <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            <span className="flex items-center gap-2"><Zap size={14} className="text-rose-500" /> Laser Cut Stage (n)</span>
            <span className="text-white text-lg font-mono">{stage}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="7" 
            step="1" 
            value={stage} 
            onChange={(e) => setStage(parseInt(e.target.value))} 
            className="w-full accent-rose-500" 
          />
          <div className="flex justify-between px-1 mt-2 text-[10px] font-mono text-stone-500 font-bold">
            <span>0 (Solid)</span>
            <span>7 (Microscopic)</span>
          </div>
        </div>

        {/* Dual Mathematical HUD */}
        <div className="flex-1 w-full bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
            <Calculator className="text-emerald-500" size={18} />
            <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Geometric Progression</h3>
          </div>
          
          <div className="p-6 space-y-6 font-mono text-sm">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Triangle Count Progression */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  <span>Triangle Count ($t_n$)</span>
                  <span className="text-sky-400 text-lg font-bold">{triangleCount.toLocaleString()}</span>
                </div>
                <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 flex items-center justify-between text-stone-300">
                  <span>$t_n = 3^n$</span>
                  <span className="text-stone-500">→</span>
                  <span className="font-bold text-sky-400">$3^{stage}$</span>
                </div>
              </div>

              {/* Area Decay Progression */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  <span>Total Area ($S_n$)</span>
                  <span className="text-rose-400 text-lg font-bold">{areaPercentage}%</span>
                </div>
                <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 flex items-center justify-between text-stone-300">
                  <span>$S_n = (3/4)^n$</span>
                  <span className="text-stone-500">→</span>
                  <span className="font-bold text-rose-400">$(0.75)^{stage}$</span>
                </div>
                {/* Visual Area Decay Bar */}
                <div className="w-full bg-stone-950 rounded-full h-1.5 mt-2 border border-stone-800 overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${areaPercentage}%` }}
                    transition={{ type: "spring", bounce: 0 }}
                    className="bg-rose-500 h-full"
                  />
                </div>
              </div>
            </div>

            {/* The "Aha!" Moment Explanation */}
            <div className="pt-4 border-t border-stone-800">
              <AnimatePresence mode="wait">
                {stage >= 5 ? (
                  <motion.div 
                    key="infinite"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl flex items-start gap-3"
                  >
                    <Maximize className="text-rose-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-1">The Paradox of Infinity</h4>
                      <p className="text-rose-100/80 font-sans text-xs leading-relaxed">
                        Grab the canvas and zoom your camera deep into the microscopic holes. Notice how the number of individual pieces is exploding toward infinity (<strong className="text-sky-400">{triangleCount} pieces</strong>), while the physical stone area is vanishing toward absolute zero (<strong className="text-rose-400">{areaPercentage}% remaining</strong>).
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="standard"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-stone-400 text-xs leading-relaxed font-sans flex items-start gap-3">
                      <Zap className="text-stone-500 shrink-0 mt-0.5" size={16} />
                      Scrub the slider to fire the cutting laser. At every tick, the center of every remaining triangle is cut out and dropped into the abyss.
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