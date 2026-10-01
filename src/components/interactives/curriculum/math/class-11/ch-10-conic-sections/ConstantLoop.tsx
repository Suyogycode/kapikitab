'use client';

import React, { useState, useRef, Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ConstantLoop() {
  const [a, setA] = useState<number>(10); // Semi-major axis
  const [c, setC] = useState<number>(6);  // Distance to foci
  
  // Calculate Semi-minor axis (b)
  const b = useMemo(() => Math.sqrt(Math.max(0.1, a * a - c * c)), [a, c]);

  const [p, setP] = useState<[number, number]>([0, b]); // P(x,y) Stylus position
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasDragged, setHasDragged] = useState<boolean>(false);
  const [trace, setTrace] = useState<[number, number, number][]>([]);

  // Focus coordinates[cite: 22]
  const F1 = { x: -c, y: 0 };
  const F2 = { x: c, y: 0 };

  // Live distances[cite: 22]
  const PF1 = Math.sqrt(Math.pow(p[0] - F1.x, 2) + Math.pow(p[1] - F1.y, 2));
  const PF2 = Math.sqrt(Math.pow(p[0] - F2.x, 2) + Math.pow(p[1] - F2.y, 2));
  const totalLength = PF1 + PF2;

  // --- DRAG PHYSICS & MECHANICAL CONSTRAINT ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    
    // Calculate angle of user's cursor relative to origin
    const theta = Math.atan2(e.point.y, e.point.x);
    
    // Enforce Ellipse Constraint: Calculate exact radius (r) for this angle
    // Polar equation of an ellipse: r = (a*b) / sqrt((b*cos(t))^2 + (a*sin(t))^2)
    const r = (a * b) / Math.sqrt(Math.pow(b * Math.cos(theta), 2) + Math.pow(a * Math.sin(theta), 2));
    
    const newX = r * Math.cos(theta);
    const newY = r * Math.sin(theta);
    
    setP([newX, newY]);
    
    // Add to trace if moved far enough (to avoid massive arrays)
    if (trace.length === 0) {
      setTrace([[newX, newY, 0]]);
    } else {
      const lastPt = trace[trace.length - 1];
      const dist = Math.sqrt(Math.pow(newX - lastPt[0], 2) + Math.pow(newY - lastPt[1], 2));
      if (dist > 0.3) {
        setTrace((prev) => [...prev, [newX, newY, 0]]);
      }
    }

    if (!hasDragged) setHasDragged(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'auto';
  };

  // Reset Stylus and Trace if parameters change
  useEffect(() => {
    setP([0, Math.sqrt(Math.max(0.1, a * a - c * c))]);
    setTrace([]);
    setHasDragged(false);
  }, [a, c]);

  // Pre-calculate full faint background ellipse for visual guidance
  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let t = 0; t <= Math.PI * 2 + 0.1; t += 0.1) {
      pts.push([a * Math.cos(t), b * Math.sin(t), -0.05]);
    }
    return pts;
  }, [a, b]);

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col cursor-crosshair">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Constant Loop</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Synthesizing an ellipse using constant focal distances[cite: 22].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">String Mechanics</span>
            <span className="text-emerald-400 font-mono text-xs font-bold">x²/a² + y²/b² = 1</span>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-stone-300 font-mono text-sm">Major Axis (a)</span>
              <span className="font-bold text-white font-mono">{a}</span>
            </div>
            <input 
              type="range" min="6" max="15" step="0.5" value={a} 
              onChange={(e) => {
                const newA = parseFloat(e.target.value);
                setA(newA);
                if (c >= newA) setC(newA - 0.5); // Constrain c < a
              }}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-stone-300 font-mono text-sm">Focal Distance (c)</span>
              <span className="font-bold text-white font-mono">{c}</span>
            </div>
            <input 
              type="range" min="1" max={a - 0.5} step="0.5" value={c} 
              onChange={(e) => setC(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div className="flex flex-col gap-2 bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-sm">
            <div className="flex justify-between items-center text-stone-400">
              <span>PF₁:</span>
              <span>{PF1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-stone-400">
              <span>PF₂:</span>
              <span>{PF2.toFixed(2)}</span>
            </div>
            <div className="border-t border-stone-800 my-1"></div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-bold">Sum (PF₁ + PF₂):</span>
              <span className="font-bold text-emerald-400">{totalLength.toFixed(2)} = 2a</span>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${hasDragged ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-emerald-500 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">Mechanical Equation Engaged</p>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-3">
            As the stylus is pulled taut and dragged, the HUD displays the live lengths dynamically fluctuating while their sum remains mechanically locked at exactly 2a[cite: 22]. 
          </p>
          <div className="inline-block bg-stone-950 px-6 py-2 rounded-lg border border-stone-800 font-mono text-base font-bold text-white">
            <span className="text-emerald-400 mr-2">PF₁ + PF₂ = 2a</span>
            <span>⇒ x²/a² + y²/({b.toFixed(1)})² = 1</span>
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 28], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

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

              {/* FAINT BACKGROUND ELLIPSE */}
              <Line points={curvePoints} color="#334155" lineWidth={2} dashed dashScale={2} />

              {/* LIVE TRACE OF THE DRAWN PATH */}
              {trace.length > 1 && (
                <Line points={trace} color="#10b981" lineWidth={4} />
              )}

              {/* FOCUS POINT F1(-c, 0)[cite: 22] */}
              <group position={[F1.x, F1.y, 0.1]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                </mesh>
                <Billboard position={[0, -1.2, 0]}>
                  <Text fontSize={0.5} color="#94a3b8" fontWeight="bold">F₁(-c, 0)</Text>
                </Billboard>
              </group>

              {/* FOCUS POINT F2(c, 0)[cite: 22] */}
              <group position={[F2.x, F2.y, 0.1]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                </mesh>
                <Billboard position={[0, -1.2, 0]}>
                  <Text fontSize={0.5} color="#94a3b8" fontWeight="bold">F₂(c, 0)</Text>
                </Billboard>
              </group>

              {/* POINT P(x, y) - THE STYLUS[cite: 22] */}
              <group position={[p[0], p[1], 0.3]}>
                <mesh 
                  onPointerDown={handlePointerDown}
                  onPointerOver={() => document.body.style.cursor = 'grab'}
                  onPointerOut={() => { if(!isDragging) document.body.style.cursor = 'auto' }}
                >
                  <sphereGeometry args={[0.5, 32, 32]} />
                  <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} />
                </mesh>
                <Billboard position={[0, 1.2, 0]}>
                  <Text fontSize={0.5} color="#34d399" fontWeight="bold">
                    P({p[0].toFixed(1)}, {p[1].toFixed(1)})
                  </Text>
                </Billboard>
              </group>

              {/* THE DIGITAL STRING (PF1 and PF2)[cite: 22] */}
              <Line 
                points={[[F1.x, F1.y, 0.1], [p[0], p[1], 0.1], [F2.x, F2.y, 0.1]] as [number, number, number][]} 
                color="#f59e0b" 
                lineWidth={3} 
              />
            </group>

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={10} position={[0, 0, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}