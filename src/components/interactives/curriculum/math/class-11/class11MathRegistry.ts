import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/interactives/LoadingState';

export const class11MathRegistry: Record<string, React.ComponentType<any>> = {
  // Chapter 1: Sets
  'SetBuilderSieve': dynamic(() => import('./ch-01-sets/SetBuilderSieve'), { ssr: false, loading: LoadingState }),
  'HolographicVennForge': dynamic(() => import('./ch-01-sets/HolographicVennForge'), { ssr: false, loading: LoadingState }),
  'InfiniteIntervalZoom': dynamic(() => import('./ch-01-sets/InfiniteIntervalZoom'), { ssr: false, loading: LoadingState }),
  
  // Chapter 2: Relations and Functions
  'CartesianMatrix': dynamic(() => import('./ch-02-relations-functions/CartesianMatrix'), { ssr: false, loading: LoadingState }),
  'HolographicMappingRouter': dynamic(() => import('./ch-02-relations-functions/HolographicMappingRouter'), { ssr: false, loading: LoadingState }),
  'FunctionTransformer': dynamic(() => import('./ch-02-relations-functions/FunctionTransformer'), { ssr: false, loading: LoadingState }),

  // Chapter 3: Trigonometric Functions
  'RadianUnroller': dynamic(() => import('./ch-03-trigonometric-functions/RadianUnroller'), { ssr: false, loading: LoadingState }),
  'UnitCircleSynthesizer': dynamic(() => import('./ch-03-trigonometric-functions/UnitCircleSynthesizer'), { ssr: false, loading: LoadingState }),
  'ContinuousWaveGenerator': dynamic(() => import('./ch-03-trigonometric-functions/ContinuousWaveGenerator'), { ssr: false, loading: LoadingState }),

  // Chapter 4: Complex Numbers and Quadratic Equations
  'OrthogonalRotor': dynamic(() => import('./ch-04-complex-numbers/OrthogonalRotor'), { ssr: false, loading: LoadingState }),
  'ArgandMirror': dynamic(() => import('./ch-04-complex-numbers/ArgandMirror'), { ssr: false, loading: LoadingState }),
  'DimensionCollapser': dynamic(() => import('./ch-04-complex-numbers/DimensionCollapser'), { ssr: false, loading: LoadingState }),

// Chapter 5: Linear Inequalities
  'NegativeInversionAxis': dynamic(() => import('./ch-05-linear-inequalities/NegativeInversionAxis'), { ssr: false, loading: LoadingState }),
  'AcidVatTolerance': dynamic(() => import('./ch-05-linear-inequalities/AcidVatTolerance'), { ssr: false, loading: LoadingState }),
  'InfiniteClamp': dynamic(() => import('./ch-05-linear-inequalities/InfiniteClamp'), { ssr: false, loading: LoadingState }),

// Chapter 6: Permutations and Combinations
  'PossibilityTree': dynamic(() => import('./ch-06-permutations-combinations/PossibilityTree'), { ssr: false, loading: LoadingState }),
  'AnagramSmasher': dynamic(() => import('./ch-06-permutations-combinations/AnagramSmasher'), { ssr: false, loading: LoadingState }),
  'ChordWeaver': dynamic(() => import('./ch-06-permutations-combinations/ChordWeaver'), { ssr: false, loading: LoadingState }),
};