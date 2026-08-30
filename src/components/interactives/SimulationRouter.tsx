'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Domain 2 Default Fallback
import XRViewer from './model-viewer/XRViewer';

// THE FIX: Import LoadingState from the new shared file
import { LoadingState } from './LoadingState';

// Curriculum Registries
import { class8MathRegistry } from './curriculum/math/class-8/class8MathRegistry';

const masterCurriculumRegistry: Record<string, React.ComponentType<any>> = {
  ...class8MathRegistry,
};

// ... keep the rest of your pure2DRegistry, modelViewerRegistry, and the main component exactly as they were! ...

// ==================================================================
// DOMAIN 1: 2D React Simulations
// Standard web React puzzles with zero 3D overhead.
// ==================================================================
const pure2DRegistry: Record<string, React.ComponentType<any>> = {
  'FunctionMachineLab': dynamic(() => import('./2d-simulations/FunctionMachineLab'), { loading: LoadingState }),
};

// ==================================================================
// DOMAIN 2: Lightweight 3D (<model-viewer>)
// For displaying biological models and pure animations from Blender.
// ==================================================================
const modelViewerRegistry: Record<string, React.ComponentType<any>> = {
  'InteractiveWolf': dynamic(() => import('./model-viewer/wrappers/InteractiveWolf'), { loading: LoadingState }),
  'InteractiveBrain': dynamic(() => import('./model-viewer/wrappers/InteractiveBrain'), { loading: LoadingState }),
  'RocketLaunch3D': dynamic(() => import('./model-viewer/wrappers/RocketLaunch3D'), { loading: LoadingState }),
  'InteractiveDoll': dynamic(() => import('./model-viewer/wrappers/InteractiveDoll'), { loading: LoadingState }),
};

// ==================================================================
// DOMAIN 3: Heavy Spatial Engine (R3F)
// For fully interactive physics and chemistry labs.
// ==================================================================
const spatialEngineRegistry: Record<string, React.ComponentType<any>> = {
  'GravityLabR3F': dynamic(() => import('./spatial-engine/labs/GravityLabR3F'), { ssr: false, loading: LoadingState }),
  'ChemistryTestLab': dynamic(() => import('./spatial-engine/labs/ChemistryTestLab'), { ssr: false, loading: LoadingState }),
  'WindTunnelLab': dynamic(() => import('./spatial-engine/labs/WindTunnelLab'), { ssr: false, loading: LoadingState }),
  'CollisionLab': dynamic(() => import('./spatial-engine/labs/CollisionLab'), { ssr: false, loading: LoadingState }),
};

// ==================================================================
// THE ORCHESTRATOR
// ==================================================================
interface SimulationRouterProps {
  activeSim: {
    title: string;
    modelUrl?: string;
    componentRef?: string;
  };
  isFullscreen: boolean;
}

export default function SimulationRouter({ activeSim, isFullscreen }: SimulationRouterProps) {
  const ref = activeSim?.componentRef;

  // If the admin assigned a specific code file in the database:
  if (ref) {
    
    // NEW ROUTE: Check Master Curriculum Registry First
    if (masterCurriculumRegistry[ref]) {
      const CurriculumSim = masterCurriculumRegistry[ref];
      return <CurriculumSim modelUrl={activeSim.modelUrl} isFullscreen={isFullscreen} title={activeSim.title} />;
    }

    // Route 1: DOMAIN 1
    if (pure2DRegistry[ref]) {
      const Lab2D = pure2DRegistry[ref];
      return <Lab2D />;
    }

    // Route 2: DOMAIN 3 (The Spatial Engine)
    if (spatialEngineRegistry[ref]) {
      const SpatialLab = spatialEngineRegistry[ref];
      return <SpatialLab modelUrl={activeSim.modelUrl} isFullscreen={isFullscreen} title={activeSim.title} />;
    }

    // Route 3: DOMAIN 2
    if (modelViewerRegistry[ref]) {
      const ModelViewerWrapper = modelViewerRegistry[ref];
      return <ModelViewerWrapper modelUrl={activeSim.modelUrl} isFullscreen={isFullscreen} title={activeSim.title} />;
    }
  }

  // Route 4: Fallback
  // The admin uploaded a 3D model but didn't assign any code to it.
  if (activeSim?.modelUrl) {
    return <XRViewer src={activeSim.modelUrl} alt={activeSim.title} isFullscreen={isFullscreen} />;
  }

  // Error Catching
  return (
    <div className="p-6 bg-red-950/30 border border-red-900 rounded-xl text-red-400 text-sm flex flex-col items-center justify-center h-full min-h-[400px]">
      <strong>Configuration Error</strong>
      <p>Simulation "{ref || 'Unknown'}" is missing from the Router.</p>
    </div>
  );
}