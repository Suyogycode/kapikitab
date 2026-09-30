'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';

// ==================================================================
// MATH LOGIC
// ==================================================================
type Condition = 'even' | 'odd' | 'prime' | 'none';
type Limit = 10 | 20 | 50;

const isPrime = (num: number) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

// ==================================================================
// 3D PARTICLE ENGINE
// ==================================================================
function NumberParticle({ 
  value, 
  startOffset, 
  condition, 
  limit, 
  onSucceed 
}: { 
  value: number; 
  startOffset: number; 
  condition: Condition; 
  limit: Limit; 
  onSucceed: (val: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const passesLogic = useMemo(() => {
    if (value >= limit) return false;
    if (condition === 'even' && value % 2 !== 0) return false;
    if (condition === 'odd' && value % 2 === 0) return false;
    if (condition === 'prime' && !isPrime(value)) return false;
    return true;
  }, [value, condition, limit]);

  const state = useRef({ phase: 'approaching', registered: false });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const pos = groupRef.current.position;

    if (state.current.phase === 'approaching') {
      pos.z -= delta * 4; // Sped up the approach
      
      if (pos.z <= 0) {
        if (passesLogic) {
          state.current.phase = 'falling';
        } else {
          state.current.phase = 'shattering';
        }
      }
    } else if (state.current.phase === 'shattering') {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 0, delta * 15));
      pos.y -= delta * 2;
    } else if (state.current.phase === 'falling') {
      pos.z -= delta * 2;
      if (pos.z < -1) pos.y -= delta * 5;
      
      if (pos.y < -2 && !state.current.registered) {
        state.current.registered = true;
        onSucceed(value);
        groupRef.current.visible = false; 
      }
    }
  });

  return (
    // Start them slightly closer so they enter the screen faster
    <group ref={groupRef} position={[Math.sin(value) * 2, Math.cos(value) * 1.5 + 2, 6 + startOffset]}>
      {/* Removed the missing font prop so it falls back to default */}
      <Text fontSize={0.6} color="#ffffff" anchorX="center" anchorY="middle">
        {value.toString()}
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function SetBuilderSieve() {
  const [condition, setCondition] = useState<Condition>('none');
  const [limit, setLimit] = useState<Limit>(20);
  const [roster, setRoster] = useState<number[]>([]);
  const [key, setKey] = useState(0); 

  const universalSet = useMemo(() => Array.from({ length: 50 }, (_, i) => i + 1), []);

  const handleReset = () => {
    setRoster([]);
    setKey(prev => prev + 1);
  };

  const handleSuccess = (val: number) => {
    setRoster(prev => {
      if (!prev.includes(val)) {
        return [...prev, val].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: THE LOGIC BUILDER */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-auto bg-gradient-to-b from-stone-950 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-4">The Set-Builder Sieve</h2>
        
        {/* Adjusted Flexbox layout to prevent cutoff */}
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center bg-stone-900/90 p-3 sm:p-4 rounded-xl border border-stone-800 backdrop-blur-md max-w-full">
          
          {/* Replaced raw LaTeX with Native Unicode Strings */}
          <div className="text-emerald-400 font-mono text-sm sm:text-lg whitespace-nowrap">
            A = {'{'} x : x ∈ ℕ,
          </div>
          
          <select 
            value={condition} 
            onChange={(e) => { setCondition(e.target.value as Condition); handleReset(); }}
            className="bg-stone-800 text-white border border-stone-700 rounded-lg px-2 sm:px-3 py-1 font-mono text-sm sm:text-base outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="none">no condition</option>
            <option value="even">x is even</option>
            <option value="odd">x is odd</option>
            <option value="prime">x is prime</option>
          </select>
          
          <div className="text-emerald-400 font-mono text-sm sm:text-lg whitespace-nowrap">
            , x &lt;
          </div>
          
          <select 
            value={limit} 
            onChange={(e) => { setLimit(parseInt(e.target.value) as Limit); handleReset(); }}
            className="bg-stone-800 text-white border border-stone-700 rounded-lg px-2 sm:px-3 py-1 font-mono text-sm sm:text-base outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <div className="text-emerald-400 font-mono text-sm sm:text-lg whitespace-nowrap">
            {'}'}
          </div>

          <button 
            onClick={handleReset}
            className="ml-auto px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs sm:text-sm uppercase tracking-wider font-bold transition-colors border border-stone-700 active:scale-95"
          >
            Restart
          </button>
        </div>
      </div>

      {/* ROSTER FORM DISPLAY (THE BUCKET COUNTER) */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/90 border border-emerald-900/50 p-4 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <p className="text-stone-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-2">Roster Form (Collected in Bucket)</p>
          <p className="text-white font-mono text-base sm:text-lg break-words">
            A = {'{'} {roster.join(', ')} {roster.length > 0 && roster.length < limit ? '' : (roster.length === 0 ? '...' : '')} {'}'}
          </p>
        </div>
      </div>

      {/* THE 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        {/* Adjusted Camera to see the whole scene properly */}
        <Canvas camera={{ position: [-5, 3, 7], fov: 55 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={2.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enablePan={false} 
              maxPolarAngle={Math.PI / 2 - 0.1} 
              minDistance={3} 
              maxDistance={12} 
            />

            {/* THE FORCEFIELD */}
            <group position={[0, 2, 0]}>
              <mesh>
                <boxGeometry args={[7, 7, 0.1]} />
                <meshStandardMaterial 
                  color="#10b981" 
                  transparent 
                  opacity={0.2} 
                  emissive="#10b981" 
                  emissiveIntensity={0.8} 
                  roughness={0.1}
                  metalness={0.8}
                />
              </mesh>
              {/* Forcefield Grid/Edges for better visibility */}
              <gridHelper args={[7, 7, '#34d399', '#059669']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]} />
            </group>

            {/* THE BUCKET */}
            <group position={[0, -2, -3]}>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[2.5, 2.0, 1.8, 32, 1, true]} />
                <meshStandardMaterial color="#292524" side={THREE.DoubleSide} roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.9, 0]} receiveShadow>
                <cylinderGeometry args={[2.0, 2.0, 0.1, 32]} />
                <meshStandardMaterial color="#1c1917" />
              </mesh>
            </group>

            {/* PARTICLE EMITTER */}
            <group key={key}>
              {universalSet.map((num, i) => (
                <NumberParticle 
                  key={num} 
                  value={num} 
                  startOffset={i * 1.5} 
                  condition={condition}
                  limit={limit}
                  onSucceed={handleSuccess}
                />
              ))}
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.6} far={10} color="#000000" position={[0, -3, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}