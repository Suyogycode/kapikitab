import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/interactives/LoadingState';

export const class9MathRegistry: Record<string, React.ComponentType<any>> = {
  // Chapter 1: Orienting Yourself: The Use of Coordinates
  'ReiaansTactileBlueprint': dynamic(() => import('./ch-01-coordinates/ReiaansTactileBlueprint'), { ssr: false, loading: LoadingState }),
  'PythagorasDistanceEngine': dynamic(() => import('./ch-01-coordinates/PythagorasDistanceEngine'), { ssr: false, loading: LoadingState }),
  'QuadrantMirror': dynamic(() => import('./ch-01-coordinates/QuadrantMirror'), { ssr: false, loading: LoadingState }),

 // Chapter 2: Introduction to Linear Polynomials
  'InputOutputFactory': dynamic(() => import('./ch-02-linear-polynomials/InputOutputFactory'), { ssr: false, loading: LoadingState }),
  'GeometricGrower': dynamic(() => import('./ch-02-linear-polynomials/GeometricGrower'), { ssr: false, loading: LoadingState }),
  'SlopeSimulator': dynamic(() => import('./ch-02-linear-polynomials/SlopeSimulator'), { ssr: false, loading: LoadingState }),

  // Chapter 3: The World of Numbers
  'BrahmaguptasLedger': dynamic(() => import('./ch-03-world-of-numbers/BrahmaguptasLedger'), { ssr: false, loading: LoadingState }),
  'IrrationalCompass': dynamic(() => import('./ch-03-world-of-numbers/IrrationalCompass'), { ssr: false, loading: LoadingState }),
  'CyclicDecimalWheel': dynamic(() => import('./ch-03-world-of-numbers/CyclicDecimalWheel'), { ssr: false, loading: LoadingState }),

  // Chapter 4: Exploring Algebraic Identities
  'GeometryOfSubtraction': dynamic(() => import('./ch-04-algebraic-identities/GeometryOfSubtraction'), { ssr: false, loading: LoadingState }),
  'AlgebraTileArchitect': dynamic(() => import('./ch-04-algebraic-identities/AlgebraTileArchitect'), { ssr: false, loading: LoadingState }),
  'CubicExploder3D': dynamic(() => import('./ch-04-algebraic-identities/CubicExploder3D'), { ssr: false, loading: LoadingState }),

  // Chapter 5: I'm Up and Down, and Round and Round
  'CircumcentreTriangulator': dynamic(() => import('./ch-05-circles/CircumcentreTriangulator'), { ssr: false, loading: LoadingState }),
};