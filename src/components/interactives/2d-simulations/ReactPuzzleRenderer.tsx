'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingState } from '../LoadingState';

// Import our new federated registry
import { class8MathRegistry } from '../curriculum/math/class-8/class8MathRegistry';

// Legacy 2D Registry
const pure2DRegistry: Record<string, React.ComponentType<any>> = {
  'FunctionMachineLab': dynamic(() => import('./FunctionMachineLab'), { loading: LoadingState }),
};

// Merge legacy files with the new curriculum architecture
const masterRegistry: Record<string, React.ComponentType<any>> = {
  ...pure2DRegistry,
  ...class8MathRegistry,
};

export default function ReactPuzzleRenderer({ componentRef }: { componentRef?: string }) {
  if (!componentRef) return null;

  const PuzzleComponent = masterRegistry[componentRef];

  if (!PuzzleComponent) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
        Interactive puzzle <strong>"{componentRef}"</strong> is not registered in the new curriculum domain.
      </div>
    );
  }

  return <PuzzleComponent />;
}