'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px] bg-stone-900/50 rounded-2xl border border-stone-800">
    <Loader2 className="animate-spin text-emerald-500 mb-3" size={32} />
    <span className="text-stone-400 text-xs font-mono uppercase tracking-widest">Loading Simulation...</span>
  </div>
);