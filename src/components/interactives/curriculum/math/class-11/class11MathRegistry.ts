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

  // Chapter 7: Binomial Theorem
  'MeruPrastaraBuilder': dynamic(() => import('./ch-07-binomial-theorem/MeruPrastaraBuilder'), { ssr: false, loading: LoadingState }),
  'IndexBalancer': dynamic(() => import('./ch-07-binomial-theorem/IndexBalancer'), { ssr: false, loading: LoadingState }),
  'RemainderEngine': dynamic(() => import('./ch-07-binomial-theorem/RemainderEngine'), { ssr: false, loading: LoadingState }),

  // Chapter 8: Sequences and Series
  'AncestralBranchingEngine': dynamic(() => import('./ch-08-sequences-series/AncestralBranchingEngine'), { ssr: false, loading: LoadingState }),
  'AlgebraicSculptor': dynamic(() => import('./ch-08-sequences-series/AlgebraicSculptor'), { ssr: false, loading: LoadingState }),
  'GeometryForge': dynamic(() => import('./ch-08-sequences-series/GeometryForge'), { ssr: false, loading: LoadingState }),

  // Chapter 9: Straight Lines
  'OrthogonalSnapper': dynamic(() => import('./ch-09-straight-lines/OrthogonalSnapper'), { ssr: false, loading: LoadingState }),
  'EquationMorphGrid': dynamic(() => import('./ch-09-straight-lines/EquationMorphGrid'), { ssr: false, loading: LoadingState }),
  'PerpendicularRaycaster': dynamic(() => import('./ch-09-straight-lines/PerpendicularRaycaster'), { ssr: false, loading: LoadingState }),

// Chapter 10: Conic Sections
  'DoubleNappedSlicer': dynamic(() => import('./ch-10-conic-sections/DoubleNappedSlicer'), { ssr: false, loading: LoadingState }),
  'DirectrixTether': dynamic(() => import('./ch-10-conic-sections/DirectrixTether'), { ssr: false, loading: LoadingState }),
  'ConstantLoop': dynamic(() => import('./ch-10-conic-sections/ConstantLoop'), { ssr: false, loading: LoadingState }),

// Chapter 11: Introduction to Three Dimensional Geometry
  'OctantNavigator': dynamic(() => import('./ch-11-three-dimensional-geometry/OctantNavigator'), { ssr: false, loading: LoadingState }),
  'ParallelepipedArchitect': dynamic(() => import('./ch-11-three-dimensional-geometry/ParallelepipedArchitect'), { ssr: false, loading: LoadingState }),
  'DoublePythagoras': dynamic(() => import('./ch-11-three-dimensional-geometry/DoublePythagoras'), { ssr: false, loading: LoadingState }),

// Chapter 12: Limits and Derivatives
  'SecantSlider': dynamic(() => import('./ch-12-limits-and-derivatives/SecantSlider'), { ssr: false, loading: LoadingState }),
  'SandwichSqueezer': dynamic(() => import('./ch-12-limits-and-derivatives/SandwichSqueezer'), { ssr: false, loading: LoadingState }),
  'FirstPrincipleForge': dynamic(() => import('./ch-12-limits-and-derivatives/FirstPrincipleForge'), { ssr: false, loading: LoadingState }),

// Chapter 13: Statistics
  'BatsmanBalance': dynamic(() => import('./ch-13-statistics/BatsmanBalance'), { ssr: false, loading: LoadingState }),
  'AbsoluteHinge': dynamic(() => import('./ch-13-statistics/AbsoluteHinge'), { ssr: false, loading: LoadingState }),
  'LeastSquaresForge': dynamic(() => import('./ch-13-statistics/LeastSquaresForge'), { ssr: false, loading: LoadingState }),

// Chapter 14: Probability
  'OutcomeSieve': dynamic(() => import('./ch-14-probability/OutcomeSieve'), { ssr: false, loading: LoadingState }),
  'CollisionGrid': dynamic(() => import('./ch-14-probability/CollisionGrid'), { ssr: false, loading: LoadingState }),
  'FluidVennForge': dynamic(() => import('./ch-14-probability/FluidVennForge'), { ssr: false, loading: LoadingState }),
};
