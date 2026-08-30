'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { Box as BoxIcon, ScanLine, Grid3X3, RotateCcw, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// NATIVE R3F ENGINE: The 3D Shape & Projections
// ==================================================================

// A composite Tetris-like shape (T-block)
function ArchitecturalShape({ isProjection = false, color = "#10b981" }) {
  const material = isProjection 
    ? <meshBasicMaterial color="#000000" opacity={0.8} transparent /> 
    : <meshStandardMaterial color={color} roughness={0.2} metalness={0.1}/>;

  // A wireframe overlay helps define the edges clearly for the isometric view
  const Edges = () => (
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
      <lineBasicMaterial color={isProjection ? "#000000" : "#047857"} linewidth={2} />
    </lineSegments>
  );

  return (
    <group>
      {/* Center Box */}
      <mesh position={[0, 0, 0]} castShadow={!isProjection} receiveShadow={!isProjection}>
        <boxGeometry args={[1, 1, 1]} />
        {material}
        <Edges />
      </mesh>
      {/* Left Box */}
      <mesh position={[-1, 0, 0]} castShadow={!isProjection} receiveShadow={!isProjection}>
        <boxGeometry args={[1, 1, 1]} />
        {material}
        <Edges />
      </mesh>
      {/* Right Box */}
      <mesh position={[1, 0, 0]} castShadow={!isProjection} receiveShadow={!isProjection}>
        <boxGeometry args={[1, 1, 1]} />
        {material}
        <Edges />
      </mesh>
      {/* Top Box */}
      <mesh position={[0, 1, 0]} castShadow={!isProjection} receiveShadow={!isProjection}>
        <boxGeometry args={[1, 1, 1]} />
        {material}
        <Edges />
      </mesh>
    </group>
  );
}

function StudioRig({ phase }: { phase: string }) {
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const controlsRef = useRef<any>(null);
  const projectionsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Camera glide logic for Isometric Mode
    // We use a narrow FOV and position the camera at a perfect diagonal [20, 20, 20]
    if (phase === 'isometric' && controlsRef.current) {
      state.camera.position.lerp(new THREE.Vector3(20, 20, 20), delta * 3);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), delta * 3);
      controlsRef.current.update();
    }

    // Fade in/out the projections
    if (projectionsRef.current) {
      const targetScale = (phase === 'project' || phase === 'isometric') ? 1 : 0.001;
      projectionsRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    }
  });

  return (
    <group>
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true} 
        enablePan={false}
        enabled={phase !== 'isometric'} // Lock controls when in isometric mode
      />

      {/* 1. The Main 3D Shape */}
      <group position={[0, 0, 0]}>
        <ArchitecturalShape />
      </group>

      {/* 2. The Glass Projection Walls */}
      <group position={[0, 0, 0]}>
        {/* Bottom (Top View) */}
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.2} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Back (Front View) */}
        <mesh position={[0, 0, -2]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.2} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Left (Side View) */}
        <mesh position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.2} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>

        {/* Labels for the walls */}
        <Text position={[3, -1.9, 3]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.4} color="#a8a29e">Top View</Text>
        <Text position={[3, 3, -1.9]} fontSize={0.4} color="#a8a29e">Front View</Text>
        <Text position={[-1.9, 3, 3]} rotation={[0, Math.PI/2, 0]} fontSize={0.4} color="#a8a29e">Side View</Text>
      </group>

      {/* 3. The Mathematical 2D Projections (Flat scale on respective axes) */}
      <group ref={projectionsRef} scale={0.001}>
        {/* Projected onto Bottom Wall (Y is flattened to 0.01) */}
        <group position={[0, -1.98, 0]} scale={[1, 0.01, 1]}>
          <ArchitecturalShape isProjection={true} />
        </group>
        {/* Projected onto Back Wall (Z is flattened to 0.01) */}
        <group position={[0, 0, -1.98]} scale={[1, 1, 0.01]}>
          <ArchitecturalShape isProjection={true} />
        </group>
        {/* Projected onto Left Wall (X is flattened to 0.01) */}
        <group position={[-1.98, 0, 0]} scale={[0.01, 1, 1]}>
          <ArchitecturalShape isProjection={true} />
        </group>
      </group>

    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function IsometricArchitect() {
  const [phase, setPhase] = useState<'build' | 'project' | 'isometric'>('build');

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Isometric Grid Background */}
      <AnimatePresence>
        {phase === 'isometric' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zm0 103.92l30-17.32V51.96L30 34.64 0 51.96v34.64l30 17.32z' fill='none' stroke='%2310b981' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 104px',
              backgroundPosition: 'center center'
            }}
          />
        )}
      </AnimatePresence>

      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white flex items-center gap-3">
          <BoxIcon className="text-emerald-500" /> The Isometric Architect
        </h2>
        <p className="text-stone-400 text-sm mt-1">Bridging 3D objects and 2D projections.</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        {/* We use a narrow FOV (15) to simulate an orthographic/isometric perspective mathematically */}
        <Canvas camera={{ position: [8, 6, 12], fov: 15 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 20, 15]} intensity={1.5} />
            <directionalLight position={[-10, -10, -10]} intensity={0.5} />
            
            <StudioRig phase={phase} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Controls & HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        {/* AHA! Message Panel */}
        <AnimatePresence mode="wait">
          {phase === 'project' && (
            <motion.div 
              key="project"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-black/80 backdrop-blur-md border border-stone-700/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xl pointer-events-auto mb-6"
            >
              <ScanLine size={28} className="text-blue-400 shrink-0 mt-1" />
              <p className="text-stone-300 text-sm leading-relaxed">
                By smashing the 3D geometry flat against the XYZ axes, we generate perfect 2D architectural plans. Rotate the camera to look directly at the walls to see the flat <strong>Top, Front, and Side Views</strong>.
              </p>
            </motion.div>
          )}
          {phase === 'isometric' && (
            <motion.div 
              key="iso"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xl pointer-events-auto mb-6"
            >
              <Lightbulb size={28} className="text-emerald-400 shrink-0 mt-1" />
              <div>
                <p className="text-emerald-50 text-sm leading-relaxed">
                  <strong>The Isometric Illusion:</strong> The camera locks to a perfect diagonal viewing angle. Notice how the 3D edges now align flawlessly with the 2D hexagonal grid behind it!
                </p>
                <p className="text-emerald-300 text-xs mt-2 font-mono bg-emerald-950 px-2 py-1 rounded-md inline-block border border-emerald-800">
                  This allows engineers to draw 3D objects accurately on flat dotted paper.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex flex-wrap justify-center gap-3 pointer-events-auto bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl border border-stone-800 shadow-xl">
          
          <button 
            onClick={() => setPhase('build')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 ${phase === 'build' ? 'bg-stone-700 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
          >
            <RotateCcw size={16} /> 1. Free View
          </button>

          <button 
            onClick={() => setPhase('project')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 ${phase === 'project' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-stone-800 text-stone-400 hover:bg-blue-900/50'}`}
          >
            <ScanLine size={16} /> 2. Project 2D Views
          </button>

          <button 
            onClick={() => setPhase('isometric')}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 ${phase === 'isometric' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-800 text-stone-400 hover:bg-emerald-900/50'}`}
          >
            <Grid3X3 size={16} /> 3. Isometric Mode
          </button>
          
        </div>

      </div>

    </div>
  );
}