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
      
      {/* Notice we pass children into XRViewer now! */}
      <XRViewer 
        src={modelUrl} 
        alt={title} 
        isFullscreen={isFullscreen}
        animationName={activeAnim} 
      >
        {/* 
          SPATIAL HOTSPOT 
          data-position is "X Y Z" in meters from the center of the model.
          Play with these numbers (e.g., 0 1.2 0) to move the button up and down!
        */}
        <button
          slot="hotspot-wolf-run"
          data-position="0 1.5 0.5" 
          data-normal="0 1 0"
          onClick={() => setActiveAnim('1.')}
          className="bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20 shadow-xl whitespace-nowrap"
        >
          <Play size={12} className="inline mr-1" /> Trigger Run
        </button>
      </XRViewer>

      {/* Your standard 2D Screen UI remains here for PC users */}
      <div className="absolute top-24 left-6 flex flex-col gap-3 z-30 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-200 shadow-sm mb-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Wolf State</p>
          <p className="text-sm font-serif text-emerald-600 font-medium">
            {activeAnim === '1.' ? 'Running' : activeAnim === '2.' ? 'Walking' : 'Idle'}
          </p>
        </div>

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