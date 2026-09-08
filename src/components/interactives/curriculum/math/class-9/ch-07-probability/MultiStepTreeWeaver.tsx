'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, Calculator, PlusCircle, RotateCcw, Lightbulb } from 'lucide-react';

export default function MultiStepTreeWeaver() {
  const [stages, setStages] = useState<number>(0);
  const [selectedPath, setSelectedPath] = useState<string>('');

  const addStage = () => {
    if (stages < 3) {
      setStages(prev => prev + 1);
      setSelectedPath('');
    }
  };

  const resetTree = () => {
    setStages(0);
    setSelectedPath('');
  };

  // --- Procedural Tree Generation Engine ---
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 500;
  const START_X = 100;
  const X_STEP = 200;

  const { nodes, edges } = useMemo(() => {
    const n: { id: string; depth: number; x: number; y: number; label: string; fullPath: string; }[] = [];
    const e: { id: string; source: { x: number; y: number; } | { x: number; y: number; }; target: { x: number; y: number; } | { x: number; y: number; }; targetId: string; label: string; type: string; }[] = [];

    const buildNode = (depth: number, path: string, yMin: number, yMax: number) => {
      const x = START_X + depth * X_STEP;
      const y = (yMin + yMax) / 2;
      const id = path || 'Root';
      
      n.push({ 
        id, 
        depth, 
        x, 
        y, 
        label: path ? path.slice(-1) : 'Start', 
        fullPath: path 
      });

      if (depth < stages) {
        // Top branch (Heads)
        const hPath = path ? `${path}H` : 'H';
        const hY = (yMin + y) / 2;
        e.push({ 
          id: `${id}-H`, 
          source: { x, y }, 
          target: { x: x + X_STEP, y: hY }, 
          targetId: hPath,
          label: '1/2', 
          type: 'H' 
        });
        buildNode(depth + 1, hPath, yMin, y);

        // Bottom branch (Tails)
        const tPath = path ? `${path}T` : 'T';
        const tY = (y + yMax) / 2;
        e.push({ 
          id: `${id}-T`, 
          source: { x, y }, 
          target: { x: x + X_STEP, y: tY }, 
          targetId: tPath,
          label: '1/2', 
          type: 'T' 
        });
        buildNode(depth + 1, tPath, y, yMax);
      }
    };

    buildNode(0, '', 40, SVG_HEIGHT - 40);
    return { nodes: n, edges: e };
  }, [stages]);

  // --- Dynamic HUD Mathematics ---
  const isLeafSelected = selectedPath.length === stages && stages > 0;
  const denominator = Math.pow(2, stages);
  
  // Create the mathematical multiplication string (e.g., "1/2 × 1/2 × 1/2 = 1/8")
  const equationString = Array.from({ length: stages })
    .map(() => '1/2')
    .join(' × ');

  return (
    <div className="w-full h-full min-h-[750px] bg-[#151414] rounded-2xl border border-stone-800 relative overflow-hidden font-sans shadow-inner flex flex-col select-none">
      
      {/* HEADER */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <GitFork className="text-emerald-500" /> The Multi-Step Tree Weaver
          </h2>
          <p className="text-stone-300 text-sm mt-1 drop-shadow-md">
            Mapping the sample space of independent coin tosses.
          </p>
        </div>
        
        <div className="flex gap-3 pointer-events-auto">
          <button 
            onClick={resetTree}
            disabled={stages === 0}
            className="px-4 py-2 bg-stone-900/80 hover:bg-stone-800 disabled:opacity-50 text-stone-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-stone-700 transition-colors backdrop-blur-md flex items-center gap-2"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button 
            onClick={addStage}
            disabled={stages >= 3}
            className="px-4 py-2 bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-500 transition-colors backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <PlusCircle size={14} /> Add Coin Toss
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center z-10 mt-20 p-6">
        
        {/* INTERACTIVE SVG WORKSPACE */}
        <div className="relative w-full lg:w-2/3 max-w-[800px] aspect-[8/5] bg-[#1c1917] border-2 border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center touch-none">
          
          <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full">
            {/* Blueprint Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#292524" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Tree Edges (Branches) */}
            <AnimatePresence>
              {edges.map((edge) => {
                // Determine if this edge is part of the currently selected path
                const isActive = selectedPath !== '' && selectedPath.startsWith(edge.targetId);
                const isHead = edge.type === 'H';
                
                // SVG Cubic Bezier Curve for organic branching
                const pathData = `M ${edge.source.x} ${edge.source.y} C ${edge.source.x + 80} ${edge.source.y}, ${edge.target.x - 80} ${edge.target.y}, ${edge.target.x} ${edge.target.y}`;
                
                // Midpoint for the fraction label
                const midX = (edge.source.x + edge.target.x) / 2;
                const midY = (edge.source.y + edge.target.y) / 2;

                return (
                  <motion.g key={edge.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <path 
                      d={pathData} 
                      fill="none" 
                      stroke={isActive ? (isHead ? '#10b981' : '#f59e0b') : '#44403c'} 
                      strokeWidth={isActive ? 4 : 2} 
                      strokeLinecap="round"
                      className="transition-colors duration-300"
                    />
                    {/* Probability Label */}
                    <rect x={midX - 12} y={midY - 10} width="24" height="20" rx="4" fill="#1c1917" className="transition-colors duration-300" stroke={isActive ? (isHead ? '#10b981' : '#f59e0b') : '#44403c'} />
                    <text x={midX} y={midY + 4} fill={isActive ? (isHead ? '#34d399' : '#fbbf24') : '#a8a29e'} fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono transition-colors duration-300">
                      {edge.label}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* Tree Nodes */}
            <AnimatePresence>
              {nodes.map((node) => {
                const isRoot = node.depth === 0;
                const isLeaf = node.depth === stages && stages > 0;
                const isActive = selectedPath !== '' && selectedPath.startsWith(node.fullPath);
                
                let fillColor = '#292524';
                let strokeColor = '#57534e';
                let textColor = '#d6d3d1';

                if (isActive || (isRoot && stages > 0)) {
                  fillColor = node.label === 'H' ? '#064e3b' : node.label === 'T' ? '#78350f' : '#1e1b4b';
                  strokeColor = node.label === 'H' ? '#10b981' : node.label === 'T' ? '#f59e0b' : '#6366f1';
                  textColor = '#ffffff';
                }

                return (
                  <motion.g 
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className={isLeaf ? "cursor-pointer" : ""}
                    onClick={() => {
                      if (isLeaf) setSelectedPath(node.fullPath);
                    }}
                  >
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r={isRoot ? 24 : 18} 
                      fill={fillColor} 
                      stroke={strokeColor} 
                      strokeWidth={isActive || isRoot ? 3 : 2} 
                      className={`transition-colors duration-300 ${isLeaf ? 'hover:stroke-white' : ''}`}
                    />
                    <text 
                      x={node.x} 
                      y={node.y + (isRoot ? 5 : 4)} 
                      fill={textColor} 
                      fontSize={isRoot ? 12 : 14} 
                      fontWeight="bold" 
                      textAnchor="middle"
                      className="font-mono transition-colors duration-300"
                    >
                      {node.label}
                    </text>
                    
                    {/* Final Outcome Label */}
                    {isLeaf && (
                      <text x={node.x + 25} y={node.y + 4} fill={isActive ? '#ffffff' : '#78716c'} fontSize="12" fontWeight="bold" textAnchor="start" className="font-mono transition-colors duration-300">
                        {node.fullPath}
                      </text>
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>
            
            {/* Empty State Prompt */}
            {stages === 0 && (
              <text x={SVG_WIDTH / 2} y={SVG_HEIGHT / 2} fill="#78716c" fontSize="16" textAnchor="middle" className="font-sans animate-pulse">
                Click "Add Coin Toss" to start weaving the tree...
              </text>
            )}
          </svg>

        </div>

        {/* CONTROLS & MATH HUD */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="text-emerald-500" size={18} />
                <h3 className="font-bold text-stone-200 uppercase tracking-widest text-xs">Probability Engine</h3>
              </div>
              <span className="bg-stone-900 text-stone-400 border border-stone-700 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest">
                Stage {stages}/3
              </span>
            </div>
            
            <div className="p-6 space-y-6 font-mono text-sm">
              
              <div className="flex justify-between items-center text-stone-300 border-b border-stone-800 pb-3">
                <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold">Total Outcomes</span>
                <span className="text-2xl font-bold text-emerald-400">{stages === 0 ? 0 : denominator}</span>
              </div>

              {/* Dynamic Equation Builder */}
              <div className="space-y-2">
                <p className="text-stone-500 uppercase tracking-widest text-[10px] font-bold">Compound Probability</p>
                <div className={`p-4 rounded-lg border flex items-center justify-center transition-colors ${isLeafSelected ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-stone-950 border-stone-800'}`}>
                  {stages === 0 ? (
                    <span className="text-stone-600">Awaiting input...</span>
                  ) : !isLeafSelected ? (
                    <span className="text-stone-500 text-xs">Click a final outcome node</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-stone-300">P({selectedPath})</span>
                      <span className="text-stone-600">=</span>
                      <span className="text-emerald-400 font-bold">{equationString}</span>
                      <span className="text-stone-600">=</span>
                      <span className="text-white font-bold text-lg">1/{denominator}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* The "Aha!" Moment Explanation */}
              <div className="mt-4 pt-6 border-t border-stone-800 min-h-[140px]">
                <AnimatePresence mode="wait">
                  {stages === 0 ? (
                    <motion.div key="stage0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-stone-500 text-xs leading-relaxed font-sans text-center">
                        Every time you add a coin toss, the sample space expands. Let's see how the probabilities multiply.
                      </p>
                    </motion.div>
                  ) : !isLeafSelected ? (
                    <motion.div key="unselected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-3">
                      <Lightbulb className="text-sky-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-stone-300 text-xs leading-relaxed font-sans">
                        The tree has grown! There are now <strong>{denominator}</strong> distinct parallel realities (final outcomes). <br/><br/>
                        <strong>Click on any of the final nodes on the right</strong> to trace its unique path back to the origin.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="selected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3">
                      <Lightbulb className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Independent Trials</h4>
                        <p className="text-emerald-100/80 font-sans text-xs leading-relaxed">
                          To find the probability of exact sequence <strong>{selectedPath}</strong> happening, we mathematically multiply the fractions along its glowing path. This visually explains why the denominator expands exponentially with each new step!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}