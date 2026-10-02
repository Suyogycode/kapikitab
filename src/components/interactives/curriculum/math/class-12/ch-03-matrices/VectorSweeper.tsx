'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type Phase = 'idle' | 'split' | 'align' | 'sparks' | 'orb' | 'forge';

// ==================================================================
// 3D ENGINE COMPONENTS
// ==================================================================
function MatrixMultiplicationEngine({ phase }: { phase: Phase }) {
  // References for animated groups
  const aRow1Ref = useRef<THREE.Group>(null);
  const aRow2Ref = useRef<THREE.Group>(null);
  const bCol1Ref = useRef<THREE.Group>(null);
  const bCol2Ref = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const sparksRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!aRow1Ref.current || !aRow2Ref.current || !bCol1Ref.current || !bCol2Ref.current || !orbRef.current) return;

    // Default positions
    let targetARow1Pos = new THREE.Vector3(-6, 0.6, 0);
    let targetARow1Rot = 0;
    
    let targetARow2Pos = new THREE.Vector3(-6, -0.6, 0);
    
    let targetBCol1Pos = new THREE.Vector3(5, 0, 0);
    let targetBCol2Pos = new THREE.Vector3(6.2, 0, 0);
    
    let targetOrbPos = new THREE.Vector3(3.8, 0, 0);
    let targetOrbScale = 0.001;

    // Phase 1: Split[cite: 20]
    if (phase === 'split') {
      targetARow1Pos.y = 1.2;
      targetARow2Pos.y = -1.2;
      targetBCol1Pos.x = 4.2;
      targetBCol2Pos.x = 7.0;
    }
    
    // Phase 2: Align[cite: 20]
    if (phase === 'align' || phase === 'sparks' || phase === 'orb') {
      targetARow1Pos = new THREE.Vector3(3.0, 0, 0);
      targetARow1Rot = -Math.PI / 2; // Rotate 90 degrees
      
      targetARow2Pos.y = -1.2;
      targetBCol1Pos.x = 4.2;
      targetBCol2Pos.x = 7.0;
    }

    // Phase 3 & 4: Orb Generation[cite: 20]
    if (phase === 'orb') {
      targetOrbScale = 1;
    }

    // Phase 5: Forge Matrix C[cite: 20]
    if (phase === 'forge') {
      targetARow1Pos = new THREE.Vector3(3.0, 0, 0);
      targetARow1Rot = -Math.PI / 2;
      targetARow2Pos.y = -1.2;
      targetBCol1Pos.x = 4.2;
      targetBCol2Pos.x = 7.0;
      
      targetOrbPos = new THREE.Vector3(-0.6, -3.5, 0); // Slot (1,1) of Matrix C
      targetOrbScale = 1;
    }

    // Apply Animations
    const speed = 4;
    aRow1Ref.current.position.lerp(targetARow1Pos, delta * speed);
    aRow1Ref.current.rotation.z = THREE.MathUtils.lerp(aRow1Ref.current.rotation.z, targetARow1Rot, delta * speed);
    
    aRow2Ref.current.position.lerp(targetARow2Pos, delta * speed);
    bCol1Ref.current.position.lerp(targetBCol1Pos, delta * speed);
    bCol2Ref.current.position.lerp(targetBCol2Pos, delta * speed);
    
    orbRef.current.position.lerp(targetOrbPos, delta * speed);
    orbRef.current.scale.lerp(new THREE.Vector3(targetOrbScale, targetOrbScale, targetOrbScale), delta * speed);
  });

  return (
    <group>
      {/* MATRIX A (2x3) */}
      <Billboard position={[-6, 2.5, 0]}><Text fontSize={0.6} color="#60a5fa" fontWeight="bold">Matrix A (2×3)</Text></Billboard>
      
      {/* Matrix A: Row 1 */}
      <group ref={aRow1Ref}>
        <mesh position={[-1.2, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">1</Text></Billboard></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">2</Text></Billboard></mesh>
        <mesh position={[1.2, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">3</Text></Billboard></mesh>
      </group>

      {/* Matrix A: Row 2 */}
      <group ref={aRow2Ref}>
        <mesh position={[-1.2, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">4</Text></Billboard></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">5</Text></Billboard></mesh>
        <mesh position={[1.2, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">6</Text></Billboard></mesh>
      </group>


      {/* MATRIX B (3x2) */}
      <Billboard position={[5.6, 2.5, 0]}><Text fontSize={0.6} color="#34d399" fontWeight="bold">Matrix B (3×2)</Text></Billboard>

      {/* Matrix B: Col 1 */}
      <group ref={bCol1Ref}>
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">7</Text></Billboard></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">9</Text></Billboard></mesh>
        <mesh position={[0, -1.2, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">11</Text></Billboard></mesh>
      </group>

      {/* Matrix B: Col 2 */}
      <group ref={bCol2Ref}>
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#064e3b" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">8</Text></Billboard></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#064e3b" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">10</Text></Billboard></mesh>
        <mesh position={[0, -1.2, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#064e3b" metalness={0.5} roughness={0.2} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#ffffff">12</Text></Billboard></mesh>
      </group>

      {/* THE SPARKS & ORB (Aha Moment)[cite: 20] */}
      <group ref={sparksRef} visible={phase === 'sparks'}>
        <Line points={[[3.2, 1.2, 0], [4.2, 1.2, 0]] as [number, number, number][]} color="#fcd34d" lineWidth={4} />
        <Line points={[[3.2, 0, 0], [4.2, 0, 0]] as [number, number, number][]} color="#fcd34d" lineWidth={4} />
        <Line points={[[3.2, -1.2, 0], [4.2, -1.2, 0]] as [number, number, number][]} color="#fcd34d" lineWidth={4} />
        <Billboard position={[3.7, 1.6, 0]}><Text fontSize={0.3} color="#fcd34d">1 × 7 = 7</Text></Billboard>
        <Billboard position={[3.7, 0.4, 0]}><Text fontSize={0.3} color="#fcd34d">2 × 9 = 18</Text></Billboard>
        <Billboard position={[3.7, -0.8, 0]}><Text fontSize={0.3} color="#fcd34d">3 × 11 = 33</Text></Billboard>
      </group>

      <mesh ref={orbRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={1} />
        <Billboard position={[0, 0, 0.7]}><Text fontSize={0.5} color="#000000" fontWeight="bold">58</Text></Billboard>
      </mesh>

      {/* MATRIX C FORGE */}
      {phase === 'forge' && (
        <group position={[0, -3.5, 0]}>
          <Billboard position={[0, 1.5, 0]}><Text fontSize={0.6} color="#fcd34d" fontWeight="bold">Matrix C (2×2)</Text></Billboard>
          {/* C(1,2) */}
          <mesh position={[0.6, 0, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#334155" metalness={0.5} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#94a3b8">C₁₂</Text></Billboard></mesh>
          {/* C(2,1) */}
          <mesh position={[-0.6, -1.2, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#334155" metalness={0.5} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#94a3b8">C₂₁</Text></Billboard></mesh>
          {/* C(2,2) */}
          <mesh position={[0.6, -1.2, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#334155" metalness={0.5} /><Billboard position={[0, 0, 0.6]}><Text fontSize={0.5} color="#94a3b8">C₂₂</Text></Billboard></mesh>
        </group>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function VectorSweeper() {
  const [phase, setPhase] = useState<Phase>('idle');

  const advancePhase = () => {
    if (phase === 'idle') setPhase('split');
    else if (phase === 'split') setPhase('align');
    else if (phase === 'align') setPhase('sparks');
    else if (phase === 'sparks') setPhase('orb');
    else if (phase === 'orb') setPhase('forge');
    else setPhase('idle');
  };

  const isAhaMoment = phase === 'align' || phase === 'sparks' || phase === 'orb';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Vector Sweeper</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing why Matrix A columns must equal Matrix B rows to find C = AB[cite: 20].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Multiplication Engine</span>
          </div>
          
          <div className="flex flex-col gap-2 font-mono text-sm mb-4">
            <div className={`p-2 rounded border ${phase === 'split' ? 'border-sky-500/50 text-sky-400 bg-sky-950/30' : 'border-stone-800 text-stone-600'}`}>
              1. Split A into Rows, B into Columns[cite: 20]
            </div>
            <div className={`p-2 rounded border ${phase === 'align' ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              2. Detach Row 1 & Rotate 90°[cite: 20]
            </div>
            <div className={`p-2 rounded border ${phase === 'sparks' ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              3. Element-wise Multiplication (Sparks)[cite: 20]
            </div>
            <div className={`p-2 rounded border ${phase === 'orb' ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' : 'border-stone-800 text-stone-600'}`}>
              4. Sum the Products (Golden Orb)[cite: 20]
            </div>
            <div className={`p-2 rounded border ${phase === 'forge' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30' : 'border-stone-800 text-stone-600'}`}>
              5. Forge Matrix C Slot (1,1)[cite: 20]
            </div>
          </div>

          <button 
            onClick={advancePhase}
            className={`w-full py-2.5 rounded-lg transition-all border font-bold tracking-widest uppercase ${phase === 'forge' ? 'bg-stone-800 text-stone-500 border-stone-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
          >
            {phase === 'idle' ? 'Initiate Multiplication' : 
             phase === 'split' ? 'Align Vectors' : 
             phase === 'align' ? 'Multiply Elements' : 
             phase === 'sparks' ? 'Sum Products' : 
             phase === 'orb' ? 'Lock into Matrix C' : 'Reset Engine'}
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isAhaMoment ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Dimensional Alignment Verified</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            Because A has 3 columns and B has 3 rows, the rotated row of A and the vertical column of B are the exact same physical length[cite: 20]. 
          </p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            {phase === 'sparks' && "Glowing sparks jump between the aligned pairs of numbers (multiplying them)[cite: 20]."}
            {phase === 'orb' && "The three sparks merge into a single golden orb representing the sum of the products[cite: 20]."}
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-base font-bold text-white">
            This physically proves why inner dimensions must match: if they don't, the physical bars won't align[cite: 20].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, -2, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            <MatrixMultiplicationEngine phase={phase} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -6, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}