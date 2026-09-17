import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/interactives/LoadingState';

export const class10MathRegistry: Record<string, React.ComponentType<any>> = {
  // Chapter 1: Real Numbers
  'PrimeFactorizationForge': dynamic(() => import('./ch-01-real-numbers/PrimeFactorizationForge'), { ssr: false, loading: LoadingState }),
  'HCFLCMVennMachine': dynamic(() => import('./ch-01-real-numbers/HCFLCMVennMachine'), { ssr: false, loading: LoadingState }),
  'ContradictionTrap': dynamic(() => import('./ch-01-real-numbers/ContradictionTrap'), { ssr: false, loading: LoadingState }),

    // Chapter 2: Polynomials
  'ParabolaSculptor': dynamic(() => import('./ch-02-polynomials/ParabolaSculptor'), { ssr: false, loading: LoadingState }),
  'RootsBalancer': dynamic(() => import('./ch-02-polynomials/RootsBalancer'), { ssr: false, loading: LoadingState }),
  'CubicRollercoaster': dynamic(() => import('./ch-02-polynomials/CubicRollercoaster'), { ssr: false, loading: LoadingState }),

    // Chapter 3: Linear Equations
  'RatioRadar': dynamic(() => import('./ch-03-linear-equations/RatioRadar'), { ssr: false, loading: LoadingState }),
  'SubstitutionScale': dynamic(() => import('./ch-03-linear-equations/SubstitutionScale'), { ssr: false, loading: LoadingState }),
  'EliminationForge': dynamic(() => import('./ch-03-linear-equations/EliminationForge'), { ssr: false, loading: LoadingState }),

      // Chapter 4: Quadratic Equations
  'BlueprintExpander': dynamic(() => import('./ch-04-quadratic-equations/BlueprintExpander'), { ssr: false, loading: LoadingState }),
  'MiddleTermSlicer': dynamic(() => import('./ch-04-quadratic-equations/MiddleTermSlicer'), { ssr: false, loading: LoadingState }),
  'BoundaryPoleParadox': dynamic(() => import('./ch-04-quadratic-equations/BoundaryPoleParadox'), { ssr: false, loading: LoadingState }),

      // Chapter 5: Arithmatic Progression
  'AnatomyOfTerm': dynamic(() => import('./ch-05-arithmetic-progressions/AnatomyOfTerm'), { ssr: false, loading: LoadingState }),
  'GaussGeometry': dynamic(() => import('./ch-05-arithmetic-progressions/GaussGeometry'), { ssr: false, loading: LoadingState }),
  'PotatoRaceTracker': dynamic(() => import('./ch-05-arithmetic-progressions/PotatoRaceTracker'), { ssr: false, loading: LoadingState }),

      // Chapter 6: Triangles
  'ProjectionDesk': dynamic(() => import('./ch-06-triangles/ProjectionDesk'), { ssr: false, loading: LoadingState }),
  'ThalesSlicer': dynamic(() => import('./ch-06-triangles/ThalesSlicer'), { ssr: false, loading: LoadingState }),
  'ShadowTracker': dynamic(() => import('./ch-06-triangles/ShadowTracker'), { ssr: false, loading: LoadingState }),

      // Chapter 7: Co-ordinate Geometry
  'PythagoreanTether': dynamic(() => import('./ch-07-coordinate-geometry/PythagoreanTether'), { ssr: false, loading: LoadingState }),
  'GeometryDetective': dynamic(() => import('./ch-07-coordinate-geometry/GeometryDetective'), { ssr: false, loading: LoadingState }),
  'SectionSlicer': dynamic(() => import('./ch-07-coordinate-geometry/SectionSlicer'), { ssr: false, loading: LoadingState }),

      // Chapter 8: Trignometry
  'PerspectiveOrbiter': dynamic(() => import('./ch-08-trigonometry/PerspectiveOrbiter'), { ssr: false, loading: LoadingState }),
  'EquilateralSlicer': dynamic(() => import('./ch-08-trigonometry/EquilateralSlicer'), { ssr: false, loading: LoadingState }),
  'PythagoreanConverter': dynamic(() => import('./ch-08-trigonometry/PythagoreanConverter'), { ssr: false, loading: LoadingState }),

        // Chapter 9: Application of Trignometry
  'ObserversEye': dynamic(() => import('./ch-09-applications-of-trigonometry/ObserversEye'), { ssr: false, loading: LoadingState }),
  'SolarShadowCaster': dynamic(() => import('./ch-09-applications-of-trigonometry/SolarShadowCaster'), { ssr: false, loading: LoadingState }),
  'HighwayInterceptor': dynamic(() => import('./ch-09-applications-of-trigonometry/HighwayInterceptor'), { ssr: false, loading: LoadingState }),

        // Chapter 10: Circles
  'SecantTangentEvolver': dynamic(() => import('./ch-10-circles/SecantTangentEvolver'), { ssr: false, loading: LoadingState }),
  'ExternalTether': dynamic(() => import('./ch-10-circles/ExternalTether'), { ssr: false, loading: LoadingState }),
  'QuadrilateralWrapper': dynamic(() => import('./ch-10-circles/QuadrilateralWrapper'), { ssr: false, loading: LoadingState }),

        // Chapter 11: Areas related to Circles
  'UnitarySlicer': dynamic(() => import('./ch-11-areas-related-to-circles/UnitarySlicer'), { ssr: false, loading: LoadingState }),
  'SegmentExtractor': dynamic(() => import('./ch-11-areas-related-to-circles/SegmentExtractor'), { ssr: false, loading: LoadingState }),
  'VolumetricLighthouse': dynamic(() => import('./ch-11-areas-related-to-circles/VolumetricLighthouse'), { ssr: false, loading: LoadingState }),
  
        // Chapter 12: Surface areas and volumes
  'PaintVat': dynamic(() => import('./ch-12-surface-areas-and-volumes/PaintVat'), { ssr: false, loading: LoadingState }),
  'SubtractiveDrill': dynamic(() => import('./ch-12-surface-areas-and-volumes/SubtractiveDrill'), { ssr: false, loading: LoadingState }),
  'SyrupSynthesizer': dynamic(() => import('./ch-12-surface-areas-and-volumes/SyrupSynthesizer'), { ssr: false, loading: LoadingState }),
   
        // Chapter 13: Statistics
  'AssumedMeanSeeSaw': dynamic(() => import('./ch-13-statistics/AssumedMeanSeeSaw'), { ssr: false, loading: LoadingState }),
  'SkylineTensioner': dynamic(() => import('./ch-13-statistics/SkylineTensioner'), { ssr: false, loading: LoadingState }),
  'CumulativeWaterTank': dynamic(() => import('./ch-13-statistics/CumulativeWaterTank'), { ssr: false, loading: LoadingState }),
   
        // Chapter 14: Probability
  'UniverseMatrix': dynamic(() => import('./ch-14-probability/UniverseMatrix'), { ssr: false, loading: LoadingState }),
  'DeckCascader': dynamic(() => import('./ch-14-probability/DeckCascader'), { ssr: false, loading: LoadingState }),
  'CertaintySlider': dynamic(() => import('./ch-14-probability/CertaintySlider'), { ssr: false, loading: LoadingState }),

};