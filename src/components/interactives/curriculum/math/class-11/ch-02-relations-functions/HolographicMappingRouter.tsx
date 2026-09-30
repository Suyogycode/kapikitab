'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line } from '@react-three/drei';

// ==================================================================
// TYPES & DATA
// ==================================================================
type NodeDef = { id: string; label: string; position: [number, number, number] };
type Connection = { from: string; to: string };
type ValidationStatus = 'incomplete' | 'invalid_multiple' | 'valid_function';

const SET_A: NodeDef[] = [
  { id: 'x1', label: '1', position: [-3, 2, 0] },
  { id: 'x2', label: '2', position: [-3, 0.5, 0] },
  { id: 'x3', label: '3', position: [-3, -1, 0] },
];

const SET_B: NodeDef[] = [
  { id: 'y1', label: 'a', position: [3, 2.5, 0] },
  { id: 'y2', label: 'b', position: [3, 1, 0] },
  { id: 'y3', label: 'c', position: [3, -0.5, 0] },
  { id: 'y4', label: 'd', position: [3, -2, 0] },
];

// ==================================================================
// 3D NODE & ISLAND COMPONENTS
// ==================================================================
function Platform({ position, title }: { position: [number, number, number], title: string }) {
  return (
    <group position={position}>
      <mesh position={[0, -3.5, 0]}>
        <cylinderGeometry args={[1.5, 1, 0.5, 32]} />
        <meshStandardMaterial color="#292524" roughness={0.8} />
      </mesh>
      <mesh position={[0, -3.2, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.1, 32]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.2} />
      </mesh>
      <Text position={[0, -4.2, 0]} fontSize={0.4} color="#a8a29e" anchorX="center">
        {title}
      </Text>
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function HolographicMappingRouter() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeDraw, setActiveDraw] = useState<{ from: string; pointerPos: THREE.Vector3 } | null>(null);

  // --- VALIDATION LOGIC ---
  const status: ValidationStatus = useMemo(() => {
    const connectionCounts = {} as Record<string, number>;
    connections.forEach(c => {
      connectionCounts[c.from] = (connectionCounts[c.from] || 0) + 1;
    });

    // Check if any single input splits into two outputs[cite: 14]
    const hasMultiple = Object.values(connectionCounts).some(count => count > 1);
    
    // Check if every element in Set A has at least one connection[cite: 14]
    const isComplete = SET_A.every(node => (connectionCounts[node.id] || 0) >= 1);

    if (hasMultiple) return 'invalid_multiple';
    if (!isComplete) return 'incomplete';
    return 'valid_function';
  }, [connections]);

  // --- EVENT HANDLERS ---
  const handlePointerDown = (e: any, nodeId: string, isSetA: boolean) => {
    e.stopPropagation();
    if (isSetA) {
      setActiveDraw({ from: nodeId, pointerPos: e.point });
    }
  };

  const handlePointerMove = (e: any) => {
    if (activeDraw) {
      setActiveDraw({ ...activeDraw, pointerPos: e.point });
    }
  };

  const handlePointerUp = (e: any, targetNodeId?: string) => {
    e.stopPropagation();
    if (activeDraw && targetNodeId) {
      // Prevent duplicate identical lines
      const exists = connections.some(c => c.from === activeDraw.from && c.to === targetNodeId);
      if (!exists) {
        setConnections([...connections, { from: activeDraw.from, to: targetNodeId }]);
      }
    }
    setActiveDraw(null);
  };

  const clearConnections = () => setConnections([]);

  // --- RENDER HELPERS ---
  const getLineColor = () => {
    if (status === 'invalid_multiple') return '#ef4444'; // Red for alarm[cite: 14]
    if (status === 'valid_function') return '#10b981'; // Green for valid
    return '#3b82f6'; // Blue for incomplete/drawing
  };

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Holographic Mapping Router</h2>
        <p className="text-stone-400 text-sm max-w-2xl">
          Use your stylus or mouse to draw laser beams from Set A to Set B[cite: 14]. 
        </p>
      </div>

      {/* STATUS PANEL & CONTROLS */}
      <div className="absolute bottom-6 w-full flex justify-center z-10 pointer-events-auto px-4">
        <div className={`border p-4 rounded-xl backdrop-blur-md max-w-2xl w-full flex flex-col sm:flex-row items-center justify-between shadow-2xl transition-colors duration-500
          ${status === 'invalid_multiple' ? 'bg-red-950/90 border-red-900/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
            status === 'valid_function' ? 'bg-emerald-950/90 border-emerald-900/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
            'bg-stone-900/90 border-stone-800'}`}
        >
          <div className="mb-4 sm:mb-0">
            <p className="text-stone-400 text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1">Router Status</p>
            {status === 'incomplete' && (
              <p className="text-blue-400 font-mono text-sm sm:text-base">Not a function yet. Every element in Domain must be mapped.</p>
            )}
            {status === 'invalid_multiple' && (
              <p className="text-red-400 font-mono text-sm sm:text-base font-bold">ERROR: A single input split into multiple outputs[cite: 14].</p>
            )}
            {status === 'valid_function' && (
              <p className="text-emerald-400 font-mono text-sm sm:text-base font-bold">VALID FUNCTION: All criteria met.</p>
            )}
          </div>
          <button 
            onClick={clearConnections}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs uppercase tracking-wider font-bold transition-colors border border-stone-700"
          >
            Clear Beams
          </button>
        </div>
      </div>

      {/* THE 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={2} />
            <Environment preset="city" />
            
            <OrbitControls enableRotate={false} enablePan={false} enableZoom={false} />

            {/* INVISIBLE CAPTURE PLANE for tracking active laser draws */}
            <mesh 
              position={[0, 0, 0]} 
              onPointerMove={handlePointerMove} 
              onPointerUp={(e) => handlePointerUp(e)}
              visible={false}
            >
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial />
            </mesh>

            {/* ISLANDS */}
            <Platform position={[-3, 0, 0]} title="Domain (Set A)" />
            <Platform position={[3, 0, 0]} title="Codomain (Set B)" />

            {/* DOMAIN NODES (Set A) */}
            {SET_A.map((node) => (
              <group key={node.id} position={node.position}>
                <mesh 
                  onPointerDown={(e) => handlePointerDown(e, node.id, true)}
                  onPointerOver={() => document.body.style.cursor = 'pointer'}
                  onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <sphereGeometry args={[0.3, 32, 32]} />
                  <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.8} />
                </mesh>
                <Text position={[-0.7, 0, 0]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle">
                  {node.label}
                </Text>
              </group>
            ))}

            {/* CODOMAIN NODES (Set B) */}
            {SET_B.map((node) => (
              <group key={node.id} position={node.position}>
                <mesh 
                  onPointerUp={(e) => handlePointerUp(e, node.id)}
                  onPointerOver={() => document.body.style.cursor = 'pointer'}
                  onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <sphereGeometry args={[0.3, 32, 32]} />
                  <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.8} />
                </mesh>
                <Text position={[0.7, 0, 0]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle">
                  {node.label}
                </Text>
              </group>
            ))}

            {/* RENDER ESTABLISHED CONNECTIONS */}
            {connections.map((c, idx) => {
              const startPos = SET_A.find(n => n.id === c.from)?.position || [0,0,0];
              const endPos = SET_B.find(n => n.id === c.to)?.position || [0,0,0];
              return (
                <Line
                  key={idx}
                  points={[startPos, endPos]}
                  color={getLineColor()}
                  lineWidth={5}
                  dashed={false}
                />
              );
            })}

            {/* RENDER ACTIVE DRAWING LASER */}
            {activeDraw && (
              <Line
                points={[
                  SET_A.find(n => n.id === activeDraw.from)?.position || [0,0,0],
                  [activeDraw.pointerPos.x, activeDraw.pointerPos.y, 0]
                ]}
                color="#60a5fa"
                lineWidth={5}
                dashed={true}
                dashScale={50}
              />
            )}

          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}