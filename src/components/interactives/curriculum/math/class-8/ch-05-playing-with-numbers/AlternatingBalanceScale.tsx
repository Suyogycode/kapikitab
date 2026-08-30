'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';
import { Play, RotateCcw, Scale, CheckCircle2, XCircle } from 'lucide-react';

// ==================================================================
// MATH ENGINE
// ==================================================================
const calculateAlternatingSums = (num: number) => {
  const digits = num.toString().split('').map(Number);
  // To alternate properly by place value, we usually start from the right (1s place).
  // But standard left-to-right alternating also works for divisibility by 11!
  // We'll go right-to-left to align with textbook place-value (1s, 10s, 100s).
  digits.reverse(); 
  
  const excessDigits: { val: number; place: string }[] = [];
  const shortDigits: { val: number; place: string }[] = [];
  
  let excessSum = 0;
  let shortSum = 0;

  const places = ['1s', '10s', '100s', '1,000s', '10,000s', '100,000s', '1,000,000s'];

  digits.forEach((digit, i) => {
    if (i % 2 === 0) {
      excessDigits.push({ val: digit, place: places[i] || `10^${i}` });
      excessSum += digit;
    } else {
      shortDigits.push({ val: digit, place: places[i] || `10^${i}` });
      shortSum += digit;
    }
  });

  const difference = excessSum - shortSum;
  const isDivisible = difference % 11 === 0;

  return { excessDigits, shortDigits, excessSum, shortSum, difference, isDivisible };
};

