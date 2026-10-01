'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, ContactShadows } from '@react-three/drei';

// ==================================================================
// PROCEDURAL FRACTAL TREE ENGINE
// ==================================================================
function buildTreeData(maxGenerations: number) {
  const positions: number[] = [];
  const colors: number[] = [];

  const addBranch = (start: THREE.Vector3, dir: THREE.Vector3, length: number, gen: number) => {
    if (gen > maxGenerations) return;

    const end = start.clone().add(dir.clone().multiplyScalar(length));

    // Store line segment vertices
    positions.push(start.x, start.y, start.z);
    positions.push(end.x, end.y, end.z);

    // Dynamic color gradient: Newest generation glows Emerald, older generations are Blue
    const isLatest = gen === maxGenerations;
    const r = isLatest ? 0.06 : 0.23; // Emerald (0x10b981) vs Blue (0x3b82f6)
    const g = isLatest ? 0.72 : 0.51;
    const b = isLatest ? 0.51 : 0.96;
    
    colors.push(r, g, b, r, g, b); // Color for both start and end vertices

    // Branching logic: Split into 2 and spread out in 3D
    const splitAngle = 0.55; 
    
    // Alternate the split axis per generation to create a dense 3D canopy
    const splitAxis = gen % 2 === 0 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    
    const dir1 = dir.clone().applyAxisAngle(splitAxis, splitAngle).normalize();
    const dir2 = dir.clone().applyAxisAngle(splitAxis, -splitAngle).normalize();

    // Recursively build the next generation with slightly shorter branches
    addBranch(end, dir1, length * 0.82, gen + 1);
    addBranch(end, dir2, length * 0.82, gen + 1);
  };

  const root = new THREE.Vector3(0, -4, 0);
  const initialDir = new THREE.Vector3(0, 1, 0); 

  // For n=1, the trunk immediately splits into 2 branches (a1 = 2)[cite: 20]
  const firstSplitAxis = new THREE.Vector3(0, 0, 1);
  const dir1 = initialDir.clone().applyAxisAngle(firstSplitAxis, 0.4).normalize();
  const dir2 = initialDir.clone().applyAxisAngle(firstSplitAxis, -0.4).normalize();

  if (maxGenerations >= 1) {
    addBranch(root, dir1, 3.5, 1);
    addBranch(root, dir2, 3.5, 1);
  }

  return { 
    positions: new Float32Array(positions), 
    colors: new Float32Array(colors) 
  };
}

// ==================================================================
// CINEMATIC CAMERA CONTROLLER
// ==================================================================
function CinematicCamera({ isAhaMoment }: { isAhaMoment: boolean }) {
  useFrame((state, delta) => {
    // Aha Moment: Pull back to a bird's-eye view stacking the horizontal layers[cite: 20]
    // Standard View: Stand at the root looking up into the canopy
    const targetPos = isAhaMoment 
      ? new THREE.Vector3(0, 26, 0.1) 
      : new THREE.Vector3(0, -2, 22);
      
    const targetLook = isAhaMoment 
      ? new THREE.Vector3(0, 5, 0) 
      : new THREE.Vector3(0, 8, 0);

    // Smoothly fly the camera
    state.camera.position.lerp(targetPos, delta * 1.5);
    
    // Smoothly interpolate the camera rotation
    const currentQuat = state.camera.quaternion.clone();
    state.camera.lookAt(targetLook);
    const targetQuat = state.camera.quaternion.clone();
    state.camera.quaternion.copy(currentQuat).slerp(targetQuat, delta * 2.5);
  });
  
  return null;
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AncestralBranchingEngine() {
  const [n, setN] = useState<number>(1);

  // Generate the fractal tree data dynamically when 'n' changes[cite: 20]
  const treeData = useMemo(() => buildTreeData(n), [n]);

  // Safely construct the buffer geometry in memory to satisfy TypeScript
  const treeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    if (treeData.positions.length > 0) {
      geo.setAttribute('position', new THREE.BufferAttribute(treeData.positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(treeData.colors, 3));
    }
    return geo;
  }, [treeData]);
  
  const isAhaMoment = n === 10;
  
  // Geometric Progression Math: a_n = a * r^(n-1)
  const endpoints = Math.pow(2, n); 

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Ancestral Branching Engine</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing the n<sup>th</sup> Term of a Geometric Progression[cite: 20].
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Generations (n)</span>
            <span className="text-emerald-400 font-mono font-bold text-lg">{n}</span>
          </div>
          
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1" 
            value={n} 
            onChange={(e) => setN(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-4"
          />

          <div className="flex flex-col gap-2 font-mono text-sm bg-stone-950 p-3 rounded-lg border border-stone-800">
            <div className="flex justify-between items-center text-stone-300">
              <span>Formula (a<sub>n</sub>):</span>
              <span className="font-bold text-white">2(2)<sup>{n}-1</sup></span>
            </div>
            <div className="flex justify-between items-center text-stone-300">
              <span>Active Endpoints:</span>
              <span className={`font-bold ${isAhaMoment ? 'text-emerald-400' : 'text-blue-400'}`}>
                {endpoints}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      {isAhaMoment && (
        <div className="absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Exponential Mass</p>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
              The camera instantly pulls back to a bird&apos;s-eye view, stacking the horizontal layers of the tree[cite: 20]. You can physically see that the 10th generation layer contains geometrically more volume than all previous layers combined[cite: 20]. 
            </p>
            <div className="inline-block bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-base font-bold text-white">
              <span className="text-stone-400 mr-2">Abstract Formula:</span> a<sub>10</sub> = 2(2)<sup>10-1</sup> = <span className="text-emerald-400">1024</span>[cite: 20]
            </div>
          </div>
        </div>
      )}

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <Environment preset="city" />

            <CinematicCamera isAhaMoment={isAhaMoment} />

            {/* FRACTAL TREE RENDERER */}
            <group>
              {treeData.positions.length > 0 && (
                <lineSegments geometry={treeGeometry}>
                  <lineBasicMaterial vertexColors={true} linewidth={2} transparent opacity={0.9} />
                </lineSegments>
              )}
              
              {/* Ground Label / Root Context */}
              <Text position={[0, -4.5, 0]} fontSize={0.6} color="#57534e" rotation={[-Math.PI / 2, 0, 0]}>
                Generation 0 (Student)
              </Text>
            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.3} far={10} position={[0, -4.2, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}