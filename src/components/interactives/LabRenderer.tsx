'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const labRegistry: Record<string, React.ComponentType<any>> = {
  'FunctionMachineLab': dynamic(() => import('./labs/FunctionMachineLab'), {
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
        <Loader2 className="animate-spin text-emerald-600" size={24} />
      </div>
    ),
  }),
  
  'GravityLabR3F': dynamic(() => import('./labs/GravityLabR3F'), {
    ssr: false, /* <--- THE FIX: Disables Server-Side Rendering for the GPU */
    loading: () => (
      <div className="flex h-[600px] w-full items-center justify-center bg-stone-900 rounded-2xl border border-stone-800">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    ),
  }),
};

interface LabRendererProps {
  componentRef: string;
}

export default function LabRenderer({ componentRef }: LabRendererProps) {
  const SelectedLab = labRegistry[componentRef];

  if (!SelectedLab) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
        Simulation component <strong>"{componentRef}"</strong> is not registered in <code>labRegistry</code>.
      </div>
    );
  }

  return <SelectedLab />;
}