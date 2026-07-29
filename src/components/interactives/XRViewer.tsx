'use client';

// ADDED: ReactNode import
import React, { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface XRViewerProps {
  src: string;
  alt: string;
  isFullscreen?: boolean;
  animationName?: string; 
  children?: ReactNode; // NEW: Allows passing spatial UI like hotspots
}

export default function XRViewer({ src, alt, isFullscreen = false, animationName, children }: XRViewerProps) {
  const [isEngineReady, setIsEngineReady] = useState(false);

  useEffect(() => {
    import('@google/model-viewer')
      .then(() => setIsEngineReady(true))
      .catch((err) => console.error("Failed to boot WebXR Engine:", err));
  }, []);

  if (!isEngineReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
        <Loader2 className="animate-spin text-stone-400 mb-3" size={32} />
        <span className="text-stone-400 text-xs font-mono uppercase tracking-widest">Booting Engine...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* @ts-expect-error */}
      <model-viewer
        src={src}
        alt={alt}
        camera-controls
        auto-rotate={!animationName ? "true" : undefined} 
        animation-name={animationName} 
        autoplay 
        ar
        ar-modes="webxr scene-viewer quick-look fallback"
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        style={{ width: '100%', height: '100%', outline: 'none', backgroundColor: 'transparent' }}
      >
        <button
          slot="ar-button"
          className={`absolute bottom-6 right-6 bg-white text-stone-900 px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-xl border border-stone-200 hover:scale-105 transition-transform ${
            isFullscreen ? 'hidden' : 'flex'
          }`}
        >
          View in Space
        </button>

        {/* NEW: Render custom spatial hotspots injected by wrappers here */}
        {children}

      {/* @ts-expect-error */}
      </model-viewer>
    </div>
  );
}