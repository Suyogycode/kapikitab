'use client';

import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Layers } from 'lucide-react';
import XRViewer from '../XRViewer';

export default function Interactive3DLab() {
  // --- REACT LAB STATE ---
  const [activeAnimation, setActiveAnimation] = useState<string>('Idle');
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [telemetry, setTelemetry] = useState({ altitude: 0, velocity: 0 });

  // --- LAB LOGIC ---
  const handleTriggerAction = (animName: string, stage: number) => {
    setActiveAnimation(animName);
    setCurrentStage(stage);

    // Simulate real-time scientific telemetry updating React UI
    if (animName === 'Launch') {
      setTelemetry({ altitude: 120, velocity: 2400 });
    } else if (animName === 'Separate_Stage') {
      setTelemetry({ altitude: 450, velocity: 7800 });
    } else {
      setTelemetry({ altitude: 0, velocity: 0 });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-stone-950 rounded-[2.5rem] border border-stone-800 text-white shadow-2xl space-y-6">
      
      {/* 1. TOP REACT CONTROLS (Floating Over 3D Workspace) */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Physics & Aerospace</span>
          <h2 className="text-2xl font-serif">SLS Rocket Propulsion Lab</h2>
        </div>

        {/* Real-time Scientific Telemetry Table */}
        <div className="flex gap-6 font-mono text-xs bg-stone-900/80 px-4 py-2 rounded-xl border border-stone-800">
          <div>
            <span className="text-stone-500 block">ALTITUDE</span>
            <span className="text-emerald-400 font-bold text-sm">{telemetry.altitude} km</span>
          </div>
          <div className="w-px bg-stone-800" />
          <div>
            <span className="text-stone-500 block">VELOCITY</span>
            <span className="text-emerald-400 font-bold text-sm">{telemetry.velocity} m/s</span>
          </div>
        </div>
      </div>

      {/* 2. 3D MODEL VIEWPORT WITH EMBEDDED ANIMATION CONTROLS */}
      <div className="relative h-[500px] w-full bg-stone-900/50 rounded-2xl overflow-hidden border border-stone-800/80">
        
        {/* The Live WebXR Engine */}
        <XRViewer 
          src="https://your-public-r2-url.com/3d-models/RocketModel.glb" 
          alt="SLS Rocket Model" 
        />

        {/* FLOATING SPATIAL BUTTONS (Overlaid on 3D Canvas) */}
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-3 z-30">
          <button
            onClick={() => handleTriggerAction('Launch', 2)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
              activeAnimation === 'Launch' 
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20' 
                : 'bg-stone-800/90 text-white hover:bg-stone-700'
            }`}
          >
            <Play size={14} fill="currentColor" />
            <span>1. Ignition & Launch</span>
          </button>

          <button
            onClick={() => handleTriggerAction('Separate_Stage', 3)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
              activeAnimation === 'Separate_Stage' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' 
                : 'bg-stone-800/90 text-white hover:bg-stone-700'
            }`}
          >
            <Layers size={14} />
            <span>2. Dissect Boosters</span>
          </button>

          <button
            onClick={() => handleTriggerAction('Idle', 1)}
            className="px-4 py-2.5 rounded-full text-xs font-bold uppercase bg-stone-900/90 text-stone-400 hover:text-white border border-stone-700 flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 3. LESSON INSTRUCTION FOOTER */}
      <div className="p-4 bg-stone-900/40 rounded-xl border border-stone-800 text-xs text-stone-400 flex items-center justify-between">
        <p>💡 Click <strong>Dissect Boosters</strong> to strip away the outer hull and inspect the internal liquid hydrogen fuel tanks.</p>
        <span className="font-mono text-[10px] text-stone-500">STAGE {currentStage} OF 3</span>
      </div>

    </div>
  );
}