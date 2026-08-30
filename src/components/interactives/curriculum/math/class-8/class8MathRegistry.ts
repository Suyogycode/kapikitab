import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/interactives/LoadingState';

export const class8MathRegistry: Record<string, React.ComponentType<any>> = {
  'LockerEnigma': dynamic(() => import('./ch-01-squares-and-cubes/LockerEnigma'), { ssr: false, loading: LoadingState }),
  'OddStaircase': dynamic(() => import('./ch-01-squares-and-cubes/OddStaircase'), { ssr: false, loading: LoadingState }),
  'TaxicabMachine': dynamic(() => import('./ch-01-squares-and-cubes/TaxicabMachine'), { ssr: false, loading: LoadingState }),

  // Chapter 2
  'LunarFold': dynamic(() => import('./ch-02-power-play/LunarFold'), { ssr: false, loading: LoadingState }),
  'CryptexVault': dynamic(() => import('./ch-02-power-play/CryptexVault'), { ssr: false, loading: LoadingState }),
  'CosmicScaleEngine': dynamic(() => import('./ch-02-power-play/CosmicScaleEngine'), { ssr: false, loading: LoadingState }),

  // Chapter 3
  'ChronoDial': dynamic(() => import('./ch-03-number-systems/ChronoDial'), { ssr: false, loading: LoadingState }),
  'EgyptianTokenForge': dynamic(() => import('./ch-03-number-systems/EgyptianTokenForge'), { ssr: false, loading: LoadingState }),
  'MayanAltar': dynamic(() => import('./ch-03-number-systems/MayanAltar'), { ssr: false, loading: LoadingState }),

  // Chapter 4: Exploring Geometric Themes
  'CarpentersWorkbench': dynamic(() => import('./ch-04-exploring-geometry/CarpentersWorkbench'), { ssr: false, loading: LoadingState }),
  'FluidVennMorpher': dynamic(() => import('./ch-04-exploring-geometry/FluidVennMorpher'), { ssr: false, loading: LoadingState }),
  'ARSpatialGeoboard': dynamic(() => import('./ch-04-exploring-geometry/ARSpatialGeoboard'), { ssr: false, loading: LoadingState }),

  // Chapter 5: Playing with Numbers
  'ParitySwitchboard': dynamic(() => import('./ch-05-playing-with-numbers/ParitySwitchboard'), { ssr: false, loading: LoadingState }),
  'DigitalRootCascader': dynamic(() => import('./ch-05-playing-with-numbers/DigitalRootCascader'), { ssr: false, loading: LoadingState }),
  'AlternatingBalanceScale': dynamic(() => import('./ch-05-playing-with-numbers/AlternatingBalanceScale'), { ssr: false, loading: LoadingState }),

  // Chapter 6: Algebraic Expressions and Identities
  'DynamicAreaMap': dynamic(() => import('./ch-06-algebraic-expressions/DynamicAreaMap'), { ssr: false, loading: LoadingState }),
  'SridharacharyaTransformer': dynamic(() => import('./ch-06-algebraic-expressions/SridharacharyaTransformer'), { ssr: false, loading: LoadingState }),
  'VedicCascader': dynamic(() => import('./ch-06-algebraic-expressions/VedicCascader'), { ssr: false, loading: LoadingState }),

  // Chapter 7: Comparing Quantities (Proportional Reasoning)
  'AspectCanvas': dynamic(() => import('./ch-07-proportional-reasoning/AspectCanvas'), { ssr: false, loading: LoadingState }),
  'BaristasBlend': dynamic(() => import('./ch-07-proportional-reasoning/BaristasBlend'), { ssr: false, loading: LoadingState }),
  'TrairasikaDistributor': dynamic(() => import('./ch-07-proportional-reasoning/TrairasikaDistributor'), { ssr: false, loading: LoadingState }),

  // Chapter 8: Comparing Quantities (Part 2)
  'FDPFluidCylinder': dynamic(() => import('./ch-08-comparing-quantities/FDPFluidCylinder'), { ssr: false, loading: LoadingState }),
  'TheSlicer': dynamic(() => import('./ch-08-comparing-quantities/TheSlicer'), { ssr: false, loading: LoadingState }),
  'WealthVaults': dynamic(() => import('./ch-08-comparing-quantities/WealthVaults'), { ssr: false, loading: LoadingState }),

  // Chapter 9: Advanced Geometry & Proofs
  'SulbaSutraOrigami': dynamic(() => import('./ch-09-advanced-geometry/SulbaSutraOrigami'), { ssr: false, loading: LoadingState }),
  'LiquidHypotenuse': dynamic(() => import('./ch-09-advanced-geometry/LiquidHypotenuse'), { ssr: false, loading: LoadingState }),
  'BhaskaracharyasLotus': dynamic(() => import('./ch-09-advanced-geometry/BhaskaracharyasLotus'), { ssr: false, loading: LoadingState }),

  // Chapter 10: Direct and Inverse Proportions
  'CartographersDesk': dynamic(() => import('./ch-10-proportions/CartographersDesk'), { ssr: false, loading: LoadingState }),
  'AlchemistsPalette': dynamic(() => import('./ch-10-proportions/AlchemistsPalette'), { ssr: false, loading: LoadingState }),
  'InverseEngine': dynamic(() => import('./ch-10-proportions/InverseEngine'), { ssr: false, loading: LoadingState }),

  // Chapter 11: Visualizing Solid Shapes
  'InfiniteLoom': dynamic(() => import('./ch-11-visualizing-shapes/InfiniteLoom'), { ssr: false, loading: LoadingState }),
  'AntsJourney': dynamic(() => import('./ch-11-visualizing-shapes/AntsJourney'), { ssr: false, loading: LoadingState }),
  'IsometricArchitect': dynamic(() => import('./ch-11-visualizing-shapes/IsometricArchitect'), { ssr: false, loading: LoadingState }),

  // Chapter 12: Data Handling
  'TheBalancingAct': dynamic(() => import('./ch-12-data-handling/TheBalancingAct'), { ssr: false, loading: LoadingState }),
  'DataStoryteller': dynamic(() => import('./ch-12-data-handling/DataStoryteller'), { ssr: false, loading: LoadingState }),
  'HexStrategist': dynamic(() => import('./ch-12-data-handling/HexStrategist'), { ssr: false, loading: LoadingState }),

  // Chapter 13: Introduction to Algebra
  'AlchemistsEquation': dynamic(() => import('./ch-13-algebraic-expressions-ii/AlchemistsEquation'), { ssr: false, loading: LoadingState }),
  'VirahankaPyramid': dynamic(() => import('./ch-13-algebraic-expressions-ii/VirahankaPyramid'), { ssr: false, loading: LoadingState }),
  'KarimAndGenie': dynamic(() => import('./ch-13-algebraic-expressions-ii/KarimAndGenie'), { ssr: false, loading: LoadingState }),

  // Chapter 14: Mensuration
  'DissectionTable': dynamic(() => import('./ch-14-mensuration/DissectionTable'), { ssr: false, loading: LoadingState }),
  'RhombusExpander': dynamic(() => import('./ch-14-mensuration/RhombusExpander'), { ssr: false, loading: LoadingState }),
  'TrapeziumCloner': dynamic(() => import('./ch-14-mensuration/TrapeziumCloner'), { ssr: false, loading: LoadingState }),
};