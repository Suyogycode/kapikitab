'use client';

import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import XRViewer from '../XRViewer';

interface WrapperProps {
  modelUrl: string;
  title: string;
  isFullscreen: boolean;
}

export default function InteractiveDoll({ modelUrl, title, isFullscreen }: WrapperProps) {
  // Set to undefined so the default auto-rotate works before interaction
  const [activeAnim, setActiveAnim] = useState<string | undefined>(undefined);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* THE FIX: We are now passing activeAnim to the WebXR Engine */}
      <XRViewer 
        src={modelUrl} 
        alt={title} 
        isFullscreen={isFullscreen}
        animationName={activeAnim} 
      />

      {/* Floating Spatial UI Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-30 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-200 shadow-sm mb-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Current Animation Track</p>
          <p className="text-sm font-serif text-emerald-600 font-medium">{activeAnim || 'Auto Rotate'}</p>
        </div>

        {/* 
          IMPORTANT: Change 'Wave' and 'Dance' to whatever the actual 
          animation tracks are named inside your specific doll .glb file! 
        */}
        <button
          onClick={() => setActiveAnim('2')} 
          className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
        >
          <Play size={14} /> Play "Wave"
        </button>
        
        <button
          onClick={() => setActiveAnim('3')} 
          className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
        >
          <Play size={14} /> Play "Dance"
        </button>

        <button
          onClick={() => setActiveAnim(undefined)}
          className="px-5 py-2.5 bg-white/50 backdrop-blur-md text-stone-800 border border-stone-300 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/80 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}