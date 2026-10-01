'use client';

import React, { useState, useRef, Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function DirectrixTether() {
  const [a, setA] = useState<number>(2); // Focal length parameter
  const [p, setP] = useState<[number, number]>([a, 2 * a]); // P(x, y) starting on the curve
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasDragged, setHasDragged] = useState<boolean>(false);

  // Focus F(a, 0)
  const focusX = a;
  const focusY = 0;

  // Directrix line x = -a
  const directrixX = -a;

  // Point B on the directrix perfectly horizontal from P
  const bX = directrixX;
  const bY = p[1];

  // Calculate tether lengths
  const lengthPF = Math.sqrt(Math.pow(p[0] - focusX, 2) + Math.pow(p[1] - focusY, 2));
  const lengthPB = Math.abs(p[0] - bX);

  // --- DRAG PHYSICS & MECHANICAL CONSTRAINT ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    
    // The student's vertical drag dictates the Y position[cite: 21]
    let newY = e.point.y;
    
    // Clamp to prevent flying off into infinity
    if (newY > 15) newY = 15;
    if (newY < -15) newY = -15;

    // The mechanical restriction: engine forces X to satisfy y^2 = 4ax[cite: 21]
    const newX = (newY * newY) / (4 * a);

    setP([newX, newY]);
    if (!hasDragged) setHasDragged(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'auto';
  };

  // Reset P position if 'a' changes to keep it on the new curve
  useEffect(() => {
    setP([a, 2 * a]);
    setHasDragged(false);
  }, [a]);

  // Pre-calculate faint background curve for visual guidance
  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let y = -15; y <= 15; y += 0.5) {
      pts.push([(y * y) / (4 * a), y, -0.05]);
    }
    return pts;
  }, [a]);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Directrix Tether</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            A parabola is the set of all points equidistant from a directrix and a focus[cite: 21].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Tether Telemetry</span>
            <span className="text-blue-400 font-mono text-xs font-bold">y² = 4ax</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-300 font-mono text-sm">Focal Length (a)</span>
              <span className="font-bold text-white font-mono">a = {a}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="0.5" 
              value={a} 
              onChange={(e) => setA(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2 bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">Distance PF:</span>
              <span className="font-bold text-emerald-400">{lengthPF.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">Distance PB:</span>
              <span className="font-bold text-emerald-400">{lengthPB.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${hasDragged ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Geometric Boundary</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            The engine mechanically restricts your movement to ensure both tethers remain exactly equal in length[cite: 21]. By forcing you to physically navigate this constraint, you naturally trace the curve $y^2 = 4ax$ in real-time[cite: 21].
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-base font-bold text-white">
            <span className="text-emerald-400 mr-2">PF = PB</span>
            √((x − a)² + y²) = x + a
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={false} 
              enablePan={true} 
              enableZoom={true} 
            />

            {/* INVISIBLE CAPTURE PLANE FOR DRAGGING */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              visible={false}
            >
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial />
            </mesh>

            <group>
              {/* THE GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
              
              {/* X and Y Axes */}
              <Line points={[[-30, 0, -0.1], [30, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={1} />
              <Line points={[[0, -30, -0.1], [0, 30, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={1} />

              {/* DIRECTRIX LINE (x = -a)[cite: 21] */}
              <Line 
                points={[[directrixX, -20, 0], [directrixX, 20, 0]] as [number, number, number][]} 
                color="#f43f5e" 
                lineWidth={3} 
              />
              <Billboard position={[directrixX - 1.5, 12, 0]}>
                <Text fontSize={0.6} color="#fb7185" fontWeight="bold">x = -a</Text>
              </Billboard>

              {/* FOCUS POINT F(a, 0)[cite: 21] */}
              <group position={[focusX, focusY, 0.1]}>
                <mesh>
                  <sphereGeometry args={[0.3, 32, 32]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.8} />
                </mesh>
                <Billboard position={[0, -0.8, 0]}>
                  <Text fontSize={0.5} color="#60a5fa" fontWeight="bold">F({a}, 0)</Text>
                </Billboard>
              </group>

              {/* FAINT BACKGROUND PARABOLA CURVE */}
              <Line 
                points={curvePoints} 
                color="#334155" 
                lineWidth={3} 
              />

              {/* POINT P(x, y)[cite: 21] */}
              <group position={[p[0], p[1], 0.2]}>
                <mesh 
                  onPointerDown={handlePointerDown}
                  onPointerOver={() => document.body.style.cursor = 'grab'}
                  onPointerOut={() => { if(!isDragging) document.body.style.cursor = 'auto' }}
                >
                  <sphereGeometry args={[0.5, 32, 32]} />
                  <meshStandardMaterial color="#fcd34d" emissive="#d97706" emissiveIntensity={0.8} />
                </mesh>
                <Billboard position={[1.5, 1, 0]}>
                  <Text fontSize={0.5} color="#fcd34d" fontWeight="bold">
                    P({p[0].toFixed(1)}, {p[1].toFixed(1)})
                  </Text>
                </Billboard>
              </group>

              {/* LASER TETHERS (PF and PB)[cite: 21] */}
              <group>
                {/* Tether to Focus (PF) */}
                <Line 
                  points={[[p[0], p[1], 0.05], [focusX, focusY, 0.05]] as [number, number, number][]} 
                  color="#10b981" 
                  lineWidth={4} 
                />
                
                {/* Tether to Directrix (PB)[cite: 21] */}
                <Line 
                  points={[[p[0], p[1], 0.05], [bX, bY, 0.05]] as [number, number, number][]} 
                  color="#10b981" 
                  lineWidth={4} 
                />
                
                {/* Directrix Intersection Node B */}
                <mesh position={[bX, bY, 0.1]}>
                  <sphereGeometry args={[0.25, 32, 32]} />
                  <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} />
                </mesh>
                <Billboard position={[bX - 1, bY, 0]}>
                  <Text fontSize={0.4} color="#34d399" fontWeight="bold">B</Text>
                </Billboard>
              </group>

            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, -15, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}