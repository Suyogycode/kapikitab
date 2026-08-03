'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import XRViewer from './model-viewer/XRViewer';
import { Loader2 } from 'lucide-react';


// 1. The 3D-Exclusive Registry (Completely separate from 2D labs)
const graphicRegistry: Record<string, React.ComponentType<any>> = {
  'InteractiveBrain': dynamic(() => import('./model-viewer/wrappers/InteractiveBrain'), {
    loading: () => <Loader2 className="animate-spin text-stone-500 m-auto" size={24} />
  }),
  'RocketLaunch3D': dynamic(() => import('./model-viewer/wrappers/RocketLaunch3D'), {
    loading: () => <Loader2 className="animate-spin text-stone-500 m-auto" size={24} />
  }),
  'InteractiveDoll': dynamic(() => import('./model-viewer/wrappers/InteractiveDoll'), {
    loading: () => <Loader2 className="animate-spin text-stone-500 m-auto" size={24} />
  }),
  // ADD THE WOLF HERE
  'InteractiveWolf': dynamic(() => import('./model-viewer/wrappers/InteractiveWolf'), {
    loading: () => <Loader2 className="animate-spin text-stone-500 m-auto" size={24} />
  }),
};

interface GraphicRendererProps {
  activeSim: {
    title: string;
    modelUrl: string;
    componentRef?: string;
  };
  isFullscreen: boolean;
}

export default function GraphicRenderer({ activeSim, isFullscreen }: GraphicRendererProps) {
  // 2. If the admin assigned a 3D UI wrapper, render the 3D Model INSIDE the custom React UI
  if (activeSim.componentRef && graphicRegistry[activeSim.componentRef]) {
    const Interactive3DWrapper = graphicRegistry[activeSim.componentRef];
    return <Interactive3DWrapper modelUrl={activeSim.modelUrl} isFullscreen={isFullscreen} title={activeSim.title} />;
  }

  // 3. Fallback: Pure 3D viewer with no extra floating buttons
  return (
    <XRViewer 
      src={activeSim.modelUrl} 
      alt={activeSim.title} 
      isFullscreen={isFullscreen} 
    />
  );
}