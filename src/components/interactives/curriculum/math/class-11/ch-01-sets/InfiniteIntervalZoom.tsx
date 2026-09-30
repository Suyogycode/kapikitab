'use client';

import React, { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';

type BoundaryType = 'open' | 'closed';

// ==================================================================
// 3D INTERVAL ENGINE
// ==================================================================
function IntervalLine({ startType, endType }: { startType: BoundaryType, endType: BoundaryType }) {
  const lineRef = useRef<THREE.Mesh>(null);
  const rightLabelRef = useRef<any>(null);
  const leftLabelRef = useRef<any>(null);

  const A = -5; // Fixed start point
  const B = 7;  // Fixed end point

  useFrame((state) => {
    if (!lineRef.current) return;

    // Calculate the camera's distance to the right boundary (x = 7)
    const distToRight = state.camera.position.distanceTo(new THREE.Vector3(B, 0, 0));
    const distToLeft = state.camera.position.distanceTo(new THREE.Vector3(A, 0, 0));

    // Dynamic Gap Logic: The closer you zoom, the smaller the gap (but it never hits 0)
    const rightGap = endType === 'open' ? Math.max(0.00001, distToRight * 0.015) : 0;
    const leftGap = startType === 'open' ? Math.max(0.00001, distToLeft * 0.015) : 0;

    const actualStart = A + leftGap;
    const actualEnd = B - rightGap;
    const length = actualEnd - actualStart;
    const center = (actualStart + actualEnd) / 2;

    // Scale and position the glowing interval line
    lineRef.current.position.x = center;
    lineRef.current.scale.y = length; // Rotate cylinder scales on Y natively

    // Update dynamic decimal labels based on camera proximity
    if (rightLabelRef.current) {
      if (endType === 'open') {
        const decimals = Math.min(5, Math.max(1, Math.floor(3 - distToRight * 0.2)));
        rightLabelRef.current.text = actualEnd.toFixed(decimals);
        rightLabelRef.current.color = "#ef4444"; // Red for approaching
      } else {
        rightLabelRef.current.text = B.toString();
        rightLabelRef.current.color = "#10b981"; // Green for clamped
      }
    }

    if (leftLabelRef.current) {
      if (startType === 'open') {
        const decimals = Math.min(5, Math.max(1, Math.floor(3 - distToLeft * 0.2)));
        leftLabelRef.current.text = actualStart.toFixed(decimals);
        leftLabelRef.current.color = "#ef4444";
      } else {
        leftLabelRef.current.text = A.toString();
        leftLabelRef.current.color = "#10b981";
      }
    }
  });

return (
    <group>
      {/* The glowing interval line */}
      <mesh ref={lineRef} position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
      </mesh>

      {/* Dynamic Decimal Trackers - Fixed missing children error */}
      <Text ref={leftLabelRef} position={[A, 0.8, 0]} fontSize={0.3} anchorX="center">
        {""}
      </Text>
      <Text ref={rightLabelRef} position={[B, 0.8, 0]} fontSize={0.3} anchorX="center">
        {""}
      </Text>
    </group>
  );
}

// ==================================================================
// BOUNDARY VISUALS
// ==================================================================
function BoundaryMarker({ position, type, isLeft }: { position: number, type: BoundaryType, isLeft: boolean }) {
  return (
    <group position={[position, 0, 0]}>
      {type === 'closed' ? (
        // Solid Steel Bracket
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[isLeft ? 0.1 : -0.1, 0.45, 0]}>
            <boxGeometry args={[0.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[isLeft ? 0.1 : -0.1, -0.45, 0]}>
            <boxGeometry args={[0.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ) : (
        // Translucent Boundary Wall (Open Interval)
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.02, 1.5, 1.5]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0.3} emissive="#ef4444" emissiveIntensity={0.5} depthWrite={false} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.02, 1.5, 1.5)]} />
            <lineBasicMaterial color="#f87171" transparent opacity={0.8} />
          </lineSegments>
        </mesh>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function InfiniteIntervalZoom() {
  const [startType, setStartType] = useState<BoundaryType>('open');
  const [endType, setEndType] = useState<BoundaryType>('closed');

  return (
    <div className="w-full h-full min-h-[700px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-auto bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent">
        <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Infinite Interval Zoom</h2>
        <p className="text-stone-400 text-sm mb-6 max-w-2xl">
          Use your scroll wheel to zoom into the boundaries. Notice how an open boundary repels the line infinitely.
        </p>
        
        {/* CONTROL PANEL */}
        <div className="flex flex-wrap gap-4 items-center bg-stone-900/90 p-3 sm:p-4 rounded-xl border border-stone-800 backdrop-blur-md max-w-max">
          
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-mono text-sm uppercase">Left:</span>
            <button 
              onClick={() => setStartType('closed')}
              className={`w-10 h-10 rounded-lg font-mono text-lg transition-all ${startType === 'closed' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
            >
              [
            </button>
            <button 
              onClick={() => setStartType('open')}
              className={`w-10 h-10 rounded-lg font-mono text-lg transition-all ${startType === 'open' ? 'bg-red-900/50 text-red-400 border border-red-500' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
            >
              (
            </button>
          </div>

          <div className="text-white font-mono text-xl mx-2">
            {startType === 'closed' ? '[' : '('}-5, 7{endType === 'closed' ? ']' : ')'}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-mono text-sm uppercase">Right:</span>
            <button 
              onClick={() => setEndType('closed')}
              className={`w-10 h-10 rounded-lg font-mono text-lg transition-all ${endType === 'closed' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
            >
              ]
            </button>
            <button 
              onClick={() => setEndType('open')}
              className={`w-10 h-10 rounded-lg font-mono text-lg transition-all ${endType === 'open' ? 'bg-red-900/50 text-red-400 border border-red-500' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
            >
              )
            </button>
          </div>
        </div>
      </div>

      {/* THE 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [1, 2, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />
            
            <OrbitControls 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 - 0.1}
              minDistance={0.1}
              maxDistance={25}
              target={[1, 0, 0]} 
            />

            {/* THE REAL NUMBER LINE AXIS */}
            <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 30, 8]} />
              <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Tick Marks */}
            {Array.from({ length: 21 }, (_, i) => i - 10).map((num) => (
              <group key={num} position={[num, 0, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.05, 0.3, 0.05]} />
                  <meshStandardMaterial color="#78716c" />
                </mesh>
                {(num % 5 === 0 || num === -5 || num === 7) && (
                  <Text position={[0, -0.5, 0]} fontSize={0.25} color="#a8a29e">
                    {num.toString()}
                  </Text>
                )}
              </group>
            ))}

            {/* BOUNDARIES */}
            <BoundaryMarker position={-5} type={startType} isLeft={true} />
            <BoundaryMarker position={7} type={endType} isLeft={false} />

            {/* DYNAMIC INTERVAL LINE */}
            <IntervalLine startType={startType} endType={endType} />

            <ContactShadows frames={1} resolution={1024} scale={30} blur={2} opacity={0.4} far={10} color="#000000" position={[0, -2, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}