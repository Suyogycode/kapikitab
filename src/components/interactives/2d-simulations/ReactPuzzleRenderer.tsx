'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// ==================================================================
// DOMAIN 1 ONLY: 2D React Simulations
// ==================================================================
const pure2DRegistry: Record<string, React.ComponentType<any>> = {
  'FunctionMachineLab': dynamic(() => import('./FunctionMachineLab'), { 
    ssr: false, /* <--- THE FIX: This stops the Turbopack negative timestamp crash! */
    loading: () => (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-slate-50 rounded-2xl border border-slate-200">
        <Loader2 className="animate-spin text-indigo-500 mb-3" size={24} />
        <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Loading Puzzle...</span>
      </div>
    )
  }),
};

interface ReactPuzzleRendererProps {
  componentRef: string;
}

export default function ReactPuzzleRenderer({ componentRef }: ReactPuzzleRendererProps) {
  const PuzzleComponent = pure2DRegistry[componentRef];

  if (!PuzzleComponent) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
        Interactive puzzle <strong>"{componentRef}"</strong> is not registered in the 2D domain.
      </div>
    );
  }

  return <PuzzleComponent />;
}