// ==================================================================
// NATIVE R3F COMPONENTS
// ==================================================================
function BalanceBeam({ excessSum, shortSum, phase, isDivisible }: { excessSum: number, shortSum: number, phase: string, isDivisible: boolean }) {
  const beamRef = useRef<THREE.Group>(null);
  const glowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!beamRef.current) return;

    // Calculate target rotation based on weight difference
    let targetRotation = 0;
    
    if (phase === 'weighing' || phase === 'done') {
      const diff = excessSum - shortSum;
      // Cap the maximum tilt so it doesn't spin out of control
      targetRotation = THREE.MathUtils.clamp(diff * 0.05, -0.4, 0.4); 
      
      // The Aha Moment: If it is divisible by 11, the magic of math overrides physics and balances it!
      if (isDivisible && phase === 'done') {
        targetRotation = 0;
      }
    }

    // Smoothly interpolate the beam's rotation
    beamRef.current.rotation.z = THREE.MathUtils.lerp(beamRef.current.rotation.z, targetRotation, delta * 3);

    // Smoothly animate the glow if balanced
    if (glowMaterialRef.current) {
      const targetColor = new THREE.Color((isDivisible && phase === 'done') ? "#10b981" : "#44403c");
      const targetEmissive = new THREE.Color((isDivisible && phase === 'done') ? "#059669" : "#000000");
      glowMaterialRef.current.color.lerp(targetColor, delta * 4);
      glowMaterialRef.current.emissive.lerp(targetEmissive, delta * 4);
    }
  });

  return (
    <group ref={beamRef} position={[0, 2, 0]}>
      {/* The Main Beam */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[8, 0.2, 1]} />
        <meshStandardMaterial ref={glowMaterialRef} color="#44403c" roughness={0.8} />
      </mesh>
      
      {/* Left Platform (Excess) */}
      <mesh position={[-3.5, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      
      {/* Right Platform (Short) */}
      <mesh position={[3.5, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FallingWeight({ val, xOffset, delay, phase }: { val: number, xOffset: number, delay: number, phase: string }) {
  const weightRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!weightRef.current) return;
    
    // Weights drop in from above
    const startY = 8;
    const endY = 2.4;
    
    if (phase === 'weighing' || phase === 'done') {
      // Very basic delayed drop physics using lerp
      setTimeout(() => {
        if (weightRef.current) {
          weightRef.current.position.y = THREE.MathUtils.lerp(weightRef.current.position.y, endY, delta * 8);
          weightRef.current.scale.setScalar(THREE.MathUtils.lerp(weightRef.current.scale.x, 1, delta * 10));
        }
      }, delay);
    } else {
      weightRef.current.position.y = startY;
      weightRef.current.scale.setScalar(0.001);
    }
  });

  return (
    <group ref={weightRef} position={[xOffset, 8, 0]} scale={0.001}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.7} metalness={0.2} />
      </mesh>
      <Text position={[0, 0, 0.31]} fontSize={0.4} color="#1c1917">
        {val}
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function AlternatingBalanceScale() {
  const [inputNum, setInputNum] = useState<number>(2728);
  const [phase, setPhase] = useState<'idle' | 'weighing' | 'done'>('idle');

  const { excessDigits, shortDigits, excessSum, shortSum, difference, isDivisible } = useMemo(() => calculateAlternatingSums(inputNum), [inputNum]);

  const handleWeigh = () => {
    setPhase('weighing');
    // Allow the weights to drop and the scale to tip, then lock the final state
    setTimeout(() => setPhase('done'), 2000);
  };

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-900 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">The Alternating Balance</h2>
        <p className="text-stone-400 text-sm mt-1">Divisibility by 11: <span className="font-mono text-emerald-400">Excess vs. Short</span></p>
      </div>

      {/* INPUT PANEL */}
      <div className="absolute top-6 right-6 z-20 flex gap-3 bg-stone-800/80 backdrop-blur-md p-3 rounded-2xl border border-stone-700">
        <input 
          type="number" 
          value={inputNum} 
          onChange={(e) => {
            setInputNum(Math.max(1, Math.min(9999999, parseInt(e.target.value) || 0)));
            setPhase('idle');
          }}
          disabled={phase !== 'idle'}
          className="w-32 bg-stone-900 text-emerald-400 font-mono text-xl p-2 rounded-xl border border-stone-600 focus:outline-none focus:border-emerald-500 text-center"
        />
        {phase === 'idle' ? (
          <button onClick={handleWeigh} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl flex items-center justify-center transition-colors">
            <Play size={18} />
          </button>
        ) : (
          <button onClick={() => setPhase('idle')} className="bg-stone-700 hover:bg-stone-600 text-white px-4 rounded-xl flex items-center justify-center transition-colors">
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 3, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 - 0.1} />

            {/* The Fulcrum Base */}
            <group position={[0, 0, 0]}>
              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <coneGeometry args={[1, 2, 4]} />
                <meshStandardMaterial color="#292524" roughness={0.9} />
              </mesh>
            </group>

            {/* The Dynamic Beam */}
            <BalanceBeam excessSum={excessSum} shortSum={shortSum} phase={phase} isDivisible={isDivisible} />

            {/* Dropping Weights (Excess goes left -3.5, Short goes right +3.5) */}
            {excessDigits.map((d, i) => (
              <FallingWeight key={`ex-${i}`} val={d.val} xOffset={-3.5} delay={i * 300} phase={phase} />
            ))}
            {shortDigits.map((d, i) => (
              <FallingWeight key={`sh-${i}`} val={d.val} xOffset={3.5} delay={(i * 300) + 150} phase={phase} />
            ))}

            <ContactShadows frames={1} resolution={512} scale={15} blur={2} opacity={0.6} far={10} color="#000000" />
          </Suspense>
        </Canvas>
      </div>

      {/* BOTTOM UI OVERLAY: The Mathematical Breakdown */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-stone-950 to-transparent z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 items-end">
          
          {/* Excess Pan Breakdown */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700 p-4 rounded-xl pointer-events-auto shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Excess Pan (+1)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {excessDigits.map((d, i) => (
                <div key={i} className="bg-stone-800 border border-stone-600 px-2 py-1 rounded text-xs font-mono text-stone-300">
                  {d.val} <span className="text-stone-500">({d.place})</span>
                </div>
              ))}
            </div>
            <div className="text-sm font-bold text-stone-300 border-t border-stone-700 pt-2">
              Sum: <span className="text-emerald-400 text-xl font-mono">{excessSum}</span>
            </div>
          </div>

          {/* Central Verdict */}
          <div className="flex flex-col items-center justify-end h-full pb-2 pointer-events-auto">
            {phase === 'done' && (
              <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 shadow-xl backdrop-blur-md ${isDivisible ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-red-950/80 border-red-900 text-red-300'}`}>
                {isDivisible ? <CheckCircle2 size={24} className="text-emerald-500" /> : <XCircle size={24} className="text-red-500" />}
                <div>
                  <p className="font-mono font-bold text-lg leading-none mb-1">
                    {Math.max(excessSum, shortSum)} - {Math.min(excessSum, shortSum)} = {Math.abs(difference)}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                    {isDivisible ? 'Perfectly Divisible by 11' : 'Not Divisible by 11'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Short Pan Breakdown */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700 p-4 rounded-xl pointer-events-auto shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Short Pan (-1)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {shortDigits.map((d, i) => (
                <div key={i} className="bg-stone-800 border border-stone-600 px-2 py-1 rounded text-xs font-mono text-stone-300">
                  {d.val} <span className="text-stone-500">({d.place})</span>
                </div>
              ))}
            </div>
            <div className="text-sm font-bold text-stone-300 border-t border-stone-700 pt-2">
              Sum: <span className="text-rose-400 text-xl font-mono">{shortSum}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}