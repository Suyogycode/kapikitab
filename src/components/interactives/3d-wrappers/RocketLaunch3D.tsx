'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Layers } from 'lucide-react';
import XRViewer from '../XRViewer';

interface WrapperProps {
  modelUrl: string;
  title: string;
  isFullscreen: boolean;
}

export default function RocketLaunch3D({ modelUrl, title, isFullscreen }: WrapperProps) {
  // React State controlling the 3D Engine
  const [activeAnim, setActiveAnim] = useState<string | undefined>(undefined);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* 1. The 3D Engine rendering the R2 asset */}
      <XRViewer 
        src={modelUrl} 
        alt={title} 
        isFullscreen={isFullscreen}
        animationName={activeAnim} // React triggers the GLB animation
      />

      {/* 2. Floating Spatial UI Buttons */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-30 pointer-events-auto">
        <button
          onClick={() => setActiveAnim('Ignition')}
          className="px-5 py-2.5 bg-emerald-500 text-stone-900 rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
        >
          <Play size={14} /> Launch Sequence
        </button>

        <button
          onClick={() => setActiveAnim('Disassemble')}
          className="px-5 py-2.5 bg-stone-800 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-stone-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Layers size={14} /> Inspect Boosters
        </button>

        <button
          onClick={() => setActiveAnim(undefined)}
          className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/20 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset Model
        </button>
      </div>

    </div>
  );
}