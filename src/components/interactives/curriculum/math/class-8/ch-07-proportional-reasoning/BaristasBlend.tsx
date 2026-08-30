'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Coffee, Droplets, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: Liquid Blending Dynamics
// ==================================================================
function CoffeeLiquid({ decoction, milk }: { decoction: number, milk: number }) {
  const liquidRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!liquidRef.current || !materialRef.current) return;

    const total = decoction + milk;
    const maxCapacity = 100;
    
    // Calculate ratio (0 = all milk, 1 = all decoction)
    const ratio = total === 0 ? 0 : decoction / total;

    // The Fix: Never scale to absolute 0 to prevent WebGL Context Loss
    const targetHeight = Math.max(0.001, (total / maxCapacity) * 2.8);
    // Base of the mug is at y = -1.4, so we offset the liquid upward by half its height
    const targetY = -1.4 + (targetHeight / 2);

    // Color mixing: #fdf8f5 (Milk) to #23120b (Dark Decoction)
    const milkColor = new THREE.Color("#fdf8f5");
    const decoctionColor = new THREE.Color("#23120b");
    const targetColor = milkColor.lerp(decoctionColor, ratio);

    // Smoothly interpolate height and position
    liquidRef.current.scale.y = THREE.MathUtils.lerp(liquidRef.current.scale.y, targetHeight, delta * 5);
    liquidRef.current.position.y = THREE.MathUtils.lerp(liquidRef.current.position.y, targetY, delta * 5);

    // Smoothly interpolate the color
    materialRef.current.color.lerp(targetColor, delta * 5);
  });

  return (
    <mesh ref={liquidRef} position={[0, -1.4, 0]}>
      <cylinderGeometry args={[1.35, 1.35, 1, 32]} />
      <meshStandardMaterial ref={materialRef} transparent opacity={0.95} roughness={0.2} />
    </mesh>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function BaristasBlend() {
  const [decoction, setDecoction] = useState<number>(20); // mL
  const [milk, setMilk] = useState<number>(30); // mL

  // ==================================================================
  // MATH ENGINE: Ratio Simplification
  // ==================================================================
  const { simplifiedD, simplifiedM, brewType, message } = useMemo(() => {
    // Greatest Common Divisor
    const getGCD = (a: number, b: number): number => {
      return b === 0 ? a : getGCD(b, a % b);
    };

    let sD = 0;
    let sM = 0;
    let type = "Empty";
    let msg = "Add liquids to begin brewing.";

    if (decoction > 0 || milk > 0) {
      const gcd = getGCD(decoction, milk);
      sD = decoction / gcd;
      sM = milk / gcd;

      const coffeePercentage = decoction / (decoction + milk);

      if (coffeePercentage > 0.6) {
        type = "Strong Dark Roast";
        msg = "A very high ratio of decoction creates a potent, dark blend.";
      } else if (coffeePercentage >= 0.4) {
        type = "Classic Regular Brew";
        msg = "A balanced ratio creates a classic, smooth filter coffee.";
      } else if (coffeePercentage > 0) {
        type = "Light Creamy Blend";
        msg = "A low ratio of decoction results in a pale, milky beverage.";
      } else {
        type = "Pure Milk";
        msg = "Zero decoction means this is just warm milk!";
      }
    }

    return { simplifiedD: sD, simplifiedM: sM, brewType: type, message: msg };
  }, [decoction, milk]);

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-900 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">The Barista's Blend</h2>
        <p className="text-amber-500 text-sm font-mono mt-1">Understanding Ratios</p>
      </div>

      {/* 2D HTML OVERLAY: Live Math Simplifier */}
      <div className="absolute top-6 right-6 z-20 bg-stone-800/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-stone-700 shadow-xl flex flex-col items-center">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Decoction : Milk</span>
        
        <div className="flex items-center gap-3 text-2xl font-mono">
          <span className="text-amber-600">{decoction}</span>
          <span className="text-stone-500">:</span>
          <span className="text-stone-200">{milk}</span>
        </div>
        
        {(decoction > 0 || milk > 0) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-700 w-full justify-center">
            <span className="text-xs text-stone-500 font-mono">Simplifies to</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {simplifiedD} : {simplifiedM}
            </span>
          </div>
        )}
      </div>

      {/* THE 3D ENGINE */}
      {/* Using the absolute inset-0 wrapper to force full dimensions */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 - 0.1} minPolarAngle={Math.PI / 4} />
            
            <group position={[0, 0, 0]}>
              {/* The Glass Mug Shell */}
              <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.4, 1.4, 3, 32]} />
                <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} roughness={0.05} ior={1.5} thickness={0.1} />
              </mesh>

              {/* The Glass Mug Base */}
              <mesh position={[0, -1.55, 0]} receiveShadow>
                <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
                <meshStandardMaterial color="#292524" roughness={0.9} />
              </mesh>

              {/* The Dynamic Blended Liquid */}
              <CoffeeLiquid decoction={decoction} milk={milk} />
            </group>

            {/* Ground Plane for Shadows */}
            <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#1c1917" roughness={0.8} />
            </mesh>

            <ContactShadows frames={1} resolution={512} scale={10} blur={2} opacity={0.6} far={5} />
          </Suspense>
        </Canvas>
      </div>

      {/* BOTTOM UI OVERLAY: Controls & Insights */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={brewType}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xl bg-black/80 backdrop-blur-md border border-stone-700 p-4 rounded-xl shadow-2xl flex items-start gap-4 pointer-events-auto mb-4"
          >
            <Info size={24} className="text-amber-500 shrink-0 mt-1" />
            <div>
              <div className="font-bold text-sm uppercase tracking-widest text-stone-200 mb-1">{brewType}</div>
              <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-auto">
          
          {/* Decoction Slider */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-4 flex flex-col justify-center shadow-lg">
            <div className="flex justify-between items-end mb-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                <Coffee size={14} className="text-amber-700" /> Decoction (mL)
              </label>
              <span className="font-mono text-amber-600 font-bold">{decoction}</span>
            </div>
            <input 
              type="range" min="0" max="50" step="5" 
              value={decoction} 
              onChange={(e) => setDecoction(parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-700"
            />
          </div>

          {/* Milk Slider */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-4 flex flex-col justify-center shadow-lg">
            <div className="flex justify-between items-end mb-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                <Droplets size={14} className="text-stone-300" /> Milk (mL)
              </label>
              <span className="font-mono text-stone-300 font-bold">{milk}</span>
            </div>
            <input 
              type="range" min="0" max="50" step="5" 
              value={milk} 
              onChange={(e) => setMilk(parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-300"
            />
          </div>

        </div>
      </div>

    </div>
  );
}