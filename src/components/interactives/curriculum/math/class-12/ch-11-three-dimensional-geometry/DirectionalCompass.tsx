'use client';

import React, { useState, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Line, Billboard } from '@react-three/drei';

// ==================================================================
// CUSTOM VECTOR ARROW COMPONENT
// ==================================================================
function VectorArrow({ 
  start, 
  end, 
  color, 
  label,
  lineWidth = 0.1,
  headSize = 0.5
}: { 
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  color: string, 
  label?: string,
  lineWidth?: number,
  headSize?: number
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    if (length < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    groupRef.current.position.lerp(start, delta * 12);

    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());
    groupRef.current.quaternion.slerp(quaternion, delta * 12);

    const bodyRef = groupRef.current.children[0] as THREE.Mesh;
    const headRef = groupRef.current.children[1] as THREE.Mesh;
    
    const actualHeadLength = Math.min(headSize, length * 0.3);
    const bodyLength = Math.max(0.01, length - actualHeadLength);
    
    bodyRef.scale.y = THREE.MathUtils.lerp(bodyRef.scale.y, bodyLength, delta * 12);
    bodyRef.position.y = bodyRef.scale.y / 2;
    headRef.position.y = bodyRef.scale.y + (actualHeadLength / 2);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[lineWidth, lineWidth, 1, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh>
        <coneGeometry args={[lineWidth * 2.5, headSize, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      {label && (
        <Billboard position={[0, 0, 0.5]}>
          <Text fontSize={0.5} color={color} fontWeight="bold">{label}</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// 3D SCENE COMPONENT
// ==================================================================
function CompassScene({ x, y, z }: { x: number, y: number, z: number }) {
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const terminalPoint = useMemo(() => new THREE.Vector3(x, y, z), [x, y, z]);
  
  const xAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const zAxis = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  // Helper to generate arc points between an axis and the vector[cite: 27]
  const generateArc = (axisVector: THREE.Vector3, mainVector: THREE.Vector3, radius: number = 2) => {
    if (mainVector.lengthSq() < 0.01) return [];
    const normalizedMain = mainVector.clone().normalize();
    const angle = axisVector.angleTo(normalizedMain);
    
    // Cross product gives the normal for rotation
    let normal = new THREE.Vector3().crossVectors(axisVector, normalizedMain);
    if (normal.lengthSq() === 0) {
      // Vectors are parallel or anti-parallel, arbitrary normal
      normal = new THREE.Vector3(0, 1, 0).cross(axisVector).normalize();
    } else {
      normal.normalize();
    }

    const points: [number, number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * angle;
      const p = axisVector.clone().applyAxisAngle(normal, a).multiplyScalar(radius);
      points.push([p.x, p.y, p.z]);
    }
    return points;
  };

  const alphaArc = useMemo(() => generateArc(xAxis, terminalPoint, 2), [terminalPoint, xAxis]);
  const betaArc = useMemo(() => generateArc(yAxis, terminalPoint, 2.5), [terminalPoint, yAxis]);
  const gammaArc = useMemo(() => generateArc(zAxis, terminalPoint, 3), [terminalPoint, zAxis]);

  return (
    <group position={[0, -2, 0]}>
      {/* Primary Coordinate Axes */}
      <VectorArrow start={origin} end={new THREE.Vector3(8, 0, 0)} color="#ef4444" label="X" lineWidth={0.05} headSize={0.3} />
      <VectorArrow start={origin} end={new THREE.Vector3(0, 8, 0)} color="#10b981" label="Y" lineWidth={0.05} headSize={0.3} />
      <VectorArrow start={origin} end={new THREE.Vector3(0, 0, 8)} color="#3b82f6" label="Z" lineWidth={0.05} headSize={0.3} />
      
      {/* 3D Grid Planes for better spatial awareness */}
      <gridHelper args={[16, 16, "#334155", "#0f172a"]} position={[0, 0, 0]} />
      <gridHelper args={[16, 16, "#334155", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />

      {/* Main Directional Vector[cite: 27] */}
      <VectorArrow start={origin} end={terminalPoint} color="#fcd34d" label="r" lineWidth={0.15} headSize={0.6} />

      {/* Angle Arcs (Alpha, Beta, Gamma)[cite: 27] */}
      {alphaArc.length > 0 && <Line points={alphaArc} color="#ef4444" lineWidth={3} dashed dashScale={4} />}
      {betaArc.length > 0 && <Line points={betaArc} color="#10b981" lineWidth={3} dashed dashScale={4} />}
      {gammaArc.length > 0 && <Line points={gammaArc} color="#3b82f6" lineWidth={3} dashed dashScale={4} />}
      
      {/* Alpha Label */}
      {alphaArc.length > 0 && (
        <Billboard position={new THREE.Vector3(...alphaArc[10]).multiplyScalar(1.2)}>
          <Text fontSize={0.4} color="#ef4444" fontWeight="bold">α</Text>
        </Billboard>
      )}
      {/* Beta Label */}
      {betaArc.length > 0 && (
        <Billboard position={new THREE.Vector3(...betaArc[10]).multiplyScalar(1.2)}>
          <Text fontSize={0.4} color="#10b981" fontWeight="bold">β</Text>
        </Billboard>
      )}
      {/* Gamma Label */}
      {gammaArc.length > 0 && (
        <Billboard position={new THREE.Vector3(...gammaArc[10]).multiplyScalar(1.2)}>
          <Text fontSize={0.4} color="#3b82f6" fontWeight="bold">γ</Text>
        </Billboard>
      )}
    </group>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function DirectionalCompass() {
  // Terminal point coordinates (Direction Ratios: a, b, c)[cite: 27]
  const [x, setX] = useState<number>(4);
  const [y, setY] = useState<number>(5);
  const [z, setZ] = useState<number>(3);

  // Magnitude (r)
  const r = Math.sqrt(x*x + y*y + z*z);

  // Direction Cosines (l, m, n)[cite: 27]
  const l = r === 0 ? 0 : x / r;
  const m = r === 0 ? 0 : y / r;
  const n = r === 0 ? 0 : z / r;

  // Angles in degrees
  const alphaDeg = Math.acos(l) * (180 / Math.PI);
  const betaDeg = Math.acos(m) * (180 / Math.PI);
  const gammaDeg = Math.acos(n) * (180 / Math.PI);

  // Verification Sum
  const sumOfSquares = l*l + m*m + n*n;

  // AHA! Moment Trigger: Flattens against a coordinate plane (one coord is 0)[cite: 27]
  const isFlattened = (x === 0 || y === 0 || z === 0) && r > 0;
  const activePlane = x === 0 ? 'YZ' : y === 0 ? 'XZ' : z === 0 ? 'XY' : '';

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-950 rounded-2xl overflow-hidden font-sans flex flex-col">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* TITLE AND DESCRIPTION */}
        <div className="bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent p-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">The Directional Compass</h2>
          <p className="text-stone-400 text-sm max-w-xl">
            A line in space has direction cosines (l, m, n) satisfying the fundamental identity l^2 + m^2 + n^2 = 1[cite: 27].
          </p>
        </div>

        {/* HUD & CONTROLS */}
        <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto min-w-[340px]">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
            <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Live Telemetry HUD[cite: 27]</span>
            <span className="text-fcd34d font-mono text-xs font-bold text-amber-400">|r| = {r.toFixed(2)}</span>
          </div>
          
          <div className="flex flex-col gap-3 font-mono text-sm mb-6">
            
            {/* Direction Cosines Breakdown */}
            <div className="p-3 rounded-lg border border-stone-700 bg-stone-950">
              <div className="flex justify-between items-center mb-2">
                <span className="text-red-400 font-bold">l = cos(α)</span>
                <span className="text-red-200">{l.toFixed(3)} ({alphaDeg.toFixed(1)}°)</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-400 font-bold">m = cos(β)</span>
                <span className="text-emerald-200">{m.toFixed(3)} ({betaDeg.toFixed(1)}°)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-bold">n = cos(γ)</span>
                <span className="text-blue-200">{n.toFixed(3)} ({gammaDeg.toFixed(1)}°)</span>
              </div>
            </div>

            {/* Verification Check */}
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${isFlattened ? 'border-amber-500/50 bg-amber-950/30' : 'border-stone-700 bg-stone-950'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={isFlattened ? "text-amber-400 font-bold" : "text-stone-400 font-bold"}>Identity Check</span>
              </div>
              <div className="text-xs text-stone-500 mb-1">l² + m² + n²</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-400">{(l*l).toFixed(2)} + {(m*m).toFixed(2)} + {(n*n).toFixed(2)}</span>
                <span className={`font-bold ${isFlattened ? 'text-amber-300' : 'text-stone-200'}`}>
                  = {sumOfSquares.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Terminal Point Controls (Direction Ratios) */}
          <div className="p-4 rounded-lg border border-stone-700 bg-stone-950/50 mb-4">
            <div className="text-stone-300 font-bold mb-3 text-xs text-center uppercase tracking-widest">
              Drag Terminal Point (a, b, c)[cite: 27]
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-red-400 font-bold w-4">X</span>
                <input type="range" min="-8" max="8" step="0.5" value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
                <span className="text-stone-400 w-8 text-right text-xs">{x}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold w-4">Y</span>
                <input type="range" min="-8" max="8" step="0.5" value={y} onChange={(e) => setY(parseFloat(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                <span className="text-stone-400 w-8 text-right text-xs">{y}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-bold w-4">Z</span>
                <input type="range" min="-8" max="8" step="0.5" value={z} onChange={(e) => setZ(parseFloat(e.target.value))} className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                <span className="text-stone-400 w-8 text-right text-xs">{z}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setX(6); setY(6); setZ(0); }} // Snap to XY plane for AHA moment
            className="w-full py-2.5 rounded-lg border border-amber-500/50 text-amber-400 hover:bg-amber-950/50 font-bold text-xs tracking-widest uppercase transition-colors"
          >
            Snap to Coordinate Plane
          </button>
        </div>
      </div>

      {/* THE AHA! MOMENT DASHBOARD */}
      <div className={`absolute bottom-8 w-full flex justify-center z-10 pointer-events-none px-4 transition-opacity duration-500 ${isFlattened ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-stone-900/95 border border-amber-500 p-5 rounded-xl backdrop-blur-md max-w-4xl w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Flattened against {activePlane} Plane</p>
          <p className="text-stone-200 text-sm leading-relaxed mb-3">
            As you tilted the line so that it flattens against a coordinate plane, one of the direction cosines dropped to zero[cite: 27].
          </p>
          <div className="inline-block bg-amber-950/50 px-6 py-2 rounded-lg border border-amber-900/50 font-mono text-sm font-bold text-amber-300">
            The sum of the squares of the remaining two locks at exactly 1, giving a physical feel for how direction cosines act as normalized directional components in 3D space[cite: 27].
          </div>
        </div>
      </div>

      {/* 3D SPATIAL ENGINE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <Canvas camera={{ position: [12, 10, 16], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <Environment preset="city" />

            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />

            <CompassScene x={x} y={y} z={z} />

            <ContactShadows frames={1} resolution={512} scale={50} blur={2} opacity={0.3} far={15} position={[0, -2.1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}