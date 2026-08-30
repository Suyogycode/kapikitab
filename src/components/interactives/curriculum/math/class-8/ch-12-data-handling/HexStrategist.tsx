'use client';

import React, { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import { Play, RotateCcw, Crown, Lightbulb, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================================
// MATH & LOGIC ENGINE: Hex Grid and Pathfinding
// ==================================================================
const GRID_SIZE = 5;

// Neighbors in axial coordinates
const hexNeighbors = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

function checkWin(board: Record<string, number>, player: number) {
  const visited = new Set<string>();
  const queue: { q: number, r: number, path: string[] }[] = [];

  // Find starting nodes
  for (let q = 0; q < GRID_SIZE; q++) {
    for (let r = 0; r < GRID_SIZE; r++) {
      if (board[`${q},${r}`] === player) {
        // Player 1 (Emerald) connects Left to Right (q=0 to q=GRID_SIZE-1)
        if (player === 1 && q === 0) queue.push({ q, r, path: [`${q},${r}`] });
        // Player 2 (Amber) connects Top to Bottom (r=0 to r=GRID_SIZE-1)
        if (player === 2 && r === 0) queue.push({ q, r, path: [`${q},${r}`] });
      }
    }
  }

  while (queue.length > 0) {
    const { q, r, path } = queue.shift()!;
    const key = `${q},${r}`;
    
    if (visited.has(key)) continue;
    visited.add(key);

    // Check Win Condition
    if (player === 1 && q === GRID_SIZE - 1) return path;
    if (player === 2 && r === GRID_SIZE - 1) return path;

    // Add valid neighbors
    for (const [dq, dr] of hexNeighbors) {
      const nq = q + dq;
      const nr = r + dr;
      const nKey = `${nq},${nr}`;
      if (board[nKey] === player && !visited.has(nKey)) {
        queue.push({ q: nq, r: nr, path: [...path, nKey] });
      }
    }
  }
  return null;
}

// ==================================================================
// NATIVE R3F ENGINE: The 3D Board and Tiles
// ==================================================================
function HexTile({ q, r, owner, isWinningPath, onClick, disabled }: any) {
  const tileRef = useRef<THREE.Group>(null);
  
  // Math to map axial coordinates to Cartesian 3D space
  const radius = 1;
  const width = Math.sqrt(3) * radius;
  const height = 2 * radius;
  const x = (q + r / 2) * width;
  const z = r * height * 0.75;

  useFrame((_, delta) => {
    if (!tileRef.current) return;
    // Elevate tile if it is part of the winning path
    const targetY = isWinningPath ? 0.5 : 0;
    tileRef.current.position.y = THREE.MathUtils.lerp(tileRef.current.position.y, targetY, delta * 5);
  });

  const getTileColor = () => {
    if (owner === 1) return "#10b981"; // Emerald
    if (owner === 2) return "#f59e0b"; // Amber
    return "#44403c"; // Stone Base
  };

  return (
    <group position={[x, 0, z]} ref={tileRef}>
      {/* The Hex Base */}
      <mesh 
        onClick={() => { if (!disabled && owner === 0) onClick(q, r); }}
        onPointerOver={() => document.body.style.cursor = (!disabled && owner === 0) ? 'pointer' : 'default'}
        onPointerOut={() => document.body.style.cursor = 'default'}
        castShadow receiveShadow
        rotation={[0, Math.PI / 2, 0]}
      >
        <cylinderGeometry args={[radius * 0.95, radius * 0.95, 0.2, 6]} />
        <meshStandardMaterial 
          color={getTileColor()} 
          roughness={owner === 0 ? 0.8 : 0.2} 
          metalness={owner === 0 ? 0.1 : 0.5}
          emissive={getTileColor()}
          emissiveIntensity={isWinningPath ? 0.8 : 0}
        />
      </mesh>

      {/* The Dropped Peg */}
      {owner !== 0 && (
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry args={[radius * 0.5, 32, 32]} />
          <meshStandardMaterial color={getTileColor()} roughness={0.1} metalness={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT & UI
// ==================================================================
export default function HexStrategist() {
  const [board, setBoard] = useState<Record<string, number>>({});
  const [currentPlayer, setCurrentPlayer] = useState<number>(1); // 1 = Emerald, 2 = Amber
  const [winner, setWinner] = useState<number | null>(null);
  const [winningPath, setWinningPath] = useState<string[]>([]);

  // Center Offset for the Camera
  const centerX = ((GRID_SIZE - 1) + (GRID_SIZE - 1) / 2) * Math.sqrt(3) / 2;
  const centerZ = (GRID_SIZE - 1) * 1.5 * 0.75;

  const handleTileClick = (q: number, r: number) => {
    if (winner) return;

    const key = `${q},${r}`;
    const newBoard = { ...board, [key]: currentPlayer };
    setBoard(newBoard);

    const path = checkWin(newBoard, currentPlayer);
    if (path) {
      setWinner(currentPlayer);
      setWinningPath(path);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const handleReset = () => {
    setBoard({});
    setCurrentPlayer(1);
    setWinner(null);
    setWinningPath([]);
  };

  // Generate grid coordinates
  const hexes = [];
  for (let q = 0; q < GRID_SIZE; q++) {
    for (let r = 0; r < GRID_SIZE; r++) {
      hexes.push({ q, r, key: `${q},${r}` });
    }
  }

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* 2D HTML OVERLAY: Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white flex items-center gap-2">
          <Hexagon className="text-emerald-500" /> The Hex Strategist
        </h2>
        <p className="text-stone-400 text-sm mt-1">Topology & The Unbroken Chain</p>
      </div>

      {/* THE 3D ENGINE */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [centerX, 12, centerZ + 12], fov: 40 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableZoom={false} 
              maxPolarAngle={Math.PI / 2 - 0.2} 
              minPolarAngle={0.1}
              target={[centerX, 0, centerZ]}
            />
            
            <group position={[0, 0, 0]}>
              {/* Board Boundaries Indicators 
              <Line points={[[0, 0.1, -1.5], [GRID_SIZE * 1.7, 0.1, -1.5]]} color="#f59e0b" lineWidth={4} />
              <Line points={[[GRID_SIZE * 0.9, 0.1, GRID_SIZE * 1.5], [GRID_SIZE * 2.6, 0.1, GRID_SIZE * 1.5]]} color="#f59e0b" lineWidth={4} />
              
              <Line points={[[-1.5, 0.1, 0], [GRID_SIZE * 0.8, 0.1, GRID_SIZE * 1.6]]} color="#10b981" lineWidth={4} />
              <Line points={[[GRID_SIZE * 1.7, 0.1, -1], [GRID_SIZE * 2.7, 0.1, GRID_SIZE * 1.4]]} color="#10b981" lineWidth={4} />
*/}
              {/* Render Hex Grid */}
              {hexes.map(({ q, r, key }) => (
                <HexTile 
                  key={key} 
                  q={q} r={r} 
                  owner={board[key] || 0} 
                  isWinningPath={winningPath.includes(key)}
                  onClick={handleTileClick}
                  disabled={winner !== null}
                />
              ))}
            </group>

            <ContactShadows frames={1} resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" position={[centerX, -0.5, centerZ]} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D HTML OVERLAY: Status HUD */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10 pointer-events-none flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {winner ? (
            <motion.div 
              key="win"
              initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`w-full max-w-2xl backdrop-blur-md border p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-2xl pointer-events-auto mb-6 
                ${winner === 1 ? 'bg-emerald-950/90 border-emerald-500' : 'bg-amber-950/90 border-amber-500'}`}
            >
              <Crown size={32} className={winner === 1 ? 'text-emerald-400' : 'text-amber-400'} />
              <div>
                <h3 className={`text-xl font-bold font-serif mb-1 ${winner === 1 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {winner === 1 ? 'Emerald Connects Left-to-Right!' : 'Amber Connects Top-to-Bottom!'}
                </h3>
                <p className={`text-sm leading-relaxed ${winner === 1 ? 'text-emerald-100' : 'text-amber-100'}`}>
                  <strong>The Theorem Proven:</strong> John Nash mathematically proved that Hex cannot end in a draw. Because of the board's topology, the only way for Amber to block Emerald completely is by forming a winning chain of their own!
                </p>
              </div>
            </motion.div>
          ) : (
             <motion.div 
              key="turn"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900/90 backdrop-blur-md border border-stone-800 p-4 rounded-xl flex items-center gap-4 shadow-xl pointer-events-auto mb-6"
            >
              <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">Active Player</div>
              <div className={`px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-colors ${currentPlayer === 1 ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'}`}>
                {currentPlayer === 1 ? 'Emerald (Left to Right)' : 'Amber (Top to Bottom)'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Control */}
        <div className="pointer-events-auto">
           <button 
             onClick={handleReset}
             className="px-8 py-4 bg-stone-800 hover:bg-stone-700 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 shadow-lg"
           >
             <RotateCcw size={16} /> Reset Board
           </button>
        </div>

      </div>
    </div>
  );
}