import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/interactives/LoadingState';

export const class9MathRegistry: Record<string, React.ComponentType<any>> = {
  // Chapter 1: Orienting Yourself: The Use of Coordinates
  'ReiaansTactileBlueprint': dynamic(() => import('./ch-01-coordinates/ReiaansTactileBlueprint'), { ssr: false, loading: LoadingState }),
  'PythagorasDistanceEngine': dynamic(() => import('./ch-01-coordinates/PythagorasDistanceEngine'), { ssr: false, loading: LoadingState }),
  'QuadrantMirror': dynamic(() => import('./ch-01-coordinates/QuadrantMirror'), { ssr: false, loading: LoadingState }),
};