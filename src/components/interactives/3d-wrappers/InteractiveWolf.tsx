'use client';

import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import XRViewer from '../XRViewer';

interface WrapperProps {
  modelUrl: string;
  title: string;
  isFullscreen: boolean;
}

export default function InteractiveWolf({ modelUrl, title, isFullscreen }: WrapperProps) {
  const [activeAnim, setActiveAnim] = useState<string | undefined>(undefined);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      <XRViewer 
        src={modelUrl} 
        alt={title} 
        isFullscreen={isFullscreen}
        animationName={activeAnim} 
      />

      {/* THE FIX: Changed top-6 to top-24 so it sits below the header */}
      <div className="absolute top-24 left-6 flex flex-col gap-3 z-30 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-200 shadow-sm mb-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Wolf State</p>
          <p className="text-sm font-serif text-emerald-600 font-medium">
            {activeAnim === '1.' ? 'Running' : activeAnim === '2.' ? 'Walking' : activeAnim === '3.' ? 'Attacking' : 'Idle'}
          </p>
        </div>

        <button
          onClick={() => setActiveAnim('1.')} 
          className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
        >
          <Play size={14} /> Run
        </button>
        
        <button
          onClick={() => setActiveAnim('2.')} 
          className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
        >
          <Play size={14} /> Walk
        </button>

        <button
          onClick={() => setActiveAnim(undefined)}
          className="px-5 py-2.5 bg-white/50 backdrop-blur-md text-stone-800 border border-stone-300 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/80 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset View
        </button>
      </div>
    </div>
  );
}