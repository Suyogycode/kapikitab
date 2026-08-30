import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/interactives/LoadingState'; // <-- THE FIX

export const class8MathRegistry: Record<string, React.ComponentType<any>> = {
  'LockerEnigma': dynamic(() => import('./ch-01-squares-and-cubes/LockerEnigma'), { 
    ssr: false, 
    loading: LoadingState 
  }),
};