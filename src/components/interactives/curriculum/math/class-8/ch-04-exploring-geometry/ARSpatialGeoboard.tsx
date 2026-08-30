'use client';

import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Line, Text, ContactShadows } from '@react-three/drei';
import { Info, Sparkles, Hand } from 'lucide-react';
import KapikitabAREnvironment from '../../../../spatial-engine/core/KapikitabAREnvironment';

// ==================================================================
// MAIN COMPONENT
// ==================================================================
export default function ARSpatialGeoboard() {
  // State: The lengths of the 4 segments of the perpendicular diagonals
  // Values represent how many "pegs" outward the rubber band stretches (1 to 4)
  const [n, setN] = useState<number>(2); // North (-Z)
  const [s, setS] = useState<number>(2); // South (+Z)
  const [e, setE] = useState<number>(2); // East (+X)
  const [w, setW] = useState<number>(2); // West (-X)

  const SPACING = 0.4; // Distance between pegs in meters

  // ==================================================================
  // MATH ENGINE: Determine the Shape from the Diagonals
  // ==================================================================
  const { shapeName, glowColor, message } = useMemo(() => {
    const isVertBisected = n === s;
    const isHorizBisected = e === w;
    const isEqualLength = (n + s) === (e + w);

    // Because our pegs are locked to the axes, the diagonals are ALWAYS perpendicular.
    let name = "Orthodiagonal";
    let color = "#3b82f6"; // Blue
    let msg = "A generic quadrilateral with perpendicular diagonals.";

    if (isVertBisected && isHorizBisected) {
      if (isEqualLength) {
        name = "Square";
        color = "#10b981"; // Emerald
        msg = "Bisected + Equal + Perpendicular = Perfect Square.";
      } else {
        name = "Rhombus";
        color = "#d97706"; // Amber
        msg = "Bisected + Perpendicular = Rhombus. Notice the 4 equal sides!";
      }
    } else if (isVertBisected || isHorizBisected) {
      name = "Kite";
      color = "#ec4899"; // Rose
      msg = "Only ONE diagonal is bisected at 90°, creating a Kite.";
    }

    return { shapeName: name, glowColor: color, message: msg };
  }, [n, s, e, w]);

  // ==================================================================
  // RENDER HELPERS: The Points for the Rubber Bands
  // ==================================================================
  const ptN: [number, number, number] = [0, 0.25, -n * SPACING];
  const ptS: [number, number, number] = [0, 0.25, s * SPACING];
  const ptE: [number, number, number] = [e * SPACING, 0.25, 0];
  const ptW: [number, number, number] = [-w * SPACING, 0.25, 0];

  const perimeterPoints = [ptN, ptE, ptS, ptW, ptN];

  // Generate the 9x9 grid of pegs
  const pegs = [];
  for (let x = -4; x <= 4; x++) {
    for (let z = -4; z <= 4; z++) {
      const isAxis = x === 0 || z === 0;
      pegs.push(
        <mesh
          key={`${x}-${z}`}
          position={[x * SPACING, 0.1, z * SPACING]}
          onClick={(evt) => {
            evt.stopPropagation();
            // Snap the rubber bands if an axis peg is clicked
            if (x === 0 && z < 0) setN(Math.abs(z));
            if (x === 0 && z > 0) setS(z);
            if (z === 0 && x > 0) setE(x);
            if (z === 0 && x < 0) setW(Math.abs(x));
          }}
          castShadow
        >
          <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
          <meshStandardMaterial color={isAxis ? "#78716c" : "#d6d3d1"} metalness={0.4} roughness={0.6} />
        </mesh>
      );
    }
  }

  return (
    <div className="w-full h-full min-h-[750px] relative bg-stone-900 rounded-2xl overflow-hidden font-sans">
      
      {/* 2D HTML OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-serif text-white">AR Spatial Geoboard</h2>
        <p className="text-stone-400 text-sm mt-1">Transform shapes by stretching diagonals.</p>
      </div>

      {/* SHAPE BADGE */}
      <div className="absolute top-6 right-6 z-10">
        <div 
          className="px-6 py-3 rounded-xl border-2 shadow-2xl font-bold tracking-widest uppercase text-sm flex items-center gap-2 backdrop-blur-md transition-colors duration-500"
          style={{ backgroundColor: `${glowColor}30`, borderColor: glowColor, color: glowColor }}
        >
          {shapeName === 'Square' && <Sparkles size={18} />}
          {shapeName}
        </div>
      </div>

      {/* AHA! MESSAGE BOX */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-3 shadow-xl">
          <Info size={20} style={{ color: glowColor }} className="shrink-0 mt-0.5 transition-colors duration-300" />
          <p className="text-stone-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        <p className="text-[10px] text-stone-500 uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-1">
          <Hand size={12} /> Tap the dark pegs along the cross to stretch the bands.
        </p>
      </div>

      {/* THE 3D / AR ENGINE */}
      {/* Our KapikitabAREnvironment automatically handles the Canvas, the AR button, and routing! */}
      <KapikitabAREnvironment>
        
        <group position={[0, -0.5, 0]}>
          {/* 1. The Wooden Board Base */}
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[4.2, 0.1, 4.2]} />
            <meshStandardMaterial color="#44403c" roughness={0.9} />
          </mesh>

          {/* 2. The Pegs */}
          {pegs}

          {/* 3. The Neon Rubber Bands (Perimeter) */}
          <Line 
            points={perimeterPoints} 
            color={glowColor} 
            lineWidth={6} 
            dashed={false}
          />

          {/* 4. The Neon Rubber Bands (Diagonals) */}
          <Line points={[ptN, ptS]} color={glowColor} lineWidth={3} opacity={0.5} transparent />
          <Line points={[ptE, ptW]} color={glowColor} lineWidth={3} opacity={0.5} transparent />

          {/* 5. Spatial Labels */}
          <Text position={[0, 0.4, 0]} fontSize={0.3} color={glowColor} rotation={[-Math.PI / 2, 0, 0]} anchorX="center" anchorY="middle">
            {shapeName}
          </Text>

          <ContactShadows frames={1} resolution={512} scale={10} blur={2} opacity={0.6} far={5} color="#000000" />
        </group>
        
      </KapikitabAREnvironment>
    </div>
  );
}