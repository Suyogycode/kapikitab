import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/interactives/LoadingState';

export const class12MathRegistry: Record<string, React.ComponentType<any>> = {
  // Chapter 1: Relations and Functions
  'EquivalenceNetwork': dynamic(() => import('./ch-01-relations-and-functions/EquivalenceNetwork'), { ssr: false, loading: LoadingState }),
  'InfiniteLoom': dynamic(() => import('./ch-01-relations-and-functions/InfiniteLoom'), { ssr: false, loading: LoadingState }),
  'CompositionChamber': dynamic(() => import('./ch-01-relations-and-functions/CompositionChamber'), { ssr: false, loading: LoadingState }),
  
  // Chapter 2: Inverse Trigonometric Functions
  'DomainPruner': dynamic(() => import('./ch-02-inverse-trigonometric-functions/DomainPruner'), { ssr: false, loading: LoadingState }),
  'RotationalMirror': dynamic(() => import('./ch-02-inverse-trigonometric-functions/RotationalMirror'), { ssr: false, loading: LoadingState }),
  'CompositionJammer': dynamic(() => import('./ch-02-inverse-trigonometric-functions/CompositionJammer'), { ssr: false, loading: LoadingState }),

  // Chapter 3: Matrices
  'VectorSweeper': dynamic(() => import('./ch-03-matrices/VectorSweeper'), { ssr: false, loading: LoadingState }),
  'TransposeHinge': dynamic(() => import('./ch-03-matrices/TransposeHinge'), { ssr: false, loading: LoadingState }),
  'CompositionTransformer': dynamic(() => import('./ch-03-matrices/CompositionTransformer'), { ssr: false, loading: LoadingState }),

  // Chapter 4: Determinants
  'CofactorFractal': dynamic(() => import('./ch-04-determinants/CofactorFractal'), { ssr: false, loading: LoadingState }),
  'CollinearMembrane': dynamic(() => import('./ch-04-determinants/CollinearMembrane'), { ssr: false, loading: LoadingState }),
  'SingularityCollapse': dynamic(() => import('./ch-04-determinants/SingularityCollapse'), { ssr: false, loading: LoadingState }),

  // Chapter 5: Continuity and Differentiability
  'PenLiftSimulator': dynamic(() => import('./ch-05-continuity-and-differentiability/PenLiftSimulator'), { ssr: false, loading: LoadingState }),
  'TangentShear': dynamic(() => import('./ch-05-continuity-and-differentiability/TangentShear'), { ssr: false, loading: LoadingState }),
  'GearBoxChainRule': dynamic(() => import('./ch-05-continuity-and-differentiability/GearBoxChainRule'), { ssr: false, loading: LoadingState }),

  // Chapter 6: Application of Derivatives
  'ScalingRipple': dynamic(() => import('./ch-06-application-of-derivatives/ScalingRipple'), { ssr: false, loading: LoadingState }),
};