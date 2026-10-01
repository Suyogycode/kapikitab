'use client';

import React, { useState, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// PASCAL'S TRIANGLE (MERU-PRASTARA) GENERATOR
// ==================================================================
const generatePascalTriangle = (maxRows: number) => {
  const triangle: number[][] = [];
  for (let i = 0; i <= maxRows; i++) {
    const row = [1];
    for (let j = 1; j < i; j++) {
      row.push(triangle[i - 1][j - 1] + triangle[i - 1][j]);
    }
    if (i > 0) row.push(1);
    triangle.push(row);
  }
  return triangle;
};

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function MeruPrastaraBuilder() {
  const [n, setN] = useState<number>(3);
  const [selectedNode, setSelectedNode] = useState<{ row: number; col: number } | null>(null);

  const pascalData = useMemo(() => generatePascalTriangle(5), []);

  const handleNodeClick = (row: number, col: number) => {
    if (row === 0 || col === 0 || col === row) {
      setSelectedNode(null); // Outer edges don't have two distinct parents
    } else {
      setSelectedNode({ row, col });
    }
  };

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Meru-Prastara Builder</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            Pascal&apos;s Triangle &amp; Binomial Expansion Coefficients[cite: 30].
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[280px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Binomial Index (n)</span>
            <span className="text-emerald-400 font-mono font-bold text-lg">{n}</span>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="1" 
            value={n} 
            onChange={(e) => { setN(parseInt(e.target.value)); setSelectedNode(null); }}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* THE AHA! MOMENT: EXPANDED POLYNOMIAL DISPLAY */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-stone-900/95 border border-emerald-500/50 p-5 rounded-xl backdrop-blur-md max-w-3xl w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-2">
            Expansion for (a + b)<sup>{n}</sup>
          </p>
          
          <div className="text-white font-mono text-sm sm:text-base bg-stone-950 p-3 rounded-lg border border-stone-800 overflow-x-auto flex justify-center items-center gap-2">
            {pascalData[n].map((coeff, idx) => {
              const powerA = n - idx;
              const powerB = idx;
              return (
                <span key={idx} className="flex items-center">
                  {idx > 0 && <span className="text-stone-500 mx-1">+</span>}
                  <span className="text-emerald-400 font-bold">{coeff}</span>
                  {powerA > 0 && <span>a{powerA > 1 ? `^${powerA}` : ''}</span>}
                  {powerB > 0 && <span>b{powerB > 1 ? `^${powerB}` : ''}</span>}
                </span>
              );
            })}
          </div>
          <p className="text-stone-400 text-xs mt-3">
            Finding coefficients is simply reading the {n}<sup>th</sup> row of Meru-Prastara[cite: 30]!
          </p>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 1, 10], fov: 50 }}>
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

            <group position={[0, 2, 0]}>
              {/* RENDER PYRAMID ROWS UP TO n */}
              {pascalData.slice(0, n + 1).map((rowVals, r) => {
                const rowWidth = r * 1.1;
                return rowVals.map((val, c) => {
                  const x = (c * 1.1) - (rowWidth / 2);
                  const y = -r * 1.1;
                  const isSelected = selectedNode?.row === r && selectedNode?.col === c;

                  // Parent positions if selected
                  let parent1Pos = null;
                  let parent2Pos = null;
                  if (isSelected) {
                    const pr = r - 1;
                    const p1c = c - 1;
                    const p2c = c;
                    const p1RowWidth = pr * 1.1;
                    parent1Pos = new THREE.Vector3((p1c * 1.1) - (p1RowWidth / 2), -pr * 1.1, 0);
                    parent2Pos = new THREE.Vector3((p2c * 1.1) - (p1RowWidth / 2), -pr * 1.1, 0);
                  }

                  return (
                    <group key={`${r}-${c}`} position={[x, y, 0]}>
                      <mesh 
                        onClick={() => handleNodeClick(r, c)}
                        onPointerOver={() => document.body.style.cursor = 'pointer'}
                        onPointerOut={() => document.body.style.cursor = 'auto'}
                      >
                        <boxGeometry args={[0.9, 0.9, 0.3]} />
                        <meshStandardMaterial 
                          color={isSelected ? "#10b981" : "#3b82f6"} 
                          emissive={isSelected ? "#059669" : "#1d4ed8"} 
                          emissiveIntensity={isSelected ? 0.8 : 0.4}
                          roughness={0.2}
                        />
                      </mesh>
                      <Billboard position={[0, 0, 0.2]}>
                        <Text fontSize={0.4} color="#ffffff" fontWeight="bold">
                          {val.toString()}
                        </Text>
                      </Billboard>

                      {/* Connecting Energy Beams to Parents[cite: 30] */}
                      {isSelected && parent1Pos && parent2Pos && (
                        <>
                          <Line points={[new THREE.Vector3(0, 0, 0), parent1Pos.clone().sub(new THREE.Vector3(x, y, 0))]} color="#34d399" lineWidth={3} />
                          <Line points={[new THREE.Vector3(0, 0, 0), parent2Pos.clone().sub(new THREE.Vector3(x, y, 0))]} color="#34d399" lineWidth={3} />
                        </>
                      )}
                    </group>
                  );
                });
              })}
            </group>

            <ContactShadows frames={1} resolution={512} scale={20} blur={2} opacity={0.4} far={10} position={[0, -4, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}