'use client';

import React, { useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Text, Environment, ContactShadows, Line } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ArgandMirror() {
  // State for the complex number z = x + iy[cite: 21]
  const [z, setZ] = useState({ x: 3, y: 4 });
  const [isDragging, setIsDragging] = useState(false);

  // Modulus calculation: |z| = sqrt(x² + y²)[cite: 21]
  const modulus = Math.sqrt(z.x * z.x + z.y * z.y);

  // --- STYLUS / POINTER INTERACTION ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    setZ({ x: e.point.x, y: e.point.y });
  };

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      setZ({ x: e.point.x, y: e.point.y });
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Argand Mirror</h2>
          <p className="text-stone-400 text-sm max-w-xl mb-4">
            Drag the glowing blue orb (z) around the four quadrants[cite: 21].
          </p>
        </div>

        {/* MATH HUD */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl min-w-[250px]">
          <div className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <span className="text-blue-400">Complex (z)</span>
              <span className="text-white font-bold">{z.x.toFixed(1)} {z.y >= 0 ? '+' : '-'} {Math.abs(z.y).toFixed(1)}i</span>
            </div>
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <span className="text-red-400">Conjugate (z̄)</span>
              <span className="text-white font-bold">{z.x.toFixed(1)} {(-z.y) >= 0 ? '+' : '-'} {Math.abs(z.y).toFixed(1)}i</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>Modulus |z| = |z̄|</span>
              <span className="font-bold">{modulus.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/95 border border-stone-700 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-2">Physical Reflection</p>
          <p className="text-stone-300 text-sm leading-relaxed mb-3">
            The conjugate is literally a physical mirror reflection across the real axis[cite: 21]. Notice that as you drag the orb into any quadrant, the absolute length of both neon tethers remains identical[cite: 21]. 
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        {/* Camera looks directly down the Z-axis at the X-Y plane for 2D graphing */}
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 5, 5]} intensity={1.5} />
            <Environment preset="city" />

            {/* INVISIBLE CAPTURE PLANE for tracking stylus/pointer drags */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              visible={false}
            >
              <planeGeometry args={[50, 50]} />
              <meshBasicMaterial />
            </mesh>

            <group>
              {/* ARGAND PLANE AXES */}
              <Line points={[new THREE.Vector3(-10, 0, -0.1), new THREE.Vector3(10, 0, -0.1)]} color="#57534e" lineWidth={2} />
              <Line points={[new THREE.Vector3(0, -10, -0.1), new THREE.Vector3(0, 10, -0.1)]} color="#57534e" lineWidth={2} />
              
              <Text position={[6, 0.4, 0]} fontSize={0.3} color="#a8a29e" anchorX="center" anchorY="middle">Real (x)</Text>
              <Text position={[0.6, 6, 0]} fontSize={0.3} color="#a8a29e" anchorX="center" anchorY="middle">Imaginary (iy)</Text>

              {/* GRID TICKS */}
              {Array.from({ length: 21 }, (_, i) => i - 10).map((num) => (
                <group key={num}>
                  {num !== 0 && (
                    <>
                      <Line points={[new THREE.Vector3(num, -0.1, -0.1), new THREE.Vector3(num, 0.1, -0.1)]} color="#78716c" />
                      <Line points={[new THREE.Vector3(-0.1, num, -0.1), new THREE.Vector3(0.1, num, -0.1)]} color="#78716c" />
                    </>
                  )}
                </group>
              ))}

              {/* PRIMARY ORB (z) */}
              <mesh position={[z.x, z.y, 0.1]} pointerEvents="none">
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
              </mesh>
              
              {/* GHOST ORB (Conjugate z̄) mechanically locked to -y[cite: 21] */}
              <mesh position={[z.x, -z.y, 0.1]} pointerEvents="none">
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} transparent opacity={0.8} />
              </mesh>

              {/* TETHERS (Neon lines from origin to orbs)[cite: 21] */}
              <Line 
                points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(z.x, z.y, 0)]} 
                color="#60a5fa" 
                lineWidth={3} 
              />
              <Line 
                points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(z.x, -z.y, 0)]} 
                color="#f87171" 
                lineWidth={3} 
                dashed 
                dashScale={10} 
              />

              {/* LIVE NUMERIC LABELS (Modulus calculations)[cite: 21] */}
              {/* Midpoint of Z tether */}
              <Text position={[z.x / 2 - 0.5, z.y / 2 + 0.3, 0.2]} fontSize={0.35} color="#60a5fa">
                {modulus.toFixed(2)}
              </Text>
              {/* Midpoint of Conjugate tether */}
              <Text position={[z.x / 2 - 0.5, -z.y / 2 - 0.3, 0.2]} fontSize={0.35} color="#f87171">
                {modulus.toFixed(2)}
              </Text>
              
              {/* Label 'z' next to orb */}
              <Text position={[z.x + 0.4, z.y + 0.4, 0.2]} fontSize={0.4} color="#3b82f6">
                z
              </Text>
              {/* Label 'z̄' next to ghost orb */}
              <Text position={[z.x + 0.4, -z.y - 0.4, 0.2]} fontSize={0.4} color="#ef4444">
                z̄
              </Text>

            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.3} far={10} position={[0, -5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}