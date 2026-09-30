'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line } from '@react-three/drei';

type Mode = 'permutations' | 'combinations';
type Connection = { from: number; to: number };

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ChordWeaver() {
  const [mode, setMode] = useState<Mode>('permutations');
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const NUM_POINTS = 7;
  const RADIUS = 3.5;

  // Generate 7 points evenly spaced around the circle
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      const theta = (i / NUM_POINTS) * Math.PI * 2 - Math.PI / 2;
      pts.push({
        id: i,
        pos: new THREE.Vector3(Math.cos(theta) * RADIUS, Math.sin(theta) * RADIUS, 0),
        label: String.fromCharCode(65 + i) // A, B, C, D, E, F, G
      });
    }
    return pts;
  }, []);

  const handlePointClick = (id: number) => {
    setErrorMessage(null);

    if (selectedPoints.length === 0) {
      setSelectedPoints([id]);
    } else if (selectedPoints.length === 1) {
      const from = selectedPoints[0];
      const to = id;

      if (from === to) {
        setSelectedPoints([]);
        return;
      }

      if (mode === 'permutations') {
        // Permutations: A -> B and B -> A are completely separate
        const exists = connections.some(c => c.from === from && c.to === to);
        if (!exists) {
          setConnections([...connections, { from, to }]);
        }
        setSelectedPoints([]);
      } else {
        // Combinations: Order doesn't matter. Check if undirected edge already exists[cite: 29]
        const exists = connections.some(
          c => (c.from === from && c.to === to) || (c.from === to && c.to === from)
        );

        if (exists) {
          setErrorMessage('Already Selected! Order does not matter in combinations.');
        } else {
          setConnections([...connections, { from, to }]);
        }
        setSelectedPoints([]);
      }
    }
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setConnections([]);
    setSelectedPoints([]);
    setErrorMessage(null);
  };

  const clearCanvas = () => {
    setConnections([]);
    setSelectedPoints([]);
    setErrorMessage(null);
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Chord Weaver</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Permutations vs. Combinations taking 2 points out of 7[cite: 29].
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[300px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Selection Mode</span>
            <button 
              onClick={clearCanvas}
              className="text-stone-500 hover:text-stone-300 font-mono text-xs underline transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="flex gap-2 font-mono text-sm mb-3">
            <button 
              onClick={() => handleModeSwitch('permutations')}
              className={`flex-1 py-2 rounded-lg transition-all border ${mode === 'permutations' ? 'bg-blue-900/50 text-blue-300 border-blue-500 font-bold' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
            >
              Permutations (${`^7P_2`}$)
            </button>
            <button 
              onClick={() => handleModeSwitch('combinations')}
              className={`flex-1 py-2 rounded-lg transition-all border ${mode === 'combinations' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500 font-bold' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
            >
              Combinations (${`^7C_2`}$)
            </button>
          </div>

          <div className="flex justify-between items-center font-mono text-xs text-stone-300 bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <span>Total Constructed:</span>
            <span className={`font-bold text-base ${mode === 'permutations' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {connections.length} {mode === 'permutations' ? 'Directed Arcs' : 'Steel Chords'}
            </span>
          </div>
        </div>
      </div>

      {/* ERROR NOTIFICATION BANNER */}
      {errorMessage && (
        <div className="absolute top-36 w-full flex justify-center z-20 pointer-events-none px-4">
          <div className="bg-red-950/90 border border-red-500 text-red-200 px-4 py-2 rounded-lg font-mono text-xs shadow-lg animate-bounce">
            {errorMessage}[cite: 29]
          </div>
        </div>
      )}

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/95 border border-stone-700 p-5 rounded-xl backdrop-blur-md max-w-2xl w-full text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <p className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-2">Isolating the r! Factor</p>
          <p className="text-stone-300 text-sm leading-relaxed mb-3">
            {mode === 'permutations'
              ? 'Direction matters. Drawing from A to B is separate from B to A, yielding 42 total permutations[cite: 29].'
              : 'Order is stripped away. Every single combination (steel chord) naturally contains 2! permutations, yielding exactly 21 unique combinations[cite: 29].'}
          </p>
          <div className="font-mono text-sm text-emerald-400 bg-emerald-950/40 py-2 rounded-lg border border-emerald-900/50">
            ^nPr = ^nCr × r! (42 = 21 × 2!)[cite: 29]
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={4} 
              maxDistance={20}
              target={[0, 0, 0]}
            />

            <group>
              {/* THE 3D CIRCLE */}
              <mesh>
                <ringGeometry args={[RADIUS - 0.03, RADIUS + 0.03, 64]} />
                <meshBasicMaterial color="#44403c" side={THREE.DoubleSide} />
              </mesh>

              {/* RENDER ESTABLISHED CONNECTIONS */}
              {connections.map((conn, idx) => {
                const start = points[conn.from].pos;
                const end = points[conn.to].pos;

                if (mode === 'permutations') {
                  // Directed Arrow Line
                  return (
                    <group key={idx}>
                      <Line points={[start, end]} color="#3b82f6" lineWidth={3} />
                    </group>
                  );
                } else {
                  // Solid Steel Chord[cite: 29]
                  return (
                    <group key={idx}>
                      <Line points={[start, end]} color="#10b981" lineWidth={4} />
                    </group>
                  );
                }
              })}

              {/* RENDER THE 7 DISTINCT POINTS */}
              {points.map((pt) => {
                const isSelected = selectedPoints.includes(pt.id);
                return (
                  <group key={pt.id} position={pt.pos}>
                    <mesh 
                      onClick={() => handlePointClick(pt.id)}
                      onPointerOver={() => document.body.style.cursor = 'pointer'}
                      onPointerOut={() => document.body.style.cursor = 'auto'}
                    >
                      <sphereGeometry args={[0.3, 32, 32]} />
                      <meshStandardMaterial 
                        color={isSelected ? "#f59e0b" : "#64748b"} 
                        emissive={isSelected ? "#d97706" : "#000000"} 
                        emissiveIntensity={0.8}
                      />
                    </mesh>
                    <Text position={[pt.pos.x > 0 ? 0.5 : -0.5, pt.pos.y > 0 ? 0.5 : -0.5, 0]} fontSize={0.4} color="#ffffff">
                      {pt.label}
                    </Text>
                  </group>
                );
              })}
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.4} far={10} position={[0, -5, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}