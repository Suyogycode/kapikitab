'use client';

import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import { Play, FastForward, RotateCcw, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// MATH ENGINE: Calculate the blocks for each year
// ==================================================================
const PRINCIPAL = 6000;
const RATE = 0.10; // 10% interest
const MAX_YEARS = 20;
const SCALE = 0.002; // Visual height scale (1 unit = ₹500)

function generateBlocks(years: number) {
  const simpleBlocks = [];
  const compoundBlocks = [];
  
  let currentYSimple = 0;
  let currentYCompound = 0;
  let currentPrincipal = PRINCIPAL;

  // The Base Blocks (Principal)
  const pHeight = PRINCIPAL * SCALE;
  simpleBlocks.push({ id: 's-base', val: PRINCIPAL, h: pHeight, y: pHeight / 2, type: 'base' });
  compoundBlocks.push({ id: 'c-base', val: PRINCIPAL, h: pHeight, y: pHeight / 2, type: 'base' });
  
  currentYSimple = pHeight;
  currentYCompound = pHeight;

  let totalSimple = PRINCIPAL;
  let totalCompound = PRINCIPAL;
  let lastCompoundInterest = 0;

  for (let i = 1; i <= years; i++) {
    // Simple Interest (Always 10% of original 6000 = 600)
    const sInterest = PRINCIPAL * RATE;
    const sHeight = sInterest * SCALE;
    simpleBlocks.push({ id: `s-${i}`, val: sInterest, h: sHeight, y: currentYSimple + (sHeight / 2), type: 'interest' });
    currentYSimple += sHeight;
    totalSimple += sInterest;

    // Compound Interest (10% of current accumulated principal)
    const cInterest = currentPrincipal * RATE;
    const cHeight = cInterest * SCALE;
    compoundBlocks.push({ id: `c-${i}`, val: cInterest, h: cHeight, y: currentYCompound + (cHeight / 2), type: 'interest' });
    currentYCompound += cHeight;
    currentPrincipal += cInterest;
    totalCompound += cInterest;
    lastCompoundInterest = cInterest;
  }

  return { simpleBlocks, compoundBlocks, totalSimple, totalCompound, lastCompoundInterest };
}

// ==================================================================
// NATIVE R3F ENGINE
// ==================================================================
function FallingBlock({ h, y, x, color, delay = 0, isBase = false }: { h: number, y: number, x: number, color: string, delay?: number, isBase?: boolean }) {
  const blockRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!blockRef.current) return;
    
    // The blocks drop in from above (y = 40) down to their calculated stacking position
    const startY = isBase ? y : 40;
    
    if (blockRef.current.position.y > y + 0.01) {
      blockRef.current.position.y = THREE.MathUtils.lerp(blockRef.current.position.y, y, delta * 8);
    } else {
      blockRef.current.position.y = y; // Lock it cleanly
    }
  });

  // Initial mount position
  const initialY = isBase ? y : 40;

  return (
    <mesh ref={blockRef} position={[x, initialY, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.5, h - 0.05, 2.5]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function WealthVaults() {
  const [year, setYear] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const { simpleBlocks, compoundBlocks, totalSimple, totalCompound, lastCompoundInterest } = useMemo(() => generateBlocks(year), [year]);

  // Fast Forward Engine
  useEffect(() => {
    if (isAutoPlaying) {
      if (year < MAX_YEARS) {
        const timer = setTimeout(() => {
          setYear(y => y + 1);
        }, 150); // Fast drop every 150ms
        return () => clearTimeout(timer);
      } else {
        setIsAutoPlaying(false);
      }
    }
  }, [isAutoPlaying, year]);

  const advanceYear = () => { if (year < MAX_YEARS) setYear(year + 1); };
  const reset = () => { setYear(0); setIsAutoPlaying(false); };

  // Calculate the camera target so it pans up as the towers grow
  const cameraTargetY = Math.min(25, 5 + (year * 0.8));
  const cameraPosY = Math.min(30, 10 + (year * 1.2));

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">The Wealth Vaults</h2>
        <p className="text-stone-400 text-sm mt-1">Linear vs. Exponential Growth</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 10, 30], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            {/* The R3F equivalent of dynamically moving the camera */}
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 - 0.05} 
              target={[0, cameraTargetY, 0]} 
            />

            <group position={[0, -2, 0]}>
              
              {/* Glass Vault Casings */}
              <mesh position={[-4, 15, 0]} renderOrder={1}>
                <boxGeometry args={[4, 30, 4]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.1} roughness={0.1} depthWrite={false} />
              </mesh>
              <mesh position={[4, 15, 0]} renderOrder={1}>
                <boxGeometry args={[4, 30, 4]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.1} roughness={0.1} depthWrite={false} />
              </mesh>

              {/* Pedestal Base */}
              <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[14, 1, 6]} />
                <meshStandardMaterial color="#1c1917" roughness={0.9} />
              </mesh>

              {/* Render Simple Blocks */}
              {simpleBlocks.map((block) => (
                <FallingBlock 
                  key={block.id} 
                  h={block.h} y={block.y} x={-4} 
                  color={block.type === 'base' ? '#292524' : '#3b82f6'} 
                  isBase={block.type === 'base'}
                />
              ))}

              {/* Render Compound Blocks */}
              {compoundBlocks.map((block) => (
                <FallingBlock 
                  key={block.id} 
                  h={block.h} y={block.y} x={4} 
                  color={block.type === 'base' ? '#292524' : '#10b981'} 
                  isBase={block.type === 'base'}
                />
              ))}
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.7} far={10} color="#000000" />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: The Math HUD */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-10 pointer-events-none flex flex-col gap-4">
        
        {/* AHA! Message (Shows on Year 2 when the recalculation happens) */}
        <AnimatePresence>
          {year === 2 && !isAutoPlaying && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="mx-auto bg-emerald-950/80 backdrop-blur-md border border-emerald-900 text-emerald-200 p-4 rounded-xl flex items-start gap-3 shadow-2xl pointer-events-auto max-w-xl"
            >
              <AlertCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <strong>The Recalculation:</strong> Vault A received another standard ₹600 block. But Vault B recalculated 10% based on the <em>new</em> total (₹6,600). The engine dropped a slightly thicker ₹660 block!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-4 items-end pointer-events-auto">
          
          {/* Vault A Stats */}
          <div className="flex-1 bg-stone-900/90 backdrop-blur-md border border-stone-800 p-5 rounded-2xl shadow-xl">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1 flex justify-between">
              <span>Vault A (Simple)</span>
              {year > 0 && <span className="text-blue-400">+₹600/yr</span>}
            </h3>
            <div className="text-3xl font-mono font-bold text-blue-400 mb-2">₹{totalSimple.toLocaleString()}</div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <motion.div className="bg-blue-500 h-full" animate={{ width: `${(totalSimple / 40365) * 100}%` }} />
            </div>
          </div>

          {/* Central Controls */}
          <div className="shrink-0 flex flex-col items-center bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 gap-2">
            <div className="text-stone-300 font-mono text-sm px-4">Year <span className="text-xl font-bold text-white">{year}</span> / 20</div>
            <div className="flex gap-2">
              <button 
                onClick={advanceYear} disabled={year === MAX_YEARS || isAutoPlaying}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                <Play size={14} /> +1 Year
              </button>
              <button 
                onClick={() => setIsAutoPlaying(true)} disabled={year === MAX_YEARS || isAutoPlaying}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1 shadow-lg shadow-emerald-900/50"
              >
                <FastForward size={14} /> Fast Forward
              </button>
              <button 
                onClick={reset} disabled={year === 0 || isAutoPlaying}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-400 rounded-xl transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Vault B Stats */}
          <div className="flex-1 bg-stone-900/90 backdrop-blur-md border border-emerald-900/30 p-5 rounded-2xl shadow-xl">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1 flex justify-between">
              <span>Vault B (Compound)</span>
              {year > 0 && <span className="text-emerald-400">+₹{lastCompoundInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</span>}
            </h3>
            <div className="text-3xl font-mono font-bold text-emerald-400 mb-2 flex items-center gap-2">
              ₹{totalCompound.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              {year === MAX_YEARS && <TrendingUp size={24} className="text-emerald-500 animate-pulse" />}
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <motion.div className="bg-emerald-500 h-full" animate={{ width: `${(totalCompound / 40365) * 100}%` }} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}