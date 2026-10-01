'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

type ViewMode = 'intercept' | 'slope-intercept';
type DragState = 'a' | 'b' | 'c' | 'm' | null;

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function EquationMorphGrid() {
  const [mode, setMode] = useState<ViewMode>('intercept');
  
  // Base state of the line: y = mx + c
  const [m, setM] = useState<number>(-1);
  const [c, setC] = useState<number>(4);
  const [dragState, setDragState] = useState<DragState>(null);

  // Derived values for Intercept Form (x/a + y/b = 1)
  // Clamp values slightly to avoid division by zero crashes visually
  const safeM = Math.abs(m) < 0.01 ? (m >= 0 ? 0.01 : -0.01) : m;
  const safeC = Math.abs(c) < 0.01 ? (c >= 0 ? 0.01 : -0.01) : c;
  
  const a = -safeC / safeM; // x-intercept
  const b = safeC;          // y-intercept

  // --- DRAG PHYSICS ENGINE ---
  const handlePointerDown = (type: DragState) => (e: any) => {
    e.stopPropagation();
    setDragState(type);
    document.body.style.cursor = type === 'm' ? 'alias' : 'grabbing';
  };

  const handlePointerUp = () => {
    setDragState(null);
    document.body.style.cursor = 'auto';
  };

  const handlePointerMove = (e: any) => {
    if (!dragState) return;

    const x = e.point.x;
    const y = e.point.y;

    if (dragState === 'a') {
      // Moving X-intercept (a). Update slope to keep y-intercept (c) locked.
      const newA = Math.abs(x) < 0.5 ? (x >= 0 ? 0.5 : -0.5) : x;
      setM(-c / newA);
    } 
    else if (dragState === 'b' || dragState === 'c') {
      // Moving Y-intercept (b or c)
      setC(y);
    } 
    else if (dragState === 'm') {
      // Rotating slope around Y-intercept (0, c)
      if (Math.abs(x) > 0.1) {
        const newM = (y - c) / x;
        setM(Math.max(-15, Math.min(15, newM))); // Clamp slope
      }
    }
  };

  // Pre-calculate line endpoints for rendering (making it look infinite on the grid)
  const lineExtent = 30;
  const lineStart: [number, number, number] = [-lineExtent, safeM * -lineExtent + safeC, 0];
  const lineEnd: [number, number, number] = [lineExtent, safeM * lineExtent + safeC, 0];

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Equation Morph-Grid</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Visualizing the forms of a straight line.
          </p>
          
          {/* VIEW MODE TOGGLE */}
          <div className="flex gap-2 font-mono text-xs mt-4 pointer-events-auto">
            <button 
              onClick={() => setMode('intercept')}
              className={`px-4 py-2 rounded-lg transition-all border ${mode === 'intercept' ? 'bg-blue-900/50 text-blue-300 border-blue-500 font-bold' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
            >
              Intercept Mode
            </button>
            <button 
              onClick={() => setMode('slope-intercept')}
              className={`px-4 py-2 rounded-lg transition-all border ${mode === 'slope-intercept' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500 font-bold' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
            >
              Slope-Intercept Mode
            </button>
          </div>
        </div>

        {/* ALGEBRAIC TRANSLATION HUD */}
        <div className="bg-stone-900/95 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[320px]">
          <div className="border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Simultaneous Translation</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm">
            {/* Intercept Form */}
            <div className={`p-3 rounded-lg border transition-colors ${mode === 'intercept' ? 'bg-blue-950/40 border-blue-500/50' : 'bg-stone-950 border-stone-800'}`}>
              <div className="text-stone-500 text-xs mb-1">Intercept Form (x/a + y/b = 1)</div>
              <div className="text-white text-base">
                <span className="text-stone-400">x /</span> <span className="text-blue-400 font-bold">{a.toFixed(2)}</span> 
                <span className="text-stone-400"> + y /</span> <span className="text-blue-400 font-bold">{b.toFixed(2)}</span> = 1
              </div>
            </div>

            {/* Slope-Intercept Form */}
            <div className={`p-3 rounded-lg border transition-colors ${mode === 'slope-intercept' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-stone-950 border-stone-800'}`}>
              <div className="text-stone-500 text-xs mb-1">Slope-Intercept (y = mx + c)</div>
              <div className="text-white text-base">
                y = <span className="text-emerald-400 font-bold">{safeM.toFixed(2)}</span>x 
                {safeC >= 0 ? ' + ' : ' - '} 
                <span className="text-emerald-400 font-bold">{Math.abs(safeC).toFixed(2)}</span>
              </div>
            </div>

            {/* General Form */}
            <div className="p-3 rounded-lg border bg-stone-950 border-stone-800">
              <div className="text-stone-500 text-xs mb-1">General Form (Ax + By + C = 0)</div>
              <div className="text-white text-base text-purple-300">
                {safeM > 0 ? '-' : ''}{Math.abs(safeM).toFixed(2)}x + y {safeC > 0 ? '-' : '+' } {Math.abs(safeC).toFixed(2)} = 0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/95 border border-stone-700 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <p className="text-stone-300 text-xs uppercase tracking-widest font-bold mb-2">The Aha! Moment</p>
          <p className="text-stone-400 text-sm leading-relaxed">
            Moving a node natively forces the coefficients in <span className="text-white font-bold">ALL</span> equations to dynamically update simultaneously. 
            You are physically proving that altering the <span className="text-emerald-400">slope (m)</span> mathematically guarantees a shift in the <span className="text-blue-400">x-intercept (a)</span>.
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 16], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />

            {/* INVISIBLE CAPTURE PLANE */}
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
              {/* THE 2D GRID BACKGROUND */}
              <gridHelper args={[60, 60, "#334155", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
              
              {/* X and Y Axes */}
              <Line points={[[-30, 0, -0.1], [30, 0, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
              <Line points={[[0, -30, -0.1], [0, 30, -0.1]] as [number, number, number][]} color="#64748b" lineWidth={2} />
              
              {/* Origin Marker */}
              <Text position={[-0.4, -0.4, 0]} fontSize={0.4} color="#64748b">O</Text>

              {/* THE SOLID STEEL BAR (The Line itself) */}
              <Line points={[lineStart, lineEnd]} color="#f8fafc" lineWidth={5} />

              {/* ============================================================== */}
              {/* INTERCEPT MODE INTERACTIONS */}
              {/* ============================================================== */}
              {mode === 'intercept' && (
                <>
                  {/* X-Intercept Node (a) */}
                  <group position={[a, 0, 0.1]}>
                    <mesh 
                      onPointerDown={handlePointerDown('a')}
                      onPointerOver={() => document.body.style.cursor = 'grab'}
                      onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
                    >
                      <sphereGeometry args={[0.4, 32, 32]} />
                      <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.8} />
                    </mesh>
                    <Billboard position={[0, -0.8, 0]}>
                      <Text fontSize={0.4} color="#60a5fa" fontWeight="bold">(a, 0)</Text>
                    </Billboard>
                  </group>

                  {/* Y-Intercept Node (b) */}
                  <group position={[0, b, 0.1]}>
                    <mesh 
                      onPointerDown={handlePointerDown('b')}
                      onPointerOver={() => document.body.style.cursor = 'grab'}
                      onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
                    >
                      <sphereGeometry args={[0.4, 32, 32]} />
                      <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.8} />
                    </mesh>
                    <Billboard position={[1, 0, 0]}>
                      <Text fontSize={0.4} color="#60a5fa" fontWeight="bold">(0, b)</Text>
                    </Billboard>
                  </group>
                </>
              )}

              {/* ============================================================== */}
              {/* SLOPE-INTERCEPT MODE INTERACTIONS */}
              {/* ============================================================== */}
              {mode === 'slope-intercept' && (
                <>
                  {/* Y-Intercept Node (c) */}
                  <group position={[0, c, 0.1]}>
                    <mesh 
                      onPointerDown={handlePointerDown('c')}
                      onPointerOver={() => document.body.style.cursor = 'ns-resize'}
                      onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
                    >
                      <boxGeometry args={[0.6, 0.6, 0.6]} />
                      <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} />
                    </mesh>
                    <Billboard position={[1.2, 0, 0]}>
                      <Text fontSize={0.4} color="#34d399" fontWeight="bold">c = {c.toFixed(1)}</Text>
                    </Billboard>

                    {/* Rotational Dial for Slope (m) */}
                    <group>
                      <mesh 
                        onPointerDown={handlePointerDown('m')}
                        onPointerOver={() => document.body.style.cursor = 'alias'}
                        onPointerOut={() => { if(!dragState) document.body.style.cursor = 'auto' }}
                      >
                        <torusGeometry args={[2.5, 0.1, 16, 64]} />
                        <meshStandardMaterial color="#10b981" transparent opacity={0.3} />
                      </mesh>
                      {/* Visual indicator on the dial showing the slope direction */}
                      <mesh position={[2.5 * Math.cos(Math.atan(safeM)), 2.5 * Math.sin(Math.atan(safeM)), 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshBasicMaterial color="#34d399" />
                      </mesh>
                      <mesh position={[-2.5 * Math.cos(Math.atan(safeM)), -2.5 * Math.sin(Math.atan(safeM)), 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshBasicMaterial color="#34d399" />
                      </mesh>
                      <Billboard position={[0, 3.2, 0]}>
                        <Text fontSize={0.35} color="#34d399" fontWeight="bold">Dial 'm'</Text>
                      </Billboard>
                    </group>
                  </group>
                </>
              )}

            </group>

            <ContactShadows frames={1} resolution={512} scale={40} blur={2} opacity={0.2} far={10} position={[0, 0, -1]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}