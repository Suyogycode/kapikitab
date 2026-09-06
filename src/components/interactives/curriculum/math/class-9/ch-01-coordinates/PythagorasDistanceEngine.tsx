'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Navigation } from 'lucide-react';

export default function PythagorasDistanceEngine() {
  const GRID_SIZE = 12; 
  const CELL_SIZE = 40; 
  const SVG_SIZE = GRID_SIZE * CELL_SIZE;

  const [posA, setPosA] = useState({ x: 2, y: 3 });
  const [posD, setPosD] = useState({ x: 8, y: 7 });

  const toSvgX = (x: number) => x * CELL_SIZE;
  const toSvgY = (y: number) => SVG_SIZE - (y * CELL_SIZE);

  const deltaX = Math.abs(posD.x - posA.x);
  const deltaY = Math.abs(posD.y - posA.y);
  const distanceSquared = deltaX ** 2 + deltaY ** 2;
  const distance = Math.sqrt(distanceSquared).toFixed(2);

  const cornerX = posD.x;
  const cornerY = posA.y;

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 z-10">
        <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          <Navigation className="text-emerald-500" /> The Distance Engine
        </h2>
        <p className="text-stone-400 text-sm mt-1">
          Deriving the distance between (x₁, y₁) and (x₂, y₂).
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center z-10">
        
        {/* THE INTERACTIVE GRID */}
        <div className="relative bg-stone-900 border-2 border-stone-800 rounded-xl shadow-2xl overflow-hidden p-4">
          <svg width={SVG_SIZE} height={SVG_SIZE} className="overflow-visible">
            
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <g key={i}>
                <line x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={SVG_SIZE} stroke="#292524" strokeWidth="1" />
                <line x1="0" y1={i * CELL_SIZE} x2={SVG_SIZE} y2={i * CELL_SIZE} stroke="#292524" strokeWidth="1" />
                {i % 2 === 0 && i !== 0 && (
                  <>
                    <text x={i * CELL_SIZE} y={SVG_SIZE + 15} fill="#78716c" fontSize="10" textAnchor="middle">{i}</text>
                    <text x="-15" y={SVG_SIZE - (i * CELL_SIZE)} fill="#78716c" fontSize="10" textAnchor="middle" alignmentBaseline="middle">{i}</text>
                  </>
                )}
              </g>
            ))}

            <line x1="0" y1={SVG_SIZE} x2={SVG_SIZE} y2={SVG_SIZE} stroke="#57534e" strokeWidth="3" />
            <line x1="0" y1="0" x2="0" y2={SVG_SIZE} stroke="#57534e" strokeWidth="3" />

            {/* Dynamic Triangle Lines (WITH KEYS ADDED) */}
            <AnimatePresence>
              <motion.line 
                key="base-line"
                x1={toSvgX(posA.x)} y1={toSvgY(cornerY)} 
                x2={toSvgX(cornerX)} y2={toSvgY(cornerY)} 
                stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 6"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }}
              />
              <motion.line 
                key="height-line"
                x1={toSvgX(cornerX)} y1={toSvgY(cornerY)} 
                x2={toSvgX(posD.x)} y2={toSvgY(posD.y)} 
                stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }}
              />
              <motion.line 
                key="hypotenuse-line"
                x1={toSvgX(posA.x)} y1={toSvgY(posA.y)} 
                x2={toSvgX(posD.x)} y2={toSvgY(posD.y)} 
                stroke="#10b981" strokeWidth="4"
              />
            </AnimatePresence>

            <text x={toSvgX(posA.x + deltaX/2)} y={toSvgY(cornerY) + 20} fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
              Δx = {deltaX}
            </text>
            <text x={toSvgX(cornerX) + 10} y={toSvgY(cornerY + deltaY/2)} fill="#f59e0b" fontSize="12" fontWeight="bold" alignmentBaseline="middle">
              Δy = {deltaY}
            </text>

            <circle cx={toSvgX(cornerX)} cy={toSvgY(cornerY)} r={4} fill="#78716c" />

            <motion.circle 
              drag dragMomentum={false}
              onDrag={(event, info) => {
                const rect = (event.target as Element).closest('svg')?.getBoundingClientRect();
                if (!rect) return;
                const newX = Math.max(0, Math.min(GRID_SIZE, Math.round((info.point.x - rect.left) / CELL_SIZE)));
                const newY = Math.max(0, Math.min(GRID_SIZE, Math.round((SVG_SIZE - (info.point.y - rect.top)) / CELL_SIZE)));
                setPosA({ x: newX, y: newY });
              }}
              cx={toSvgX(posA.x)} cy={toSvgY(posA.y)} r={12} fill="#10b981" 
              className="cursor-grab active:cursor-grabbing hover:fill-emerald-400 transition-colors"
            />
            <text x={toSvgX(posA.x) - 15} y={toSvgY(posA.y) - 15} fill="#d6d3d1" fontSize="12" fontWeight="bold">
              A({posA.x}, {posA.y})
            </text>

            <motion.circle 
              drag dragMomentum={false}
              onDrag={(event, info) => {
                const rect = (event.target as Element).closest('svg')?.getBoundingClientRect();
                if (!rect) return;
                const newX = Math.max(0, Math.min(GRID_SIZE, Math.round((info.point.x - rect.left) / CELL_SIZE)));
                const newY = Math.max(0, Math.min(GRID_SIZE, Math.round((SVG_SIZE - (info.point.y - rect.top)) / CELL_SIZE)));
                setPosD({ x: newX, y: newY });
              }}
              cx={toSvgX(posD.x)} cy={toSvgY(posD.y)} r={12} fill="#10b981" 
              className="cursor-grab active:cursor-grabbing hover:fill-emerald-400 transition-colors"
            />
            <text x={toSvgX(posD.x) + 15} y={toSvgY(posD.y) - 15} fill="#d6d3d1" fontSize="12" fontWeight="bold">
              D({posD.x}, {posD.y})
            </text>

          </svg>
        </div>

        {/* MATH ENGINE HUD (NATIVE JSX MATH) */}
        <div className="w-full max-w-sm bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
            <Calculator className="text-emerald-500" size={20} />
            <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Live Calculation</h3>
          </div>
          
          <div className="p-6 space-y-6 font-mono text-sm">
            <div>
              <p className="text-stone-500 mb-1">1. Horizontal Difference (Base)</p>
              <p className="text-sky-400 bg-sky-950/30 p-2 rounded border border-sky-900/50">
                |x₂ - x₁| = |{posD.x} - {posA.x}| = {deltaX}
              </p>
            </div>

            <div>
              <p className="text-stone-500 mb-1">2. Vertical Difference (Height)</p>
              <p className="text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-900/50">
                |y₂ - y₁| = |{posD.y} - {posA.y}| = {deltaY}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-800">
              <p className="text-stone-500 mb-1">3. Baudhāyana-Pythagoras Theorem</p>
              <p className="text-emerald-400 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/50 text-base leading-relaxed">
                AD = √({deltaX}² + {deltaY}²)<br/>
                AD = √({deltaX ** 2} + {deltaY ** 2})<br/>
                AD = √{distanceSquared} ≈ {distance} units
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}